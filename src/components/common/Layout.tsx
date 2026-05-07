import { type ReactNode, useEffect } from "react";
import { useLocation } from "react-router";
import { useAppSelector } from "../../store/hooks";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: { children: ReactNode }) {
  const theme = useAppSelector((state) => state.learning.theme);
  const { pathname } = useLocation();
  const isLearningDetail = pathname.startsWith("/learning/");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {!isLearningDetail && <Header />}
      <main className="flex-1">{children}</main>
      {!isLearningDetail && <Footer />}
    </div>
  );
}

