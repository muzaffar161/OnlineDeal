import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// PWA service worker (production only; vite-plugin-pwa injects register when available)
if (import.meta.env.PROD) {
  void import("virtual:pwa-register")
    .then(({ registerSW }) => {
      registerSW({ immediate: true });
    })
    .catch(() => {
      // PWA plugin not available in this build — ignore
    });
}
