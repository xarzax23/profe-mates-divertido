import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { GameFrame } from '@/components/GameFrame';
import { SelectCorrect } from '@/games/select-correct/SelectCorrect';
import { DragMatch } from '@/games/drag-match/DragMatch';
import { MemoryMatch } from '@/games/memory/MemoryMatch';
import { RobotGrid } from '@/games/robot-grid/RobotGrid';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loadActivity } from '@/lib/loadActivity';
import { Activity, ActivitySchema, SelectCorrectActivity } from '@/types/activity';
import { supabase } from '@/lib/supabase';
import { DragMatchActivity } from '@/games/drag-match/types';
import { MemoryActivity } from '@/games/memory/types';
import { RobotGridActivity } from '@/games/robot-grid/types';

export default function Play() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [startTime] = useState(Date.now());

  const configPath = searchParams.get('config') || '/activities/robot-basico.json';
  const activityId = searchParams.get('activityId');

  useEffect(() => {
    loadGameActivity();
  }, [configPath, activityId]);

  const loadGameActivity = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let loaded: Activity | null = null;
      if (activityId) {
        const { data: rows, error } = await supabase
          .from('activities')
          .select('id, type, template, title, instructions, config')
          .eq('id', activityId)
          .maybeSingle();
        if (error) throw new Error(`Supabase: ${error.message}`);
        if (!rows) throw new Error('Actividad no encontrada en SuperVis');
        const rawCfg = (rows as any).config;
        let cfg: any = {};
        if (typeof rawCfg === 'string') {
          let s = rawCfg.trim();
          try {
            cfg = JSON.parse(s);
          } catch (e1) {
            try {
              // Intento 2: CSV escapado con comillas dobles repetidas
              const s2 = s.replace(/""/g, '"');
              cfg = JSON.parse(s2);
            } catch (e2) {
              try {
                // Intento 3: quitar comillas exteriores si las hay y normalizar
                if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
                const s3 = s.replace(/""/g, '"');
                cfg = JSON.parse(s3);
              } catch (e3) {
                console.error('Error parseando config de actividad', activityId, e1, e2, e3, rawCfg);
                throw new Error(`Config inválida para actividad ${activityId}`);
              }
            }
          }
        } else if (rawCfg && typeof rawCfg === 'object') {
          cfg = rawCfg;
        }
        const merged = { id: rows.id, type: rows.type, template: rows.template, title: rows.title, instructions: rows.instructions, ...cfg } as any;
        try {
          loaded = ActivitySchema.parse(merged);
        } catch (zerr) {
          console.error('Error validando actividad con schema', activityId, zerr, merged);
          throw new Error(`Actividad no válida (${activityId})`);
        }
      } else {
        loaded = await loadActivity(configPath);
      }
      setActivity(loaded);
      // Reset game state when loading new activity
      setAttempts(0);
      setHintsUsed(0);
      setGameCompleted(false);
      setShowSolution(false);
    } catch (err) {
      console.error('Play load error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleAttempt = () => {
    setAttempts(prev => prev + 1);
  };

  const handleHintRequest = () => {
    setHintsUsed(prev => prev + 1);
  };

  const handleSuccess = () => {
    setGameCompleted(true);
  };

  const handleShowSolution = () => {
    setShowSolution(true);
  };

  const handleSolutionShown = () => {
    setShowSolution(false);
  };

  const handleNext = () => {
    // For demo purposes, reload the same activity
    // In a real app, this would load the next activity
    loadGameActivity();
  };

  const handleRestart = () => {
    loadGameActivity();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-fun flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <RefreshCw className="w-12 h-12 text-primary mx-auto animate-spin" />
          <p className="text-lg font-semibold text-primary">
            Cargando actividad...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-fun flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Alert className="border-destructive bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {error}
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button onClick={handleGoHome} variant="outline" className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
            <Button onClick={loadGameActivity} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!activity) {
    return null;
  }

  return (
    <GameFrame
      activity={activity}
      attempts={attempts}
      hintsUsed={hintsUsed}
      onHintRequest={handleHintRequest}
      onShowSolution={handleShowSolution}
      onNext={handleNext}
      showNext={gameCompleted}
      enableTimer={false}
      startTime={startTime}
    >
      <div className="space-y-6">
        {/* Game Controls */}
        <div className="flex justify-between items-center">
          <Button 
            onClick={handleGoHome} 
            variant="ghost" 
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Inicio
          </Button>
          
          <Button 
            onClick={handleRestart} 
            variant="outline" 
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reiniciar
          </Button>
        </div>

        {/* Game Component - Render based on template */}
        {activity.template === 'select-correct' ? (
          <SelectCorrect
            activity={activity as SelectCorrectActivity}
            onSuccess={handleSuccess}
            onAttempt={handleAttempt}
            onHintUsed={handleHintRequest}
            hintsUsed={hintsUsed}
            attempts={attempts}
            showSolution={showSolution}
            onSolutionShown={handleSolutionShown}
          />
        ) : activity.template === 'drag-match' ? (
          <DragMatch
            activity={activity as DragMatchActivity}
            onSuccess={handleSuccess}
            onAttempt={handleAttempt}
            onHintUsed={handleHintRequest}
            hintsUsed={hintsUsed}
            attempts={attempts}
            showSolution={showSolution}
            onSolutionShown={handleSolutionShown}
          />
        ) : activity.template === 'memory' ? (
          <MemoryMatch
            activity={activity as MemoryActivity}
            onSuccess={handleSuccess}
            onAttempt={handleAttempt}
            onHintUsed={handleHintRequest}
            hintsUsed={hintsUsed}
            attempts={attempts}
            showSolution={showSolution}
            onSolutionShown={handleSolutionShown}
          />
        ) : activity.template === 'robot-grid' ? (
          <RobotGrid
            activity={activity as RobotGridActivity}
            onSuccess={handleSuccess}
            onAttempt={handleAttempt}
            onHintUsed={handleHintRequest}
            hintsUsed={hintsUsed}
            attempts={attempts}
            showSolution={showSolution}
            onSolutionShown={handleSolutionShown}
          />
        ) : (
          <div className="text-center p-8">
            <p className="text-destructive">Tipo de juego no reconocido: {(activity as any).template}</p>
          </div>
        )}
      </div>
    </GameFrame>
  );
}
