import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalContent, ModalActions } from "./Modal";
import { useWebSerialContext } from "../context/useWebSerialContext";

type Props = {
  inputValueA: string;
  isOpen: boolean;
  onClose: () => void;
  setInputValueA: Dispatch<SetStateAction<string>>;
  measurementChannel: "A" | "B";
  setMeasurementChannel: Dispatch<SetStateAction<"A" | "B">>;
  onSave: (average: number) => void;
};

export function SerialDialog(props: Props) {
  const {
    inputValueA,
    isOpen,
    onClose,
    setInputValueA,
    measurementChannel,
    setMeasurementChannel,
    onSave,
  } = props;

  const { lastLine } = useWebSerialContext();
  const [measurementActive, setMeasurementActive] = useState<boolean>(false);
  const [measurementSamples, setMeasurementSamples] = useState<number[]>([]);
  const [skippedFirstSample, setSkippedFirstSample] = useState<boolean>(false);

  // Reset local dialog state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setMeasurementActive(false);
      setMeasurementSamples([]);
      setSkippedFirstSample(false);
    }
  }, [isOpen]);

  // Collect samples from lastLine when measurement is active (kept only in dialog)
  useEffect(() => {
    if (!measurementActive || !lastLine) return;
    const numMatch = lastLine.match(/[+-]?\d+(?:\.\d+)?/);
    if (numMatch) {
      const val = parseFloat(numMatch[0]);
      if (!skippedFirstSample) {
        setSkippedFirstSample(true);
        return;
      }
      setMeasurementSamples((prev) => {
        const next = [...prev, val];
        if (next.length >= 20) {
          setMeasurementActive(false);
          return next.slice(-20);
        }
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastLine, measurementActive]);

  function start() {
    setMeasurementSamples([]);
    setMeasurementActive(true);
  }

  function stop() {
    setMeasurementActive(false);
  }

  function removeSample(index: number) {
    setMeasurementSamples((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    if (measurementSamples.length < 5) return;
    const avg =
      measurementSamples.reduce((s, v) => s + v, 0) / measurementSamples.length;
    onSave(avg);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} modal size="md">
      <ModalHeader title="Měření" onClose={onClose} />
      <ModalContent className="bg-white p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">valueA</span>
            <input
              type="number"
              value={inputValueA}
              onChange={(e) => setInputValueA(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-300"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">kanál</span>
            <select
              className="px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-300"
              value={measurementChannel}
              onChange={(e) =>
                setMeasurementChannel(e.target.value as "A" | "B")
              }
            >
              <option value="A">Závaží nahoře</option>
              <option value="B">Závaží dole</option>
            </select>
          </label>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={start}
            disabled={measurementActive}
            className="px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white shadow-sm"
          >
            Start (sbírat 20)
          </button>
          <button
            onClick={stop}
            disabled={!measurementActive}
            className="px-3 py-2 rounded-md bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white shadow-sm"
          >
            Stop
          </button>
          <button
            onClick={handleSave}
            disabled={measurementSamples.length < 5 || !inputValueA}
            className="ml-auto px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-sm"
          >
            Save (průměr {measurementSamples.length})
          </button>
        </div>
        <div className="text-sm text-slate-700 mb-2 flex items-center gap-2">
          <span>Naposledy načtené hodnoty (max 20):</span>
          <span className="ml-auto text-slate-600">
            Průměr:{" "}
            {measurementSamples.length > 0
              ? (
                  measurementSamples.reduce((s, v) => s + v, 0) /
                  measurementSamples.length
                ).toFixed(3)
              : "-"}
          </span>
        </div>
        <div className="overflow-auto rounded-md border border-slate-200 shadow-sm max-h-72">
          <table className="min-w-full text-sm text-slate-900">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-slate-700">
                  #
                </th>
                <th className="text-left px-3 py-2 font-medium text-slate-700">
                  Perioda [ms]
                </th>
                <th className="text-right px-3 py-2 font-medium text-slate-700">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(() => {
                const slice = measurementSamples.slice(-20);
                const baseIndex = Math.max(0, measurementSamples.length - 20);
                return slice.map((v, i) => (
                  <tr key={i} className="odd:bg-white even:bg-slate-50">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2">{v}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => removeSample(baseIndex + i)}
                        className="px-2 py-1 rounded-md text-white bg-rose-600 hover:bg-rose-500 shadow-sm"
                      >
                        Smazat
                      </button>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </ModalContent>
      <ModalActions>
        <button
          onClick={onClose}
          className="ml-auto px-3 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          Zavřít
        </button>
      </ModalActions>
    </Modal>
  );
}
