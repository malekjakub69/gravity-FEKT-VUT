import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  RadialLinearScale,
  Tooltip,
} from "chart.js";
import { useCallback, useMemo } from "react";
import { Radar } from "react-chartjs-2";

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

export function PolarChart({ title, data }: PolarChartProps) {
  const getColorForAmplitude = useCallback((amplitude: number) => {
    // Normalize amplitude to 0-1 range, where 15000 maps to 0 and 30000 maps to 1
    // This ensures even color distribution in the primary range 15000-30000
    const normalized = Math.max(0, Math.min(1, (amplitude - 15000) / 15000));
    // Create gradient from blue (0) to red (1)
    // Hues: 240 (blue) -> 0 (red) going through green and yellow
    const hue = 240 * (1 - normalized);
    const saturation = 70 + normalized * 30; // 70-100%
    const lightness = 50;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }, []);

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

  const polarLabels = useMemo(() => {
    const formatAngle = (angle: number) => {
      if (angle === 0) {
        return "0°";
      }
      if (Math.abs(angle) === 90) {
        return "±90°";
      }
      const sign = angle > 0 ? "+" : "-";
      return `${sign}${Math.abs(angle)}°`;
    };

    return Array.from({ length: 180 }, (_, angle) => {
      const signedAngle = angle <= 90 ? angle : angle - 180; // map to [-90, 90]
      if (Math.abs(signedAngle) % 10 !== 0) {
        return "";
      }
      return formatAngle(signedAngle);
    });
  }, []);

  const chartData = useMemo(() => {
    return {
      labels: polarLabels, // enforce [-180°, +180°] labels on circumference
      datasets: sortedAmplitudes.map((amplitude) => {
        const points = amplitudeGroups.get(amplitude)!;
        const values = new Array(180).fill(null);

        points.forEach((point) => {
          const normalizedAngle = ((Math.round(point.angle) % 180) + 180) % 180; // keep index within 0-179
          values[normalizedAngle] = point.value;
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
  }, [amplitudeGroups, sortedAmplitudes, polarLabels]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="text-slate-900 text-center font-medium mb-3">{title}</h3>
      <div className="h-96 flex items-center justify-center">
        <Radar
          data={chartData}
          options={{
            animation: false,
            responsive: true,
            maintainAspectRatio: true,
            scales: {
              r: {
                beginAtZero: true,
                ticks: {
                  color: "#334155",
                  display: false, // 1. SKRYJE ČÍSLA (popis osy od středu)
                  stepSize: 300,
                },
                grid: { color: "#e2e8f0" },
                startAngle: 0, // rotate so that 0° points up
                pointLabels: {
                  display: true,
                  color: "#475569",
                  font: { size: 10 },
                },
                angleLines: {
                  display: true,
                  // Funkce pro barvu: zobrazí čáru jen pro každý 2. bod (sudý index)
                  color: (context) => {
                    if (context.index % 4 === 0) {
                      return "rgba(0, 0, 0, 0.1)"; // Viditelná barva mřížky
                    }
                    return "transparent"; // Skrytá čára
                  },
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
            },
          }}
        />
      </div>
    </div>
  );
}
