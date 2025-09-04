import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE! // solo en servidor
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { exerciseId, userResponse } = req.body;
  const { data: ex, error } = await sb
    .from("exercises")
    .select("type, answer, choices, validators")
    .eq("id", exerciseId)
    .single();

  if (error || !ex) return res.status(404).json({ correct: false });

  const validators = (ex.validators as Record<string, unknown>) || {};
  let correct = false;

  try {
    if (ex.type === "numeric") {
      const expected = Number(ex.answer);
      const got = Number(userResponse);
      const tol = typeof validators.tolerance === "number" ? validators.tolerance : 0;
      correct = Math.abs(got - expected) <= tol;
    } else if (ex.type === "short_text") {
      const norm = (s: string) =>
        (validators.normalize_text
          ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
          : s
        ).trim();
      correct = norm(String(userResponse)) === norm(String(ex.answer ?? ""));
    } else if (ex.type === "multiple_choice") {
      const correctIds = (ex.choices || [])
        .filter((c: { correct: boolean }) => c.correct)
        .map((c: { id: string }) => String(c.id));
      correct = correctIds.length ? String(userResponse) === correctIds[0] : false;
    } else if (ex.type === "multi_select") {
      const exp = new Set((ex.choices || []).filter((c: { correct: boolean }) => c.correct).map((c: { id: string }) => String(c.id)));
      const got = new Set<string>((userResponse as string[]) || []);
      correct = exp.size === got.size && [...exp].every((id) => got.has(id));
    }
  } catch {
    correct = false;
  }

  return res.status(200).json({ correct });
}
