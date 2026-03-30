"use client";

import { useState } from "react";
import BaseTool from "../components/BaseTool";
import type { ImageFile } from "../components/BaseTool";

interface PaletteItem {
  hex: string;
  role: string;
}

interface TypographyItem {
  name: string;
  role: string;
  weight: string;
  preview: string;
  notes: string;
}

interface DesignSystemResult {
  palette: PaletteItem[];
  typography: TypographyItem[];
  designNotes: string;
}

interface PerFileResult extends DesignSystemResult {
  id: string;
  fileName: string;
}

const EMPTY_RESULT: DesignSystemResult = {
  palette: [],
  typography: [],
  designNotes: "",
};

function fallbackAnalyze(
  imageFile: ImageFile,
): DesignSystemResult {
  // Local fallback when API key isn't available:
  // infer a tiny placeholder result from filename only.
  const baseName = imageFile.file.name.replace(
    /\.[^.]+$/,
    "",
  );
  return {
    palette: [
      { hex: "#0F172A", role: "Primary Background" },
      { hex: "#1E293B", role: "Secondary Surface" },
      { hex: "#334155", role: "Border / Divider" },
      { hex: "#E2E8F0", role: "Primary Text" },
      { hex: "#22C55E", role: "Accent / CTA" },
    ],
    typography: [
      {
        name: "Inter",
        role: "Body / UI",
        weight: "400 Regular",
        preview: "Clear, neutral interface body text.",
        notes:
          "Practical sans-serif suited for dense UI layouts.",
      },
      {
        name: "Inter",
        role: "Heading",
        weight: "700 Bold",
        preview:
          "Strong, readable hierarchy for section titles.",
        notes:
          "Bold weights provide structure and scanning clarity.",
      },
    ],
    designNotes:
      `Fallback analysis generated for “${baseName}”. ` +
      "Add an Anthropic API key to get screenshot-specific palette and typography extraction.",
  };
}

