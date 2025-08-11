export type Grade = 1 | 2 | 3 | 4 | 5 | 6;

export interface Question {
  id: string;
  text: string;
  choices?: string[];
  answer?: string;
}

export interface Topic {
  id: string;
  slug: string;
  title: string;
  markdown: string;
  questions: Question[];
}

export interface Course {
  grade: Grade;
  name: string;
  topics: Topic[];
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  imageUrl?: string;
  timestamp: number;
}

export type VideoJobStatus = "queued" | "processing" | "done" | "error";

export interface VideoJob {
  id: string;
  grade: Grade;
  topicId?: string;
  prompt?: string;
  status: VideoJobStatus;
  createdAt: number;
  updatedAt: number;
  videoUrl?: string;
  error?: string;
}
