"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// Types
export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  processedUrl?: string;
  processedBlob?: Blob;
  status: "uploaded" | "processing" | "processed" | "error";
  error?: string;
  dimensions?: { width: number; height: number };
  processedSize?: number;
}

interface ToolProps {
  title: string;
  description: string;
  icon: string;
  children: (props: { files: ImageFile[] }) => React.ReactNode;
  onProcess?: (file: ImageFile) => Promise<string>;
  onFileRemove?: (id: string) => void;
  onFilesChange?: (files: ImageFile[]) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function FileCard({
  file,
  onRemove,
  onDownload,
}: {
  file: ImageFile;
  onRemove: (id: string) => void;
  onDownload: (file: ImageFile) => void;
}) {
  const [showBefore, setShowBefore] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const cardRef = useRef<HTMLDivElement>(null);
  const isDraggingSlider = useRef(false);

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingSlider.current = true;
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingSlider.current || !cardRef.current) return;
    const rect = cardRef.current.querySelector(".image-container")?.getBoundingClientRect();
    if (!rect) return;
    const pos = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setSliderPos(pos);
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingSlider.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const savings =
    file.processedSize && file.file.size
      ? Math.round(100 - (file.processedSize / file.file.size) * 100)
      : null;

  const isProcessed = file.status === "processed";
  const isProcessing = file.status === "processing";

  return (
    <div
      ref={cardRef}
      className="relative rounded-[14px] overflow-hidden transition-all"
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      {/* Status badge */}
      <div className="absolute top-2.5 left-2.5 z-10">
        {isProcessed && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ background: "rgba(34,197,94,0.15)", color: "#16a34a" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Done
          </span>
        )}
        {isProcessing && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ background: "rgba(255,92,53,0.12)", color: "#FF5C35" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C35] inline-block animate-pulse" />
            Processing
          </span>
        )}
      </div>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(file.id);
        }}
        className="absolute top-2.5 right-2.5 z-10 w-6 h-6 flex items-center justify-center rounded-full text-xs transition-all hover:scale-110"
        style={{
          background: "rgba(0,0,0,0.5)",
          color: "#fff",
          backdropFilter: "blur(4px)",
        }}
      >
        ×
      </button>

      {/* Image area with before/after slider */}
      <div
        className="image-container relative overflow-hidden cursor-crosshair select-none"
        style={{ height: "160px" }}
        onMouseEnter={() => isProcessed && setShowBefore(true)}
        onMouseLeave={() => { setShowBefore(false); setSliderPos(50); }}
      >
        {/* Main image (original or processed) */}
        <img
          src={file.processedUrl || file.previewUrl}
          alt={file.file.name}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* Before/after comparison overlay */}
        {isProcessed && showBefore && file.previewUrl && (
          <>
            {/* Original image clipped to left side */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={file.previewUrl}
                alt="Original"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ width: `${10000 / sliderPos}%`, maxWidth: "none" }}
                draggable={false}
              />
            </div>

            {/* Divider line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-col-resize"
              style={{ left: `calc(${sliderPos}% - 1px)` }}
              onMouseDown={handleSliderMouseDown}
            >
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M4 2L1 6L4 10M8 2L11 6L8 10" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Labels */}
            <div
              className="absolute top-2 pointer-events-none"
              style={{ left: "8px" }}
            >
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/50 text-white">BEFORE</span>
            </div>
            <div
              className="absolute top-2 pointer-events-none"
              style={{ right: "8px" }}
            >
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/50 text-white">AFTER</span>
            </div>
          </>
        )}

        {/* Processing overlay */}
        {isProcessing && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)" }}
          >
            <div className="w-8 h-8 rounded-full border-2 border-[#FF5C35] border-t-transparent animate-spin" />
            <span className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>
              Processing…
            </span>
          </div>
        )}

        {/* Error overlay */}
        {file.status === "error" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2"
            style={{ background: "rgba(255,92,53,0.1)", backdropFilter: "blur(4px)" }}
          >
            <span className="text-lg">⚠️</span>
            <div className="text-[10px] text-center font-medium" style={{ color: "#FF5C35" }}>
              {file.error || "Processing failed"}
            </div>
          </div>
        )}

        {/* Hover hint for before/after */}
        {isProcessed && !showBefore && (
          <div
            className="absolute bottom-2 right-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-black/50 text-white">
              Hover to compare
            </span>
          </div>
        )}
      </div>

      {/* File info */}
      <div className="p-3">
        <div className="text-xs font-medium truncate mb-1.5" style={{ color: "var(--color-text-primary)" }} title={file.file.name}>
          {file.file.name}
        </div>

        {/* Size info */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px]" style={{ color: "var(--color-text-secondary)" }}>
            {formatBytes(file.file.size)}
            {file.processedSize && (
              <>
                {" → "}
                <span style={{ color: savings && savings > 0 ? "#16a34a" : "var(--color-text-secondary)" }}>
                  {formatBytes(file.processedSize)}
                </span>
              </>
            )}
          </div>
          {savings !== null && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                background: savings > 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
                color: savings > 0 ? "#16a34a" : "#dc2626",
              }}
            >
              {savings > 0 ? `−${savings}%` : `+${Math.abs(savings)}%`}
            </span>
          )}
        </div>

        {/* Dimensions */}
        {file.dimensions && (
          <div className="text-[10px] mb-2" style={{ color: "var(--color-text-secondary)" }}>
            {file.dimensions.width} × {file.dimensions.height}px
          </div>
        )}

        {/* Download */}
        {isProcessed && (
          <button
            onClick={() => onDownload(file)}
            className="w-full py-1.5 text-xs rounded-[10px] font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #FF5C35, #ff7a54)",
              color: "#fff",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download
          </button>
        )}
      </div>
    </div>
  );
}

