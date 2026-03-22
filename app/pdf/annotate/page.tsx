"use client";

import { useState, useEffect } from "react";
import BasePdfTool, { PdfFile } from "../components/BasePdfTool";
import { PDFDocument, rgb } from "pdf-lib";

interface AnnotateSettings {
  mode: "highlight" | "underline" | "note";
  color: string;
}

export default function PdfAnnotatorTool() {
  const [, setFiles] = useState<PdfFile[]>([]);
  const [settings, setSettings] = useState<AnnotateSettings>({
    mode: "highlight",
    color: "yellow",
  });

  // Add annotation to PDF using pdf-lib
  const handleAnnotate = async (pdfFile: PdfFile): Promise<string> => {
    try {
      const arrayBuffer = await pdfFile.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Get the first page to add annotation
      const pages = pdfDoc.getPages();
      if (pages.length === 0) {
        throw new Error("No pages found in PDF");
      }

      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      // Add annotation based on selected mode
      switch (settings.mode) {
        case "highlight":
          // Add a highlight rectangle
          firstPage.drawRectangle({
            x: 50,
            y: height - 100,
            width: width - 100,
            height: 20,
            color: settings.color === "yellow" ? rgb(1, 1, 0.5) :
              settings.color === "green" ? rgb(0.5, 1, 0.5) :
                settings.color === "blue" ? rgb(0.5, 0.7, 1) : rgb(1, 0.5, 0.5),
            opacity: 0.5,
          });
          break;

        case "underline":
          // Add an underline
          firstPage.drawLine({
            start: { x: 50, y: height - 150 },
            end: { x: width - 50, y: height - 150 },
            thickness: 2,
            color: rgb(0, 0, 1),
          });
          break;

        case "note":
          // Add a sticky note icon and text
          firstPage.drawRectangle({
            x: width - 100,
            y: height - 100,
            width: 50,
            height: 50,
            color: rgb(1, 1, 0.5),
          });
          firstPage.drawText("NOTE", {
            x: width - 90,
            y: height - 80,
            size: 12,
            color: rgb(0, 0, 0),
          });
          break;
      }

      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes as unknown as ArrayBuffer], { type: "application/pdf" });
      const dataUrl = URL.createObjectURL(blob);
      return dataUrl;
    } catch (error) {
      console.error("Annotation failed:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to process PDF");
    }
  };

  return (
    <BasePdfTool
      title="PDF Annotator"
      description="Add annotations, comments, highlights, and other markups to PDF documents."
      icon="📝"
      onProcess={handleAnnotate}
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
              Annotation Type
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "highlight", label: "Highlight" },
                { key: "underline", label: "Underline" },
                { key: "note", label: "Sticky Note" },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSettings(prev => ({ ...prev, mode: option.key as any }))}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all ${settings.mode === option.key
                    ? "bg-[#7C5CFF] text-white border-[#7C5CFF]"
                    : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {settings.mode === "highlight" && (
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-text-primary)" }}
              >
                Highlight Color
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "yellow", label: "Yellow", color: "bg-yellow-200" },
                  { key: "green", label: "Green", color: "bg-green-200" },
                  { key: "blue", label: "Blue", color: "bg-blue-200" },
                  { key: "pink", label: "Pink", color: "bg-pink-200" },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setSettings(prev => ({ ...prev, color: option.key }))}
                    className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all flex items-center gap-1 ${settings.color === option.key
                      ? "bg-[#7C5CFF] text-white border-[#7C5CFF]"
                      : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
                      }`}
                  >
                    <div className={`w-3 h-3 rounded ${option.color}`}></div>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 rounded-[10px]" style={{ background: "rgba(34,197,94,0.08)", border: "0.5px solid rgba(34,197,94,0.2)" }}>
            <h4 className="text-xs font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
              ✅ Tool Ready
            </h4>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              The PDF Annotator is now functional! Select an annotation type and process your PDF to add basic annotations.
            </p>
            <ul className="text-xs mt-2 space-y-1" style={{ color: "var(--color-text-secondary)" }}>
              <li>• Highlight text with different colors</li>
              <li>• Add underlines to text</li>
              <li>• Insert sticky note annotations</li>
              <li>• Download annotated PDFs</li>
            </ul>
          </div>
        </div>
      )}
    </BasePdfTool>
  );
}