import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import Fraction from "fraction.js";
import { useParams } from "react-router-dom";

type Choice = { id: string; label_md: string; correct?: boolean };
type Exercise = {
  id: string;
  type: "numeric"|"fraction"|"short_text"|"multiple_choice"|"multi_select";
  stimulus_md: string;
  choices?: Choice[];
  answer?: string | null;
  validators?: Record<string, any> | null;
};
type Lesson = {
  id: string;
  title: string;
  concept_md: string;
  worked_example_prompt_md: string;
  worked_example_steps_md: string[];
};

function normalizeText(s: string){
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
}
function isFractionEq(a: string,b: string){
  try { return new Fraction(a).equals(new Fraction(b)); } catch { return false; }
}

function ExerciseInline({ ex }: { ex: Exercise }) {
  const [value, setValue] = useState<any>(ex.type === "multi_select" ? [] : "");
  const [status, setStatus] = useState<"idle"|"ok"|"ko">("idle");

  const html = useMemo(()=>({__html: ex.stimulus_md}),[ex.stimulus_md]);

  function check(){
    const v = ex.validators || {};
    let correct = false;

    try{
      if (ex.type === "numeric"){
        const tol = typeof v.tolerance === "number" ? v.tolerance : 0;
        correct = Math.abs(Number(value) - Number(ex.answer)) <= tol;
      } else if (ex.type === "fraction"){
        correct = isFractionEq(String(value), String(ex.answer ?? ""));
      } else if (ex.type === "short_text"){
        const got = v.normalize_text ? normalizeText(String(value)) : String(value).trim();
        const exp = v.normalize_text ? normalizeText(String(ex.answer ?? "")) : String(ex.answer ?? "").trim();
        correct = got === exp;
      } else if (ex.type === "multiple_choice"){
        const ids = (ex.choices||[]).filter(c=>c.correct).map(c=>String(c.id));
        correct = ids.length ? String(value) === ids[0] : false;
      } else if (ex.type === "multi_select"){
        const exp = (ex.choices||[]).filter(c=>c.correct).map(c=>String(c.id)).sort().join("|");
        const got = Array.isArray(value) ? value.map(String).sort().join("|") : "";
        correct = exp === got;
      }
    } catch { correct = false; }

    setStatus(correct ? "ok" : "ko");
  }

  return (
    <div className="border rounded-lg p-4 bg-white space-y-3">
      <div className="flex items-start justify-between">
        <div dangerouslySetInnerHTML={html}/>
        {status==="ok" && <span className="text-green-600 font-semibold">¡Correcto!</span>}
        {status==="ko" && <span className="text-red-600 font-semibold">Sigue intentando</span>}
      </div>

      {(ex.type==="numeric"||ex.type==="fraction"||ex.type==="short_text") && (
        <input className="border rounded px-2 py-1" value={value}
               onChange={(e)=>setValue(e.target.value)} placeholder="Tu respuesta"/>
      )}

      {ex.type==="multiple_choice" && (
        <div className="space-y-2">
          {ex.choices?.map(c=>(
            <label key={c.id} className="flex gap-2 items-center">
              <input type="radio" name={ex.id} value={c.id}
                     checked={String(value)===String(c.id)}
                     onChange={(e)=>setValue(e.target.value)}/>
              <span dangerouslySetInnerHTML={{__html: c.label_md}}/>
            </label>
          ))}
        </div>
      )}

      {ex.type==="multi_select" && (
        <div className="space-y-2">
          {ex.choices?.map(c=>{
            const id = String(c.id);
            const checked = (value as string[]).includes(id);
            return (
              <label key={id} className="flex gap-2 items-center">
                <input type="checkbox" checked={checked}
                       onChange={(e)=>{
                         const s = new Set<string>(value);
                         e.target.checked ? s.add(id) : s.delete(id);
                         setValue(Array.from(s));
                       }}/>
                <span dangerouslySetInnerHTML={{__html: c.label_md}}/>
              </label>
            );
          })}
        </div>
      )}

      <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={check}>Comprobar</button>
    </div>
  );
}

export default function CourseView(){
  const { grade, topic } = useParams(); // viene de /cursos/:grade/:topic
  const [lesson, setLesson] = useState<Lesson|null>(null);
  const [exs, setExs] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ (async ()=>{
    if(!grade || !topic) return;
    setLoading(true);

    const { data: l } = await supabase
      .from("lessons")
      .select("*")
      .eq("grade", Number(grade))
      .eq("topic_slug", topic)
      .single();

    if (l?.id){
      const { data: e } = await supabase
        .from("exercises")
        .select("*")
        .eq("lesson_id", l.id)
        .order("ex_order", { ascending: true });
      setExs((e||[]) as Exercise[]);
    }
    setLesson(l as Lesson);
    setLoading(false);
  })(); }, [grade, topic]);

  if (loading) return <div className="p-6">Cargando…</div>;
  if (!lesson) return <div className="p-6">No se encontró la lección en SubAVIS.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-4">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <div dangerouslySetInnerHTML={{__html: lesson.concept_md}}/>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Ejemplo resuelto</h2>
        <div dangerouslySetInnerHTML={{__html: lesson.worked_example_prompt_md}}/>
        {lesson.worked_example_steps_md?.map((s,i)=>(
          <div key={i} className="text-sm bg-slate-50 border rounded p-2"
               dangerouslySetInnerHTML={{__html:s}}/>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Práctica</h2>
        {exs.length===0 && <div>No hay ejercicios en esta lección.</div>}
        {exs.map(ex => <ExerciseInline key={ex.id} ex={ex}/>)}
      </section>
    </div>
  );
}
