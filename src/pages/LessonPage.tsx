import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTopic } from "@/lib/api";
import { LessonViewer } from "@/components/lessons/LessonViewer";
import { SEO } from "@/components/seo/SEO";
import { Topic } from "@/types";

export default function LessonPage() {
  const { grade, topicSlug } = useParams();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!grade || !topicSlug) return;
    setLoading(true);
    getTopic(Number(grade), topicSlug).then((t) => {
      setTopic(t || null);
      setLoading(false);
    });
  }, [grade, topicSlug]);

  if (loading) {
    return <main className="container py-8">Cargando...</main>;
  }

  if (!topic) {
    return <main className="container py-8">Lección no encontrada.</main>;
  }

  return (
    <main className="container py-8 space-y-6">
      <SEO
        title={`Lección: ${topic.title} | Profe Mates`}
        description={`Lección de ${grade}º: ${topic.title}`}
      />
      <h1 className="text-3xl font-bold">{topic.title}</h1>
      <LessonViewer markdown={topic.markdown} />
    </main>
  );
}
