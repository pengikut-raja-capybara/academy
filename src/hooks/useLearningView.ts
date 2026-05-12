import { useState, useMemo, useEffect, useCallback } from "react";
import { calculateLessonProgress } from "../utils/progress";
import type { Lesson, Progress } from "../types";

const VIEW_STATE_KEY = "capybara_academy_learning_view_state";

function loadViewState() {
  try {
    const serialized = localStorage.getItem(VIEW_STATE_KEY);
    return serialized ? (JSON.parse(serialized) as Record<string, { mode: "intro" | "overview" | "lesson"; lessonId?: string }>) : {};
  } catch {
    return {};
  }
}

function saveViewState(state: Record<string, { mode: "intro" | "overview" | "lesson"; lessonId?: string }>) {
  try {
    localStorage.setItem(VIEW_STATE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage failures.
  }
}

export function useLearningView(moduleId: string | undefined, allLessons: Lesson[], progress: Record<string, Progress>) {
  const [viewOverride, setViewOverride] = useState<{
    moduleId: string;
    mode: "intro" | "overview" | "lesson";
    lessonId?: string;
  } | null>(() => {
    if (!moduleId) return null;
    const savedState = loadViewState();
    return savedState[moduleId] ? { moduleId, ...savedState[moduleId] } : null;
  });

  useEffect(() => {
    if (!moduleId) return;
    const savedState = loadViewState();
    if (viewOverride && viewOverride.moduleId === moduleId) {
      savedState[moduleId] = { mode: viewOverride.mode, lessonId: viewOverride.lessonId };
    } else {
      delete savedState[moduleId];
    }
    saveViewState(savedState);
  }, [moduleId, viewOverride]);

  const autoViewMode = useMemo<"intro" | "overview" | "lesson">(() => {
    if (allLessons.length === 0) return "lesson";

    const hasAnyProgress = allLessons.some((lesson) => {
      const lessonProgress = progress[lesson.id];
      return lessonProgress && (lessonProgress.completed || (lessonProgress.lastWatchedSec ?? 0) > 0 || Object.keys(lessonProgress.checklist || {}).length > 0);
    });

    const allLessonsCompleted = allLessons.every((lesson) => calculateLessonProgress(lesson, progress).isCompleted);

    if (allLessonsCompleted) return "overview";
    if (!hasAnyProgress) return "intro";
    return "lesson";
  }, [allLessons, progress]);

  const effectiveViewMode = viewOverride && viewOverride.moduleId === moduleId ? viewOverride.mode : autoViewMode;

  const setViewMode = useCallback((mode: "intro" | "overview" | "lesson", lessonId?: string) => {
    if (moduleId) {
      setViewOverride({ moduleId, mode, lessonId });
    }
  }, [moduleId]);

  return {
    effectiveViewMode,
    autoViewMode,
    setViewMode,
    viewOverride,
  };
}
