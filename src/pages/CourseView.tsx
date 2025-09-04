import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ExerciseInline from "../components/ExerciseInline";
import { LessonViewer } from "@/components/lessons/LessonViewer";

type Lesson = {
  id: string;
  title: string;
  concept_md: string;
  worked_example_prompt_md: string;
  worked_example_steps_md: string[];
};

type ActivityLite = {
  id: string;
  type: string;
  template: string;
  title: string;
  instructions?: string | null;
};

export default function CourseView() {
  const { grade, topic } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [exs, setExs] = useState<any[]>([]);
  const [activities, setActivities] = useState<ActivityLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!grade || !topic) return;
      setLoading(true);
      setErrorMsg(null);

      const { data: l, error: e1 } = await supabase
        .from("lessons")
        .select("*")
        .eq("grade", Number(grade))
        .eq("topic_slug", topic)
        .maybeSingle();
      if (e1) {
        console.error("Supabase error (CourseView/lesson):", e1);
        setErrorMsg(`Error consultando leccion: ${e1.message || "desconocido"}`);
        setLesson(null);
        setExs([]);
        setActivities([]);
        setLoading(false);
        return;
      }

      setLesson(l as Lesson);

      if (l?.id) {
        const { data: e } = await supabase
          .from("exercises")
          .select("*")
          .eq("lesson_id", l.id)
          .order("ex_order", { ascending: true });
        setExs(e || []);
      } else {
        setExs([]);
      }

      if (l?.id) {
        const { data: links, error: e2 } = await supabase
          .from("lesson_activities")
          .select("activity_id, order_index")
          .eq("lesson_id", l.id)
          .order("order_index", { ascending: true });
        if (!e2 && links && links.length) {
          const ids = links.map((x: any) => x.activity_id);
          const { data: acts, error: e3 } = await supabase
            .from("activities")
            .select("id, type, template, title, instructions")
            .in("id", ids);
          if (e3) {
            console.error("Supabase error (CourseView/activities):", e3);
            setActivities([]);
          } else if (acts) {
            const orderMap = new Map<string, number>(
              links.map((x: any) => [x.activity_id, x.order_index] as [string, number])
            );
            const ordered = (acts as any[]).slice().sort((a: any, b: any) => (orderMap.get(a.id)! - orderMap.get(b.id)!));
            setActivities(ordered as ActivityLite[]);
          } else {
            setActivities([]);
          }
        } else {
          setActivities([]);
        }
      } else {
        setActivities([]);
      }

      setLoading(false);
    })();
  }, [grade, topic]);

  if (loading) return <div className="p-6">Cargando…</div>;
  if (errorMsg) return <div className="p-6 text-red-600">{errorMsg}</div>;
  if (!lesson) return <div className="p-6">No se encontró la lección en Supabase.</div>;

  const hasExample = Boolean(lesson.worked_example_prompt_md?.trim()) ||
    (Array.isArray(lesson.worked_example_steps_md) && lesson.worked_example_steps_md.some(s => Boolean((s || "").trim())));

  const firstTpl = activities[0]?.template;
  const autoExamplePrompt = !hasExample && firstTpl ? (
    firstTpl === "memory" ?
      `### Como jugar a Memory\n\n- Voltea dos cartas.\n- Si hacen pareja, se quedan visibles.\n- Si no, recuerda su posicion y vuelve a intentar.\n\nConsejo: empieza por una carta y busca su pareja.` :
    firstTpl === "drag-match" ?
      `### Como jugar a Arrastrar y Emparejar\n\n- Arrastra cada elemento hasta su objetivo correspondiente.\n- Fijate en la etiqueta (o imagen) que coincide.\n- Cuando hagas una pareja correcta, queda marcada.` :
    firstTpl === "select-correct" ?
      `### Como jugar a Selecciona la Correcta\n\n- Lee la consigna.\n- Toca la opcion que cumpla la regla.\n- Usa pistas si las necesitas.` :
    firstTpl === "robot-grid" ?
      `### Como jugar a Robot Grid\n\n- Arrastra bloques para crear un programa.\n- Haz que el robot llegue a la meta (y recoja monedas si hay).\n- Prueba, observa y mejora tu solucion.` : null
  ) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <LessonViewer markdown={lesson.concept_md} />
      </section>

      {(hasExample || autoExamplePrompt) && (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Ejemplo resuelto</h2>
          {lesson.worked_example_prompt_md && (
            <LessonViewer markdown={lesson.worked_example_prompt_md} />
          )}
          {!lesson.worked_example_prompt_md && autoExamplePrompt && (
            <LessonViewer markdown={autoExamplePrompt} />
          )}
          {Array.isArray(lesson.worked_example_steps_md) &&
            lesson.worked_example_steps_md.map((s, i) => (
              <div key={i} className="text-sm bg-slate-50 border rounded p-2">
                <LessonViewer markdown={s} />
              </div>
            ))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Práctica</h2>
        {exs.map((ex) => (
          <ExerciseInline key={ex.id} ex={ex} />
        ))}
        {activities.map((a) => (
          <div key={a.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{a.title}</div>
              <div className="text-sm text-slate-600">{a.template} · {a.type}</div>
            </div>
            <Link className="text-blue-600 underline" to={`/play?activityId=${a.id}`}>
              Jugar
            </Link>
          </div>
        ))}
        {exs.length === 0 && activities.length === 0 && (
          <div>No hay ejercicios ni actividades para este tema.</div>
        )}
      </section>
    </div>
  );
}

