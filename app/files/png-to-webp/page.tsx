"use client";

import BaseFileTool from "../components/BaseFileTool";

export default function PngToWebp() {
  const handleConvert = async (file: File): Promise<{ url: string; blob: Blob }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve({ url, blob });
          } else {
            reject(new Error("Failed to create blob"));
          }
        }, "image/webp", 0.92);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = URL.createObjectURL(file);
    });
  };

  return (
    <BaseFileTool
      title="PNG to WEBP Converter"
      description="Convert PNG images to WEBP format for better compression."
      icon="🖼️"
      fromFormat="PNG"
      toFormat="WEBP"
      accept="image/png"
      onConvert={handleConvert}
    >
      {() => (
        <div className="space-y-4">
          <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Tip:</strong> WEBP provides superior compression while maintaining quality.
            </p>
          </div>
        </div>
      )}
    </BaseFileTool>
  );
}
