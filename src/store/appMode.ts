import { create } from "zustand";

type AppMode = "kid" | "parent";

type State = {
  appMode: AppMode;
  enableParentMode: (pin: string) => boolean;
  disableParentMode: () => void;
};

const DEFAULT_PIN = (import.meta as any)?.env?.VITE_PARENT_PIN ?? "2025";

export const useAppMode = create<State>((set, get) => ({
  appMode: "kid",
  enableParentMode: (pin: string) => {
    const ok = String(pin) === String(DEFAULT_PIN);
    if (ok && get().appMode !== "parent") set({ appMode: "parent" });
    return ok;
  },
  disableParentMode: () => set({ appMode: "kid" }),
}));
