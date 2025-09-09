import { useState, type Dispatch, type FC, type SetStateAction } from "react";
import { SerialDialog100 } from "../components/SerialDialog100";
import type { Pendulum2Data } from "../App";

type Channel = "A" | "B";

type Pendulum2Props = {
    setPendulum2Data: Dispatch<SetStateAction<Pendulum2Data>>;
    pendulum2Data: Pendulum2Data;
    intersection: { distance: number; time: number };
};

export const Pendulum2: FC<Pendulum2Props> = ({ setPendulum2Data, pendulum2Data, intersection }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [measurementChannel, setMeasurementChannel] = useState<Channel>("A");

    function openDialogFor(channel: Channel) {
        setMeasurementChannel(channel);
        setDialogOpen(true);
    }

    function handleSave(tenValueSums: number[]) {
        if (measurementChannel === "A") {
            setPendulum2Data((prev: Pendulum2Data) => ({ ...prev, measureA: tenValueSums }));
        } else {
            setPendulum2Data((prev: Pendulum2Data) => ({ ...prev, measureB: tenValueSums }));
        }
        setDialogOpen(false);
    }

    const descriptionLabels = [
        "Čas 10. kmitu",
        "Čas 20. kmitu",
        "Čas 30. kmitu",
        "Čas 40. kmitu",
        "Čas 50. kmitu",
        "Čas 60. kmitu",
        "Čas 70. kmitu",
        "Čas 80. kmitu",
        "Čas 90. kmitu",
    ];

    return (
        <div className="container p-4 space-y-4">
            <section className="card p-4">
                <h3 className="text-slate-900 font-medium mb-3">TEXT TBD...</h3>
            </section>
            <div className="flex gap-2 mb-4">
                <button
                    className="px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
                    onClick={() => openDialogFor("A")}
                >
                    Otevřít měření pro A
                </button>
                <button
                    className="px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                    onClick={() => openDialogFor("B")}
                >
                    Otevřít měření pro B
                </button>
            </div>

            <section className="card p-4">
                <h3 className="text-slate-900 font-medium mb-3">
                    Vypočteno na základě proložení předchozího měření:
                    Vzdálenost závaží od konce - {intersection.distance.toFixed(2)} mm,
                    Odhadovaná perioda - {intersection.time.toFixed(0)} ms
                </h3>
            </section>

            <div className="overflow-auto rounded-md border border-slate-200 shadow-sm">
                <table className="min-w-full text-sm text-slate-900">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left px-3 py-2 font-medium text-slate-700">Popis</th>
                            <th className="text-left px-3 py-2 font-medium text-slate-700">Hodnoty A</th>
                            <th className="text-left px-3 py-2 font-medium text-slate-700">Hodnoty B</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {descriptionLabels.map((label, idx) => (
                            <tr key={idx} className="odd:bg-white even:bg-slate-50">
                                <td className="px-3 py-2">{label}</td>
                                <td className="px-3 py-2">{pendulum2Data.measureA[idx]?.toFixed(3) ?? "-"}</td>
                                <td className="px-3 py-2">{pendulum2Data.measureB[idx]?.toFixed(3) ?? "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <SerialDialog100
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                measurementChannel={measurementChannel}
                onSave={handleSave}
            />
        </div>
    );
};
