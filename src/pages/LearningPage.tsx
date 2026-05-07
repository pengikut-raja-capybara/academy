import { useMemo, useCallback, memo, useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import VideoPlayer from "../components/video/VideoPlayer";
import LessonSidebar from "../components/video/LessonSidebar";
import ProgressCard from "../components/video/ProgressCard";
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { toggleChecklistItem, selectLesson } from "../features/learning/learningSlice";
import type { Lesson, ProgressMap } from "../types";

// ─── Helpers ────────────────────────────────────────────

function calcCompletion(lesson: Lesson, progress: ProgressMap) {
  const lessonProgress = progress[lesson.id] ?? (lesson.video ? progress[lesson.video] : undefined);

  const currentPos = lessonProgress?.lastWatchedSec ?? 0;
  const duration = lessonProgress?.duration ?? lesson.duration ?? 1;
  const rawVideoPct = Math.min(100, Math.round((currentPos / duration) * 100));
  const minPct = lesson.minWatchPercentage ?? 90;
  const videoPct = Math.min(100, Math.round((rawVideoPct / minPct) * 100));

  const checklistTotal = lesson.checklist?.length ?? 0;
  const checklistDone = Object.values(lessonProgress?.checklist ?? {}).filter(Boolean).length;
  const checklistPct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 100;

  const isCompleted = (lesson.video ? videoPct >= 100 : true) && (checklistTotal > 0 ? checklistPct === 100 : true);

  return { lessonProgress, videoPct, checklistPct, isCompleted };
}

// ─── Sub-components ─────────────────────────────────────

const MobileTopBar = memo(function MobileTopBar({
  title,
  currentIdx,
  totalLessons,
  onOpenSidebar,
}: {
  title: string;
  currentIdx: number;
  totalLessons: number;
  onOpenSidebar: () => void;
}) {
  return (
    <div className="lg:hidden shrink-0 h-12 bg-card border-b border-border px-4 flex items-center gap-3">
      <button
        onClick={onOpenSidebar}
        className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
      >
        <Menu size={18} />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black truncate">{title}</p>
        <p className="text-[10px] text-muted-foreground font-bold">
          Materi {currentIdx + 1} / {totalLessons}
        </p>
      </div>
    </div>
  );
});

const SidebarDrawer = memo(function SidebarDrawer({
  isOpen,
  onClose,
  onLessonSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLessonSelect: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 lg:z-auto
          w-[300px] border-r border-border flex flex-col flex-shrink-0
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ backgroundColor: "hsl(var(--background))", zIndex: 50 }}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
          <span className="font-black text-sm uppercase tracking-widest text-muted-foreground">Daftar Materi</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Desktop progress */}
        <div className="p-4 border-b border-border hidden lg:block">
          <ProgressCard />
        </div>

        {/* Lesson list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <div className="lg:hidden mb-4">
            <ProgressCard />
          </div>
          <LessonSidebar onLessonSelect={onLessonSelect} />
        </div>

        {/* Info card (desktop only) */}
        <div className="p-4 mt-auto hidden lg:block">
          <div className="p-4 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 border border-purple-500/10 rounded-2xl">
            <h4 className="font-black text-xs mb-1 flex items-center gap-2 uppercase tracking-widest bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              💡 Info Belajar
            </h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed">Progress tersimpan otomatis. Selesaikan materi untuk mendapatkan badge.</p>
          </div>
        </div>
      </aside>
    </>
  );
});

const LessonContent = memo(function LessonContent({
  lesson,
  currentIdx,
  totalLessons,
}: {
  lesson: Lesson;
  currentIdx: number;
  totalLessons: number;
}) {
  if (lesson.video) {
    return (
      <>
        <VideoPlayer
          key={lesson.id}
          lessonId={lesson.id}
          video={lesson.video}
          title={lesson.title}
          description={lesson.description}
        />
        <div className="pb-6 sm:pb-10 border-t border-border pt-6 sm:pt-10">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-3xl font-black tracking-tight">Detail Materi</h3>
            <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl text-[10px] sm:text-xs font-black text-purple-600 dark:text-purple-400 tracking-wider">
              MATERI {currentIdx + 1} / {totalLessons}
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-lg font-medium">
            {lesson.description || "Tidak ada deskripsi tambahan untuk materi ini."}
          </p>
        </div>
      </>
    );
  }

  return (
    <div className="bg-card border border-border p-6 sm:p-12 rounded-2xl sm:rounded-3xl shadow-xl space-y-6 sm:space-y-8 min-h-[300px] sm:min-h-[500px]">
      <div className="space-y-3 sm:space-y-4">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent pb-1">
          {lesson.title}
        </h1>
        <p className="text-base sm:text-xl text-muted-foreground font-medium leading-relaxed">{lesson.description}</p>
      </div>
      <div className="prose prose-sm sm:prose-lg dark:prose-invert max-w-none border-t border-border pt-6 sm:pt-10">
        <div className="text-base sm:text-lg font-medium leading-loose whitespace-pre-wrap">{lesson.content || "Materi ini tidak memiliki konten teks."}</div>
      </div>
    </div>
  );
});

