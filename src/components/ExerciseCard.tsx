import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

interface ExerciseCardProps {
  exercise: any;
  onRequestSolution: () => void;
}

// (Legacy ExerciseCard removed. Use ExerciseInline only.)
