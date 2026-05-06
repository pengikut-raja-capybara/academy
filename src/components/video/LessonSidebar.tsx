import { CheckCircle2, PlayCircle, FileText, Lock } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectLesson } from "../../features/learning/learningSlice";

export default function LessonSidebar({ onLessonSelect }: { onLessonSelect?: () => void }) {
  const dispatch = useAppDispatch();
  const { modules, progress, selectedLessonId } = useAppSelector((state) => state.learning);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2 mb-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">{modules.title}</h2>
        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{modules.lessons.length} materi</span>
      </div>

      <div className="space-y-8">
        <div className="space-y-3">
          <ul className="space-y-1">
            {modules.lessons.map((lesson, index) => {
              const lessonProgress = progress[lesson.id] || (lesson.video ? progress[lesson.video] : undefined);
              const currentPos = lessonProgress?.lastWatchedSec || 0;
              const duration = lessonProgress?.duration || lesson.duration || 1;
              const rawVideoPct = Math.min(100, Math.round((currentPos / duration) * 100));
              const minPct = lesson.minWatchPercentage || 90;
              const videoPct = Math.min(100, Math.round((rawVideoPct / minPct) * 100));

              const checklistTotal = lesson.checklist.length;
              const checklistDone = Object.values(lessonProgress?.checklist || {}).filter(Boolean).length;
              const checklistPct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 100;

              // Integrated Progress: Average of video and checklist
              let pct = 0;
              if (lesson.video && checklistTotal > 0) {
                pct = Math.round((videoPct + checklistPct) / 2);
              } else if (lesson.video) {
                pct = videoPct;
              } else {
                pct = checklistPct;
              }

              const isCompleted = (lesson.video ? videoPct >= (lesson.minWatchPercentage || 90) : true) && (checklistTotal > 0 ? checklistPct === 100 : true);
              const isSelected = selectedLessonId === lesson.id;

              // Lock System: Locked if previous lesson is not completed
              const prevLesson = index > 0 ? modules.lessons[index - 1] : null;
              const prevProgress = prevLesson ? progress[prevLesson.id] || (prevLesson.video ? progress[prevLesson.video] : undefined) : null;

              const prevCurrentPos = prevProgress?.lastWatchedSec || 0;
              const prevDuration = prevProgress?.duration || prevLesson?.duration || 1;
              const prevRawVideoPct = Math.min(100, Math.round((prevCurrentPos / prevDuration) * 100));
              const prevMinPct = prevLesson?.minWatchPercentage || 90;
              const normalizedPrevVideoPct = Math.min(100, Math.round((prevRawVideoPct / prevMinPct) * 100));

              const prevChecklistTotal = prevLesson?.checklist.length || 0;
              const prevChecklistDone = Object.values(prevProgress?.checklist || {}).filter(Boolean).length;
              const prevChecklistPct = prevChecklistTotal > 0 ? Math.round((prevChecklistDone / prevChecklistTotal) * 100) : 100;

              const prevCompleted = prevLesson ? (prevLesson.video ? normalizedPrevVideoPct >= 100 : true) && (prevChecklistTotal > 0 ? prevChecklistPct === 100 : true) : true;

              const isLocked = index > 0 && !prevCompleted;

              return (
                <li key={lesson.id} className="relative group/item">
                  <button
                    onClick={() => { if (!isLocked) { dispatch(selectLesson(lesson.id)); onLessonSelect?.(); } }}
                    disabled={isLocked}
                    className={`w-full text-left transition-all relative p-3 rounded-xl border ${
                      isLocked
                        ? "opacity-40 cursor-not-allowed bg-muted/20"
                        : isSelected
                          ? "bg-primary/10 text-primary border-primary shadow-sm"
                          : "bg-transparent text-card-foreground border-transparent hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex gap-3 items-center">
                      <div className={`flex-shrink-0 ${isLocked ? "text-muted-foreground" : isSelected ? "text-primary" : "text-muted-foreground"}`}>
                        {isLocked ? <Lock size={16} /> : isCompleted ? <CheckCircle2 size={18} /> : lesson.video ? <PlayCircle size={18} /> : <FileText size={18} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className={`block font-bold text-[11px] leading-tight mb-1 truncate ${isLocked ? "text-muted-foreground" : isSelected ? "text-primary" : ""}`}>{lesson.title}</span>
                        {lesson.video && !isLocked && (
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden border border-border/10">
                              <div className="h-full bg-blue-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">{pct}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
