"use client";

import { useState, useEffect } from "react";
import BasePdfTool, { PdfFile } from "../components/BasePdfTool";
import JSZip from "jszip";

interface ConvertSettings {
  format: "png" | "jpeg" | "webp";
  quality: number;
  dpi: number;
  pageStart: number;
  pageEnd: number;
}

const FORMAT_OPTIONS = [
  { key: "png", label: "PNG" },
  { key: "jpeg", label: "JPEG" },
  { key: "webp", label: "WebP" },
] as const;

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

  useEffect(() => {
    let cancelled = false;

    const loadPageCounts = async () => {
      if (files.length === 0) return;
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `/pdfjs-dist/pdf.worker.min.mjs`;

      const counts = await Promise.all(
        files.map(async (file) => {
          try {
            const arrayBuffer = await file.file.arrayBuffer();
            const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            return { id: file.id, count: pdfDoc.numPages };
          } catch {
            return { id: file.id, count: 0 };
          }
        }),
      );

      if (cancelled) return;

      const newPageCounts: Record<string, number> = {};
      for (const { id, count } of counts) {
        newPageCounts[id] = count;
      }
      setPageCounts(newPageCounts);

      const maxPages = newPageCounts[files[0].id] || 1;
      setSettings((prev) => {
        const currentStart = Math.max(1, Math.min(prev.pageStart || 1, maxPages));
        const currentEnd = Math.max(currentStart, Math.min(prev.pageEnd || maxPages, maxPages));
        // Only auto-expand the default 1-1 range to full document; otherwise preserve user input.
        if (prev.pageStart === 1 && prev.pageEnd === 1 && maxPages > 1) {
          return { ...prev, pageStart: 1, pageEnd: maxPages };
        }
        if (currentStart !== prev.pageStart || currentEnd !== prev.pageEnd) {
          return { ...prev, pageStart: currentStart, pageEnd: currentEnd };
        }
        return prev;
      });
    };

    loadPageCounts();

    return () => {
      cancelled = true;
    };
  }, [files]);

  const handleConvert = async (pdfFile: PdfFile): Promise<string> => {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = `/pdfjs-dist/pdf.worker.min.mjs`;

    const arrayBuffer = await pdfFile.file.arrayBuffer();
    const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;

    const start = Math.min(Math.max(settings.pageStart, 1), pdfDoc.numPages);
    const end = Math.min(Math.max(settings.pageEnd, start), pdfDoc.numPages);
    const scale = settings.dpi / 72;

    const zip = new JSZip();
    const baseName = pdfFile.file.name.replace(/\.[^.]+$/, "");

    for (let pageNum = start; pageNum <= end; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      await page.render({ canvasContext: ctx, viewport } as unknown as Parameters<typeof page.render>[0]).promise;

      const mimeType = `image/${settings.format}`;
      const dataUrl =
        settings.format === "png"
          ? canvas.toDataURL(mimeType)
          : canvas.toDataURL(mimeType, settings.quality / 100);

      const base64 = dataUrl.split(",")[1];
      if (!base64) throw new Error("Failed to generate image data");

      const ext = settings.format === "jpeg" ? "jpg" : settings.format;
      zip.file(`${baseName}_page_${pageNum}.${ext}`, base64, { base64: true });
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const dataUrl = URL.createObjectURL(zipBlob);
    return dataUrl;
  };

  const maxPages = pageCounts[files[0]?.id] || 1;

  return (
    <BasePdfTool
      title="PDF to Image"
      description="Convert PDF pages to high-quality images. Multiple pages are packaged into a ZIP file."
      icon="🖼️"
      onProcess={handleConvert}
      onFilesChange={setFiles}
      downloadExtension="zip"
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
            <span className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
              Output Format
            </span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Output format">
              {FORMAT_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  role="radio"
                  aria-checked={settings.format === option.key}
                  onClick={() => setSettings((prev) => ({ ...prev, format: option.key as ConvertSettings["format"] }))}
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
            <span className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
              Page Range
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="page-start" className="text-[10px] mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                  From Page
                </label>
                <input
                  id="page-start"
                  type="number"
                  min={1}
                  max={maxPages}
                  value={settings.pageStart}
                  onChange={(e) => setSettings((prev) => ({ ...prev, pageStart: parseInt(e.target.value, 10) || 1 }))}
                  className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
                  style={{
                    background: "var(--color-background-secondary)",
                    borderColor: "var(--color-border-tertiary)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>
              <div>
                <label htmlFor="page-end" className="text-[10px] mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                  To Page
                </label>
                <input
                  id="page-end"
                  type="number"
                  min={1}
                  max={maxPages}
                  value={settings.pageEnd}
                  onChange={(e) => setSettings((prev) => ({ ...prev, pageEnd: parseInt(e.target.value, 10) || 1 }))}
                  className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
                  style={{
                    background: "var(--color-background-secondary)",
                    borderColor: "var(--color-border-tertiary)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
              Range: 1 - {maxPages} pages
            </div>
          </div>

          {settings.format !== "png" && (
            <div>
              <label htmlFor="image-quality" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
                Quality: {settings.quality}%
              </label>
              <input
                id="image-quality"
                type="range"
                min="10"
                max="100"
                value={settings.quality}
                onChange={(e) => setSettings((prev) => ({ ...prev, quality: parseInt(e.target.value, 10) }))}
                className="w-full"
                style={{ accentColor: "#7C5CFF" }}
              />
            </div>
          )}

          <div>
            <label htmlFor="image-dpi" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
              Resolution (DPI): {settings.dpi}
            </label>
            <input
              id="image-dpi"
              type="range"
              min="72"
              max="300"
              step="12"
              value={settings.dpi}
              onChange={(e) => setSettings((prev) => ({ ...prev, dpi: parseInt(e.target.value, 10) }))}
              className="w-full"
              style={{ accentColor: "#7C5CFF" }}
            />
          </div>

          <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Tip:</strong> Multi-page exports are packaged as a ZIP file. For web use, 72-150 DPI is usually sufficient.
            </p>
          </div>
        </div>
      )}
    </BasePdfTool>
  );
}
