import * as Dialog from "@radix-ui/react-dialog";
import QRCode from "qrcode";
import { type FC, useCallback, useEffect, useState } from "react";
import type { AppData } from "../App";
import { encodeJsonToBase64Url } from "../lib/localStorage";

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
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Serialize data to JSON string with compressed format
  const serializeData = useCallback(() => {
    const exportData = {
      // ulohy1: VA Characteristic - [current, voltage]
      u1: data.vaCharacteristic.map((item) => [item.current, item.voltage]),
      // ulohy2: Angle Characteristic - [angle, voltage, amplitude]
      u2: data.angleCharacteristic.map((item) => [
        item.angle,
        item.voltage,
        item.amplitude,
      ]),
      // ulohy3: Frequency Characteristic - [frequency, voltage, amplitude]
      u3: data.frequencyCharacteristic.map((item) => [
        item.frequency,
        item.voltage,
        item.amplitude,
      ]),
      // ulohy4: Lux-Amper - [amplitude, voltage]
      u4: data.luxAmper.map((item) => [item.amplitude, item.voltage]),
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(exportData);
  }, [data]);

  // Generate export URL with base64url encoded data
  const generateExportUrl = useCallback(() => {
    const dataString = serializeData();
    const base64Data = encodeJsonToBase64Url(dataString);
    const currentOrigin = window.location.href.split("#")[0];
    return `${currentOrigin}#/export?data=${base64Data}`;
  }, [serializeData]);

  // Generate QR code
  const generateQRCode = useCallback(async () => {
    setIsGenerating(true);
    try {
      const exportUrl = generateExportUrl();
      console.log("Generating QR code for URL:", exportUrl);

      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(exportUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      console.log("QR code generated successfully");
      setQrDataUrl(qrDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [generateExportUrl]);

  // Generate QR code when dialog opens
  useEffect(() => {
    if (isOpen) {
      generateQRCode();
    }
  }, [isOpen, generateQRCode]);

  const downloadQRCode = () => {
    if (qrDataUrl) {
      const link = document.createElement("a");
      link.download = `lapogen-data-${
        new Date().toISOString().split("T")[0]
      }.png`;
      link.href = qrDataUrl;
      link.click();
    }
  };

  const copyUrlToClipboard = async () => {
    try {
      const exportUrl = generateExportUrl();
      await navigator.clipboard.writeText(exportUrl);
      alert("URL zkopírována do schránky");
    } catch (error) {
      console.error("Error copying URL to clipboard:", error);
      alert("Chyba při kopírování URL do schránky");
    }
  };

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
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50">
          <Dialog.Title className="text-xl font-semibold text-slate-900 mb-4">
            Export dat
          </Dialog.Title>

          <div className="space-y-4">
            {/* QR Code Display */}
            <div className="flex flex-col items-center space-y-4">
              <h4 className="text-lg font-medium text-slate-900">
                QR kód s daty
              </h4>
              <div className="border-2 border-slate-200 rounded-lg p-4 bg-white">
                {isGenerating ? (
                  <div className="w-[400px] h-[400px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                  </div>
                ) : qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    className="max-w-full h-auto"
                    style={{ width: "400px", height: "400px" }}
                  />
                ) : (
                  <div className="w-[400px] h-[400px] flex items-center justify-center text-slate-500">
                    QR kód se generuje...
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-600 text-center max-w-md">
                Naskenujte tento QR kód pro otevření stránky s daty z měření. QR
                kód obsahuje odkaz na export stránku s vašimi daty.
              </p>
            </div>

            {/* Export URL */}
            <div className="space-y-2">
              <h4 className="text-lg font-medium text-slate-900">Export URL</h4>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="text-sm text-slate-700 break-all">
                  {generateExportUrl()}
                </div>
              </div>
            </div>

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
                onClick={copyUrlToClipboard}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white"
              >
                Kopírovat URL
              </button>
              <button
                onClick={downloadQRCode}
                disabled={!qrDataUrl || isGenerating}
                className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white"
              >
                Stáhnout QR kód
              </button>
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
