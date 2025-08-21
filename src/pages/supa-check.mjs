import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Faltan SUPABASE_URL / SUPABASE_ANON_KEY");
  process.exit(1);
}

const sb = createClient(url, key);

const { data: lessons, error: e1 } = await sb.from("lessons")
  .select("id, grade, topic_slug, title")
  .order("grade", { ascending: true })
  .limit(5);

if (e1) console.error("Error lessons:", e1);
else console.log("Lecciones (muestra):", lessons);

if (lessons?.length) {
  const { data: exs, error: e2 } = await sb.from("exercises")
    .select("id, lesson_id, type, stimulus_md")
    .eq("lesson_id", lessons[0].id)
    .order("ex_order", { ascending: true })
    .limit(5);
  if (e2) console.error("Error exercises:", e2);
  else console.log(`Ejercicios de ${lessons[0].topic_slug}:`, exs);
}

process.exit(0);
