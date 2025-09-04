export type Direction = 'N' | 'E' | 'S' | 'W';

export type GridPosition = {
  r: number;
  c: number;
};

export type CommandBlock = 
  | 'MOVE_FORWARD'
  | 'TURN_LEFT'
  | 'TURN_RIGHT'
  | 'REPEAT'
  | 'IF_PATH_AHEAD'
  | 'IF_COIN_HERE';

export type ProgramBlock = {
  id: string;
  type: CommandBlock;
  params?: {
    count?: number; // for REPEAT
  };
  children?: ProgramBlock[]; // for REPEAT and IF blocks
};

export type RobotState = {
  position: GridPosition;
  direction: Direction;
  coinsCollected: number;
  steps: number;
};

export type RobotGridActivity = {
  id: string;
  type: 'game';
  template: 'robot-grid';
  title: string;
  instructions?: string;
  grid: {
    rows: number;
    cols: number;
    start: GridPosition & { dir: Direction };
    goal: GridPosition;
    walls?: GridPosition[];
    coins?: GridPosition[];
    colored?: Array<GridPosition & { color: string }>;
  };
  toolbox: CommandBlock[];
  rules?: {
    maxSteps?: number;
    allowStepMode?: boolean;
  };
  successCriteria?: {
    collectAllCoins?: boolean;
    reachGoal?: boolean;
    maxSteps?: number;
  };
  hints?: string[];
  feedback?: {
    correct?: string[];
    incorrect?: string[];
  };
};

export type ExecutionState = 'idle' | 'running' | 'paused' | 'completed' | 'error';