import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectLesson, selectModule, completeExercise, resetExercise, fetchModuleDetail } from "../features/learning/learningSlice";
import { calculateLessonProgress } from "../utils/progress";

// Modularized Components
import { SidebarDrawer } from "../components/learning/layout/SidebarDrawer";
import { ModuleIntroScreen } from "../components/learning/screens/ModuleIntroScreen";
import { ModuleOverviewScreen } from "../components/learning/screens/ModuleOverviewScreen";
import { LessonContent } from "../components/learning/content/LessonContent";
import { AttachmentsSection } from "../components/learning/content/AttachmentsSection";
import { ChecklistSection } from "../components/learning/content/ChecklistSection";
import { NavigationFooter } from "../components/learning/layout/NavigationFooter";

// Custom Hooks
import { useLearningView } from "../hooks/useLearningView";

export default function LearningPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { allModules, progress, selectedLessonId, selectedModuleId, detailStatus, userName } = useAppSelector((state) => state.learning);

  const modules = useMemo(() => {
    return allModules.find((m) => m.slug === id || m.id === id);
  }, [allModules, id]);

  const allLessons = useMemo(() => modules?.lessons || [], [modules]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // View State Logic
  const { effectiveViewMode, autoViewMode, setViewMode, viewOverride } = useLearningView(id, allLessons, progress);

  // Redirect to welcome if no username
  useEffect(() => {
    if (!userName) {
      navigate(`/welcome?redirect=${encodeURIComponent(`/learning/${id}`)}`, { replace: true });
    }
  }, [userName, navigate, id]);

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

  const autoLessonId = useMemo(() => {
    const firstIncomplete = allLessons.find((lesson) => {
      const lessonProgress = progress[lesson.id] ?? (lesson.video ? progress[lesson.video] : undefined);
      return !lessonProgress?.completed;
    });
    return firstIncomplete?.id || allLessons[0]?.id || "";
  }, [allLessons, progress]);

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
      selectedLesson: idx >= 0 ? allLessons[idx] : allLessons[0] || ({} as any),
      currentIdx: Math.max(idx, 0),
    };
  }, [allLessons, selectedLessonId, autoLessonId]);

  const { isCompleted } = useMemo(() => calculateLessonProgress(selectedLesson, progress), [selectedLesson, progress]);
  const lessonProgress = progress[selectedLesson.id] ?? (selectedLesson.video ? progress[selectedLesson.video] : undefined);

  const allLessonsCompleted = useMemo(() => allLessons.length > 0 && allLessons.every((lesson) => calculateLessonProgress(lesson, progress).isCompleted), [allLessons, progress]);

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
    setViewMode("overview", selectedLesson.id);
    setSidebarOpen(false);
  }, [setViewMode, selectedLesson.id]);

  const handleStartLearning = useCallback(() => {
    const firstIncomplete = allLessons.find((l) => {
      return !calculateLessonProgress(l, progress).isCompleted;
    });
    const target = firstIncomplete || allLessons[0];
    if (target) dispatch(selectLesson(target.id));
    setViewMode("lesson", target?.id);
  }, [allLessons, progress, dispatch, setViewMode]);

  const handlePrev = useCallback(() => {
    if (effectiveViewMode === "overview") {
      const anchorLessonId = viewOverride?.lessonId ?? selectedLesson.id;
      if (anchorLessonId) dispatch(selectLesson(anchorLessonId));
      setViewMode("lesson", anchorLessonId);
    } else if (currentIdx > 0) {
      dispatch(selectLesson(allLessons[currentIdx - 1].id));
    }
    setSidebarOpen(false);
  }, [effectiveViewMode, currentIdx, allLessons, dispatch, selectedLesson.id, viewOverride, setViewMode]);

  const handleNext = useCallback(() => {
    const isLastLesson = currentIdx === allLessons.length - 1;
    if (effectiveViewMode !== "overview" && isLastLesson && isCompleted && allLessonsCompleted) {
      setViewMode("overview", selectedLesson.id);
    } else if (effectiveViewMode !== "overview" && currentIdx < allLessons.length - 1) {
      dispatch(selectLesson(allLessons[currentIdx + 1].id));
    }
    setSidebarOpen(false);
  }, [effectiveViewMode, currentIdx, allLessons, isCompleted, allLessonsCompleted, dispatch, selectedLesson.id, setViewMode]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedLesson?.id, effectiveViewMode]);

  const currentDetailStatus = id ? detailStatus[id] : undefined;
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
          setViewMode("lesson");
          setSidebarOpen(false);
        }}
        onOverviewSelect={handleOverviewSelect}
        onIntroSelect={() => {
          setViewMode("intro");
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
