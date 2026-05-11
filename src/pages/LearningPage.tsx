import { useMemo, useCallback, memo, useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import VideoPlayer from "../components/video/VideoPlayer";
import LessonSidebar from "../components/video/LessonSidebar";
import ProgressCard from "../components/video/ProgressCard";
import {
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  X,
  ClipboardCheck,
  ExternalLink,
  Download,
  FileText,
  FileArchive,
  Image as ImageIcon,
  Link as LinkIcon,
  Paperclip,
  BookOpen,
} from "lucide-react";
import { toggleChecklistItem, selectLesson, selectModule, completeExercise, resetExercise, fetchModuleDetail } from "../features/learning/learningSlice";
import QuizPlayer from "../components/exercise/QuizPlayer";
import type { Lesson, Attachment, Module } from "../types";
import { resolveAssetUrl } from "../services/cms";
import { toSafeHtml } from "../utils/markdown";
import { calculateLessonProgress } from "../utils/progress";

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

const SidebarDrawer = memo(function SidebarDrawer({
  isOpen,
  onClose,
  onLessonSelect,
  onOverviewSelect,
  onIntroSelect,
  isOverviewSelected,
  allLessonsCompleted,
  hasSubmission,
  modules,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLessonSelect: () => void;
  onOverviewSelect: () => void;
  onIntroSelect: () => void;
  isOverviewSelected: boolean;
  allLessonsCompleted: boolean;
  hasSubmission: boolean;
  modules: Module;
}) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" onClick={onClose} />}

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
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Desktop progress */}
        <div className="p-4 border-b border-border hidden lg:block">
          <ProgressCard module={modules} />
        </div>

        {/* Lesson list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <div className="lg:hidden mb-4">
            <ProgressCard module={modules} />
          </div>
          <LessonSidebar
            modules={modules}
            onLessonSelect={onLessonSelect}
            onOverviewSelect={onOverviewSelect}
            onIntroSelect={onIntroSelect}
            isOverviewSelected={isOverviewSelected}
            allLessonsCompleted={allLessonsCompleted}
            hasSubmission={hasSubmission}
          />
        </div>

        {/* Info card (desktop only) */}
        <div className="p-4 mt-auto hidden lg:block">
          <div className="p-4 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 border border-purple-500/10 rounded-2xl">
            <h4 className="font-black text-xs mb-1 flex items-center gap-2 uppercase tracking-widest bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">💡 Info Belajar</h4>
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
  onExerciseComplete,
  onExerciseReset,
  isAlreadyCompleted,
  savedAnswers,
  savedScore,
}: {
  lesson: Lesson;
  currentIdx: number;
  totalLessons: number;
  onExerciseComplete: (lessonId: string, answers?: Record<number, number>, score?: number) => void;
  onExerciseReset: (lessonId: string) => void;
  isAlreadyCompleted: boolean;
  savedAnswers?: Record<number, number>;
  savedScore?: number;
}) {
  if (lesson.type === "exercise") {
    return (
      <div className="space-y-6 sm:space-y-10">
        <QuizPlayer
          lesson={lesson}
          onComplete={(answers, score) => onExerciseComplete(lesson.id, answers, score)}
          onReset={() => onExerciseReset(lesson.id)}
          isAlreadyCompleted={isAlreadyCompleted}
          savedAnswers={savedAnswers}
          savedScore={savedScore}
        />
        <div className="pb-6 sm:pb-10 border-t border-border pt-6 sm:pt-10">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-3xl font-black tracking-tight">Kuis Materi</h3>
            <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl text-[10px] sm:text-xs font-black text-purple-600 dark:text-purple-400 tracking-wider">
              LATIHAN {currentIdx + 1} / {totalLessons}
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-lg font-medium">{lesson.description || "Selesaikan kuis ini untuk menguji pemahamanmu."}</p>
        </div>
      </div>
    );
  }

  if (lesson.video || lesson.type === "video") {
    return (
      <>
        <VideoPlayer key={lesson.id} lessonId={lesson.id} video={lesson.video} title={lesson.title} description={lesson.description} />
        <div className="pb-6 sm:pb-10 border-t border-border pt-6 sm:pt-10">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-3xl font-black tracking-tight">Detail Materi</h3>
            <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl text-[10px] sm:text-xs font-black text-purple-600 dark:text-purple-400 tracking-wider">
              MATERI {currentIdx + 1} / {totalLessons}
            </div>
          </div>
          {lesson.description ? (
            <div className="prose prose-sm sm:prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: toSafeHtml(lesson.description) }} />
          ) : (
            <p className="text-muted-foreground text-sm sm:text-base font-medium">Tidak ada deskripsi tambahan untuk materi ini.</p>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="bg-card border border-border p-6 sm:p-12 rounded-2xl sm:rounded-3xl shadow-xl space-y-6 sm:space-y-8 min-h-[300px] sm:min-h-[500px]">
      <div className="space-y-3 sm:space-y-4">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent pb-1">{lesson.title}</h1>
        {lesson.description && (
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-base sm:text-xl text-muted-foreground font-medium leading-relaxed"
            dangerouslySetInnerHTML={{ __html: toSafeHtml(lesson.description) }}
          />
        )}
      </div>
      <div className="prose prose-sm sm:prose-lg dark:prose-invert max-w-none border-t border-border pt-6 sm:pt-10">
        {lesson.content ? (
          <div dangerouslySetInnerHTML={{ __html: toSafeHtml(lesson.content) }} />
        ) : (
          <p className="text-base sm:text-lg font-medium text-muted-foreground">Materi ini tidak memiliki konten teks.</p>
        )}
      </div>
    </div>
  );
});

const AttachmentsSection = memo(function AttachmentsSection({ attachments, title = "Lampiran Materi" }: { attachments: Attachment[]; title?: string }) {
  if (!attachments || attachments.length === 0) return null;

  const getIcon = (type?: string) => {
    switch (type) {
      case "pdf":
        return <FileText size={18} />;
      case "zip":
        return <FileArchive size={18} />;
      case "image":
        return <ImageIcon size={18} />;
      case "link":
        return <LinkIcon size={18} />;
      default:
        return <FileText size={18} />;
    }
  };

  return (
    <div className="pb-6 border-t border-border pt-6 sm:pt-10 space-y-4 sm:space-y-6">
      <h3 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-3">
        <Paperclip className="text-blue-500" size={24} />
        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">{title}</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {attachments.map((item, index) => (
          <a
            key={index}
            href={resolveAssetUrl(item.file || item.url || "")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 sm:gap-4 p-4 rounded-xl border border-border bg-card hover:border-blue-500/50 hover:shadow-md transition-all group"
          >
            <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
              {getIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{item.title}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">{item.type || "file"}</p>
            </div>
            <div className="shrink-0 text-muted-foreground group-hover:text-blue-500 transition-colors">
              <Download size={18} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
});

const ChecklistSection = memo(function ChecklistSection({ lessonId, checklist, checklistState }: { lessonId: string; checklist: string[]; checklistState: Record<string, boolean> | undefined }) {
  const dispatch = useAppDispatch();

  if (!checklist || checklist.length === 0) return null;

  return (
    <div className="pb-6 sm:pb-20 border-t border-border pt-6 sm:pt-10 space-y-4 sm:space-y-6">
      <h3 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-3">
        <ClipboardCheck className="text-purple-500" size={24} />
        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">Target Belajar</span>
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
  isOverview,
  onPrev,
  onNext,
}: {
  currentIdx: number;
  totalLessons: number;
  isCompleted: boolean;
  isOverview: boolean;
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
          {currentIdx >= totalLessons ? "Ringkasan" : `${currentIdx + 1} / ${totalLessons}`}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {!isOverview && !isCompleted && !isLast && <span className="text-[9px] sm:text-[10px] text-amber-500 font-black uppercase tracking-widest hidden sm:block">Selesaikan dulu</span>}
        <button
          disabled={isOverview || !isCompleted}
          onClick={onNext}
          className="h-9 sm:h-10 px-3 sm:px-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white rounded-xl font-bold text-xs sm:text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2"
        >
          <span className="hidden sm:inline">{isOverview ? "Selesai" : "Materi Selanjutnya"}</span>
          <span className="sm:hidden">{isOverview ? "Selesai" : "Selanjutnya"}</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
});

// ─── Module Intro Screen ──────────────────────────────────

const ModuleIntroScreen = memo(function ModuleIntroScreen({
  moduleTitle,
  moduleDescription,
  totalLessons,
  exerciseCount,
  progressState,
  onStart,
  onViewSummary,
}: {
  moduleTitle: string;
  moduleDescription?: string;
  totalLessons: number;
  exerciseCount: number;
  progressState: "none" | "partial" | "done";
  onStart: () => void;
  onViewSummary: () => void;
}) {
  const buttonConfig = {
    none: { label: "Mulai Belajar", icon: <ChevronRight size={20} />, action: onStart },
    partial: { label: "Lanjut Belajar", icon: <ChevronRight size={20} />, action: onStart },
    done: { label: "Lihat Ringkasan", icon: <ChevronRight size={20} />, action: onViewSummary },
  }[progressState];

  const badgeConfig = {
    none: { text: "Selamat Datang", color: "text-blue-500" },
    partial: { text: "Lanjutkan Belajar", color: "text-amber-500" },
    done: { text: "Selesai", color: "text-green-500" },
  }[progressState];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-5 mb-10 sm:mb-14">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl shadow-purple-500/30 mb-2">
          <BookOpen size={28} className="text-white" />
        </div>
        <p className={`text-[11px] font-black uppercase tracking-widest ${badgeConfig.color}`}>{badgeConfig.text}</p>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{moduleTitle}</h1>
        {moduleDescription && <p className="text-muted-foreground font-medium text-sm sm:text-sm max-w-2xl mx-auto leading-relaxed whitespace-pre-wrap">{moduleDescription}</p>}
      </div>

      <div className={`grid gap-3 sm:gap-4 mb-10 sm:mb-14 ${exerciseCount > 0 ? "grid-cols-2" : "grid-cols-1 max-w-xs mx-auto"}`}>
        <div className="bg-card border border-border rounded-2xl p-2 text-center space-y-1 shadow-sm">
          <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{totalLessons}</div>
          <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Total Materi</p>
        </div>
        {exerciseCount > 0 && (
          <div className="bg-card border border-border rounded-2xl p-2 text-center space-y-1 shadow-sm">
            <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">{exerciseCount}</div>
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Latihan Soal</p>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={buttonConfig.action}
          className="cursor-pointer inline-flex items-center gap-3 py-4 px-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white rounded-2xl font-black text-base hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.03] transition-all duration-200"
        >
          {buttonConfig.label}
          {buttonConfig.icon}
        </button>
      </div>
    </div>
  );
});

// ─── Module Overview Screen ──────────────────────────────────

const ModuleOverviewScreen = memo(function ModuleOverviewScreen({
  moduleTitle,
  moduleDescription,
  submissionUrl,
  submissionDescription,
  submissionAttachments,
  totalLessons,
  averageScore,
  exerciseCount,
}: {
  moduleTitle: string;
  moduleDescription?: string;
  submissionUrl?: string;
  submissionDescription?: string;
  submissionAttachments?: Attachment[];
  totalLessons: number;
  averageScore: number | null;
  exerciseCount: number;
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="w-full">
        {/* Header */}
        <div className="text-center space-y-3 mb-10 sm:mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl shadow-purple-500/30 mb-2">
            {submissionUrl ? <ExternalLink size={28} className="text-white" /> : <CheckCircle2 size={28} className="text-white" />}
          </div>
          <p className="text-[11px] font-black uppercase tracking-widest text-purple-500">Selamat 🎉 — Semua Materi Selesai</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{moduleTitle}</h1>
          {moduleDescription && <p className="text-muted-foreground font-medium text-sm sm:text-base max-w-xl mx-auto leading-relaxed">{moduleDescription}</p>}
        </div>

        {/* Stats */}
        <div className={`grid gap-3 sm:gap-4 mb-10 sm:mb-14 ${exerciseCount > 0 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 text-center sm:text-left space-y-1 shadow-sm">
            <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{totalLessons}</div>
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Materi Diselesaikan</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 text-center sm:text-left space-y-1 shadow-sm">
            <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">100%</div>
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Progres Modul</p>
          </div>
          {exerciseCount > 0 && averageScore !== null && (
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 text-center sm:text-left space-y-1 shadow-sm border-purple-500/20">
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                {averageScore % 1 === 0 ? averageScore.toFixed(0) : averageScore.toFixed(2).replace(".", ",")}
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Rata-rata Nilai latihan</p>
            </div>
          )}
        </div>

        {/* Submission CTA — hanya tampil jika ada submissionUrl */}
        {submissionUrl ? (
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-purple-500/20 bg-gradient-to-br from-blue-500/5 via-purple-500/10 to-pink-500/5 p-6 sm:p-10 space-y-5">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative space-y-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">Kumpulkan Tugas Akhir</h2>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">Kamu telah menyelesaikan seluruh materi. Pastikan tugasmu sudah siap sebelum submit.</p>
            </div>

            {/* Detail tugas */}
            {submissionDescription && (
              <div className="relative bg-background/60 border border-border rounded-xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <ClipboardCheck size={14} className="text-purple-500 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Detail Tugas</span>
                </div>
                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap text-foreground/80">{submissionDescription}</p>
              </div>
            )}

            {/* Lampiran Tugas */}
            {submissionAttachments && submissionAttachments.length > 0 && (
              <div className="mt-4">
                <AttachmentsSection attachments={submissionAttachments} title="Lampiran Tugas" />
              </div>
            )}

            <a
              href={submissionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-2 py-3.5 px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] transition-all duration-200"
            >
              Kumpulkan Tugas
              <ExternalLink size={15} />
            </a>
          </div>
        ) : (
          <div className="rounded-2xl sm:rounded-3xl border border-green-500/20 bg-green-500/5 p-6 sm:p-8 text-center space-y-2">
            <CheckCircle2 size={32} className="text-green-500 mx-auto" />
            <h2 className="text-lg font-black tracking-tight">Modul Ini Telah Selesai!</h2>
            <p className="text-sm text-muted-foreground font-medium">Tidak ada tugas yang perlu dikumpulkan untuk modul ini. Lanjutkan ke modul berikutnya.</p>
          </div>
        )}
      </div>
    </div>
  );
});

// ─── Main Page ──────────────────────────────────────────


export default function LearningPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { allModules, progress, selectedLessonId, selectedModuleId, detailStatus, userName } = useAppSelector((state) => state.learning);

  // Redirect to welcome if no username
  useEffect(() => {
    if (!userName) {
      navigate(`/welcome?redirect=${encodeURIComponent(`/learning/${id}`)}`, { replace: true });
    }
  }, [userName, navigate, id]);

  const modules = useMemo(() => {
    return allModules.find((m) => m.slug === id || m.id === id);
  }, [allModules, id]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewOverride, setViewOverride] = useState<{
    moduleId: string;
    mode: "intro" | "overview" | "lesson";
    lessonId?: string;
  } | null>(() => {
    if (!id) return null;
    const savedState = loadViewState();
    return savedState[id] ? { moduleId: id, ...savedState[id] } : null;
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    const savedState = loadViewState();
    if (viewOverride && viewOverride.moduleId === id) {
      savedState[id] = { mode: viewOverride.mode, lessonId: viewOverride.lessonId };
    } else {
      delete savedState[id];
    }
    saveViewState(savedState);
  }, [id, viewOverride]);

  // 1. Initial fetch for detail
  useEffect(() => {
    if (id) {
      dispatch(fetchModuleDetail(id));
    }
  }, [id, dispatch]);

  // 2. Sync Module from URL to Redux
  useEffect(() => {
    if (modules && modules.id !== selectedModuleId) {
      dispatch(selectModule(modules.id));
    }
  }, [modules, selectedModuleId, dispatch]);

  const allLessons = useMemo(() => modules?.lessons || [], [modules]);

  const autoLessonId = useMemo(() => {
    const firstIncomplete = allLessons.find((lesson) => {
      const lessonProgress = progress[lesson.id] ?? (lesson.video ? progress[lesson.video] : undefined);
      return !lessonProgress?.completed;
    });
    return firstIncomplete?.id || allLessons[0]?.id || "";
  }, [allLessons, progress]);

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

  const effectiveViewMode = viewOverride && viewOverride.moduleId === id ? viewOverride.mode : autoViewMode;

  useEffect(() => {
    if (!id || allLessons.length === 0 || autoViewMode !== "lesson" || !autoLessonId) return;
    if (!selectedLessonId || !allLessons.some((lesson) => lesson.id === selectedLessonId)) {
      dispatch(selectLesson(autoLessonId));
    }
  }, [id, allLessons, autoViewMode, autoLessonId, selectedLessonId, dispatch]);

  const { selectedLesson, currentIdx } = useMemo(() => {
    const resolvedLessonId = selectedLessonId && allLessons.some((lesson) => lesson.id === selectedLessonId) ? selectedLessonId : autoLessonId;
    const idx = allLessons.findIndex((l) => l.id === resolvedLessonId);
    return {
      selectedLesson: idx >= 0 ? allLessons[idx] : allLessons[0] || ({} as Lesson),
      currentIdx: Math.max(idx, 0),
    };
  }, [allLessons, selectedLessonId, autoLessonId]);

  const { isCompleted } = useMemo(() => calculateLessonProgress(selectedLesson, progress), [selectedLesson, progress]);
  const lessonProgress = progress[selectedLesson.id] ?? (selectedLesson.video ? progress[selectedLesson.video] : undefined);

  const allLessonsCompleted = useMemo(
    () => allLessons.length > 0 && allLessons.every((lesson) => calculateLessonProgress(lesson, progress).isCompleted),
    [allLessons, progress],
  );

  const hasSubmission = !!modules?.submissionUrl;

  const { totalPercentage, exerciseCount } = useMemo(() => {
    let totalPct = 0;
    let count = 0;
    allLessons.forEach((l) => {
      const p = progress[l.id];
      if (l.type === "exercise" && p?.quizScore !== undefined && l.exercise?.questions?.length) {
        const pct = (p.quizScore / l.exercise.questions.length) * 100;
        totalPct += pct;
        count++;
      }
    });
    return { totalPercentage: totalPct, exerciseCount: count };
  }, [allLessons, progress]);

  const averageScore = exerciseCount > 0 ? totalPercentage / exerciseCount : null;

  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    const handleExternalOpen = () => setSidebarOpen(true);
    window.addEventListener("prc-open-learning-sidebar", handleExternalOpen);
    return () => window.removeEventListener("prc-open-learning-sidebar", handleExternalOpen);
  }, []);

  const handleOverviewSelect = useCallback(() => {
    if (id) setViewOverride({ moduleId: id, mode: "overview", lessonId: selectedLesson.id });
    setSidebarOpen(false);
  }, [id, selectedLesson.id]);

  const handleStartLearning = useCallback(() => {
    // Cari pelajaran pertama yang belum selesai (resume ke posisi terakhir)
    const firstIncomplete = allLessons.find((l) => {
      return !calculateLessonProgress(l, progress).isCompleted;
    });
    const target = firstIncomplete || allLessons[0];
    if (target) dispatch(selectLesson(target.id));
    if (id) setViewOverride({ moduleId: id, mode: "lesson", lessonId: target?.id });
  }, [allLessons, progress, dispatch, id]);

  const handlePrev = useCallback(() => {
    if (effectiveViewMode === "overview") {
      const anchorLessonId = viewOverride?.lessonId ?? selectedLesson.id;
      if (anchorLessonId) dispatch(selectLesson(anchorLessonId));
      if (id) setViewOverride({ moduleId: id, mode: "lesson", lessonId: anchorLessonId });
    } else if (currentIdx > 0) {
      dispatch(selectLesson(allLessons[currentIdx - 1].id));
    }
    setSidebarOpen(false);
  }, [effectiveViewMode, currentIdx, allLessons, dispatch, id, selectedLesson.id, viewOverride]);

  const handleNext = useCallback(() => {
    const isLastLesson = currentIdx === allLessons.length - 1;
    if (effectiveViewMode !== "overview" && isLastLesson && isCompleted && allLessonsCompleted) {
      if (id) setViewOverride({ moduleId: id, mode: "overview", lessonId: selectedLesson.id });
    } else if (effectiveViewMode !== "overview" && currentIdx < allLessons.length - 1) {
      dispatch(selectLesson(allLessons[currentIdx + 1].id));
    }
    setSidebarOpen(false);
  }, [effectiveViewMode, currentIdx, allLessons, isCompleted, allLessonsCompleted, dispatch, id, selectedLesson.id]);

  // Scroll to top when lesson or view changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedLesson?.id, effectiveViewMode]);

  const currentDetailStatus = id ? detailStatus[id] : undefined;

  // --- LOADING GUARD ---
  // Tampilkan spinner jika:
  // 1. Sedang fetching (status 'loading'), ATAU
  // 2. Belum ada lessons DAN belum ada status sama sekali (belum pernah di-fetch)
  const isDetailLoading = currentDetailStatus === "loading" || (!modules?.lessons?.length && currentDetailStatus !== "succeeded" && currentDetailStatus !== "failed");

  if (isDetailLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Memuat Materi...</p>
        </div>
      </div>
    );
  }

  // Jika fetch gagal total dan tidak ada data
  if (!modules) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <p className="text-muted-foreground font-bold">Modul tidak ditemukan.</p>
      </div>
    );
  }

  const isLastLesson = currentIdx === allLessons.length - 1;
  const showNextToOverview = effectiveViewMode !== "overview" && isLastLesson && isCompleted && allLessonsCompleted;

  return (
    <div className="flex h-full overflow-hidden bg-background relative">
      <SidebarDrawer
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        onLessonSelect={() => {
          if (id) setViewOverride({ moduleId: id, mode: "lesson" });
          setSidebarOpen(false);
        }}
        onOverviewSelect={handleOverviewSelect}
        onIntroSelect={() => {
          if (id) setViewOverride({ moduleId: id, mode: "intro" });
          setSidebarOpen(false);
        }}
        isOverviewSelected={effectiveViewMode === "overview"}
        allLessonsCompleted={allLessonsCompleted}
        hasSubmission={hasSubmission}
        modules={modules}
      />

      <div className="flex-1 min-w-0 flex flex-col bg-muted/20 overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
          {effectiveViewMode === "intro" ? (
            <ModuleIntroScreen
              moduleTitle={modules.title}
              moduleDescription={modules.description}
              totalLessons={allLessons.length}
              exerciseCount={allLessons.filter((l) => l.type === "exercise").length}
              progressState={allLessonsCompleted ? "done" : autoViewMode === "lesson" ? "partial" : "none"}
              onStart={handleStartLearning}
              onViewSummary={handleOverviewSelect}
            />
          ) : effectiveViewMode === "overview" ? (
            <ModuleOverviewScreen
              moduleTitle={modules.title}
              moduleDescription={modules.description}
              submissionUrl={modules.submissionUrl}
              submissionDescription={modules.submissionDescription}
              submissionAttachments={modules.submissionAttachments}
              totalLessons={allLessons.length}
              averageScore={averageScore}
              exerciseCount={exerciseCount}
            />
          ) : (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-5 space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
              <LessonContent
                lesson={selectedLesson}
                currentIdx={currentIdx}
                totalLessons={allLessons.length}
                onExerciseComplete={(id, answers, score) => dispatch(completeExercise({ lessonId: id, answers, score }))}
                onExerciseReset={(id) => dispatch(resetExercise(id))}
                isAlreadyCompleted={isCompleted}
                savedAnswers={lessonProgress?.quizAnswers}
                savedScore={lessonProgress?.quizScore}
              />
              {selectedLesson.attachments && selectedLesson.attachments.length > 0 && <AttachmentsSection attachments={selectedLesson.attachments} />}
              {selectedLesson.checklist && selectedLesson.checklist.length > 0 && (
                <ChecklistSection lessonId={selectedLesson.id} checklist={selectedLesson.checklist} checklistState={lessonProgress?.checklist} />
              )}
            </div>
          )}
        </div>

        {effectiveViewMode !== "intro" && (
          <NavigationFooter
            currentIdx={effectiveViewMode === "overview" ? allLessons.length : currentIdx}
            totalLessons={allLessons.length}
            isCompleted={effectiveViewMode === "overview" ? true : showNextToOverview ? true : isCompleted}
            isOverview={effectiveViewMode === "overview"}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
      </div>
    </div>
  );
}
