import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Lightbulb, Lock, Eye, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { useAppMode } from '@/store/appMode';
import { Activity } from '@/types/activity';
import confetti from 'canvas-confetti';

interface GameFrameProps {
  activity: Activity;
  children: React.ReactNode;
  attempts: number;
  hintsUsed: number;
  onHintRequest: () => void;
  onShowSolution?: () => void;
  onNext?: () => void;
  showNext?: boolean;
  enableTimer?: boolean;
  startTime?: number;
}

export function GameFrame({ 
  activity, 
  children, 
  attempts, 
  hintsUsed, 
  onHintRequest, 
  onShowSolution,
  onNext,
  showNext = false,
  enableTimer = false,
  startTime = Date.now()
}: GameFrameProps) {
  const { isParentMode, toggleParentMode } = useAppMode();
  const [pin, setPin] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentHint, setCurrentHint] = useState<string | null>(null);

  // Timer logic
  useEffect(() => {
    if (!enableTimer) return;
    
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [enableTimer, startTime]);

  const handlePinSubmit = () => {
    const success = toggleParentMode(pin);
    if (success) {
      setPin('');
    }
  };

  const handleHintClick = () => {
    if (!activity.hints || hintsUsed >= activity.hints.length) return;
    
    const nextHint = activity.hints[hintsUsed];
    setCurrentHint(nextHint);
    onHintRequest();
    
    // Hide hint after 5 seconds
    setTimeout(() => setCurrentHint(null), 5000);
  };

  const handleSuccess = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maxHints = activity.hints?.length || 0;
  const canUseHint = hintsUsed < maxHints;

  return (
    <div className="min-h-screen bg-gradient-fun p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="game-card mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary text-shadow">
                {activity.title}
              </h1>
              {activity.instructions && (
                <p className="text-muted-foreground mt-1">
                  {activity.instructions}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              {/* Timer */}
              {enableTimer && (
                <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">{formatTime(elapsedTime)}</span>
                </div>
              )}
              
              {/* Attempts */}
              <div className="bg-muted rounded-lg px-3 py-2">
                <span className="font-semibold">Intentos: {attempts}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-2">
              {/* Hint Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleHintClick}
                disabled={!canUseHint}
                className="bg-warning hover:bg-warning/90 text-warning-foreground border-warning"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Pista ({hintsUsed}/{maxHints})
              </Button>

              {/* Parent Mode Toggle */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Lock className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      {isParentMode ? 'Modo Padre Activo' : 'Activar Modo Padre'}
                    </h3>
                    {!isParentMode ? (
                      <div className="space-y-3">
                        <Input
                          type="password"
                          placeholder="Ingresa PIN"
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
                        />
                        <Button onClick={handlePinSubmit} className="w-full">
                          Activar
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => toggleParentMode()} variant="outline">
                        Desactivar Modo Padre
                      </Button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Show Solution (Parent Mode Only) */}
              {isParentMode && onShowSolution && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShowSolution}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground border-accent"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Mostrar Solución
                </Button>
              )}
            </div>

            {/* Next Button */}
            {showNext && onNext && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="self-end sm:self-auto"
              >
                <Button 
                  onClick={onNext}
                  className="bg-gradient-success hover:shadow-lg"
                  size="lg"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Current Hint Display */}
        {currentHint && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-warning/20 border border-warning rounded-lg p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-warning mt-0.5" />
              <p className="text-warning-foreground font-medium">{currentHint}</p>
            </div>
          </motion.div>
        )}

        {/* Game Content */}
        <div className="game-card">
          {children}
        </div>
      </motion.div>
    </div>
  );
}