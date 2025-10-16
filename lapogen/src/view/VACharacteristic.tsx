import { type FC, useState } from "react";
import { XYChart } from "../components/XYChart";
import { DataTable, type Column } from "../components/DataTable";
import { MeasurementDialog } from "../components/MeasurementDialog";
import { useWebSerialContext } from "../context/useWebSerialContext";

export type VAData = {
  current: number;
  voltage: number;
};

type VACharacteristicProps = {
  data: VAData[];
  onDataChange: (data: VAData[]) => void;
  isConnected: boolean;
};

export const VACharacteristic: FC<VACharacteristicProps> = ({
  data,
  onDataChange,
  isConnected,
}) => {
  const { setParameters } = useWebSerialContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentInput, setCurrentInput] = useState("");

  const handleAddPoint = async () => {
    const current = parseFloat(currentInput);
    if (isNaN(current) || current < 1 || current > 30000) {
      alert("Zadejte platný proud v rozsahu 1-30000 uA");
      return;
    }
    // For VA characteristic: amp=0, offset=current, freq=1000 Hz (any non-zero)
    await setParameters(0, 1000, current);
    // Wait a bit for the device to settle
    setTimeout(() => {
      setIsDialogOpen(true);
    }, 100);
  };

  const handleSaveMeasurement = (voltage: number) => {
    const current = parseFloat(currentInput);
    const newPoint: VAData = { current, voltage };

    // Check if point with this current already exists
    const existingIndex = data.findIndex((d) => d.current === current);
    if (existingIndex !== -1) {
      const newData = [...data];
      newData[existingIndex] = newPoint;
      onDataChange(newData);
    } else {
      onDataChange([...data, newPoint].sort((a, b) => a.current - b.current));
    }

    setCurrentInput("");
  };

  const handleDelete = (index: number) => {
    onDataChange(data.filter((_, i) => i !== index));
  };

  const columns: Column<VAData>[] = [
    {
      key: "current",
      label: "Proud [uA]",
      render: (item) => item.current.toFixed(0),
    },
    {
      key: "voltage",
      label: "Napětí [V]",
      render: (item) => item.voltage.toFixed(3),
    },
  ];

  const chartSeries = [
    {
      label: "VA Charakteristika",
      data: data.map((d) => ({ x: d.current, y: d.voltage })),
      color: "#3b82f6",
    },
  ];

  return (
    <main className="container py-6 space-y-6">
      <section className="card p-4">
        <h3 className="text-slate-900 font-medium mb-3">
          Měření VA charakteristiky
        </h3>
        <p className="text-slate-700 text-sm mb-4">
          Měření závislosti napětí na diodě na proudu. Nastavte proudový offset
          a měřte napětí.
        </p>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Proud [uA]
            </label>
            <input
              type="number"
              min="1"
              max="30000"
              step="1"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1-30000"
            />
          </div>
          <button
            onClick={handleAddPoint}
            disabled={!isConnected || !currentInput}
            className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white"
          >
            Přidat bod
          </button>
        </div>
      </section>

      <section className="card p-4">
        <XYChart
          title="VA Charakteristika"
          xAxisLabel="Proud [uA]"
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
      />
    </main>
  );
};
