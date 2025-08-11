import { Link, NavLink } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/store/useAppStore";

const navLinkBase = "px-3 py-2 rounded-md text-sm font-medium hover:bg-accent transition";

export default function Navbar() {
  const highContrast = useAppStore(s => s.highContrast);
  const setHighContrast = useAppStore(s => s.setHighContrast);

  return (
    <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <nav className="container flex items-center justify-between h-14">
        <Link to="/" className="font-semibold tracking-tight">
          Profe Mates Primaria
        </Link>
        <div className="flex items-center gap-2" aria-label="Navegación principal">
          <NavLink to="/cursos" className={({isActive}) => `${navLinkBase} ${isActive? 'bg-accent' : ''}`}>Cursos</NavLink>
          <NavLink to="/profe" className={({isActive}) => `${navLinkBase} ${isActive? 'bg-accent' : ''}`}>Preguntar</NavLink>
          <NavLink to="/videos" className={({isActive}) => `${navLinkBase} ${isActive? 'bg-accent' : ''}`}>Vídeos</NavLink>
          <NavLink to="/admin" className={({isActive}) => `${navLinkBase} ${isActive? 'bg-accent' : ''}`}>Admin</NavLink>
          <div className="flex items-center gap-2 ml-3" role="group" aria-label="Opciones de accesibilidad">
            <span className="text-xs">Alto contraste</span>
            <Switch checked={highContrast} onCheckedChange={setHighContrast} aria-label="Activar alto contraste" />
          </div>
        </div>
      </nav>
    </header>
  );
}
