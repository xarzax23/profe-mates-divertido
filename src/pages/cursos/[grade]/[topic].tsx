import { GetServerSideProps } from 'next';
import { supabaseClient, getServiceSupabase } from '@/lib/supabase';
import { LessonView } from '@/components/LessonView';
import { ExerciseCard } from '@/components/ExerciseCard';

export default function LessonPage({ lesson, exercises }: any) {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <LessonView lesson={lesson} />
      <h2 className="text-xl font-bold mt-8 mb-4">Ejercicios interactivos</h2>
      {exercises.map((ex: any) => (
        <ExerciseCard key={ex.id} exercise={ex} onRequestSolution={() => {}} />
      ))}
      {/* Progress bar and faded example check to be added */}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { grade, topic } = ctx.query;
  const supabase = getServiceSupabase();
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('grade', grade)
    .eq('topic_slug', topic)
    .single();
  if (!lesson) return { notFound: true };
  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .eq('lesson_id', lesson.id)
    .order('ex_order');
  return { props: { lesson, exercises } };
};
