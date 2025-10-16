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
}: XYChartProps) {
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
              showLine: true,
              pointRadius: 4,
              borderWidth: 2,
              parsing: false as const,
            })),
          }}
          options={{
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                type: logarithmicX ? "logarithmic" : "linear",
                title: { display: true, text: xAxisLabel, color: "#334155" },
                grid: { color: "#e2e8f0" },
                ticks: { color: "#334155" },
              },
              y: {
                type: logarithmicY ? "logarithmic" : "linear",
                title: { display: true, text: yAxisLabel, color: "#334155" },
                grid: { color: "#e2e8f0" },
                ticks: { color: "#334155" },
              },
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
