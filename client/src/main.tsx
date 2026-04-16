import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const initialHash = window.location.hash;
if (initialHash.includes("access_token") && initialHash.includes("type=signup")) {
  sessionStorage.setItem("justVerified", "true");
} else if (initialHash.includes("access_token") && initialHash.includes("type=recovery")) {
  sessionStorage.setItem("needsPasswordUpdate", "true");
}

// Handle legacy hash-based URLs (e.g. /#/learn) and gracefully upgrade them to standard routing
if (window.location.hash.startsWith("#/")) {
  const cleanPath = window.location.hash.slice(1); // keeps the leading slash! e.g. "/learn"
  window.history.replaceState(null, "", cleanPath || "/");
}

createRoot(document.getElementById("root")!).render(<App />);
