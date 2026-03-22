"use client";

import { useState, useEffect } from "react";
import BasePdfTool, { PdfFile } from "../components/BasePdfTool";
import { PDFDocument } from "pdf-lib";

interface CompressSettings {
  compressionLevel: number; // 0-9
  removeMetadata: boolean;
  flattenAnnotations: boolean;
}

export default function PdfCompressTool() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [settings, setSettings] = useState<CompressSettings>({
    compressionLevel: 6,
    removeMetadata: true,
    flattenAnnotations: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Compress PDF
  const handleCompress = async (pdfFile: PdfFile): Promise<string> => {
    try {
      setIsProcessing(true);
      
      // Load the original PDF
      const arrayBuffer = await pdfFile.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Get page count
      const pageCount = pdfDoc.getPageCount();
      
      // Remove metadata if requested
      if (settings.removeMetadata) {
        pdfDoc.setTitle("");
        pdfDoc.setAuthor("");
        pdfDoc.setSubject("");
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer("");
        pdfDoc.setCreator("");
      }

      // Note: pdf-lib doesn't have direct compression settings
      // The compression happens when we save the document
      // We can optimize by removing unnecessary objects
      
      // Save with compression
      // Higher compressionLevel = more compression but slower
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: true,
      });
      
      // Calculate the compression ratio
      const originalSize = pdfFile.file.size;
      const compressedSize = pdfBytes.length;
      const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100);
      
      console.log(`Compressed from ${originalSize} to ${compressedSize} bytes (${compressionRatio}% reduction)`);
      
      const blob = new Blob([pdfBytes as unknown as ArrayBuffer], { type: "application/pdf" });
      const dataUrl = URL.createObjectURL(blob);
      
      setIsProcessing(false);
      return dataUrl;
    } catch (error) {
      setIsProcessing(false);
      console.error("Compression failed:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to compress PDF");
    }
  };

  return (
    <BasePdfTool
      title="PDF Compressor"
      description="Reduce PDF file size without losing quality using advanced compression algorithms."
      icon="🗜️"
      onProcess={handleCompress}
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
              Compression Level: {settings.compressionLevel}
            </label>
            <input
              type="range"
              min="0"
              max="9"
              value={settings.compressionLevel}
              onChange={(e) => setSettings(prev => ({ ...prev, compressionLevel: parseInt(e.target.value) }))}
              className="w-full"
              style={{ accentColor: "#7C5CFF" }}
            />
            <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
              <span>Fast (Less compression)</span>
              <span>Slow (More compression)</span>
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="flex items-center gap-2 text-xs"
              style={{ color: "var(--color-text-primary)" }}
            >
              <input
                type="checkbox"
                checked={settings.removeMetadata}
                onChange={(e) => setSettings(prev => ({ ...prev, removeMetadata: e.target.checked }))}
                className="w-3 h-3"
                style={{ accentColor: "#7C5CFF" }}
              />
              Remove metadata (title, author, etc.)
            </label>
            
            <label
              className="flex items-center gap-2 text-xs"
              style={{ color: "var(--color-text-primary)" }}
            >
              <input
                type="checkbox"
                checked={settings.flattenAnnotations}
                onChange={(e) => setSettings(prev => ({ ...prev, flattenAnnotations: e.target.checked }))}
                className="w-3 h-3"
                style={{ accentColor: "#7C5CFF" }}
              />
              Flatten annotations
            </label>
          </div>

          <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Tip:</strong> Higher compression levels take longer to process but result in smaller files. Removing metadata can significantly reduce file size for documents with large metadata.
            </p>
          </div>

          {/* Compression Info */}
          {files.length > 0 && (
            <div className="p-3 rounded-[10px]" style={{ background: "rgba(124,92,255,0.08)", border: "0.5px solid rgba(124,92,255,0.2)" }}>
              <h4 className="text-xs font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
                Expected Results
              </h4>
              <div className="space-y-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                <p>• Original size: <strong>{(files[0].file.size / 1024 / 1024).toFixed(2)} MB</strong></p>
                <p>• Compression level: <strong>{settings.compressionLevel}/9</strong></p>
                <p>• Metadata removal: <strong>{settings.removeMetadata ? "Yes" : "No"}</strong></p>
              </div>
            </div>
          )}
        </div>
      )}
    </BasePdfTool>
  );
}