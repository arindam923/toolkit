"use client";

import { useState, useEffect } from "react";
import BasePdfTool, { PdfFile } from "../components/BasePdfTool";
import { PDFDocument } from "pdf-lib";

interface SplitSettings {
  splitType: "single" | "range" | "every";
  pageNumber: number;
  rangeStart: number;
  rangeEnd: number;
  everyN: number;
}

export default function SplitPdfTool() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [settings, setSettings] = useState<SplitSettings>({
    splitType: "single",
    pageNumber: 1,
    rangeStart: 1,
    rangeEnd: 2,
    everyN: 2,
  });
  const [pageCounts, setPageCounts] = useState<Record<string, number>>({});

  // Load PDF page count when files are uploaded
  useEffect(() => {
    const loadPageCounts = async () => {
      const newPageCounts: Record<string, number> = {};
      
      for (const file of files) {
        if (!newPageCounts[file.id]) {
          try {
            const arrayBuffer = await file.file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            newPageCounts[file.id] = pdfDoc.getPageCount();
          } catch (error) {
            console.error("Failed to load PDF:", error);
            newPageCounts[file.id] = 0;
          }
        }
      }

      setPageCounts(newPageCounts);
    };

    if (files.length > 0) {
      loadPageCounts();
    }
  }, [files]);

  // Split PDF
  const handleSplit = async (pdfFile: PdfFile): Promise<string> => {
    try {
      const arrayBuffer = await pdfFile.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();

      const newPdf = await PDFDocument.create();

      switch (settings.splitType) {
        case "single":
          if (settings.pageNumber < 1 || settings.pageNumber > pageCount) {
            throw new Error(`Page number must be between 1 and ${pageCount}`);
          }
          const singlePage = await newPdf.copyPages(pdfDoc, [settings.pageNumber - 1]);
          newPdf.addPage(singlePage[0]);
          break;

        case "range":
          if (settings.rangeStart < 1 || settings.rangeEnd > pageCount || settings.rangeStart > settings.rangeEnd) {
            throw new Error(`Range must be between 1 and ${pageCount}`);
          }
          const pageIndices = [];
          for (let i = settings.rangeStart - 1; i < settings.rangeEnd; i++) {
            pageIndices.push(i);
          }
          const rangePages = await newPdf.copyPages(pdfDoc, pageIndices);
          rangePages.forEach(page => newPdf.addPage(page));
          break;

        case "every":
          if (settings.everyN < 1 || settings.everyN > pageCount) {
            throw new Error(`Every N pages must be between 1 and ${pageCount}`);
          }
          // This would split into multiple files, but for now we'll just extract first N pages
          const everyPages = await newPdf.copyPages(pdfDoc, Array.from({ length: settings.everyN }, (_, i) => i));
          everyPages.forEach(page => newPdf.addPage(page));
          break;
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as unknown as ArrayBuffer], { type: "application/pdf" });
      const dataUrl = URL.createObjectURL(blob);
      
      return dataUrl;
    } catch (error) {
      console.error("Split failed:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to split PDF");
    }
  };

  return (
    <BasePdfTool
      title="PDF Splitter"
      description="Extract specific pages or ranges from PDF documents. Split by single page, range, or every N pages."
      icon="✂️"
      onProcess={handleSplit}
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
                    {files[0].file.name} ({pageCounts[files[0].id]} pages)
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
              Split Type
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "single", label: "Single Page" },
                { key: "range", label: "Page Range" },
                { key: "every", label: "Every N Pages" },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSettings(prev => ({ ...prev, splitType: option.key as any }))}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all ${
                    settings.splitType === option.key
                      ? "bg-[#7C5CFF] text-white border-[#7C5CFF]"
                      : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {settings.splitType === "single" && (
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-text-primary)" }}
              >
                Page Number
              </label>
              <input
                type="number"
                min="1"
                max={pageCounts[files[0]?.id] || 100}
                value={settings.pageNumber}
                onChange={(e) => setSettings(prev => ({ ...prev, pageNumber: parseInt(e.target.value) || 1 }))}
                className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
                style={{
                  background: "var(--color-background-secondary)",
                  borderColor: "var(--color-border-tertiary)",
                  color: "var(--color-text-primary)",
                }}
              />
              <div className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                Range: 1 - {pageCounts[files[0]?.id] || "?"} pages
              </div>
            </div>
          )}

          {settings.splitType === "range" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  From Page
                </label>
                <input
                  type="number"
                  min="1"
                  max={pageCounts[files[0]?.id] || 100}
                  value={settings.rangeStart}
                  onChange={(e) => setSettings(prev => ({ ...prev, rangeStart: parseInt(e.target.value) || 1 }))}
                  className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
                  style={{
                    background: "var(--color-background-secondary)",
                    borderColor: "var(--color-border-tertiary)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  To Page
                </label>
                <input
                  type="number"
                  min="1"
                  max={pageCounts[files[0]?.id] || 100}
                  value={settings.rangeEnd}
                  onChange={(e) => setSettings(prev => ({ ...prev, rangeEnd: parseInt(e.target.value) || 1 }))}
                  className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
                  style={{
                    background: "var(--color-background-secondary)",
                    borderColor: "var(--color-border-tertiary)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>
            </div>
          )}

          {settings.splitType === "every" && (
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-text-primary)" }}
              >
                Every N Pages
              </label>
              <input
                type="number"
                min="1"
                max={pageCounts[files[0]?.id] || 100}
                value={settings.everyN}
                onChange={(e) => setSettings(prev => ({ ...prev, everyN: parseInt(e.target.value) || 1 }))}
                className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
                style={{
                  background: "var(--color-background-secondary)",
                  borderColor: "var(--color-border-tertiary)",
                  color: "var(--color-text-primary)",
                }}
              />
            </div>
          )}

          <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Tip:</strong> For multi-page PDFs, use the range option to extract specific sections. The page count is automatically detected.
            </p>
          </div>
        </div>
      )}
    </BasePdfTool>
  );
}