import { Link } from "react-router";
import { CheckCircle2, Clock, Play } from "lucide-react";
import { formatSeconds } from "../../hooks/useDashboardStats";

interface ModuleProgressCardProps {
  mod: {
    id: string;
    slug: string;
    title: string;
    category?: string;
    progress: number;
    completedLessons: number;
    totalLessons: number;
    watchSec: number;
  };
}

export function ModuleProgressCard({ mod }: ModuleProgressCardProps) {
  return (
    <div className="bg-card border border-border/50 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      {mod.progress >= 100 && (
        <div className="absolute top-0 right-0 p-4 text-green-500/10 pointer-events-none group-hover:scale-110 transition-transform">
          <CheckCircle2 size={80} />
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-5 relative z-10">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-1 rounded-md tracking-wider">
              {mod.category || "General"}
            </span>
            {mod.progress >= 100 && (
              <span className="text-[10px] font-black uppercase text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-md tracking-wider flex items-center gap-1">
                <CheckCircle2 size={12} /> Selesai
              </span>
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-bold leading-tight">{mod.title}</h3>

          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">{mod.progress}% Selesai</span>
              <span>
                {mod.completedLessons} / {mod.totalLessons} Materi
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/20">
              <div
                className={`h-full transition-all duration-1000 ${mod.progress >= 100 ? "bg-green-500" : "bg-gradient-to-r from-blue-500 to-purple-500"}`}
                style={{ width: `${mod.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center justify-between sm:justify-center shrink-0 border-t sm:border-t-0 sm:border-l border-border/50 pt-4 sm:pt-0 sm:pl-5">
          <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
            <Clock size={14} /> {formatSeconds(mod.watchSec)}
          </div>
          <Link
            to={`/learning/${mod.slug}`}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
              mod.progress >= 100 ? "bg-muted text-foreground hover:bg-muted/80 border border-border" : "bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5"
            }`}
          >
            {mod.progress >= 100 ? "Ulas Materi" : "Lanjutkan"}
            {!mod.progress || mod.progress < 100 ? <Play size={12} fill="currentColor" /> : null}
          </Link>
        </div>
      </div>
    </div>
  );
}
