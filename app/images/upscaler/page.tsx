"use client";

import { useState, useEffect, useRef } from "react";
import BaseTool, { ImageFile } from "../components/BaseTool";
import Upscaler from "upscaler";
import ESRGAN_SLIM from "@upscalerjs/esrgan-slim/2x";
import ESRGAN_THICK from "@upscalerjs/esrgan-thick/2x";

interface UpscalerSettings {
  model: "esrgan-slim" | "esrgan-thick";
  scale: number;
  quality: number;
}

export default function ImageUpscaler() {
  const [settings, setSettings] = useState<UpscalerSettings>({
    model: "esrgan-slim",
    scale: 2,
    quality: 90,
  });

  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const upscalerRef = useRef<any | null>(null);

  // Initialize upscaler when component mounts or model changes
  useEffect(() => {
    const loadModel = async () => {
      setIsModelLoading(true);
      setError(null);
      try {
        // Create new Upscaler instance with selected model
        const upscaler = new Upscaler({
          model: settings.model === "esrgan-slim" ? ESRGAN_SLIM : ESRGAN_THICK,
        });
        upscalerRef.current = upscaler;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load model");
      } finally {
        setIsModelLoading(false);
      }
    };

    loadModel();
  }, [settings.model]);

  // Upscale image using UpscalerJS
  const handleUpscale = async (imageFile: ImageFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!upscalerRef.current) {
        reject(new Error("Model not initialized"));
        return;
      }

      setIsProcessing(true);
      setError(null);

      try {
        // Create image element from file
        const img = new Image();
        img.onload = async () => {
          try {
            // Check if image dimensions exceed maximum supported texture size
            const maxTextureSize = 8192; // WebGL 2.0 maximum is typically 8192x8192
            
            if (img.width > maxTextureSize || img.height > maxTextureSize) {
              // Resize image to fit within maximum dimensions
              const scaleRatio = Math.min(maxTextureSize / img.width, maxTextureSize / img.height);
              const newWidth = Math.floor(img.width * scaleRatio);
              const newHeight = Math.floor(img.height * scaleRatio);
              
              const canvas = document.createElement("canvas");
              canvas.width = newWidth;
              canvas.height = newHeight;
              
              const ctx = canvas.getContext("2d");
              if (!ctx) {
                throw new Error("Canvas context not available");
              }
              
              ctx.drawImage(img, 0, 0, newWidth, newHeight);
              
              // Upscale using the canvas directly instead of creating a new Image
              const result = await upscalerRef.current!.upscale(canvas, {
                output: "base64",
              });
              
              // Create a canvas to apply quality settings and finalize
              const finalCanvas = document.createElement("canvas");
              const finalCtx = finalCanvas.getContext("2d");
              if (!finalCtx) {
                throw new Error("Canvas context not available");
              }

              const resultImg = new Image();
              resultImg.onload = () => {
                finalCanvas.width = resultImg.width;
                finalCanvas.height = resultImg.height;
                finalCtx.drawImage(resultImg, 0, 0);
                
                // Convert to data URL with quality settings
                const dataURL = finalCanvas.toDataURL("image/jpeg", settings.quality / 100);
                resolve(dataURL);
                setIsProcessing(false);
              };
              
              resultImg.onerror = () => {
                reject(new Error("Failed to load upscaled image"));
                setIsProcessing(false);
              };
              
              resultImg.src = result;
            } else {
              // Image dimensions are within limits, upscale directly
              const result = await upscalerRef.current!.upscale(img, {
                output: "base64",
              });
              
              // Create a canvas to apply quality settings and finalize
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              if (!ctx) {
                throw new Error("Canvas context not available");
              }

              const resultImg = new Image();
              resultImg.onload = () => {
                canvas.width = resultImg.width;
                canvas.height = resultImg.height;
                ctx.drawImage(resultImg, 0, 0);
                
                // Convert to data URL with quality settings
                const dataURL = canvas.toDataURL("image/jpeg", settings.quality / 100);
                resolve(dataURL);
                setIsProcessing(false);
              };
              
              resultImg.onerror = () => {
                reject(new Error("Failed to load upscaled image"));
                setIsProcessing(false);
              };
              
              resultImg.src = result;
            }
          } catch (err) {
            reject(err instanceof Error ? err : new Error("Processing failed"));
            setIsProcessing(false);
          }
        };

        img.onerror = () => {
          reject(new Error("Failed to load image"));
          setIsProcessing(false);
        };

        img.src = imageFile.previewUrl;
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Processing failed"));
        setIsProcessing(false);
      }
    });
  };

  // Handle model change
  const handleModelChange = async (model: "esrgan-slim" | "esrgan-thick") => {
    if (model !== settings.model) {
      setSettings((prev) => ({ ...prev, model }));
    }
  };

  // Handle scale change
  const handleScaleChange = (scale: number) => {
    setSettings((prev) => ({ ...prev, scale }));
  };

  return (
    <BaseTool
      title="Image Upscaler"
      description="Upscale images using AI with UpscalerJS. Choose from different models and scale factors for optimal results."
      icon="🔍"
      onProcess={handleUpscale}
    >
      {() => (
        <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-medium text-red-600">Error</span>
            </div>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        )}

        <div className="p-4 rounded-lg" style={{ background: "var(--color-background-secondary)" }}>
          <div className="flex items-start gap-3">
            <div className="text-2xl">🚀</div>
            <div>
              <h3 className="text-xs font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
                AI Image Upscaling
              </h3>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                Using UpscalerJS with ESRGAN models to enhance image resolution. First use may take longer as models are downloaded.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Model Selection
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleModelChange("esrgan-slim")}
              disabled={isModelLoading}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all ${
                settings.model === "esrgan-slim"
                  ? "bg-[#FF5C35] text-white border-[#FF5C35]"
                  : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
              }`}
            >
              ESRGAN Slim
            </button>
            <button
              onClick={() => handleModelChange("esrgan-thick")}
              disabled={isModelLoading}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all ${
                settings.model === "esrgan-thick"
                  ? "bg-[#FF5C35] text-white border-[#FF5C35]"
                  : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
              }`}
            >
              ESRGAN Thick
            </button>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {settings.model === "esrgan-slim" 
              ? "Faster processing with good quality" 
              : "Higher quality but slower processing"}
          </p>
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Scale Factor: {settings.scale}x
          </label>
          <div className="flex flex-wrap gap-2">
            {[2, 3, 4].map((scale) => (
              <button
                key={scale}
                onClick={() => handleScaleChange(scale)}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all ${
                  settings.scale === scale
                    ? "bg-[#FF5C35] text-white border-[#FF5C35]"
                    : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
                }`}
              >
                {scale}x
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Output Quality: {settings.quality}%
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
            Recommended Uses
          </label>
          <ul className="text-xs space-y-1" style={{ color: "var(--color-text-secondary)" }}>
            <li>• Print preparation and publishing</li>
            <li>• Social media content creation</li>
            <li>• Digital signage and displays</li>
            <li>• Product photography enhancement</li>
            <li>• Restore old or low-resolution images</li>
          </ul>
        </div>

        <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            <strong>Note:</strong> First-time use may take longer as AI models are downloaded to your browser. All processing happens locally.
          </p>
        </div>
        </div>
      )}
    </BaseTool>
  );
}