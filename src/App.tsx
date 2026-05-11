import { useEffect } from "react";
import { useLocation, Routes, Route, Navigate } from "react-router";

import { useAppDispatch } from "./store/hooks";
import { fetchModules } from "./features/learning/learningSlice";
import Layout from "./components/common/Layout";
import LandingPage from "./pages/LandingPage";
import LearningPage from "./pages/LearningPage";
import ModulesPage from "./pages/ModulesPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import AboutPage from "./pages/AboutPage";
import RoadmapPage from "./pages/RoadmapPage";
import DashboardPage from "./pages/DashboardPage";
import GreetingPage from "./pages/GreetingPage";
import { useAppSelector } from "./store/hooks";

function App() {
  const theme = useAppSelector((state) => state.learning.theme);
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    dispatch(fetchModules());
  }, [dispatch]);

  // Render app with conditional Layout for GreetingPage
  return (
    <>
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
    </>
  );
}

export default App;
