import { z } from "zod";
import sharp from "sharp";
import { loadImage, getMetadata } from "../utils/image-io.js";
import { successResult, errorResult } from "../utils/error-handling.js";
import { getFileSize, formatBytes } from "../utils/file-io.js";

export const ExtractColorsSchema = z.object({
  input_path: z.string().describe("Path to input image file"),
  count: z.number().int().min(1).max(16).default(6).describe("Number of dominant colors to extract (1-16, default 6)"),
  format: z.enum(["hex", "rgb", "hsl", "all"]).default("all").describe("Output color format"),
}).strict();

interface RGB { r: number; g: number; b: number }
interface HSL { h: number; s: number; l: number }

function rgbToHex({ r, g, b }: RGB): string {
  return "#" + [r, g, b].map(c => c.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0, s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
      case gn: h = ((bn - rn) / d + 2) / 6; break;
      case bn: h = ((rn - gn) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Simple k-means clustering for RGB pixel data.
 * Runs for a fixed number of iterations — fast enough for a small thumbnail.
 */
function kMeans(pixels: RGB[], k: number, maxIter = 20): RGB[] {
  if (pixels.length === 0) return [];
  if (pixels.length <= k) return pixels.slice();

  // Initialize centroids by picking evenly-spaced pixels
  let centroids: RGB[] = [];
  const step = Math.floor(pixels.length / k);
  for (let i = 0; i < k; i++) {
    centroids.push({ ...pixels[i * step] });
  }

  let assignments = new Int32Array(pixels.length);

  for (let iter = 0; iter < maxIter; iter++) {
    // Assign each pixel to nearest centroid
    let changed = false;
    for (let i = 0; i < pixels.length; i++) {
      const p = pixels[i];
      let minDist = Infinity;
      let minIdx = 0;
      for (let c = 0; c < centroids.length; c++) {
        const dr = p.r - centroids[c].r;
        const dg = p.g - centroids[c].g;
        const db = p.b - centroids[c].b;
        const dist = dr * dr + dg * dg + db * db;
        if (dist < minDist) { minDist = dist; minIdx = c; }
      }
      if (assignments[i] !== minIdx) { assignments[i] = minIdx; changed = true; }
    }

    if (!changed) break;

    // Recompute centroids
    const sums = centroids.map(() => ({ r: 0, g: 0, b: 0 }));
    const counts = new Array(centroids.length).fill(0);
    for (let i = 0; i < pixels.length; i++) {
      const c = assignments[i];
      sums[c].r += pixels[i].r;
      sums[c].g += pixels[i].g;
      sums[c].b += pixels[i].b;
      counts[c]++;
    }
    for (let c = 0; c < centroids.length; c++) {
      if (counts[c] > 0) {
        centroids[c] = {
          r: Math.round(sums[c].r / counts[c]),
          g: Math.round(sums[c].g / counts[c]),
          b: Math.round(sums[c].b / counts[c]),
        };
      }
    }
  }

  // Sort by cluster size (largest first)
  const counts = new Array(centroids.length).fill(0);
  for (let i = 0; i < assignments.length; i++) counts[assignments[i]]++;

  const indexed = centroids.map((c, i) => ({ color: c, count: counts[i] }));
  indexed.sort((a, b) => b.count - a.count);
  return indexed.map(x => x.color);
}

function formatColor(color: RGB, format: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (format === "hex" || format === "all") result.hex = rgbToHex(color);
  if (format === "rgb" || format === "all") result.rgb = `rgb(${color.r}, ${color.g}, ${color.b})`;
  if (format === "hsl" || format === "all") {
    const hsl = rgbToHsl(color);
    result.hsl = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  }
  return result;
}

export async function imageExtractColors(params: z.infer<typeof ExtractColorsSchema>) {
  try {
    // Load and validate the image
    await loadImage(params.input_path);
    const meta = await getMetadata(params.input_path);

    // Shrink to a small thumbnail for fast pixel sampling
    const thumbBuf = await sharp(params.input_path)
      .resize(150, 150, { fit: "inside", withoutEnlargement: true })
      .removeAlpha()
      .raw()
      .toBuffer();

    // Parse pixels from raw buffer (RGB, 3 channels)
    const pixels: RGB[] = [];
    for (let i = 0; i < thumbBuf.length; i += 3) {
      pixels.push({ r: thumbBuf[i], g: thumbBuf[i + 1], b: thumbBuf[i + 2] });
    }

    // Cluster pixels into dominant colors
    const dominantColors = kMeans(pixels, params.count);

    // Format output
    const colors = dominantColors.map((c, i) => ({
      rank: i + 1,
      ...formatColor(c, params.format),
    }));

    const colorLines = colors.map(c => {
      const parts = Object.entries(c).filter(([k]) => k !== "rank").map(([, v]) => v);
      return `  ${c.rank}. ${parts.join(" | ")}`;
    }).join("\n");

    const fileSize = await getFileSize(params.input_path);

    return successResult(
      `Extracted ${params.count} dominant colors from ${params.input_path}\nDimensions: ${meta.width}x${meta.height}, Format: ${meta.format}, Size: ${formatBytes(fileSize)}\n\n${colorLines}`,
      {
        success: true,
        input_path: params.input_path,
        color_count: params.count,
        colors,
        image_dimensions: { width: meta.width, height: meta.height },
        image_format: meta.format,
      },
    );
  } catch (error) {
    return errorResult(error);
  }
}
