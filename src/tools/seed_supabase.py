import argparse, json, os, sys, time
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from supabase import create_client, Client

# -----------------------------
# Config & helpers
# -----------------------------
def load_env() -> None:
    # Carga .env.seeder primero; si no existe, intenta .env
    if Path(".env.seeder").exists():
        load_dotenv(".env.seeder", override=True)
    elif Path(".env").exists():
        load_dotenv(".env", override=True)

def get_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    if not url or not key:
        print("❌ Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY (o ANON). Revisa .env.seeder", file=sys.stderr)
        sys.exit(1)
    return create_client(url, key)

def read_json(path: Path) -> Dict[str, Any]:
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ JSON inválido en {path}: {e}", file=sys.stderr)
        sys.exit(1)

def ensure_str_list(x: Any) -> Optional[List[str]]:
    if x is None:
        return None
    if isinstance(x, list):
        return [str(i) for i in x]
    return None

# -----------------------------
# Upsert logic
# -----------------------------
def upsert_lesson(sb: Client, lesson: Dict[str, Any]) -> str:
    """
    Crea/actualiza una fila en lessons y devuelve su id.
    Unicidad por (grade, topic_slug). No se asume 'id' en el JSON.
    """
    grade = int(lesson["grade"])
    slug = str(lesson["topic_slug"])
    # ¿Existe ya?
    sel = sb.table("lessons").select("id").eq("grade", grade).eq("topic_slug", slug).maybe_single().execute()
    existing = (sel.data or None)
    row = {
        "grade": grade,
        "topic_slug": slug,
        "title": lesson.get("title", "").strip(),
        "concept_md": lesson.get("concept_md", ""),
        "worked_example_prompt_md": lesson.get("worked_example_prompt_md", ""),
        "worked_example_steps_md": ensure_str_list(lesson.get("worked_example_steps_md")) or [],
    }
    if existing:
        lid = existing["id"]
        sb.table("lessons").update(row).eq("id", lid).execute()
        return lid
    else:
        ins = sb.table("lessons").insert(row).select("id").single().execute()
        return ins.data["id"]

def insert_exercises(sb: Client, lesson_id: str, exercises: List[Dict[str, Any]]) -> int:
    """
    Inserta (o reemplaza) ejercicios de una lección.
    Estrategia simple: borra los ejercicios existentes de la lección y vuelve a insertar.
    Si prefieres 'upsert', puedes ajustarlo a tus claves únicas.
    """
    # Borra existentes de esa lección para mantener el orden tal como llega el JSON
    sb.table("exercises").delete().eq("lesson_id", lesson_id).execute()

    rows = []
    for idx, ex in enumerate(exercises, start=1):
        rows.append({
            "lesson_id": lesson_id,
            "ex_order": idx,
            "type": ex["type"],
            "stimulus_md": ex.get("stimulus_md", ""),
            "choices": ex.get("choices"),           # lista de objetos o None
            "answer": ex.get("answer"),             # string o None
            "validators": ex.get("validators"),     # objeto o None
            "hints": ex.get("hints") or [],         # lista de strings o []
        })
    if rows:
        sb.table("exercises").insert(rows).execute()
    return len(rows)

# -----------------------------
# Main
# -----------------------------
def main():
    parser = argparse.ArgumentParser(description="Seed Supabase with JSON per course")
    parser.add_argument("files", nargs="+", help="Rutas a cursoX.json (uno o varios)")
    parser.add_argument("--dry-run", action="store_true", help="No inserta nada; solo valida y muestra resumen")
    args = parser.parse_args()

    load_env()
    sb = get_client()

    total_lessons, total_exercises = 0, 0

    for file_path in args.files:
        path = Path(file_path)
        if not path.exists():
            print(f"❌ No existe: {path}", file=sys.stderr)
            sys.exit(1)

        data = read_json(path)
        grade = data.get("grade")
        lessons = data.get("lessons", [])

        if grade is None or not isinstance(grade, int):
            print(f"❌ {path}: 'grade' debe ser un entero", file=sys.stderr)
            sys.exit(1)

        if not isinstance(lessons, list) or not lessons:
            print(f"⚠️ {path}: no hay 'lessons' que procesar")
            continue

        print(f"▶ Procesando {path.name} (grade={grade}) - {len(lessons)} lecciones")

        for L in lessons:
            # Asegura coherencia
            L["grade"] = int(L.get("grade", grade))

            if args.dry_run:
                # Validación ligera
                if "topic_slug" not in L:
                    print(f"❌ Lección sin 'topic_slug' en {path.name}", file=sys.stderr)
                    sys.exit(1)
                if "exercises" not in L or not isinstance(L["exercises"], list):
                    print(f"❌ Lección {L.get('topic_slug')} sin 'exercises' lista", file=sys.stderr)
                    sys.exit(1)
                total_lessons += 1
                total_exercises += len(L["exercises"])
                continue

            # Inserta/actualiza lección
            lid = upsert_lesson(sb, L)
            # Inserta ejercicios (reemplazando los existentes)
            n = insert_exercises(sb, lid, L.get("exercises", []))
            total_lessons += 1
            total_exercises += n

            print(f"   • {L['topic_slug']}  → {n} ejercicios")

        # Pequeña pausa para no saturar
        time.sleep(0.2)

    print("\n✅ Hecho.")
    print(f"   Lecciones:  {total_lessons}")
    print(f"   Ejercicios: {total_exercises}")

if __name__ == "__main__":
    main()
