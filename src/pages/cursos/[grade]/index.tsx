import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function GradeIndex() {
  const { grade } = useParams();
  const [items, setItems] = useState<{ topic_slug: string; title: string }[]>([]);

  useEffect(() => {
    if (!grade) return;
    (async () => {
      const { data } = await supabase
        .from("lessons")
        .select("topic_slug,title")
        .eq("grade", Number(grade))
        .order("topic_slug", { ascending: true });
      setItems(data || []);
    })();
  }, [grade]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold">Temas de {grade}º</h1>
      <ul className="list-disc pl-6">
        {items.map((it) => (
          <li key={it.topic_slug}>
            <Link className="text-blue-600 underline" to={`/cursos/${grade}/${it.topic_slug}`}>
              {it.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
