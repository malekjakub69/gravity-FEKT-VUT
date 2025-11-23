import { type FC, useState, useMemo } from "react";
import { XYChart } from "../components/XYChart";
import { DataTable, type Column } from "../components/DataTable";
import { MeasurementDialog } from "../components/MeasurementDialog";
import { useWebSerialContext } from "../context/useWebSerialContext";

export type FrequencyData = {
  id: string;
  frequency: number;
  voltage: number;
  amplitude: number;
};

type FrequencyCharacteristicProps = {
  data: FrequencyData[];
  onDataChange: (data: FrequencyData[]) => void;
  isConnected: boolean;
};

const CHART_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

export const FrequencyCharacteristic: FC<FrequencyCharacteristicProps> = ({
  data,
  onDataChange,
  isConnected,
}) => {
  const { calibrateZeroAngle, setParameters, parsedData } =
    useWebSerialContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amplitudeInput, setAmplitudeInput] = useState("");
  const [frequencyInput, setFrequencyInput] = useState("");
  const [showCalibration, setShowCalibration] = useState(false);

  // Check URL parameter for calibration button visibility
  useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    setShowCalibration(params.has("calibration") || true); // Always show for now
  }, []);

  const handleAddPoint = async () => {
    const amplitude = parseFloat(amplitudeInput);
    const frequency = parseFloat(frequencyInput);

    if (isNaN(amplitude) || amplitude < 0 || amplitude > 30000) {
      alert("Zadejte platnou amplitudu v rozsahu 0-30000 uA");
      return;
    }
    if (isNaN(frequency) || frequency < 1 || frequency > 100000) {
      alert("Zadejte platnou frekvenci v rozsahu 1-100000 Hz");
      return;
    }

    // Check angle before opening dialog - arm must be at 0° with ±5° tolerance
    if (parsedData.angle === undefined || Math.abs(parsedData.angle) > 5) {
      alert(
        `Rameno musí být v nulovém úhlu (±5°). Aktuální úhel: ${
          parsedData.angle?.toFixed(1) ?? "N/A"
        }°`
      );
      return;
    }

    // For frequency characteristic: freq varies, offset=50% of amplitude
    await setParameters(amplitude, frequency, amplitude / 2);
    // Wait a bit for the device to settle
    setTimeout(() => {
      setIsDialogOpen(true);
    }, 100);
  };

  const handleSaveMeasurement = (voltage: number) => {
    const amplitude = parseFloat(amplitudeInput);
    const frequency = parseFloat(frequencyInput);
    // Generate unique ID
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newPoint: FrequencyData = { id, frequency, voltage, amplitude };

    onDataChange([...data, newPoint].sort((a, b) => a.frequency - b.frequency));
    setFrequencyInput("");
  };

  const handleDelete = (index: number) => {
    onDataChange(data.filter((_, i) => i !== index));
  };

  const handleCalibrate = () => {
    if (window.confirm("Kalibrovat nulový úhel?")) {
      calibrateZeroAngle();
    }
  };

  const columns: Column<FrequencyData>[] = [
    {
      key: "amplitude",
      label: "Amplituda [uA]",
      render: (item) => item.amplitude.toFixed(0),
    },
    {
      key: "frequency",
      label: "Frekvence [Hz]",
      render: (item) => item.frequency.toFixed(1),
    },
    {
      key: "voltage",
      label: "Napětí [V]",
      render: (item) => item.voltage.toFixed(3),
    },
  ];

  // Group data by amplitude for different colored series
  const amplitudeGroups = useMemo(() => {
    const groups = new Map<number, FrequencyData[]>();
    data.forEach((point) => {
      if (!groups.has(point.amplitude)) {
        groups.set(point.amplitude, []);
      }
      groups.get(point.amplitude)!.push(point);
    });
    return groups;
  }, [data]);

  const chartSeries = Array.from(amplitudeGroups.entries())
    .sort(([a], [b]) => a - b)
    .map(([amplitude, points], idx) => ({
      label: `${amplitude} uA`,
      data: points.map((d) => ({ x: d.frequency, y: d.voltage })),
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }));

  return (
    <main className="container py-6 space-y-6">
      <section className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-900 font-medium">
            Frekvenční charakteristika
          </h3>
          {showCalibration && (
            <button
              onClick={handleCalibrate}
              disabled={!isConnected}
              className="px-3 py-1 text-sm rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white"
            >
              Kalibrovat nulový úhel
            </button>
          )}
        </div>
        <p className="text-slate-700 text-sm mb-4">
          Měření závislosti napětí na frekvenci. Offset: 50% amplitudy. Rameno
          musí být v nulovém úhlu (±5°).
        </p>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Amplituda [uA]
            </label>
            <input
              type="number"
              min="0"
              max="30000"
              step="1"
              value={amplitudeInput}
              onChange={(e) => setAmplitudeInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0-30000"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Frekvence [Hz]
            </label>
            <input
              type="number"
              min="1"
              max="100000"
              step="0.1"
              value={frequencyInput}
              onChange={(e) => setFrequencyInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1-100000"
            />
          </div>
          <button
            onClick={handleAddPoint}
            disabled={!isConnected || !amplitudeInput || !frequencyInput}
            className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white"
          >
            Přidat bod
          </button>
        </div>
      </section>

      <section className="card p-4">
        <XYChart
          title="Frekvenční charakteristika"
          xAxisLabel="Frekvence [Hz]"
          yAxisLabel="Napětí [V]"
          series={chartSeries}
          logarithmicX={true}
        />
      </section>

      <section className="card p-4">
        <h3 className="text-slate-900 font-medium mb-3">Tabulka měření</h3>
        <DataTable
          columns={columns}
          data={data}
          onDelete={handleDelete}
          emptyMessage="Žádná měření"
        />
      </section>

      <MeasurementDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveMeasurement}
        title="Měření napětí"
        showAngleWarning={true}
        angleThreshold={5}
      />
    </main>
  );
};
