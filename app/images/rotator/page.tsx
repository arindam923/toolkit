"use client";

import { useState, useRef, useEffect } from "react";
import BaseTool, { ImageFile } from "../components/BaseTool";

interface RotateSettings {
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  quality: number;
}

export default function ImageRotator() {
  const [settings, setSettings] = useState<RotateSettings>({
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false,
    quality: 90,
  });

  const [selectedFile, setSelectedFile] = useState<ImageFile | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Rotate and flip image
  const handleRotate = async (imageFile: ImageFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        // Calculate rotated dimensions
        const radians = (settings.rotation * Math.PI) / 180;
        const sin = Math.abs(Math.sin(radians));
        const cos = Math.abs(Math.cos(radians));
        const rotatedWidth = img.width * cos + img.height * sin;
        const rotatedHeight = img.width * sin + img.height * cos;

        canvas.width = rotatedWidth;
        canvas.height = rotatedHeight;

        // Center and rotate
        ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
        ctx.rotate(radians);

        // Apply flips
        const scaleX = settings.flipHorizontal ? -1 : 1;
        const scaleY = settings.flipVertical ? -1 : 1;
        ctx.scale(scaleX, scaleY);

        // Draw image
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        const dataURL = canvas.toDataURL("image/jpeg", settings.quality / 100);
        resolve(dataURL);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = imageFile.previewUrl;
    });
  };

  // Handle rotation change
  const handleRotationChange = (value: number) => {
    let rotation = value % 360;
    if (rotation < 0) {
      rotation += 360;
    }
    setSettings((prev) => ({ ...prev, rotation }));
  };

  // Update preview whenever settings change
  useEffect(() => {
    if (!selectedFile || !previewCanvasRef.current) return;

    const img = new Image();
    img.onload = () => {
      const canvas = previewCanvasRef.current!;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Calculate rotated dimensions
      const radians = (settings.rotation * Math.PI) / 180;
      const sin = Math.abs(Math.sin(radians));
      const cos = Math.abs(Math.cos(radians));
      const rotatedWidth = img.width * cos + img.height * sin;
      const rotatedHeight = img.width * sin + img.height * cos;

      canvas.width = rotatedWidth;
      canvas.height = rotatedHeight;

      // Center and rotate
      ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
      ctx.rotate(radians);

      // Apply flips
      const scaleX = settings.flipHorizontal ? -1 : 1;
      const scaleY = settings.flipVertical ? -1 : 1;
      ctx.scale(scaleX, scaleY);

      // Draw image
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
    };

    img.src = selectedFile.previewUrl;
  }, [settings, selectedFile]);

  return (
    <BaseTool
      title="Image Rotator"
      description="Rotate and flip images by 90 degrees, 180 degrees, or custom angles. Supports horizontal and vertical flips. See real-time preview before downloading."
      icon="🔄"
      onProcess={handleRotate}
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
                Rotation: {settings.rotation}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={settings.rotation}
                onChange={(e) => handleRotationChange(parseInt(e.target.value))}
                className="w-full"
                style={{
                  accentColor: "#FF5C35",
                }}
              />
              <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                <span>0°</span>
                <span>180°</span>
                <span>360°</span>
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-text-primary)" }}
              >
                Quick Rotation
              </label>
              <div className="flex flex-wrap gap-2">
                {[90, 180, 270].map((angle) => (
                  <button
                    key={angle}
                    onClick={() => handleRotationChange(settings.rotation + angle)}
                    className="px-3 py-1.5 rounded-[10px] text-xs font-medium border"
                    style={{
                      background: "var(--color-background-secondary)",
                      borderColor: "var(--color-border-tertiary)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    Rotate {angle}°
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-text-primary)" }}
              >
                Flip
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSettings((prev) => ({ ...prev, flipHorizontal: !prev.flipHorizontal }))}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all ${
                    settings.flipHorizontal
                      ? "bg-[#FF5C35] text-white border-[#FF5C35]"
                      : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
                  }`}
                >
                  Flip Horizontal
                </button>
                <button
                  onClick={() => setSettings((prev) => ({ ...prev, flipVertical: !prev.flipVertical }))}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all ${
                    settings.flipVertical
                      ? "bg-[#FF5C35] text-white border-[#FF5C35]"
                      : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
                  }`}
                >
                  Flip Vertical
                </button>
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
                <strong>Tip:</strong> Rotating by multiples of 90 degrees preserves image quality. Use custom angles for creative effects. See real-time changes in the preview above.
              </p>
            </div>
          </div>
        );
      }}
    </BaseTool>
  );
}