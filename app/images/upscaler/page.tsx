"use client";

import { useState, useCallback } from "react";
import BaseTool from "../components/BaseTool";
import type { ImageFile } from "../components/BaseTool";
import {
  upscaleWithGemini,
  restoreWithGemini,
  styleEditWithGemini,
} from "@/app/lib/gemini-image-service";
import { OLD_PHOTO_PRESET } from "@/app/lib/restoration-service";
import type { RestorationSettings } from "@/app/lib/restoration-service";

export default function ImageUpscaler() {
  const [settings, setSettings] = useState({
    scale: 2 as 2 | 4,
    quality: 90,
  });

  const [oldPhotoMode, setOldPhotoMode] = useState(false);
  const [restoration, setRestoration] =
    useState<RestorationSettings>({ ...OLD_PHOTO_PRESET });

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [lastUsedMethod, setLastUsedMethod] =
    useState<string>("");
  const [styleMode, setStyleMode] = useState(false);
  const [stylePrompt, setStylePrompt] = useState("");

  const upscaleImage = useCallback(
    async (imageFile: ImageFile): Promise<string> => {
      setIsProcessing(true);
      setProgress(0);
      setStatus("Starting Gemini edit...");

      try {
        setStatus("Upscaling with Gemini...");
        setProgress(15);

        const upscaled = await upscaleWithGemini(
          imageFile.file,
          {
            scale: settings.scale,
            quality: settings.quality,
          },
        );

        setProgress(45);
        setLastUsedMethod(upscaled.method);

        let finalUrl = upscaled.dataUrl;

        if (oldPhotoMode) {
          setStatus("Applying Gemini restoration...");
          setProgress(60);

          const restored = await restoreWithGemini(
            imageFile.file,
            {
              denoiseStrength: restoration.denoise
                ? restoration.denoiseStrength * 5
                : 10,
              faceEnhance: restoration.faceEnhance,
              colorRecovery: restoration.vibrance,
              scratchRemoval: restoration.contrast,
              preserveComposition: true,
            },
          );

          finalUrl = restored.dataUrl;
          setLastUsedMethod(restored.method);
          setProgress(80);
        }

        if (styleMode && stylePrompt.trim()) {
          setStatus("Applying Gemini style edit...");
          setProgress(85);

          const styled = await styleEditWithGemini(
            imageFile.file,
            stylePrompt.trim(),
            {
              preserveComposition: true,
              quality: settings.quality,
            },
          );

          finalUrl = styled.dataUrl;
          setLastUsedMethod(styled.method);
        }

        setProgress(100);
        setStatus("Complete!");

        return finalUrl;
      } catch (error) {
        console.error("Gemini image edit error:", error);
        setStatus("Failed to process image");
        throw error;
      } finally {
        setTimeout(() => setIsProcessing(false), 500);
      }
    },
    [
      settings,
      oldPhotoMode,
      restoration,
      styleMode,
      stylePrompt,
    ],
  );

  const scales = [
    {
      id: 2,
      name: "2x Upscale",
      desc: "Double size, fast processing",
    },
    {
      id: 4,
      name: "4x Upscale",
      desc: "Quadruple size, max detail (slower)",
    },
  ];

  // Get method display name
  const getMethodDisplayName = (method: string) => {
    switch (method) {
      case "gemini":
        return "Gemini Nano Banana (Image Editing)";
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
            <div
              className="p-3 rounded-lg"
              style={{
                background:
                  "var(--color-background-secondary)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  {status || "Processing..."}
                </span>
                <span
                  className="text-xs"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {progress}%
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{
                  background:
                    "var(--color-border-tertiary)",
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background:
                      "linear-gradient(135deg, #FF5C35, #ff7a54)",
                  }}
                />
              </div>
            </div>
          )}

          <div
            className="p-4 rounded-lg"
            style={{
              background:
                "var(--color-background-secondary)",
            }}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">🤖</div>
              <div>
                <h3
                  className="text-xs font-medium mb-1"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  Gemini AI Image Editing
                </h3>
                <p
                  className="text-xs"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Uses Gemini for upscaling, restoration,
                  and optional style editing in one unified
                  flow.
                </p>
                {lastUsedMethod && (
                  <p
                    className="text-xs mt-1.5"
                    style={{ color: "#16a34a" }}
                  >
                    ✓ Used:{" "}
                    {getMethodDisplayName(lastUsedMethod)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <span
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--color-text-primary)" }}
            >
              Upscale Factor
            </span>
            <div className="space-y-2">
              {scales.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      scale: s.id as 2 | 4,
                    }))
                  }
                  disabled={isProcessing}
                  className={`w-full p-2 rounded-[10px] text-xs font-medium border transition-all text-left ${
                    settings.scale === s.id
                      ? "bg-[#FF5C35] text-white border-[#FF5C35]"
                      : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
                  }`}
                >
                  <div className="font-semibold">
                    {s.name}
                  </div>
                  <div
                    className={`text-[10px] ${settings.scale === s.id ? "text-white/70" : ""}`}
                  >
                    {s.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="quality-slider"
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--color-text-primary)" }}
            >
              Output Quality: {settings.quality}%
            </label>
            <input
              id="quality-slider"
              type="range"
              min="10"
              max="100"
              value={settings.quality}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  quality: parseInt(e.target.value),
                }))
              }
              className="w-full"
              style={{ accentColor: "#FF5C35" }}
            />
          </div>

          {/* Old Photo Fix Preset */}
          <div
            className="border-t pt-4"
            style={{
              borderColor: "var(--color-border-tertiary)",
            }}
          >
            <button
              type="button"
              onClick={() => setOldPhotoMode((v) => !v)}
              disabled={isProcessing}
              className={`w-full p-3 rounded-[10px] text-xs font-medium border transition-all text-left ${
                oldPhotoMode
                  ? "bg-[#7C5CFF] text-white border-[#7C5CFF]"
                  : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🖼️</span>
                <div>
                  <div className="font-semibold">
                    Old Photo Fix
                  </div>
                  <div
                    className={`text-[10px] ${oldPhotoMode ? "text-white/70" : ""}`}
                  >
                    Denoise, sharpen, restore colors in
                    old/scanned photos
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Restoration Settings (when Old Photo Fix is active) */}
          {oldPhotoMode && (
            <div
              className="space-y-3 p-3 rounded-[10px]"
              style={{
                background:
                  "var(--color-background-secondary)",
              }}
            >
              <p
                className="text-[10px] font-semibold uppercase tracking-[1.5px]"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                Restoration Pipeline
              </p>

              {/* Denoise */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoration.denoise}
                  onChange={(e) =>
                    setRestoration((p) => ({
                      ...p,
                      denoise: e.target.checked,
                    }))
                  }
                  className="mt-0.5 accent-[#7C5CFF]"
                />
                <div className="flex-1">
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: "var(--color-text-primary)",
                    }}
                  >
                    Noise Reduction
                  </span>
                  <p
                    className="text-[10px]"
                    style={{
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Remove grain, JPEG artifacts, film noise
                  </p>
                </div>
              </label>
              {restoration.denoise && (
                <div className="ml-6">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-[10px]"
                      style={{
                        color:
                          "var(--color-text-secondary)",
                      }}
                    >
                      Strength
                    </span>
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: "#7C5CFF" }}
                    >
                      {restoration.denoiseStrength}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={restoration.denoiseStrength}
                    onChange={(e) =>
                      setRestoration((p) => ({
                        ...p,
                        denoiseStrength: parseInt(
                          e.target.value,
                        ),
                      }))
                    }
                    className="w-full"
                    style={{ accentColor: "#7C5CFF" }}
                  />
                </div>
              )}

              {/* Sharpen */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoration.sharpen}
                  onChange={(e) =>
                    setRestoration((p) => ({
                      ...p,
                      sharpen: e.target.checked,
                    }))
                  }
                  className="mt-0.5 accent-[#7C5CFF]"
                />
                <div className="flex-1">
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: "var(--color-text-primary)",
                    }}
                  >
                    Smart Sharpening
                  </span>
                  <p
                    className="text-[10px]"
                    style={{
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Enhance edges and fine details
                  </p>
                </div>
              </label>
              {restoration.sharpen && (
                <div className="ml-6">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-[10px]"
                      style={{
                        color:
                          "var(--color-text-secondary)",
                      }}
                    >
                      Sharpness
                    </span>
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: "#7C5CFF" }}
                    >
                      {restoration.sharpenStrength.toFixed(
                        1,
                      )}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={restoration.sharpenStrength}
                    onChange={(e) =>
                      setRestoration((p) => ({
                        ...p,
                        sharpenStrength: parseFloat(
                          e.target.value,
                        ),
                      }))
                    }
                    className="w-full"
                    style={{ accentColor: "#7C5CFF" }}
                  />
                </div>
              )}

              {/* Contrast */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoration.contrast}
                  onChange={(e) =>
                    setRestoration((p) => ({
                      ...p,
                      contrast: e.target.checked,
                    }))
                  }
                  className="mt-0.5 accent-[#7C5CFF]"
                />
                <div className="flex-1">
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: "var(--color-text-primary)",
                    }}
                  >
                    Contrast &amp; Clarity
                  </span>
                  <p
                    className="text-[10px]"
                    style={{
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    CLAHE adaptive contrast enhancement
                  </p>
                </div>
              </label>
              {restoration.contrast && (
                <div className="ml-6">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-[10px]"
                      style={{
                        color:
                          "var(--color-text-secondary)",
                      }}
                    >
                      Clarity
                    </span>
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: "#7C5CFF" }}
                    >
                      {restoration.clarity}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={restoration.clarity}
                    onChange={(e) =>
                      setRestoration((p) => ({
                        ...p,
                        clarity: parseInt(e.target.value),
                      }))
                    }
                    className="w-full"
                    style={{ accentColor: "#7C5CFF" }}
                  />
                </div>
              )}

              {/* Vibrance */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoration.vibrance}
                  onChange={(e) =>
                    setRestoration((p) => ({
                      ...p,
                      vibrance: e.target.checked,
                    }))
                  }
                  className="mt-0.5 accent-[#7C5CFF]"
                />
                <div className="flex-1">
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: "var(--color-text-primary)",
                    }}
                  >
                    Vibrance Boost
                  </span>
                  <p
                    className="text-[10px]"
                    style={{
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Restore faded colors in old photos
                  </p>
                </div>
              </label>

              {/* Face Enhancement */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoration.faceEnhance}
                  onChange={(e) =>
                    setRestoration((p) => ({
                      ...p,
                      faceEnhance: e.target.checked,
                    }))
                  }
                  className="mt-0.5 accent-[#7C5CFF]"
                />
                <div className="flex-1">
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: "var(--color-text-primary)",
                    }}
                  >
                    Face Enhancement
                  </span>
                  <p
                    className="text-[10px]"
                    style={{
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Sharpen facial details &amp; skin tones
                  </p>
                </div>
              </label>
            </div>
          )}

          <div
            className="border-t pt-4"
            style={{
              borderColor: "var(--color-border-tertiary)",
            }}
          >
            <button
              type="button"
              onClick={() => setStyleMode((v) => !v)}
              disabled={isProcessing}
              className={`w-full p-3 rounded-[10px] text-xs font-medium border transition-all text-left ${
                styleMode
                  ? "bg-[#00A87A] text-white border-[#00A87A]"
                  : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🎨</span>
                <div>
                  <div className="font-semibold">
                    Style Edit (Gemini)
                  </div>
                  <div
                    className={`text-[10px] ${styleMode ? "text-white/70" : ""}`}
                  >
                    Apply custom visual style edits using
                    prompt instructions
                  </div>
                </div>
              </div>
            </button>
          </div>

          {styleMode && (
            <div
              className="space-y-2 p-3 rounded-[10px]"
              style={{
                background:
                  "var(--color-background-secondary)",
              }}
            >
              <label
                htmlFor="style-prompt"
                className="block text-xs font-medium"
                style={{
                  color: "var(--color-text-primary)",
                }}
              >
                Style Prompt
              </label>
              <textarea
                id="style-prompt"
                value={stylePrompt}
                onChange={(e) =>
                  setStylePrompt(e.target.value)
                }
                placeholder="e.g. cinematic teal-orange grade, film grain, soft contrast, keep subject identity"
                rows={4}
                className="w-full rounded-[10px] p-2 text-xs border"
                style={{
                  background:
                    "var(--color-background-primary)",
                  borderColor:
                    "var(--color-border-tertiary)",
                  color: "var(--color-text-primary)",
                }}
              />
            </div>
          )}

          <div
            className="p-3 rounded-[10px]"
            style={{
              background:
                "var(--color-background-secondary)",
            }}
          >
            <p
              className="text-xs"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              <strong>How it works:</strong> Uses Gemini
              image editing for upscaling first, then
              optional restoration, then optional style
              edit. Best results with clear prompts and
              high-resolution inputs.
            </p>
          </div>

          <div
            className="p-3 rounded-[10px]"
            style={{
              background:
                "var(--color-background-secondary)",
            }}
          >
            <p
              className="text-xs"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              <strong>Setup:</strong> Add{" "}
              <code>GEMINI_API_KEY</code> on the server so
              the proxy API route can call Gemini securely.
            </p>
          </div>
        </div>
      )}
    </BaseTool>
  );
}
