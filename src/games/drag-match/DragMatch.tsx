import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useDraggable,
  useDroppable
} from '@dnd-kit/core';
import { DragMatchActivity } from './types';
import { DraggableItem } from './DraggableItem';
import { DroppableTarget } from './DroppableTarget';
import { saveProgress } from '../../lib/progress';
import confetti from 'canvas-confetti';

interface DragMatchProps {
  activity: DragMatchActivity;
  onSuccess: () => void;
  onAttempt: () => void;
  onHintUsed: () => void;
  hintsUsed: number;
  attempts: number;
  showSolution?: boolean;
  onSolutionShown?: () => void;
}

interface ItemState {
  id: string;
  key: string;
  label?: string;
  image?: string;
  isMatched: boolean;
  matchedTargetId?: string;
}

interface TargetState {
  id: string;
  key: string;
  label?: string;
  image?: string;
  hasMatch: boolean;
  matchedItemId?: string;
}

export function DragMatch({
  activity,
  onSuccess,
  onAttempt,
  hintsUsed,
  attempts,
  showSolution = false,
  onSolutionShown
}: DragMatchProps) {
  const [items, setItems] = useState<ItemState[]>([]);
  const [targets, setTargets] = useState<TargetState[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [showSolutionHighlight, setShowSolutionHighlight] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 }
    }),
    useSensor(KeyboardSensor)
  );

  // Initialize items and targets
  useEffect(() => {
    let processedItems = activity.items.map(item => ({
      ...item,
      isMatched: false
    }));
    
    let processedTargets = activity.targets.map(target => ({
      ...target,
      hasMatch: false
    }));

    // Shuffle if enabled
    if (activity.rules?.shuffle !== false) {
      processedItems = [...processedItems].sort(() => Math.random() - 0.5);
      processedTargets = [...processedTargets].sort(() => Math.random() - 0.5);
    }

    setItems(processedItems);
    setTargets(processedTargets);
  }, [activity]);

  // Show solution effect
  useEffect(() => {
    if (showSolution && !gameCompleted) {
      setShowSolutionHighlight(true);
      
      setTimeout(() => {
        setShowSolutionHighlight(false);
        onSolutionShown?.();
      }, 2000);
    }
  }, [showSolution, gameCompleted, onSolutionShown]);

  // Check if game is completed
  useEffect(() => {
    const allMatched = items.every(item => item.isMatched);
    if (allMatched && items.length > 0 && !gameCompleted) {
      setGameCompleted(true);
      
      // Success confetti
      confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']
      });

      // Success feedback
      const correctFeedback = activity.feedback?.correct || ['¡Muy bien!'];
      const randomFeedback = correctFeedback[Math.floor(Math.random() * correctFeedback.length)];
      setFeedback(randomFeedback);

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

      setTimeout(() => onSuccess(), 1500);
    }
  }, [items, gameCompleted, activity, attempts, hintsUsed, startTime, onSuccess]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over || !active) return;

    const itemId = active.id as string;
    const targetId = over.id as string;

    // Find the item and target
    const item = items.find(i => i.id === itemId);
    const target = targets.find(t => t.id === targetId);

    if (!item || !target || item.isMatched) return;

    onAttempt();
    
    // Check if it's a correct match
    const isCorrect = item.key === target.key;

    if (isCorrect) {
      // Match successful
      setItems(prev => prev.map(i => 
        i.id === itemId ? { ...i, isMatched: true, matchedTargetId: targetId } : i
      ));
      setTargets(prev => prev.map(t => 
        t.id === targetId ? { ...t, hasMatch: true, matchedItemId: itemId } : t
      ));

      // Pair feedback
      const pairFeedback = activity.feedback?.pairCorrect || ['¡Pareja correcta!'];
      const randomPairFeedback = pairFeedback[Math.floor(Math.random() * pairFeedback.length)];
      setFeedback(randomPairFeedback);
      
      setTimeout(() => setFeedback(''), 1500);

    } else {
      // Incorrect match
      const incorrectFeedback = activity.feedback?.incorrect || ['Inténtalo de nuevo'];
      const randomFeedback = incorrectFeedback[Math.floor(Math.random() * incorrectFeedback.length)];
      setFeedback(randomFeedback);

      setTimeout(() => setFeedback(''), 1500);
    }
  };

  // Tap-to-pair fallback
  const handleItemClick = (itemId: string) => {
    if (items.find(i => i.id === itemId)?.isMatched) return;

    if (!selectedItemId) {
      setSelectedItemId(itemId);
    } else if (selectedItemId === itemId) {
      setSelectedItemId(null);
    }
  };

  const handleTargetClick = (targetId: string) => {
    if (!selectedItemId || targets.find(t => t.id === targetId)?.hasMatch) return;

    const item = items.find(i => i.id === selectedItemId);
    const target = targets.find(t => t.id === targetId);

    if (!item || !target) return;

    onAttempt();
    setSelectedItemId(null);

    const isCorrect = item.key === target.key;

    if (isCorrect) {
      // Match successful
      setItems(prev => prev.map(i => 
        i.id === selectedItemId ? { ...i, isMatched: true, matchedTargetId: targetId } : i
      ));
      setTargets(prev => prev.map(t => 
        t.id === targetId ? { ...t, hasMatch: true, matchedItemId: selectedItemId } : t
      ));

      const pairFeedback = activity.feedback?.pairCorrect || ['¡Pareja correcta!'];
      const randomPairFeedback = pairFeedback[Math.floor(Math.random() * pairFeedback.length)];
      setFeedback(randomPairFeedback);
      
      setTimeout(() => setFeedback(''), 1500);

    } else {
      const incorrectFeedback = activity.feedback?.incorrect || ['Inténtalo de nuevo'];
      const randomFeedback = incorrectFeedback[Math.floor(Math.random() * incorrectFeedback.length)];
      setFeedback(randomFeedback);

      setTimeout(() => setFeedback(''), 1500);
    }
  };

  const getItemClassName = (item: ItemState) => {
    let baseClass = 'choice-card min-h-20 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300';
    
    if (item.isMatched) {
      baseClass += ' border-success bg-success/20 cursor-default';
    } else if (selectedItemId === item.id) {
      baseClass += ' border-primary bg-primary/20 ring-2 ring-primary';
    } else if (showSolutionHighlight) {
      const matchingTarget = targets.find(t => t.key === item.key);
      if (matchingTarget) {
        baseClass += ' border-warning bg-warning/20 animate-pulse';
      }
    }

    return baseClass;
  };

  const getTargetClassName = (target: TargetState) => {
    let baseClass = 'choice-card min-h-24 flex flex-col items-center justify-center text-center border-2 border-dashed transition-all duration-300';
    
    if (target.hasMatch) {
      baseClass += ' border-success bg-success/20';
    } else if (showSolutionHighlight) {
      const matchingItem = items.find(i => i.key === target.key);
      if (matchingItem) {
        baseClass += ' border-warning bg-warning/20 animate-pulse';
      }
    } else {
      baseClass += ' border-muted hover:border-primary cursor-pointer';
    }

    return baseClass;
  };

  const availableItems = items.filter(item => !item.isMatched);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-8">
        {/* Instructions */}
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-2">
            {activity.title}
          </h2>
          {activity.instructions && (
            <p className="text-muted-foreground">
              {activity.instructions}
            </p>
          )}
        </div>

        {/* Game Area */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Items Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">
              Arrastra estos elementos:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <AnimatePresence>
                {availableItems.map((item) => (
                  <DraggableItem
                    key={item.id}
                    id={item.id}
                    className={getItemClassName(item)}
                    onClick={() => handleItemClick(item.id)}
                    disabled={item.isMatched}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      layout
                      className="flex flex-col items-center justify-center"
                    >
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.label || ''}
                          className="w-12 h-12 object-cover rounded mb-2"
                        />
                      )}
                      <span className="text-lg font-semibold">
                        {item.label}
                      </span>
                    </motion.div>
                  </DraggableItem>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Targets Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">
              A estos destinos:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {targets.map((target) => {
                const matchedItem = target.matchedItemId ? 
                  items.find(i => i.id === target.matchedItemId) : null;

                return (
                  <DroppableTarget
                    key={target.id}
                    id={target.id}
                    className={getTargetClassName(target)}
                    onClick={() => handleTargetClick(target.id)}
                    disabled={target.hasMatch}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center min-h-24"
                    >
                      {/* Show matched item or target content */}
                      {matchedItem ? (
                        <div className="flex flex-col items-center">
                          {matchedItem.image && (
                            <img 
                              src={matchedItem.image} 
                              alt={matchedItem.label || ''}
                              className="w-12 h-12 object-cover rounded mb-1"
                            />
                          )}
                          <span className="text-sm font-semibold text-success">
                            {matchedItem.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ↓
                          </span>
                          <span className="text-lg">
                            {target.label}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          {target.image && (
                            <img 
                              src={target.image} 
                              alt={target.label || ''}
                              className="w-12 h-12 object-cover rounded mb-2"
                            />
                          )}
                          <span className="text-lg">
                            {target.label}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </DroppableTarget>
                );
              })}
            </div>
          </div>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center p-4 rounded-lg bg-primary/20 text-primary border border-primary"
            >
              <p className="text-lg font-semibold">{feedback}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId ? (
          <div className="choice-card min-h-20 flex flex-col items-center justify-center text-center opacity-80 transform rotate-3 scale-105">
            {(() => {
              const item = items.find(i => i.id === activeId);
              return item ? (
                <>
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.label || ''}
                      className="w-12 h-12 object-cover rounded mb-2"
                    />
                  )}
                  <span className="text-lg font-semibold">
                    {item.label}
                  </span>
                </>
              ) : null;
            })()}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}