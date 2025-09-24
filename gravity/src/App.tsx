import { useWebSerialContext } from "./context/useWebSerialContext";
import { useEffect, useState } from "react";
import { Pendulum1 } from "./view/Pendulum1";
import { Pendulum2 } from "./view/Pendulum2";
import { ExportDialog } from "./components/ExportDialog";
import {
  savePendulum1Data,
  loadPendulum1Data,
  savePendulum2Data,
  loadPendulum2Data,
  clearPendulumData,
  isLocalStorageAvailable,
} from "./lib/localStorage";

export type Pendulum1Data = {
  measure: {
    valueA: number | null;
    measureA: number | null;
    measureB: number | null;
  }[];
  intersection: { distance: number; time: number };
};

export type Pendulum2Data = { measureA: number[]; measureB: number[] };

function App() {
  const { isSupported, isOpen, errorMessage, connect, flush } =
    useWebSerialContext();
  const [pendulum1Data, setPendulum1Data] = useState<Pendulum1Data>(() => {
    // Try to load from localStorage first, fallback to default values
    const saved = loadPendulum1Data();
    return (
      saved || {
        measure: [],
        intersection: { distance: 0, time: 0 },
      }
    );
  });
  const [pendulum2Data, setPendulum2Data] = useState<Pendulum2Data>(() => {
    // Try to load from localStorage first, fallback to default values
    const saved = loadPendulum2Data();
    return (
      saved || {
        measureA: [],
        measureB: [],
      }
    );
  });
  const [activeTab, setActiveTab] = useState<
    "pendulum1" | "pendulum2" | undefined
  >(undefined);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("pendulum1");
    }
  }, [isOpen]);

  useEffect(() => {
    if (errorMessage) {
      setActiveTab(undefined);
    }
  }, [errorMessage]);

  // Auto-save pendulum1 data when it changes
  useEffect(() => {
    if (isLocalStorageAvailable()) {
      savePendulum1Data(pendulum1Data);
    }
  }, [pendulum1Data]);

  // Auto-save pendulum2 data when it changes
  useEffect(() => {
    if (isLocalStorageAvailable()) {
      savePendulum2Data(pendulum2Data);
    }
  }, [pendulum2Data]);

  function reset() {
    // Clear data from localStorage
    if (isLocalStorageAvailable()) {
      clearPendulumData();
    }

    // Reset state to empty values
    setPendulum1Data({
      measure: [],
      intersection: { distance: 0, time: 0 },
    });
    setPendulum2Data({ measureA: [], measureB: [] });
  }

  return (
    <>
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-xl font-semibold text-slate-900">
            Úloha 10: Matematické kyvadlo
          </h1>
          <div className="flex gap-2">
            <button
              onClick={reset}
              disabled={!isOpen}
              className="px-3 py-2 rounded-md bg-slate-300 hover:bg-slate-200 disabled:opacity-50 text-slate-700 shadow-sm"
            >
              Reset
            </button>
            <button
              onClick={() => setIsExportDialogOpen(true)}
              disabled={!isOpen}
              className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-sm"
            >
              Export
            </button>
            <button
              onClick={connect}
              disabled={!isSupported || isOpen}
              className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-sm"
            >
              Připojit port
            </button>
          </div>
        </div>
      </header>
      {!isSupported && (
        <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          Web Serial API není k dispozici. Použijte Chrome/Edge na
          HTTPS/localhost.
        </p>
      )}
      {errorMessage && (
        <p className="text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
          {errorMessage}
        </p>
      )}
      <div className="container mt-4">
        <div
          role="tablist"
          aria-label="Kyvadla"
          className="inline-flex rounded-md border border-slate-200 shadow-sm overflow-hidden"
        >
          <button
            role="tab"
            disabled={!isOpen}
            aria-selected={activeTab === "pendulum1"}
            onClick={() => setActiveTab("pendulum1")}
            className={`px-3 py-2 text-sm ${
              activeTab === "pendulum1"
                ? "bg-slate-300 text-black"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Pozice matematického kyvadla
          </button>
          <button
            role="tab"
            disabled={!isOpen}
            aria-selected={activeTab === "pendulum2"}
            onClick={() => setActiveTab("pendulum2")}
            className={`px-3 py-2 text-sm border-l border-slate-200 ${
              activeTab === "pendulum2"
                ? "bg-slate-300 text-black"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Postupná metoda měření
          </button>
        </div>
      </div>

      {!isOpen && (
        <main className="container py-6 space-y-6">
          <p className="text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2">
            Připojte port pro zahájení měření.
          </p>
        </main>
      )}
      <div hidden={activeTab !== "pendulum1"}>
        <Pendulum1
          isOpen={isOpen}
          flush={flush}
          setPendulum1Data={setPendulum1Data}
          pendulum1Data={pendulum1Data}
        />
      </div>
      <div hidden={activeTab !== "pendulum2"}>
        <Pendulum2
          setPendulum2Data={setPendulum2Data}
          pendulum2Data={pendulum2Data}
          intersection={pendulum1Data.intersection}
        />
      </div>

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        pendulum1Data={pendulum1Data}
        pendulum2Data={pendulum2Data}
      />

      
    </>
  );
}

export default App;
