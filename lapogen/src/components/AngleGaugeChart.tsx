import { type FC } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Title);

type AngleGaugeChartProps = {
  value: number; // Angle value (-180 to 180)
  min: number; // Min value (typically -180)
  max: number; // Max value (typically 180)
  label: string;
  unit?: string;
};

export const AngleGaugeChart: FC<AngleGaugeChartProps> = ({
  value,
  min,
  max,
  label,
  unit = "°",
}) => {
  // Clamp value to range
  const clampedValue = Math.max(min, Math.min(max, value));

  // Calculate positions on scale (0-100%)
  const totalRange = max - min;
  const zeroPosition = ((0 - min) / totalRange) * 100; // Where 0 is (50% if symmetric)
  const valuePosition = ((clampedValue - min) / totalRange) * 100; // Where value is

  // Determine fill color based on sign
  const fillColor = "#3b82f6"; // Blue for positive, red for negative

  // Build data arrays
  const dataArray: number[] = [];
  const backgroundColorArray: string[] = [];

  if (clampedValue === 0) {
    // Exactly at zero - all gray
    dataArray.push(100);
    backgroundColorArray.push("#e2e8f0");
  } else if (clampedValue > 0) {
    // Positive value: gray from start to zero, blue from zero to value, gray from value to end
    const beforeZero = zeroPosition;
    const filled = valuePosition - zeroPosition;
    const afterValue = 100 - valuePosition;

    if (beforeZero > 0) {
      dataArray.push(beforeZero);
      backgroundColorArray.push("#e2e8f0");
    }
    if (filled > 0) {
      dataArray.push(filled);
      backgroundColorArray.push(fillColor);
    }
    if (afterValue > 0) {
      dataArray.push(afterValue);
      backgroundColorArray.push("#e2e8f0");
    }
  } else {
    // Negative value: gray from start to value, red from value to zero, gray from zero to end
    const beforeValue = valuePosition;
    const filled = zeroPosition - valuePosition;
    const afterZero = 100 - zeroPosition;

    if (beforeValue > 0) {
      dataArray.push(beforeValue);
      backgroundColorArray.push("#e2e8f0");
    }
    if (filled > 0) {
      dataArray.push(filled);
      backgroundColorArray.push(fillColor);
    }
    if (afterZero > 0) {
      dataArray.push(afterZero);
      backgroundColorArray.push("#e2e8f0");
    }
  }

  const chartData = {
    datasets: [
      {
        data: dataArray,
        backgroundColor: backgroundColorArray,
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
            {clampedValue > 0 ? "+" : ""}
            {clampedValue.toFixed(1)}
          </div>
          <div className="text-lg text-slate-500 font-medium">{unit}</div>
        </div>
        <div className="absolute bottom-6 left-0 right-0 flex justify-between px-8">
          <span className="text-xs text-slate-600 font-medium">{min}</span>
          <span className="text-xs text-slate-500">0</span>
          <span className="text-xs text-slate-600 font-medium">{max}</span>
        </div>
      </div>
    </div>
  );
};
