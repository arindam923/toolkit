"use client";

import { useState, useEffect } from "react";
import BasePdfTool, { PdfFile } from "../components/BasePdfTool";

interface OcrSettings {
  extractMethod: "text" | "layout";
}

export default function PdfOcrTool() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [settings, setSettings] = useState<OcrSettings>({
    extractMethod: "text",
  });
  const [extractedText, setExtractedText] = useState<Record<string, string>>({});
  const [pdfjsLib, setPdfjsLib] = useState<any | null>(null);

  // Load pdfjs-dist library
  useEffect(() => {
    const loadPdfJs = async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        // Set worker source for pdfjs
        pdfjs.GlobalWorkerOptions.workerSrc = `/pdfjs-dist/pdf.worker.min.mjs`;
        setPdfjsLib(pdfjs);
      } catch (error) {
        console.error("Failed to load pdfjs-dist:", error);
      }
    };
    loadPdfJs();
  }, []);

  // Extract text from PDF using pdfjs-dist
  const extractText = async (pdfFile: PdfFile): Promise<string> => {
    try {
      if (!pdfjsLib) {
        throw new Error("PDF library not loaded yet");
      }

      const arrayBuffer = await pdfFile.file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      let fullText = "";
      const numPages = pdf.numPages;

      // Extract text from all pages
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: { str: string }) => item.str).join(" ");
        fullText += `Page ${pageNum}:\n${pageText}\n\n`;
      }

      // Store extracted text
      setExtractedText(prev => ({
        ...prev,
        [pdfFile.id]: fullText.trim() || "No text content found in this PDF. This might be a scanned document without selectable text.",
      }));

      // Return the original PDF for download
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const dataUrl = URL.createObjectURL(blob);
      return dataUrl;
    } catch (error) {
      console.error("OCR failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to extract text";
      setExtractedText(prev => ({
        ...prev,
        [pdfFile.id]: `Error extracting text: ${errorMessage}`,
      }));
      throw new Error(errorMessage);
    }
  };

  const handleProcess = async (pdfFile: PdfFile): Promise<string> => {
    return extractText(pdfFile);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (!pdfjsLib) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📄</div>
          <h2 className="text-lg font-semibold mb-2">Loading PDF Tools...</h2>
          <p className="text-sm text-gray-600">Please wait while we load the PDF processing library.</p>
        </div>
      </div>
    );
  }

  return (
    <BasePdfTool
      title="PDF OCR"
      description="Extract text from PDF documents. Perfect for copying content from scanned documents."
      icon="🔍"
      onProcess={handleProcess}
      onFilesChange={setFiles}
      disabled={!pdfjsLib}
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

          {/* Extracted Text Display */}
          {files.length > 0 && extractedText[files[0]?.id] && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="text-xs font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Status
                </label>
                <button
                  onClick={() => copyToClipboard(extractedText[files[0].id])}
                  className="px-2 py-1 text-xs rounded-[8px] border"
                  style={{
                    background: "var(--color-background-secondary)",
                    borderColor: "var(--color-border-tertiary)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Copy
                </button>
              </div>
              <div
                className="p-3 rounded-[10px] max-h-60 overflow-y-auto"
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <pre
                  className="text-xs whitespace-pre-wrap"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {extractedText[files[0].id]}
                </pre>
              </div>
            </div>
          )}

          <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Coming Soon:</strong> Full OCR functionality is under development. This will allow text extraction from both regular and scanned PDFs.
            </p>
          </div>
        </div>
      )}
    </BasePdfTool>
  );
}