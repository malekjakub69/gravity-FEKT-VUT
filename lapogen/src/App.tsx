import { useEffect, useState } from "react";
import { useWebSerialContext } from "./context/useWebSerialContext";
import { VACharacteristic, type VAData } from "./view/VACharacteristic";
import {
  AngleCharacteristic,
  type AngleData,
} from "./view/AngleCharacteristic";
import {
  FrequencyCharacteristic,
  type FrequencyData,
} from "./view/FrequencyCharacteristic";
import { LuxAmper, type LuxAmperData } from "./view/LuxAmper";
import { ExportDialog } from "./components/ExportDialog";
import {
  saveAppData,
  loadAppData,
  clearAppData,
  isLocalStorageAvailable,
} from "./lib/localStorage";

export type AppData = {
  vaCharacteristic: VAData[];
  angleCharacteristic: AngleData[];
  frequencyCharacteristic: FrequencyData[];
  luxAmper: LuxAmperData[];
};

type TabType = "va" | "angle" | "frequency" | "luxamper";

function App() {
  const { isSupported, isOpen, errorMessage, connect } = useWebSerialContext();

  const [appData, setAppData] = useState<AppData>(() => {
    // Try to load from localStorage first
    const saved = loadAppData();
    return (
      saved || {
        vaCharacteristic: [],
        angleCharacteristic: [],
        frequencyCharacteristic: [],
        luxAmper: [],
      }
    );
  });

  const [activeTab, setActiveTab] = useState<TabType | undefined>(undefined);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  useEffect(() => {
    if (isOpen && !activeTab) {
      setActiveTab("va");
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (errorMessage) {
      setActiveTab(undefined);
    }
  }, [errorMessage]);

  // Auto-save data when it changes
  useEffect(() => {
    if (isLocalStorageAvailable()) {
      saveAppData(appData);
    }
  }, [appData]);

  const reset = () => {
    if (
      window.confirm(
        "Opravdu chcete smazat všechna naměřená data? Tato akce je nevratná."
      )
    ) {
      if (isLocalStorageAvailable()) {
        clearAppData();
      }
      setAppData({
        vaCharacteristic: [],
        angleCharacteristic: [],
        frequencyCharacteristic: [],
        luxAmper: [],
      });
    }
  };

  return (
    <>
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-xl font-semibold text-slate-900">
            LED Charakteristiky
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
        <div className="container mt-4">
          <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            Web Serial API není k dispozici. Použijte Chrome/Edge na
            HTTPS/localhost.
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="container mt-4">
          <p className="text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
            {errorMessage}
          </p>
        </div>
      )}

      <div className="container mt-4">
        <div
          role="tablist"
          aria-label="Měření"
          className="inline-flex rounded-md border border-slate-200 shadow-sm overflow-hidden"
        >
          <button
            role="tab"
            disabled={!isOpen}
            aria-selected={activeTab === "va"}
            onClick={() => setActiveTab("va")}
            className={`px-3 py-2 text-sm ${
              activeTab === "va"
                ? "bg-slate-300 text-black"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            VA Charakteristika
          </button>
          <button
            role="tab"
            disabled={!isOpen}
            aria-selected={activeTab === "angle"}
            onClick={() => setActiveTab("angle")}
            className={`px-3 py-2 text-sm border-l border-slate-200 ${
              activeTab === "angle"
                ? "bg-slate-300 text-black"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Úhel LED
          </button>
          <button
            role="tab"
            disabled={!isOpen}
            aria-selected={activeTab === "frequency"}
            onClick={() => setActiveTab("frequency")}
            className={`px-3 py-2 text-sm border-l border-slate-200 ${
              activeTab === "frequency"
                ? "bg-slate-300 text-black"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Frekvenční charakteristika
          </button>
          <button
            role="tab"
            disabled={!isOpen}
            aria-selected={activeTab === "luxamper"}
            onClick={() => setActiveTab("luxamper")}
            className={`px-3 py-2 text-sm border-l border-slate-200 ${
              activeTab === "luxamper"
                ? "bg-slate-300 text-black"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Lux-Amper
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

      <div hidden={activeTab !== "va"}>
        {isOpen && (
          <VACharacteristic
            data={appData.vaCharacteristic}
            onDataChange={(data) =>
              setAppData((prev) => ({ ...prev, vaCharacteristic: data }))
            }
            isConnected={isOpen}
          />
        )}
      </div>

      <div hidden={activeTab !== "angle"}>
        {isOpen && (
          <AngleCharacteristic
            data={appData.angleCharacteristic}
            onDataChange={(data) =>
              setAppData((prev) => ({ ...prev, angleCharacteristic: data }))
            }
            isConnected={isOpen}
          />
        )}
      </div>

      <div hidden={activeTab !== "frequency"}>
        {isOpen && (
          <FrequencyCharacteristic
            data={appData.frequencyCharacteristic}
            onDataChange={(data) =>
              setAppData((prev) => ({ ...prev, frequencyCharacteristic: data }))
            }
            isConnected={isOpen}
          />
        )}
      </div>

      <div hidden={activeTab !== "luxamper"}>
        {isOpen && (
          <LuxAmper
            data={appData.luxAmper}
            onDataChange={(data) =>
              setAppData((prev) => ({ ...prev, luxAmper: data }))
            }
            isConnected={isOpen}
          />
        )}
      </div>

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        data={appData}
      />
    </>
  );
}

export default App;
