
import { SEO } from "@/components/seo/SEO";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, BookOpen, Target } from "lucide-react";

export default function Courses() {
  return (
    <main className="min-h-screen bg-slate-50">
      <SEO title="Cursos de Primaria | ProfeMates" description="Explora nuestro catálogo completo de cursos de matemáticas para 1º a 6º de Primaria." />
      
      {/* Header Section */}
      <section className="bg-white border-b border-slate-200 py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center space-y-4 mb-8">
            <div className="flex justify-center">
              <Badge variant="secondary" className="bg-brand-50 text-brand-700 border-brand-200">
                <BookOpen className="mr-1 h-3 w-3" />
                6 cursos disponibles
              </Badge>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 lg:text-5xl">
              Cursos de matemáticas
            </h1>
            <p className="text-lg text-slate-600 font-body max-w-2xl mx-auto">
              Encuentra el curso perfecto para tu nivel. Desde conceptos básicos hasta temas avanzados, 
              tenemos todo lo que necesitas para dominar las matemáticas.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Buscar por grado o tema..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">Elige tu curso</h2>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Target className="h-4 w-4" />
              <span>Recomendado para ti</span>
            </div>
          </div>
          <CourseGrid />
        </div>
      </section>

      {/* Help Section */}
      <section className="bg-white border-t border-slate-200 py-12">
        <div className="mx-auto max-w-4xl px-4 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl font-semibold text-slate-900">
            ¿No estás seguro por dónde empezar?
          </h2>
          <p className="text-slate-600 font-body">
            Nuestro tutor IA puede ayudarte a encontrar el curso perfecto para tu nivel
          </p>
          <Button className="bg-brand-600 hover:bg-brand-700 text-white font-medium">
            Hablar con el tutor
          </Button>
        </div>
      </section>
    </main>
  );
}
