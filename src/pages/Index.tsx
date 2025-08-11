import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <main className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
      <SEO title="Profe Mates Primaria | Aprende matemáticas" description="Web para 1º-6º de Primaria: temario, chat con tutor y vídeos explicativos." />
      <section className="container text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Aprende matemáticas con tu profe digital</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Temario por curso, asistente de estudio con imagen y generación de vídeos. Enfocado a 1º-6º de Primaria.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild>
            <a href="/cursos">Aprender por curso</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/profe">Preguntar al profe</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/videos">Crear vídeo explicativo</a>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Index;

