import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { createVideoJob } from "@/lib/api";
import { Grade } from "@/types";
import { toast } from "sonner";

export function VideoJobCreator() {
  const [grade, setGrade] = useState<Grade>(1);
  const [topicId, setTopicId] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");

  const submit = async () => {
    if (!topicId && !prompt.trim()) {
      toast.error("Indica un tema o escribe un texto.");
      return;
    }
    const { jobId } = await createVideoJob({ grade, topicId: topicId || undefined, prompt: prompt || undefined });
    toast.success(`Trabajo de vídeo creado: ${jobId}`);
    setTopicId(""); setPrompt("");
  };

  return (
    <div className="grid sm:grid-cols-3 gap-2 items-end">
      <div>
        <label className="text-sm" htmlFor="vj-grade">Curso</label>
        <Input id="vj-grade" type="number" min={1} max={6} value={grade} onChange={(e)=>setGrade(Math.min(6, Math.max(1, Number(e.target.value))) as Grade)} />
      </div>
      <div>
        <label className="text-sm" htmlFor="vj-topic">Tema (opcional)</label>
        <Input id="vj-topic" value={topicId} onChange={(e)=>setTopicId(e.target.value)} placeholder="p.ej. t-3-sumas" />
      </div>
      <div className="sm:col-span-2">
        <label className="text-sm" htmlFor="vj-prompt">Texto libre (opcional)</label>
        <Input id="vj-prompt" value={prompt} onChange={(e)=>setPrompt(e.target.value)} placeholder="Quiero un vídeo sobre fracciones impropias" />
      </div>
      <Button onClick={submit} className="sm:col-span-1">Crear vídeo</Button>
    </div>
  );
}
