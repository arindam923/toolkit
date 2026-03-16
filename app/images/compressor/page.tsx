"use client";

import { useState } from "react";
import BaseTool, { ImageFile } from "../components/BaseTool";
import imageCompression from "browser-image-compression";

interface CompressSettings {
  quality: number;
  maxWidthOrHeight: number;
  useWebp: boolean;
}

export default function ImageCompressor() {
  const [settings, setSettings] = useState<CompressSettings>({
    quality: 80,
    maxWidthOrHeight: 1920,
    useWebp: true,
  });

  // Compress image
  const handleCompress = async (imageFile: ImageFile): Promise<string> => {
    const options = {
      maxSizeMB: 0,
      maxWidthOrHeight: settings.maxWidthOrHeight,
      useWebWorker: true,
      initialQuality: settings.quality / 100,
      fileType: settings.useWebp ? "image/webp" : undefined,
    };

    try {
      const compressedFile = await imageCompression(imageFile.file, options);
      const dataURL = await imageCompression.getDataUrlFromFile(compressedFile);
      return dataURL;
    } catch (error) {
      throw new Error("Compression failed");
    }
  };

  // Calculate file size reduction
  const calculateReduction = (originalSize: number, compressedSize: number) => {
    const reduction = 100 - (compressedSize / originalSize) * 100;
    return Math.round(reduction);
  };

  return (
    <BaseTool
      title="Smart Compressor"
      description="Compress images with smart optimization using WebP format for best results. Adjust quality and maximum dimensions."
      icon="🗜️"
      onProcess={handleCompress}
    >
      {() => (
        <div className="space-y-4">
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
            <span>10% (Smallest)</span>
            <span>100% (Highest)</span>
          </div>
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Max Width/Height (px)
          </label>
          <input
            type="number"
            min="100"
            max="4000"
            value={settings.maxWidthOrHeight}
            onChange={(e) => setSettings((prev) => ({ ...prev, maxWidthOrHeight: parseInt(e.target.value) }))}
            className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
            style={{
              background: "var(--color-background-secondary)",
              borderColor: "var(--color-border-tertiary)",
              color: "var(--color-text-primary)",
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="useWebp"
            checked={settings.useWebp}
            onChange={(e) => setSettings((prev) => ({ ...prev, useWebp: e.target.checked }))}
            className="w-3 h-3"
            style={{
              accentColor: "#FF5C35",
            }}
          />
          <label
            htmlFor="useWebp"
            className="text-xs"
            style={{ color: "var(--color-text-primary)" }}
          >
            Use WebP format (recommended)
          </label>
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Quick Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "Web Optimized", quality: 80, width: 1920 },
              { name: "Email", quality: 70, width: 1200 },
              { name: "Social Media", quality: 90, width: 1080 },
              { name: "Thumbnail", quality: 60, width: 400 },
            ].map((preset) => (
              <button
                key={preset.name}
                onClick={() => setSettings((prev) => ({ ...prev, quality: preset.quality, maxWidthOrHeight: preset.width }))}
                className="px-3 py-1.5 rounded-[10px] text-xs font-medium border"
                style={{
                  background: "var(--color-background-secondary)",
                  borderColor: "var(--color-border-tertiary)",
                  color: "var(--color-text-primary)",
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            <strong>Tip:</strong> WebP format typically gives 25-35% smaller files than JPEG with similar quality.
          </p>
        </div>
        </div>
      )}
    </BaseTool>
  );
}