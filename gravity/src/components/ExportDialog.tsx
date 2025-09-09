import React, { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { Modal, ModalHeader, ModalContent, ModalActions } from "./Modal";
import type { Pendulum1Data, Pendulum2Data } from "../App";
import { compressJsonToBase64Url } from "../lib/localStorage";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pendulum1Data: Pendulum1Data;
  pendulum2Data: Pendulum2Data;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  pendulum1Data,
  pendulum2Data,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Debug: Log state changes

  // Serialize data to JSON string
  const serializeData = useCallback(() => {
    const exportData = {
      pendulum1: pendulum1Data,
      pendulum2: pendulum2Data,
      timestamp: new Date().toISOString(),
      version: "1.0",
    };
    return JSON.stringify(exportData, null, 2);
  }, [pendulum1Data, pendulum2Data]);

  // Generate export URL with compressed + base64url encoded data
  const generateExportUrl = useCallback(() => {
    const dataString = serializeData();
    const base64Data = compressJsonToBase64Url(dataString);
    const currentOrigin = window.location.origin;
    return `${currentOrigin}/export?data=${base64Data}`;
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
      console.log("QR data URL set:", qrDataUrl.substring(0, 50) + "...");
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
      link.download = `pendulum-data-${
        new Date().toISOString().split("T")[0]
      }.png`;
      link.href = qrDataUrl;
      link.click();
    }
  };

  const copyDataToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(serializeData());
      // You could add a toast notification here
      alert("Data zkopírována do schránky");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      alert("Chyba při kopírování do schránky");
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader
        title="Export dat"
        subtitle="Exportujte data pomocí QR kódu nebo zkopírujte do schránky"
        onClose={onClose}
      />
      <ModalContent>
        <div className="space-y-6">
          {/* QR Code Display */}
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-lg font-medium text-slate-900">
              QR kód s daty
            </h3>
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
              Naskenujte tento QR kód pro otevření stránky s daty z měření
              kyvadel. QR kód obsahuje odkaz na export stránku s vašimi daty.
            </p>
          </div>

          {/* Export URL */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-slate-900">Export URL</h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="text-sm text-slate-700 break-all">
                {generateExportUrl().slice(0, 100)}...
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="text-sm text-slate-600">Kyvadlo 1 - měření</div>
              <div className="text-lg font-semibold text-slate-900">
                {pendulum1Data.measure.length}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="text-sm text-slate-600">Kyvadlo 2 - měření A</div>
              <div className="text-lg font-semibold text-slate-900">
                {pendulum2Data.measureA.length}
              </div>
            </div>
          </div>
        </div>
      </ModalContent>
      <ModalActions>
        <button
          onClick={copyDataToClipboard}
          className="px-4 py-2 rounded-md bg-slate-300 hover:bg-slate-200 text-slate-700 shadow-sm"
        >
          Kopírovat data
        </button>
        <button
          onClick={copyUrlToClipboard}
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
        >
          Kopírovat URL
        </button>
        <button
          onClick={downloadQRCode}
          disabled={!qrDataUrl || isGenerating}
          className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-sm"
          title={`QR Data URL: ${
            qrDataUrl ? "available" : "not available"
          }, Generating: ${isGenerating}`}
        >
          Stáhnout QR kód
        </button>
      </ModalActions>
    </Modal>
  );
};
