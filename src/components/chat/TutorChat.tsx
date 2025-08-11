import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { ChatMessage, Grade } from "@/types";
import { postChat } from "@/lib/api";
import { detectAndSanitizePII } from "@/lib/validators";
import { toast } from "sonner";

export function TutorChat() {
  const [grade, setGrade] = useState<Grade>(1);
  const messages = useAppStore(s => s.chatByGrade[grade]);
  const setChat = useAppStore(s => s.setChatForGrade);
  const [input, setInput] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const dropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = dropRef.current; if (!el) return;
    const prevent = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer?.files?.[0];
      if (f && /image\/(png|jpe?g)/.test(f.type)) {
        const url = URL.createObjectURL(f);
        setImageUrl(url);
      }
    };
    el.addEventListener('dragover', prevent);
    el.addEventListener('drop', handleDrop);
    return () => {
      el.removeEventListener('dragover', prevent);
      el.removeEventListener('drop', handleDrop);
    };
  }, []);

  const send = async () => {
    if (!input.trim() && !imageUrl) return;
    const { hasPII, sanitized } = detectAndSanitizePII(input);
    if (hasPII) toast.warning("Hemos ocultado posibles datos personales.");
    const updated = await postChat({ grade, message: sanitized, imageUrl, existing: messages });
    setChat(grade, updated);
    setInput("");
  };

  return (
    <div className="grid gap-4">
      <div className="flex gap-2 items-center">
        <label htmlFor="grade" className="text-sm">Curso</label>
        <Input id="grade" aria-label="Selecciona curso" type="number" min={1} max={6} value={grade}
               onChange={(e) => setGrade(Math.min(6, Math.max(1, Number(e.target.value))) as Grade)}
               className="w-24" />
        <div className="text-xs text-muted-foreground ml-auto" aria-live="polite">El profe es una IA; pide ayuda a un adulto si algo no te queda claro.</div>
      </div>

      <Card className="h-[50vh] overflow-auto" aria-label="Área de mensajes">
        <CardContent className="space-y-3 py-4">
          {(messages ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">Empieza escribiendo tu duda o sube una foto del ejercicio.</p>
          )}
          {(messages ?? []).map((m: ChatMessage) => (
            <div key={m.id} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
              <div className={`rounded-lg px-3 py-2 max-w-[80%] ${m.role==='user'?'bg-primary text-primary-foreground':'bg-secondary'}`}>
                {m.imageUrl && <img src={m.imageUrl} alt="Imagen del ejercicio" className="mb-2 rounded" loading="lazy" />}
                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-2">
        <div ref={dropRef} className="rounded-md border border-dashed p-3 text-sm text-muted-foreground" aria-label="Zona para arrastrar y soltar imagen">
          Arrastra y suelta una imagen aquí o usa la cámara:
          <Input type="file" accept="image/png,image/jpeg" capture="environment"
                 onChange={(e) => { const f=e.target.files?.[0]; if (f) { const url = URL.createObjectURL(f); setImageUrl(url);} }} />
          {imageUrl && <img src={imageUrl} alt="Vista previa del ejercicio" className="mt-2 h-24 object-cover rounded" />}
        </div>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe tu duda..." aria-label="Caja de texto de la duda" />
        <div className="flex gap-2">
          <Button onClick={send} aria-label="Enviar mensaje">Enviar</Button>
          <Button variant="secondary" onClick={() => setInput((v) => (v ? v + "\n\nExplícame con un ejemplo" : "Explícame con un ejemplo"))}>Explícame con un ejemplo</Button>
          <Button variant="secondary" onClick={() => setInput((v) => (v ? v + "\n\nDame pistas" : "Dame pistas"))}>Dame pistas</Button>
        </div>
      </div>
    </div>
  );
}
