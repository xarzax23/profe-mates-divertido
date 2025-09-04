import { useMemo, useState } from "react";
import Fraction from "fraction.js";

type Choice = { id: string; label_md: string; correct?: boolean };
type Exercise = {
  id: string;
  type: "numeric" | "fraction" | "short_text" | "multiple_choice" | "multi_select";
  stimulus_md: string;
  choices?: Choice[];
  answer?: string | null;
  validators?: Record<string, any> | null;
};

function normalizeText(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function isFractionEq(a: string, b: string) {
  try { return new Fraction(a).equals(new Fraction(b)); } catch { return false; }
}

export default function ExerciseInline({ ex }: { ex: Exercise }) {
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
