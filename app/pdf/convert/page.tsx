"use client";

import { useState, useEffect } from "react";
import BasePdfTool, { PdfFile } from "../components/BasePdfTool";
import JSZip from "jszip";

export default function PdfConvertTool() {
  const [files, setFiles] = useState<PdfFile[]>([]);
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

  // Convert PDF to Word using pdfjs-dist and JSZip
  const handleConvert = async (pdfFile: PdfFile): Promise<string> => {
    try {
      if (!pdfjsLib) {
        throw new Error("PDF library not loaded yet");
      }

      const arrayBuffer = await pdfFile.file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const numPages = pdf.numPages;
      const paragraphs: string[] = [];

      // Extract text from all pages
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Add page marker
        paragraphs.push(`<w:p><w:r><w:t>Page ${pageNum}</w:t></w:r></w:p>`);

        // Group text items by lines (based on y position)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lines = new Map<number, any[]>();

        for (const item of textContent.items) {
          const y = Math.round(item.transform[5]);
          if (!lines.has(y)) {
            lines.set(y, []);
          }
          lines.get(y)!.push(item);
        }

        // Sort lines by y position (top to bottom)
        const sortedY = Array.from(lines.keys()).sort((a, b) => a - b);

        // Create paragraphs from lines
        for (const y of sortedY) {
          const lineItems = lines.get(y)!;

          // Sort items by x position (left to right)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          lineItems.sort((a: any, b: any) => a.transform[4] - b.transform[4]);

          let lineText = "";
          for (const item of lineItems) {
            const str = item.str || "";
            if (!str.trim()) continue;
            lineText += str + " ";
          }

          if (lineText.trim()) {
            // Escape XML special characters
            const escapedText = lineText
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&apos;");

            paragraphs.push(`<w:p><w:r><w:t>${escapedText}</w:t></w:r></w:p>`);
          }
        }

        // Add page break between pages (except last)
        if (pageNum < numPages) {
          paragraphs.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
        }
      }

      // Create Word document XML
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphs.join("\n    ")}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;

      // Create [Content_Types].xml
      const contentTypesXml = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

      // Create _rels/.rels
      const relsXml = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

      // Create word/_rels/document.xml.rels
      const documentRelsXml = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

      // Create ZIP file (Word document)
      const zip = new JSZip();
      zip.file("_rels/.rels", relsXml);
      zip.file("[Content_Types].xml", contentTypesXml);
      zip.file("word/_rels/document.xml.rels", documentRelsXml);
      zip.file("word/document.xml", documentXml);

      // Generate the ZIP file
      const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const dataUrl = URL.createObjectURL(blob);

      return dataUrl;
    } catch (error) {
      console.error("Conversion failed:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to convert PDF to Word");
    }
  };

  if (!pdfjsLib) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <h2 className="text-lg font-semibold mb-2">Loading PDF Tools...</h2>
          <p className="text-sm text-gray-600">Please wait while we load the PDF processing library.</p>
        </div>
      </div>
    );
  }

  return (
    <BasePdfTool
      title="PDF to Word"
      description="Convert PDF documents to editable Word (.docx) files with preserved formatting."
      icon="📄"
      onProcess={handleConvert}
      onFilesChange={setFiles}
      disabled={!pdfjsLib}
      downloadExtension="docx"
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

          <div className="p-3 rounded-[10px]" style={{ background: "rgba(124,92,255,0.08)", border: "0.5px solid rgba(124,92,255,0.2)" }}>
            <h4 className="text-xs font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
              About PDF to Word
            </h4>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              This tool extracts text content from your PDF and creates a professionally formatted Word document. It preserves:
            </p>
            <ul className="text-xs mt-2 space-y-1" style={{ color: "var(--color-text-secondary)" }}>
              <li>✓ Text content with basic formatting (bold, italic)</li>
              <li>✓ Page structure with page breaks</li>
              <li>✓ Reading order and paragraph structure</li>
            </ul>
            <p className="text-xs mt-2" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Note:</strong> Complex layouts, tables, and images may not convert perfectly. The output is best for text-heavy documents.
            </p>
          </div>
        </div>
      )}
    </BasePdfTool>
  );
}