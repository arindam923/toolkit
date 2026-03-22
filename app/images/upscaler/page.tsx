"use client";

import { useState, useCallback } from "react";
import BaseTool, { ImageFile } from "../components/BaseTool";
import { hybridUpscale, UpscaleResult, getImageDimensions } from "@/app/lib/upscaler-service";

export default function ImageUpscaler() {
  const [settings, setSettings] = useState({
    scale: 2 as 2 | 4,
    quality: 90,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [lastUsedMethod, setLastUsedMethod] = useState<string>("");

  const upscaleImage = useCallback(async (imageFile: ImageFile): Promise<string> => {
    setIsProcessing(true);
    setProgress(0);
    setStatus("Starting upscale...");

    try {
      setStatus("Processing image...");
      setProgress(20);

      const result: UpscaleResult = await hybridUpscale(imageFile.file, {
        scale: settings.scale,
        quality: settings.quality,
      });

      setProgress(80);
      setLastUsedMethod(result.method);

      // Dimensions are already included in result
      setProgress(100);
      setStatus("Complete!");

      return result.dataUrl;
    } catch (error) {
      console.error("Upscale error:", error);
      setStatus("Failed to upscale image");
      throw error;
    } finally {
      setTimeout(() => setIsProcessing(false), 500);
    }
  }, [settings]);

  const scales = [
    { id: 2, name: "2x Upscale", desc: "Double size, fast processing" },
    { id: 4, name: "4x Upscale", desc: "Quadruple size, max detail (slower)" },
  ];

  // Get method display name
  const getMethodDisplayName = (method: string) => {
    switch (method) {
      case 'huggingface':
        return 'Hugging Face API (Fast, High Quality)';
      case 'upscalerjs':
        return 'Client-side AI (UpscalerJS)';
      case 'canvas':
        return 'Canvas Bicubic (Basic)';
      default:
        return method;
    }
  };

  return (
    <BaseTool
      title="Image Upscaler"
      description="Upscale images using AI with multiple free strategies. Works in any browser!"
      icon="🔍"
      onProcess={upscaleImage}
    >
      {() => (
        <div className="space-y-4">
          {isProcessing && (
            <div className="p-3 rounded-lg" style={{ background: "var(--color-background-secondary)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color: "var(--color-text-primary)" }}>
                  {status || "Processing..."}
                </span>
                <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  {progress}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--color-border-tertiary)" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(135deg, #FF5C35, #ff7a54)",
                  }}
                />
              </div>
            </div>
          )}

          <div className="p-4 rounded-lg" style={{ background: "var(--color-background-secondary)" }}>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🤖</div>
              <div>
                <h3 className="text-xs font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
                  Hybrid AI Upscaling
                </h3>
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  Automatically selects best method: Hugging Face API → Client AI → Canvas. All completely free!
                </p>
                {lastUsedMethod && (
                  <p className="text-xs mt-1.5" style={{ color: "#16a34a" }}>
                    ✓ Used: {getMethodDisplayName(lastUsedMethod)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
              Upscale Factor
            </span>
            <div className="space-y-2">
              {scales.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, scale: s.id as 2 | 4 }))}
                  disabled={isProcessing}
                  className={`w-full p-2 rounded-[10px] text-xs font-medium border transition-all text-left ${
                    settings.scale === s.id
                      ? "bg-[#FF5C35] text-white border-[#FF5C35]"
                      : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
                  }`}
                >
                  <div className="font-semibold">{s.name}</div>
                  <div className={`text-[10px] ${settings.scale === s.id ? "text-white/70" : ""}`}>{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="quality-slider" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
              Output Quality: {settings.quality}%
            </label>
            <input
              id="quality-slider"
              type="range"
              min="10"
              max="100"
              value={settings.quality}
              onChange={(e) => setSettings((prev) => ({ ...prev, quality: parseInt(e.target.value) }))}
              className="w-full"
              style={{ accentColor: "#FF5C35" }}
            />
          </div>

          <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>How it works:</strong> Tries Hugging Face API first (fast, high quality). If that fails, uses client-side AI (slower but unlimited). Never fails - falls back to basic canvas upscaling. Works in Safari, Firefox, Chrome, Edge. No WebGPU required.
            </p>
          </div>

          <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Free tier:</strong> Hugging Face offers ~30K credits/month for free (enough for hundreds of images). Client-side AI is unlimited. No credit card required for basic usage.
            </p>
          </div>
        </div>
      )}
    </BaseTool>
  );
}
