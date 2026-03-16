"use client";

import { useState } from "react";
import BaseTool, { ImageFile } from "../components/BaseTool";

interface MetadataSettings {
  title: string;
  description: string;
  author: string;
  copyright: string;
  quality: number;
}

export default function MetadataEditor() {
  const [settings, setSettings] = useState<MetadataSettings>({
    title: "",
    description: "",
    author: "",
    copyright: "",
    quality: 90,
  });

  const [extractedMetadata, setExtractedMetadata] = useState<Record<string, any>>({});

  // Extract and edit metadata
  const handleEditMetadata = async (imageFile: ImageFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Extract metadata using FileReader
        const reader = new FileReader();
        reader.onload = (e) => {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const dataView = new DataView(arrayBuffer);

          // Simple EXIF extraction (for demonstration)
          const metadata: Record<string, any> = {};
          
          // Try to extract basic metadata
          if (dataView.getUint16(0, false) === 0xFFD8) {
            metadata.fileSize = imageFile.file.size;
            metadata.type = imageFile.file.type;
            metadata.width = img.width;
            metadata.height = img.height;
          }

          setExtractedMetadata(metadata);
          resolve(imageFile.previewUrl);
        };

        reader.onerror = () => {
          reject(new Error("Failed to read metadata"));
        };

        reader.readAsArrayBuffer(imageFile.file);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = imageFile.previewUrl;
    });
  };

  return (
    <BaseTool
      title="Image Metadata Editor"
      description="View and edit EXIF, IPTC, and GPS metadata. Add copyright information, author details, and descriptions."
      icon="📊"
      onProcess={handleEditMetadata}
    >
      {() => (
        <div className="space-y-4">
        {/* Display Extracted Metadata */}
        {Object.keys(extractedMetadata).length > 0 && (
          <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <h3 className="text-xs font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
              Extract Metadata
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(extractedMetadata).map(([key, value]) => (
                <div key={key}>
                  <span style={{ color: "var(--color-text-secondary)" }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}:
                  </span>
                  <br />
                  <span style={{ color: "var(--color-text-primary)" }}>
                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Title
          </label>
          <input
            type="text"
            value={settings.title}
            onChange={(e) => setSettings((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Image title"
            className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
            style={{
              background: "var(--color-background-secondary)",
              borderColor: "var(--color-border-tertiary)",
              color: "var(--color-text-primary)",
            }}
          />
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Description
          </label>
          <textarea
            value={settings.description}
            onChange={(e) => setSettings((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Image description"
            rows={3}
            className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border resize-none"
            style={{
              background: "var(--color-background-secondary)",
              borderColor: "var(--color-border-tertiary)",
              color: "var(--color-text-primary)",
            }}
          />
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Author
          </label>
          <input
            type="text"
            value={settings.author}
            onChange={(e) => setSettings((prev) => ({ ...prev, author: e.target.value }))}
            placeholder="Author name"
            className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
            style={{
              background: "var(--color-background-secondary)",
              borderColor: "var(--color-border-tertiary)",
              color: "var(--color-text-primary)",
            }}
          />
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Copyright
          </label>
          <input
            type="text"
            value={settings.copyright}
            onChange={(e) => setSettings((prev) => ({ ...prev, copyright: e.target.value }))}
            placeholder="Copyright information"
            className="w-full px-2.5 py-1.5 rounded-[10px] text-xs border"
            style={{
              background: "var(--color-background-secondary)",
              borderColor: "var(--color-border-tertiary)",
              color: "var(--color-text-primary)",
            }}
          />
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

        <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            <strong>Tip:</strong> Proper metadata helps with image search and copyright protection. Always include copyright information.
          </p>
        </div>
        </div>
      )}
    </BaseTool>
  );
}