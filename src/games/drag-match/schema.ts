import { z } from 'zod';

export const DragMatchActivitySchema = z.object({
  id: z.string(),
  type: z.literal('game'),
  template: z.literal('drag-match'),
  title: z.string(),
  instructions: z.string().optional(),
  items: z.array(z.object({
    id: z.string(),
    key: z.string(),
    label: z.string().optional(),
    image: z.string().optional(),
    audio: z.string().optional()
  })).min(1),
  targets: z.array(z.object({
    id: z.string(),
    key: z.string(),
    label: z.string().optional(),
    image: z.string().optional(),
    audio: z.string().optional()
  })).min(1),
  layout: z.object({
    itemsPerRow: z.number().optional(),
    targetsPerRow: z.number().optional()
  }).optional(),
  rules: z.object({
    maxAttempts: z.number().optional(),
    shuffle: z.boolean().optional().default(true),
    allowPartialCheck: z.boolean().optional().default(false)
  }).optional(),
  feedback: z.object({
    correct: z.array(z.string()).optional(),
    incorrect: z.array(z.string()).optional(),
    pairCorrect: z.array(z.string()).optional()
  }).optional(),
  hints: z.array(z.string()).max(3).optional()
}).refine(
  (data) => {
    // Validate that every item has a matching target
    const itemKeys = data.items.map(item => item.key);
    const targetKeys = data.targets.map(target => target.key);
    
    return itemKeys.every(key => targetKeys.includes(key)) &&
           itemKeys.length === targetKeys.length;
  },
  {
    message: "Each item must have a matching target with the same key",
    path: ["items", "targets"]
  }
);