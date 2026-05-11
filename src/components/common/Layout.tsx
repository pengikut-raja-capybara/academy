import { type ReactNode, useEffect } from "react";
import { useLocation } from "react-router";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isLearningDetail = pathname.startsWith("/learning/");
  const layoutClassName = isLearningDetail
    ? "h-screen overflow-hidden bg-background text-foreground flex flex-col selection:bg-primary/20"
    : "min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className={layoutClassName}>
      <Header />
      <main className="flex-1 min-h-0">
        <div key={pathname} className="h-full overflow-hidden animate-page-enter motion-reduce:animate-none">
          {children}
        </div>
      </main>
      {!isLearningDetail && <Footer />}
    </div>
  );
}
