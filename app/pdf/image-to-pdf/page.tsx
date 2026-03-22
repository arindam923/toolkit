"use client";

import { useState } from "react";
import BasePdfTool, { PdfFile } from "../components/BasePdfTool";
import { PDFDocument, StandardFonts } from "pdf-lib";

interface ImageFile extends PdfFile {
  imageWidth?: number;
  imageHeight?: number;
}

interface ConvertSettings {
  pageSize: "a4" | "letter" | "fit";
  orientation: "portrait" | "landscape";
  margin: number;
  quality: number;
}

const PAGE_SIZES = {
  a4: { width: 595, height: 842 },
  letter: { width: 612, height: 792 },
};

export default function ImageToPdfTool() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [settings, setSettings] = useState<ConvertSettings>({
    pageSize: "a4",
    orientation: "portrait",
    margin: 20,
    quality: 90,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Convert images to PDF
  const handleConvert = async (pdfFile: PdfFile): Promise<string> => {
    try {
      setIsProcessing(true);
      
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Process each image
        for (const file of files) {
          // Read the image file
          const arrayBuffer = await file.file.arrayBuffer();
          
          // Determine image format and embed accordingly
          let image: any;
          const fileType = file.file.type.toLowerCase();
        
        if (fileType.includes("png")) {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else if (fileType.includes("jpeg") || fileType.includes("jpg")) {
          image = await pdfDoc.embedJpg(arrayBuffer);
        } else if (fileType.includes("webp")) {
          // For WebP, we'll try to use it as is or convert to JPEG
          // Since pdf-lib doesn't directly support WebP, we convert using canvas
          const blob = new Blob([arrayBuffer], { type: file.file.type });
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          
          // Create an image element to convert WebP to JPEG
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = dataUrl;
          });
          
          // Draw to canvas and get JPEG data
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas context not available");
          ctx.drawImage(img, 0, 0);
          const jpegDataUrl = canvas.toDataURL("image/jpeg", settings.quality / 100);
          const jpegBase64 = jpegDataUrl.split(",")[1];
          const jpegBytes = Uint8Array.from(atob(jpegBase64), c => c.charCodeAt(0));
          image = await pdfDoc.embedJpg(jpegBytes);
        } else {
          throw new Error(`Unsupported image format: ${fileType}`);
        }

        // Calculate page dimensions
        let pageWidth: number, pageHeight: number;
        
        if (settings.pageSize === "fit") {
          // Fit image to page with margins
          const availableWidth = 595 - (settings.margin * 2);
          const availableHeight = 842 - (settings.margin * 2);
          
          const imageAspect = image.width / image.height;
          const pageAspect = availableWidth / availableHeight;
          
          if (imageAspect > pageAspect) {
            pageWidth = availableWidth;
            pageHeight = availableWidth / imageAspect;
          } else {
            pageHeight = availableHeight;
            pageWidth = availableHeight * imageAspect;
          }
        } else {
          pageWidth = settings.orientation === "landscape" 
            ? PAGE_SIZES[settings.pageSize].height 
            : PAGE_SIZES[settings.pageSize].width;
          pageHeight = settings.orientation === "landscape" 
            ? PAGE_SIZES[settings.pageSize].width 
            : PAGE_SIZES[settings.pageSize].height;
        }

        // Add a new page for each image
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        
        // Calculate image position (centered with margin)
        const imageAspect = image.width / image.height;
        let drawWidth = pageWidth;
        let drawHeight = pageWidth / imageAspect;
        
        if (drawHeight > pageHeight) {
          drawHeight = pageHeight;
          drawWidth = pageHeight * imageAspect;
        }
        
        const x = (pageWidth - drawWidth) / 2;
        const y = (pageHeight - drawHeight) / 2;
        
        // Draw the image
        page.drawImage(image, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });
      }

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as ArrayBuffer], { type: "application/pdf" });
      const dataUrl = URL.createObjectURL(blob);
      
      setIsProcessing(false);
      return dataUrl;
    } catch (error) {
      setIsProcessing(false);
      console.error("Conversion failed:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to convert images to PDF");
    }
  };

  return (
    <BasePdfTool
      title="Image to PDF"
      description="Convert images to PDF documents. Support for JPG, PNG, WebP, and other common image formats."
      icon="📄"
      onProcess={handleConvert}
      onFilesChange={setFiles}
      accept="image/png,image/jpeg,image/jpg,image/webp"
      fileTypeLabel="Image"
    >
      {({ files }) => (
        <div className="space-y-4">
          {files.length > 0 && (
            <div className="p-4 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
              <div className="flex items-start gap-3">
                <div className="text-2xl">🖼️</div>
                <div>
                  <h3 className="text-xs font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
                    Selected Images
                  </h3>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {files.length} image{files.length > 1 ? "s" : ""} will be converted to PDF
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--color-text-primary)" }}
            >
              Page Size
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "a4", label: "A4" },
                { key: "letter", label: "Letter" },
                { key: "fit", label: "Fit to Image" },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSettings(prev => ({ ...prev, pageSize: option.key as any }))}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all ${
                    settings.pageSize === option.key
                      ? "bg-[#7C5CFF] text-white border-[#7C5CFF]"
                      : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {settings.pageSize !== "fit" && (
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-text-primary)" }}
              >
                Orientation
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "portrait", label: "Portrait" },
                  { key: "landscape", label: "Landscape" },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setSettings(prev => ({ ...prev, orientation: option.key as any }))}
                    className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all ${
                      settings.orientation === option.key
                        ? "bg-[#7C5CFF] text-white border-[#7C5CFF]"
                        : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {settings.pageSize !== "fit" && (
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-text-primary)" }}
              >
                Margin: {settings.margin}px
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={settings.margin}
                onChange={(e) => setSettings(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                className="w-full"
                style={{ accentColor: "#7C5CFF" }}
              />
              <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                <span>No margin</span>
                <span>50px</span>
              </div>
            </div>
          )}

          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--color-text-primary)" }}
            >
              Image Quality: {settings.quality}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.quality}
              onChange={(e) => setSettings(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
              className="w-full"
              style={{ accentColor: "#7C5CFF" }}
            />
            <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
              <span>Smaller file</span>
              <span>Better quality</span>
            </div>
          </div>

          <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Tip:</strong> Each image will be placed on a separate page. Use "Fit to Image" to automatically adjust page size to match your image dimensions.
            </p>
          </div>
        </div>
      )}
    </BasePdfTool>
  );
}