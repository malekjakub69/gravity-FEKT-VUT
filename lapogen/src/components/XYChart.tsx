import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  LogarithmicScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  LogarithmicScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

type Point = { x: number; y: number };

type DataSeries = {
  label: string;
  data: Point[];
  color: string;
};

type XYChartProps = {
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  series: DataSeries[];
  logarithmicX?: boolean;
  logarithmicY?: boolean;
  showLine?: boolean;
};

const CHART_COLORS = [
  "#3b82f6", // blue-500
  "#ef4444", // red-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
];

export function XYChart({
  title,
  xAxisLabel,
  yAxisLabel,
  series,
  logarithmicX = false,
  logarithmicY = false,
  showLine = true,
}: XYChartProps) {
  // Calculate min/max values for axes
  const allXValues = series
    .flatMap((s) => s.data.map((p) => p.x))
    .filter((v) => !isNaN(v));
  const allYValues = series
    .flatMap((s) => s.data.map((p) => p.y))
    .filter((v) => !isNaN(v));

  // Build axis configurations
  const xAxisConfig: {
    type: string;
    title: { display: boolean; text: string; color: string };
    grid: { color: string };
    ticks: { color: string };
    min?: number;
    max?: number;
  } = {
    type: logarithmicX ? "logarithmic" : "linear",
    title: { display: true, text: xAxisLabel, color: "#334155" },
    grid: { color: "#e2e8f0" },
    ticks: { color: "#334155" },
  };

  const yAxisConfig: {
    type: string;
    title: { display: boolean; text: string; color: string };
    grid: { color: string };
    ticks: { color: string };
    min?: number;
    max?: number;
  } = {
    type: logarithmicY ? "logarithmic" : "linear",
    title: { display: true, text: yAxisLabel, color: "#334155" },
    grid: { color: "#e2e8f0" },
    ticks: { color: "#334155" },
  };

  // Set min/max only if we have data
  if (allXValues.length > 0) {
    const minX = Math.min(...allXValues);
    const maxX = Math.max(...allXValues);
    const xRange = maxX - minX;

    if (logarithmicX) {
      // For logarithmic scale, use suggestedMin/Max to allow flexibility
      // Reduce min to 0.8x to ensure all points are visible
      const logMin = Math.max(0.1, minX * 0.8);
      const logMax = maxX * 1.2;
      xAxisConfig.min = logMin;
      xAxisConfig.max = logMax;
    } else {
      // For linear scale, add padding
      const xPadding = xRange * 0.05;
      xAxisConfig.min = minX - xPadding;
      xAxisConfig.max = maxX + xPadding;
    }
  }

  if (allYValues.length > 0) {
    const minY = Math.min(...allYValues);
    const maxY = Math.max(...allYValues);
    const yRange = maxY - minY;

    if (logarithmicY) {
      // For logarithmic scale, use suggestedMin/Max to allow flexibility
      // Reduce min to 0.8x to ensure all points are visible
      const logMin = Math.max(0.001, minY * 0.8);
      const logMax = maxY * 1.2;
      yAxisConfig.min = logMin;
      yAxisConfig.max = logMax;
    } else {
      // For linear scale, add padding
      const yPadding = yRange * 0.05;
      yAxisConfig.min = minY - yPadding;
      yAxisConfig.max = maxY + yPadding;
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="text-slate-900 text-center font-medium mb-3">{title}</h3>
      <div className="h-80">
        <Line
          data={{
            datasets: series.map((s, idx) => ({
              label: s.label,
              data: s.data,
              borderColor: s.color || CHART_COLORS[idx % CHART_COLORS.length],
              backgroundColor:
                s.color || CHART_COLORS[idx % CHART_COLORS.length],
              showLine: showLine,
              pointRadius: 4,
              borderWidth: showLine ? 2 : 0,
              parsing: false as const,
            })),
          }}
          options={{
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              x: xAxisConfig as any,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              y: yAxisConfig as any,
            },
            plugins: {
              legend: { labels: { color: "#334155" } },
              title: { display: false },
            },
          }}
        />
      </div>
    </div>
  );
}
