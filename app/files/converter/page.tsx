"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronRight, Download } from "lucide-react";
import ToolLayout from "@/components/shared/ToolLayout";

export interface ConvertedFile {
  id: string;
  file: File;
  previewUrl: string;
  processedUrl?: string;
  processedBlob?: Blob;
  status: "uploaded" | "processing" | "processed" | "error";
  error?: string;
  processedSize?: number;
}

const OUTPUT_FORMATS = [
  { value: "png", label: "PNG", mime: "image/png", supportsQuality: false },
  { value: "jpg", label: "JPG", mime: "image/jpeg", supportsQuality: true },
  { value: "webp", label: "WEBP", mime: "image/webp", supportsQuality: true },
  { value: "avif", label: "AVIF", mime: "image/avif", supportsQuality: true },
];

const INPUT_FORMATS = ["image/jpeg", "image/png", "image/webp", "image/avif"];

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
  file: ConvertedFile;
  onRemove: (id: string) => void;
  onDownload: (file: ConvertedFile) => void;
}) {
  const isProcessed = file.status === "processed";
  const isProcessing = file.status === "processing";

  const savings =
    file.processedSize && file.file.size
      ? Math.round(100 - (file.processedSize / file.file.size) * 100)
      : null;

  return (
    <div className="relative rounded-[14px] overflow-hidden transition-all bg-background border border-border">
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
            style={{ background: "rgba(0,200,150,0.12)", color: "#00A87A" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A87A] inline-block animate-pulse" />
            Processing
          </span>
        )}
      </div>

      <button
        type="button"
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

      <div className="relative overflow-hidden" style={{ height: "160px" }}>
        <img
          src={file.processedUrl || file.previewUrl}
          alt={file.file.name}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ background: "#f5f5f5" }}
        />

        {isProcessing && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(4px)",
            }}
          >
            <div className="w-8 h-8 rounded-full border-2 border-[#00A87A] border-t-transparent animate-spin" />
            <span className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>
              Converting…
            </span>
          </div>
        )}

        {file.status === "error" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2"
            style={{
              background: "rgba(255,92,53,0.1)",
              backdropFilter: "blur(4px)",
            }}
          >
            <span className="text-lg">⚠️</span>
            <div className="text-[10px] text-center font-medium" style={{ color: "#FF5C35" }}>
              {file.error || "Conversion failed"}
            </div>
          </div>
        )}
      </div>

      <div className="p-3">
        <div
          className="text-xs font-medium truncate mb-1.5"
          style={{ color: "var(--color-text-primary)" }}
          title={file.file.name}
        >
          {file.file.name}
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px]" style={{ color: "var(--color-text-secondary)" }}>
            {formatBytes(file.file.size)}
            {file.processedSize && (
              <>
                {" → "}
                <span
                  style={{
                    color: savings && savings > 0 ? "#16a34a" : "var(--color-text-secondary)",
                  }}
                >
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

        {isProcessed && (
          <button
            type="button"
            onClick={() => onDownload(file)}
            className="w-full py-1.5 text-xs rounded-[10px] font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #00A87A, #00c49a)",
              color: "#fff",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M6 1v7M3 5l3 3 3-3M1 10h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Download
          </button>
        )}
      </div>
    </div>
  );
}

function ImageConverterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialFrom = searchParams.get("from") || "png";
  const initialTo = searchParams.get("to") || "jpg";
  
  const [fromFormat, setFromFormat] = useState(initialFrom);
  const [toFormat, setToFormat] = useState(initialTo);
  const [quality, setQuality] = useState(92);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentOutputFormat = OUTPUT_FORMATS.find((f) => f.value === toFormat);
  const needsBackground = fromFormat === "png" && toFormat === "jpg";

  useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (from) setFromFormat(from);
    if (to) setToFormat(to);
  }, [searchParams]);

  const handleFormatChange = (newFrom: string, newTo: string) => {
    setFromFormat(newFrom);
    setToFormat(newTo);
    router.push(`/files/converter?from=${newFrom}&to=${newTo}`, { scroll: false });
  };

  const handleConvert = async (file: File): Promise<{ url: string; blob: Blob }> => {
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

        if (toFormat === "jpg") {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const mimeType = currentOutputFormat?.mime || "image/png";
        const qualityValue = currentOutputFormat?.supportsQuality ? quality / 100 : undefined;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve({ url, blob });
            } else {
              reject(new Error("Failed to create blob"));
            }
          },
          mimeType,
          qualityValue
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (selectedFiles: File[]) => {
    const newFiles: ConvertedFile[] = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 15),
      file,
      previewUrl: URL.createObjectURL(file),
      status: "uploaded",
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (id: string) => {
    const fileToRemove = files.find((f) => f.id === id);
    if (fileToRemove?.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const processAllFiles = async () => {
    setIsProcessing(true);
    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      if (updatedFiles[i].status === "processed") continue;

      updatedFiles[i] = { ...updatedFiles[i], status: "processing" };
      setFiles([...updatedFiles]);

      try {
        const result = await handleConvert(updatedFiles[i].file);
        updatedFiles[i] = {
          ...updatedFiles[i],
          processedUrl: result.url,
          processedBlob: result.blob,
          status: "processed",
          processedSize: result.blob.size,
        };
      } catch (error) {
        updatedFiles[i] = {
          ...updatedFiles[i],
          status: "error",
          error: error instanceof Error ? error.message : "Conversion failed",
        };
      }

      setFiles([...updatedFiles]);
    }

    setIsProcessing(false);
  };

  const handleDownload = (file: ConvertedFile) => {
    if (!file.processedUrl) return;
    const baseName = file.file.name.replace(/\.[^.]+$/, "");
    const link = document.createElement("a");
    link.href = file.processedUrl;
    link.download = `${baseName}.${toFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    const processed = files.filter((f) => f.processedUrl && f.status === "processed");
    processed.forEach((file, i) => {
      setTimeout(() => handleDownload(file), i * 200);
    });
  };

  const processedCount = files.filter((f) => f.status === "processed").length;
  const totalFiles = files.length;

  const title = `${fromFormat.toUpperCase()} to ${toFormat.toUpperCase()} Converter`;
  const description = `Convert ${fromFormat.toUpperCase()} images to ${toFormat.toUpperCase()} format.`;

  return (
    <ToolLayout
      title={title}
      description={description}
      icon={<span>🔄</span>}
      category="File"
      id="image-converter"
      parameters={
        files.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="from-format"
                  className="block text-xs font-medium mb-2"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  From Format
                </label>
                <select
                  id="from-format"
                  value={fromFormat}
                  onChange={(e) => handleFormatChange(e.target.value, toFormat)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                  <option value="webp">WEBP</option>
                  <option value="avif">AVIF</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="to-format"
                  className="block text-xs font-medium mb-2"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  To Format
                </label>
                <select
                  id="to-format"
                  value={toFormat}
                  onChange={(e) => handleFormatChange(fromFormat, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  {OUTPUT_FORMATS.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {currentOutputFormat?.supportsQuality && (
              <div>
                <label
                  htmlFor="quality-slider"
                  className="block text-xs font-medium mb-2"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Quality: {quality}%
                </label>
                <input
                  id="quality-slider"
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{ background: "var(--color-border-tertiary)" }}
                />
              </div>
            )}

            {needsBackground && (
              <div>
                <label
                  htmlFor="bg-color-picker"
                  className="block text-xs font-medium mb-2"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Background Color (for transparency)
                </label>
                <div className="flex gap-2">
                  {["#FFFFFF", "#000000", "#F0F0F0"].map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setBackgroundColor(color)}
                      className={`w-8 h-8 rounded-lg border-2 ${
                        backgroundColor === color ? "border-[#00A87A]" : "border-border"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border-2 border-border cursor-pointer"
                  />
                </div>
              </div>
            )}

            {needsBackground && (
              <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  <strong>Note:</strong> Transparency will be converted to {backgroundColor} background.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest leading-relaxed">
            Upload files to view parameters.
          </div>
        )
      }
      actions={
        files.length > 0 && (
          <>
            <button
              type="button"
              onClick={processAllFiles}
              disabled={isProcessing || files.some((f) => f.status === "processing")}
              className="w-full py-4 bg-foreground text-background mono-label font-bold text-sm hover:bg-brand-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Convert {totalFiles > 1 ? `${totalFiles} Files` : "File"} <ChevronRight className="w-4 h-4" />
            </button>
            {processedCount >= 2 && (
              <button
                type="button"
                onClick={handleDownloadAll}
                className="w-full py-3 bg-transparent text-foreground border border-border mono-label font-bold text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                Download All
              </button>
            )}
            <button
              type="button"
              onClick={() => setFiles([])}
              className="w-full py-3 bg-transparent text-muted-foreground border border-border mono-label font-bold text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              Clear All
            </button>
          </>
        )
      }
    >
      <button
        type="button"
        className={`w-full bg-muted/30 border border-dashed border-border rounded-lg flex flex-col items-center justify-center p-12 text-center group transition-all cursor-pointer hover:bg-muted/50`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />
        <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <Download className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="mono-label text-lg mb-2">
          {isDragOver ? "Drop files here" : `Drop ${fromFormat.toUpperCase()} files here`}
        </div>
        <div className="mono-label text-xs opacity-50">
          Supports JPG, PNG, WEBP, AVIF up to 25MB
        </div>
      </button>

      {files.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="mono-label border-b border-border pb-2 flex justify-between items-center">
            <span>Uploaded Files</span>
            {processedCount > 0 && (
              <span className="text-emerald-500">
                {processedCount}/{totalFiles} processed
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <div key={file.id} className="group">
                <FileCard file={file} onRemove={handleRemoveFile} onDownload={handleDownload} />
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}

function LoadingFallback() {
  return (
    <ToolLayout
      title="Image Converter"
      description="Convert between JPG, PNG, WEBP, AVIF, and more formats."
      icon={<span>🔄</span>}
      category="File"
      id="image-converter"
      parameters={
        <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest leading-relaxed">
          Loading...
        </div>
      }
      actions={<></>}
    >
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 rounded-full border-2 border-[#00A87A] border-t-transparent animate-spin" />
      </div>
    </ToolLayout>
  );
}

export default function ImageConverter() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ImageConverterContent />
    </Suspense>
  );
}
