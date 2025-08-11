
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { BookOpen, Clock, Star, Users } from "lucide-react";

export function CourseGrid() {
  const grades = [1,2,3,4,5,6];
  
  const getCourseInfo = (grade: number) => ({
    lessons: Math.floor(Math.random() * 20) + 15,
    duration: `${Math.floor(Math.random() * 10) + 8} semanas`,
    students: `${Math.floor(Math.random() * 500) + 200}+`,
    difficulty: grade <= 2 ? 'Básico' : grade <= 4 ? 'Intermedio' : 'Avanzado',
    progress: Math.floor(Math.random() * 100),
    rating: (4.5 + Math.random() * 0.4).toFixed(1)
  });

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {grades.map((grade) => {
        const info = getCourseInfo(grade);
        return (
          <Card key={grade} className="course-card group overflow-hidden border-slate-200 hover:shadow-xl hover:border-brand-200 transition-all duration-200">
            {/* Course Image */}
            <div className="relative h-48 bg-gradient-to-br from-brand-100 via-brand-200 to-brand-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-brand-600/20 to-transparent" />
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="bg-white/90 text-brand-700 font-medium">
                  {info.difficulty}
                </Badge>
              </div>
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 rounded-full px-2 py-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium text-slate-700">{info.rating}</span>
              </div>
              {/* Decorative Math Elements */}
              <div className="absolute bottom-4 left-4 text-brand-600 font-bold text-4xl opacity-20">
                {grade}º
              </div>
            </div>

            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-slate-900 group-hover:text-brand-700 transition-colors">
                {grade}º de Primaria
              </CardTitle>
              <p className="text-sm text-slate-600 font-body">
                Matemáticas completas para {grade}º grado con ejercicios prácticos y evaluaciones.
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Course Stats */}
              <div className="grid grid-cols-3 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  <span>{info.lessons} lecciones</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{info.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{info.students}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Progreso</span>
                  <span className="font-medium text-slate-900">{info.progress}%</span>
                </div>
                <Progress value={info.progress} className="h-2" />
              </div>

              {/* CTA Button */}
              <Button 
                asChild 
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium group-hover:translate-y-[-1px] transition-all duration-200"
              >
                <Link to={`/cursos/${grade}`}>
                  {info.progress > 0 ? 'Continuar' : 'Comenzar'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
