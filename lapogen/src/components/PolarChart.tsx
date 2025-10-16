import { PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

type PolarDataPoint = {
  angle: number; // in degrees
  value: number;
  amplitude: number;
};

type PolarChartProps = {
  title: string;
  data: PolarDataPoint[];
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

export function PolarChart({ title, data }: PolarChartProps) {
  // Group by amplitude
  const amplitudeGroups = new Map<number, PolarDataPoint[]>();
  data.forEach((point) => {
    if (!amplitudeGroups.has(point.amplitude)) {
      amplitudeGroups.set(point.amplitude, []);
    }
    amplitudeGroups.get(point.amplitude)!.push(point);
  });

  // Sort angles and create datasets
  const sortedAmplitudes = Array.from(amplitudeGroups.keys()).sort(
    (a, b) => a - b
  );

  const chartData = {
    labels: Array.from({ length: 360 }, (_, i) => `${i}°`),
    datasets: sortedAmplitudes.map((amplitude, idx) => {
      const points = amplitudeGroups.get(amplitude)!;
      const values = new Array(360).fill(null);

      points.forEach((point) => {
        const angleIndex = Math.round(point.angle) % 360;
        values[angleIndex] = point.value;
      });

      return {
        label: `${amplitude} uA`,
        data: values,
        backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] + "80", // Add transparency
        borderColor: CHART_COLORS[idx % CHART_COLORS.length],
        borderWidth: 1,
      };
    }),
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="text-slate-900 text-center font-medium mb-3">{title}</h3>
      <div className="h-96 flex items-center justify-center">
        <PolarArea
          data={chartData}
          options={{
            animation: false,
            responsive: true,
            maintainAspectRatio: true,
            scales: {
              r: {
                beginAtZero: true,
                ticks: { color: "#334155" },
                grid: { color: "#e2e8f0" },
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
