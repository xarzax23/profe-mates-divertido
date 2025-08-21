import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

interface ExerciseCardProps {
  exercise: any;
  onRequestSolution: () => void;
}

export function ExerciseCard({ exercise, onRequestSolution }: ExerciseCardProps) {
  const [userInput, setUserInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect' | 'neutral'>('neutral');
  const [hintIdx, setHintIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);

  const handleCheck = async () => {
    setChecked(true);
    const res = await fetch('/api/exercises/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exerciseId: exercise.id, userResponse: userInput })
    });
    const data = await res.json();
    setResult(data.correct ? 'correct' : 'incorrect');
  };

  const handleGetHint = () => {
    setHintIdx((idx) => Math.min(idx + 1, (exercise.hints?.length || 0) - 1));
  };

  const handleShowStep = () => {
    setStepIdx((idx) => Math.min(idx + 1, (exercise.steps?.length || 0) - 1));
  };

  const handleRevealSolution = () => {
    setPinDialogOpen(true);
  };

  const handlePinSubmit = async (pin: string) => {
    const res = await fetch('/api/exercises/solution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exerciseId: exercise.id, pin })
    });
    if (res.ok) {
      const data = await res.json();
      setSolution(data.solution);
      setShowSolution(true);
    } else {
      setSolution('');
    }
    setPinDialogOpen(false);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Ejercicio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2">{exercise.stimulus_md}</div>
        <Input
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          type={exercise.type === 'numeric' ? 'number' : 'text'}
          className={cn(result === 'correct' && 'border-green-500', result === 'incorrect' && 'border-red-500')}
          aria-label="Respuesta"
        />
        <div className="flex gap-2 mt-2">
          <Button onClick={handleCheck} variant="default">Check</Button>
          <Button onClick={handleGetHint} variant="outline" disabled={hintIdx >= (exercise.hints?.length || 0) - 1}>Get Hint</Button>
          <Button onClick={handleShowStep} variant="outline" disabled={stepIdx >= (exercise.steps?.length || 0) - 1}>Show Step</Button>
          <Button onClick={handleRevealSolution} variant="destructive">Reveal Solution (Parent)</Button>
        </div>
        <div className="mt-2">
          {exercise.hints && exercise.hints.slice(0, hintIdx + 1).map((h: string, i: number) => (
            <div key={i} className="text-amber-700">Hint: {h}</div>
          ))}
          {exercise.steps && exercise.steps.slice(0, stepIdx + 1).map((s: string, i: number) => (
            <div key={i} className="text-sky-700">Step: {s}</div>
          ))}
          {showSolution && solution && (
            <div className="border p-2 mt-2 bg-amber-50 text-amber-900">{solution}</div>
          )}
        </div>
        {/* ParentPinDialog to be implemented and shown when pinDialogOpen */}
      </CardContent>
    </Card>
  );
}
