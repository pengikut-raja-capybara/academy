import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import "./index.css";
import App from "./App.tsx";
import { GitHubPagesRedirectHandler } from "./components/common/GitHubPagesRedirectHandler";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <GitHubPagesRedirectHandler>
          <App />
        </GitHubPagesRedirectHandler>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
