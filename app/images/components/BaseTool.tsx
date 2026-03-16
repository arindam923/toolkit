"use client";

import { useState, useRef } from "react";

// Types
export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  processedUrl?: string;
  status: "uploaded" | "processing" | "processed" | "error";
  error?: string;
}

interface ToolProps {
  title: string;
  description: string;
  icon: string;
  children: (props: { files: ImageFile[] }) => React.ReactNode;
  onProcess?: (file: ImageFile) => Promise<string>;
  onFileRemove?: (id: string) => void;
}

export default function BaseTool({
  title,
  description,
  icon,
  children,
  onProcess,
  onFileRemove,
}: ToolProps) {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = (selectedFiles: File[]) => {
    const newFiles: ImageFile[] = selectedFiles.map((file) => ({
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
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
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
    if (fileToRemove?.processedUrl) {
      URL.revokeObjectURL(fileToRemove.processedUrl);
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
      updatedFiles[i].status = "processing";
      setFiles([...updatedFiles]);

      try {
        const processedUrl = await onProcess(updatedFiles[i]);
        updatedFiles[i].processedUrl = processedUrl;
        updatedFiles[i].status = "processed";
      } catch (error) {
        updatedFiles[i].status = "error";
        updatedFiles[i].error =
          error instanceof Error ? error.message : "Processing failed";
      }

      setFiles([...updatedFiles]);
    }

    setIsProcessing(false);
  };

  // Download processed file
  const handleDownload = (file: ImageFile) => {
    if (!file.processedUrl) return;

    const link = document.createElement("a");
    link.href = file.processedUrl;
    link.download = `processed_${file.file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              background: "var(--color-background-primary)",
              border: "2px dashed var(--color-border-tertiary)",
              borderColor: "var(--color-border-tertiary)",
            }}
            onDragOver={handleDragOver}
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
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-3 mx-auto"
                style={{ background: "rgba(255,92,53,0.1)" }}
              >
                📁
              </div>
              <p
                className="text-sm font-medium mb-1"
                style={{ color: "var(--color-text-primary)" }}
              >
                Drag & drop images here or click to browse
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
              <h3
                className="font-['Syne'] text-xs font-bold tracking-[2px] uppercase mb-0.5"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                Uploaded Images
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="relative p-3 rounded-[14px]"
                    style={{
                      background: "var(--color-background-primary)",
                      border: "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>
                        {file.file.name}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(file.id);
                        }}
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{
                          background: "var(--color-background-secondary)",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <div className="relative">
                      <img
                        src={file.processedUrl || file.previewUrl}
                        alt={file.file.name}
                        className="w-full h-32 object-cover rounded-[10px]"
                      />
                      {file.status === "processing" && (
                        <div
                          className="absolute inset-0 flex items-center justify-center rounded-[10px]"
                          style={{
                            background: "rgba(255,255,255,0.9)",
                          }}
                        >
                          <div className="text-xs" style={{ color: "var(--color-text-primary)" }}>
                            Processing...
                          </div>
                        </div>
                      )}
                      {file.status === "error" && (
                        <div
                          className="absolute inset-0 flex items-center justify-center rounded-[10px]"
                          style={{
                            background: "rgba(255,92,53,0.1)",
                          }}
                        >
                          <div className="text-xs text-center" style={{ color: "#FF5C35" }}>
                            Error<br />{file.error}
                          </div>
                        </div>
                      )}
                    </div>
                    {file.status === "processed" && (
                      <button
                        onClick={() => handleDownload(file)}
                        className="w-full mt-2 py-1.5 text-xs rounded-[10px] font-medium"
                        style={{
                          background: "#FF5C35",
                          color: "#fff",
                        }}
                      >
                        Download
                      </button>
                    )}
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
                className="px-5.5 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-opacity flex-1"
                style={{
                  background: "#FF5C35",
                  color: "#fff",
                  opacity: isProcessing ? 0.6 : 1,
                }}
              >
                {isProcessing ? "Processing..." : "Process Images"}
              </button>
              <button
                onClick={() => setFiles([])}
                className="px-5.5 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-colors border"
                style={{
                  background: "transparent",
                  color: "var(--color-text-primary)",
                  borderColor: "var(--color-border-tertiary)",
                }}
              >
                Clear All
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