"use client";

import BaseFileTool from "../components/BaseFileTool";

export default function PngToJpg() {
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
        
        // Fill white background (for transparency)
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve({ url, blob });
          } else {
            reject(new Error("Failed to create blob"));
          }
        }, "image/jpeg", 0.92);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = URL.createObjectURL(file);
    });
  };

  return (
    <BaseFileTool
      title="PNG to JPG Converter"
      description="Convert PNG images to JPG format for smaller file sizes."
      icon="🖼️"
      fromFormat="PNG"
      toFormat="JPG"
      accept="image/png"
      onConvert={handleConvert}
    >
      {() => (
        <div className="space-y-4">
          <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Note:</strong> Transparency will be converted to white background.
            </p>
          </div>
        </div>
      )}
    </BaseFileTool>
  );
}
