// Juegos (UI inspirada en pop-and-learn)
// Conserva rutas existentes: /game/select-correct, /game/drag-match, /game/memory
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Puzzle, Shapes, Brain } from 'lucide-react';

export default function Games() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);

  const cards = [
    {
      key: 'select-correct',
      title: 'Selecciona la Correcta',
      description: 'Elige la opción correcta según la consigna.',
      route: '/play?config=/activities/demo.json',
      icon: Puzzle,
      accent: 'from-blue-500/15 to-blue-500/5',
      ring: 'ring-blue-400/40',
    },
    {
      key: 'drag-match',
      title: 'Arrastra y Empareja',
      description: 'Empareja elementos arrastrando o tocando.',
      route: '/play?config=/activities/drag-num-cant.json',
      icon: Shapes,
      accent: 'from-emerald-500/15 to-emerald-500/5',
      ring: 'ring-emerald-400/40',
    },
    {
      key: 'memory',
      title: 'Memory (Cartas)',
      description: 'Encuentra parejas: vocabulario, mates y más.',
      route: '/play?config=/activities/memory-vocab.json',
      icon: Brain,
      accent: 'from-fuchsia-500/15 to-fuchsia-500/5',
      ring: 'ring-fuchsia-400/40',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="mx-auto max-w-6xl px-6 pt-8">
            <div className="h-32 rounded-3xl bg-gradient-to-r from-sky-400/20 via-fuchsia-400/10 to-emerald-400/20 blur-2xl" />
          </div>
        </div>
        <header className="mx-auto max-w-6xl px-6 pt-12 pb-4">
          <div className="flex items-center gap-3 text-primary">
            <Gamepad2 className="w-6 h-6" />
            <h1 className="text-3xl font-bold tracking-tight">Juegos interactivos</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Aprende practicando con minijuegos cortos y visuales. Ideales para primaria y secundaria.
          </p>
        </header>
      </div>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(({ key, title, description, route, icon:Icon, accent, ring }) => (
            <motion.button
              key={key}
              onClick={() => navigate(route)}
              onHoverStart={() => setHovered(key)}
              onHoverEnd={() => setHovered(null)}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`group relative overflow-hidden rounded-2xl bg-card text-card-foreground p-6 shadow-lg ring-1 ring-black/5 transition`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} />
              <div className="relative flex items-start gap-4">
                <div className={`rounded-xl p-3 bg-background/70 ring-1 ${ring}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm font-medium text-primary opacity-90 group-hover:opacity-100 transition">
                  Empezar
                </div>
                <motion.div
                  initial={false}
                  animate={{ x: hovered === key ? 4 : 0 }}
                  className="text-primary"
                >
                  →
                </motion.div>
              </div>
            </motion.button>
          ))}
        </div>

        <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl p-6 ring-1 ring-black/5 bg-card/80 backdrop-blur"
          >
            <h4 className="font-semibold mb-2">¿Cómo funcionan?</h4>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
              <li>Duración 1–2 minutos por juego.</li>
              <li>Pistas progresivas y modo padre con PIN.</li>
              <li>Guardado de progreso local (y Supabase opcional).</li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-6 ring-1 ring-black/5 bg-card/80 backdrop-blur"
          >
            <h4 className="font-semibold mb-2">Sugerencias</h4>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
              <li>Usa pantalla completa para mayor foco.</li>
              <li>Activa el sonido si el juego tiene audio.</li>
              <li>En secundaria, sube la dificultad en la configuración.</li>
            </ul>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
