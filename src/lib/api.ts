import { mockCourses } from "@/data/mock";
import { useAppStore } from "@/store/useAppStore";
import { ChatMessage, Course, Grade, Topic, VideoJob } from "@/types";
import { systemTutor, videoScript } from "@/lib/prompts";

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function getCourses(): Promise<Course[]> {
  await wait(200);
  return mockCourses;
}

export async function getCourse(grade: number): Promise<Course | undefined> {
  await wait(200);
  return mockCourses.find((c) => c.grade === grade);
}

export async function getTopics(grade: number): Promise<Topic[]> {
  const c = await getCourse(grade);
  return c?.topics ?? [];
}

export async function getTopic(grade: number, slug: string): Promise<Topic | undefined> {
  const topics = await getTopics(grade);
  return topics.find((t) => t.slug === slug);
}

export async function postChat(args: { grade: Grade; message: string; imageUrl?: string; existing?: ChatMessage[]; }): Promise<ChatMessage[]> {
  const { grade, message, imageUrl, existing = [] } = args;
  const now = Date.now();
  const userMsg: ChatMessage = { id: `m-${now}`, role: 'user', content: message, imageUrl, timestamp: now };
  const store = useAppStore.getState();
  const start = [...existing, userMsg];
  useAppStore.getState().setChatForGrade(grade, start);

  await wait(600);
  const assistantText = `Hola, soy tu profe de ${grade}º. ${systemTutor(grade)}\n\nVoy a darte una pista primero: piensa qué operación necesitas. ¿Suma, resta, multiplicación o división?`;
  const assistantMsg: ChatMessage = { id: `m-${now+1}`, role: 'assistant', content: assistantText, timestamp: Date.now() };
  const next = [...start, assistantMsg];
  store.setChatForGrade(grade, next);
  return next;
}

export async function createVideoJob(args: { grade: Grade; topicId?: string; prompt?: string; }): Promise<{ jobId: string }> {
  const { grade, topicId, prompt } = args;
  const now = Date.now();
  const id = `job-${now}-${Math.random().toString(36).slice(2,8)}`;
  const job: VideoJob = { id, grade, topicId, prompt, status: 'queued', createdAt: now, updatedAt: now };
  useAppStore.getState().addVideoJob(job);

  // Simula llamada a n8n y proceso
  setTimeout(() => useAppStore.getState().updateVideoJob(id, { status: 'processing' }), 800);
  setTimeout(() => {
    // 85% éxito
    const ok = Math.random() < 0.85;
    if (ok) {
      useAppStore.getState().updateVideoJob(id, { status: 'done', videoUrl: `https://example.com/videos/${id}.mp4` });
    } else {
      useAppStore.getState().updateVideoJob(id, { status: 'error', error: 'Hubo un problema generando el vídeo.' });
    }
  }, 4000);

  return { jobId: id };
}

export async function getVideoJobs() {
  await wait(200);
  return useAppStore.getState().videoJobs;
}

export async function getVideoJob(id: string) {
  await wait(150);
  return useAppStore.getState().videoJobs.find(j => j.id === id);
}
