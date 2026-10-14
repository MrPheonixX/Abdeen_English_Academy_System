import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";
export type UserRole = "student" | "teacher" | "admin";

export interface AcademyUser {
  id: string;
  name: string;
  role: UserRole;
}

interface AcademyState {
  user: AcademyUser | null;
  theme: Theme;
  setUser: (user: AcademyUser | null) => void;
  toggleTheme: () => void;
}

/** Global academy state, saved in localStorage under `abdeen-academy-storage`. */
export const useAcademyStore = create<AcademyState>()(
  persist(
    (set) => ({
      user: null,
      theme: "light",
      setUser: (user) => set({ user }),
      toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
    }),
    { name: "abdeen-academy-storage" },
  ),
);
