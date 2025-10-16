import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { WebSerialProvider } from "./context/WebSerialProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WebSerialProvider>
      <App />
    </WebSerialProvider>
  </StrictMode>
);
