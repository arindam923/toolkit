"use client";

import BaseFileTool from "../components/BaseFileTool";

export default function JpgToPng() {
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
        }, "image/png");
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = URL.createObjectURL(file);
    });
  };

  return (
    <BaseFileTool
      title="JPG to PNG Converter"
      description="Convert JPG images to PNG format with transparency support."
      icon="🖼️"
      fromFormat="JPG"
      toFormat="PNG"
      accept="image/jpeg,image/jpg"
      onConvert={handleConvert}
    >
      {() => (
        <div className="space-y-4">
          <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Tip:</strong> PNG supports transparency and is ideal for graphics, logos, and images with text.
            </p>
          </div>
        </div>
      )}
    </BaseFileTool>
  );
}
