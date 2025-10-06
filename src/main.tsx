import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeLanguage, fetchTranslations } from "./lib/translations";

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Initialize translations
initializeLanguage();
fetchTranslations();

createRoot(document.getElementById("root")!).render(<App />);
