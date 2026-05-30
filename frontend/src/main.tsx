import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import App from "./app/App.tsx";
import "./styles/index.css";

// HashRouter keeps routing in the URL fragment (#/login, #/portal/overview)
// so no server-side rewrite config is needed for XAMPP / static hosting.
createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <App />
  </HashRouter>,
);
