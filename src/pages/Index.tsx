
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, MessageCircle, Video, Star, Users, Award, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Cursos estructurados",
      description: "Temario completo de 1º a 6º de Primaria con lecciones progresivas",
      href: "/cursos"
    },
    {
      icon: MessageCircle,
      title: "Tutor IA personal",
      description: "Resuelve dudas al instante con nuestro asistente inteligente",
      href: "/profe"
    },
    {
      icon: Video,
      title: "Vídeos explicativos",
      description: "Genera vídeos personalizados para cualquier tema",
      href: "/videos"
    }
  ];

  const stats = [
    { icon: Users, label: "Estudiantes activos", value: "10,000+" },
    { icon: BookOpen, label: "Lecciones disponibles", value: "500+" },
    { icon: Award, label: "Temas completados", value: "25,000+" },
  ];

  return (
    <main className="min-h-screen">
      <SEO title="ProfeMates | Aprende matemáticas de Primaria" description="Plataforma educativa para 1º-6º de Primaria: cursos estructurados, tutor IA y vídeos explicativos personalizados." />
      
      {/* Hero Section */}
      <section className="bg-hero py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-brand-50 text-brand-700 border-brand-200">
                  <Star className="mr-1 h-3 w-3" />
                  Plataforma educativa líder
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Aprende matemáticas con tu{" "}
                  <span className="text-brand-600">profe digital</span>
                </h1>
                <p className="text-lg text-slate-600 font-body max-w-2xl">
                  Temario completo de 1º a 6º de Primaria con lecciones interactivas, 
                  tutor IA personalizado y vídeos explicativos bajo demanda.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-brand-600 hover:bg-brand-700 text-white font-semibold group" asChild>
                  <Link to="/cursos">
                    Explorar cursos
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="font-semibold border-brand-300 text-brand-700 hover:bg-brand-50" asChild>
                  <Link to="/profe">Preguntar al tutor</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-brand-200">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="flex justify-center mb-2">
                      <stat.icon className="h-6 w-6 text-brand-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 p-8 shadow-xl">
                <div className="flex h-full items-center justify-center">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="h-8 w-20 rounded bg-brand-300/50"></div>
                      <div className="h-6 w-16 rounded bg-brand-400/50"></div>
                      <div className="h-4 w-12 rounded bg-brand-500/50"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-6 w-18 rounded bg-brand-400/50"></div>
                      <div className="h-8 w-24 rounded bg-brand-300/50"></div>
                      <div className="h-5 w-14 rounded bg-brand-500/50"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold text-slate-900 lg:text-4xl">
              Todo lo que necesitas para aprender
            </h2>
            <p className="text-lg text-slate-600 font-body max-w-2xl mx-auto">
              Una plataforma completa diseñada específicamente para estudiantes de Primaria
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="course-card group border-slate-200 hover:shadow-lg hover:border-brand-200 transition-all duration-200">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                    <feature.icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-slate-600 font-body mb-6">
                    {feature.description}
                  </CardDescription>
                  <Button variant="ghost" className="text-brand-600 hover:text-brand-700 hover:bg-brand-50 font-medium group" asChild>
                    <Link to={feature.href}>
                      Comenzar
                      <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl font-bold text-slate-900 lg:text-4xl">
            ¿Listo para empezar tu aventura matemática?
          </h2>
          <p className="text-lg text-slate-600 font-body">
            Únete a miles de estudiantes que ya están aprendiendo con ProfeMates
          </p>
          <Button size="lg" className="bg-brand-600 hover:bg-brand-700 text-white font-semibold" asChild>
            <Link to="/cursos">Comenzar ahora gratis</Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Index;
