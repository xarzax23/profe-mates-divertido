import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import confetti from 'canvas-confetti';
import { MemoryActivity, MemoryCard } from './types';
import { saveProgress } from '../../lib/progress';
import { toast } from '../../hooks/use-toast';

interface MemoryMatchProps {
  activity: MemoryActivity;
  onSuccess: () => void;
  onAttempt: () => void;
  onHintUsed: () => void;
  hintsUsed: number;
  attempts: number;
  showSolution: boolean;
  onSolutionShown: () => void;
}

export function MemoryMatch({
  activity,
  onSuccess,
  onAttempt,
  onHintUsed,
  hintsUsed,
  attempts,
  showSolution,
  onSolutionShown
}: MemoryMatchProps) {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matches, setMatches] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [isGameCompleted, setIsGameCompleted] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [focusedCardIndex, setFocusedCardIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  const audioRefs = useRef<Map<string, Howl>>(new Map());
  const flipTimeoutRef = useRef<NodeJS.Timeout>();
  const previewTimeoutRef = useRef<NodeJS.Timeout>();
  const solutionTimeoutRef = useRef<NodeJS.Timeout>();
  const totalPairs = activity.cards.length / 2;

  // Initialize game
  useEffect(() => {
    initializeGame();
    return () => {
      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
      if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
      if (solutionTimeoutRef.current) clearTimeout(solutionTimeoutRef.current);
    };
  }, [activity]);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || isGameCompleted) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev <= 1) {
          handleGameEnd(false);
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isGameCompleted]);

  // Solution mode effect
  useEffect(() => {
    if (showSolution && !isGameCompleted) {
      setCards(prev => prev.map(card => ({ ...card, isFlipped: true })));
      
      solutionTimeoutRef.current = setTimeout(() => {
        setCards(prev => prev.map(card => 
          card.isMatched ? card : { ...card, isFlipped: false }
        ));
        onSolutionShown();
      }, 2000);
    }
  }, [showSolution, isGameCompleted, onSolutionShown]);

  const initializeGame = () => {
    let initialCards: MemoryCard[] = activity.cards.map(card => ({
      ...card,
      isFlipped: false,
      isMatched: false,
      isSelected: false
    }));

    // Shuffle cards if enabled
    if (activity.rules?.shuffle !== false) {
      initialCards = shuffleArray(initialCards);
    }

    setCards(initialCards);
    setFlippedCards([]);
    setMatches(0);
    setMistakes(0);
    setIsGameCompleted(false);
    setIsPreviewMode(false);
    setFocusedCardIndex(0);

    // Set timer if specified
    if (activity.rules?.timeLimitSeconds && activity.rules.timeLimitSeconds > 0) {
      setTimeLeft(activity.rules.timeLimitSeconds);
    }

    // Start preview if specified
    if (activity.rules?.previewMs && activity.rules.previewMs > 0) {
      setIsPreviewMode(true);
      setCards(prev => prev.map(card => ({ ...card, isFlipped: true })));
      
      previewTimeoutRef.current = setTimeout(() => {
        setCards(prev => prev.map(card => ({ ...card, isFlipped: false })));
        setIsPreviewMode(false);
      }, activity.rules.previewMs);
    }

    // Preload audio files
    activity.cards.forEach(card => {
      if (card.face.audio && !audioRefs.current.has(card.face.audio)) {
        const sound = new Howl({ src: [card.face.audio] });
        audioRefs.current.set(card.face.audio, sound);
      }
    });
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const playAudio = (audioUrl: string) => {
    const sound = audioRefs.current.get(audioUrl);
    if (sound) {
      sound.play();
    }
  };

  const handleCardClick = (cardId: string) => {
    if (isPreviewMode || isGameCompleted || showSolution) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    if (flippedCards.length === 2) return;

    // Play audio if available
    if (card.face.audio) {
      playAudio(card.face.audio);
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    if (newFlippedCards.length === 2) {
      onAttempt();
      checkMatch(newFlippedCards);
    }
  };

  const checkMatch = (flippedCardIds: string[]) => {
    const [card1, card2] = flippedCardIds.map(id => 
      cards.find(c => c.id === id)!
    );

    if (card1.key === card2.key) {
      // Match found
      setCards(prev => prev.map(c => 
        flippedCardIds.includes(c.id) 
          ? { ...c, isMatched: true }
          : c
      ));
      
      const newMatches = matches + 1;
      setMatches(newMatches);
      setFlippedCards([]);

      // Show feedback
      const correctFeedback = activity.feedback?.correct || ['¡Bien!'];
      toast({
        title: correctFeedback[Math.floor(Math.random() * correctFeedback.length)],
        duration: 1500,
      });

      // Check if game is completed
      if (newMatches === totalPairs) {
        handleGameEnd(true);
      }
    } else {
      // No match
      setMistakes(prev => prev + 1);
      
      const incorrectFeedback = activity.feedback?.incorrect || ['Intenta recordar su posición.'];
      toast({
        title: incorrectFeedback[Math.floor(Math.random() * incorrectFeedback.length)],
        variant: 'destructive',
        duration: 1500,
      });

      // Flip cards back after delay
      flipTimeoutRef.current = setTimeout(() => {
        setCards(prev => prev.map(c => 
          flippedCardIds.includes(c.id) 
            ? { ...c, isFlipped: false }
            : c
        ));
        setFlippedCards([]);
      }, 900);
    }
  };

  const handleGameEnd = (success: boolean) => {
    if (isGameCompleted) return;
    
    setIsGameCompleted(true);
    
    if (success) {
      onSuccess();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      const completeFeedback = activity.feedback?.complete || ['¡Completado!'];
      toast({
        title: completeFeedback[Math.floor(Math.random() * completeFeedback.length)],
        duration: 3000,
      });

      // Calculate star rating
      const totalAttempts = attempts;
      let starRating = 1;
      if (activity.rules?.scoring?.threeStarsAttempts && totalAttempts <= activity.rules.scoring.threeStarsAttempts) {
        starRating = 3;
      } else if (activity.rules?.scoring?.twoStarsAttempts && totalAttempts <= activity.rules.scoring.twoStarsAttempts) {
        starRating = 2;
      }

      // Save progress
      const progress = {
        activityId: activity.id,
        attempts: totalAttempts,
        matches,
        mistakes,
        hintsUsed,
        success: true,
        elapsedMs: Date.now() - Date.now(), // This should come from GameFrame
        starRating,
        timestamp: Date.now()
      };
      
      saveProgress(progress);
    }
  };

  const handleHint = useCallback(() => {
    if (hintsUsed >= 3 || isGameCompleted) return;
    
    onHintUsed();
    
    // Find an unmatched pair
    const unmatchedCards = cards.filter(card => !card.isMatched);
    const availableKeys = [...new Set(unmatchedCards.map(card => card.key))];
    
    if (availableKeys.length > 0) {
      const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
      const pairCards = unmatchedCards.filter(card => card.key === randomKey);
      
      if (pairCards.length >= 2) {
        const cardsToReveal = pairCards.slice(0, 2);
        
        // Temporarily reveal the pair
        setCards(prev => prev.map(card => 
          cardsToReveal.some(c => c.id === card.id)
            ? { ...card, isFlipped: true, isSelected: true }
            : card
        ));
        
        // Hide them again after 1200ms
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            cardsToReveal.some(c => c.id === card.id) && !card.isMatched
              ? { ...card, isFlipped: false, isSelected: false }
              : { ...card, isSelected: false }
          ));
        }, 1200);
        
        // Show hint message
        const hintMessage = activity.hints?.[Math.min(hintsUsed, activity.hints.length - 1)] || 'Observa esta pareja';
        toast({
          title: 'Pista',
          description: hintMessage,
          duration: 2000,
        });
      }
    }
  }, [activity, cards, hintsUsed, isGameCompleted, onHintUsed]);

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isPreviewMode || isGameCompleted) return;
    
    const gridCols = activity.rules?.grid?.cols || Math.ceil(Math.sqrt(cards.length));
    const totalCards = cards.length;
    
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        setFocusedCardIndex(prev => (prev + 1) % totalCards);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        setFocusedCardIndex(prev => (prev - 1 + totalCards) % totalCards);
        break;
      case 'ArrowDown':
        event.preventDefault();
        setFocusedCardIndex(prev => (prev + gridCols) % totalCards);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedCardIndex(prev => (prev - gridCols + totalCards) % totalCards);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleCardClick(cards[focusedCardIndex].id);
        break;
    }
  };

  // Calculate grid dimensions
  const gridCols = activity.rules?.grid?.cols || Math.ceil(Math.sqrt(cards.length));
  const gridRows = activity.rules?.grid?.rows || Math.ceil(cards.length / gridCols);

  return (
    <div 
      className="space-y-6"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label="Juego de memoria"
    >
      {/* Game Info */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Parejas: {matches}/{totalPairs}</span>
        <span>Errores: {mistakes}</span>
        {timeLeft !== null && (
          <span className={timeLeft <= 10 ? 'text-destructive font-bold' : ''}>
            Tiempo: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        )}
      </div>

      {/* Cards Grid */}
      <div 
        className="grid gap-3 mx-auto max-w-4xl"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`
        }}
      >
        <AnimatePresence>
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="aspect-square"
            >
              <motion.button
                whileHover={{ scale: card.isFlipped || card.isMatched ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isFlipped || card.isMatched || isPreviewMode || flippedCards.length === 2}
                className={`
                  relative w-full h-full rounded-xl border-2 transition-all duration-200
                  ${card.isMatched 
                    ? 'border-success bg-success/10 cursor-default' 
                    : card.isFlipped 
                      ? 'border-primary bg-primary/10' 
                      : 'border-muted-foreground/20 bg-card hover:border-primary/50'
                  }
                  ${index === focusedCardIndex ? 'ring-2 ring-primary ring-offset-2' : ''}
                  ${card.isSelected ? 'ring-2 ring-warning ring-offset-2' : ''}
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                `}
                aria-label={card.isFlipped || card.isMatched ? 
                  (card.face.label || 'Carta volteada') : 
                  'Carta boca abajo'
                }
              >
                <motion.div
                  animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full [transform-style:preserve-3d]"
                >
                  {/* Card Back */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center [backface-visibility:hidden]">
                    <div className="text-4xl opacity-50">?</div>
                  </div>
                  
                  {/* Card Front */}
                  <div className="absolute inset-0 rounded-xl bg-background flex flex-col items-center justify-center p-2 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    {card.face.image && (
                      <img 
                        src={card.face.image} 
                        alt={card.face.label || 'Imagen de carta'}
                        className="max-w-full max-h-3/5 object-contain mb-1"
                      />
                    )}
                    {card.face.label && (
                      <span className="text-sm font-medium text-center break-words">
                        {card.face.label}
                      </span>
                    )}
                  </div>
                </motion.div>
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Game Status */}
      {isPreviewMode && (
        <div className="text-center text-primary font-medium">
          Memoriza las cartas...
        </div>
      )}
    </div>
  );
}