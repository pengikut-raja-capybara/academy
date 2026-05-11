import { Link, useLocation } from "react-router";
import ThemeToggle from "./ThemeToggle";
import { Sparkles, GitForkIcon, Menu } from "lucide-react";
import { useAppSelector } from "../../store/hooks";

export default function Header() {
  const location = useLocation();
  const progress = useAppSelector((state) => state.learning.progress);
  const userName = useAppSelector((state) => state.learning.userName);
  
  const hasAnyProgress = Object.values(progress).some(
    (p) => p.completed || (p.lastWatchedSec ?? 0) > 0 || Object.keys(p.checklist || {}).length > 0
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl transition-all duration-300">
      {/* Top Accent Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" />

      <nav className="mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
        {location.pathname.startsWith("/learning/") ? (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("prc-open-learning-sidebar"))}
            className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-black transition-all duration-300 border border-border bg-background hover:bg-muted/50 shrink-0"
            aria-label="Buka daftar materi"
          >
            <Menu size={18} />
            <span className="hidden sm:inline">Menu</span>
          </button>
        ) : null}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-10 min-w-0">
          <Link to="/" className="relative group flex items-center gap-2 shrink-0">
            {/* Logo Glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-10 transition duration-500" />

            <span className="text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-[1.02] whitespace-nowrap">
              PRC ACADEMY
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {!hasAnyProgress ? (
              <NavLink to="/" active={isActive("/")}>
                Beranda
              </NavLink>
            ) : null}
            {hasAnyProgress ? (
              <NavLink to="/dashboard" active={isActive("/dashboard")}>
                Dashboard
              </NavLink>
            ) : null}
            <NavLink to="/roadmap" active={isActive("/roadmap")}>
              Roadmap
            </NavLink>
            <NavLink to="/about" active={isActive("/about")}>
              Tentang
            </NavLink>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 shrink-0">
          <Link
            to={!userName ? "/welcome" : "/learning"}
            className={`
              relative overflow-hidden px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all duration-300
              flex items-center gap-2 shadow-lg active:scale-95 group whitespace-nowrap
              bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white
              ${location.pathname.startsWith("/learning") ? "hidden lg:flex" : ""}
              ${
                location.pathname.startsWith("/learning")
                  ? "shadow-purple-500/50 ring-2 ring-purple-500/20 ring-offset-2 ring-offset-background"
                  : "hover:shadow-purple-500/40 hover:-translate-y-0.5 shadow-purple-500/20"
              }
            `}
          >
            <span className="relative z-10">Modul</span>
            <Sparkles size={14} className={`relative z-10 transition-transform duration-500 shrink-0 ${location.pathname.startsWith("/learning") ? "rotate-12" : "group-hover:rotate-45"}`} />

            {/* Animated Background Shine */}
            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] group-hover:animate-shine" />
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2 border-l border-border/50">
            <a
              href="https://github.com/pengikut-raja-capybara/academy"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all hidden sm:flex shrink-0"
            >
              <GitForkIcon size={18} />
            </a>
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}

function NavLink({ to, children, active }: { to: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      to={to}
      className={`
        relative px-4 py-2 text-sm font-bold transition-all duration-300 rounded-lg
        ${active ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}
      `}
    >
      {children}
      {active && <span className="absolute bottom-1.5 left-4 right-4 h-0.5 bg-primary rounded-full animate-in fade-in zoom-in duration-300" />}
    </Link>
  );
}
