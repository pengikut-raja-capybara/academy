import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavigationFooterProps {
  currentIdx: number;
  totalLessons: number;
  isCompleted: boolean;
  isOverview: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export const NavigationFooter = memo(function NavigationFooter({
  currentIdx,
  totalLessons,
  isCompleted,
  isOverview,
  onPrev,
  onNext,
}: NavigationFooterProps) {
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
