import { CheckCircle2, PlayCircle, FileText, Lock, HelpCircle, Flag } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectLesson } from "../../features/learning/learningSlice";
import type { Module, Lesson } from "../../types";
import { calculateLessonProgress } from "../../utils/progress";


interface LessonSidebarProps {
  modules: Module;
  onLessonSelect?: () => void;
  onOverviewSelect?: () => void;
  onIntroSelect?: () => void;
  isOverviewSelected?: boolean;
  allLessonsCompleted?: boolean;
  hasSubmission?: boolean;
}

export default function LessonSidebar({ modules, onLessonSelect, onOverviewSelect, onIntroSelect, isOverviewSelected, allLessonsCompleted, hasSubmission }: LessonSidebarProps) {
  const dispatch = useAppDispatch();
  const { progress, selectedLessonId } = useAppSelector((state) => state.learning);

  return (
    <div className="space-y-6">
      <button
        onClick={onIntroSelect}
        className="w-full flex items-center justify-between px-2 mb-4 group text-left hover:opacity-80 transition-opacity"
      >
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{modules.title}</h2>
        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{modules.lessons?.length || 0} materi</span>


      </button>

      <div className="space-y-8">
        <div className="space-y-3">
          <ul className="space-y-1">
            {modules.lessons?.map((lesson: Lesson, index: number) => {
              const { isCompleted, lessonPct: pct } = calculateLessonProgress(lesson, progress);


              const isSelected = !isOverviewSelected && selectedLessonId === lesson.id;

              // Lock System: Locked if previous lesson is not completed
              // NOTE: Hanya pakai lesson.id untuk lock check (bukan video ID)
              // agar data lama di localStorage tidak mempengaruhi sistem kunci.
              const prevLesson = index > 0 ? modules.lessons?.[index - 1] : null;
              const prevProgress = prevLesson ? progress[prevLesson.id] : null;

              const prevCurrentPos = prevProgress?.lastWatchedSec || 0;
              const prevDuration = prevProgress?.duration || prevLesson?.duration || 1;
              const prevRawVideoPct = Math.min(100, Math.round((prevCurrentPos / prevDuration) * 100));
              const prevMinPct = prevLesson?.minWatchPercentage || 90;
              const normalizedPrevVideoPct = Math.min(100, Math.round((prevRawVideoPct / prevMinPct) * 100));

              const prevChecklistTotal = prevLesson?.checklist?.length || 0;
              const prevChecklistDone = Object.values(prevProgress?.checklist || {}).filter(Boolean).length;
              const prevChecklistPct = prevChecklistTotal > 0 ? Math.round((prevChecklistDone / prevChecklistTotal) * 100) : 100;

              const prevCompleted =
                prevProgress?.completed ||
                (prevLesson ? prevLesson.type !== "exercise" && (prevLesson.video ? normalizedPrevVideoPct >= 100 : true) && (prevChecklistTotal > 0 ? prevChecklistPct === 100 : true) : true);

              const isLocked = index > 0 && !prevCompleted;

              return (
                <li key={lesson.id} className="relative group/item mt-1">
                  {index > 0 && <div className="h-px bg-slate-200 dark:bg-slate-800 mb-1 mx-2" />}
                  <button
                    onClick={() => {
                      if (!isLocked) {
                        dispatch(selectLesson(lesson.id));
                        onLessonSelect?.();
                      }
                    }}
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
                        {isLocked ? (
                          <Lock size={16} />
                        ) : isCompleted ? (
                          <CheckCircle2 size={18} />
                        ) : lesson.type === "exercise" ? (
                          <HelpCircle size={18} />
                        ) : lesson.video ? (
                          <PlayCircle size={18} />
                        ) : (
                          <FileText size={18} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className={`block font-bold text-[11px] leading-tight mb-1 truncate ${isLocked ? "text-muted-foreground" : isSelected ? "text-primary" : ""}`}>{lesson.title}</span>
                        {(lesson.video || lesson.type === "exercise") && !isLocked && (
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden border border-border/10">
                              <div
                                className={`h-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)] ${isCompleted ? "bg-green-500" : "bg-blue-500"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className={`text-[10px] font-black ${isCompleted ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}`}>{pct}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}

            {/* Overview / Completion Item */}
            {allLessonsCompleted && (
              <li className="relative mt-2">
                <div className="h-px bg-slate-200 dark:bg-slate-800 mb-2" />
                <button
                  onClick={() => onOverviewSelect?.()}
                  className={`w-full text-left transition-all relative p-3 rounded-xl border ${
                    isOverviewSelected ? "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-purple-500/30 shadow-sm" : "bg-transparent border-transparent hover:bg-muted/50"
                  }`}
                >
                  <div className="flex gap-3 items-center">
                    <div className={`flex-shrink-0 ${isOverviewSelected ? "text-purple-500" : "text-muted-foreground"}`}>{hasSubmission ? <Flag size={18} /> : <CheckCircle2 size={18} />}</div>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`block font-bold text-[11px] leading-tight mb-1 truncate ${isOverviewSelected ? "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" : ""}`}
                      >
                        {hasSubmission ? "Tugas Akhir" : "Selesai"}
                      </span>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden border border-border/10">
                          <div
                            className={`h-full transition-all duration-700 ease-out bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]`}
                            style={{ width: `100%` }}
                          />
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isOverviewSelected ? "text-purple-500" : "text-muted-foreground"}`}>
                          {hasSubmission ? "FINAL" : "100%"}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
