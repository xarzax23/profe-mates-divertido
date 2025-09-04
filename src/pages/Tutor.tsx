
import { useEffect, useRef, useState } from "react";

// Helper to generate unique IDs for messages
function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

// Debug state for diagnostics panel
let setDbgState: ((d: { status?: number; preview?: string; endpoint?: string; cors?: boolean }) => void) | null = null;

// API call helper
async function callChatAPI(prompt: string): Promise<{ pistas?: string[]; pasos?: string[]; repregunta?: string; reply?: string }> {
  const ep = import.meta.env.VITE_CHAT_ENDPOINT;
  const auth = import.meta.env.VITE_CHAT_AUTH || "";
  let lastStatus = 0, cors = false;
  if (!ep) throw new Error("Falta VITE_CHAT_ENDPOINT en .env. El tutor está en modo eco por ahora.");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) headers.Authorization = auth.startsWith("Bearer ") ? auth : `Bearer ${auth}`;
  let r: Response;
  try {
    r = await fetch(ep, {
      method: "POST",
      headers,
      body: JSON.stringify({ message: prompt }),
    });
  } catch (e: any) {
    if (setDbgState) setDbgState({ status: 0, preview: String(e).slice(0, 120), endpoint: ep, cors: false });
    throw new Error("No se pudo conectar al backend: " + (e?.message || String(e)));
  }
  lastStatus = r.status;
  cors = r.type === "opaque" || !r.headers || typeof r.headers.get !== "function";
  let bodyText = "";
  if (!r.ok) {
    try {
      bodyText = await r.text();
    } catch {}
    if (setDbgState) setDbgState({ status: lastStatus, preview: (bodyText || "").slice(0, 120), endpoint: ep, cors });
    throw new Error("Chat API " + r.status + ": " + (bodyText || "").slice(0, 120));
  }
  try {
    const data = await r.json();
    if (setDbgState) setDbgState({ status: lastStatus, preview: JSON.stringify(data).slice(0, 120), endpoint: ep, cors });
    return data;
  } catch {
    try { bodyText = await r.text(); } catch {}
    if (setDbgState) setDbgState({ status: lastStatus, preview: (bodyText || "").slice(0, 120), endpoint: ep, cors });
    throw new Error("Invalid JSON: " + (bodyText || "").slice(0, 200));
  }
}

export default function Tutor() {
  const [dbg, setDbg] = useState<{ status?: number; preview?: string; endpoint?: string; cors?: boolean } | null>(null);
  useEffect(() => { setDbgState = setDbg; return () => { setDbgState = null; }; }, []);
  const [msgs, setMsgs] = useState<{ id: string; role: "user" | "assistant"; content: string }[]>([
    { id: uid(), role: "assistant", content: "Hola, soy tu tutor de mates. Estoy en modo profesor: no doy soluciones completas; te doy pistas y pasos." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) { if (e.key === "Enter") send(); }

  async function send(question?: string) {
    const text = (question ?? input).trim();
    if (!text || sending) return;
    if (!question) setInput("");
    setMsgs((m) => [...m, { id: uid(), role: "user", content: text }]);
    setSending(true);
    try {
      const res = await callChatAPI(text);
      let assistantMsg = "";
      if (Array.isArray(res.pistas) && res.pistas.length > 0) assistantMsg += "Pistas:\n" + res.pistas.map((p) => `• ${p}`).join("\n") + "\n";
      if (Array.isArray(res.pasos) && res.pasos.length > 0) assistantMsg += "Pasos:\n" + res.pasos.map((p) => `• ${p}`).join("\n") + "\n";
      if (res.repregunta) assistantMsg += `Repregunta: ${res.repregunta}`;
      if (!assistantMsg && res.reply) assistantMsg = res.reply;
      if (!assistantMsg) assistantMsg = "⚠️ No se pudo obtener una respuesta del tutor.";
      setMsgs((m) => [...m, { id: uid(), role: "assistant", content: assistantMsg.trim() }]);
    } catch (e: any) {
      setMsgs((m) => [...m, { id: uid(), role: "assistant", content: "\u26a0\ufe0f " + (e?.message || String(e)) }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Tutor</h1>
      <div className="border rounded-2xl bg-white p-4 h-[60vh] overflow-auto space-y-3">
        {msgs.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
            <div className={"inline-block px-3 py-2 rounded-2xl " + (m.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100")}>{m.content}</div>
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
        <button
          className="px-4 py-2 rounded-xl bg-green-600 text-white disabled:opacity-50"
          onClick={() => send()}
          disabled={sending}
        >
          {sending ? "Enviando..." : "Enviar"}
        </button>
      </div>
      {!import.meta.env.VITE_CHAT_ENDPOINT && (
        <p className="text-xs text-muted-foreground">
          Define VITE_CHAT_ENDPOINT (y opcional VITE_CHAT_AUTH) en tu .env para usar tu backend con modo profesor.
        </p>
      )}

      {import.meta.env.VITE_DEBUG_TUTOR === "1" && dbg && (
        <div style={{ fontSize: 12, marginTop: 16, color: '#444', background: '#f8f8f8', border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
          <div><b>Debug Tutor</b></div>
          <div><b>endpoint:</b> <span style={{ wordBreak: 'break-all' }}>{dbg.endpoint}</span></div>
          <div><b>lastStatus:</b> {dbg.status ?? "-"}</div>
          <div><b>lastBodyPreview:</b> <span style={{ wordBreak: 'break-all' }}>{dbg.preview ?? ""}</span></div>
          <div><b>CORS/opaque:</b> {dbg.cors ? "yes" : "no"}</div>
        </div>
      )}
    </div>

  );
}
