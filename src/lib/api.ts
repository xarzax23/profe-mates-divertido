import { mockCourses } from "@/data/mock";
import { useAppStore } from "@/store/useAppStore";
import { ChatMessage, Course, Grade, Topic, VideoJob } from "@/types";
import { systemTutor, videoScript } from "@/lib/prompts";
import { supabase } from "@/integrations/supabase/client";

export interface TutorResponse {
  pistas: string[];
  pasos: string[];
  repregunta: string;
  solucion?: string;
  error?: string;
}

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
  const userMessage: ChatMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content: message,
    imageUrl,
    timestamp: Date.now(),
  };

  try {
    const { data, error } = await supabase.functions.invoke('tutor', {
      body: {
        grade,
        message,
        imageUrl,
        requestSolution: false
      }
    });

    if (error) throw error;

    const response = data as TutorResponse;
    
    let assistantContent = "";
    if (response.pistas?.length) {
      assistantContent += "💡 **Pistas:**\n" + response.pistas.map(p => `• ${p}`).join('\n') + "\n\n";
    }
    if (response.pasos?.length) {
      assistantContent += "📝 **Pasos sugeridos:**\n" + response.pasos.map((p, i) => `${i + 1}. ${p}`).join('\n') + "\n\n";
    }
    if (response.repregunta) {
      assistantContent += "🤔 **Pregunta para ti:**\n" + response.repregunta;
    }

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: assistantContent.trim() || "Te ayudo con este ejercicio paso a paso.",
      timestamp: Date.now(),
    };

    return [...existing, userMessage, assistantMessage];
  } catch (error) {
    console.error('Error calling tutor API:', error);
    
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Lo siento, hubo un problema técnico. ¿Puedes intentar de nuevo?",
      timestamp: Date.now(),
    };

    return [...existing, userMessage, assistantMessage];
  }
}

// Function to request solution with parental gate PIN validation
export async function requestSolution({
  grade,
  message,
  imageUrl,
  parentPin
}: {
  grade: Grade;
  message: string;
  imageUrl?: string;
  parentPin: string;
}): Promise<{ success: boolean; solution?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('tutor', {
      body: {
        grade,
        message,
        imageUrl,
        requestSolution: true,
        parentPin
      }
    });

    if (error) throw error;

    const response = data as TutorResponse;
    
    if (response.error) {
      return { success: false, error: response.error };
    }

    return { 
      success: true, 
      solution: response.solucion 
    };
  } catch (error) {
    console.error('Error requesting solution:', error);
    return { 
      success: false, 
      error: 'Error técnico. Inténtalo de nuevo.' 
    };
  }
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
