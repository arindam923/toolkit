"use client";

import { useState } from "react";
import BasePdfTool, { PdfFile } from "../components/BasePdfTool";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export default function MergePdfTool() {
  const [files, setFiles] = useState<PdfFile[]>([]);

  // Merge PDFs
  const handleMerge = async (): Promise<string> => {
    try {
      // Create a new PDF document for merging
      const mergedPdf = await PDFDocument.create();

      // Merge all uploaded PDFs
      for (const file of files) {
        // Read file as ArrayBuffer
        const arrayBuffer = await file.file.arrayBuffer();
        
        // Load existing PDF
        const pdfToMerge = await PDFDocument.load(arrayBuffer);
        
        // Copy all pages from current PDF to merged PDF
        const copiedPages = await mergedPdf.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }

      // Save the merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      
      // Create data URL for download
      const blob = new Blob([mergedPdfBytes as unknown as ArrayBuffer], { type: "application/pdf" });
      const dataUrl = URL.createObjectURL(blob);
      
      return dataUrl;
    } catch (error) {
      console.error("Merge failed:", error);
      throw new Error("Failed to merge PDFs");
    }
  };

  // Handle process
  const handleProcess = async (pdfFile: PdfFile): Promise<string> => {
    // Since we need all files to merge, we ignore the individual file parameter
    return handleMerge();
  };

  // Update file order (for drag and drop reordering)
  const handleFileOrderChange = (newOrder: PdfFile[]) => {
    setFiles(newOrder);
  };

  return (
    <BasePdfTool
      title="PDF Merger"
      description="Combine multiple PDF files into a single document. Drag and drop to reorder pages."
      icon="📎"
      onProcess={handleProcess}
      onFilesChange={setFiles}
    >
      {({ files }) => (
        <div className="space-y-4">
          <div className="p-4 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <div className="flex items-start gap-3">
              <div className="text-2xl">📋</div>
              <div>
                <h3 className="text-xs font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
                  Merge Configuration
                </h3>
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  Upload multiple PDF files and they will be merged in the order they are selected.
                </p>
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-text-primary)" }}
              >
                Files to Merge ({files.length})
              </label>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-[10px]"
                    style={{
                      background: "var(--color-background-secondary)",
                      border: "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                        style={{
                          background: "rgba(124,92,53,0.1)",
                          color: "#7C5CFF",
                        }}
                      >
                        {index + 1}
                      </div>
                      <div className="text-xs">
                        <div style={{ color: "var(--color-text-primary)" }} className="font-medium">
                          {file.file.name}
                        </div>
                        <div style={{ color: "var(--color-text-secondary)" }}>
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {index > 0 && (
                        <button
                          onClick={() => {
                            const newFiles = [...files];
                            [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
                            handleFileOrderChange(newFiles);
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded text-xs"
                          style={{
                            background: "var(--color-background-primary)",
                            border: "0.5px solid var(--color-border-tertiary)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          ↑
                        </button>
                      )}
                      {index < files.length - 1 && (
                        <button
                          onClick={() => {
                            const newFiles = [...files];
                            [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
                            handleFileOrderChange(newFiles);
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded text-xs"
                          style={{
                            background: "var(--color-background-primary)",
                            border: "0.5px solid var(--color-border-tertiary)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          ↓
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Tip:</strong> Use the up/down arrows to reorder files before merging. Larger files may take longer to process.
            </p>
          </div>
        </div>
      )}
    </BasePdfTool>
  );
}