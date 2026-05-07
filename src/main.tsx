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

  let normalizedTarget = redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`;

  if (basePath && normalizedTarget.startsWith(`${basePath}/`)) {
    normalizedTarget = normalizedTarget.slice(basePath.length);
  }

  const normalizedUrl = `${basePath}${normalizedTarget}`.replace(/\/+/g, "/");
  window.history.replaceState(null, "", normalizedUrl);
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
