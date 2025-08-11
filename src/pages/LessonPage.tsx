import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTopic } from "@/lib/api";
import { LessonViewer } from "@/components/lessons/LessonViewer";
import { SEO } from "@/components/seo/SEO";

export default function LessonPage() {
  const { grade, topicSlug } = useParams();
  const [markdown, setMarkdown] = useState<string>("");

  useEffect(() => {
    if (!grade || !topicSlug) return;
    getTopic(Number(grade), topicSlug).then((t) => setMarkdown(t?.markdown ?? ""));
  }, [grade, topicSlug]);

  return (
    <main className="container py-8 space-y-6">
      <SEO title={`Lección: ${topicSlug} | Profe Mates`} description={`Lección de ${grade}º: ${topicSlug}`} />
      <h1 className="text-3xl font-bold">Lección</h1>
      <LessonViewer markdown={markdown} />
    </main>
  );
}
