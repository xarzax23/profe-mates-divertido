// scripts/supa-smoke.mjs
import { createClient } from "@supabase/supabase-js";

// Lee envs típicas de tu proyecto (Vite/React o genéricas)
const url =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error("Faltan variables: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (o equivalentes).");
  process.exit(1);
}

const sb = createClient(url, anon);

async function main() {
  console.log("Conectando a:", url);

  // 1) Lista de lecciones (muestra + conteo)
  const { data: lessons, count, error: e1 } = await sb
    .from("lessons")
    .select("id, grade, topic_slug, title", { count: "exact" })
    .order("grade", { ascending: true })
    .limit(10);

  if (e1) throw e1;
  console.log("Total lessons (conteo exacto):", count ?? lessons?.length ?? 0);
  console.table(lessons);

  // 2) Ejercicios de un tema conocido (si existe)
  const { data: l, error: e2 } = await sb
    .from("lessons")
    .select("id, topic_slug")
    .eq("topic_slug", "sumas-hasta-20")
    .maybeSingle();

  if (e2) throw e2;

  if (l?.id) {
    const { data: exs, error: e3 } = await sb
      .from("exercises")
      .select("id, type, stimulus_md, choices, answer")
      .eq("lesson_id", l.id)
      .order("ex_order", { ascending: true });

    if (e3) throw e3;

    console.log(`Ejercicios para '${l.topic_slug}':`, exs.length);
    console.table(
      exs.map((e) => ({
        id: e.id,
        type: e.type,
        hasChoices: !!e.choices,
        answer: typeof e.answer === "string" ? e.answer.slice(0, 30) : null,
      }))
    );
  } else {
    console.warn("No se encontró la lección 'sumas-hasta-20' (prueba con otro topic_slug existente).");
  }
}

main().catch((err) => {
  console.error("Supabase error:", err?.message || err);
  // pista rápida:
  console.error(
    "Pistas: revisa que el anon key sea el correcto, RLS/policies permitan SELECT, y que la tabla tenga filas."
  );
  process.exit(1);
});
