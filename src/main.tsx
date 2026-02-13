// Lovable Cloud environment initialized
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { cleanupExpiredCache } from "./lib/audioCache";

// Clean up expired cache entries on app startup (non-blocking)
cleanupExpiredCache().catch(console.error);

createRoot(document.getElementById("root")!).render(<App />);
