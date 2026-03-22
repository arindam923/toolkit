"use client";

import BaseFileTool from "../components/BaseFileTool";

export default function DocxToPdf() {
  const handleConvert = async (file: File): Promise<{ url: string; blob: Blob }> => {
    return new Promise((resolve, reject) => {
      reject(new Error("DOCX to PDF conversion requires server-side processing. This feature is coming soon!"));
    });
  };

  return (
    <BaseFileTool
      title="DOCX to PDF Converter"
      description="Convert Word documents to PDF format."
      icon="📄"
      fromFormat="DOCX"
      toFormat="PDF"
      accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      onConvert={handleConvert}
    >
      {() => (
        <div className="space-y-4">
          <div className="p-3 rounded-[10px]" style={{ background: "rgba(255,92,53,0.08)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Coming Soon:</strong> DOCX to PDF conversion will be available with full layout preservation.
            </p>
          </div>
        </div>
      )}
    </BaseFileTool>
  );
}
