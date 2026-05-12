import { memo } from "react";
import { X } from "lucide-react";
import LessonSidebar from "./LessonSidebar";
import ProgressCard from "./ProgressCard";
import type { Module } from "../../../types";

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLessonSelect: () => void;
  onOverviewSelect: () => void;
  onIntroSelect: () => void;
  isOverviewSelected: boolean;
  allLessonsCompleted: boolean;
  hasSubmission: boolean;
  modules: Module;
}

export const SidebarDrawer = memo(function SidebarDrawer({
  isOpen,
  onClose,
  onLessonSelect,
  onOverviewSelect,
  onIntroSelect,
  isOverviewSelected,
  allLessonsCompleted,
  hasSubmission,
  modules,
}: SidebarDrawerProps) {
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
