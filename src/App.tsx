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




function App() {
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(fetchModules());
  }, [dispatch]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/learning" element={<ModulesPage />} />
        <Route path="/learning/:id" element={<LearningPage key={location.pathname} />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </Layout>
  );
}

export default App;
