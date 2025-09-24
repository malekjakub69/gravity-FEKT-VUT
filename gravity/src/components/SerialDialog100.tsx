import { useEffect, useState, useMemo } from "react";
import { Modal, ModalContent, ModalActions, ModalHeader } from "./Modal";
import { useWebSerialContext } from "../context/useWebSerialContext";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

type Props = {
  isOpen: boolean;
  onClose: () => void;
  measurementChannel: "nahoře" | "dole";
  onSave: (tenValueSums: number[]) => void;
};

export function SerialDialog100(props: Props) {
  const { isOpen, onClose, measurementChannel, onSave } = props;

  const { lastLine } = useWebSerialContext();
  const [measurementActive, setMeasurementActive] = useState<boolean>(false);
  const [measurementSamples, setMeasurementSamples] = useState<number[]>([]);
  const [skippedFirstSample, setSkippedFirstSample] = useState<boolean>(false);
  const [mustRestart, setMustRestart] = useState<boolean>(false);

  // Reset local dialog state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setMeasurementActive(false);
      setMeasurementSamples([]);
      setSkippedFirstSample(false);
      setMustRestart(false);
    }
  }, [isOpen]);

  // Collect samples from lastLine when measurement is active (kept only in dialog)
  useEffect(() => {
    if (!measurementActive || !lastLine) return;
    const numMatch = lastLine.match(/[+-]?\d+(?:\.\d+)?/);
    if (numMatch) {
      const val = parseFloat(numMatch[0]);
      if (!skippedFirstSample) {
        setSkippedFirstSample(true);
        return;
      }
      setMeasurementSamples((prev) => {
        const next = [...prev, val];
        if (next.length >= 100) {
          setMeasurementActive(false);
          return next.slice(-100);
        }
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastLine, measurementActive]);

  function start() {
    setMeasurementSamples([]);
    setMeasurementActive(true);
    setSkippedFirstSample(false);
    setMustRestart(false);
  }

  function stop() {
    setMeasurementActive(false);
  }

  function removeSample(index: number) {
    setMeasurementSamples((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length < 90) {
        setMustRestart(true);
      }
      return next;
    });
  }

  function handleSave() {
    if (measurementSamples.length < 90) return;
    if (mustRestart) return;
    const lastNinety = measurementSamples.slice(-90);
    const sums: number[] = [];
    for (let i = 0; i < 90; i += 10) {
      const block = lastNinety.slice(i, i + 10);
      const s = block.reduce((acc, v) => acc + v, 0);
      sums.push(s);
    }
    onSave(sums);
  }

  // Výpočet varování pro odlehlé kmity - vždy aktuální při změně vzorků
  const outlierWarning = useMemo(() => {
    const lastNinety = measurementSamples.slice(-90);
    if (lastNinety.length === 90) {
      const avg = lastNinety.reduce((acc, v) => acc + v, 0) / 90;
      const outliers = lastNinety
        .map((v, i) => ({ v, i }))
        .filter(({ v }) => Math.abs(v - avg) > 0.05 * avg);
      if (outliers.length > 0) {
        return (
          <div className="mb-4 p-3 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
            ❌ Pozor některý z kmitů se liší o více než 5% od průměru ({avg.toFixed(2)} ms). ❌
            <br />
            {/* Indexy: {outliers.map(({ i }) => i + 1).join(", ")} */}
          </div>
        );
      }
    }
    return null;
  }, [measurementSamples]);

  const count = measurementSamples.length;
  const canSave = count >= 90 && !mustRestart;

  return (
    <Modal isOpen={isOpen} onClose={onClose} modal size="own">
      <ModalHeader
        title={`Měření (až 100 vzorků) - závaží ${measurementChannel}`}
        onClose={onClose}
      />
      <ModalContent className="bg-white p-6">
        {mustRestart && (
          <div className="mb-4 p-3 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            ❌ Počet hodnot klesl pod 90. Je potřeba spustit měření znovu. ❌
          </div>
        )}
        {outlierWarning}

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={start}
            disabled={measurementActive}
            className="px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white shadow-sm"
          >
            Start (sbírat 100)
          </button>
          <button
            onClick={stop}
            disabled={!measurementActive}
            className="px-3 py-2 rounded-md bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white shadow-sm"
          >
            Stop
          </button>
          <div className="text-slate-700 text-sm ml-auto">
            <span className="font-medium">Počet vzorků:</span> {count} / 100
          </div>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="ml-auto px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-sm"
          >
            Uložit (součty po 10 z posledních 90)
          </button>
        </div>

        <div className="overflow-auto rounded-md border border-slate-200 shadow-sm max-h-72">
          <table className="min-w-full text-sm text-slate-900">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-slate-700">
                  #
                </th>
                <th className="text-left px-3 py-2 font-medium text-slate-700">
                  Perioda [ms]
                </th>
                <th className="text-right px-3 py-2 font-medium text-slate-700">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(() => {
                const slice = measurementSamples.slice(-100);
                const baseIndex = Math.max(0, measurementSamples.length - 100);
                const highlightStart = Math.max(0, slice.length - 90);
                return slice.map((v, i) => {
                  const isFaded = i < highlightStart;
                  return (
                    <tr key={i} className={`odd:bg-white even:bg-slate-50 ${isFaded ? "text-slate-400" : ""}`}>
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2">{v}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => removeSample(baseIndex + i)}
                          className="px-2 py-1 rounded-md text-white bg-rose-600 hover:bg-rose-500 shadow-sm"
                        >
                          Smazat
                        </button>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
        {(() => {
          const slice = measurementSamples.slice(-100);
          const highlightStart = Math.max(0, slice.length - 90);

          // Rozdělení bodů na faded a aktivní
          const fadedPoints = slice.slice(0, highlightStart).map((v, i) => ({
            x: i + 1,
            y: v,
          }));
          const activePoints = slice.slice(highlightStart).map((v, i) => ({
            x: highlightStart + i + 1,
            y: v,
          }));

          // Plugin pro šedé pozadí pod faded body
          const fadedBgPlugin = {
            id: "fadedBgPlugin",
            beforeDatasetsDraw: (chart: ChartJS) => {
              const { ctx, chartArea } = chart;
              if (!chartArea) return;
              if (highlightStart > 0) {
                const xAxis = chart.scales.x;
                const xStart = xAxis.getPixelForValue(1);
                const xEnd = xAxis.getPixelForValue(highlightStart);
                ctx.save();
                ctx.fillStyle = "rgba(148,163,184,0.15)"; // slate-400, light
                ctx.fillRect(
                  xStart,
                  chartArea.top,
                  xEnd - xStart,
                  chartArea.bottom - chartArea.top
                );
                ctx.restore();
              }
            },
          };

          return (
            <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4">
              <div className="h-72">
                <Line
                  data={{
                    datasets: [
                      ...(
                        fadedPoints.length > 0
                          ? [
                              {
                                data: fadedPoints,
                                showLine: true,
                                pointRadius: 2,
                                pointBackgroundColor: "rgba(148,163,184,0.3)", // slate-400 faded
                                pointBorderColor: "rgba(148,163,184,0.3)",
                                borderColor: "rgba(148,163,184,0.7)", // faded line
                                backgroundColor: "rgba(148,163,184,0.1)",
                                spanGaps: true,
                                order: 1,
                              },
                            ]
                          : []
                      ),
                      ...(
                        activePoints.length > 0
                          ? [
                              {
                                data: activePoints,
                                showLine: true,
                                pointRadius: 2,
                                pointBackgroundColor: "#16a34a", // green-600
                                pointBorderColor: "#16a34a",
                                borderColor: "#16a34a", // green line
                                backgroundColor: "rgba(22,163,74,0.1)",
                                spanGaps: true,
                                order: 2,
                              },
                            ]
                          : []
                      ),
                    ],
                  }}
                  options={{
                    animation: false,
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        type: "linear",
                        title: {
                          display: true,
                          text: "Měření",
                          color: "#334155",
                        },
                        grid: { color: "#e2e8f0" },
                        ticks: { color: "#334155" },
                      },
                      y: {
                        type: "linear",
                        title: {
                          display: true,
                          text: "Perioda [ms]",
                          color: "#334155",
                        },
                        grid: { color: "#e2e8f0" },
                        ticks: { color: "#334155" },
                      },
                    },
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                    },
                  }}
                  plugins={[fadedBgPlugin]}
                />
              </div>
            </div>
          );
        })()}
      </ModalContent>
      <ModalActions>
        <button
          onClick={onClose}
          className="ml-auto px-3 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          Zavřít
        </button>
      </ModalActions>
    </Modal>
  );
}
