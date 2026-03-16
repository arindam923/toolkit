"use client";

import { useState, useRef, useEffect } from "react";
import BaseTool, { ImageFile } from "../components/BaseTool";

interface WatermarkSettings {
  text: string;
  fontSize: number;
  opacity: number;
  color: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  quality: number;
}

export default function WatermarkTool() {
  const [settings, setSettings] = useState<WatermarkSettings>({
    text: "© Your Watermark",
    fontSize: 24,
    opacity: 0.5,
    color: "#000000",
    position: "bottom-right",
    quality: 90,
  });

  const [selectedFile, setSelectedFile] = useState<ImageFile | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Add watermark to image
  const handleWatermark = async (imageFile: ImageFile): Promise<string> => {
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

        // Set watermark style
        ctx.font = `${settings.fontSize}px Arial`;
        ctx.fillStyle = settings.color;
        ctx.globalAlpha = settings.opacity;

        // Calculate position
        const textWidth = ctx.measureText(settings.text).width;
        const textHeight = settings.fontSize;
        let x = 0, y = 0;

        switch (settings.position) {
          case "top-left":
            x = 20;
            y = settings.fontSize + 20;
            break;
          case "top-right":
            x = img.width - textWidth - 20;
            y = settings.fontSize + 20;
            break;
          case "bottom-left":
            x = 20;
            y = img.height - 20;
            break;
          case "bottom-right":
            x = img.width - textWidth - 20;
            y = img.height - 20;
            break;
          case "center":
            x = (img.width - textWidth) / 2;
            y = (img.height + settings.fontSize / 2) / 2;
            break;
        }

        // Add watermark
        ctx.fillText(settings.text, x, y);

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

      // Set watermark style
      ctx.font = `${settings.fontSize}px Arial`;
      ctx.fillStyle = settings.color;
      ctx.globalAlpha = settings.opacity;

      // Calculate position
      const textWidth = ctx.measureText(settings.text).width;
      const textHeight = settings.fontSize;
      let x = 0, y = 0;

      switch (settings.position) {
        case "top-left":
          x = 20;
          y = settings.fontSize + 20;
          break;
        case "top-right":
          x = img.width - textWidth - 20;
          y = settings.fontSize + 20;
          break;
        case "bottom-left":
          x = 20;
          y = img.height - 20;
          break;
        case "bottom-right":
          x = img.width - textWidth - 20;
          y = img.height - 20;
          break;
        case "center":
          x = (img.width - textWidth) / 2;
          y = (img.height + settings.fontSize / 2) / 2;
          break;
      }

      // Add watermark
      ctx.fillText(settings.text, x, y);
    };

    img.src = selectedFile.previewUrl;
  }, [settings, selectedFile]);

  return (
    <BaseTool
      title="Watermark Tool"
      description="Add text watermarks with customizable text, font size, opacity, color, and position. See real-time preview before downloading."
      icon="💧"
      onProcess={handleWatermark}
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
                Watermark Text
              </label>
              <input
                type="text"
                value={settings.text}
                onChange={(e) => setSettings((prev) => ({ ...prev, text: e.target.value }))}
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
                Font Size: {settings.fontSize}px
              </label>
              <input
                type="range"
                min="8"
                max="100"
                value={settings.fontSize}
                onChange={(e) => setSettings((prev) => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                className="w-full"
                style={{
                  accentColor: "#FF5C35",
                }}
              />
              <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                <span>8px</span>
                <span>50px</span>
                <span>100px</span>
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-text-primary)" }}
              >
                Opacity: {Math.round(settings.opacity * 100)}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={Math.round(settings.opacity * 100)}
                onChange={(e) => setSettings((prev) => ({ ...prev, opacity: parseInt(e.target.value) / 100 }))}
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

            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-text-primary)" }}
              >
                Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.color}
                  onChange={(e) => setSettings((prev) => ({ ...prev, color: e.target.value }))}
                  className="w-10 h-8 rounded cursor-pointer"
                />
                <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  {settings.color}
                </span>
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-text-primary)" }}
              >
                Position
              </label>
              <div className="flex flex-wrap gap-2">
                {["top-left", "top-right", "bottom-left", "bottom-right", "center"].map((position) => (
                  <button
                    key={position}
                    onClick={() => setSettings((prev) => ({ ...prev, position: position as any }))}
                    className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all ${
                      settings.position === position
                        ? "bg-[#FF5C35] text-white border-[#FF5C35]"
                        : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
                    }`}
                  >
                    {position.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
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
                <strong>Tip:</strong> Use semi-transparent watermarks (30-50% opacity) to protect images without obscuring content. See real-time changes in the preview above.
              </p>
            </div>
          </div>
        );
      }}
    </BaseTool>
  );
}