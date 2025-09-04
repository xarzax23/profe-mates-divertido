import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function loadEnvFromFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return {};
  const map = {};
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.+?)"?\s*$/);
    if (m) map[m[1]] = m[2];
  }
  return map;
}

const env = loadEnvFromFile();
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || env.SUPABASE_URL || env.VITE_SUPABASE_URL;
// Prefer service role key from env file too (was missing before)
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  env.SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Faltan SUPABASE_URL / SUPABASE_*_KEY en entorno o .env");
  process.exit(1);
}

// Helpful: print which role is used (anon vs service_role)
function parseRole(k) {
  try {
    const parts = String(k).split(".");
    if (parts.length < 2) return "unknown";
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
    return payload?.role || payload?.user_role || "unknown";
  } catch { return "unknown"; }
}

console.log("Using key role:", parseRole(key));

const sb = createClient(url, key);

function exampleForLesson(lesson) {
  const slug = String(lesson.topic_slug || "");
  if (slug.includes("ingles") || slug.includes("vocab")) {
    return {
      prompt: "### ¿Qué harás en este tema?\n\nAprenderás palabras en inglés y su pareja en español jugando a emparejar.\nMira con atención, recuerda y busca su pareja.",
      steps: [
        "Observa la palabra que aparece.",
        "Busca su pareja en el otro idioma.",
        "Prueba a recordar dónde viste cada carta.",
        "¡Haz todas las parejas!"
      ]
    };
  }
  if (slug.includes("numeros") || slug.includes("sumas") || slug.includes("restas")) {
    return {
      prompt: "### ¿Qué harás en este tema?\n\nPracticarás números con juegos de elegir o arrastrar.\nCuenta, compara y elige la opción correcta.",
      steps: [
        "Lee la consigna con calma.",
        "Cuenta o piensa el resultado.",
        "Toca la opción correcta.",
        "Si fallas, vuelve a intentarlo con una pista."
      ]
    };
  }
  if (slug.includes("robot")) {
    return {
      prompt: "### ¿Qué harás en este tema?\n\nProgramarás un robot con bloques para llegar a la meta y recoger monedas.",
      steps: [
        "Coloca bloques como **MOVE FORWARD** o **TURN LEFT**.",
        "Ejecuta y mira qué hace el robot.",
        "Cambia tu plan si choca con una pared.",
        "¡Llega a la meta!"
      ]
    };
  }
  return {
    prompt: "### ¿Qué harás en este tema?\n\nJugarás y aprenderás paso a paso con actividades cortas.",
    steps: [
      "Lee con atención.",
      "Elige o arrastra según te pidan.",
      "Prueba, observa y mejora tu respuesta.",
      "¡Sigue hasta completar el reto!"
    ]
  };
}

function exercisesForLesson(lesson) {
  const slug = String(lesson.topic_slug || "");
  if (slug.includes("ingles") || slug.includes("vocab")) {
    return [{
      type: "multiple_choice",
      stimulus_md: "¿Cuál es la traducción de `dog`?",
      choices: [
        { id: "a", label_md: "perro", correct: true },
        { id: "b", label_md: "gato" },
        { id: "c", label_md: "vaca" },
        { id: "d", label_md: "pájaro" }
      ]
    }];
  }
  if (slug.includes("numeros")) {
    return [{
      type: "multiple_choice",
      stimulus_md: "¿Cuánto es `3 + 1`?",
      choices: [
        { id: "a", label_md: "3" },
        { id: "b", label_md: "4", correct: true },
        { id: "c", label_md: "5" },
        { id: "d", label_md: "2" }
      ]
    }];
  }
  if (slug.includes("sumas") || slug.includes("restas")) {
    return [{
      type: "multiple_choice",
      stimulus_md: "¿Cuánto es `9 − 5`?",
      choices: [
        { id: "a", label_md: "3" },
        { id: "b", label_md: "4", correct: true },
        { id: "c", label_md: "5" },
        { id: "d", label_md: "2" }
      ]
    }];
  }
  if (slug.includes("robot")) {
    return [{
      type: "multiple_choice",
      stimulus_md: "¿Qué bloque hace que el robot gire a la izquierda?",
      choices: [
        { id: "a", label_md: "MOVE FORWARD" },
        { id: "b", label_md: "TURN LEFT", correct: true },
        { id: "c", label_md: "REPEAT" },
        { id: "d", label_md: "IF PATH AHEAD" }
      ]
    }];
  }
  return [];
}

async function main() {
  console.log("Seed inicial: conectando a", url);
  const { data: lessons, error } = await sb
    .from("lessons")
    .select("id, grade, topic_slug, title, worked_example_prompt_md, worked_example_steps_md")
    .order("grade", { ascending: true });
  if (error) throw error;

  let updated = 0, insertedEx = 0;

  for (const L of lessons || []) {
    const hasPrompt = Boolean(L.worked_example_prompt_md && String(L.worked_example_prompt_md).trim());
    const hasSteps = Array.isArray(L.worked_example_steps_md) && L.worked_example_steps_md.length > 0;
    if (!hasPrompt || !hasSteps) {
      const ex = exampleForLesson(L);
      const upd = {
        worked_example_prompt_md: hasPrompt ? L.worked_example_prompt_md : ex.prompt,
        worked_example_steps_md: hasSteps ? L.worked_example_steps_md : ex.steps
      };
      const { error: eUp } = await sb.from("lessons").update(upd).eq("id", L.id);
      if (!eUp) updated++;
      else console.warn("No se pudo actualizar lección", L.id, eUp.message);
    }

    const { count, error: eCount } = await sb
      .from("exercises")
      .select("id", { count: "exact", head: true })
      .eq("lesson_id", L.id);
    if (!eCount && (count || 0) === 0) {
      const exs = exercisesForLesson(L).map((e, idx) => {
        let solution = null;
        try {
          const correct = (e.choices || []).find((c) => c.correct);
          if (correct) solution = `La respuesta correcta es: ${correct.label_md}`;
        } catch {}
        return {
          lesson_id: L.id,
          ex_order: idx + 1,
          solution: solution || 'Consulta la pista para entender el procedimiento.',
          ...e,
        };
      });
      if (exs.length) {
        const { error: eIns } = await sb.from("exercises").insert(exs);
        if (!eIns) insertedEx += exs.length;
        else console.warn("No se pudieron insertar ejercicios para", L.topic_slug, eIns.message);
      }
    }
  }

  console.log(`Actualizadas ${updated} lecciones con ejemplo-resuelto.`);
  console.log(`Insertados ${insertedEx} ejercicios iniciales.`);
}

main().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
