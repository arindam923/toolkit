"use client";

import { useState } from "react";
import BasePdfTool, { PdfFile } from "../components/BasePdfTool";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type AnnotatePosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
type AnnotateColor = "black" | "red" | "blue" | "green";

interface AnnotateSettings {
  text: string;
  position: AnnotatePosition;
  size: number;
  color: AnnotateColor;
}

const COLORS: Record<AnnotateColor, ReturnType<typeof rgb>> = {
  black: rgb(0, 0, 0),
  red: rgb(0.9, 0.1, 0.1),
  blue: rgb(0.1, 0.4, 0.9),
  green: rgb(0.1, 0.7, 0.2),
};

export default function PdfAnnotatorTool() {
  const [settings, setSettings] = useState<AnnotateSettings>({
    text: "",
    position: "bottom-right",
    size: 14,
    color: "black",
  });

  const handleAnnotate = async (pdfFile: PdfFile): Promise<string> => {
    if (!settings.text.trim()) {
      throw new Error("Enter annotation text before processing.");
    }

    const arrayBuffer = await pdfFile.file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    if (pages.length === 0) {
      throw new Error("No pages found in PDF");
    }

    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const textWidth = font.widthOfTextAtSize(settings.text, settings.size);
    const textHeight = settings.size;

    const margin = 24;
    let x = margin;
    let y = margin;

    switch (settings.position) {
      case "top-left":
        x = margin;
        y = height - margin - textHeight;
        break;
      case "top-right":
        x = width - margin - textWidth;
        y = height - margin - textHeight;
        break;
      case "bottom-left":
        x = margin;
        y = margin;
        break;
      case "bottom-right":
        x = width - margin - textWidth;
        y = margin;
        break;
      case "center":
        x = (width - textWidth) / 2;
        y = (height - textHeight) / 2;
        break;
    }

    firstPage.drawText(settings.text, {
      x,
      y,
      size: settings.size,
      font,
      color: COLORS[settings.color],
    });

    const modifiedBytes = await pdfDoc.save();
    const blob = new Blob([modifiedBytes as unknown as BlobPart], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  };

  return (
    <BasePdfTool
      title="PDF Annotator"
      description="Add text annotations to the first page of PDF documents. Choose position, size, and color."
      icon="📝"
      onProcess={handleAnnotate}
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
                    {files[0].file.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
              Annotation Text
            </label>
            <input
              type="text"
              value={settings.text}
              onChange={(e) => setSettings((prev) => ({ ...prev, text: e.target.value }))}
              placeholder="Enter text to add to the first page"
              className="w-full px-3 py-2 rounded-[10px] text-xs border"
              style={{
                background: "var(--color-background-primary)",
                borderColor: "var(--color-border-tertiary)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
              Position
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "top-left", label: "Top Left" },
                { key: "top-right", label: "Top Right" },
                { key: "bottom-left", label: "Bottom Left" },
                { key: "bottom-right", label: "Bottom Right" },
                { key: "center", label: "Center" },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, position: option.key as AnnotatePosition }))}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all ${
                    settings.position === option.key
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
              Font Size: {settings.size}px
            </label>
            <input
              type="range"
              min="8"
              max="72"
              value={settings.size}
              onChange={(e) => setSettings((prev) => ({ ...prev, size: parseInt(e.target.value, 10) }))}
              className="w-full"
              style={{ accentColor: "#7C5CFF" }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {([
                { key: "black", label: "Black" },
                { key: "red", label: "Red" },
                { key: "blue", label: "Blue" },
                { key: "green", label: "Green" },
              ] as { key: AnnotateColor; label: string }[]).map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, color: option.key }))}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all ${
                    settings.color === option.key
                      ? "bg-[#7C5CFF] text-white border-[#7C5CFF]"
                      : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Tip:</strong> Text annotations are added to the first page only. Highlight and sticky-note annotations are coming soon.
            </p>
          </div>
        </div>
      )}
    </BasePdfTool>
  );
}
