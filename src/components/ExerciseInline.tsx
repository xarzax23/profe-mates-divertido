import { useState } from "react";

type Choice = { id: string; label_md: string; correct?: boolean };
type Exercise = {
  id: string;
  type: "numeric" | "fraction" | "short_text" | "multiple_choice" | "multi_select";
  stimulus_md: string;
  choices?: Choice[];
};

export default function ExerciseInline({ ex }: { ex: Exercise }) {
  const [value, setValue] = useState<any>(ex.type === "multi_select" ? [] : "");
  const [status, setStatus] = useState<"idle" | "ok" | "ko">("idle");

  async function check() {
    const r = await fetch("/api/exercises/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId: ex.id, userResponse: value }),
    });
    const data = await r.json();
    setStatus(data.correct ? "ok" : "ko");
  }

  function renderInput() {
    if (ex.type === "numeric" || ex.type === "fraction" || ex.type === "short_text") {
      return (
        <input
          className="border rounded px-2 py-1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tu respuesta"
        />
      );
    }
    if (ex.type === "multiple_choice") {
      return (
        <div className="space-y-2">
          {ex.choices?.map((c) => (
            <label key={c.id} className="flex gap-2 items-center">
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
    if (ex.type === "multi_select") {
      const selected: string[] = value;
      return (
        <div className="space-y-2">
          {ex.choices?.map((c) => {
            const id = String(c.id);
            const checked = selected.includes(id);
            return (
              <label key={id} className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const s = new Set(selected);
                    e.target.checked ? s.add(id) : s.delete(id);
                    setValue(Array.from(s));
                  }}
                />
                <span dangerouslySetInnerHTML={{ __html: c.label_md }} />
              </label>
            );
          })}
        </div>
      );
    }
    return null;
  }

  return (
    <div className="border rounded-lg p-4 bg-white space-y-3">
      <div className="flex items-start justify-between">
        <div dangerouslySetInnerHTML={{ __html: ex.stimulus_md }} />
        {status === "ok" && <span className="text-green-600 font-semibold">¡Correcto!</span>}
        {status === "ko" && <span className="text-red-600 font-semibold">Sigue intentando</span>}
      </div>
      {renderInput()}
      <div className="flex gap-2">
        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={check}>Comprobar</button>
      </div>
    </div>
  );
}
