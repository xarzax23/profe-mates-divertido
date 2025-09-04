import { SEO } from "@/components/seo/SEO";
import { TutorChat } from "@/components/chat/TutorChat";

export default function Profe() {
  return (
    <main className="container py-8 space-y-6">
      <SEO title="Preguntar al profe | Profe Mates" description="Asistente de estudio con chat y opción de subir foto del ejercicio." />
      <h1 className="text-3xl font-bold">Preguntar al profe</h1>
      <TutorChat />
    </main>
  );
}
