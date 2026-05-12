import { memo } from "react";
import { ClipboardCheck, CheckCircle2, Circle } from "lucide-react";
import { useAppDispatch } from "../../../store/hooks";
import { toggleChecklistItem } from "../../../features/learning/learningSlice";

interface ChecklistSectionProps {
  lessonId: string;
  checklist: string[];
  checklistState: Record<string, boolean> | undefined;
}

export const ChecklistSection = memo(function ChecklistSection({ lessonId, checklist, checklistState }: ChecklistSectionProps) {
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
