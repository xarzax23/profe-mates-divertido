import type { GameProgress } from "@/types/activity";

const PROGRESS_PREFIX = "progress:";

export function saveProgress(progress: GameProgress): void {
  try {
    const key = `${PROGRESS_PREFIX}${progress.activityId}`;
    localStorage.setItem(key, JSON.stringify(progress));
  } catch (error) {
    console.warn("No se pudo guardar el progreso:", error);
  }
}

export function getProgress(activityId: string): GameProgress | null {
  try {
    const key = `${PROGRESS_PREFIX}${activityId}`;
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as GameProgress) : null;
  } catch (error) {
    console.warn("No se pudo cargar el progreso:", error);
    return null;
  }
}

export function getAllProgress(): GameProgress[] {
  try {
    const all: GameProgress[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(PROGRESS_PREFIX)) {
        const val = localStorage.getItem(k);
        if (val) all.push(JSON.parse(val) as GameProgress);
      }
    }
    return all;
  } catch (error) {
    console.warn("No se pudo cargar el progreso:", error);
    return [];
  }
}
