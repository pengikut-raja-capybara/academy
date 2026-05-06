import { Link } from "react-router";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/60 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 backdrop-blur-xl border-b border-border">
      <nav className="px-4 sm:px-6 lg:px-10 h-14 sm:h-16 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="text-lg sm:text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent hover:opacity-80 transition shrink-0"
        >
          PRC Academy
        </Link>
        <div className="flex items-center gap-3 sm:gap-5">
          <Link to="/" className="text-sm font-bold text-muted-foreground hover:text-purple-500 transition hidden sm:block">
            Beranda
          </Link>
          <Link
            to="/learning"
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-purple-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
          >
            Belajar ✨
          </Link>
          <div className="h-5 w-px bg-border hidden sm:block" />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
