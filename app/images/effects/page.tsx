"use client";

import { useState, useRef, useEffect } from "react";
import BaseTool, { ImageFile } from "../components/BaseTool";

type EffectType = "none" | "sepia" | "vintage" | "hdr" | "warm" | "cool" | "sketch" | "emboss";

interface EffectsSettings {
  effect: EffectType;
  intensity: number;
  quality: number;
}

const EFFECT_META: Record<EffectType, { label: string; emoji: string; desc: string }> = {
  none:    { label: "None",    emoji: "🚫", desc: "Original image" },
  sepia:   { label: "Sepia",   emoji: "🟤", desc: "Warm brown tones" },
  vintage: { label: "Vintage", emoji: "📷", desc: "Faded, classic look" },
  hdr:     { label: "HDR",     emoji: "✨", desc: "High dynamic range pop" },
  warm:    { label: "Warm",    emoji: "🌅", desc: "Golden hour glow" },
  cool:    { label: "Cool",    emoji: "🧊", desc: "Icy, blue tones" },
  sketch:  { label: "Sketch",  emoji: "✏️", desc: "Pencil drawing style" },
  emboss:  { label: "Emboss",  emoji: "🗿", desc: "3D relief effect" },
};

function applyEffect(data: Uint8ClampedArray, effect: EffectType, intensity: number) {
  const t = intensity / 100;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    switch (effect) {
      case "sepia": {
        const tr = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
        const tg = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
        const tb = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);
        r = Math.round(r + (tr - r) * t);
        g = Math.round(g + (tg - g) * t);
        b = Math.round(b + (tb - b) * t);
        break;
      }
      case "vintage": {
        // Desaturate, boost reds, reduce blues, add vignette-like fade
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = Math.min(255, gray + (r - gray) * (1 - 0.4 * t) + 20 * t);
        g = Math.min(255, gray + (g - gray) * (1 - 0.5 * t) - 5 * t);
        b = Math.min(255, gray + (b - gray) * (1 - 0.6 * t) - 15 * t);
        // Fade to muted
        r = Math.min(255, r * (1 - 0.1 * t) + 20 * t);
        g = Math.min(255, g * (1 - 0.1 * t) + 15 * t);
        b = Math.min(255, b * (1 - 0.15 * t) + 5 * t);
        break;
      }
      case "hdr": {
        // Boost contrast and saturation, enhance local detail
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        // Enhance saturation
        const sat = 1 + 0.8 * t;
        r = Math.min(255, Math.max(0, gray + (r - gray) * sat));
        g = Math.min(255, Math.max(0, gray + (g - gray) * sat));
        b = Math.min(255, Math.max(0, gray + (b - gray) * sat));
        // S-curve contrast
        const contrastFactor = 1 + 0.5 * t;
        r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128));
        g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128));
        b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128));
        break;
      }
      case "warm": {
        r = Math.min(255, r + 30 * t);
        g = Math.min(255, g + 10 * t);
        b = Math.max(0, b - 20 * t);
        break;
      }
      case "cool": {
        r = Math.max(0, r - 20 * t);
        g = Math.min(255, g + 5 * t);
        b = Math.min(255, b + 30 * t);
        break;
      }
      case "sketch": {
        const grayVal = 0.299 * r + 0.587 * g + 0.114 * b;
        const sketched = Math.min(255, grayVal * (1 + 0.5 * t));
        r = Math.round(r + (sketched - r) * t);
        g = Math.round(g + (sketched - g) * t);
        b = Math.round(b + (sketched - b) * t);
        break;
      }
      case "emboss": {
        // Shift towards gray with bold highlight
        const grayVal = 0.299 * r + 0.587 * g + 0.114 * b;
        const mid = 128;
        r = Math.min(255, Math.max(0, mid + (r - grayVal) * t * 2));
        g = Math.min(255, Math.max(0, mid + (g - grayVal) * t * 2));
        b = Math.min(255, Math.max(0, mid + (b - grayVal) * t * 2));
        break;
      }
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
}

