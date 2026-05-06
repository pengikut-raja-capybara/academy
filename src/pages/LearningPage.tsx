import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import VideoPlayer from "../components/video/VideoPlayer";
import LessonSidebar from "../components/video/LessonSidebar";
import ProgressCard from "../components/video/ProgressCard";
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { toggleChecklistItem, selectLesson } from "../features/learning/learningSlice";

export default function LearningPage() {
  const dispatch = useAppDispatch();
  const { modules, progress, selectedLessonId } = useAppSelector((state) => state.learning);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allLessons = modules.lessons;
  const selectedLesson = allLessons.find((l) => l.id === selectedLessonId) || allLessons[0];
  const lessonProgress = progress[selectedLesson.id] || (selectedLesson.video ? progress[selectedLesson.video] : undefined);

  // Progress calculations
  const currentPos = lessonProgress?.lastWatchedSec || 0;
  const duration = lessonProgress?.duration || selectedLesson.duration || 1;
  const rawVideoPct = Math.min(100, Math.round((currentPos / duration) * 100));
  const minPct = selectedLesson.minWatchPercentage || 90;
  const videoPct = Math.min(100, Math.round((rawVideoPct / minPct) * 100));

  const checklistTotal = selectedLesson.checklist?.length || 0;
  const checklistDone = Object.values(lessonProgress?.checklist || {}).filter(Boolean).length;
  const checklistPct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 100;

  const isCurrentCompleted = (selectedLesson.video ? videoPct >= 100 : true) && (checklistTotal > 0 ? checklistPct === 100 : true);

  const currentIdx = allLessons.findIndex((l) => l.id === selectedLessonId);
  const isLastLesson = currentIdx === allLessons.length - 1;
  const isFirstLesson = currentIdx === 0;

  const navigateLesson = (direction: "prev" | "next") => {
    if (direction === "prev" && currentIdx > 0) dispatch(selectLesson(allLessons[currentIdx - 1].id));
    if (direction === "next" && currentIdx < allLessons.length - 1) dispatch(selectLesson(allLessons[currentIdx + 1].id));
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-57px)] sm:h-[calc(100vh-65px)] overflow-hidden bg-background relative">

      {/* ─── Mobile Sidebar Backdrop ──────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar (Desktop: Fixed, Mobile: Drawer) ── */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 lg:z-auto
          w-[300px] border-r border-border flex flex-col flex-shrink-0
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ backgroundColor: "hsl(var(--background))", zIndex: 50 }}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
          <span className="font-black text-sm uppercase tracking-widest text-muted-foreground">Daftar Materi</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 border-b border-border hidden lg:block">
          <ProgressCard />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <div className="lg:hidden mb-4">
            <ProgressCard />
          </div>
          <LessonSidebar onLessonSelect={() => setSidebarOpen(false)} />
        </div>

        <div className="p-4 mt-auto hidden lg:block">
          <div className="p-4 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 border border-purple-500/10 rounded-2xl">
            <h4 className="font-black text-xs mb-1 flex items-center gap-2 uppercase tracking-widest bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              💡 Info Belajar
            </h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed">Progress tersimpan otomatis. Selesaikan materi untuk mendapatkan badge.</p>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col bg-muted/20 overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="lg:hidden shrink-0 h-12 bg-card border-b border-border px-4 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Menu size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black truncate">{selectedLesson.title}</p>
            <p className="text-[10px] text-muted-foreground font-bold">
              Materi {currentIdx + 1} / {allLessons.length}
            </p>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-5 space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
            {selectedLesson.video ? (
              <VideoPlayer
                key={selectedLesson.id}
                lessonId={selectedLesson.id}
                video={selectedLesson.video}
                title={selectedLesson.title}
                description={selectedLesson.description}
              />
            ) : (
              <div className="bg-card border border-border p-6 sm:p-12 rounded-2xl sm:rounded-3xl shadow-xl space-y-6 sm:space-y-8 min-h-[300px] sm:min-h-[500px]">
                <div className="space-y-3 sm:space-y-4">
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent pb-1">
                    {selectedLesson.title}
                  </h1>
                  <p className="text-base sm:text-xl text-muted-foreground font-medium leading-relaxed">{selectedLesson.description}</p>
                </div>
                <div className="prose prose-sm sm:prose-lg dark:prose-invert max-w-none border-t border-border pt-6 sm:pt-10">
                  <div className="text-base sm:text-lg font-medium leading-loose whitespace-pre-wrap">{selectedLesson.content || "Materi ini tidak memiliki konten teks."}</div>
                </div>
              </div>
            )}

            {selectedLesson.video && (
              <div className="pb-6 sm:pb-10 border-t border-border pt-6 sm:pt-10">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-3xl font-black tracking-tight">Detail Materi</h3>
                  <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl text-[10px] sm:text-xs font-black text-purple-600 dark:text-purple-400 tracking-wider">
                    MATERI {currentIdx + 1} / {allLessons.length}
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-lg font-medium">
                  {selectedLesson.description || "Tidak ada deskripsi tambahan untuk materi ini."}
                </p>
              </div>
            )}

            {/* Checklist */}
            {selectedLesson.checklist && selectedLesson.checklist.length > 0 && (
              <div className="pb-6 sm:pb-20 border-t border-border pt-6 sm:pt-10 space-y-4 sm:space-y-6">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-3">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">✅ Tugas Pembelajaran</span>
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {selectedLesson.checklist.map((item, index) => {
                    const isDone = lessonProgress?.checklist?.[index];
                    return (
                      <button
                        key={index}
                        onClick={() => dispatch(toggleChecklistItem({ lessonId: selectedLesson.id, itemIndex: index }))}
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
            )}
          </div>
        </div>

        {/* ─── Static Navigation Footer ─────────────────── */}
        <div className="h-14 sm:h-16 shrink-0 w-full bg-card border-t border-border px-3 sm:px-6 lg:px-10 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              disabled={isFirstLesson}
              onClick={() => navigateLesson("prev")}
              className="h-9 sm:h-10 px-3 sm:px-5 rounded-xl border border-border font-bold text-xs sm:text-sm hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>
            <div className="h-5 w-px bg-border" />
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
              {currentIdx + 1} / {allLessons.length}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {!isCurrentCompleted && !isLastLesson && (
              <span className="text-[9px] sm:text-[10px] text-amber-500 font-black uppercase tracking-widest hidden sm:block">
                Selesaikan dulu
              </span>
            )}
            <button
              disabled={isLastLesson || !isCurrentCompleted}
              onClick={() => navigateLesson("next")}
              className="h-9 sm:h-10 px-3 sm:px-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white rounded-xl font-bold text-xs sm:text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2"
            >
              <span className="hidden sm:inline">Materi Selanjutnya</span>
              <span className="sm:hidden">Selanjutnya</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
