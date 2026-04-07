import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Handle legacy hash-based URLs (e.g. /#/learn) and redirect to clean paths (/learn)
if (window.location.hash.startsWith("#/")) {
  const cleanPath = window.location.hash.slice(2) || "/";
  window.location.replace(cleanPath);
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}
