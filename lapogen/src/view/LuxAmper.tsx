import { type FC, useState, useMemo } from "react";
import { XYChart } from "../components/XYChart";
import { DataTable, type Column } from "../components/DataTable";
import { MeasurementDialog } from "../components/MeasurementDialog";
import { useWebSerialContext } from "../context/useWebSerialContext";

export type LuxAmperData = {
  amplitude: number;
  voltage: number;
};

type LuxAmperProps = {
  data: LuxAmperData[];
  onDataChange: (data: LuxAmperData[]) => void;
  isConnected: boolean;
};

export const LuxAmper: FC<LuxAmperProps> = ({
  data,
  onDataChange,
  isConnected,
}) => {
  const { setParameters, parsedData, calibrateZeroAngle } =
    useWebSerialContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amplitudeInput, setAmplitudeInput] = useState("");
  const [showCalibration, setShowCalibration] = useState(false);

  // Check URL parameter for calibration button visibility
  useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    setShowCalibration(params.has("calibration") || true); // Always show for now
  }, []);

  const handleAddPoint = async () => {
    const amplitude = parseFloat(amplitudeInput);

    if (isNaN(amplitude) || amplitude < 0 || amplitude > 30000) {
      alert("Zadejte platnou amplitudu v rozsahu 0-30000 uA");
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

    // For Lux-Amper: freq=500 Hz, offset=50% of amplitude
    await setParameters(amplitude, 500, amplitude / 2);
    // Wait a bit for the device to settle
    setTimeout(() => {
      setIsDialogOpen(true);
    }, 100);
  };

  const handleSaveMeasurement = (voltage: number) => {
    const amplitude = parseFloat(amplitudeInput);
    const newPoint: LuxAmperData = { amplitude, voltage };

    onDataChange([...data, newPoint].sort((a, b) => a.amplitude - b.amplitude));
    setAmplitudeInput("");
  };

  const handleDelete = (index: number) => {
    onDataChange(data.filter((_, i) => i !== index));
  };

  const handleCalibrate = () => {
    if (window.confirm("Kalibrovat nulový úhel?")) {
      calibrateZeroAngle();
    }
  };

  const columns: Column<LuxAmperData>[] = [
    {
      key: "amplitude",
      label: "Amplituda [uA]",
      render: (item) => item.amplitude.toFixed(0),
    },
    {
      key: "voltage",
      label: "Napětí [V]",
      render: (item) => item.voltage.toFixed(3),
    },
  ];

  const chartSeries = [
    {
      label: "Lux-Amper",
      data: data.map((d) => ({ x: d.amplitude, y: d.voltage })),
      color: "#10b981",
    },
  ];

  return (
    <main className="container py-6 space-y-6">
      <section className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-900 font-medium">
            Lux-Amper charakteristika
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
          Měření závislosti luxů na proudu. Frekvence: 500 Hz, offset: 50%
          amplitudy. Rameno musí být v nulovém úhlu (±5°).
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
          <button
            onClick={handleAddPoint}
            disabled={!isConnected || !amplitudeInput}
            className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white"
          >
            Přidat bod
          </button>
        </div>
      </section>

      <section className="card p-4">
        <XYChart
          title="Lux-Amper charakteristika"
          xAxisLabel="Amplituda [uA]"
          yAxisLabel="Napětí [V]"
          series={chartSeries}
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
