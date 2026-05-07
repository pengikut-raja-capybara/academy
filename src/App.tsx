import { useEffect } from "react";
import { Routes, Route } from "react-router";
import { useAppDispatch } from "./store/hooks";
import { fetchModules } from "./features/learning/learningSlice";
import Layout from "./components/common/Layout";
import LandingPage from "./pages/LandingPage";
import LearningPage from "./pages/LearningPage";
import ModulesPage from "./pages/ModulesPage";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchModules());
  }, [dispatch]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/learning" element={<ModulesPage />} />
        <Route path="/learning/:id" element={<LearningPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
