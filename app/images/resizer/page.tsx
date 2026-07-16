"use client";

import { useState, useEffect } from "react";
import BaseTool, { ImageFile } from "../components/BaseTool";

type ResizeMode = "dimensions" | "percent" | "preset";
type PresetKey = "social" | "web" | "print" | "thumbnail";

interface ResizeSettings {
  mode: ResizeMode;
  width: number;
  height: number;
  percent: number;
  preset: PresetKey;
  preserveAspectRatio: boolean;
  quality: number;
}

const PRESETS: Record<PresetKey, { width: number; height: number; label: string }> = {
  social: { width: 1080, height: 1080, label: "Social" },
  web: { width: 1200, height: 800, label: "Web" },
  print: { width: 2400, height: 1800, label: "Print" },
  thumbnail: { width: 300, height: 200, label: "Thumbnail" },
};

function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = url;
  });
}

export default function ImageResizer() {
  const [settings, setSettings] = useState<ResizeSettings>({
    mode: "dimensions",
    width: 800,
    height: 0,
    percent: 100,
    preset: "web",
    preserveAspectRatio: true,
    quality: 90,
  });

  const [originalSizes, setOriginalSizes] = useState<Record<string, { width: number; height: number }>>({});
  const [files, setFiles] = useState<ImageFile[]>([]);

  // Load dimensions for newly uploaded files outside of render.
  useEffect(() => {
    let cancelled = false;

    const loadMissing = async () => {
      const missing = files.filter((f) => !originalSizes[f.id]);
      if (missing.length === 0) return;

      const entries = await Promise.all(
        missing.map(async (f) => {
          const dims = await getImageDimensions(f.previewUrl);
          return { id: f.id, dims };
        }),
      );

      if (cancelled) return;

      setOriginalSizes((prev) => {
        const next = { ...prev };
        for (const { id, dims } of entries) {
          next[id] = dims;
        }
        return next;
      });

      // Pre-fill height from width + first loaded image's aspect ratio once.
      const firstWithDims = entries.find((e) => e.dims.width > 0 && e.dims.height > 0);
      if (firstWithDims && settings.width > 0 && settings.height === 0) {
        const aspect = firstWithDims.dims.width / firstWithDims.dims.height;
        setSettings((prev) => ({ ...prev, height: Math.round(prev.width / aspect) }));
      }
    };

    loadMissing();

    return () => {
      cancelled = true;
    };
  }, [files, originalSizes, settings.width, settings.height]);

  const calculateOutputSize = (origWidth: number, origHeight: number) => {
    const { mode, width, height, percent, preset, preserveAspectRatio } = settings;

    let targetWidth = origWidth;
    let targetHeight = origHeight;

    if (mode === "preset") {
      targetWidth = PRESETS[preset].width;
      targetHeight = PRESETS[preset].height;
      if (preserveAspectRatio) {
        const aspect = origWidth / origHeight;
        const presetAspect = targetWidth / targetHeight;
        if (aspect > presetAspect) {
          targetHeight = Math.round(targetWidth / aspect);
        } else {
          targetWidth = Math.round(targetHeight * aspect);
        }
      }
    } else if (mode === "percent") {
      targetWidth = Math.round(origWidth * (percent / 100));
      targetHeight = Math.round(origHeight * (percent / 100));
    } else {
      // dimensions mode
      if (width && height) {
        targetWidth = width;
        targetHeight = height;
      } else if (width && preserveAspectRatio) {
        targetWidth = width;
        targetHeight = Math.round(width / (origWidth / origHeight));
      } else if (height && preserveAspectRatio) {
        targetHeight = height;
        targetWidth = Math.round(height * (origWidth / origHeight));
      } else if (width) {
        targetWidth = width;
      } else if (height) {
        targetHeight = height;
      }
    }

    return {
      width: Math.max(1, targetWidth),
      height: Math.max(1, targetHeight),
    };
  };

  const handleResize = async (imageFile: ImageFile): Promise<string> => {
    const dims = originalSizes[imageFile.id] || (await getImageDimensions(imageFile.previewUrl));
    if (!dims.width || !dims.height) {
      throw new Error("Failed to read image dimensions");
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        const output = calculateOutputSize(dims.width, dims.height);
        canvas.width = output.width;
        canvas.height = output.height;
        ctx.drawImage(img, 0, 0, output.width, output.height);

        const dataURL = canvas.toDataURL("image/jpeg", settings.quality / 100);
        resolve(dataURL);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = imageFile.previewUrl;
    });
  };

  const handleDimensionChange = (dimension: "width" | "height", value: string) => {
    const numValue = value ? parseInt(value, 10) : 0;
    setSettings((prev) => ({ ...prev, [dimension]: numValue }));
  };

  return (
    <BaseTool
      title="Bulk Image Resizer"
      description="Resize multiple images by pixels, percentage, or preset dimensions for social media, print, or web. Aspect ratio is preserved using each image's original dimensions."
      icon="📐"
      onProcess={handleResize}
      onFilesChange={setFiles}
    >
      {() => (
        <div className="space-y-4">
          <div>
            <span className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
              Resize Mode
            </span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Resize mode">
              {[
                { key: "dimensions", label: "Dimensions" },
                { key: "percent", label: "Percentage" },
                { key: "preset", label: "Preset" },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  role="radio"
                  aria-checked={settings.mode === option.key}
                  onClick={() => setSettings((prev) => ({ ...prev, mode: option.key as ResizeMode }))}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all ${
                    settings.mode === option.key
                      ? "bg-[#FF5C35] text-white border-[#FF5C35]"
                      : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {settings.mode === "dimensions" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="resize-width" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
                  Width (px)
                </label>
                <input
                  id="resize-width"
                  type="number"
                  min="1"
                  max="10000"
                  value={settings.width || ""}
                  onChange={(e) => handleDimensionChange("width", e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
                  style={{
                    background: "var(--color-background-secondary)",
                    borderColor: "var(--color-border-tertiary)",
                    color: "var(--color-text-primary)",
                  }}
                  placeholder="Width"
                />
              </div>
              <div>
                <label htmlFor="resize-height" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
                  Height (px)
                </label>
                <input
                  id="resize-height"
                  type="number"
                  min="1"
                  max="10000"
                  value={settings.height || ""}
                  onChange={(e) => handleDimensionChange("height", e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
                  style={{
                    background: "var(--color-background-secondary)",
                    borderColor: "var(--color-border-tertiary)",
                    color: "var(--color-text-primary)",
                  }}
                  placeholder="Height"
                />
              </div>
            </div>
          )}

          {settings.mode === "percent" && (
            <div>
              <label htmlFor="resize-percent" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
                Scale: {settings.percent}%
              </label>
              <input
                id="resize-percent"
                type="range"
                min="1"
                max="400"
                value={settings.percent}
                onChange={(e) => setSettings((prev) => ({ ...prev, percent: parseInt(e.target.value, 10) }))}
                className="w-full"
                style={{ accentColor: "#FF5C35" }}
              />
              <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                <span>1%</span>
                <span>400%</span>
              </div>
            </div>
          )}

          {settings.mode === "preset" && (
            <div>
              <span className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
                Preset
              </span>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Preset dimensions">
                {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={settings.preset === key}
                    onClick={() => setSettings((prev) => ({ ...prev, preset: key }))}
                    className={`px-3 py-2 rounded-[10px] text-xs font-medium border transition-all text-left ${
                      settings.preset === key
                        ? "bg-[#FF5C35] text-white border-[#FF5C35]"
                        : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
                    }`}
                  >
                    <div className="font-semibold">{PRESETS[key].label}</div>
                    <div className={`text-[10px] ${settings.preset === key ? "text-white/70" : ""}`}>
                      {PRESETS[key].width}×{PRESETS[key].height}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="preserveAspectRatio"
              checked={settings.preserveAspectRatio}
              onChange={(e) => setSettings((prev) => ({ ...prev, preserveAspectRatio: e.target.checked }))}
              className="w-3 h-3"
              style={{ accentColor: "#FF5C35" }}
              disabled={settings.mode === "dimensions" && settings.width > 0 && settings.height > 0}
            />
            <label htmlFor="preserveAspectRatio" className="text-xs" style={{ color: "var(--color-text-primary)" }}>
              Preserve aspect ratio
            </label>
          </div>

          <div>
            <label htmlFor="resize-quality" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
              Quality: {settings.quality}%
            </label>
            <input
              id="resize-quality"
              type="range"
              min="10"
              max="100"
              value={settings.quality}
              onChange={(e) => setSettings((prev) => ({ ...prev, quality: parseInt(e.target.value, 10) }))}
              className="w-full"
              style={{ accentColor: "#FF5C35" }}
            />
            <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
              <span>10%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Tip:</strong> Leave width or height empty to auto-calculate from the other dimension while preserving each image&apos;s original aspect ratio.
            </p>
          </div>
        </div>
      )}
    </BaseTool>
  );
}
