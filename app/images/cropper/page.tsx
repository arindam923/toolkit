"use client";

import { useState, useRef } from "react";
import BaseTool, { ImageFile } from "../components/BaseTool";

interface CropSettings {
  aspectRatio: "free" | "1:1" | "4:3" | "16:9" | "9:16";
  quality: number;
}

export default function ImageCropper() {
  const [settings, setSettings] = useState<CropSettings>({
    aspectRatio: "free",
    quality: 90,
  });

  const [selectedFile, setSelectedFile] = useState<ImageFile | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [cropBox, setCropBox] = useState({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
  });

  // Load image for cropping
  const handleImageLoad = (imageFile: ImageFile) => {
    setSelectedFile(imageFile);
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      if (canvasRef.current) {
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
        // Initialize crop box with 80% of image size
        const boxWidth = img.width * 0.8;
        const boxHeight = img.height * 0.8;
        setCropBox({
          x: (img.width - boxWidth) / 2,
          y: (img.height - boxHeight) / 2,
          width: boxWidth,
          height: boxHeight,
        });
      }
    };
    img.src = imageFile.previewUrl;
  };

  // Start drag
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setStartPos({ x, y });
  };

  // Drag move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const img = imageRef.current;

    const rect = canvas.getBoundingClientRect();
    const currentPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const dx = currentPos.x - startPos.x;
    const dy = currentPos.y - startPos.y;

    setCropBox((prev) => {
      const newBox = {
        ...prev,
        x: Math.max(0, Math.min(prev.x + dx, img.width - prev.width)),
        y: Math.max(0, Math.min(prev.y + dy, img.height - prev.height)),
      };
      setStartPos(currentPos);
      return newBox;
    });
  };

  // End drag
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle resize from corners
  const handleResize = (corner: "ne" | "se" | "sw" | "nw") => {
    // Implementation for resize handles would go here
    console.log("Resize from corner:", corner);
  };

  // Crop image
  const handleCrop = async (imageFile: ImageFile): Promise<string> => {
    if (!canvasRef.current || !imageRef.current) {
      throw new Error("Canvas or image not loaded");
    }

    // If it's the first time processing, load the image
    if (!selectedFile) {
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          if (canvasRef.current) {
            canvasRef.current.width = img.width;
            canvasRef.current.height = img.height;
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0);
            }
            // Initialize crop box
            const boxWidth = img.width * 0.8;
            const boxHeight = img.height * 0.8;
            setCropBox({
              x: (img.width - boxWidth) / 2,
              y: (img.height - boxHeight) / 2,
              width: boxWidth,
              height: boxHeight,
            });
            resolve(img);
          }
        };
        img.src = imageFile.previewUrl;
      });
    }

    return new Promise((resolve, reject) => {
      if (!canvasRef.current || !imageRef.current) {
        reject(new Error("Canvas or image not loaded"));
        return;
      }

      const cropCanvas = document.createElement("canvas");
      const ctx = cropCanvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      // Calculate aspect ratio if needed
      let { width, height, x, y } = cropBox;
      if (settings.aspectRatio !== "free") {
        const [aspectWidth, aspectHeight] = settings.aspectRatio.split(":").map(Number);
        const aspect = aspectWidth / aspectHeight;
        height = width / aspect;
      }

      cropCanvas.width = width;
      cropCanvas.height = height;
      ctx.drawImage(
        imageRef.current,
        x,
        y,
        width,
        height,
        0,
        0,
        width,
        height
      );

      const dataURL = cropCanvas.toDataURL("image/jpeg", settings.quality / 100);
      resolve(dataURL);
    });
  };

  return (
    <BaseTool
      title="Image Cropper"
      description="Crop images with freehand or preset aspect ratio. Drag the crop box to select area."
      icon="✂️"
      onProcess={handleCrop}
    >
      {({ files }) => {
        // Update selected file when files change
        if (files.length > 0 && (!selectedFile || !files.find(f => f.id === selectedFile.id))) {
          handleImageLoad(files[0]);
        } else if (files.length === 0 && selectedFile) {
          setSelectedFile(null);
        }

        return (
          <div className="space-y-4">
        {/* Image Preview with Crop */}
        {selectedFile && (
          <div className="border rounded-[10px] p-1" style={{ background: "var(--color-background-secondary)" }}>
            <canvas
              ref={canvasRef}
              className="w-full max-w-full h-auto cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                background: "#f5f5f5",
                border: "1px solid var(--color-border-tertiary)",
                borderRadius: "8px",
              }}
            />
          </div>
        )}

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Aspect Ratio
          </label>
          <div className="flex flex-wrap gap-2">
            {["free", "1:1", "4:3", "16:9", "9:16"].map((ratio) => (
              <button
                key={ratio}
                onClick={() => setSettings((prev) => ({ ...prev, aspectRatio: ratio as any }))}
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

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Quick Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "Square", aspect: "1:1" },
              { name: "Portrait", aspect: "9:16" },
              { name: "Landscape", aspect: "16:9" },
              { name: "Standard", aspect: "4:3" },
            ].map((preset) => (
              <button
                key={preset.name}
                onClick={() => setSettings((prev) => ({ ...prev, aspectRatio: preset.aspect as any }))}
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

        <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            <strong>Tip:</strong> Drag the crop box to select area. Use aspect ratio presets for common formats like Instagram or YouTube.
          </p>
        </div>
          </div>
        );
      }}
    </BaseTool>
  );
}