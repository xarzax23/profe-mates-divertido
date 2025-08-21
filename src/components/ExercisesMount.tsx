"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

function MC({ ex, value, setValue }: any) {
  return (
    <div className="space-y-2">
      {ex.choices?.map((c: any) => (
        <label key={c.id} className="flex items-center gap-2">
          <input
            type="radio"
            name={ex.id}
            value={c.id}
            checked={String(value) === String(c.id)}
            onChange={(e) => setValue(e.target.value)}
          />
          <span dangerouslySetInnerHTML={{ __html: c.label_md }} />
        </label>
      ))}
    </div>
  );
}

function MS({ ex, value, setValue }: any) {
  const selected: string[] = value || [];
  return (
    <div className="space-y-2">
      {ex.choices?.map((c: any) => {
        const id = String(c.id);
        const checked = selected.includes(id);
        return (
          <label key={id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => {
                const s = new Set(selected);
                e.target.checked ? s.add(id) : s.delete(id);
                setValue([...s]);
              }}
            />
            <span dangerouslySetInnerHTML={{ __html: c.label_md }} />
          </label>
        );
      })}
    </div>
  );
}

export default function ExercisesMount() {
  const [lesson, setLesson] = useState<any>(null);
  const [exs, setExs] = useState<any[]>([]);
    // (Legacy ExercisesMount removed. Use topic page and ExerciseInline only.)

  useEffect(() => {
    // deduce grade/topic desde la URL: /cursos/:grade/:topic
    const parts = window.location.pathname.split("/").filter(Boolean);
    const grade = Number(parts[1]);
    const topic = parts[2];
    (async () => {
      const { data: l } = await sb()
        .from("lessons")
        .select("*")
        .eq("grade", grade)
        .eq("topic_slug", topic)
        .single();
      setLesson(l);
      if (l?.id) {
        const { data: e } = await sb()
          .from("exercises")
          .select("*")
          .eq("lesson_id", l.id)
          .order("ex_order", { ascending: true });
        setExs(e || []);
      }
    })();
  }, []);

  async function check(id: string) {
    const r = await fetch("/api/exercises/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId: id, userResponse: states[id] }),
    });
    const data = await r.json();
    setStatus((s) => ({ ...s, [id]: data.correct ? "ok" : "ko" }));
  }

  if (!lesson) return null;

  return (
    <section className="space-y-3">
      {exs.length === 0 && <div>No hay ejercicios en esta lección.</div>}
      {exs.map((ex) => {
        const val = states[ex.id] ?? (ex.type === "multi_select" ? [] : "");
        return (
          <div key={ex.id} className="border rounded p-4 space-y-2 bg-white">
            <div className="flex items-start justify-between">
              <div dangerouslySetInnerHTML={{ __html: ex.stimulus_md }} />
              {status[ex.id] === "ok" && <span className="text-green-600 font-semibold">¡Correcto!</span>}
              {status[ex.id] === "ko" && <span className="text-red-600 font-semibold">Sigue intentando</span>}
            </div>

            {(ex.type === "numeric" || ex.type === "short_text" || ex.type === "fraction") && (
              <input
                className="border rounded px-2 py-1"
                value={val}
                onChange={(e) => setStates((s) => ({ ...s, [ex.id]: e.target.value }))}
                placeholder="Tu respuesta"
              />
            )}

            {ex.type === "multiple_choice" && <MC ex={ex} value={val} setValue={(v:any)=>setStates((s)=>({ ...s, [ex.id]: v }))} />}
            {ex.type === "multi_select" && <MS ex={ex} value={val} setValue={(v:any)=>setStates((s)=>({ ...s, [ex.id]: v }))} />}

            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => check(ex.id)}>
                Comprobar
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}
