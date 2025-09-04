
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import ExerciseInline from "@/components/ExerciseInline";

type Choice = { id: string; label_md: string; correct?: boolean };
type Exercise = {
  id: string;
  type: "numeric"|"fraction"|"short_text"|"multiple_choice"|"multi_select";
  stimulus_md: string;
  choices?: Choice[];
  answer?: string | null;
  validators?: Record<string, unknown> | null;
};
type Lesson = {
  id: string;
  title: string;
  concept_md: string;
  worked_example_prompt_md: string;
  worked_example_steps_md: string[];
};

export default function TopicPage() {
  const [grade, setGrade] = useState<number | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Derive params from URL: /cursos/:grade/:topic
  useEffect(() => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const g = Number(parts[1]);
    const t = parts[2] || null;
    setGrade(Number.isFinite(g) ? g : null);
    setTopic(t);
  }, []);

  useEffect(() => {
    (async () => {
      if (!grade || !topic) return;
      setLoading(true);
      const sb = supabaseBrowser();

      const { data: l } = await sb
        .from("lessons")
        .select("*")
        .eq("grade", grade)
        .eq("topic_slug", topic)
        .single();

      setLesson(l as Lesson);

      if (l?.id) {
        const { data: exs } = await sb
          .from("exercises")
          .select("*")
          .eq("lesson_id", l.id)
          .order("ex_order", { ascending: true });
        setExercises(exs || []);
      }
      setLoading(false);
    })();
  }, [grade, topic]);

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-4">
      {loading && <div>Cargando…</div>}
      {!loading && !lesson && <div>No se encontró la lección en SubAVIS.</div>}
      {lesson && (
        <>
          <section className="space-y-2">
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: lesson.concept_md }} />
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Ejemplo resuelto</h2>
            <div dangerouslySetInnerHTML={{ __html: lesson.worked_example_prompt_md }} />
            {Array.isArray(lesson.worked_example_steps_md) &&
              lesson.worked_example_steps_md.map((s, i) => (
                <div key={i} className="text-sm bg-slate-50 border rounded p-2" dangerouslySetInnerHTML={{ __html: s }} />
              ))}
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Práctica</h2>
            {exercises.length === 0 && <div>No hay ejercicios en SubAVIS para este tema.</div>}
            {exercises.map((ex) => (
              <ExerciseInline key={ex.id} ex={ex} />
            ))}
          </section>
        </>
      )}
    </div>
  );
}
