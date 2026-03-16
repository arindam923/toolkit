"use client";

import { useState, useRef, useEffect } from "react";
import BaseTool, { ImageFile } from "../components/BaseTool";

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  quality: number;
}

export default function FilterEditor() {
  const [settings, setSettings] = useState<FilterSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    quality: 90,
  });

  const [selectedFile, setSelectedFile] = useState<ImageFile | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Handle file upload for preview
  useEffect(() => {
    // This effect will be triggered when files are uploaded in BaseTool
    // For simplicity, we'll assume the first file is selected for preview
    // In a real implementation, you would need to handle file selection
  }, []);

  // Apply filters to image
  const handleFilter = async (imageFile: ImageFile): Promise<string> => {
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

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply filters
        for (let i = 0; i < data.length; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          // Brightness
          r = Math.min(255, Math.max(0, r * (settings.brightness / 100)));
          g = Math.min(255, Math.max(0, g * (settings.brightness / 100)));
          b = Math.min(255, Math.max(0, b * (settings.brightness / 100)));

          // Contrast
          const contrastFactor = (259 * (settings.contrast + 255)) / (255 * (259 - settings.contrast));
          r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128));
          g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128));
          b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128));

          // Saturation
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = Math.min(255, Math.max(0, gray + (r - gray) * (settings.saturation / 100)));
          g = Math.min(255, Math.max(0, gray + (g - gray) * (settings.saturation / 100)));
          b = Math.min(255, Math.max(0, gray + (b - gray) * (settings.saturation / 100)));

          // Grayscale
          const grayScale = 0.299 * r + 0.587 * g + 0.114 * b;
          r = Math.min(255, Math.max(0, gray + (grayScale - gray) * (settings.grayscale / 100)));
          g = Math.min(255, Math.max(0, gray + (grayScale - gray) * (settings.grayscale / 100)));
          b = Math.min(255, Math.max(0, gray + (grayScale - gray) * (settings.grayscale / 100)));

          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
        }

        ctx.putImageData(imageData, 0, 0);

        // Apply blur
        if (settings.blur > 0) {
          const blurredCanvas = document.createElement("canvas");
          const blurredCtx = blurredCanvas.getContext("2d");
          if (blurredCtx) {
            blurredCanvas.width = canvas.width;
            blurredCanvas.height = canvas.height;
            blurredCtx.filter = `blur(${settings.blur}px)`;
            blurredCtx.drawImage(canvas, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(blurredCanvas, 0, 0);
          }
        }

        const dataURL = canvas.toDataURL("image/jpeg", settings.quality / 100);
        resolve(dataURL);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = imageFile.previewUrl;
    });
  };

  // Apply preset filters
  const applyPreset = (preset: string) => {
    const presets: Record<string, Partial<FilterSettings>> = {
      "vintage": { brightness: 90, contrast: 110, saturation: 85, grayscale: 15, blur: 0 },
      "vivid": { brightness: 105, contrast: 120, saturation: 130, grayscale: 0, blur: 0 },
      "black-and-white": { brightness: 100, contrast: 110, saturation: 0, grayscale: 100, blur: 0 },
      "cinematic": { brightness: 95, contrast: 115, saturation: 90, grayscale: 0, blur: 0.5 },
      "soft-focus": { brightness: 102, contrast: 95, saturation: 95, grayscale: 0, blur: 1 },
    };

    setSettings((prev) => ({ ...prev, ...presets[preset] }));
  };

  // Update preview whenever settings change
  useEffect(() => {
    if (!selectedFile || !previewCanvasRef.current) return;

    const img = new Image();
    img.onload = () => {
      const canvas = previewCanvasRef.current!;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Apply filters
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Brightness
        r = Math.min(255, Math.max(0, r * (settings.brightness / 100)));
        g = Math.min(255, Math.max(0, g * (settings.brightness / 100)));
        b = Math.min(255, Math.max(0, b * (settings.brightness / 100)));

        // Contrast
        const contrastFactor = (259 * (settings.contrast + 255)) / (255 * (259 - settings.contrast));
        r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128));
        g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128));
        b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128));

        // Saturation
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = Math.min(255, Math.max(0, gray + (r - gray) * (settings.saturation / 100)));
        g = Math.min(255, Math.max(0, gray + (g - gray) * (settings.saturation / 100)));
        b = Math.min(255, Math.max(0, gray + (b - gray) * (settings.saturation / 100)));

        // Grayscale
        const grayScale = 0.299 * r + 0.587 * g + 0.114 * b;
        r = Math.min(255, Math.max(0, gray + (grayScale - gray) * (settings.grayscale / 100)));
        g = Math.min(255, Math.max(0, gray + (grayScale - gray) * (settings.grayscale / 100)));
        b = Math.min(255, Math.max(0, gray + (grayScale - gray) * (settings.grayscale / 100)));

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }

      ctx.putImageData(imageData, 0, 0);

      // Apply blur
      if (settings.blur > 0) {
        const blurredCanvas = document.createElement("canvas");
        const blurredCtx = blurredCanvas.getContext("2d");
        if (blurredCtx) {
          blurredCanvas.width = canvas.width;
          blurredCanvas.height = canvas.height;
          blurredCtx.filter = `blur(${settings.blur}px)`;
          blurredCtx.drawImage(canvas, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(blurredCanvas, 0, 0);
        }
      }
    };

    img.src = selectedFile.previewUrl;
  }, [settings, selectedFile]);

  return (
    <BaseTool
      title="Image Filter Editor"
      description="Apply advanced filters with precise control over brightness, contrast, saturation, blur, and grayscale. See real-time preview before downloading."
      icon="🎨"
      onProcess={handleFilter}
    >
      {({ files }) => {
        // Update selected file when files change
        if (files.length > 0 && (!selectedFile || !files.find(f => f.id === selectedFile.id))) {
          setSelectedFile(files[0]);
        } else if (files.length === 0 && selectedFile) {
          setSelectedFile(null);
        }

        return (
          <div className="space-y-4">
        {/* Real-time Preview */}
        {selectedFile && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>
              Real-time Preview
            </h3>
            <div className="border rounded-lg overflow-hidden" style={{ borderColor: "var(--color-border-tertiary)" }}>
              <canvas
                ref={previewCanvasRef}
                className="w-full"
                style={{
                  maxHeight: "400px",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>
        )}

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Brightness: {settings.brightness}%
          </label>
          <input
            type="range"
            min="50"
            max="150"
            value={settings.brightness}
            onChange={(e) => setSettings((prev) => ({ ...prev, brightness: parseInt(e.target.value) }))}
            className="w-full"
            style={{
              accentColor: "#FF5C35",
            }}
          />
          <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            <span>50%</span>
            <span>100%</span>
            <span>150%</span>
          </div>
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Contrast: {settings.contrast}%
          </label>
          <input
            type="range"
            min="50"
            max="150"
            value={settings.contrast}
            onChange={(e) => setSettings((prev) => ({ ...prev, contrast: parseInt(e.target.value) }))}
            className="w-full"
            style={{
              accentColor: "#FF5C35",
            }}
          />
          <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            <span>50%</span>
            <span>100%</span>
            <span>150%</span>
          </div>
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Saturation: {settings.saturation}%
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={settings.saturation}
            onChange={(e) => setSettings((prev) => ({ ...prev, saturation: parseInt(e.target.value) }))}
            className="w-full"
            style={{
              accentColor: "#FF5C35",
            }}
          />
          <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            <span>0%</span>
            <span>100%</span>
            <span>200%</span>
          </div>
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Blur: {settings.blur}px
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={settings.blur}
            onChange={(e) => setSettings((prev) => ({ ...prev, blur: parseFloat(e.target.value) }))}
            className="w-full"
            style={{
              accentColor: "#FF5C35",
            }}
          />
          <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            <span>0px</span>
            <span>5px</span>
            <span>10px</span>
          </div>
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Grayscale: {settings.grayscale}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.grayscale}
            onChange={(e) => setSettings((prev) => ({ ...prev, grayscale: parseInt(e.target.value) }))}
            className="w-full"
            style={{
              accentColor: "#FF5C35",
            }}
          />
          <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            <span>0%</span>
            <span>50%</span>
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
            {["vintage", "vivid", "black-and-white", "cinematic", "soft-focus"].map((preset) => (
              <button
                key={preset}
                onClick={() => applyPreset(preset)}
                className="px-3 py-1.5 rounded-[10px] text-xs font-medium border"
                style={{
                  background: "var(--color-background-secondary)",
                  borderColor: "var(--color-border-tertiary)",
                  color: "var(--color-text-primary)",
                }}
              >
                {preset.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
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
            <strong>Tip:</strong> Combine filters for creative effects. Start with a preset and adjust to taste. See real-time changes in the preview above.
          </p>
        </div>
          </div>
        );
      }}
    </BaseTool>
  );
}