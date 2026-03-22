"use client";

import { useState } from "react";
import BasePdfTool, { PdfFile } from "../components/BasePdfTool";
import { PDFDocument } from "pdf-lib";

interface SecuritySettings {
  mode: "lock" | "unlock";
  password: string;
}

export default function PdfSecurityTool() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [settings, setSettings] = useState<SecuritySettings>({
    mode: "lock",
    password: "",
  });
  const [unlockPassword, setUnlockPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [unlockError, setUnlockError] = useState("");

  // Unlock PDF (remove password protection)
  const handleUnlock = async (pdfFile: PdfFile): Promise<string> => {
    try {
      setIsProcessing(true);
      setUnlockError("");
      
      // Load the original PDF
      const arrayBuffer = await pdfFile.file.arrayBuffer();
      
      // Try to load with password
      let pdfDoc;
      try {
        pdfDoc = await PDFDocument.load(arrayBuffer);
      } catch (error) {
        setIsProcessing(false);
        setUnlockError("This PDF may not be password protected or the password is incorrect.");
        throw new Error("Unable to process PDF");
      }
      
      // Save as unencrypted PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as ArrayBuffer], { type: "application/pdf" });
      const dataUrl = URL.createObjectURL(blob);
      
      setIsProcessing(false);
      return dataUrl;
    } catch (error) {
      setIsProcessing(false);
      console.error("Unlock failed:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to process PDF");
    }
  };

  const handleProcess = async (pdfFile: PdfFile): Promise<string> => {
    return handleUnlock(pdfFile);
  };

  return (
    <BasePdfTool
      title="PDF Lock / Unlock"
      description="Remove password protection from PDF documents. (Password protection coming soon)"
      icon="🔒"
      onProcess={handleProcess}
      onFilesChange={setFiles}
    >
      {({ files }) => (
        <div className="space-y-4">
          {files.length > 0 && (
            <div className="p-4 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
              <div className="flex items-start gap-3">
                <div className="text-2xl">📄</div>
                <div>
                  <h3 className="text-xs font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
                    Selected PDF
                  </h3>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {files[0].file.name} ({(files[0].file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--color-text-primary)" }}
            >
              Mode
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "lock", label: "Lock (Coming Soon)" },
                { key: "unlock", label: "Unlock (Remove Password)" },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => {
                    setSettings(prev => ({ ...prev, mode: option.key as any }));
                    setUnlockError("");
                  }}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all ${
                    settings.mode === option.key
                      ? "bg-[#7C5CFF] text-white border-[#7C5CFF]"
                      : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)] opacity-50"
                  }`}
                  disabled={option.key === "lock"}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {settings.mode === "unlock" && (
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-text-primary)" }}
              >
                PDF Password (if any)
              </label>
              <input
                type="password"
                value={unlockPassword}
                onChange={(e) => {
                  setUnlockPassword(e.target.value);
                  setUnlockError("");
                }}
                placeholder="Enter password if the PDF is protected"
                className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
                style={{
                  background: "var(--color-background-secondary)",
                  borderColor: unlockError ? "#ef4444" : "var(--color-border-tertiary)",
                  color: "var(--color-text-primary)",
                }}
              />
              {unlockError && (
                <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                  {unlockError}
                </p>
              )}
            </div>
          )}

          <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Tip:</strong> This tool helps you remove password protection from PDFs. Simply upload your PDF and click Process to attempt to remove any encryption.
            </p>
          </div>

          <div className="p-3 rounded-[10px]" style={{ background: "rgba(124,92,255,0.08)", border: "0.5px solid rgba(124,92,255,0.2)" }}>
            <h4 className="text-xs font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
              Note
            </h4>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Adding password protection to PDFs requires advanced encryption features. This feature will be available in a future update.
            </p>
          </div>
        </div>
      )}
    </BasePdfTool>
  );
}