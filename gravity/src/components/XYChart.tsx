import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend);

type Point = { x: number; y: number };

export function XYChart({
    seriesA,
    seriesB,
    fitA,
    fitB,
    mseA,
    mseB,
}: {
    seriesA: Point[];
    seriesB: Point[];
    fitA?: Point[];
    fitB?: Point[];
    mseA?: number;
    mseB?: number;
}) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-slate-900 text-center font-medium mb-3">Závislost doby kmitu na poloze závaží</h3>
            <div className="h-80">
                <Line
                    data={{
                        datasets: [
                            {
                                label: "Závaží dole",
                                data: seriesA,
                                borderColor: "#16a34a", // green-600
                                backgroundColor: "#16a34a",
                                showLine: false,
                                pointRadius: 4,
                                parsing: false as const,
                            },
                            {
                                label: "Závaží nahoře",
                                data: seriesB,
                                borderColor: "#2563eb", // blue-600
                                backgroundColor: "#2563eb",
                                showLine: false,
                                pointRadius: 4,
                                parsing: false as const,
                            },
                            ...(fitA && fitA.length
                                ? [
                                      {
                                          label: `Kvadratické proložení závaží dole${
                                              typeof mseA === "number" ? ` (MSE=${mseA.toFixed(3)})` : ""
                                          }`,
                                          data: fitA,
                                          borderColor: "#16a34a",
                                          backgroundColor: "#16a34a",
                                          borderDash: [6, 4],
                                          pointRadius: 0,
                                          parsing: false as const,
                                      },
                                  ]
                                : []),
                            ...(fitB && fitB.length
                                ? [
                                      {
                                          label: `Kvadratické proložení závaží nahoře${
                                              typeof mseB === "number" ? ` (MSE=${mseB.toFixed(3)})` : ""
                                          }`,
                                          data: fitB,
                                          borderColor: "#2563eb",
                                          backgroundColor: "#2563eb",
                                          borderDash: [6, 4],
                                          pointRadius: 0,
                                          parsing: false as const,
                                      },
                                  ]
                                : []),
                        ],
                    }}
                    options={{
                        animation: false,
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                type: "linear",
                                title: { display: true, text: "Vzdálenost závaží od konce [mm]", color: "#334155" },
                                grid: { color: "#e2e8f0" },
                                ticks: { color: "#334155" },
                            },
                            y: {
                                type: "linear",
                                title: { display: true, text: "Perioda [ms]", color: "#334155" },
                                grid: { color: "#e2e8f0" },
                                ticks: { color: "#334155" },
                            },
                        },
                        plugins: { legend: { labels: { color: "#334155" } }, title: { display: false } },
                    }}
                />
            </div>
        </div>
    );
}
