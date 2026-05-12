import { memo } from "react";
import VideoPlayer from "./VideoPlayer";
import QuizPlayer from "./QuizPlayer";
import { toSafeHtml } from "../../../utils/markdown";
import type { Lesson } from "../../../types";

interface LessonContentProps {
  lesson: Lesson;
  currentIdx: number;
  totalLessons: number;
  onExerciseComplete: (lessonId: string, answers?: Record<number, number>, score?: number) => void;
  onExerciseReset: (lessonId: string) => void;
  isAlreadyCompleted: boolean;
  savedAnswers?: Record<number, number>;
  savedScore?: number;
}

export const LessonContent = memo(function LessonContent({
  lesson,
  currentIdx,
  totalLessons,
  onExerciseComplete,
  onExerciseReset,
  isAlreadyCompleted,
  savedAnswers,
  savedScore,
}: LessonContentProps) {
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
