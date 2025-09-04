import { SEO } from "@/components/seo/SEO";
import { VideoJobCreator } from "@/components/videos/VideoJobCreator";
import { JobList } from "@/components/videos/JobList";

export default function Videos() {
  return (
    <main className="container py-8 space-y-6">
      <SEO title="Vídeos explicativos | Profe Mates" description="Crea vídeos bajo demanda y consulta su estado." />
      <h1 className="text-3xl font-bold">Vídeos explicativos</h1>
      <VideoJobCreator />
      <JobList />
    </main>
  );
}
