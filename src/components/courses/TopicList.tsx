import { useEffect, useState } from "react";
import { getTopics } from "@/lib/api";
import { Topic } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export function TopicList({ grade }: { grade: number }) {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    getTopics(grade).then(setTopics);
  }, [grade]);

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {topics.map((t) => (
        <Card key={t.id}>
          <CardHeader>
            <CardTitle>{t.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{t.markdown.replace(/[#*`]/g, '').slice(0, 120)}...</p>
            <Link className="text-primary underline" to={`/cursos/${grade}/${t.slug}`}>Abrir lección</Link>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
