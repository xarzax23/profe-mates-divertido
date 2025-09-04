import { create } from "zustand";
import { ChatMessage, Grade, VideoJob } from "@/types";

interface AppState {
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;

  chatByGrade: Record<Grade, ChatMessage[]>;
  setChatForGrade: (grade: Grade, messages: ChatMessage[]) => void;

  videoJobs: VideoJob[];
  addVideoJob: (job: VideoJob) => void;
  updateVideoJob: (id: string, patch: Partial<VideoJob>) => void;
}

const STORAGE_JOBS_KEY = "pmates_video_jobs";
const STORAGE_HC_KEY = "pmates_hc";

const loadJobs = (): VideoJob[] => {
  try {
    const raw = localStorage.getItem(STORAGE_JOBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveJobs = (jobs: VideoJob[]) => {
  try { localStorage.setItem(STORAGE_JOBS_KEY, JSON.stringify(jobs)); } catch(e) { console.error(e) }
};

const loadHC = (): boolean => {
  try { return localStorage.getItem(STORAGE_HC_KEY) === "1"; } catch { return false; }
};

export const useAppStore = create<AppState>((set, get) => ({
  highContrast: loadHC(),
  setHighContrast: (v) => {
    try { localStorage.setItem(STORAGE_HC_KEY, v ? "1" : "0"); } catch(e) { console.error(e) }
    set({ highContrast: v });
  },

  chatByGrade: { 1:[],2:[],3:[],4:[],5:[],6:[] } as Record<Grade, ChatMessage[]>,
  setChatForGrade: (grade, messages) => set((s) => ({
    chatByGrade: { ...s.chatByGrade, [grade]: messages },
  })),

  videoJobs: loadJobs(),
  addVideoJob: (job) => set((s) => {
    const next = [job, ...s.videoJobs];
    saveJobs(next);
    return { videoJobs: next };
  }),
  updateVideoJob: (id, patch) => set((s) => {
    const next = s.videoJobs.map(j => j.id === id ? { ...j, ...patch, updatedAt: Date.now() } : j);
    saveJobs(next);
    return { videoJobs: next };
  }),
}));
