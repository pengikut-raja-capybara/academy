import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import "./index.css";
import App from "./App.tsx";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function applyGitHubPagesRedirect() {
  const url = new URL(window.location.href);
  const redirectPath = url.searchParams.get("redirect");

  if (!redirectPath) return;

  // redirectPath is the original path without the basePath prefix
  // e.g., redirectPath = "/dashboard" and basePath = "/academy"
  // We want to navigate to "/academy/dashboard"
  const targetPath = `${basePath}/${redirectPath}`.replace(/\/+/g, "/");

  window.history.replaceState(null, "", targetPath);
}

applyGitHubPagesRedirect();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
