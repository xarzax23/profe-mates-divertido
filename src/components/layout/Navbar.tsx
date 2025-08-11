
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/store/useAppStore";
import { Search, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const navLinkBase = "px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors";

export default function Navbar() {
  const highContrast = useAppStore(s => s.highContrast);
  const setHighContrast = useAppStore(s => s.setHighContrast);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:border-slate-700 dark:bg-slate-900/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-brand-700 dark:text-brand-300">
          ProfeMates
        </Link>

        {/* Search Bar (desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar cursos, temas..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/cursos" className={({isActive}) => `${navLinkBase} ${isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : ''}`}>
            Cursos
          </NavLink>
          <NavLink to="/profe" className={({isActive}) => `${navLinkBase} ${isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : ''}`}>
            Tutor
          </NavLink>
          <NavLink to="/videos" className={({isActive}) => `${navLinkBase} ${isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : ''}`}>
            Vídeos
          </NavLink>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9"
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? 
                <Sun className="h-4 w-4" /> : 
                <Moon className="h-4 w-4" />
              }
            </Button>
          )}

          {/* High Contrast Toggle */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>Alto contraste</span>
            <Switch 
              checked={highContrast} 
              onCheckedChange={setHighContrast} 
              aria-label="Activar alto contraste" 
            />
          </div>

          {/* CTA Button */}
          <Button className="hidden sm:inline-flex bg-brand-600 hover:bg-brand-700 text-white font-medium">
            Comenzar
          </Button>

          {/* Admin Link */}
          <NavLink to="/admin" className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400">
            Admin
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
