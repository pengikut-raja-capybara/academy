import { useMemo } from "react";
import { useAppSelector } from "../store/hooks";
import { calculateModuleProgress } from "../utils/progress";
import type { Module } from "../types";

export function useDashboardStats() {
  const allModules = useAppSelector((state) => state.learning.allModules);
  const progress = useAppSelector((state) => state.learning.progress);

  const stats = useMemo(() => {
    let totalCompletedLessons = 0;
    let totalLessonsCount = 0;
    let totalWatchTimeSec = 0;
    const moduleStats: (Module & { progress: number; completedLessons: number; totalLessons: number; watchSec: number })[] = [];
    const completedModules: Module[] = [];
    let activeModulesCount = 0;
    let overallProgressSum = 0;

    for (const module of allModules) {
      const { percentage, completedCount, totalCount, hasStarted } = calculateModuleProgress(module.lessons || [], progress, !!module.submissionUrl);

      totalCompletedLessons += completedCount;
      totalLessonsCount += totalCount;

      if (hasStarted) {
        activeModulesCount++;
        overallProgressSum += percentage;
      }

      let modWatchSec = 0;
      module.lessons?.forEach((lesson) => {
        const lp = progress[lesson.id] || (lesson.video ? progress[lesson.video] : undefined);
        if (lp) modWatchSec += lp.lastWatchedSec || 0;
      });
      totalWatchTimeSec += modWatchSec;

      if (hasStarted || percentage > 0) {
        moduleStats.push({
          ...module,
          progress: percentage,
          completedLessons: completedCount,
          totalLessons: totalCount,
          watchSec: modWatchSec,
        });
      }

      if (percentage >= 100) {
        completedModules.push(module);
      }
    }

    moduleStats.sort((a, b) => b.progress - a.progress);

    return {
      totalCompletedLessons,
      totalLessonsCount,
      totalWatchTimeSec,
      moduleStats,
      completedModules,
      activeModulesCount,
      overallProgress: activeModulesCount > 0 ? Math.round(overallProgressSum / activeModulesCount) : 0,
    };
  }, [allModules, progress]);

  return stats;
}

export function formatSeconds(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}j ${minutes}m`;
  return `${minutes}m`;
}
