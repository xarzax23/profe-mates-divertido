import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, supabaseConfigOk, supabaseConfigError } from "../lib/supabase";

type Row = { id: string; grade: number; topic_slug: string; title: string };
type CountMap = Record<string, number>;

export default function Lecciones() {
  const [rows, setRows] = useState<Row[]>([]);
  const [actCount, setActCount] = useState<CountMap>({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErrorMsg(null);
      if (!supabaseConfigOk) {
        setErrorMsg(
          `No se puede conectar a SuperVis (Supabase): ${supabaseConfigError}`
        );
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("lessons")
        .select("id, grade, topic_slug, title")
        .order("grade", { ascending: true })
        .order("topic_slug", { ascending: true });
      if (error) {
        console.error("Supabase error (Lecciones):", error);
        setErrorMsg(
          `Error consultando SuperVis (Supabase): ${error.message || "desconocido"}`
        );
      } else if (data) {
        const rows = data as Row[];
        setRows(rows);
        // Cargar conteo de actividades por lección
        const ids = rows.map(r => r.id);
        if (ids.length) {
          const { data: links } = await supabase
            .from("lesson_activities")
            .select("lesson_id")
            .in("lesson_id", ids);
          const map: CountMap = {};
          (links || []).forEach((x: any) => {
            map[x.lesson_id] = (map[x.lesson_id] || 0) + 1;
          });
          setActCount(map);
        } else {
          setActCount({});
        }
      }
      setLoading(false);
    })();
  }, []);

  const byGrade = rows.reduce<Record<number, Row[]>>((acc, r) => {
    (acc[r.grade] ||= []).push(r);
    return acc;
  }, {});

  if (errorMsg) return <div className="p-6 text-red-600">{errorMsg}</div>;

  if (loading) return <div className="p-6">Cargando…</div>;
  if (rows.length === 0) return <div className="p-6">No hay lecciones en Supabase.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Lecciones</h1>
      {Object.keys(byGrade).sort((a,b)=>Number(a)-Number(b)).map((g)=>(
        <section key={g} className="space-y-2">
          <h2 className="text-xl font-semibold">{g}º Primaria</h2>
          <ul className="list-disc pl-6">
            {byGrade[Number(g)].map((r)=>(
              <li key={r.topic_slug}>
                <Link className="text-blue-600 underline" to={`/cursos/${g}/${r.topic_slug}`}>
                  {r.title}
                </Link>
                {typeof actCount[r.id] === 'number' && (
                  <span className="text-sm text-slate-500"> · {actCount[r.id]} actividades</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
