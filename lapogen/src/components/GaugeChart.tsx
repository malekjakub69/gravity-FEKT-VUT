import { type FC } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Title);

type GaugeChartProps = {
  value: number; // Actual value (not necessarily in mV)
  min: number; // Min value
  max: number; // Max value
  label: string;
  unit?: string;
  convertToDisplay?: (val: number) => string; // Optional custom converter
};

export const GaugeChart: FC<GaugeChartProps> = ({
  value,
  min,
  max,
  label,
  unit = "V",
  convertToDisplay,
}) => {
  const percentage = Math.max(
    0,
    Math.min(100, ((value - min) / (max - min)) * 100)
  );
  const displayValue = convertToDisplay
    ? convertToDisplay(value)
    : (value / 1000).toFixed(3); // Default: Convert mV to V

  const chartData = {
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: ["#0000FF", "#e2e8f0"],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 150, // Fast animation (default is 1000ms)
    },
    cutout: 80,
    rotation: -90,
    circumference: 180,
    plugins: {
      tooltip: {
        enabled: false,
      },
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-slate-900 text-center font-medium mb-4">{label}</h3>
      <div className="h-64 flex flex-col items-center justify-center relative">
        <Doughnut data={chartData} options={chartOptions} />
        <div className="absolute bottom-16 text-center">
          <div className="text-4xl font-bold text-slate-900 mb-1">
            {displayValue}
          </div>
          <div className="text-lg text-slate-500 font-medium">{unit}</div>
        </div>
        <div className="absolute bottom-6 left-0 right-0 flex justify-between px-8">
          <span className="text-xs text-slate-600 font-medium">
            {convertToDisplay ? convertToDisplay(min) : (min / 1000).toString()}
          </span>
          <span className="text-xs text-slate-500">
            {convertToDisplay
              ? convertToDisplay((min + max) / 2)
              : ((min + max) / 2 / 1000).toFixed(1)}
          </span>
          <span className="text-xs text-slate-600 font-medium">
            {convertToDisplay ? convertToDisplay(max) : (max / 1000).toString()}
          </span>
        </div>
      </div>
    </div>
  );
};
