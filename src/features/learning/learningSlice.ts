import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Module, ProgressMap, Theme } from "../../types";
import { fetchModuleIndex, fetchModuleBySlug } from "../../services/cms";
import localforage from "localforage";
import { PERSISTENCE_KEY } from "../../store/persistence";

interface LearningState {
  allModules: Module[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  detailStatus: Record<string, 'loading' | 'succeeded' | 'failed'>;
  error: string | null;
  selectedModuleId: string;
  progress: ProgressMap;
  selectedLessonId: string;
  theme: Theme;
  userName: string | null;
  isInitialized: boolean;
}

export const initializeState = createAsyncThunk('learning/initializeState', async () => {
  return await localforage.getItem<Partial<LearningState>>(PERSISTENCE_KEY);
});

export const fetchModules = createAsyncThunk('learning/fetchModules', async () => {
  return await fetchModuleIndex();
});

export const fetchModuleDetail = createAsyncThunk('learning/fetchModuleDetail', async (slug: string) => {
  return await fetchModuleBySlug(slug);
});

const initialState: LearningState = {
  allModules: [],
  status: 'idle',
  detailStatus: {},
  error: null,
  selectedModuleId: "",
  progress: {},
  selectedLessonId: "",
  theme: (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") as Theme,
  userName: null,
  isInitialized: false,
};

export const learningSlice = createSlice({
  name: "learning",
  initialState,
  reducers: {
    selectModule: (state, action: PayloadAction<string>) => {
      state.selectedModuleId = action.payload;
    },
    selectLesson: (state, action: PayloadAction<string>) => {
      state.selectedLessonId = action.payload;
    },
    updateProgress: (state, action: PayloadAction<{ videoId: string; second: number; duration: number }>) => {
      const { videoId, second, duration } = action.payload;
      let lesson;
      for (const m of state.allModules) {
        lesson = m.lessons?.find((l) => l.video === videoId);
        if (lesson) break;
      }
      if (!lesson) return;

      if (!state.progress[lesson.id]) {
        state.progress[lesson.id] = { seen: {}, lastWatchedSec: 0, completed: false, checklist: {} };
      }
      state.progress[lesson.id].videoUnavailable = false;
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

    },
    setVideoAvailability: (state, action: PayloadAction<{ lessonId: string; available: boolean }>) => {
      const { lessonId, available } = action.payload;
      if (!state.progress[lessonId]) {
        state.progress[lessonId] = { seen: {}, lastWatchedSec: 0, completed: false, checklist: {} };
      }

      state.progress[lessonId].videoUnavailable = !available;

    },
    importProgress: (state, action: PayloadAction<any>) => {
      const payload = action.payload;
      if (!payload || typeof payload !== "object") return;

      // 1. Identify where the progress data is
      let rawProgress = {};
      if (payload.progress && typeof payload.progress === "object") {
        rawProgress = payload.progress;
        if (payload.userName) state.userName = payload.userName;
      } else {
        rawProgress = payload;
      }

      // 2. Clear current progress and apply new one (deep copy for safety)
      state.progress = { ...rawProgress };
      
      // 3. Persist everything
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
    toggleChecklistItem: (state, action: PayloadAction<{ lessonId: string; itemIndex: number }>) => {
      const { lessonId, itemIndex } = action.payload;
      if (!state.progress[lessonId]) {
        state.progress[lessonId] = { seen: {}, lastWatchedSec: 0, completed: false, checklist: {} };
      }
      state.progress[lessonId].checklist[itemIndex] = !state.progress[lessonId].checklist[itemIndex];
      
      // Re-check completion when checklist is toggled
      const lesson = state.allModules
        .flatMap((m) => m.lessons || [])
        .find((l) => l.id === lessonId || l.video === lessonId);

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

    },
    completeExercise: (state, action: PayloadAction<{ lessonId: string; answers?: Record<number, number>; score?: number }>) => {
      const { lessonId, answers, score } = action.payload;
      const lesson = state.allModules
        .flatMap((m) => m.lessons || [])
        .find((l) => l.id === lessonId);

      if (!lesson) return;

      if (!state.progress[lessonId]) {
        state.progress[lessonId] = { seen: {}, lastWatchedSec: 0, completed: false, checklist: {} };
      }

      // Mark all checklist items as done
      lesson.checklist?.forEach((_, idx) => {
        state.progress[lessonId].checklist[idx] = true;
      });

      if (answers) state.progress[lessonId].quizAnswers = answers;
      if (score !== undefined) state.progress[lessonId].quizScore = score;
      state.progress[lessonId].completed = true;
    },
    resetExercise: (state, action: PayloadAction<string>) => {
      const lessonId = action.payload;
      if (state.progress[lessonId]) {
        state.progress[lessonId].completed = false;
        state.progress[lessonId].checklist = {};
        delete state.progress[lessonId].quizAnswers;
        delete state.progress[lessonId].quizScore;
      }
    },
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeState.fulfilled, (state, action) => {
        if (action.payload) {
          const saved = action.payload;
          if (saved.allModules) state.allModules = saved.allModules;
          if (saved.progress) state.progress = saved.progress;
          if (saved.selectedModuleId) state.selectedModuleId = saved.selectedModuleId;
          if (saved.selectedLessonId) state.selectedLessonId = saved.selectedLessonId;
          if (saved.theme) state.theme = saved.theme;
          if (saved.userName) state.userName = saved.userName;
        }
        state.isInitialized = true;
      })
      .addCase(fetchModules.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        // Merge: preserve lessons dari index, atau dari existing detail fetch
        state.allModules = (action.payload as Module[]).map((indexMod) => {
          const existing = state.allModules.find(m => m.id === indexMod.id || m.slug === indexMod.slug);
          // Priority: lessons dari indexMod > lessons dari existing detail > tidak ada lessons
          const lessons = indexMod.lessons || existing?.lessons;
          return { ...indexMod, ...(lessons && { lessons }) };
        });
        
        // If current selectedModuleId is invalid, reset it
        if (!state.allModules.some(m => m.id === state.selectedModuleId)) {
          state.selectedModuleId = state.allModules[0]?.id || "";
        }
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch modules';
      })
      .addCase(fetchModuleDetail.pending, (state, action) => {
        state.detailStatus[action.meta.arg] = 'loading';
      })
      .addCase(fetchModuleDetail.fulfilled, (state, action) => {
        state.detailStatus[action.meta.arg] = 'succeeded';
        const fullModule = action.payload;
        const index = state.allModules.findIndex(m => m.id === fullModule.id || m.slug === fullModule.slug);
        
        if (index !== -1) {
          state.allModules[index] = { ...state.allModules[index], ...fullModule };
        } else {
          state.allModules.push(fullModule);
        }
      })
      .addCase(fetchModuleDetail.rejected, (state, action) => {
        state.detailStatus[action.meta.arg] = 'failed';
      });
  },
});

export const { selectModule, selectLesson, updateProgress, setVideoAvailability, importProgress, toggleTheme, setTheme, toggleChecklistItem, completeExercise, resetExercise, setUserName } = learningSlice.actions;
export default learningSlice.reducer;
