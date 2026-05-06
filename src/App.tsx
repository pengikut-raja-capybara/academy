import { Routes, Route } from "react-router";
import Layout from "./components/common/Layout";
import LandingPage from "./pages/LandingPage";
import LearningPage from "./pages/LearningPage";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/learning/:id" element={<LearningPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
