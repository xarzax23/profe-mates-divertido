import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { ChatMessage, Grade } from "@/types";
// Import tutor API functions including solution request with PIN validation
import { postChat, requestSolution } from "@/lib/api";
import { detectAndSanitizePII } from "@/lib/validators";
import { toast } from "sonner";
import { ParentalGate } from "./ParentalGate";
import { Shield, Eye } from "lucide-react";

export function TutorChat() {
  const [grade, setGrade] = useState<Grade>(1);
  const messages = useAppStore(s => s.chatByGrade[grade]);
  const setChat = useAppStore(s => s.setChatForGrade);
  const [input, setInput] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [lastQuery, setLastQuery] = useState<{ message: string; imageUrl?: string } | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [isLoadingSolution, setIsLoadingSolution] = useState(false);
  const [parentGateError, setParentGateError] = useState<string>();
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
    
    // Store the query for potential solution request
    setLastQuery({ message: sanitized, imageUrl });
    
    const updated = await postChat({ grade, message: sanitized, imageUrl, existing: messages });
    setChat(grade, updated);
    setInput("");
    setSolution(null); // Reset solution when new question is asked
  };

  const handleRequestSolution = () => {
    setParentGateError(undefined);
    setShowParentalGate(true);
  };

  const handleParentalGateSubmit = async (pin: string) => {
    if (!lastQuery) return;
    
    setIsLoadingSolution(true);
    setParentGateError(undefined);
    
    try {
      const result = await requestSolution({
        grade,
        message: lastQuery.message,
        imageUrl: lastQuery.imageUrl,
        parentPin: pin
      });

      if (result.success && result.solution) {
        setSolution(result.solution);
        setShowParentalGate(false);
        toast.success("Solución desbloqueada");
      } else {
        setParentGateError(result.error || "PIN incorrecto");
      }
    } catch (error) {
      setParentGateError("Error técnico. Inténtalo de nuevo.");
    } finally {
      setIsLoadingSolution(false);
    }
  };

  const handleParentalGateClose = () => {
    setShowParentalGate(false);
    setParentGateError(undefined);
    setIsLoadingSolution(false);
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

      {/* Solution Section with Parental Gate */}
      {lastQuery && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Shield className="h-5 w-5" />
              ¿Necesitas la solución?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!solution ? (
              <div className="space-y-3">
                <p className="text-sm text-amber-700">
                  El modo adulto te permite ver la respuesta completa. Es importante que primero intentes resolver el ejercicio con las pistas.
                </p>
                <Button 
                  onClick={handleRequestSolution}
                  variant="outline"
                  className="border-amber-300 text-amber-800 hover:bg-amber-100"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Introducir PIN de adulto
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <h4 className="font-medium text-amber-800">Solución completa:</h4>
                <div className="p-3 rounded-md bg-white border border-amber-200">
                  <p className="text-sm whitespace-pre-wrap">{solution}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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

      <ParentalGate
        isOpen={showParentalGate}
        onClose={handleParentalGateClose}
        onSubmit={handleParentalGateSubmit}
        isLoading={isLoadingSolution}
        error={parentGateError}
      />
    </div>
  );
}
