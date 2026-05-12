import { useState, memo } from "react";
import { ChevronRight, HelpCircle, Trophy } from "lucide-react";
import type { Lesson } from "../../../types";

interface QuizPlayerProps {
  lesson: Lesson;
  onComplete: (answers?: Record<number, number>, score?: number) => void;
  onReset?: () => void;
  isAlreadyCompleted?: boolean;
  savedAnswers?: Record<number, number>;
  savedScore?: number;
}

const QuizPlayer = memo(function QuizPlayer({ lesson, onComplete, onReset, isAlreadyCompleted, savedAnswers, savedScore }: QuizPlayerProps) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(isAlreadyCompleted || false);
  const [reviewMode, setReviewMode] = useState(false);

  const questions = lesson.exercise?.questions || [];
  const currentQuestion = questions[currentQuestionIdx];

  const handleReset = () => {
    setCurrentQuestionIdx(0);
    setScore(0);
    setAnswers({});
    setSelectedOption(null);
    setShowResult(false);
    setReviewMode(false);
    onReset?.();
  };

  const handleAnswer = () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const newScore = isCorrect ? score + 1 : score;
    const newAnswers = { ...answers, [currentQuestionIdx]: selectedOption };

    setAnswers(newAnswers);

    if (currentQuestionIdx < questions.length - 1) {
      setScore(newScore);
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setScore(newScore);
      setShowResult(true);
    }
  };

  if (showResult && !reviewMode) {
    const finalScoreRaw = isAlreadyCompleted && savedScore !== undefined ? savedScore : score;
    const finalScore = questions.length > 0 ? (finalScoreRaw / questions.length) * 100 : (isAlreadyCompleted ? 100 : 0);
    const minScore = lesson.minScorePercentage ?? 80;
    const isPassed = finalScore >= minScore;

    return (
      <div className="bg-card border border-border p-6 rounded-2xl shadow-xl flex flex-col items-center text-center space-y-4 animate-in zoom-in duration-500">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isPassed ? "bg-green-500/20 text-green-500" : "bg-amber-500/20 text-amber-500"}`}>
          {isPassed ? <Trophy size={28} /> : <HelpCircle size={28} />}
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black">{isPassed ? (isAlreadyCompleted ? "Sudah Selesai!" : "Luar Biasa!") : "Coba Lagi!"}</h2>
          <p className="text-xs text-muted-foreground font-medium">{isAlreadyCompleted ? "Kamu telah menyelesaikan kuis ini dan progres telah disimpan." : isPassed ? "Kamu berhasil melewati batas nilai minimal!" : "Skor kamu belum mencukupi untuk lulus."}</p>
          <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {finalScore % 1 === 0 ? finalScore.toFixed(0) : finalScore.toFixed(2).replace(".", ",")}
          </div>
        </div>

        <div className="flex flex-col w-full gap-2 pt-2">
          {isPassed && !isAlreadyCompleted && (
            <button
              onClick={() => onComplete(answers, score)}
              className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-bold hover:scale-[1.02] transition-all shadow-lg shadow-green-500/20"
            >
              Simpan & Lanjut
            </button>
          )}

          {isAlreadyCompleted && (savedAnswers || Object.keys(answers).length > 0) && (
            <button
              onClick={() => {
                setReviewMode(true);
                setCurrentQuestionIdx(0);
              }}
              className="w-full py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-bold hover:bg-primary/20 transition-all"
            >
              Lihat Jawaban
            </button>
          )}
          
          {!isAlreadyCompleted && (
            <button
              onClick={handleReset}
              className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all border ${
                isPassed ? "bg-background text-foreground border-border hover:bg-muted" : "bg-primary text-primary-foreground border-primary hover:scale-[1.02] shadow-lg shadow-primary/20"
              }`}
            >
              {isPassed ? "Ulangi Kuis" : "Coba Lagi"}
            </button>
          )}

          {isAlreadyCompleted && (
             <div className="px-4 py-2 mt-2 bg-muted rounded-lg text-[10px] font-black text-muted-foreground uppercase tracking-widest border border-border/50">
               Kuis Terkunci (Sudah Disimpan)
             </div>
          )}
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const currentAnswers = isAlreadyCompleted && savedAnswers ? savedAnswers : answers;
  const isReviewing = showResult && reviewMode;
  const answeredOption = currentAnswers[currentQuestionIdx];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600/5 to-purple-600/5 p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black">{currentQuestionIdx + 1}</div>
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-wider text-muted-foreground">{isReviewing ? "Review Pertanyaan" : "Pertanyaan"}</h4>
            <p className="font-bold text-[11px] truncate max-w-[150px] sm:max-w-none">{lesson.title}</p>
          </div>
        </div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/50 px-2 py-1 rounded-md">
          {currentQuestionIdx + 1} / {questions.length}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <h3 className="text-base sm:text-lg font-bold leading-snug">{currentQuestion.question}</h3>

        <div className="grid gap-2">
          {currentQuestion.options.map((option, idx) => {
            let optionClass = "border-border hover:border-primary/40 hover:bg-muted/50";
            let circleClass = "border-muted-foreground/30 group-hover:border-primary/60";
            let showDot = false;

            if (isReviewing) {
              const isUserAnswer = answeredOption === idx;
              const isCorrectAnswer = currentQuestion.correctAnswer === idx;

              if (isCorrectAnswer) {
                optionClass = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 shadow-sm ring-1 ring-green-500/20";
                circleClass = "border-green-500 bg-green-500";
                showDot = true;
              } else if (isUserAnswer && !isCorrectAnswer) {
                optionClass = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 shadow-sm ring-1 ring-red-500/20 opacity-70";
                circleClass = "border-red-500 bg-red-500";
                showDot = true;
              } else {
                optionClass = "border-border opacity-50";
              }
            } else {
              const isSelected = selectedOption === idx;
              if (isSelected) {
                optionClass = "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10 ring-1 ring-primary/20";
                circleClass = "border-primary bg-primary shadow-sm";
                showDot = true;
              }
            }

            return (
              <button
                key={idx}
                disabled={isReviewing}
                onClick={() => setSelectedOption(idx)}
                className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-center justify-between group text-sm ${optionClass}`}
              >
                <span className="font-semibold">{option}</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${circleClass}`}>
                  {showDot && <div className={`w-3 h-3 rounded-full animate-in zoom-in duration-300 ${isReviewing ? (currentQuestion.correctAnswer === idx ? 'bg-white' : 'bg-purple-600') : 'bg-purple-600'}`} />}
                </div>
              </button>
            );
          })}
        </div>

        {isReviewing ? (
          <div className="flex gap-2">
            <button
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
              className="flex-1 py-3 bg-muted text-foreground rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-muted/80 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => {
                if (currentQuestionIdx < questions.length - 1) {
                  setCurrentQuestionIdx(prev => prev + 1);
                } else {
                  setReviewMode(false);
                }
              }}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-purple-500/10 transition-all"
            >
              {currentQuestionIdx < questions.length - 1 ? "Selanjutnya" : "Tutup Review"}
            </button>
          </div>
        ) : (
          <button
            disabled={selectedOption === null}
            onClick={handleAnswer}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-purple-500/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
          >
            {currentQuestionIdx < questions.length - 1 ? "Lanjut" : "Selesai"}
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
});

export default QuizPlayer;
