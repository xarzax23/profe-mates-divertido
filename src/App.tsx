import Home from "@/pages/HomeNew";
import { Link, Route, Routes } from "react-router-dom";
import Play from "@/pages/Play";
import Lecciones from "./pages/Lecciones";
import CourseView from "./pages/CourseView";
import Tutor from "./pages/Tutor";
import Games from "./pages/Games";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="max-w-5xl mx-auto p-4 flex items-center gap-4">
          <Link to="/" className="font-bold">Profe Mates</Link>
          <nav className="flex gap-4">
            <Link className="text-blue-600 underline" to="/lecciones">Lecciones</Link>
            <Link className="text-blue-600 underline" to="/games">Juegos</Link>
            <Link className="text-blue-600 underline" to="/tutor">Tutor</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lecciones" element={<Lecciones />} />
          <Route path="/cursos/:grade/:topic" element={<CourseView />} />
          <Route path="/tutor" element={<Tutor />} />
          <Route path="/games" element={<Games />} />
          <Route path="/play" element={<Play />} />
          <Route path="*" element={<div>Página no encontrada.</div>} />
        </Routes>
      </main>
    </div>
  );
}