export default function EffectsTool() {
  const [settings, setSettings] = useState<EffectsSettings>({
    effect: "none",
    intensity: 70,
    quality: 90,
  });

  const [selectedFile, setSelectedFile] = useState<ImageFile | null>(null);
  const [files, setFiles] = useState<ImageFile[]>([]);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Sync selectedFile whenever the files change (via BaseTool's onFilesChange)
  useEffect(() => {
    if (files.length > 0 && (!selectedFile || !files.find(f => f.id === selectedFile.id))) {
      setSelectedFile(files[0]);
    } else if (files.length === 0 && selectedFile) {
      setSelectedFile(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  // Apply effects to image
  const handleEffect = async (imageFile: ImageFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas context not available")); return; }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        if (settings.effect !== "none") {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          applyEffect(imageData.data, settings.effect, settings.intensity);
          ctx.putImageData(imageData, 0, 0);
        }

        resolve(canvas.toDataURL("image/jpeg", settings.quality / 100));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
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

      if (settings.effect !== "none") {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        applyEffect(imageData.data, settings.effect, settings.intensity);
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
      onFilesChange={setFiles}
    >
      {() => (
        <div className="space-y-5">
          {/* Real-time Preview */}
          {selectedFile && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
                  Live Preview
                </h3>
                {settings.effect !== "none" && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(255,92,53,0.1)", color: "#FF5C35" }}>
                    {EFFECT_META[settings.effect].emoji} {EFFECT_META[settings.effect].label}
                  </span>
                )}
              </div>
              <div className="rounded-xl overflow-hidden" style={{ border: "0.5px solid var(--color-border-tertiary)" }}>
                <canvas
                  ref={previewCanvasRef}
                  className="w-full"
                  style={{ maxHeight: "360px", objectFit: "contain", display: "block" }}
                />
              </div>
            </div>
          )}

          {/* Effect picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-text-secondary)" }}>
              Effect
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(EFFECT_META) as EffectType[]).map((effect) => {
                const meta = EFFECT_META[effect];
                const isActive = settings.effect === effect;
                return (
                  <button
                    key={effect}
                    onClick={() => setSettings((prev) => ({ ...prev, effect }))}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-[12px] text-xs font-medium border transition-all hover:scale-[1.03]"
                    style={{
                      background: isActive ? "rgba(255,92,53,0.1)" : "transparent",
                      borderColor: isActive ? "#FF5C35" : "var(--color-border-tertiary)",
                      color: isActive ? "#FF5C35" : "var(--color-text-secondary)",
                    }}
                  >
                    <span className="text-lg">{meta.emoji}</span>
                    <span className="leading-none">{meta.label}</span>
                  </button>
                );
              })}
            </div>
            {settings.effect !== "none" && (
              <p className="text-[10px] mt-2" style={{ color: "var(--color-text-secondary)" }}>
                {EFFECT_META[settings.effect].desc}
              </p>
            )}
          </div>

          {settings.effect !== "none" && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
                Intensity: <span style={{ color: "#FF5C35" }}>{settings.intensity}%</span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={settings.intensity}
                onChange={(e) => setSettings((prev) => ({ ...prev, intensity: parseInt(e.target.value) }))}
                className="w-full"
                style={{ accentColor: "#FF5C35" }}
              />
              <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                <span>Subtle</span>
                <span>Strong</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
              Output Quality: <span style={{ color: "#FF5C35" }}>{settings.quality}%</span>
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.quality}
              onChange={(e) => setSettings((prev) => ({ ...prev, quality: parseInt(e.target.value) }))}
              className="w-full"
              style={{ accentColor: "#FF5C35" }}
            />
            <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
              <span>Small file</span>
              <span>High quality</span>
            </div>
          </div>

          <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Tip:</strong> Hover over a processed image card to compare before &amp; after. Try Vintage + 70% for a timeless look.
            </p>
          </div>
        </div>
      )}
    </BaseTool>
  );
}