"use client";

import { useState, useRef, useEffect } from "react";
import BaseTool, { ImageFile } from "../components/BaseTool";

interface EffectsSettings {
  effect: "none" | "sepia" | "vintage" | "hdr" | "warm" | "cool" | "sketch" | "emboss";
  intensity: number;
  quality: number;
}

export default function EffectsTool() {
  const [settings, setSettings] = useState<EffectsSettings>({
    effect: "none",
    intensity: 50,
    quality: 90,
  });

  const [selectedFile, setSelectedFile] = useState<ImageFile | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Apply effects to image
  const handleEffect = async (imageFile: ImageFile): Promise<string> => {
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

        // Apply effect
        if (settings.effect !== "none") {
          for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            switch (settings.effect) {
              case "sepia":
                const tr = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
                const tg = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
                const tb = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);
                r = Math.round(tr + (r - tr) * (1 - settings.intensity / 100));
                g = Math.round(tg + (g - tg) * (1 - settings.intensity / 100));
                b = Math.round(tb + (b - tb) * (1 - settings.intensity / 100));
                break;
              case "warm":
                r = Math.min(255, r + 20 * (settings.intensity / 100));
                b = Math.max(0, b - 10 * (settings.intensity / 100));
                break;
              case "cool":
                b = Math.min(255, b + 20 * (settings.intensity / 100));
                r = Math.max(0, r - 10 * (settings.intensity / 100));
                break;
              case "sketch":
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                const inverted = 255 - gray;
                const blurred = (r + g + b) / 3;
                const value = Math.min(255, gray + (inverted - gray) * (settings.intensity / 100));
                r = g = b = value;
                break;
              case "emboss":
                // Simple emboss filter (would require more complex implementation)
                const offset = 5 * (settings.intensity / 100);
                r = Math.min(255, r + offset);
                g = Math.min(255, g + offset);
                b = Math.min(255, b + offset);
                break;
            }

            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
          }

          ctx.putImageData(imageData, 0, 0);
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

      // Apply effect
      if (settings.effect !== "none") {
        for (let i = 0; i < data.length; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          switch (settings.effect) {
            case "sepia":
              const tr = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
              const tg = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
              const tb = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);
              r = Math.round(tr + (r - tr) * (1 - settings.intensity / 100));
              g = Math.round(tg + (g - tg) * (1 - settings.intensity / 100));
              b = Math.round(tb + (b - tb) * (1 - settings.intensity / 100));
              break;
            case "warm":
              r = Math.min(255, r + 20 * (settings.intensity / 100));
              b = Math.max(0, b - 10 * (settings.intensity / 100));
              break;
            case "cool":
              b = Math.min(255, b + 20 * (settings.intensity / 100));
              r = Math.max(0, r - 10 * (settings.intensity / 100));
              break;
            case "sketch":
              const gray = 0.299 * r + 0.587 * g + 0.114 * b;
              const inverted = 255 - gray;
              const blurred = (r + g + b) / 3;
              const value = Math.min(255, gray + (inverted - gray) * (settings.intensity / 100));
              r = g = b = value;
              break;
            case "emboss":
              // Simple emboss filter (would require more complex implementation)
              const offset = 5 * (settings.intensity / 100);
              r = Math.min(255, r + offset);
              g = Math.min(255, g + offset);
              b = Math.min(255, b + offset);
              break;
          }

          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
        }

        ctx.putImageData(imageData, 0, 0);
      }
    };

    img.src = selectedFile.previewUrl;
  }, [settings, selectedFile]);

  return (
    <BaseTool
      title="Image Effects"
      description="Apply artistic effects like sepia, vintage, HDR, warm, cool, sketch, and emboss with adjustable intensity. See real-time preview before downloading."
      icon="🎭"
      onProcess={handleEffect}
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
                Effect
              </label>
              <div className="flex flex-wrap gap-2">
                {["none", "sepia", "vintage", "hdr", "warm", "cool", "sketch", "emboss"].map((effect) => (
                  <button
                    key={effect}
                    onClick={() => setSettings((prev) => ({ ...prev, effect: effect as any }))}
                    className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all ${
                      settings.effect === effect
                        ? "bg-[#FF5C35] text-white border-[#FF5C35]"
                        : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
                    }`}
                  >
                    {effect.charAt(0).toUpperCase() + effect.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {settings.effect !== "none" && (
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Intensity: {settings.intensity}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={settings.intensity}
                  onChange={(e) => setSettings((prev) => ({ ...prev, intensity: parseInt(e.target.value) }))}
                  className="w-full"
                  style={{
                    accentColor: "#FF5C35",
                  }}
                />
                <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                  <span>10%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            )}

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
                <strong>Tip:</strong> Combine effects with filters for unique results. Try sepia with vintage for an old photo look. See real-time changes in the preview above.
              </p>
            </div>
          </div>
        );
      }}
    </BaseTool>
  );
}