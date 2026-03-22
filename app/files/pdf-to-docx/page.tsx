"use client";

import BaseFileTool from "../components/BaseFileTool";

export default function PdfToDocx() {
  const handleConvert = async (file: File): Promise<{ url: string; blob: Blob }> => {
    return new Promise((resolve, reject) => {
      reject(new Error("PDF to DOCX conversion requires server-side processing. This feature is coming soon!"));
    });
  };

  return (
    <BaseFileTool
      title="PDF to DOCX Converter"
      description="Convert PDF documents to editable Word format."
      icon="📄"
      fromFormat="PDF"
      toFormat="DOCX"
      accept="application/pdf"
      onConvert={handleConvert}
    >
      {() => (
        <div className="space-y-4">
          <div className="p-3 rounded-[10px]" style={{ background: "rgba(255,92,53,0.08)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Coming Soon:</strong> PDF to DOCX conversion with layout preservation will be available.
            </p>
          </div>
        </div>
      )}
    </BaseFileTool>
  );
}
