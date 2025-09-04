import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SelectCorrectActivity, Choice } from '../../types/activity';
import { saveProgress } from '../../lib/progress';
import confetti from 'canvas-confetti';

interface SelectCorrectProps {
  activity: SelectCorrectActivity;
  onSuccess: () => void;
  onAttempt: () => void;
  onHintUsed: () => void;
  hintsUsed: number;
  attempts: number;
  showSolution?: boolean;
  onSolutionShown?: () => void;
}

export function SelectCorrect({ 
  activity, 
  onSuccess, 
  onAttempt, 
  hintsUsed,
  attempts,
  showSolution = false,
  onSolutionShown
}: SelectCorrectProps) {
  const [choices, setChoices] = useState<Choice[]>([]);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [startTime] = useState(Date.now());
  const [gameCompleted, setGameCompleted] = useState(false);

  // Initialize and shuffle choices
  useEffect(() => {
    let processedChoices = [...activity.choices];
    let correctIdx = activity.correctIndex;

    if (activity.shuffle) {
      const shuffledIndices = Array.from({ length: processedChoices.length }, (_, i) => i);
      
      // Fisher-Yates shuffle
      for (let i = shuffledIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
      }

      // Find new correct index after shuffle
      correctIdx = shuffledIndices.indexOf(activity.correctIndex);
      processedChoices = shuffledIndices.map(i => activity.choices[i]);
    }

    setChoices(processedChoices);
    setCorrectIndex(correctIdx);
  }, [activity]);

  // Show solution effect
  useEffect(() => {
    if (showSolution && !gameCompleted) {
      setSelectedIndex(correctIndex);
      setIsCorrect(true);
      setFeedback('Solución mostrada por el padre');
      
      setTimeout(() => {
        setSelectedIndex(null);
        setIsCorrect(null);
        setFeedback('');
        onSolutionShown?.();
      }, 2000);
    }
  }, [showSolution, correctIndex, gameCompleted, onSolutionShown]);

  const handleChoiceClick = (index: number) => {
    if (gameCompleted || selectedIndex !== null) return;

    setSelectedIndex(index);
    onAttempt();

    const correct = index === correctIndex;
    setIsCorrect(correct);

    if (correct) {
      // Success feedback
      const correctFeedback = activity.feedback?.correct || ['¡Correcto!'];
      const randomFeedback = correctFeedback[Math.floor(Math.random() * correctFeedback.length)];
      setFeedback(randomFeedback);
      
      // Confetti effect
      confetti({
        particleCount: 150,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']
      });

      // Save progress
      const progress = {
        activityId: activity.id,
        attempts,
        hintsUsed,
        success: true,
        elapsedMs: Date.now() - startTime,
        timestamp: Date.now()
      };
      saveProgress(progress);

      setGameCompleted(true);
      setTimeout(() => onSuccess(), 1500);

    } else {
      // Incorrect feedback
      const incorrectFeedback = activity.feedback?.incorrect || ['Inténtalo de nuevo'];
      const randomFeedback = incorrectFeedback[Math.floor(Math.random() * incorrectFeedback.length)];
      setFeedback(randomFeedback);

      // Reset after showing feedback
      setTimeout(() => {
        setSelectedIndex(null);
        setIsCorrect(null);
        setFeedback('');
      }, 1500);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleChoiceClick(index);
    }
  };

  const getChoiceClassName = (index: number) => {
    let baseClass = 'choice-card min-h-24 flex flex-col items-center justify-center text-center transition-all duration-300';
    
    if (selectedIndex === index) {
      if (isCorrect) {
        baseClass += ' correct border-success bg-success/20';
      } else {
        baseClass += ' incorrect border-destructive bg-destructive/20';
      }
    } else if (showSolution && index === correctIndex && !gameCompleted) {
      baseClass += ' border-warning bg-warning/20 animate-pulse';
    }

    return baseClass;
  };

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-2">
          {activity.question}
        </h2>
      </div>

      {/* Choices Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
        <AnimatePresence>
          {choices.map((choice, index) => (
            <motion.div
              key={`${choice.label}-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ 
                scale: selectedIndex === index && isCorrect ? 1.2 : 0.8,
                opacity: selectedIndex === index && isCorrect ? 0 : 1,
                rotate: selectedIndex === index && isCorrect ? 180 : 0
              }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              className={getChoiceClassName(index)}
              onClick={() => handleChoiceClick(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              tabIndex={0}
              role="button"
              aria-label={`Opción: ${choice.label}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {choice.image && (
                <img 
                  src={choice.image} 
                  alt={choice.label}
                  className="w-16 h-16 object-cover rounded-lg mb-2"
                />
              )}
              <span className="text-lg font-semibold">
                {choice.label}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`text-center p-4 rounded-lg ${
              isCorrect 
                ? 'bg-success/20 text-success border border-success' 
                : 'bg-destructive/20 text-destructive border border-destructive'
            }`}
          >
            <p className="text-lg font-semibold">{feedback}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}