"use client";

import { useState, useRef } from "react";
import BaseTool, { ImageFile } from "../components/BaseTool";

type AspectRatio = "free" | "1:1" | "4:3" | "16:9" | "9:16";

interface CropSettings {
  aspectRatio: AspectRatio;
  quality: number;
}

interface CropRegion {
  x: number; // percent
  y: number; // percent
  width: number; // percent
  height: number; // percent
}

const ASPECT_RATIOS: Record<Exclude<AspectRatio, "free">, number> = {
  "1:1": 1,
  "4:3": 4 / 3,
  "16:9": 16 / 9,
  "9:16": 9 / 16,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getInitialCrop(aspect: AspectRatio): CropRegion {
  if (aspect === "free" || aspect === "1:1") {
    return { x: 10, y: 10, width: 80, height: 80 };
  }
  const ratio = ASPECT_RATIOS[aspect];
  let width = 80;
  let height = width / ratio;
  if (height > 80) {
    height = 80;
    width = height * ratio;
  }
  return {
    x: (100 - width) / 2,
    y: (100 - height) / 2,
    width,
    height,
  };
}

export default function ImageCropper() {
  const [settings, setSettings] = useState<CropSettings>({
    aspectRatio: "free",
    quality: 90,
  });

  const [files, setFiles] = useState<ImageFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropRegion>(() => getInitialCrop("free"));
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"move" | "nw" | "ne" | "sw" | "se" | null>(null);
  const dragStart = useRef<{ x: number; y: number; crop: CropRegion } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const selectedFile = selectedFileId
    ? files.find((f) => f.id === selectedFileId) || files[0] || null
    : files[0] || null;

  const handleFilesChange = (newFiles: ImageFile[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0 && !newFiles.find((f) => f.id === selectedFileId)) {
      setSelectedFileId(newFiles[0].id);
    }
    if (newFiles.length === 0) {
      setSelectedFileId(null);
    }
  };

  const setAspectRatio = (ratio: AspectRatio) => {
    setSettings((prev) => ({ ...prev, aspectRatio: ratio }));
    setCrop(getInitialCrop(ratio));
  };

  const handleImageLoad = () => {
    const img = imageRef.current;
    if (!img) return;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  const getContainerPoint = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const enforceAspectRatio = (nextCrop: CropRegion, ratio: AspectRatio): CropRegion => {
    if (ratio === "free") return nextCrop;
    const aspect = ASPECT_RATIOS[ratio];
    const { x, y } = nextCrop;
    let { width, height } = nextCrop;
    width = height * aspect;
    if (x + width > 100) {
      width = 100 - x;
      height = width / aspect;
    }
    if (y + height > 100) {
      height = 100 - y;
      width = height * aspect;
    }
    return { x, y, width, height };
  };

  const handlePointerDown = (e: React.PointerEvent, mode: "move" | "nw" | "ne" | "sw" | "se") => {
    e.preventDefault();
    e.stopPropagation();
    if (!containerRef.current) return;
    containerRef.current.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setDragMode(mode);
    const point = getContainerPoint(e.clientX, e.clientY);
    dragStart.current = { x: point.x, y: point.y, crop: { ...crop } };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStart.current || !dragMode) return;
    const point = getContainerPoint(e.clientX, e.clientY);
    const dx = point.x - dragStart.current.x;
    const dy = point.y - dragStart.current.y;
    const start = dragStart.current.crop;

    let next: CropRegion;
    if (dragMode === "move") {
      next = {
        ...start,
        x: clamp(start.x + dx, 0, 100 - start.width),
        y: clamp(start.y + dy, 0, 100 - start.height),
      };
    } else {
      next = { ...start };
      if (dragMode.includes("e")) {
        next.width = clamp(start.width + dx, 5, 100 - start.x);
      }
      if (dragMode.includes("w")) {
        const newWidth = clamp(start.width - dx, 5, start.x + start.width - 5);
        next.x = start.x + start.width - newWidth;
        next.width = newWidth;
      }
      if (dragMode.includes("s")) {
        next.height = clamp(start.height + dy, 5, 100 - start.y);
      }
      if (dragMode.includes("n")) {
        const newHeight = clamp(start.height - dy, 5, start.y + start.height - 5);
        next.y = start.y + start.height - newHeight;
        next.height = newHeight;
      }
      next = enforceAspectRatio(next, settings.aspectRatio);
    }
    setCrop(next);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setDragMode(null);
    dragStart.current = null;
  };

  const handleCrop = async (imageFile: ImageFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        const sx = Math.round((crop.x / 100) * img.width);
        const sy = Math.round((crop.y / 100) * img.height);
        const sw = Math.round((crop.width / 100) * img.width);
        const sh = Math.round((crop.height / 100) * img.height);

        canvas.width = sw;
        canvas.height = sh;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

        const dataURL = canvas.toDataURL("image/jpeg", settings.quality / 100);
        resolve(dataURL);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = imageFile.previewUrl;
    });
  };

  return (
    <BaseTool
      title="Image Cropper"
      description="Crop images with freehand or preset aspect ratio. Drag the crop box to select area, use the handles to resize."
      icon="✂️"
      onProcess={handleCrop}
      onFilesChange={handleFilesChange}
    >
      {() => (
        <div className="space-y-4">
          {selectedFile && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>
                  Crop Preview
                </h3>
                <span className="text-[10px] text-muted-foreground">
                  {Math.round((crop.width / 100) * naturalSize.width)} ×{" "}
                  {Math.round((crop.height / 100) * naturalSize.height)}px
                </span>
              </div>
              <div
                ref={containerRef}
                className="relative w-full overflow-hidden rounded-lg border border-border bg-[#f5f5f5] select-none touch-none"
                style={{ aspectRatio: naturalSize.width ? `${naturalSize.width} / ${naturalSize.height}` : "4 / 3" }}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- preview uses object URLs */}
                <img
                  ref={imageRef}
                  src={selectedFile.previewUrl}
                  alt={selectedFile.file.name}
                  className="absolute inset-0 w-full h-full object-contain"
                  draggable={false}
                  onLoad={handleImageLoad}
                />
                <div
                  className="absolute inset-0 bg-black/40"
                  style={{
                    clipPath: `polygon(
                      0% 0%,
                      100% 0%,
                      100% 100%,
                      0% 100%,
                      0% ${crop.y}%,
                      ${crop.x}% ${crop.y}%,
                      ${crop.x}% ${crop.y + crop.height}%,
                      ${crop.x + crop.width}% ${crop.y + crop.height}%,
                      ${crop.x + crop.width}% ${crop.y}%,
                      0% ${crop.y}%
                    )`,
                  }}
                  onPointerDown={(e) => handlePointerDown(e, "move")}
                  role="button"
                  aria-label="Move crop area"
                  tabIndex={0}
                />
                <div
                  className="absolute border-2 border-white shadow-sm cursor-move"
                  style={{
                    left: `${crop.x}%`,
                    top: `${crop.y}%`,
                    width: `${crop.width}%`,
                    height: `${crop.height}%`,
                  }}
                  onPointerDown={(e) => handlePointerDown(e, "move")}
                  role="button"
                  aria-label="Move crop area"
                  tabIndex={0}
                >
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/50" />
                    <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/50" />
                    <div className="absolute top-1/3 left-0 right-0 h-px bg-white/50" />
                    <div className="absolute top-2/3 left-0 right-0 h-px bg-white/50" />
                  </div>
                  {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                    <div
                      key={corner}
                      className="absolute w-3 h-3 bg-white border border-brand-accent rounded-sm"
                      style={{
                        left: corner.includes("w") ? -6 : "auto",
                        right: corner.includes("e") ? -6 : "auto",
                        top: corner.includes("n") ? -6 : "auto",
                        bottom: corner.includes("s") ? -6 : "auto",
                        cursor: `${corner}-resize`,
                      }}
                      onPointerDown={(e) => handlePointerDown(e, corner)}
                      role="button"
                      aria-label={`Resize crop corner ${corner}`}
                      tabIndex={0}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <span className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
              Aspect Ratio
            </span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Aspect ratio">
              {(["free", "1:1", "4:3", "16:9", "9:16"] as AspectRatio[]).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  role="radio"
                  aria-checked={settings.aspectRatio === ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all ${
                    settings.aspectRatio === ratio
                      ? "bg-[#FF5C35] text-white border-[#FF5C35]"
                      : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
                  }`}
                >
                  {ratio.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="crop-quality" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
              Quality: {settings.quality}%
            </label>
            <input
              id="crop-quality"
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
              <strong>Tip:</strong> Drag the box to move it. Drag the white corner handles to resize. The same relative crop region is applied to every uploaded image.
            </p>
          </div>
        </div>
      )}
    </BaseTool>
  );
}
