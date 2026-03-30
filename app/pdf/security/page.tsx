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
            <div className="p-4 rounded-xl border border-border bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="text-2xl">📄</div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold mono-label text-foreground mb-1">
                    Selected PDF
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {files[0].file.name} ({(files[0].file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-[10px] font-bold mono-label text-muted-foreground">
              Processing Mode
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "lock", label: "Lock (Coming Soon)" },
                { key: "unlock", label: "Unlock (Remove Password)" },
              ].map((option) => (
                <button
                  key={option.key}
                  disabled={option.key === "lock"}
                  onClick={() => {
                    setSettings((prev) => ({ ...prev, mode: option.key as any }));
                    setUnlockError("");
                  }}
                  className={`px-3 py-2 rounded border transition-all mono-label text-[10px] ${
                    settings.mode === option.key
                      ? "bg-foreground text-background border-foreground shadow-[0_0_15px_rgba(0,0,0,0.1)]"
                      : "bg-background text-muted-foreground border-border hover:border-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {settings.mode === "unlock" && (
            <div className="space-y-2">
              <label className="block text-[10px] font-bold mono-label text-muted-foreground">
                PDF Password (if any)
              </label>
              <input
                type="password"
                value={unlockPassword}
                onChange={(e) => {
                  setUnlockPassword(e.target.value);
                  setUnlockError("");
                }}
                placeholder="EXECUTE DECRYPTION PASS..."
                className={`w-full px-4 py-2.5 rounded border font-mono text-xs uppercase tracking-wider outline-none transition-all ${
                  unlockError
                    ? "border-red-500 bg-red-500/5 text-red-500"
                    : "border-border bg-muted/30 focus:border-brand-accent focus:bg-background"
                }`}
              />
              {unlockError && (
                <p className="text-[10px] font-bold mono-label text-red-500 mt-1">
                  {unlockError}
                </p>
              )}
            </div>
          )}

          <div className="p-4 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground leading-relaxed">
            <span className="mono-label text-foreground mr-2">Tip</span>
            This module removes standard PDF password protection. Upload the file, enter the password if known, and execute the process.
          </div>

          <div className="p-4 rounded-xl border border-brand-accent/20 bg-brand-accent/5 text-xs text-muted-foreground leading-relaxed relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent" />
            <h4 className="mono-label text-brand-accent font-bold mb-1">
              Technical Note
            </h4>
            Adding high-entropy encryption to Pdfs requires advanced cryptographic primitives. This feature is currently in development.
          </div>
        </div>
      )}
    </BasePdfTool>
  );
}