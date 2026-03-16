"use client";

import { useState, useEffect, useRef } from "react";
import BaseTool, { ImageFile } from "../components/BaseTool";

interface PaletteSettings {
  colorCount: number;
  format: "hex" | "rgb" | "hsl";
}

interface ColorInfo {
  rgb: number[];
  formatted: string;
  hex: string;
  count: number;
}

interface ImagePalette {
  id: string;
  fileName: string;
  colors: ColorInfo[];
}

export default function ColorExtractor() {
  const [settings, setSettings] = useState<PaletteSettings>({
    colorCount: 5,
    format: "hex",
  });

  const [imagePalettes, setImagePalettes] = useState<ImagePalette[]>([]);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Extract color palette using browser-compatible method
  const handleExtract = async (imageFile: ImageFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        try {
          const colors = extractColorsFromImage(img, settings.colorCount);
          const colorInfos: ColorInfo[] = colors.map((color) => ({
            rgb: color.rgb,
            formatted: formatColor(color.rgb),
            hex: rgbToHex(color.rgb[0], color.rgb[1], color.rgb[2]),
            count: color.count,
          }));

          setImagePalettes((prev) => [
            ...prev,
            {
              id: imageFile.id,
              fileName: imageFile.file.name,
              colors: colorInfos,
            },
          ]);

          resolve(imageFile.previewUrl);
        } catch (error) {
          reject(new Error("Failed to extract colors"));
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = imageFile.previewUrl;
    });
  };

  // Simple browser-compatible color extraction
  const extractColorsFromImage = (img: HTMLImageElement, colorCount: number): { rgb: number[]; count: number }[] => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return [];
    }

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Simple color quantization using median cut
    const colorMap: Record<string, number> = {};
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];

      if (a === 0) continue;

      const key = `${r},${g},${b}`;
      colorMap[key] = (colorMap[key] || 0) + 1;
    }

    // Convert to array and sort by count
    const sortedColors = Object.entries(colorMap)
      .map(([key, count]) => ({
        rgb: key.split(",").map(Number),
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // Return most frequent colors
    return sortedColors.slice(0, colorCount);
  };

  // Format color based on selected format
  const formatColor = (color: number[]): string => {
    const [r, g, b] = color;
    switch (settings.format) {
      case "hex":
        return rgbToHex(r, g, b);
      case "rgb":
        return `rgb(${r}, ${g}, ${b})`;
      case "hsl":
        return rgbToHsl(r, g, b);
      default:
        return rgbToHex(r, g, b);
    }
  };

  // Convert RGB to HEX
  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("");
  };

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number): string => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
          break;
        case g:
          h = ((b - r) / d + 2) * 60;
          break;
        case b:
          h = ((r - g) / d + 4) * 60;
          break;
      }
    }

    return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  // Copy color to clipboard
  const copyToClipboard = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopySuccess(color);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (error) {
      console.error("Failed to copy color:", error);
    }
  };

  // Update formatted colors when format changes
  useEffect(() => {
    setImagePalettes((prev) =>
      prev.map((palette) => ({
        ...palette,
        colors: palette.colors.map((color) => ({
          ...color,
          formatted: formatColor(color.rgb),
        })),
      })),
    );
  }, [settings.format]);

  // Handle file removal
  const handleFileRemove = (id: string) => {
    setImagePalettes((prev) => prev.filter((palette) => palette.id !== id));
  };

  // Update number of colors when colorCount changes
  const handleColorCountChange = (count: number) => {
    setSettings((prev) => ({ ...prev, colorCount: count }));
    // We need to re-extract colors if we already have images processed
    // For simplicity, we'll just clear existing palettes and require re-processing
    if (imagePalettes.length > 0) {
      setImagePalettes([]);
    }
  };

  // Determine text color for hex labels
  const getTextColor = (r: number, g: number, b: number): string => {
    return "var(--color-text-primary)";
  };

  return (
    <BaseTool
      title="Color Palette Extractor"
      description="Extract dominant colors from images and export as HEX, RGB, or HSL. Perfect for designers."
      icon="🌈"
      onProcess={handleExtract}
      onFileRemove={handleFileRemove}
    >
      {() => (
        <div className="space-y-4">
        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Number of Colors: {settings.colorCount}
          </label>
          <input
            type="range"
            min="2"
            max="10"
            value={settings.colorCount}
            onChange={(e) => handleColorCountChange(parseInt(e.target.value))}
            className="w-full"
            style={{
              accentColor: "#FF5C35",
            }}
          />
          <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            <span>2</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Color Format
          </label>
          <div className="flex flex-wrap gap-2">
            {["hex", "rgb", "hsl"].map((format) => (
              <button
                key={format}
                onClick={() => setSettings((prev) => ({ ...prev, format: format as any }))}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all ${
                  settings.format === format
                    ? "bg-[#FF5C35] text-white border-[#FF5C35]"
                    : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
                }`}
              >
                {format.toUpperCase()}
              </button>
            ))}
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
              { name: "Web Design", colors: 5, format: "hex" as const },
              { name: "Minimal", colors: 3, format: "rgb" as const },
              { name: "Vibrant", colors: 8, format: "hsl" as const },
            ].map((preset) => (
              <button
                key={preset.name}
                onClick={() => setSettings((prev) => ({ ...prev, colorCount: preset.colors, format: preset.format }))}
                className="px-3 py-1.5 rounded-[10px] text-xs font-medium border"
                style={{
                  background: "var(--color-background-secondary)",
                  borderColor: "var(--color-border-tertiary)",
                  color: "var(--color-text-primary)",
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Color Palettes Preview */}
        {imagePalettes.length > 0 && (
          <div className="space-y-4">
            <h3
              className="font-['Syne'] text-xs font-bold tracking-[2px] uppercase mb-0.5"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              Extracted Color Palettes
            </h3>

            {imagePalettes.map((palette) => (
              <div
                key={palette.id}
                className="p-4 rounded-[14px]"
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <div className="text-xs font-medium mb-3" style={{ color: "var(--color-text-primary)" }}>
                  {palette.fileName}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
                  {palette.colors.map((color, index) => {
                    const [r, g, b] = color.rgb;
                    const isDark = (r * 0.299 + g * 0.587 + b * 0.114) < 128;

                    return (
                      <div key={index} className="flex flex-col gap-1">
                        <button
                          onClick={() => copyToClipboard(color.formatted)}
                          className="group relative overflow-hidden rounded-lg transition-all hover:-translate-y-1 hover:shadow-md"
                          style={{
                            backgroundColor: `rgb(${r}, ${g}, ${b})`,
                            border: `1px solid var(--color-border-tertiary)`,
                            minHeight: "60px",
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                              {copySuccess === color.formatted ? "Copied!" : "Copy"}
                            </span>
                          </div>
                        </button>
                        <div className="text-center">
                          <div
                            className="text-xs font-medium"
                            style={{
                              color: getTextColor(r, g, b),
                              backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
                              padding: "2px 4px",
                              borderRadius: "4px",
                              wordBreak: "break-all",
                              border: `1px solid rgba(${r}, ${g}, ${b}, 0.3)`,
                            }}
                          >
                            {color.formatted}
                          </div>
                          <div className="text-[10px] text-center" style={{ color: "var(--color-text-secondary)" }}>
                            {Math.round((color.count / (palette.colors.reduce((sum, c) => sum + c.count, 0))) * 100)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            <strong>Tip:</strong> Use 5-6 colors for most design projects. Click on any color swatch to copy it to clipboard.
          </p>
        </div>
        </div>
      )}
    </BaseTool>
  );
}