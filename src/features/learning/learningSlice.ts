import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Module, ProgressMap, Theme } from "../../types";
import { SAMPLE_MODULES } from "../../data/lessons";

interface LearningState {
  modules: Module;
  progress: ProgressMap;
  selectedLessonId: string;
  theme: Theme;
}

const STORAGE_KEY = "capybara_academy_state";

const loadState = (): Partial<LearningState> => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) return {};
    return JSON.parse(serialized);
  } catch (err) {
    return {};
  }
};

const savedState = loadState();

const initialState: LearningState = {
  modules: SAMPLE_MODULES,
  progress: savedState.progress || {},
  selectedLessonId: savedState.selectedLessonId || SAMPLE_MODULES.lessons[0].id,
  theme: savedState.theme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
};

export const learningSlice = createSlice({
  name: "learning",
  initialState,
  reducers: {
    selectLesson: (state, action: PayloadAction<string>) => {
      state.selectedLessonId = action.payload;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    updateProgress: (state, action: PayloadAction<{ videoId: string; second: number; duration: number }>) => {
      const { videoId, second, duration } = action.payload;
      const lesson = state.modules.lessons.find((l) => l.video === videoId);
      if (!lesson) return;

      if (!state.progress[lesson.id]) {
        state.progress[lesson.id] = { seen: {}, lastWatchedSec: 0, completed: false, checklist: {} };
      }
      state.progress[lesson.id].seen[second] = true;
      state.progress[lesson.id].lastWatchedSec = second;
      state.progress[lesson.id].duration = duration;

      // Check completion
      const currentPos = state.progress[lesson.id].lastWatchedSec;
      const minPct = lesson.minWatchPercentage || 90;
      const videoCompleted = duration > 0 && (currentPos / duration) >= (minPct / 100);
      
      // Auto-check "Tonton video sampai selesai" in checklist if exists
      if (videoCompleted) {
        if (lesson.checklist) {
          const videoCheckIndex = lesson.checklist.findIndex(c => c.toLowerCase().includes("tonton video"));
          if (videoCheckIndex !== -1) {
            state.progress[lesson.id].checklist[videoCheckIndex] = true;
          }
        }
      }

      // Final completion: video >= threshold AND all checklist items checked
      const checklistTotal = lesson.checklist.length;
      const checklistDone = Object.values(state.progress[lesson.id].checklist).filter(Boolean).length;
      const checklistCompleted = checklistTotal === 0 || checklistDone === checklistTotal;
      
      if (videoCompleted && checklistCompleted) {
        state.progress[lesson.id].completed = true;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    toggleChecklistItem: (state, action: PayloadAction<{ lessonId: string; itemIndex: number }>) => {
      const { lessonId, itemIndex } = action.payload;
      if (!state.progress[lessonId]) {
        state.progress[lessonId] = { seen: {}, lastWatchedSec: 0, completed: false, checklist: {} };
      }
      state.progress[lessonId].checklist[itemIndex] = !state.progress[lessonId].checklist[itemIndex];
      
      // Re-check completion when checklist is toggled
      const lesson = state.modules.lessons.find(l => l.id === lessonId || l.video === lessonId);
      if (lesson) {
        const currentPos = state.progress[lessonId].lastWatchedSec;
        const duration = lesson.duration || state.progress[lessonId].duration || 1;
        const minPct = lesson.minWatchPercentage || 90;
        const videoCompleted = lesson.video ? (duration > 0 && (currentPos / duration) >= (minPct / 100)) : true;
        
        const checklistTotal = lesson.checklist.length;
        const checklistDone = Object.values(state.progress[lessonId].checklist).filter(Boolean).length;
        const checklistCompleted = checklistTotal === 0 || checklistDone === checklistTotal;
        
        state.progress[lessonId].completed = videoCompleted && checklistCompleted;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
  },
});

export const { selectLesson, updateProgress, toggleTheme, setTheme, toggleChecklistItem } = learningSlice.actions;
export default learningSlice.reducer;
