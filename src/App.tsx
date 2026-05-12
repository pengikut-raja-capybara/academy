import { useEffect } from "react";
import { useLocation, Routes, Route, Navigate } from "react-router";

import Layout from "./components/common/Layout";
import LandingPage from "./pages/LandingPage";
import LearningPage from "./pages/LearningPage";
import ModulesPage from "./pages/ModulesPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import AboutPage from "./pages/AboutPage";
import RoadmapPage from "./pages/RoadmapPage";
import DashboardPage from "./pages/DashboardPage";
import GreetingPage from "./pages/GreetingPage";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { fetchModules, initializeState } from "./features/learning/learningSlice";

import { ToastProvider } from "./context/ToastContext";

function App() {
  const { theme, isInitialized } = useAppSelector((state) => state.learning);
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(initializeState());
  }, [dispatch]);

  useEffect(() => {
    if (isInitialized) {
      dispatch(fetchModules());
    }
  }, [dispatch, isInitialized]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  // Prevent UI flicker while loading saved state
  if (!isInitialized) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Render app with conditional Layout for GreetingPage
  return (
    <ToastProvider>
      <Routes>
        <Route path="/welcome" element={<GreetingPage />} />
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/learning" element={<ModulesPage />} />
                <Route path="/learning/:id" element={<LearningPage key={location.pathname} />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/roadmap" element={<RoadmapPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </ToastProvider>
  );
}

export default App;
