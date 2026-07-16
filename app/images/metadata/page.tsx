"use client";

import { useState } from "react";
import BaseTool, { ImageFile } from "../components/BaseTool";
import piexif from "piexifjs";

interface MetadataSettings {
  title: string;
  description: string;
  author: string;
  copyright: string;
  quality: number;
}

interface MetadataResult {
  id: string;
  fileName: string;
  original: {
    title?: string;
    description?: string;
    author?: string;
    copyright?: string;
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function extractMetadata(base64: string): MetadataResult["original"] {
  try {
    const exif = piexif.load(base64);
    const zeroth = exif["0th"] || {};
    return {
      title: zeroth[piexif.ImageIFD.XPTitle] as string | undefined,
      description: zeroth[piexif.ImageIFD.ImageDescription] as string | undefined,
      author: zeroth[piexif.ImageIFD.Artist] as string | undefined,
      copyright: zeroth[piexif.ImageIFD.Copyright] as string | undefined,
    };
  } catch {
    return {};
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

export default function MetadataEditor() {
  const [settings, setSettings] = useState<MetadataSettings>({
    title: "",
    description: "",
    author: "",
    copyright: "",
    quality: 95,
  });

  const [results, setResults] = useState<MetadataResult[]>([]);

  const handleEditMetadata = async (imageFile: ImageFile): Promise<string> => {
    const dataUrl = await fileToBase64(imageFile.file);

    if (!dataUrl.startsWith("data:image/jpeg")) {
      throw new Error(
        "Metadata editing is only supported for JPEG files. Convert other formats to JPEG first."
      );
    }

    const original = extractMetadata(dataUrl);

    try {
      const exif = piexif.load(dataUrl);
      if (!exif["0th"]) exif["0th"] = {};
      const ifd0 = exif["0th"];

      const setField = (ifdField: number, value: string) => {
        if (value.trim()) {
          ifd0[ifdField] = value.trim();
        } else {
          delete ifd0[ifdField];
        }
      };

      setField(piexif.ImageIFD.ImageDescription, settings.description);
      setField(piexif.ImageIFD.Artist, settings.author);
      setField(piexif.ImageIFD.Copyright, settings.copyright);
      setField(piexif.ImageIFD.XPTitle, settings.title);

      const img = await loadImage(dataUrl);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");
      ctx.drawImage(img, 0, 0);

      const encodedDataUrl = canvas.toDataURL("image/jpeg", settings.quality / 100);
      const exifBytes = piexif.dump(exif);
      const withMeta = piexif.insert(exifBytes, encodedDataUrl);

      setResults((prev) => {
        const filtered = prev.filter((r) => r.id !== imageFile.id);
        return [
          ...filtered,
          {
            id: imageFile.id,
            fileName: imageFile.file.name,
            original,
          },
        ];
      });

      return withMeta;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to edit metadata");
    }
  };

  const handleFileRemove = (id: string) => {
    setResults((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <BaseTool
      title="Image Metadata Editor"
      description="View and edit basic EXIF metadata (title, description, artist, copyright) for JPEG images."
      icon="📊"
      onProcess={handleEditMetadata}
      onFileRemove={handleFileRemove}
    >
      {() => (
        <div className="space-y-4">
          <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Note:</strong> Metadata editing is currently supported for{" "}
              <strong>JPEG files</strong> only. Convert other formats to JPEG first.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
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
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
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
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
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
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
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
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-primary)" }}>
              Output Quality: {settings.quality}%
            </label>
            <input
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

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>
                Previous Original Metadata
              </h3>
              {results.map((result) => (
                <div
                  key={result.id}
                  className="p-3 rounded-[10px] border border-border bg-muted/20 text-xs space-y-1"
                >
                  <div className="font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                    {result.fileName}
                  </div>
                  {result.original.title && (
                    <div style={{ color: "var(--color-text-secondary)" }}>
                      <span className="font-medium">Title:</span> {result.original.title}
                    </div>
                  )}
                  {result.original.description && (
                    <div style={{ color: "var(--color-text-secondary)" }}>
                      <span className="font-medium">Description:</span> {result.original.description}
                    </div>
                  )}
                  {result.original.author && (
                    <div style={{ color: "var(--color-text-secondary)" }}>
                      <span className="font-medium">Author:</span> {result.original.author}
                    </div>
                  )}
                  {result.original.copyright && (
                    <div style={{ color: "var(--color-text-secondary)" }}>
                      <span className="font-medium">Copyright:</span> {result.original.copyright}
                    </div>
                  )}
                  {!result.original.title &&
                    !result.original.description &&
                    !result.original.author &&
                    !result.original.copyright && (
                      <div style={{ color: "var(--color-text-secondary)" }}>
                        No editable metadata found.
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}

          <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong>Tip:</strong> Leave fields empty to remove existing metadata. Add copyright and author information to protect your work.
            </p>
          </div>
        </div>
      )}
    </BaseTool>
  );
}
