import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useNavigate } from "react-router";
import { selectModule } from "../features/learning/learningSlice";
import { Trophy, ArrowRight, Search, Sparkles, Code2, BookOpen } from "lucide-react";
import { memo, useState } from "react";
import type { Module } from "../types";

const ModuleCard = memo(function ModuleCard({ mod, onStart }: { mod: Module & { percentage: number; completedLessons: number; totalLessons: number }; onStart: (id: string) => void }) {
  const isHtml = mod.id === "mod-html";
  const coverImage = isHtml ? "/images/html_cover.png" : "/images/css_cover.png";
  return (
    <div
      onClick={() => onStart(mod.slug)}
      className="cursor-pointer group relative rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full bg-card border border-border"
    >
      {/* Top Header with Image */}
      <div className="h-52 relative overflow-hidden bg-muted">
        <img src={coverImage} alt={mod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 z-10">
          <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
            <Code2 size={12} className={isHtml ? "text-blue-400" : "text-pink-400"} />
            {isHtml ? "Frontend" : "Styling"}
          </div>
        </div>

        {mod.percentage === 100 && (
          <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-green-500/90 backdrop-blur-md border border-green-400/50 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
            <Trophy size={12} /> Selesai
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-6 sm:p-8 flex-1 flex flex-col gap-6">
        <div>
          <h3 className="text-2xl font-black tracking-tight mb-2 group-hover:text-primary transition-colors duration-300">{mod.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 font-medium">{mod.description}</p>
        </div>

        {/* Progress Bar Section */}
        <div className="space-y-3 mt-auto">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <span>{mod.percentage}% Selesai</span>
            <span>
              {mod.completedLessons} / {mod.totalLessons} Sesi
            </span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/50">
            <div
              className={`h-full transition-all duration-1000 ease-out ${
                mod.percentage === 100 ? "bg-gradient-to-r from-green-500 to-emerald-500" : isHtml ? "bg-gradient-to-r from-blue-600 to-cyan-500" : "bg-gradient-to-r from-pink-500 to-purple-500"
              }`}
              style={{ width: `${mod.percentage}%` }}
            />
          </div>
        </div>

        <button
          className={`cursor-pointer w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn ${
            mod.percentage === 100
              ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
              : "bg-primary text-primary-foreground hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
          }`}
        >
          {mod.percentage > 0 ? (mod.percentage === 100 ? "Review Modul" : "Lanjutkan Belajar") : "Mulai Belajar"}
          <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
});

export default function ModulesPage() {
  const { allModules, progress, status } = useAppSelector((state) => state.learning);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate progress for each module
  const moduleProgress = allModules
    .map((mod) => {
      const totalLessons = mod.lessons?.length || 0;
      const completedLessons = mod.lessons?.filter((l) => progress[l.id]?.completed).length || 0;
      const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      return { ...mod, percentage, completedLessons, totalLessons };
    })
    .filter((mod) => mod.title.toLowerCase().includes(searchQuery.toLowerCase()) || mod.description?.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleStart = (slug: string) => {
    const mod = allModules.find(m => m.slug === slug || m.id === slug);
    if (mod) {
      dispatch(selectModule(mod.id));
      navigate(`/learning/${mod.slug}`);
    }
  };

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-pink-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="pt-28 pb-16 sm:pt-36 sm:pb-24 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-primary text-[10px] font-black uppercase tracking-widest mb-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles size={14} className="text-yellow-400" />
              Pusat Eksplorasi Materi
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Perluas <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">Wawasanmu</span>
            </h1>

            <p className="max-w-2xl mx-auto text-muted-foreground text-base sm:text-xl font-medium leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Tingkatkan skill dengan kurikulum interaktif yang disiapkan khusus untuk membantu siapa pun menguasai teknologi dan membangun masa depan digital.
            </p>

            {/* Search Bar */}
            <div className="w-full max-w-xl mx-auto relative animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 group">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-2xl transition-all duration-500 group-focus-within:from-blue-500/20 group-focus-within:to-purple-500/20" />

              <div className="relative bg-card/70 backdrop-blur-2xl border border-border rounded-full flex items-center px-6 py-4 shadow-xl focus-within:shadow-2xl focus-within:border-primary/50 transition-all duration-300">
                <Search size={20} className="text-muted-foreground mr-3 transition-colors group-focus-within:text-primary" />
                <input
                  type="text"
                  placeholder="Cari modul, topik, atau bahasa..."
                  className="bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground/70 font-semibold text-sm sm:text-base selection:bg-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Grid Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              Modul Tersedia <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-muted-foreground">{status === 'loading' ? '...' : moduleProgress.length}</span>
            </h2>
          </div>

          {status === 'loading' && allModules.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[480px] rounded-3xl bg-card/50 border border-border animate-pulse flex flex-col">
                  <div className="h-52 bg-muted rounded-t-3xl" />
                  <div className="p-8 space-y-4">
                    <div className="h-8 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                    <div className="mt-auto pt-8">
                      <div className="h-12 bg-muted rounded-2xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : moduleProgress.length === 0 ? (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm animate-in fade-in zoom-in duration-500">
              <BookOpen size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-xl font-bold">Modul tidak ditemukan</p>
              <p className="text-muted-foreground">Coba gunakan kata kunci pencarian yang lain.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {moduleProgress.map((mod, idx) => (
                <div key={mod.id} className="animate-in fade-in slide-in-from-bottom-10 duration-700 fill-mode-both" style={{ animationDelay: `${idx * 150}ms` }}>
                  <ModuleCard mod={mod} onStart={handleStart} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
