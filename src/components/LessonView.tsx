import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

interface LessonViewProps {
  lesson: any;
}

export function LessonView({ lesson }: LessonViewProps) {
  return (
    <section className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{lesson.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Markdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>{lesson.concept_md}</Markdown>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Ejemplo resuelto</CardTitle>
        </CardHeader>
        <CardContent>
          <Markdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>{lesson.worked_example_prompt_md}</Markdown>
          {lesson.worked_example_steps_md && lesson.worked_example_steps_md.map((step: string, i: number) => (
            <div key={i} className="pl-4 border-l-2 border-amber-300 my-2">
              <Markdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>{step}</Markdown>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Ejemplo escalonado</CardTitle>
        </CardHeader>
        <CardContent>
          <Markdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>{lesson.faded_example_prompt_md}</Markdown>
          {lesson.faded_example_given_steps_md && lesson.faded_example_given_steps_md.map((step: string, i: number) => (
            <div key={i} className="pl-4 border-l-2 border-sky-300 my-2">
              <Markdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>{step}</Markdown>
            </div>
          ))}
          {/* Faded example blanks and check logic to be added in page */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Errores comunes</CardTitle>
        </CardHeader>
        <CardContent>
          {lesson.misconceptions_md && lesson.misconceptions_md.map((m: string, i: number) => (
            <div key={i} className="text-rose-700 mb-2">• <Markdown>{m}</Markdown></div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
