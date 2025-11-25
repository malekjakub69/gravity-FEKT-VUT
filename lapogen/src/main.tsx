import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import App from "./App.tsx";
import { WebSerialProvider } from "./context/WebSerialProvider.tsx";
import "./index.css";
import { ExportPage } from "./view/ExportPage.tsx";

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
