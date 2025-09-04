# reactivate-tutor.ps1
# Restaura/actualiza el Tutor para usar TU endpoint backend (modo professor + PIN adulto)

$ErrorActionPreference = "Stop"

function Write-File($path, $content) {
  New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
  Set-Content -Path $path -Value $content -Encoding UTF8
  Write-Host "✔ Escrito: $path"
}

$tutor = @'
import { useEffect, useRef, useState } from "react";

type Msg = { id: string; role: "user" | "assistant"; content: string };
type ApiReply = { reply?: string; needs_pin?: boolean; revealed?: boolean; error?: string };

async function callChatAPI(prompt: string, pin?: string): Promise<ApiReply> {
  const ep = import.meta.env.VITE_CHAT_ENDPOINT;
  const auth = import.meta.env.VITE_CHAT_AUTH || "";

  if (!ep) {
    return { reply: "⚙️ Falta VITE_CHAT_ENDPOINT en .env. El tutor usa eco temporal.", revealed: false };
  }

  const r = await fetch(ep, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: auth.startsWith("Bearer ") ? auth : `Bearer ${auth}` } : {}),
    },
    body: JSON.stringify({ message: prompt, mode: "professor", ...(pin ? { pin } : {}) }),
  });

  if (!r.ok) {
    let reason = "";
    try { const j = await r.json(); reason = j?.error || j?.message || ""; } catch {}
    throw new Error(`Chat API ${r.status} ${reason}`);
  }

  const data = (await r.json()) as ApiReply;
  return {
    reply: data.reply ?? "",
    needs_pin: !!data.needs_pin,
    revealed: !!data.revealed,
    error: data.error,
  };
}

export default function Tutor() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: crypto.randomUUID(), role: "assistant", content: "¡Hola! Soy tu tutor. Pregúntame y te guío sin dar la solución completa." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, showPin]);

  async function send(question?: string) {
    const text = (question ?? input).trim();
    if (!text || sending) return;
    if (!question) setInput("");

    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: text };
    setMsgs((m) => [...m, userMsg]);
    setSending(true);
    try {
      const res = await callChatAPI(text);
      if (res.needs_pin) {
        setLastQuestion(text);
        setShowPin(true);
        setMsgs((m) => [
          ...m,
          { id: crypto.randomUUID(), role: "assistant", content: res.reply || "Para revelar la solución introduce el PIN adulto." },
        ]);
      } else {
        setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: res.reply || "" }]);
      }
    } catch (e: any) {
      setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: "⚠️ " + (e?.message || e) }]);
    } finally {
      setSending(false);
    }
  }

  async function submitPin() {
    if (!lastQuestion) return;
    const code = pin.trim();
    if (!code) return;
    setShowPin(false);
    setPin("");
    setSending(true);
    try {
      const res = await callChatAPI(lastQuestion, code);
      setMsgs((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", content: res.reply || (res.revealed ? "✅ Solución revelada." : "❌ PIN incorrecto.") },
      ]);
    } catch (e: any) {
      setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: "⚠️ " + (e?.message || e) }]);
    } finally {
      setSending(false);
      setLastQuestion(null);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) { if (e.key === "Enter") send(); }

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Tutor</h1>

      <div className="border rounded-2xl bg-white p-4 h-[60vh] overflow-auto space-y-3">
        {msgs.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
            <div className={"inline-block px-3 py-2 rounded-2xl " + (m.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100")}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-xl px-3 py-2"
          placeholder="Escribe tu duda (ej.: 41-26 con llevadas)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          disabled={sending}
        />
        <button className="px-4 py-2 rounded-xl bg-green-600 text-white disabled:opacity-50" onClick={()=>send()} disabled={sending}>
          {sending ? "Enviando…" : "Enviar"}
        </button>
      </div>

      {!import.meta.env.VITE_CHAT_ENDPOINT && (
        <p className="text-xs text-muted-foreground">
          ⚙️ Define <code>VITE_CHAT_ENDPOINT</code> (y opcional <code>VITE_CHAT_AUTH</code>) en tu <code>.env</code> para usar tu backend (OpenAI en modo profesor + PIN).
        </p>
      )}

      {showPin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-4 w-full max-w-sm space-y-3">
            <h2 className="text-lg font-semibold">Introducir PIN adulto</h2>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="PIN (4–6 dígitos)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button className="px-3 py-2 rounded border" onClick={()=>{ setShowPin(false); setPin(""); }}>Cancelar</button>
              <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={submitPin}>Revelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'@

Write-File "src/pages/Tutor.tsx" $tutor

Write-Host "`n✔ Tutor reconectado a tu backend (professor + PIN). Asegúrate de las variables .env y levanta el dev server." -ForegroundColor Green