export default function DesignSystemGeneratorPage() {
  const [results, setResults] = useState<PerFileResult[]>(
    [],
  );
  const [copyHint, setCopyHint] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const hasServerRoute = true;

  const handleAnalyze = async (
    imageFile: ImageFile,
  ): Promise<string> => {
    setError(null);
    setIsAnalyzing(true);

    const reader = new FileReader();

    const toDataUrl = (): Promise<string> =>
      new Promise((resolve, reject) => {
        reader.onload = () =>
          resolve(String(reader.result || ""));
        reader.onerror = () =>
          reject(new Error("Failed to read image file"));
        reader.readAsDataURL(imageFile.file);
      });

    try {
      const dataUrl = await toDataUrl();

      let analyzed: DesignSystemResult = EMPTY_RESULT;

      if (!hasServerRoute) {
        analyzed = fallbackAnalyze(imageFile);
      } else {
        const base64Image = dataUrl.split(",")[1] || "";
        const mediaType =
          imageFile.file.type || "image/png";

        const res = await fetch(
          "/api/design-system-generator",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              base64Image,
              mediaType,
            }),
          },
        );

        if (!res.ok) {
          const details = await res.text();
          throw new Error(
            `API request failed (${res.status}): ${details}`,
          );
        }

        const data =
          (await res.json()) as Partial<DesignSystemResult>;
        analyzed = {
          palette: Array.isArray(data.palette)
            ? data.palette
            : [],
          typography: Array.isArray(data.typography)
            ? data.typography
            : [],
          designNotes:
            typeof data.designNotes === "string"
              ? data.designNotes
              : "",
        };
      }

      setResults((prev) => {
        const next: PerFileResult = {
          id: imageFile.id,
          fileName: imageFile.file.name,
          palette: analyzed.palette,
          typography: analyzed.typography,
          designNotes: analyzed.designNotes,
        };

        const existingIndex = prev.findIndex(
          (p) => p.id === imageFile.id,
        );
        if (existingIndex === -1) return [...prev, next];

        const cloned = [...prev];
        cloned[existingIndex] = next;
        return cloned;
      });

      return dataUrl;
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Failed to analyze screenshot";
      setError(message);
      throw new Error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileRemove = (id: string) => {
    setResults((prev) => prev.filter((r) => r.id !== id));
  };

  const copyHex = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopyHint(`Copied ${hex}`);
      setTimeout(() => setCopyHint(""), 1400);
    } catch {
      setCopyHint("Clipboard not available");
      setTimeout(() => setCopyHint(""), 1400);
    }
  };

  return (
    <BaseTool
      title="Design System Generator"
      description="Upload UI screenshots to extract palette, typography, and actionable design notes."
      icon="🧬"
      onProcess={handleAnalyze}
      onFileRemove={handleFileRemove}
    >
      {() => (
        <div className="space-y-4">
          {!hasServerRoute && (
            <div
              className="p-3 rounded-[10px] text-xs"
              style={{
                background: "rgba(255,185,0,0.12)",
                border: "1px solid rgba(255,185,0,0.3)",
                color: "var(--color-text-primary)",
              }}
            >
              <strong>Server route unavailable:</strong>{" "}
              this tool will use local fallback output.
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="p-4 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground leading-relaxed">
            <span className="mono-label text-foreground mr-2">Guide</span>
            Click <strong>Process Images</strong> after uploading. Each screenshot gets 
            <span className="text-foreground font-medium mx-1">5–8 palette colors</span>, 
            <span className="text-foreground font-medium mx-1">2–4 typography styles</span>, 
            and concise design observations.
          </div>

          {isAnalyzing && (
            <div className="p-4 rounded-xl border border-border bg-muted/20 animate-pulse flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-accent animate-ping" />
              <div className="mono-label text-foreground">Analyzing screenshot design system…</div>
            </div>
          )}

          {copyHint && (
            <div className="flex items-center gap-2 text-emerald-500">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <div className="mono-label text-xs font-bold">{copyHint}</div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <h3
                className="font-display text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground/60 mb-6"
              >
                Generated Design Systems
              </h3>

              {results.map((item) => (
                <div
                  key={item.id}
                  className="p-6 rounded-[20px] space-y-8 border border-border bg-muted/5 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="mono-label text-brand-accent text-[8px]">Source</div>
                      <div className="text-lg font-display font-medium tracking-tight">
                        {item.fileName}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="mono-label text-muted-foreground/30 border-b border-border pb-1.5 text-[9px]">
                      01 / Palette
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {item.palette.map((c) => (
                        <button
                          type="button"
                          key={`${item.id}-${c.hex}-${c.role}`}
                          onClick={() => copyHex(c.hex)}
                          className="group flex flex-col p-2.5 rounded-xl border border-border bg-background hover:border-brand-accent/30 transition-all text-left"
                          title={`Copy ${c.hex}`}
                        >
                          <div
                            className="aspect-square w-full rounded-lg mb-2 relative overflow-hidden border border-black/5 shadow-inner"
                            style={{ background: c.hex }}
                          >
                             <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-lg" />
                          </div>
                          <div className="min-w-0 pr-1">
                            <div className="font-mono text-[10px] font-bold text-foreground mb-0.5">
                              {c.hex.toUpperCase()}
                            </div>
                            <div className="mono-label text-[8px] text-muted-foreground truncate opacity-60 group-hover:opacity-100">
                              {c.role}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="mono-label text-muted-foreground/30 border-b border-border pb-1.5 text-[9px]">
                      02 / Typography
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {item.typography.map((t) => (
                        <div
                          key={`${item.id}-${t.name}-${t.role}-${t.weight}`}
                          className="group p-4 rounded-xl border border-border bg-background hover:bg-muted/5 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-none">
                              <div className="w-10 h-10 rounded-lg bg-foreground text-background flex items-center justify-center font-display font-medium text-lg">
                                {t.name.charAt(0)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-1">
                                  <div className="text-sm font-display font-bold text-foreground">
                                    {t.name}
                                  </div>
                                  <div className="mono-label text-brand-accent text-[9px]">
                                    {t.role}
                                  </div>
                                </div>
                              <div 
                                className="text-lg font-medium tracking-tight text-foreground truncate max-w-full"
                                style={{ fontFamily: t.name.includes(' ') ? `'${t.name}'` : t.name }}
                              >
                                {t.preview}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="mono-label text-muted-foreground/30 border-b border-border pb-1.5 text-[9px]">
                      03 / Notes
                    </div>
                    <div
                      className="p-4 rounded-xl text-xs leading-relaxed border border-border bg-background text-foreground relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent/30" />
                      <div className="relative z-10 italic opacity-80">
                        {item.designNotes || "No notes extracted."}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </BaseTool>
  );
}
