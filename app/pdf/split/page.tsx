"use client";

import { useState, useEffect } from "react";
import BasePdfTool, { PdfFile } from "../components/BasePdfTool";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

type SplitType = "single" | "range" | "every";

interface SplitSettings {
  splitType: SplitType;
  pageNumber: number;
  rangeStart: number;
  rangeEnd: number;
  everyN: number;
}

const SPLIT_OPTIONS = [
  { key: "single", label: "Single Page" },
  { key: "range", label: "Page Range" },
  { key: "every", label: "Every N Pages" },
] as const;

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

  useEffect(() => {
    let cancelled = false;

    const loadPageCounts = async () => {
      if (files.length === 0) return;

      const counts = await Promise.all(
        files.map(async (file) => {
          try {
            const arrayBuffer = await file.file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            return { id: file.id, count: pdfDoc.getPageCount() };
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
        const next: SplitSettings = { ...prev };
        if (next.pageNumber > maxPages) next.pageNumber = maxPages;
        if (next.rangeStart > maxPages) next.rangeStart = maxPages;
        if (next.rangeEnd > maxPages) next.rangeEnd = maxPages;
        if (next.rangeStart > next.rangeEnd) next.rangeEnd = next.rangeStart;
        if (next.everyN > maxPages) next.everyN = maxPages;
        return next;
      });
    };

    loadPageCounts();

    return () => {
      cancelled = true;
    };
  }, [files]);

  const handleSplit = async (pdfFile: PdfFile): Promise<string> => {
    const arrayBuffer = await pdfFile.file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    const baseName = pdfFile.file.name.replace(/\.[^.]+$/, "");

    if (settings.splitType === "single") {
      if (settings.pageNumber < 1 || settings.pageNumber > pageCount) {
        throw new Error(`Page number must be between 1 and ${pageCount}`);
      }
      const newPdf = await PDFDocument.create();
      const [page] = await newPdf.copyPages(pdfDoc, [settings.pageNumber - 1]);
      newPdf.addPage(page);
      const bytes = await newPdf.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      return URL.createObjectURL(blob);
    }

    if (settings.splitType === "range") {
      if (
        settings.rangeStart < 1 ||
        settings.rangeEnd > pageCount ||
        settings.rangeStart > settings.rangeEnd
      ) {
        throw new Error(`Range must be between 1 and ${pageCount}`);
      }
      const newPdf = await PDFDocument.create();
      const indices = Array.from({ length: settings.rangeEnd - settings.rangeStart + 1 }, (_, i) => i + settings.rangeStart - 1);
      const pages = await newPdf.copyPages(pdfDoc, indices);
      pages.forEach((page) => newPdf.addPage(page));
      const bytes = await newPdf.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      return URL.createObjectURL(blob);
    }

    // every N pages — produce a ZIP of multiple PDFs
    if (settings.everyN < 1 || settings.everyN > pageCount) {
      throw new Error(`Every N pages must be between 1 and ${pageCount}`);
    }

    const zip = new JSZip();
    let chunkIndex = 1;
    for (let start = 0; start < pageCount; start += settings.everyN) {
      const end = Math.min(start + settings.everyN, pageCount);
      const newPdf = await PDFDocument.create();
      const indices = Array.from({ length: end - start }, (_, i) => start + i);
      const pages = await newPdf.copyPages(pdfDoc, indices);
      pages.forEach((page) => newPdf.addPage(page));
      const bytes = await newPdf.save();
      zip.file(`${baseName}_part_${chunkIndex}.pdf`, bytes);
      chunkIndex++;
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    return URL.createObjectURL(zipBlob);
  };

  const maxPages = pageCounts[files[0]?.id] || 1;

  return (
    <BasePdfTool
      title="PDF Splitter"
      description="Extract a single page, a page range, or split into chunks every N pages. Multi-part splits are packaged as a ZIP file."
      icon="✂️"
      onProcess={handleSplit}
      onFilesChange={setFiles}
      downloadExtension={settings.splitType === "every" ? "zip" : "pdf"}
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
              Split Type
            </span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Split type">
              {SPLIT_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  role="radio"
                  aria-checked={settings.splitType === option.key}
                  onClick={() => setSettings((prev) => ({ ...prev, splitType: option.key as SplitType }))}
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
              <label htmlFor="split-page-number" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
                Page Number
              </label>
              <input
                id="split-page-number"
                type="number"
                min={1}
                max={maxPages}
                value={settings.pageNumber}
                onChange={(e) => setSettings((prev) => ({ ...prev, pageNumber: parseInt(e.target.value, 10) || 1 }))}
                className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
                style={{
                  background: "var(--color-background-secondary)",
                  borderColor: "var(--color-border-tertiary)",
                  color: "var(--color-text-primary)",
                }}
              />
              <div className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                Range: 1 - {maxPages} pages
              </div>
            </div>
          )}

          {settings.splitType === "range" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="split-range-start" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
                  From Page
                </label>
                <input
                  id="split-range-start"
                  type="number"
                  min={1}
                  max={maxPages}
                  value={settings.rangeStart}
                  onChange={(e) => setSettings((prev) => ({ ...prev, rangeStart: parseInt(e.target.value, 10) || 1 }))}
                  className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
                  style={{
                    background: "var(--color-background-secondary)",
                    borderColor: "var(--color-border-tertiary)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>
              <div>
                <label htmlFor="split-range-end" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
                  To Page
                </label>
                <input
                  id="split-range-end"
                  type="number"
                  min={1}
                  max={maxPages}
                  value={settings.rangeEnd}
                  onChange={(e) => setSettings((prev) => ({ ...prev, rangeEnd: parseInt(e.target.value, 10) || 1 }))}
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
              <label htmlFor="split-every-n" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
                Pages Per File
              </label>
              <input
                id="split-every-n"
                type="number"
                min={1}
                max={maxPages}
                value={settings.everyN}
                onChange={(e) => setSettings((prev) => ({ ...prev, everyN: parseInt(e.target.value, 10) || 1 }))}
                className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
                style={{
                  background: "var(--color-background-secondary)",
                  borderColor: "var(--color-border-tertiary)",
                  color: "var(--color-text-primary)",
                }}
              />
              <div className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                Creates one PDF per {settings.everyN} pages, packaged as a ZIP.
              </div>
            </div>
          )}

          <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Tip:</strong> Use the range option to extract specific sections. &quot;Every N pages&quot; is useful for dividing a large document into smaller chunks.
            </p>
          </div>
        </div>
      )}
    </BasePdfTool>
  );
}
