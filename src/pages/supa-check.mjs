import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function loadEnvFromFile() {
  try {
    const envPath = path.join(process.cwd(), ".env");
    if (!fs.existsSync(envPath)) return {};
    const map = {};
    const raw = fs.readFileSync(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.+?)"?\s*$/);
      if (m) map[m[1]] = m[2];
    }
    return map;
  } catch {
    return {};
  }
}

const env = loadEnvFromFile();
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Faltan SUPABASE_URL / SUPABASE_ANON_KEY (o sus variantes VITE_)\n- SUPABASE_URL/VITE_SUPABASE_URL: ", url ? "OK" : "FALTA", "\n- SUPABASE_ANON_KEY/VITE_SUPABASE_ANON_KEY: ", key ? "OK" : "FALTA");
  process.exit(1);
}

console.log("Diagnóstico Supabase: URL=", `${url}`.slice(0, 48) + "…", " KEY.len=", `${key}`.length);
const sb = createClient(url, key);

const { data: lessons, error: e1 } = await sb
  .from("lessons")
  .select("id, grade, topic_slug, title")
  .order("grade", { ascending: true })
  .limit(5);

if (e1) {
  console.error("Error lessons:", e1);
  console.error("Posible problema de conexión/credenciales. Revisa URL y ANON KEY.");
} else {
  console.log("Lecciones (muestra):", lessons);
}

if (lessons?.length) {
  const { data: exs, error: e2 } = await sb
    .from("exercises")
    .select("id, lesson_id, type, stimulus_md")
    .eq("lesson_id", lessons[0].id)
    .order("ex_order", { ascending: true })
    .limit(5);
  if (e2) console.error("Error exercises:", e2);
  else console.log(`Ejercicios de ${lessons[0].topic_slug}:`, exs);

  const { data: links, error: e3 } = await sb
    .from("lesson_activities")
    .select("activity_id, order_index")
    .eq("lesson_id", lessons[0].id)
    .order("order_index", { ascending: true })
    .limit(10);
  if (e3) console.error("Error lesson_activities:", e3);
  else console.log(`Activities links de ${lessons[0].topic_slug}:`, links);
}

process.exit(0);
