import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/lib/supabase';

const RATE_LIMIT: Record<string, { count: number; last: number }> = {};
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { exerciseId, pin } = req.body;
  if (!exerciseId || !pin) return res.status(400).json({ error: 'Missing params' });

  // Rate limit by IP
  const ip = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  if (!RATE_LIMIT[ip] || now - RATE_LIMIT[ip].last > WINDOW_MS) {
    RATE_LIMIT[ip] = { count: 0, last: now };
  }
  if (RATE_LIMIT[ip].count >= MAX_ATTEMPTS) {
    return res.status(429).json({ error: 'Too many attempts. Try later.' });
  }

  if (pin !== process.env.PARENT_PIN) {
    RATE_LIMIT[ip].count++;
    RATE_LIMIT[ip].last = now;
    return res.status(403).json({ error: 'Invalid PIN' });
  }

  const supabase = getServiceSupabase();
  const { data: exercise, error } = await supabase
    .from('exercises')
    .select('solution,steps')
    .eq('id', exerciseId)
    .single();
  if (error || !exercise) return res.status(404).json({ error: 'Exercise not found' });

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ solution: exercise.solution, steps: exercise.steps });
}
