import { useMemo } from "react";
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

// Generate color based on amplitude (0-30000)
// Returns a color from blue (low) to red (high)
function getColorForAmplitude(amplitude: number): string {
  const normalized = Math.max(0, Math.min(1, amplitude / 30000));

  // Create gradient from blue (0) to red (1)
  // Hues: 240 (blue) -> 0 (red) going through green and yellow
  const hue = 240 * (1 - normalized);
  const saturation = 70 + normalized * 30; // 70-100%
  const lightness = 50;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function PolarChart({ title, data }: PolarChartProps) {
  // Group by amplitude
  const amplitudeGroups = useMemo(() => {
    const groups = new Map<number, PolarDataPoint[]>();
    data.forEach((point) => {
      if (!groups.has(point.amplitude)) {
        groups.set(point.amplitude, []);
      }
      groups.get(point.amplitude)!.push(point);
    });
    return groups;
  }, [data]);

  // Sort angles and create datasets
  const sortedAmplitudes = useMemo(() => {
    return Array.from(amplitudeGroups.keys()).sort((a, b) => a - b);
  }, [amplitudeGroups]);

  const chartData = useMemo(() => {
    return {
      labels: [], // Chart.js will automatically create angular axis
      datasets: sortedAmplitudes.map((amplitude) => {
        const points = amplitudeGroups.get(amplitude)!;
        const values = new Array(360).fill(null);

        points.forEach((point) => {
          const angleIndex = Math.round(point.angle) % 360;
          values[angleIndex] = point.value;
        });

        const color = getColorForAmplitude(amplitude);
        return {
          label: `${amplitude} uA`,
          data: values,
          backgroundColor: color + "80", // Add transparency
          borderColor: color,
          borderWidth: 1,
        };
      }),
    };
  }, [amplitudeGroups, sortedAmplitudes]);

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
              legend: {
                display: true,
                position: "right",
                labels: {
                  color: "#334155",
                  usePointStyle: true,
                  padding: 15,
                  font: {
                    size: 12,
                  },
                },
              },
              title: { display: false },
            },
          }}
        />
      </div>
    </div>
  );
}
