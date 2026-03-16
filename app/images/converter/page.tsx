"use client";

import { useState } from "react";
import BaseTool, { ImageFile } from "../components/BaseTool";

interface ConvertSettings {
  format: "jpeg" | "png" | "webp" | "avif";
  quality: number;
}

export default function ImageConverter() {
  const [settings, setSettings] = useState<ConvertSettings>({
    format: "jpeg",
    quality: 80,
  });

  // Convert image to selected format
  const handleConvert = async (imageFile: ImageFile): Promise<string> => {
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

        const mimeType = `image/${settings.format}`;
        const quality = settings.quality / 100;
        const dataURL = canvas.toDataURL(mimeType, quality);
        resolve(dataURL);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = imageFile.previewUrl;
    });
  };

  return (
    <BaseTool
      title="Image Converter"
      description="Convert images between JPG, PNG, WEBP, and AVIF formats with quality control."
      icon="🔄"
      onProcess={handleConvert}
    >
      {() => (
        <div className="space-y-4">
        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Output Format
          </label>
          <div className="flex flex-wrap gap-2">
            {["jpeg", "png", "webp", "avif"].map((format) => (
              <button
                key={format}
                onClick={() => setSettings((prev) => ({ ...prev, format: format as any }))}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all ${
                  settings.format === format
                    ? "bg-[#FF5C35] text-white border-[#FF5C35]"
                    : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
                }`}
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Quality: {settings.quality}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={settings.quality}
            onChange={(e) => setSettings((prev) => ({ ...prev, quality: parseInt(e.target.value) }))}
            className="w-full"
            style={{
              accentColor: "#FF5C35",
            }}
          />
          <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            <span>10%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            <strong>Tip:</strong> WEBP and AVIF formats offer better compression than JPG and PNG.
          </p>
        </div>
        </div>
      )}
    </BaseTool>
  );
}