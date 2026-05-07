import { Target } from "lucide-react";
import { useAppSelector } from "../../store/hooks";

export default function ProgressCard() {
  const { modules, progress } = useAppSelector((state) => state.learning);

  const allLessons = modules.lessons;

  const totalProgress = allLessons.reduce((acc, lesson) => {
    const lessonProgress = progress[lesson.id] || (lesson.video ? progress[lesson.video] : undefined);
    if (!lessonProgress) return acc;

    const currentPos = lessonProgress.lastWatchedSec || 0;
    const duration = lessonProgress.duration || lesson.duration || 1;
    const rawVideoPct = Math.min(100, Math.round((currentPos / duration) * 100));
    const minPct = lesson.minWatchPercentage || 90;
    const videoPct = Math.min(100, Math.round((rawVideoPct / minPct) * 100));

    const checklistTotal = lesson.checklist?.length || 0;
    const checklistDone = Object.values(lessonProgress.checklist || {}).filter(Boolean).length;
    const checklistPct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 100;

    const isCompleted = lessonProgress.completed || 
      ((lesson.video ? videoPct >= (lesson.minWatchPercentage || 90) : true) && 
      (checklistTotal > 0 ? checklistPct === 100 : true));

    let lessonPct = 0;
    if (lesson.type === "exercise") {
      lessonPct = isCompleted ? 100 : 0;
    } else if (lesson.video && checklistTotal > 0) {
      lessonPct = (videoPct + checklistPct) / 2;
    } else if (lesson.video) {
      lessonPct = videoPct;
    } else {
      lessonPct = checklistPct;
    }

    return acc + lessonPct;
  }, 0);

  const overallPct = allLessons.length > 0 ? Math.round(totalProgress / allLessons.length) : 0;
  const completedCount = allLessons.filter((l) => progress[l.id]?.completed).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-black tracking-tight flex items-center gap-2 uppercase opacity-80">
            <Target size={12} className="text-primary" /> Progres Kursus
          </h3>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 truncate max-w-[180px]">
            {completedCount} dari {allLessons.length} Materi Selesai
          </p>
        </div>
        <div className="text-lg font-black text-primary">{overallPct}%</div>
      </div>

      <div className="relative h-1.5 bg-muted rounded-full overflow-hidden border border-border/50">
        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${overallPct}%` }}>
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
