import { SEO } from "@/components/seo/SEO";
import { CourseGrid } from "@/components/courses/CourseGrid";

export default function Courses() {
  return (
    <main className="container py-8 space-y-6">
      <SEO title="Cursos de Primaria | Profe Mates" description="Explora temario de 1º a 6º de Primaria: lecciones y práctica." />
      <h1 className="text-3xl font-bold">Elige tu curso</h1>
      <CourseGrid />
    </main>
  );
}
