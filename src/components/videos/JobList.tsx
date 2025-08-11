import { useEffect, useState } from "react";
import { getVideoJobs } from "@/lib/api";
import { VideoJob } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobStatusBadge } from "@/components/videos/JobStatusBadge";

export function JobList() {
  const [jobs, setJobs] = useState<VideoJob[]>([]);

  useEffect(() => {
    getVideoJobs().then(setJobs);
    const t = setInterval(()=> getVideoJobs().then(setJobs), 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid gap-4">
      {jobs.map(j => (
        <Card key={j.id}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">{j.id}</CardTitle>
            <JobStatusBadge status={j.status} />
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>Curso: {j.grade}º</p>
            {j.topicId && <p>Tema: {j.topicId}</p>}
            {j.prompt && <p>Prompt: {j.prompt}</p>}
            {j.videoUrl && <a className="text-primary underline" href={j.videoUrl} target="_blank" rel="noreferrer">Ver vídeo</a>}
            {j.error && <p className="text-destructive">{j.error}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
