import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Settings, Gamepad2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [configUrl, setConfigUrl] = useState('');
  const navigate = useNavigate();

  const handlePlayDemo = () => {
    navigate('/play?config=/activities/robot-basico.json');
  };

  const handleLoadConfig = () => {
    if (configUrl.trim()) {
      navigate(`/play?config=${encodeURIComponent(configUrl.trim())}`);
    }
  };

  const presetActivities = [
    {
      title: 'Robot Básico',
      description: 'Programa el robot para llegar a la meta',
      config: '/activities/robot-basico.json',
      icon: '🤖',
      type: 'Robot Grid'
    },
    {
      title: 'Robot con Condiciones',
      description: 'Usa IF para recoger monedas y evitar obstáculos',
      config: '/activities/robot-condicion.json',
      icon: '🤖',
      type: 'Robot Grid'
    },
    {
      title: 'Memory: Vocabulario Inglés',
      description: 'Empareja palabras con frutas',
      config: '/activities/memory-vocab.json',
      icon: '🍎',
      type: 'Memory / Cartas'
    },
    {
      title: 'Drag: Números y Cantidades',
      description: 'Arrastra números a sus cantidades',
      config: '/activities/drag-num-cant.json',
      icon: '🔢',
      type: 'Arrastrar y Unir'
    },
    {
      title: 'Tap: Reconocimiento de Números',
      description: 'Identifica el número correcto',
      config: '/activities/demo.json',
      icon: '7️⃣',
      type: 'Seleccionar'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-fun">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="inline-block p-6 bg-gradient-primary rounded-full mb-6"
          >
            <Gamepad2 className="w-16 h-16 text-primary-foreground" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-primary text-shadow-lg mb-4">
            Robot Grid
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Programa un robot usando bloques de comandos. Aprende programación con drag & drop, bucles y condiciones.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Quick Start */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="game-card">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <h2 className="text-2xl font-bold text-primary">
                    ¡Comienza a Jugar!
                  </h2>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={handlePlayDemo}
                      size="lg"
                      className="bg-gradient-primary hover:shadow-button text-lg px-8 py-6"
                    >
                      <Play className="w-6 h-6 mr-3" />
                      Jugar Demo
                    </Button>
                  </motion.div>

                  <div className="border-t pt-6">
                    <p className="text-sm text-muted-foreground mb-4">
                      ¿Tienes una configuración personalizada? Pégala aquí:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                      <Input
                        placeholder="/activities/drag-formas.json"
                        value={configUrl}
                        onChange={(e) => setConfigUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLoadConfig()}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleLoadConfig} 
                        variant="outline"
                        disabled={!configUrl.trim()}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Cargar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preset Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-primary text-center mb-6">
              Actividades Disponibles
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {presetActivities.map((activity, index) => (
                <motion.div
                  key={activity.config}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => navigate(`/play?config=${activity.config}`)}
                >
                  <Card className="game-card hover:shadow-button h-full">
                    <CardContent className="p-6 text-center space-y-4 h-full flex flex-col">
                      <div className="text-4xl mb-3">
                        {activity.icon}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="text-xs font-medium text-primary/70 uppercase tracking-wide">
                          {activity.type}
                        </div>
                        <h3 className="text-lg font-semibold text-primary">
                          {activity.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                      <Button variant="outline" className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Jugar
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-3">
                  ¿Cómo funciona?
                </h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>🎯 Lee las instrucciones con atención</p>
                  <p>🖱️ Arrastra elementos o toca para seleccionar</p>
                  <p>💡 Usa pistas si necesitas ayuda</p>
                  <p>🎉 ¡Celebra cuando completes el juego!</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}