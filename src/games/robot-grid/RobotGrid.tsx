import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { Play, Pause, RotateCcw, FastForward, ChevronRight, Circle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { RobotGridActivity, ProgramBlock, RobotState, Direction, ExecutionState } from './types';
import confetti from 'canvas-confetti';

interface RobotGridProps {
  activity: RobotGridActivity;
  onSuccess: () => void;
  onAttempt: () => void;
  onHintUsed: () => void;
  hintsUsed: number;
  attempts: number;
  showSolution: boolean;
  onSolutionShown: () => void;
}

// Direction utilities
const DIRECTIONS: Direction[] = ['N', 'E', 'S', 'W'];
const DIRECTION_DELTAS = {
  N: { r: -1, c: 0 },
  E: { r: 0, c: 1 },
  S: { r: 1, c: 0 },
  W: { r: 0, c: -1 }
};

const DIRECTION_ICONS = {
  N: '↑',
  E: '→',
  S: '↓',
  W: '←'
};

// Block components
function DraggableBlock({ id, type, children }: { id: string; type: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 bg-primary text-primary-foreground rounded-lg cursor-grab active:cursor-grabbing select-none font-medium text-sm shadow-md ${
        isDragging ? 'opacity-50 z-50' : ''
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  );
}

function DroppableArea({ id, children, className = '', isEmpty = false }: { 
  id: string; 
  children: React.ReactNode; 
  className?: string;
  isEmpty?: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });
  
  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'ring-2 ring-primary bg-primary/10' : ''} ${
        isEmpty ? 'border-2 border-dashed border-muted-foreground/30 min-h-[60px] rounded-lg' : ''
      }`}
    >
      {children}
    </div>
  );
}

function ProgramBlockView({ block, onEdit, onRemove }: { 
  block: ProgramBlock; 
  onEdit?: (id: string, params: any) => void;
  onRemove?: (id: string) => void;
}) {
  const getBlockColor = (type: string) => {
    switch (type) {
      case 'MOVE_FORWARD': return 'bg-green-600 text-white';
      case 'TURN_LEFT':
      case 'TURN_RIGHT': return 'bg-blue-600 text-white';
      case 'REPEAT': return 'bg-purple-600 text-white';
      case 'IF_PATH_AHEAD':
      case 'IF_COIN_HERE': return 'bg-orange-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getBlockLabel = (block: ProgramBlock) => {
    switch (block.type) {
      case 'MOVE_FORWARD': return 'Avanzar';
      case 'TURN_LEFT': return 'Girar ←';
      case 'TURN_RIGHT': return 'Girar →';
      case 'REPEAT': return `Repetir ${block.params?.count || 1}`;
      case 'IF_PATH_AHEAD': return 'Si hay camino';
      case 'IF_COIN_HERE': return 'Si hay moneda';
      default: return block.type;
    }
  };

  return (
    <div className="mb-2">
      <div className={`p-2 rounded-lg ${getBlockColor(block.type)} flex items-center justify-between`}>
        <span className="text-sm font-medium">{getBlockLabel(block)}</span>
        {block.type === 'REPEAT' && onEdit && (
          <input
            type="number"
            min="1"
            max="9"
            value={block.params?.count || 1}
            onChange={(e) => onEdit(block.id, { count: parseInt(e.target.value) || 1 })}
            className="w-12 text-center text-black rounded"
          />
        )}
        {onRemove && (
          <button
            onClick={() => onRemove(block.id)}
            className="text-white hover:text-red-200 ml-2"
          >
            ×
          </button>
        )}
      </div>
      {(block.type === 'REPEAT' || block.type.startsWith('IF_')) && block.children && (
        <div className="ml-4 mt-1 border-l-2 border-gray-300 pl-2">
          {block.children.map((child) => (
            <ProgramBlockView key={child.id} block={child} onEdit={onEdit} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}

export function RobotGrid({
  activity,
  onSuccess,
  onAttempt,
  onHintUsed,
  hintsUsed,
  attempts,
  showSolution,
  onSolutionShown
}: RobotGridProps) {
  const [program, setProgram] = useState<ProgramBlock[]>([]);
  const [robotState, setRobotState] = useState<RobotState>({
    position: activity.grid.start,
    direction: activity.grid.start.dir,
    coinsCollected: 0,
    steps: 0
  });
  const [executionState, setExecutionState] = useState<ExecutionState>('idle');
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);
  const [collectedCoins, setCollectedCoins] = useState<Set<string>>(new Set());
  const [gameCompleted, setGameCompleted] = useState(false);
  const blockIdCounter = useRef(0);

  useEffect(() => {
    if (showSolution) {
      // Show solution path for 2 seconds
      setTimeout(() => {
        onSolutionShown();
      }, 2000);
    }
  }, [showSolution, onSolutionShown]);

  const generateBlockId = () => `block-${++blockIdCounter.current}`;

  const resetRobot = useCallback(() => {
    setRobotState({
      position: activity.grid.start,
      direction: activity.grid.start.dir,
      coinsCollected: 0,
      steps: 0
    });
    setCollectedCoins(new Set());
    setExecutionState('idle');
    setCurrentBlockId(null);
    setGameCompleted(false);
  }, [activity.grid.start]);

  const isValidPosition = (r: number, c: number) => {
    if (r < 0 || r >= activity.grid.rows || c < 0 || c >= activity.grid.cols) return false;
    return !activity.grid.walls?.some(wall => wall.r === r && wall.c === c);
  };

  const executeProgram = useCallback(async () => {
    if (executionState === 'running') return;
    
    onAttempt();
    setExecutionState('running');
    
    let state = { ...robotState };
    let coins = new Set(collectedCoins);
    
    const executeBlock = async (block: ProgramBlock): Promise<boolean> => {
      setCurrentBlockId(block.id);
      await new Promise(resolve => setTimeout(resolve, 400));
      
      switch (block.type) {
        case 'MOVE_FORWARD': {
          const delta = DIRECTION_DELTAS[state.direction];
          const newR = state.position.r + delta.r;
          const newC = state.position.c + delta.c;
          
          if (!isValidPosition(newR, newC)) {
            setExecutionState('error');
            return false;
          }
          
          state.position = { r: newR, c: newC };
          state.steps++;
          setRobotState({ ...state });
          
          // Check for coin collection
          const coinKey = `${newR}-${newC}`;
          if (activity.grid.coins?.some(coin => coin.r === newR && coin.c === newC) && !coins.has(coinKey)) {
            coins.add(coinKey);
            state.coinsCollected++;
            setCollectedCoins(new Set(coins));
          }
          break;
        }
        
        case 'TURN_LEFT': {
          const currentIndex = DIRECTIONS.indexOf(state.direction);
          state.direction = DIRECTIONS[(currentIndex + 3) % 4];
          setRobotState({ ...state });
          break;
        }
        
        case 'TURN_RIGHT': {
          const currentIndex = DIRECTIONS.indexOf(state.direction);
          state.direction = DIRECTIONS[(currentIndex + 1) % 4];
          setRobotState({ ...state });
          break;
        }
        
        case 'REPEAT': {
          const count = block.params?.count || 1;
          for (let i = 0; i < count; i++) {
            if (block.children) {
              for (const child of block.children) {
                const success = await executeBlock(child);
                if (!success) return false;
              }
            }
          }
          break;
        }
        
        case 'IF_PATH_AHEAD': {
          const delta = DIRECTION_DELTAS[state.direction];
          const nextR = state.position.r + delta.r;
          const nextC = state.position.c + delta.c;
          
          if (isValidPosition(nextR, nextC) && block.children) {
            for (const child of block.children) {
              const success = await executeBlock(child);
              if (!success) return false;
            }
          }
          break;
        }
        
        case 'IF_COIN_HERE': {
          const coinKey = `${state.position.r}-${state.position.c}`;
          if (activity.grid.coins?.some(coin => coin.r === state.position.r && coin.c === state.position.c) && 
              !coins.has(coinKey) && block.children) {
            for (const child of block.children) {
              const success = await executeBlock(child);
              if (!success) return false;
            }
          }
          break;
        }
      }
      
      return true;
    };
    
    try {
      for (const block of program) {
        const success = await executeBlock(block);
        if (!success) {
          setCurrentBlockId(null);
          return;
        }
      }
      
      // Check success criteria
      const criteria = activity.successCriteria || { reachGoal: true };
      const atGoal = state.position.r === activity.grid.goal.r && state.position.c === activity.grid.goal.c;
      const allCoinsCollected = !criteria.collectAllCoins || 
        state.coinsCollected === (activity.grid.coins?.length || 0);
      const withinStepLimit = !criteria.maxSteps || state.steps <= criteria.maxSteps;
      
      if (atGoal && allCoinsCollected && withinStepLimit) {
        setExecutionState('completed');
        setGameCompleted(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        onSuccess();
      } else {
        setExecutionState('idle');
      }
    } catch (error) {
      setExecutionState('error');
    }
    
    setCurrentBlockId(null);
  }, [program, robotState, collectedCoins, activity, onAttempt, onSuccess]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id.toString().startsWith('toolbox-')) {
      // Dragging from toolbox
      const blockType = active.id.toString().replace('toolbox-', '') as any;
      const newBlock: ProgramBlock = {
        id: generateBlockId(),
        type: blockType,
        params: blockType === 'REPEAT' ? { count: 2 } : undefined,
        children: (blockType === 'REPEAT' || blockType.startsWith('IF_')) ? [] : undefined
      };
      
      setProgram(prev => [...prev, newBlock]);
    }
  };

  const updateBlockParams = (id: string, params: any) => {
    setProgram(prev => prev.map(block => 
      block.id === id ? { ...block, params: { ...block.params, ...params } } : block
    ));
  };

  const removeBlock = (id: string) => {
    setProgram(prev => prev.filter(block => block.id !== id));
  };

  const clearProgram = () => {
    setProgram([]);
  };

  const toolboxBlocks = activity.toolbox.map(type => ({
    type,
    label: {
      MOVE_FORWARD: 'Avanzar',
      TURN_LEFT: 'Girar ←',
      TURN_RIGHT: 'Girar →',
      REPEAT: 'Repetir',
      IF_PATH_AHEAD: 'Si hay camino',
      IF_COIN_HERE: 'Si hay moneda'
    }[type]
  }));

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* Toolbox */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Bloques de comandos</h3>
            <div className="space-y-2">
              {toolboxBlocks.map((block) => (
                <DraggableBlock key={`toolbox-${block.type}`} id={`toolbox-${block.type}`} type={block.type}>
                  {block.label}
                </DraggableBlock>
              ))}
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Estado</h3>
            <div className="space-y-2 text-sm">
              <div>Posición: ({robotState.position.r}, {robotState.position.c})</div>
              <div>Dirección: {DIRECTION_ICONS[robotState.direction]}</div>
              <div>Pasos: {robotState.steps}</div>
              <div>Monedas: {robotState.coinsCollected}</div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="lg:col-span-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Mundo del Robot</h3>
              <Badge variant={executionState === 'completed' ? 'default' : 'secondary'}>
                {executionState === 'running' ? 'Ejecutando...' :
                 executionState === 'completed' ? '¡Completado!' :
                 executionState === 'error' ? 'Error' : 'Listo'}
              </Badge>
            </div>
            
            <div 
              className="grid gap-1 mx-auto"
              style={{ 
                gridTemplateColumns: `repeat(${activity.grid.cols}, 1fr)`,
                maxWidth: `${activity.grid.cols * 40}px`
              }}
            >
              {Array.from({ length: activity.grid.rows }, (_, r) =>
                Array.from({ length: activity.grid.cols }, (_, c) => {
                  const isWall = activity.grid.walls?.some(wall => wall.r === r && wall.c === c);
                  const isCoin = activity.grid.coins?.some(coin => coin.r === r && coin.c === c);
                  const coinKey = `${r}-${c}`;
                  const isCoinCollected = collectedCoins.has(coinKey);
                  const isGoal = activity.grid.goal.r === r && activity.grid.goal.c === c;
                  const isRobot = robotState.position.r === r && robotState.position.c === c;
                  const colored = activity.grid.colored?.find(cell => cell.r === r && cell.c === c);
                  
                  return (
                    <motion.div
                      key={`${r}-${c}`}
                      className={`w-8 h-8 border border-border flex items-center justify-center text-xs relative ${
                        isWall ? 'bg-gray-800' :
                        colored ? 'bg-blue-100' :
                        'bg-background'
                      }`}
                      style={colored ? { backgroundColor: colored.color } : undefined}
                      initial={false}
                      animate={showSolution && isGoal ? { 
                        boxShadow: '0 0 10px #fbbf24',
                        scale: 1.1
                      } : {}}
                    >
                      {isWall && '🧱'}
                      {isCoin && !isCoinCollected && (
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          🪙
                        </motion.span>
                      )}
                      {isGoal && '⭐'}
                      {isRobot && (
                        <motion.span
                          className="text-lg"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          🤖
                        </motion.span>
                      )}
                      {isRobot && (
                        <div className="absolute -top-1 -right-1 text-xs">
                          {DIRECTION_ICONS[robotState.direction]}
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Program Editor */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Programa</h3>
              <Button variant="ghost" size="sm" onClick={clearProgram}>
                Limpiar
              </Button>
            </div>
            
            <DroppableArea id="program" isEmpty={program.length === 0}>
              {program.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  Arrastra bloques aquí
                </div>
              ) : (
                <div className="space-y-1">
                  {program.map((block) => (
                    <motion.div
                      key={block.id}
                      className={currentBlockId === block.id ? 'ring-2 ring-yellow-400' : ''}
                      layout
                    >
                      <ProgramBlockView 
                        block={block} 
                        onEdit={updateBlockParams}
                        onRemove={removeBlock}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </DroppableArea>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Controles</h3>
            <div className="space-y-2">
              <Button 
                onClick={executeProgram} 
                disabled={program.length === 0 || executionState === 'running'}
                className="w-full"
              >
                <Play className="w-4 h-4 mr-2" />
                Ejecutar
              </Button>
              
              <Button 
                onClick={resetRobot} 
                variant="outline"
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reiniciar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}