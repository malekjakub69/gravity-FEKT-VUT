import React, { useEffect, useState, useRef, useCallback } from "react";
import QRCode from "qrcode";
import type { Pendulum1Data, Pendulum2Data } from "../App";
import { decompressBase64UrlToJson } from "../lib/localStorage";

interface ExportData {
  pendulum1: Pendulum1Data;
  pendulum2: Pendulum2Data;
  timestamp: string;
  version: string;
}

export const ExportPage: React.FC = () => {
  const [exportData, setExportData] = useState<ExportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get("data");

    if (!dataParam) {
      setError("Chybí data v URL parametru");
      setIsLoading(false);
      return;
    }

    try {
      // Try new format: deflate + base64url
      const json = decompressBase64UrlToJson(dataParam);
      const parsedData = JSON.parse(json) as ExportData;
      setExportData(parsedData);
    } catch (primaryErr) {
      try {
        // Fallback to legacy: encodeURIComponent(JSON) -> btoa
        const legacyDecoded = decodeURIComponent(atob(dataParam));
        const parsedLegacy = JSON.parse(legacyDecoded) as ExportData;
        setExportData(parsedLegacy);
      } catch (legacyErr) {
        console.error("Error parsing export data:", primaryErr, legacyErr);
        setError("Chyba při dekódování dat");
      } finally {
        setIsLoading(false);
      }
      return;
    }
    setIsLoading(false);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("cs-CZ");
  };

  // Generate QR code for current export URL
  const generateQRCode = useCallback(async () => {
    if (!canvasRef.current || !exportData) return;

    try {
      const currentUrl = window.location.href;
      await QRCode.toCanvas(canvasRef.current, currentUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  }, [exportData]);

  // Generate QR code when data is loaded
  useEffect(() => {
    if (exportData) {
      generateQRCode();
    }
  }, [exportData, generateQRCode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Načítání dat...</p>
        </div>
      </div>
    );
  }

  if (error || !exportData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Chyba při načítání
          </h1>
          <p className="text-slate-600 mb-4">
            {error || "Data nebyla nalezena"}
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md"
          >
            Zpět
          </button>
        </div>
      </div>
    );
  }

  // Check if pendulum1 table has <= 20 rows for single page optimization
  const isSinglePageOptimized =
    exportData && exportData.pendulum1.measure.length <= 20;

  return (
    <div
      className={`min-h-screen bg-slate-50 ${
        isSinglePageOptimized ? "print:single-page" : ""
      }`}
    >
      {/* Header - hidden when printing */}
      <header className="bg-white shadow-sm border-b border-slate-200 print:hidden">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Export dat - Kyvadla
              </h1>
              <p className="text-slate-600 mt-1">
                Data z {formatTimestamp(exportData.timestamp)} (verze{" "}
                {exportData.version})
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Tisk
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md"
              >
                Zpět
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Print header with QR code */}
        <div className="hidden print:block mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Export dat - Kyvadla
              </h1>
              <p className="text-slate-600 text-lg">
                Data z {formatTimestamp(exportData.timestamp)} (verze{" "}
                {exportData.version})
              </p>
            </div>
            <div className="text-center">
              <div className="border-2 border-slate-300 rounded-lg p-2 bg-white">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={500}
                  className="max-w-full h-auto"
                />
              </div>
              <p className="text-sm text-slate-600 mt-2">
                QR kód pro opětovné načtení dat
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Kyvadlo 1 */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Kyvadlo 1
            </h2>

            {/* Měření */}
            <div>
              {exportData.pendulum1.measure.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-3 text-slate-600">
                          Value A
                        </th>
                        <th className="text-left py-2 px-3 text-slate-600">
                          Measure A
                        </th>
                        <th className="text-left py-2 px-3 text-slate-600">
                          Measure B
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {exportData.pendulum1.measure.map((measure, index) => (
                        <tr key={index} className="border-b border-slate-100">
                          <td className="py-2 px-3">
                            {measure.valueA ?? "N/A"}
                          </td>
                          <td className="py-2 px-3">
                            {measure.measureA ?? "N/A"}
                          </td>
                          <td className="py-2 px-3">
                            {measure.measureB ?? "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 italic">Žádná měření</p>
              )}
            </div>

            {/* Průsečík */}
            <div>
              <h3 className="text-lg font-medium text-slate-700 mb-3">
                Průsečík
              </h3>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Vzdálenost: </span>
                  <span className="text-lg font-semibold text-slate-900">
                    {exportData.pendulum1.intersection.distance}
                  </span>
                  <span className="text-sm text-slate-600 ml-4">Čas: </span>
                  <span className="text-lg font-semibold text-slate-900">
                    {exportData.pendulum1.intersection.time}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Kyvadlo 2 */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Kyvadlo 2
            </h2>

            {/* Měření */}
            <div>
              {exportData.pendulum2.measureA.length > 0 ||
              exportData.pendulum2.measureB.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-3 text-slate-600">
                          kmit [s]
                        </th>
                        <th className="text-left py-2 px-3 text-slate-600">
                          T1 [s]
                        </th>
                        <th className="text-left py-2 px-3 text-slate-600">
                          T2 [s]
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(
                        {
                          length:
                            Math.max(
                              exportData.pendulum2.measureA.length,
                              exportData.pendulum2.measureB.length
                            ) + 1, // +1 for the 0 kmit row
                        },
                        (_, index) => {
                          const kmit = index * 10;

                          // Calculate cumulative sums
                          let t1 = 0;
                          let t2 = 0;

                          if (index > 0) {
                            // Sum all values from 0 to index-1
                            for (let i = 0; i < index; i++) {
                              t1 += exportData.pendulum2.measureA[i] ?? 0;
                              t2 += exportData.pendulum2.measureB[i] ?? 0;
                            }
                          }

                          return (
                            <tr
                              key={index}
                              className="border-b border-slate-100"
                            >
                              <td className="py-2 px-3">{kmit}</td>
                              <td className="py-2 px-3">{t1.toFixed(2)}</td>
                              <td className="py-2 px-3">{t2.toFixed(2)}</td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 italic">Žádná měření</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