const ChecklistSection = memo(function ChecklistSection({
  lessonId,
  checklist,
  checklistState,
}: {
  lessonId: string;
  checklist: string[];
  checklistState: Record<string, boolean> | undefined;
}) {
  const dispatch = useAppDispatch();

  if (!checklist || checklist.length === 0) return null;

  return (
    <div className="pb-6 sm:pb-20 border-t border-border pt-6 sm:pt-10 space-y-4 sm:space-y-6">
      <h3 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-3">
        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">✅ Tugas Pembelajaran</span>
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {checklist.map((item, index) => {
          const isDone = checklistState?.[index];
          return (
            <button
              key={index}
              onClick={() => dispatch(toggleChecklistItem({ lessonId, itemIndex: index }))}
              className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl border transition-all text-left group ${
                isDone ? "bg-primary/5 border-primary/20 text-primary" : "bg-card border-border hover:border-primary/50"
              }`}
            >
              <div className={`shrink-0 transition-colors ${isDone ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>
                {isDone ? <CheckCircle2 size={22} /> : <Circle size={22} />}
              </div>
              <span className={`font-bold text-sm sm:text-base ${isDone ? "line-through opacity-60" : ""}`}>{item}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

const NavigationFooter = memo(function NavigationFooter({
  currentIdx,
  totalLessons,
  isCompleted,
  onPrev,
  onNext,
}: {
  currentIdx: number;
  totalLessons: number;
  isCompleted: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === totalLessons - 1;

  return (
    <div className="h-14 sm:h-16 shrink-0 w-full bg-card border-t border-border px-3 sm:px-6 lg:px-10 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          disabled={isFirst}
          onClick={onPrev}
          className="h-9 sm:h-10 px-3 sm:px-5 rounded-xl border border-border font-bold text-xs sm:text-sm hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>
        <div className="h-5 w-px bg-border" />
        <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
          {currentIdx + 1} / {totalLessons}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {!isCompleted && !isLast && (
          <span className="text-[9px] sm:text-[10px] text-amber-500 font-black uppercase tracking-widest hidden sm:block">
            Selesaikan dulu
          </span>
        )}
        <button
          disabled={isLast || !isCompleted}
          onClick={onNext}
          className="h-9 sm:h-10 px-3 sm:px-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white rounded-xl font-bold text-xs sm:text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2"
        >
          <span className="hidden sm:inline">Materi Selanjutnya</span>
          <span className="sm:hidden">Selanjutnya</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
});

// ─── Main Page ──────────────────────────────────────────

export default function LearningPage() {
  const dispatch = useAppDispatch();
  const { modules, progress, selectedLessonId } = useAppSelector((state) => state.learning);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const allLessons = modules.lessons;

  const { selectedLesson, currentIdx } = useMemo(() => {
    const idx = allLessons.findIndex((l) => l.id === selectedLessonId);
    return {
      selectedLesson: idx >= 0 ? allLessons[idx] : allLessons[0],
      currentIdx: Math.max(idx, 0),
    };
  }, [allLessons, selectedLessonId]);

  const { lessonProgress, isCompleted } = useMemo(
    () => calcCompletion(selectedLesson, progress),
    [selectedLesson, progress],
  );

  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);
  const handleOpenSidebar = useCallback(() => setSidebarOpen(true), []);

  const handlePrev = useCallback(() => {
    if (currentIdx > 0) dispatch(selectLesson(allLessons[currentIdx - 1].id));
    setSidebarOpen(false);
  }, [currentIdx, allLessons, dispatch]);

  const handleNext = useCallback(() => {
    if (currentIdx < allLessons.length - 1) dispatch(selectLesson(allLessons[currentIdx + 1].id));
    setSidebarOpen(false);
  }, [currentIdx, allLessons, dispatch]);

  // Scroll to top when lesson changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedLesson.id]);

  return (
    <div className="flex h-[calc(100vh-57px)] sm:h-[calc(100vh-65px)] overflow-hidden bg-background relative">
      <SidebarDrawer
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        onLessonSelect={handleCloseSidebar}
      />

      <div className="flex-1 min-w-0 flex flex-col bg-muted/20 overflow-hidden">
        <MobileTopBar
          title={selectedLesson.title}
          currentIdx={currentIdx}
          totalLessons={allLessons.length}
          onOpenSidebar={handleOpenSidebar}
        />

        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-5 space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
            <LessonContent
              lesson={selectedLesson}
              currentIdx={currentIdx}
              totalLessons={allLessons.length}
            />
            <ChecklistSection
              lessonId={selectedLesson.id}
              checklist={selectedLesson.checklist}
              checklistState={lessonProgress?.checklist}
            />
          </div>
        </div>

        <NavigationFooter
          currentIdx={currentIdx}
          totalLessons={allLessons.length}
          isCompleted={isCompleted}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
