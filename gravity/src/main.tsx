import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import { ExportPage } from "./view/ExportPage.tsx";
import { WebSerialProvider } from "./context/WebSerialProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <WebSerialProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/export" element={<ExportPage />} />
        </Routes>
      </WebSerialProvider>
    </HashRouter>
  </StrictMode>
);
