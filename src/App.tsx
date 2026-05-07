import { Routes, Route } from "react-router";
import Layout from "./components/common/Layout";
import LandingPage from "./pages/LandingPage";
import LearningPage from "./pages/LearningPage";
import ModulesPage from "./pages/ModulesPage";

function App() {
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
