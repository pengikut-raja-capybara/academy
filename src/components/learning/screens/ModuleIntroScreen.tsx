import { memo } from "react";
import { BookOpen, ChevronRight } from "lucide-react";

interface ModuleIntroScreenProps {
  moduleTitle: string;
  moduleDescription?: string;
  totalLessons: number;
  exerciseCount: number;
  progressState: "none" | "partial" | "done";
  onStart: () => void;
  onViewSummary: () => void;
}

export const ModuleIntroScreen = memo(function ModuleIntroScreen({
  moduleTitle,
  moduleDescription,
  totalLessons,
  exerciseCount,
  progressState,
  onStart,
  onViewSummary,
}: ModuleIntroScreenProps) {
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
