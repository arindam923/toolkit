"use client";

import { useState } from "react";
import BasePdfTool, { PdfFile } from "../components/BasePdfTool";
import { PDFDocument } from "pdf-lib";

export default function PdfSecurityTool() {
  const [unlockPassword, setUnlockPassword] = useState("");
  const [unlockError, setUnlockError] = useState("");

  const handleUnlock = async (pdfFile: PdfFile): Promise<string> => {
    try {
      setUnlockError("");
      const arrayBuffer = await pdfFile.file.arrayBuffer();

      const loadOptions: Parameters<typeof PDFDocument.load>[1] = {
        ignoreEncryption: false,
      };
      if (unlockPassword) (loadOptions as { password?: string }).password = unlockPassword;
      const pdfDoc = await PDFDocument.load(arrayBuffer, loadOptions);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const dataUrl = URL.createObjectURL(blob);
      return dataUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to process PDF";
      if (message.toLowerCase().includes("password") || message.toLowerCase().includes("invalid")) {
        setUnlockError("Incorrect password or the PDF requires a different password.");
      } else {
        setUnlockError(message);
      }
      throw new Error(message);
    }
  };

  return (
    <BasePdfTool
      title="PDF Unlock"
      description="Remove password protection from PDF documents. Enter the current password to create an unencrypted copy."
      icon="🔒"
      onProcess={handleUnlock}
    >
      {({ files }) => (
        <div className="space-y-4">
          {files.length > 0 && (
            <div className="p-4 rounded-xl border border-border bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="text-2xl">📄</div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold mono-label text-foreground mb-1">Selected PDF</h3>
                  <p className="text-xs text-muted-foreground truncate">{files[0].file.name}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="pdf-password" className="block text-[10px] font-bold mono-label text-muted-foreground">
              PDF Password
            </label>
            <input
              id="pdf-password"
              type="password"
              value={unlockPassword}
              onChange={(e) => {
                setUnlockPassword(e.target.value);
                setUnlockError("");
              }}
              placeholder="Enter the PDF password"
              className={`w-full px-4 py-2.5 rounded border font-mono text-xs uppercase tracking-wider outline-none transition-all ${
                unlockError ? "border-red-500 bg-red-500/5 text-red-500" : "border-border bg-muted/30 focus:border-brand-accent focus:bg-background"
              }`}
            />
            {unlockError && <p className="text-[10px] font-bold mono-label text-red-500 mt-1">{unlockError}</p>}
          </div>

          <div className="p-4 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground leading-relaxed">
            <span className="mono-label text-foreground mr-2">Tip</span>
            Upload the password-protected PDF, enter the current password, and process. The output will be an unencrypted copy.
          </div>

          <div className="p-4 rounded-xl border border-brand-accent/20 bg-brand-accent/5 text-xs text-muted-foreground leading-relaxed relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent" />
            <h4 className="mono-label text-brand-accent font-bold mb-1">Technical Note</h4>
            Adding password protection is not yet supported in the browser. Use this tool to remove existing passwords only.
          </div>
        </div>
      )}
    </BasePdfTool>
  );
}
