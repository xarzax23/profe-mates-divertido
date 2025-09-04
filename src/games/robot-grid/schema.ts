import { z } from 'zod';

const DirectionSchema = z.enum(['N', 'E', 'S', 'W']);

const GridPositionSchema = z.object({
  r: z.number().min(0),
  c: z.number().min(0)
});

const CommandBlockSchema = z.enum([
  'MOVE_FORWARD',
  'TURN_LEFT', 
  'TURN_RIGHT',
  'REPEAT',
  'IF_PATH_AHEAD',
  'IF_COIN_HERE'
]);

export const RobotGridActivitySchema = z.object({
  id: z.string(),
  type: z.literal('game'),
  template: z.literal('robot-grid'),
  title: z.string(),
  instructions: z.string().optional(),
  grid: z.object({
    rows: z.number().min(3).max(20),
    cols: z.number().min(3).max(20),
    start: GridPositionSchema.extend({
      dir: DirectionSchema
    }),
    goal: GridPositionSchema,
    walls: z.array(GridPositionSchema).optional(),
    coins: z.array(GridPositionSchema).optional(),
    colored: z.array(GridPositionSchema.extend({
      color: z.string()
    })).optional()
  }),
  toolbox: z.array(CommandBlockSchema).min(1),
  rules: z.object({
    maxSteps: z.number().min(1).optional(),
    allowStepMode: z.boolean().optional()
  }).optional(),
  successCriteria: z.object({
    collectAllCoins: z.boolean().optional(),
    reachGoal: z.boolean().optional().default(true),
    maxSteps: z.number().min(1).optional()
  }).optional(),
  hints: z.array(z.string()).max(3).optional(),
  feedback: z.object({
    correct: z.array(z.string()).optional(),
    incorrect: z.array(z.string()).optional()
  }).optional()
}).refine(
  (data) => {
    // Validate that start and goal positions are within grid bounds
    const { rows, cols, start, goal } = data.grid;
    return (
      start.r >= 0 && start.r < rows &&
      start.c >= 0 && start.c < cols &&
      goal.r >= 0 && goal.r < rows &&
      goal.c >= 0 && goal.c < cols
    );
  },
  {
    message: "Start and goal positions must be within grid bounds",
    path: ["grid"]
  }
);