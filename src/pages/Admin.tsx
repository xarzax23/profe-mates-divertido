import { useEffect, useState } from "react";
import { SEO } from "@/components/seo/SEO";
// import { mockCourses } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");

  const [grade, setGrade] = useState<string>("1");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [markdown, setMarkdown] = useState("# Nueva lección\n\nContenido en Markdown...");

  useEffect(() => {
    setAuthed(localStorage.getItem("pmates_admin") === "1");
  }, []);

  const login = () => {
    // TODO: reemplazar por verificación con variable de entorno y backend
    if (password === "admin123") { // placeholder
      localStorage.setItem("pmates_admin", "1");
      setAuthed(true);
    } else {
      toast.error("Contraseña incorrecta");
    }
  };

  const addLesson = () => {
    const g = Number(grade);
  // const course = mockCourses.find(c => c.grade === g);
  // (mock logic removed)
    setTitle(""); setSlug(""); setMarkdown("# Nueva lección\n\nContenido en Markdown...");
  // toast.success("Lección añadida (mock)");
  };

  if (!authed) {
    return (
      <main className="container py-8 space-y-6">
  <SEO title="Admin | Profe Mates" description="Panel simple para gestionar temario." />
        <h1 className="text-3xl font-bold">Acceso Admin</h1>
        <div className="max-w-sm grid gap-2">
          <Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Contraseña" aria-label="Contraseña de administrador" />
          <Button onClick={login}>Entrar</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-8 space-y-6">
  <SEO title="Admin | Profe Mates" description="Cargar temario y gestionar preguntas." />
  <h1 className="text-3xl font-bold">Admin simple</h1>
      <section className="grid gap-4 max-w-2xl">
        <div className="grid gap-2">
          <label className="text-sm">Curso</label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger><SelectValue placeholder="Curso" /></SelectTrigger>
            <SelectContent>
              {[1,2,3,4,5,6].map(g => <SelectItem key={g} value={String(g)}>{g}º</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Título</label>
          <Input value={title} onChange={(e)=>setTitle(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Slug</label>
          <Input value={slug} onChange={(e)=>setSlug(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Markdown</label>
          <Textarea value={markdown} onChange={(e)=>setMarkdown(e.target.value)} className="min-h-[200px]" />
        </div>
        <Button onClick={addLesson}>Guardar</Button>
  <p className="text-xs text-muted-foreground">Nota: Este panel requiere integración real con Supabase para persistencia.</p>
      </section>
    </main>
  );
}