export default function BaseTool({
  title,
  description,
  icon,
  children,
  onProcess,
  onFileRemove,
  onFilesChange,
}: ToolProps) {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notify parent of file list changes safely (after render, not during)
  useEffect(() => {
    if (onFilesChange) onFilesChange(files);
  }, [files, onFilesChange]);

  // Get image dimensions
  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = url;
    });
  };

  // Handle file upload
  const handleFileUpload = async (selectedFiles: File[]) => {
    const newFiles: ImageFile[] = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 15),
      file,
      previewUrl: URL.createObjectURL(file),
      status: "uploaded",
    }));
    setFiles((prev) => [...prev, ...newFiles]);

    // Load dimensions asynchronously
    for (const f of newFiles) {
      const dims = await getImageDimensions(f.previewUrl);
      if (dims.width > 0) {
        setFiles((prev) =>
          prev.map((existing) =>
            existing.id === f.id ? { ...existing, dimensions: dims } : existing
          )
        );
      }
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(Array.from(e.dataTransfer.files));
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(Array.from(e.target.files));
    }
  };

  // Remove file
  const handleRemoveFile = (id: string) => {
    const fileToRemove = files.find((f) => f.id === id);
    if (fileToRemove?.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (onFileRemove) {
      onFileRemove(id);
    }
  };

  // Process all files
  const handleProcess = async () => {
    if (!onProcess) return;

    setIsProcessing(true);
    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      if (updatedFiles[i].status === "processed") continue;

      updatedFiles[i] = { ...updatedFiles[i], status: "processing" };
      setFiles([...updatedFiles]);

      try {
        const processedDataUrl = await onProcess(updatedFiles[i]);
        // Estimate processed size from base64
        const base64Data = processedDataUrl.split(",")[1] || "";
        const processedSize = Math.round((base64Data.length * 3) / 4);

        updatedFiles[i] = {
          ...updatedFiles[i],
          processedUrl: processedDataUrl,
          status: "processed",
          processedSize,
        };
      } catch (error) {
        updatedFiles[i] = {
          ...updatedFiles[i],
          status: "error",
          error: error instanceof Error ? error.message : "Processing failed",
        };
      }

      setFiles([...updatedFiles]);
    }

    setIsProcessing(false);
  };

  // Download single processed file
  const handleDownload = (file: ImageFile) => {
    if (!file.processedUrl) return;
    const ext = file.processedUrl.startsWith("data:image/webp") ? "webp" : "jpg";
    const baseName = file.file.name.replace(/\.[^.]+$/, "");
    const link = document.createElement("a");
    link.href = file.processedUrl;
    link.download = `${baseName}_processed.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all processed files
  const handleDownloadAll = () => {
    const processed = files.filter((f) => f.processedUrl && f.status === "processed");
    processed.forEach((file, i) => {
      setTimeout(() => handleDownload(file), i * 200);
    });
  };

  const processedCount = files.filter((f) => f.status === "processed").length;
  const totalFiles = files.length;

  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="max-w-215 mx-auto px-2 lg:px-0 pt-5 pb-12">
        {/* Navigation */}
        <nav
          className="flex items-center justify-between mb-2.5 px-4 sm:px-6 py-3.5 rounded-[14px] border"
          style={{
            background: "var(--color-background-primary)",
            borderColor: "var(--color-border-tertiary)",
          }}
        >
          <div
            className="font-['Syne'] font-extrabold text-xl text-[#FF5C35]"
            style={{ letterSpacing: "-0.5px" }}
          >
            Tool
            <span style={{ color: "var(--color-text-primary)" }}>
              Kit
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs"
              style={{
                background: "var(--color-background-secondary)",
                border: "0.5px solid var(--color-border-tertiary)",
                color: "var(--color-text-secondary)",
              }}
            >
              <a
                href="/images"
                className="hover:text-[#FF5C35] transition-colors"
              >
                ← Back to Image Tools
              </a>
            </div>
          </div>
        </nav>

        {/* Tool Header */}
        <section
          className="relative overflow-hidden px-6 sm:px-10 py-8 sm:py-11 rounded-[14px] mb-2.5"
          style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-[200px] sm:w-[300px] h-full pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, transparent 40%, rgba(255,92,53,0.06) 100%)",
            }}
          />

          <div className="relative">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[20px] text-[11px] font-medium mb-4"
              style={{
                background: "rgba(255,92,53,0.1)",
                color: "#FF5C35",
                letterSpacing: "0.3px",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF5C35] animate-pulse" />
              Browser-based processing
            </div>

            <h1
              className="font-['Syne'] font-extrabold text-[26px] sm:text-[36px] leading-tight tracking-[-1px] mb-3"
              style={{ color: "var(--color-text-primary)" }}
            >
              {icon} {title}
            </h1>

            <p
              className="text-sm leading-relaxed max-w-[440px] mb-6"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              {description}
            </p>
          </div>
        </section>

        {/* Tool Content */}
        <section className="mb-3">
          {/* File Upload Zone */}
          <div
            className="p-6 rounded-[14px] mb-2.5 cursor-pointer transition-all"
            style={{
              background: isDragOver
                ? "rgba(255,92,53,0.04)"
                : "var(--color-background-primary)",
              border: isDragOver
                ? "2px dashed #FF5C35"
                : "2px dashed var(--color-border-tertiary)",
              transform: isDragOver ? "scale(1.005)" : "scale(1)",
              transition: "all 0.15s ease",
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-3 mx-auto transition-transform"
                style={{
                  background: isDragOver ? "rgba(255,92,53,0.15)" : "rgba(255,92,53,0.1)",
                  transform: isDragOver ? "scale(1.1)" : "scale(1)",
                }}
              >
                {isDragOver ? "⬇️" : "📁"}
              </div>
              <p
                className="text-sm font-medium mb-1"
                style={{ color: "var(--color-text-primary)" }}
              >
                {isDragOver ? "Drop images here" : "Drag & drop images here or click to browse"}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Supports JPG, PNG, WEBP, AVIF up to 25MB
              </p>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mb-2.5">
              {/* Section header with stats */}
              <div className="flex items-center justify-between mb-2">
                <h3
                  className="font-['Syne'] text-xs font-bold tracking-[2px] uppercase"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Uploaded Images
                </h3>
                <div className="flex items-center gap-2">
                  {processedCount > 0 && (
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(34,197,94,0.12)",
                        color: "#16a34a",
                      }}
                    >
                      {processedCount}/{totalFiles} processed
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {files.map((file) => (
                  <div key={file.id} className="group">
                    <FileCard
                      file={file}
                      onRemove={handleRemoveFile}
                      onDownload={handleDownload}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tool Settings */}
          {files.length > 0 && (
            <div className="mb-2.5">
              <h3
                className="font-['Syne'] text-xs font-bold tracking-[2px] uppercase mb-0.5"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                Settings
              </h3>
              <div
                className="p-4 rounded-[14px]"
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                {children({ files })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {files.length > 0 && (
            <div className="flex gap-2.5">
              <button
                onClick={handleProcess}
                disabled={isProcessing || files.some((f) => f.status === "processing")}
                className="px-5.5 py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer transition-all flex-1 flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #FF5C35, #ff7a54)",
                  color: "#fff",
                  opacity: isProcessing ? 0.6 : 1,
                  boxShadow: isProcessing ? "none" : "0 4px 12px rgba(255,92,53,0.3)",
                }}
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1l1.5 4.5H13l-3.75 2.75 1.5 4.5L7 10 3.25 12.75l1.5-4.5L1 5.5h4.5L7 1z" fill="currentColor"/>
                    </svg>
                    Process {totalFiles > 1 ? `${totalFiles} Images` : "Image"}
                  </>
                )}
              </button>

              {processedCount >= 2 && (
                <button
                  onClick={handleDownloadAll}
                  className="px-4 py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer transition-all flex items-center gap-1.5 border"
                  style={{
                    background: "transparent",
                    color: "var(--color-text-primary)",
                    borderColor: "var(--color-border-tertiary)",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M6.5 1v8M3.5 6l3 3 3-3M1 11h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  All
                </button>
              )}

              <button
                onClick={() => setFiles([])}
                className="px-4 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all border"
                style={{
                  background: "transparent",
                  color: "var(--color-text-secondary)",
                  borderColor: "var(--color-border-tertiary)",
                }}
              >
                Clear
              </button>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer
          className="mt-8 px-6 py-8 rounded-[14px]"
          style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="font-['Syne'] font-extrabold text-lg text-[#FF5C35]">
                Tool
                <span
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  Kit
                </span>
              </div>
              <div
                className="flex gap-4 text-xs"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                <a
                  href="#"
                  className="hover:text-[#FF5C35] transition-colors"
                >
                  Privacy
                </a>
                <a
                  href="#"
                  className="hover:text-[#FF5C35] transition-colors"
                >
                  Terms
                </a>
                <a
                  href="#"
                  className="hover:text-[#FF5C35] transition-colors"
                >
                  Contact
                </a>
              </div>
            </div>
            <div
              className="flex items-center gap-4 text-xs"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              <span>Made with ❤️ in India</span>
              <span>•</span>
              <span>© 2026 ToolKit</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}