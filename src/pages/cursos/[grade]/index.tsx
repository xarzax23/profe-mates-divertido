import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";

export default function GradeIndex() {
  const [items, setItems] = useState<any[]>([]);
  const [grade, setGrade] = useState<number | null>(null);

  useEffect(() => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const g = Number(parts[1]);
    setGrade(Number.isFinite(g) ? g : null);
  }, []);

  useEffect(() => {
    (async () => {
      if (!grade) return;
      const sb = supabaseBrowser();
      const { data } = await sb
        .from("lessons")
        .select("topic_slug,title")
        .eq("grade", grade)
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
            <Link className="text-blue-600 underline" href={`/cursos/${grade}/${it.topic_slug}`}>
              {it.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
