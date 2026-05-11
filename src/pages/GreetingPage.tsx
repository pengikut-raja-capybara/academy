import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setUserName } from "../features/learning/learningSlice";
import { ArrowRight, Sparkles, Code2, Rocket, Brain, Book, Cpu, Globe, Lightbulb, Binary } from "lucide-react";
import ThemeToggle from "../components/common/ThemeToggle";

export default function GreetingPage() {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const progress = useAppSelector((state) => state.learning.progress);

  const hasProgress = Object.values(progress).some((p) => p && (p.completed || (p.lastWatchedSec ?? 0) > 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !isSubmitting) {
      setIsSubmitting(true);

      // Add a slight delay for the animation
      setTimeout(() => {
        dispatch(setUserName(name.trim()));
        
        // Dynamic redirection:
        // 1. If explicit redirect param exists, go there
        // 2. Otherwise, if has progress, go to dashboard
        // 3. Default for new users: go to modules list
        if (redirectTo) {
          navigate(redirectTo);
        } else if (hasProgress) {
          navigate("/dashboard");
        } else {
          navigate("/learning");
        }
      }, 1200);
    }
  };

  return (
    <div
      className={`h-[100dvh] w-full bg-background flex items-center justify-center p-4 relative overflow-hidden selection:bg-primary/30 transition-all duration-1000 ${isSubmitting ? "scale-110 opacity-0 blur-2xl" : "scale-100 opacity-100 blur-0"}`}
    >
      {/* Theme Toggle Position */}
      <div className="absolute top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-1000 delay-500">
        <ThemeToggle />
      </div>

      {/* Immersive Tech & Education Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        {/* Glow Blobs */}
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-600/10 rounded-full filter blur-[100px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 rounded-full filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-pink-600/5 rounded-full filter blur-[120px] animate-pulse" />

        {/* Floating Icons - Group 1 (Tech) */}
        <div className="absolute top-[10%] left-[8%] text-blue-500/20 rotate-12 animate-bounce animation-delay-1000">
          <Code2 size={32} className="sm:hidden" />
          <Code2 size={56} className="hidden sm:block" />
        </div>
        <div className="absolute bottom-[25%] left-[5%] text-cyan-500/15 -rotate-12 animate-pulse animation-delay-2000">
          <Cpu size={28} className="sm:hidden" />
          <Cpu size={48} className="hidden sm:block" />
        </div>
        <div className="absolute top-[40%] left-[12%] text-indigo-500/10 rotate-45 animate-bounce animation-delay-4000">
          <Binary size={24} className="sm:hidden" />
          <Binary size={40} className="hidden sm:block" />
        </div>

        {/* Floating Icons - Group 2 (Education) */}
        <div className="absolute top-[15%] right-[10%] text-purple-500/20 -rotate-12 animate-bounce animation-delay-3000">
          <Brain size={32} className="sm:hidden" />
          <Brain size={52} className="hidden sm:block" />
        </div>
        <div className="absolute bottom-[20%] right-[8%] text-yellow-500/20 rotate-12 animate-pulse">
          <Lightbulb size={28} className="sm:hidden" />
          <Lightbulb size={44} className="hidden sm:block" />
        </div>
        <div className="absolute top-[50%] right-[15%] text-pink-500/15 -rotate-45 animate-bounce animation-delay-1000">
          <Book size={24} className="sm:hidden" />
          <Book size={40} className="hidden sm:block" />
        </div>

        {/* Extra Decorative Icons */}
        <div className="absolute bottom-[10%] left-[30%] text-blue-400/10 rotate-12">
          <Globe size={48} />
        </div>
        <div className="absolute top-[70%] right-[30%] text-purple-400/10 -rotate-12">
          <Rocket size={40} />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-2xl px-4 sm:px-6">
        <div className="space-y-6 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="text-center space-y-6 sm:space-y-8">
            <div className="relative inline-flex flex-col items-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-3xl opacity-30 animate-pulse" />
                <div className="relative flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 text-white shadow-2xl transform hover:scale-105 transition-transform duration-500">
                  <Sparkles size={28} className="sm:hidden animate-pulse" />
                  <Sparkles size={40} className="hidden sm:block animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                  Onboarding
                </div>
                <h2 className="text-xl sm:text-3xl font-bold text-muted-foreground tracking-tight">
                  Selamat Datang di
                </h2>
                <h1 className="text-4xl sm:text-7xl font-black tracking-tighter leading-none bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-sm pb-2">
                  PRC Academy
                </h1>
              </div>

              <div className="mt-6 sm:mt-8 max-w-md mx-auto">
                <p className="text-muted-foreground font-medium text-sm sm:text-lg leading-relaxed opacity-70 px-4">
                  {isSubmitting 
                    ? `Menyiapkan petualangan untuk ${name.split(" ")[0]}...` 
                    : "Langkah pertama dimulai di sini. Siapa nama hebatmu?"}
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className={`space-y-6 sm:space-y-8 max-w-sm sm:max-w-md mx-auto transition-all duration-500 ${isSubmitting ? "opacity-0 translate-y-10" : "opacity-100 translate-y-0"}`}
          >
            <div className="relative group">
              {/* Massive Glow behind input */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000 group-focus-within:duration-200" />

              <div className="relative">
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ketik namamu..."
                  className="w-full bg-card/40 backdrop-blur-xl border-2 border-white/10 focus:border-primary/50 rounded-2xl sm:rounded-3xl py-4 sm:py-5 px-8 text-center text-xl sm:text-2xl font-black transition-all duration-500 outline-none placeholder:text-muted-foreground/20"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={!name.trim() || isSubmitting} className="w-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition duration-500" />
              <div className="relative flex items-center justify-center gap-3 sm:gap-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white font-black py-4 sm:py-5 rounded-2xl shadow-2xl group-hover:scale-[1.02] active:scale-95 transition-all duration-500 overflow-hidden">
                <span className="text-lg sm:text-xl">Mulai Belajar</span>
                <ArrowRight size={20} className="sm:hidden group-hover:translate-x-2 transition-transform duration-500" />
                <ArrowRight size={24} className="hidden sm:block group-hover:translate-x-2 transition-transform duration-500" />

                {/* Shine effect */}
                <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] group-hover:animate-shine" />
              </div>
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes shine {
          0% { left: -100%; }
          20% { left: 100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}
