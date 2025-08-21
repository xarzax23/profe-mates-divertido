import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/lib/supabase';
import Fraction from 'fraction.js';

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { exerciseId, userResponse } = req.body;
  if (!exerciseId) return res.status(400).json({ error: 'Missing exerciseId' });

  const supabase = getServiceSupabase();
  const { data: exercise, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', exerciseId)
    .single();
  if (error || !exercise) return res.status(404).json({ error: 'Exercise not found' });

  let correct = false;
  let feedback = '';
  const validators = exercise.validators || {};

  switch (exercise.type) {
    case 'numeric': {
      const tol = validators.tolerance ?? 0;
      correct = Math.abs(Number(userResponse) - Number(exercise.answer)) <= tol;
      break;
    }
    case 'fraction': {
      try {
        correct = new Fraction(userResponse).equals(new Fraction(exercise.answer));
      } catch {
        correct = false;
      }
      break;
    }
    case 'short_text': {
      if (validators.normalize_text) {
        correct = normalizeText(userResponse) === normalizeText(exercise.answer);
      } else {
        correct = userResponse === exercise.answer;
      }
      break;
    }
    case 'multiple_choice': {
      correct = userResponse === exercise.answer;
      break;
    }
    case 'multi_select': {
      correct = Array.isArray(userResponse) && Array.isArray(exercise.answer) &&
        userResponse.length === exercise.answer.length &&
        userResponse.every((v: any) => exercise.answer.includes(v));
      break;
    }
    default:
      correct = false;
  }

  res.status(200).json({ correct, feedback });
}
