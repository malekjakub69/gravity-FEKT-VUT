import { type FC, useState } from "react";
import { PolarChart } from "../components/PolarChart";
import { DataTable, type Column } from "../components/DataTable";
import { MeasurementDialog } from "../components/MeasurementDialog";
import { useWebSerialContext } from "../context/useWebSerialContext";

export type AngleData = {
  angle: number;
  voltage: number;
  amplitude: number;
};

type AngleCharacteristicProps = {
  data: AngleData[];
  onDataChange: (data: AngleData[]) => void;
  isConnected: boolean;
};

export const AngleCharacteristic: FC<AngleCharacteristicProps> = ({
  data,
  onDataChange,
  isConnected,
}) => {
  const { setParameters } = useWebSerialContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amplitudeInput, setAmplitudeInput] = useState("");
  const [angleInput, setAngleInput] = useState("");

  const handleAddPoint = async () => {
    const amplitude = parseFloat(amplitudeInput);
    const angle = parseFloat(angleInput);

    if (isNaN(amplitude) || amplitude < 0 || amplitude > 30000) {
      alert("Zadejte platnou amplitudu v rozsahu 0-30000 uA");
      return;
    }
    if (isNaN(angle) || angle < 0 || angle >= 360) {
      alert("Zadejte platný úhel v rozsahu 0-359°");
      return;
    }

    // For angle characteristic: freq=500 Hz, offset=50% of amplitude
    await setParameters(amplitude, 500, amplitude / 2);
    // Wait a bit for the device to settle
    setTimeout(() => {
      setIsDialogOpen(true);
    }, 100);
  };

  const handleSaveMeasurement = (voltage: number) => {
    const amplitude = parseFloat(amplitudeInput);
    const angle = parseFloat(angleInput);
    const newPoint: AngleData = { angle, voltage, amplitude };

    onDataChange(
      [...data, newPoint].sort(
        (a, b) => a.amplitude - b.amplitude || a.angle - b.angle
      )
    );
    setAngleInput("");
  };

  const handleDelete = (index: number) => {
    onDataChange(data.filter((_, i) => i !== index));
  };

  const columns: Column<AngleData>[] = [
    {
      key: "amplitude",
      label: "Amplituda [uA]",
      render: (item) => item.amplitude.toFixed(0),
    },
    {
      key: "angle",
      label: "Úhel [°]",
      render: (item) => item.angle.toFixed(1),
    },
    {
      key: "voltage",
      label: "Napětí [V]",
      render: (item) => item.voltage.toFixed(3),
    },
  ];

  const polarData = data.map((d) => ({
    angle: d.angle,
    value: d.voltage,
    amplitude: d.amplitude,
  }));

  return (
    <main className="container py-6 space-y-6">
      <section className="card p-4">
        <h3 className="text-slate-900 font-medium mb-3">Měření úhlu LED</h3>
        <p className="text-slate-700 text-sm mb-4">
          Měření úhlu LED při různých amplitudách. Frekvence: 500 Hz, offset:
          50% amplitudy.
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
              Úhel [°]
            </label>
            <input
              type="number"
              min="0"
              max="359"
              step="0.1"
              value={angleInput}
              onChange={(e) => setAngleInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0-359"
            />
          </div>
          <button
            onClick={handleAddPoint}
            disabled={!isConnected || !amplitudeInput || !angleInput}
            className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white"
          >
            Přidat bod
          </button>
        </div>
      </section>

      <section className="card p-4">
        <PolarChart title="Úhlová charakteristika" data={polarData} />
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
      />
    </main>
  );
};
