"use client";

import { useState } from "react";
import BasePdfTool, { PdfFile } from "../components/BasePdfTool";
import { PDFDocument } from "pdf-lib";
import { logger } from "@/lib/logger";

interface CompressSettings {
  removeMetadata: boolean;
  useObjectStreams: boolean;
}

export default function PdfCompressTool() {
  const [settings, setSettings] = useState<CompressSettings>({
    removeMetadata: true,
    useObjectStreams: true,
  });

  const handleCompress = async (pdfFile: PdfFile): Promise<string> => {
    try {
      const arrayBuffer = await pdfFile.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      if (settings.removeMetadata) {
        pdfDoc.setTitle("");
        pdfDoc.setAuthor("");
        pdfDoc.setSubject("");
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer("");
        pdfDoc.setCreator("");
      }

      const pdfBytes = await pdfDoc.save({
        useObjectStreams: settings.useObjectStreams,
        addDefaultPage: false,
      });

      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const dataUrl = URL.createObjectURL(blob);
      return dataUrl;
    } catch (error) {
      logger.error("Compression failed", error);
      throw new Error(error instanceof Error ? error.message : "Failed to compress PDF");
    }
  };

  return (
    <BasePdfTool
      title="PDF Compressor"
      description="Reduce PDF file size by stripping metadata and using object streams."
      icon="🗜️"
      onProcess={handleCompress}
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

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                id="compress-remove-metadata"
                type="checkbox"
                checked={settings.removeMetadata}
                onChange={(e) => setSettings((prev) => ({ ...prev, removeMetadata: e.target.checked }))}
                className="w-3 h-3"
                style={{ accentColor: "#7C5CFF" }}
              />
              <label htmlFor="compress-remove-metadata" className="text-xs cursor-pointer" style={{ color: "var(--color-text-primary)" }}>
                Remove metadata (title, author, producer, keywords)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="compress-object-streams"
                type="checkbox"
                checked={settings.useObjectStreams}
                onChange={(e) => setSettings((prev) => ({ ...prev, useObjectStreams: e.target.checked }))}
                className="w-3 h-3"
                style={{ accentColor: "#7C5CFF" }}
              />
              <label htmlFor="compress-object-streams" className="text-xs cursor-pointer" style={{ color: "var(--color-text-primary)" }}>
                Use object streams (usually smaller file size)
              </label>
            </div>
          </div>

          <div className="p-3 rounded-[10px]" style={{ background: "rgba(124,92,255,0.08)", border: "0.5px solid rgba(124,92,255,0.2)" }}>
            <h4 className="text-xs font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
              About PDF Compression
            </h4>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              This tool performs structural compression (metadata removal, object streams). For heavy image-based PDFs, use a server-side compressor for aggressive image re-encoding.
            </p>
          </div>
        </div>
      )}
    </BasePdfTool>
  );
}
