import { Target } from "lucide-react";
import { useAppSelector } from "../../store/hooks";
import type { Module } from "../../types";
import { calculateModuleProgress } from "../../utils/progress";

export default function ProgressCard({ module }: { module?: Module }) {
  const { allModules, selectedModuleId, progress } = useAppSelector((state) => state.learning);
  const activeModule = module || allModules.find((m) => m.id === selectedModuleId) || allModules[0];

  const { percentage: overallPct, completedCount, totalCount } = calculateModuleProgress(activeModule?.lessons || [], progress, !!activeModule?.submissionUrl);




  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-black tracking-tight flex items-center gap-2 uppercase opacity-80">
            <Target size={12} className="text-primary" /> Progres Kursus
          </h3>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 truncate max-w-[180px]">
            {completedCount} dari {totalCount} Materi Selesai



          </p>
        </div>
        <div className="text-lg font-black text-primary">{overallPct}%</div>
      </div>

      <div className="relative h-1.5 bg-muted rounded-full overflow-hidden border border-border/50">
        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${overallPct}%` }}>
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
