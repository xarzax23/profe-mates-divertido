import { z } from 'zod';

const MemoryCardFaceSchema = z.object({
  label: z.string().optional(),
  image: z.string().optional(),
  audio: z.string().optional()
});

const MemoryCardSchema = z.object({
  id: z.string(),
  key: z.string(),
  face: MemoryCardFaceSchema
});

export const MemoryActivitySchema = z.object({
  id: z.string(),
  type: z.literal('game'),
  template: z.literal('memory'),
  title: z.string(),
  instructions: z.string().optional(),
  cards: z.array(MemoryCardSchema).min(4), // At least 2 pairs
  rules: z.object({
    shuffle: z.boolean().optional().default(true),
    previewMs: z.number().optional().default(0),
    timeLimitSeconds: z.number().optional().default(0),
    grid: z.object({
      cols: z.number().positive(),
      rows: z.number().positive()
    }).optional(),
    scoring: z.object({
      threeStarsAttempts: z.number().positive().optional(),
      twoStarsAttempts: z.number().positive().optional()
    }).optional()
  }).optional(),
  feedback: z.object({
    correct: z.array(z.string()).optional(),
    incorrect: z.array(z.string()).optional(),
    complete: z.array(z.string()).optional()
  }).optional(),
  hints: z.array(z.string()).max(3).optional()
}).refine(
  (data) => {
    // Validate that each key appears at least twice and in even numbers
    const keyCount = new Map<string, number>();
    data.cards.forEach(card => {
      keyCount.set(card.key, (keyCount.get(card.key) || 0) + 1);
    });
    
    return Array.from(keyCount.values()).every(count => count >= 2 && count % 2 === 0);
  },
  {
    message: "Each key must appear at least twice and in even numbers for valid pairs",
    path: ["cards"]
  }
);