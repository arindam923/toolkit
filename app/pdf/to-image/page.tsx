"use client";

import { useState, useEffect, useRef } from "react";
import BasePdfTool, { PdfFile } from "../components/BasePdfTool";

interface ConvertSettings {
  format: "png" | "jpeg" | "webp";
  quality: number;
  dpi: number;
  pageStart: number;
  pageEnd: number;
}

export default function PdfToImageTool() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [settings, setSettings] = useState<ConvertSettings>({
    format: "png",
    quality: 90,
    dpi: 150,
    pageStart: 1,
    pageEnd: 1,
  });
  const [pageCounts, setPageCounts] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Convert PDF to images using dynamic import
  const handleConvert = async (pdfFile: PdfFile): Promise<string> => {
    try {
      setIsProcessing(true);
      
      // Dynamic import to avoid SSR issues
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdfjs-dist/pdf.worker.min.mjs`;
      
      const arrayBuffer = await pdfFile.file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // Calculate scale based on DPI
      const scale = settings.dpi / 72;
      
      // Get the page to convert
      const pageNum = Math.min(Math.max(settings.pageStart, 1), pdfDoc.numPages);
      const page = await pdfDoc.getPage(pageNum);
      
      // Calculate dimensions
      const viewport = page.getViewport({ scale });
      
      // Create canvas
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Canvas context not available");
      }
      
      // Render PDF page to canvas
      await page.render({
        canvasContext: ctx,
        viewport: viewport,
        canvas: canvas,
      } as any).promise;
      
      // Convert to image based on format
      let dataUrl: string;
      const mimeType = `image/${settings.format}`;
      
      if (settings.format === "jpeg") {
        dataUrl = canvas.toDataURL(mimeType, settings.quality / 100);
      } else if (settings.format === "webp") {
        dataUrl = canvas.toDataURL(mimeType, settings.quality / 100);
      } else {
        // PNG doesn't support quality parameter
        dataUrl = canvas.toDataURL(mimeType);
      }
      
      setIsProcessing(false);
      return dataUrl;
    } catch (error) {
      setIsProcessing(false);
      console.error("Conversion failed:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to convert PDF to image");
    }
  };

  // Load PDF page count using dynamic import
  useEffect(() => {
    const loadPageCounts = async () => {
      if (files.length === 0) return;
      
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdfjs-dist/pdf.worker.min.mjs`;
        const newPageCounts: Record<string, number> = {};
        
        for (const file of files) {
          if (!newPageCounts[file.id]) {
            const arrayBuffer = await file.file.arrayBuffer();
            const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            newPageCounts[file.id] = pdfDoc.numPages;
          }
        }

        setPageCounts(newPageCounts);
        
        // Update page range if needed
        if (files.length > 0) {
          const pdfId = files[0].id;
          const maxPages = newPageCounts[pdfId] || 1;
          setSettings(prev => ({
            ...prev,
            pageEnd: Math.min(prev.pageEnd, maxPages),
            pageStart: Math.min(prev.pageStart, maxPages),
          }));
        }
      } catch (error) {
        console.error("Failed to load PDF:", error);
      }
    };

    loadPageCounts();
  }, [files]);

  return (
    <BasePdfTool
      title="PDF to Image"
      description="Convert PDF pages to high-quality images in various formats including JPG, PNG, and WebP."
      icon="🖼️"
      onProcess={handleConvert}
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
                    {files[0].file.name} ({pageCounts[files[0].id] || "?"} pages)
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
              Output Format
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "png", label: "PNG" },
                { key: "jpeg", label: "JPEG" },
                { key: "webp", label: "WebP" },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, format: option.key as any }))}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all ${
                    settings.format === option.key
                      ? "bg-[#7C5CFF] text-white border-[#7C5CFF]"
                      : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
              Page to Convert
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                  From Page
                </label>
                <input
                  type="number"
                  min="1"
                  max={pageCounts[files[0]?.id] || 1}
                  value={settings.pageStart}
                  onChange={(e) => setSettings(prev => ({ ...prev, pageStart: parseInt(e.target.value) || 1 }))}
                  className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
                  style={{
                    background: "var(--color-background-secondary)",
                    borderColor: "var(--color-border-tertiary)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>
              <div>
                <label className="text-[10px] mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                  To Page
                </label>
                <input
                  type="number"
                  min="1"
                  max={pageCounts[files[0]?.id] || 1}
                  value={settings.pageEnd}
                  onChange={(e) => setSettings(prev => ({ ...prev, pageEnd: parseInt(e.target.value) || 1 }))}
                  className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
                  style={{
                    background: "var(--color-background-secondary)",
                    borderColor: "var(--color-border-tertiary)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
              Quality: {settings.quality}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.quality}
              onChange={(e) => setSettings(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
              className="w-full"
              style={{ accentColor: "#7C5CFF" }}
            />
            <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
              <span>Lower quality, smaller file</span>
              <span>Higher quality, larger file</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
              Resolution (DPI): {settings.dpi}
            </label>
            <input
              type="range"
              min="72"
              max="300"
              step="12"
              value={settings.dpi}
              onChange={(e) => setSettings(prev => ({ ...prev, dpi: parseInt(e.target.value) }))}
              className="w-full"
              style={{ accentColor: "#7C5CFF" }}
            />
            <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
              <span>72 (Screen)</span>
              <span>150 (Print)</span>
              <span>300 (High Quality)</span>
            </div>
          </div>

          <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Tip:</strong> Higher DPI produces better quality images but larger file sizes. For web use, 72-150 DPI is usually sufficient.
            </p>
          </div>
        </div>
      )}
    </BasePdfTool>
  );
}