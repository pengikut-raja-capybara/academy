import type { Lesson, ProgressMap } from "../types";

export interface LessonCompletion {
  videoPct: number;
  checklistPct: number;
  isCompleted: boolean;
  lessonPct: number;
}

export function calculateLessonProgress(lesson: Lesson, progress: ProgressMap): LessonCompletion {
  const lessonProgress = progress[lesson.id] ?? (lesson.video ? progress[lesson.video] : undefined);

  if (lesson.type === "exercise") {
    const isCompleted = !!lessonProgress?.completed;
    return {
      videoPct: 0,
      checklistPct: 100,
      isCompleted,
      lessonPct: isCompleted ? 100 : 0,
    };
  }

  if (lessonProgress?.completed) {
    return {
      videoPct: 100,
      checklistPct: 100,
      isCompleted: true,
      lessonPct: 100,
    };
  }

  const currentPos = lessonProgress?.lastWatchedSec ?? 0;
  const duration = lessonProgress?.duration ?? lesson.duration ?? 1;
  const rawVideoPct = Math.min(100, Math.round((currentPos / duration) * 100));
  const minPct = lesson.minWatchPercentage ?? 90;
  const videoPct = Math.min(100, Math.round((rawVideoPct / minPct) * 100));

  const checklistTotal = lesson.checklist?.length ?? 0;
  const checklistDone = Object.values(lessonProgress?.checklist ?? {}).filter(Boolean).length;
  const checklistPct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 100;

  // Final completion: either the explicit flag is set, or both video and checklist are done
  const isCompleted = !!lessonProgress?.completed || (
    (lesson.video ? videoPct >= 100 : true) && 
    (checklistTotal > 0 ? checklistPct === 100 : true)
  );

  let lessonPct = 0;
  if (lesson.video && checklistTotal > 0) {
    lessonPct = Math.round((videoPct + checklistPct) / 2);
  } else if (lesson.video) {
    lessonPct = videoPct;
  } else {
    lessonPct = checklistPct;
  }

  return { videoPct, checklistPct, isCompleted, lessonPct };
}

export function calculateModuleProgress(lessons: Lesson[], progress: ProgressMap, hasSubmission: boolean = false) {
  if (!lessons || lessons.length === 0) {
    return { percentage: 0, completedCount: 0, totalCount: 0, totalSteps: 0, hasStarted: false };
  }

  let totalLessonPctSum = 0;
  let completedCount = 0;
  let hasStarted = false;

  lessons.forEach((lesson) => {
    const { isCompleted, lessonPct } = calculateLessonProgress(lesson, progress);
    totalLessonPctSum += lessonPct;
    if (isCompleted) completedCount++;
    
    // Check if started (any progress exists)
    const lp = progress[lesson.id] ?? (lesson.video ? progress[lesson.video] : undefined);
    if (lp) hasStarted = true;
  });

  const totalSteps = lessons.length + (hasSubmission ? 1 : 0);
  const percentage = Math.round(totalLessonPctSum / lessons.length);

  return {
    percentage,
    completedCount,
    totalCount: lessons.length,
    totalSteps,
    hasStarted
  };
}

