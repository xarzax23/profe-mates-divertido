import { z } from 'zod';
import { DragMatchActivitySchema } from '../games/drag-match/schema';
import { MemoryActivitySchema } from '../games/memory/schema';
import { RobotGridActivitySchema } from '../games/robot-grid/schema';

// Select Correct Schema (existing)
export const SelectCorrectActivitySchema = z.object({
  id: z.string(),
  type: z.literal('game'),
  template: z.literal('select-correct'),
  title: z.string(),
  instructions: z.string().optional(),
  question: z.string(),
  choices: z.array(z.object({
    label: z.string(),
    image: z.string().optional()
  })).min(2).max(9),
  correctIndex: z.number().min(0),
  shuffle: z.boolean().optional().default(false),
  feedback: z.object({
    correct: z.array(z.string()).optional(),
    incorrect: z.array(z.string()).optional()
  }).optional(),
  hints: z.array(z.string()).max(3).optional()
}).refine(
  (data) => data.correctIndex < data.choices.length,
  {
    message: "correctIndex must be less than choices length",
    path: ["correctIndex"]
  }
);

// Union of all activity schemas
export const ActivitySchema = z.union([
  SelectCorrectActivitySchema,
  DragMatchActivitySchema,
  MemoryActivitySchema,
  RobotGridActivitySchema
]);

export type SelectCorrectActivity = z.infer<typeof SelectCorrectActivitySchema>;
export type Activity = z.infer<typeof ActivitySchema>;

export interface GameProgress {
  activityId: string;
  attempts: number;
  hintsUsed: number;
  success: boolean;
  elapsedMs: number;
  timestamp: number;
}

export interface Choice {
  label: string;
  image?: string;
}