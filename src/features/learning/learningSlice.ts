import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Module, ProgressMap, Theme } from "../../types";
import { ALL_MODULES } from "../../data/lessons";
import { fetchAllModules } from "../../services/cms";

interface LearningState {
  allModules: Module[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedModuleId: string;
  progress: ProgressMap;
  selectedLessonId: string;
  theme: Theme;
}

const STORAGE_KEY = "capybara_academy_state";

export const fetchModules = createAsyncThunk('learning/fetchModules', async () => {
  return await fetchAllModules();
});

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
  allModules: [], // Dimulai dari kosong agar sistem melakukan fetch dan menampilkan skeleton
  status: 'idle',
  error: null,
  selectedModuleId: savedState.selectedModuleId || "",
  progress: savedState.progress || {},
  selectedLessonId: savedState.selectedLessonId || "",
  theme: savedState.theme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
};

export const learningSlice = createSlice({
  name: "learning",
  initialState,
  reducers: {
    selectModule: (state, action: PayloadAction<string>) => {
      state.selectedModuleId = action.payload;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    selectLesson: (state, action: PayloadAction<string>) => {
      state.selectedLessonId = action.payload;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    updateProgress: (state, action: PayloadAction<{ videoId: string; second: number; duration: number }>) => {
      const { videoId, second, duration } = action.payload;
      let lesson;
      for (const m of state.allModules) {
        lesson = m.lessons.find((l) => l.video === videoId);
        if (lesson) break;
      }
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
      const checklistTotal = lesson.checklist?.length || 0;
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
      let lesson;
      for (const m of state.allModules) {
        lesson = m.lessons.find(l => l.id === lessonId || l.video === lessonId);
        if (lesson) break;
      }
      if (lesson) {
        const currentPos = state.progress[lessonId].lastWatchedSec;
        const duration = lesson.duration || state.progress[lessonId].duration || 1;
        const minPct = lesson.minWatchPercentage || 90;
        const videoCompleted = lesson.video ? (duration > 0 && (currentPos / duration) >= (minPct / 100)) : true;
        
        const checklistTotal = lesson.checklist?.length || 0;
        const checklistDone = Object.values(state.progress[lessonId].checklist).filter(Boolean).length;
        const checklistCompleted = checklistTotal === 0 || checklistDone === checklistTotal;
        
        state.progress[lessonId].completed = videoCompleted && checklistCompleted;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    completeExercise: (state, action: PayloadAction<{ lessonId: string; answers?: Record<number, number>; score?: number }>) => {
      const { lessonId, answers, score } = action.payload;
      let lesson;
      for (const m of state.allModules) {
        lesson = m.lessons.find((l) => l.id === lessonId);
        if (lesson) break;
      }
      if (!lesson) return;

      if (!state.progress[lessonId]) {
        state.progress[lessonId] = { seen: {}, lastWatchedSec: 0, completed: false, checklist: {} };
      }

      // Mark all checklist items as done
      lesson.checklist?.forEach((_, index) => {
        state.progress[lessonId].checklist[index] = true;
      });

      if (answers) state.progress[lessonId].quizAnswers = answers;
      if (score !== undefined) state.progress[lessonId].quizScore = score;
      state.progress[lessonId].completed = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    resetExercise: (state, action: PayloadAction<string>) => {
      const lessonId = action.payload;
      if (state.progress[lessonId]) {
        state.progress[lessonId].completed = false;
        state.progress[lessonId].checklist = {};
        delete state.progress[lessonId].quizAnswers;
        delete state.progress[lessonId].quizScore;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchModules.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allModules = action.payload;
        
        // If current selectedModuleId is invalid, reset it
        if (!state.allModules.some(m => m.id === state.selectedModuleId)) {
          state.selectedModuleId = state.allModules[0]?.id || "";
        }
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch modules';
      });
  },
});

export const { selectModule, selectLesson, updateProgress, toggleTheme, setTheme, toggleChecklistItem, completeExercise, resetExercise } = learningSlice.actions;
export default learningSlice.reducer;
