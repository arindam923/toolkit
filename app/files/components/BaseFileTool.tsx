"use client";

import { useState, useRef, useEffect } from "react";
import Footer from "@/components/home/Footer";
import ToolHeader from "@/components/shared/ToolHeader";

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

interface FileConverterProps {
  title: string;
  description: string;
  icon: string;
  fromFormat: string;
  toFormat: string;
  accept: string;
  children: (props: { files: ConvertedFile[] }) => React.ReactNode;
  onConvert: (file: File) => Promise<{ url: string; blob: Blob }>;
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
    <div
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
            style={{ background: "rgba(0,200,150,0.12)", color: "#00A87A" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A87A] inline-block animate-pulse" />
            Processing
          </span>
        )}
      </div>

      {/* Remove button */}
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

      {/* Preview area */}
      <div
        className="relative overflow-hidden"
        style={{ height: "160px" }}
      >
        <img
          src={file.processedUrl || file.previewUrl}
          alt={file.file.name}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ background: "#f5f5f5" }}
        />

        {/* Processing overlay */}
        {isProcessing && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)" }}
          >
            <div className="w-8 h-8 rounded-full border-2 border-[#00A87A] border-t-transparent animate-spin" />
            <span className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>
              Converting…
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
              {file.error || "Conversion failed"}
            </div>
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

        {/* Download */}
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

export default function BaseFileTool({
  title,
  description,
  icon,
  fromFormat,
  accept,
  children,
  onConvert,
}: FileConverterProps) {
  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = async (selectedFiles: File[]) => {
    const newFiles: ConvertedFile[] = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 15),
      file,
      previewUrl: URL.createObjectURL(file),
      status: "uploaded",
    }));
    setFiles((prev) => [...prev, ...newFiles]);
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
  };

  // Process all files
  const handleConvert = async () => {
    setIsProcessing(true);
    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      if (updatedFiles[i].status === "processed") continue;

      updatedFiles[i] = { ...updatedFiles[i], status: "processing" };
      setFiles([...updatedFiles]);

      try {
        const result = await onConvert(updatedFiles[i].file);
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

  // Download single processed file
  const handleDownload = (file: ConvertedFile) => {
    if (!file.processedUrl) return;
    const baseName = file.file.name.replace(/\.[^.]+$/, "");
    const link = document.createElement("a");
    link.href = file.processedUrl;
    link.download = `${baseName}.${file.processedBlob?.type.split("/")[1] || "bin"}`;
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
                href="/files"
                className="hover:text-[#00A87A] transition-colors"
              >
                ← Back to File Tools
              </a>
            </div>
          </div>
        </nav>

        {/* Tool Header */}
        <ToolHeader 
          title={title} 
          description={description} 
          icon={icon} 
        />

        {/* Tool Content */}
        <section className="mb-3">
          {/* File Upload Zone */}
          <div
            className="p-6 rounded-[14px] mb-2.5 cursor-pointer transition-all"
            style={{
              background: isDragOver
                ? "rgba(0,200,150,0.04)"
                : "var(--color-background-primary)",
              border: isDragOver
                ? "2px dashed #00A87A"
                : "2px dashed var(--color-border-tertiary)",
              transform: isDragOver ? "scale(1.005)" : "scale(1)",
              transition: "all 0.15s ease",
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-3 mx-auto transition-transform"
                style={{
                  background: isDragOver ? "rgba(0,200,150,0.15)" : "rgba(0,200,150,0.1)",
                  transform: isDragOver ? "scale(1.1)" : "scale(1)",
                }}
              >
                {isDragOver ? "⬇️" : "📁"}
              </div>
              <p
                className="text-sm font-medium mb-1"
                style={{ color: "var(--color-text-primary)" }}
              >
                {isDragOver ? "Drop files here" : `Drag & drop ${fromFormat.toUpperCase()} files here or click to browse`}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Supports {accept.split(",").map((t) => t.trim().toUpperCase()).join(", ")} up to 25MB
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
                  Uploaded Files
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
                      {processedCount}/{totalFiles} converted
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
                type="button"
                onClick={handleConvert}
                disabled={isProcessing || files.some((f) => f.status === "processing")}
                className="px-5.5 py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer transition-all flex-1 flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #00A87A, #00c49a)",
                  color: "#fff",
                  opacity: isProcessing ? 0.6 : 1,
                  boxShadow: isProcessing ? "none" : "0 4px 12px rgba(0,200,150,0.3)",
                }}
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Converting…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1l1.5 4.5H13l-3.75 2.75 1.5 4.5L7 10 3.25 12.75l1.5-4.5L1 5.5h4.5L7 1z" fill="currentColor"/>
                    </svg>
                    Convert {totalFiles > 1 ? `${totalFiles} Files` : "File"}
                  </>
                )}
              </button>

              {processedCount >= 2 && (
                <button
                  type="button"
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
                type="button"
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
        <Footer />
      </div>
    </div>
  );
}
