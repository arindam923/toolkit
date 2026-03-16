"use client";

import { useState } from "react";
import BaseTool, { ImageFile } from "../components/BaseTool";

interface ResizeSettings {
  width: number;
  height: number;
  preserveAspectRatio: boolean;
  quality: number;
}

export default function ImageResizer() {
  const [settings, setSettings] = useState<ResizeSettings>({
    width: 800,
    height: 600,
    preserveAspectRatio: true,
    quality: 80,
  });

  // Resize image
  const handleResize = async (imageFile: ImageFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        let { width, height } = settings;
        if (settings.preserveAspectRatio) {
          const aspectRatio = img.width / img.height;
          if (width && !height) {
            height = Math.round(width / aspectRatio);
          } else if (height && !width) {
            width = Math.round(height * aspectRatio);
          }
        }

        canvas.width = width || img.width;
        canvas.height = height || img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataURL = canvas.toDataURL("image/jpeg", settings.quality / 100);
        resolve(dataURL);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = imageFile.previewUrl;
    });
  };

  // Handle dimension changes
  const handleDimensionChange = (
    dimension: "width" | "height",
    value: string
  ) => {
    const numValue = value ? parseInt(value) : 0;
    setSettings((prev) => {
      const newSettings = { ...prev, [dimension]: numValue };
      if (prev.preserveAspectRatio) {
        // Recalculate the other dimension to preserve aspect ratio
        // We need to load the first image to get original aspect ratio
        // For simplicity, we'll just maintain current aspect ratio
        const aspectRatio = prev.width / prev.height;
        if (dimension === "width") {
          newSettings.height = Math.round(numValue / aspectRatio);
        } else {
          newSettings.width = Math.round(numValue * aspectRatio);
        }
      }
      return newSettings;
    });
  };

  return (
    <BaseTool
      title="Bulk Image Resizer"
      description="Resize multiple images by pixels, percentage, or preset dimensions for social media, print, or web."
      icon="📐"
      onProcess={handleResize}
    >
      {() => (
        <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--color-text-primary)" }}
            >
              Width (px)
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={settings.width}
              onChange={(e) => handleDimensionChange("width", e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
              style={{
                background: "var(--color-background-secondary)",
                borderColor: "var(--color-border-tertiary)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--color-text-primary)" }}
            >
              Height (px)
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={settings.height}
              onChange={(e) => handleDimensionChange("height", e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
              style={{
                background: "var(--color-background-secondary)",
                borderColor: "var(--color-border-tertiary)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="preserveAspectRatio"
            checked={settings.preserveAspectRatio}
            onChange={(e) => setSettings((prev) => ({ ...prev, preserveAspectRatio: e.target.checked }))}
            className="w-3 h-3"
            style={{
              accentColor: "#FF5C35",
            }}
          />
          <label
            htmlFor="preserveAspectRatio"
            className="text-xs"
            style={{ color: "var(--color-text-primary)" }}
          >
            Preserve aspect ratio
          </label>
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

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Quick Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "Social", width: 1080, height: 1080 },
              { name: "Web", width: 1200, height: 800 },
              { name: "Print", width: 2400, height: 1800 },
              { name: "Thumbnail", width: 300, height: 200 },
            ].map((preset) => (
              <button
                key={preset.name}
                onClick={() => setSettings((prev) => ({ ...prev, width: preset.width, height: preset.height }))}
                className="px-3 py-1.5 rounded-[10px] text-xs font-medium border"
                style={{
                  background: "var(--color-background-secondary)",
                  borderColor: "var(--color-border-tertiary)",
                  color: "var(--color-text-primary)",
                }}
              >
                {preset.name} ({preset.width}x{preset.height})
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            <strong>Tip:</strong> Use presets for common sizes. Higher quality settings result in larger file sizes.
          </p>
        </div>
        </div>
      )}
    </BaseTool>
  );
}