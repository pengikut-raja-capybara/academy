import React from "react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  color: string;
  badge: string;
}

export function StatCard({ icon, label, value, subtext, color, badge }: StatCardProps) {
  return (
    <div className={`bg-card p-6 border-b-4 ${color} rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 relative group`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-muted rounded-2xl group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <div className="px-2 py-1 bg-primary/5 rounded-lg text-[10px] font-black text-primary uppercase">{badge}</div>
      </div>
      <div>
        <h4 className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">{label}</h4>
        <div className="text-3xl font-black tracking-tight mb-1">{value}</div>
        <p className="text-muted-foreground text-[10px] font-medium">{subtext}</p>
      </div>
    </div>
  );
}

interface WeeklyGoalProps {
  label: string;
  current: number;
  target: number;
  targetDisplay?: number;
  color: string;
  labelSuffix?: string;
}

export function WeeklyGoal({
  label,
  current,
  target,
  targetDisplay,
  color,
  labelSuffix = "",
}: WeeklyGoalProps) {
  const pct = Math.min(100, (current / (target || 1)) * 100);
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-end">
        <span className="text-[11px] font-bold text-muted-foreground uppercase">{label}</span>
        <span className="text-[11px] font-black">
          {current}{" "}
          <span className="text-muted-foreground/50">
            / {targetDisplay ?? target}
            {labelSuffix}
          </span>
        </span>
      </div>
      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden border border-border/30">
        <div className={`h-full rounded-full ${color} shadow-lg shadow-black/5 transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
