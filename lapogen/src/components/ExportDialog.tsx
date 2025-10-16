import { type FC } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { AppData } from "../App";

type ExportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
};

export const ExportDialog: FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const exportAsJSON = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lapogen-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = (type: keyof AppData) => {
    let csv = "";
    const dataSet = data[type];

    if (!dataSet || dataSet.length === 0) {
      alert("Žádná data k exportu");
      return;
    }

    // Generate CSV based on data type
    const keys = Object.keys(dataSet[0]);
    csv = keys.join(",") + "\n";
    dataSet.forEach((row: any) => {
      csv += keys.map((key) => row[key]).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lapogen-${type}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPoints =
    data.vaCharacteristic.length +
    data.angleCharacteristic.length +
    data.frequencyCharacteristic.length +
    data.luxAmper.length;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-lg z-50">
          <Dialog.Title className="text-xl font-semibold text-slate-900 mb-4">
            Export dat
          </Dialog.Title>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-md">
              <h4 className="font-medium text-slate-900 mb-2">Přehled dat</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
                <div>VA Charakteristika:</div>
                <div className="font-medium">
                  {data.vaCharacteristic.length} bodů
                </div>
                <div>Úhel LED:</div>
                <div className="font-medium">
                  {data.angleCharacteristic.length} bodů
                </div>
                <div>Frekvenční char.:</div>
                <div className="font-medium">
                  {data.frequencyCharacteristic.length} bodů
                </div>
                <div>Lux-Amper:</div>
                <div className="font-medium">{data.luxAmper.length} bodů</div>
                <div className="col-span-2 border-t border-slate-200 pt-2 mt-2">
                  <strong>Celkem: {totalPoints} bodů</strong>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-2">
                Export všech dat
              </h4>
              <button
                onClick={exportAsJSON}
                className="w-full px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white"
              >
                Stáhnout JSON
              </button>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-2">
                Export jednotlivých měření (CSV)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => exportAsCSV("vaCharacteristic")}
                  disabled={data.vaCharacteristic.length === 0}
                  className="px-3 py-2 rounded-md bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white text-sm"
                >
                  VA Char.
                </button>
                <button
                  onClick={() => exportAsCSV("angleCharacteristic")}
                  disabled={data.angleCharacteristic.length === 0}
                  className="px-3 py-2 rounded-md bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white text-sm"
                >
                  Úhel LED
                </button>
                <button
                  onClick={() => exportAsCSV("frequencyCharacteristic")}
                  disabled={data.frequencyCharacteristic.length === 0}
                  className="px-3 py-2 rounded-md bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white text-sm"
                >
                  Frekv. char.
                </button>
                <button
                  onClick={() => exportAsCSV("luxAmper")}
                  disabled={data.luxAmper.length === 0}
                  className="px-3 py-2 rounded-md bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white text-sm"
                >
                  Lux-Amper
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-200">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-md bg-slate-300 hover:bg-slate-200 text-slate-700"
              >
                Zavřít
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
