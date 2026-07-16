"use client";

import { useState } from "react";
import BasePdfTool, { PdfFile } from "../components/BasePdfTool";
import { PDFDocument, rgb } from "pdf-lib";

interface PdfTextItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
  hasEOL: boolean;
}

interface RedactSettings {
  searchText: string;
  redactionLabel: string;
  caseSensitive: boolean;
}

interface Match {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function PdfRedactorTool() {
  const [settings, setSettings] = useState<RedactSettings>({
    searchText: "",
    redactionLabel: "[REDACTED]",
    caseSensitive: false,
  });
  const [matchCount, setMatchCount] = useState<number | null>(null);

  const findTextMatches = async (pdfFile: PdfFile): Promise<Match[]> => {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = `/pdfjs-dist/pdf.worker.min.mjs`;

    const arrayBuffer = await pdfFile.file.arrayBuffer();
    const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const matches: Match[] = [];
    const query = settings.caseSensitive ? settings.searchText : settings.searchText.toLowerCase();

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      const textContent = await page.getTextContent();

      for (const item of textContent.items) {
        const textItem = item as PdfTextItem;
        const str = settings.caseSensitive ? textItem.str : textItem.str.toLowerCase();
        if (!str || !str.includes(query)) continue;

        const tx = textItem.transform;
        const x = tx[4];
        const y = viewport.height - tx[5]; // pdfjs uses bottom-left; pdf-lib uses bottom-left
        const width = textItem.width;
        const height = textItem.height || 10;

        matches.push({ page: pageNum, x, y: y - height, width, height });
      }
    }

    return matches;
  };

  const handleRedact = async (pdfFile: PdfFile): Promise<string> => {
    if (!settings.searchText.trim()) {
      throw new Error("Enter text to search for before redacting.");
    }

    const matches = await findTextMatches(pdfFile);
    setMatchCount(matches.length);

    if (matches.length === 0) {
      throw new Error(`No matches found for "${settings.searchText}".`);
    }

    const arrayBuffer = await pdfFile.file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    for (const match of matches) {
      const page = pages[match.page - 1];
      if (!page) continue;
      const { height: pageHeight } = page.getSize();

      // pdf-lib coordinates: origin is bottom-left
      const drawY = pageHeight - match.y - match.height;

      page.drawRectangle({
        x: match.x,
        y: drawY,
        width: match.width,
        height: match.height,
        color: rgb(0, 0, 0),
      });

      if (settings.redactionLabel.trim()) {
        page.drawText(settings.redactionLabel, {
          x: match.x + 2,
          y: drawY + 2,
          size: Math.max(6, match.height * 0.6),
          color: rgb(1, 1, 1),
        });
      }
    }

    const redactedBytes = await pdfDoc.save();
    const blob = new Blob([redactedBytes as unknown as BlobPart], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  };

  return (
    <BasePdfTool
      title="PDF Redactor"
      description="Search and redact sensitive text from PDF documents. Each matched occurrence is covered with a black rectangle."
      icon="🔴"
      onProcess={handleRedact}
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
              Text to Redact
            </label>
            <input
              type="text"
              value={settings.searchText}
              onChange={(e) => setSettings((prev) => ({ ...prev, searchText: e.target.value }))}
              placeholder="e.g. SSN, email address, name"
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
              Redaction Label (optional)
            </label>
            <input
              type="text"
              value={settings.redactionLabel}
              onChange={(e) => setSettings((prev) => ({ ...prev, redactionLabel: e.target.value }))}
              placeholder="[REDACTED]"
              className="w-full px-3 py-2 rounded-[10px] text-xs border"
              style={{
                background: "var(--color-background-primary)",
                borderColor: "var(--color-border-tertiary)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>

          <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--color-text-primary)" }}>
            <input
              type="checkbox"
              checked={settings.caseSensitive}
              onChange={(e) => setSettings((prev) => ({ ...prev, caseSensitive: e.target.checked }))}
              className="w-3 h-3"
              style={{ accentColor: "#7C5CFF" }}
            />
            Case-sensitive search
          </label>

          {matchCount !== null && (
            <div
              className="p-3 rounded-[10px] text-xs"
              style={{
                background: matchCount > 0 ? "rgba(34,197,94,0.08)" : "rgba(255,92,53,0.08)",
                border: `0.5px solid ${matchCount > 0 ? "rgba(34,197,94,0.2)" : "rgba(255,92,53,0.2)"}`,
                color: "var(--color-text-primary)",
              }}
            >
              {matchCount > 0
                ? `${matchCount} occurrence${matchCount === 1 ? "" : "s"} found and redacted.`
                : `No occurrences found for "${settings.searchText}".`}
            </div>
          )}

          <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Tip:</strong> Run the tool once to preview; the output is saved with redactions applied. For graphical redaction (drawing boxes by hand), that feature is coming soon.
            </p>
          </div>
        </div>
      )}
    </BasePdfTool>
  );
}
