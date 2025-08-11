import { useParams } from "react-router-dom";
import { SEO } from "@/components/seo/SEO";
import { TopicList } from "@/components/courses/TopicList";

export default function CourseTopics() {
  const params = useParams();
  const grade = Number(params.grade ?? 1);
  return (
    <main className="container py-8 space-y-6">
      <SEO title={`Temas ${grade}º | Profe Mates`} description={`Temario de ${grade}º: sumas, fracciones y más.`} />
      <h1 className="text-3xl font-bold">Temas de {grade}º</h1>
      <TopicList grade={grade} />
    </main>
  );
}
