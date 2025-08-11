import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CourseGrid() {
  const grades = [1,2,3,4,5,6];
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {grades.map((g) => (
        <Card key={g} className="group hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>{g}º de Primaria</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Temas, lecciones y práctica.</p>
            <Button asChild variant="default" className="group-hover:translate-x-0.5 transition-transform">
              <Link to={`/cursos/${g}`}>Ver temas</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
