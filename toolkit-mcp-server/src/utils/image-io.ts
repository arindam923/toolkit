import sharp from "sharp";
import { promises as fs } from "node:fs";
import { fileExists, getFileSize } from "./file-io.js";
import type { ImageMetadata, ResizeOptions, CompressOptions, CropOptions, RotateOptions, FilterOptions } from "../types.js";
import { MAX_FILE_SIZE_BYTES, SUPPORTED_INPUT_FORMATS } from "../constants.js";

const FORMAT_NORMALIZE: Record<string, string> = {
  jpg: "jpeg",
  jpeg: "jpeg",
  png: "png",
  webp: "webp",
  avif: "avif",
  tiff: "tiff",
  gif: "gif",
};

function normalizeFormat(format: string | undefined): string | undefined {
  if (!format) return undefined;
  return FORMAT_NORMALIZE[format.toLowerCase()] ?? format.toLowerCase();
}

export async function loadImage(inputPath: string): Promise<sharp.Sharp> {
  if (!(await fileExists(inputPath))) {
    throw new Error(`Input file not found: ${inputPath}`);
  }
  const size = await getFileSize(inputPath);
  if (size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `Input file too large (${(size / 1024 / 1024).toFixed(2)} MB). Max allowed: ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.`,
    );
  }
  const pipeline = sharp(inputPath, { failOn: "truncated" });
  const meta = await pipeline.metadata().catch(() => {
    throw new Error(
      `Cannot read image metadata for ${inputPath}. Supported formats: ${SUPPORTED_INPUT_FORMATS.join(", ")}.`,
    );
  });
  const normalized = normalizeFormat(meta.format);
  if (!normalized || !SUPPORTED_INPUT_FORMATS.includes(normalized as typeof SUPPORTED_INPUT_FORMATS[number])) {
    throw new Error(
      `Unsupported input format "${meta.format}". Supported: ${SUPPORTED_INPUT_FORMATS.join(", ")}.`,
    );
  }
  return pipeline;
}

export async function getMetadata(inputPath: string): Promise<ImageMetadata> {
  const pipeline = await loadImage(inputPath);
  const m = await pipeline.metadata();
  const size = await getFileSize(inputPath);
  return {
    width: m.width ?? 0,
    height: m.height ?? 0,
    channels: m.channels ?? 0,
    format: m.format ?? "unknown",
    size,
    density: m.density ?? 0,
    hasAlpha: m.hasAlpha ?? false,
    isProgressive: m.isProgressive ?? false,
  };
}

export async function writeImage(
  pipeline: sharp.Sharp,
  outputPath: string,
): Promise<{ outputPath: string; outputSize: number }> {
  const { default: path } = await import("node:path");
  const dir = path.dirname(outputPath);
  await fs.mkdir(dir, { recursive: true });
  const info = await pipeline.toFile(outputPath);
  const outputSize = await getFileSize(outputPath);
  return { outputPath, outputSize, ...info } as never;
}

export function applyResize(pipeline: sharp.Sharp, opts: ResizeOptions): sharp.Sharp {
  return pipeline.resize({
    width: opts.width,
    height: opts.height,
    fit: opts.fit,
    withoutEnlargement: opts.withoutEnlargement,
  });
}

export function applyCompress(pipeline: sharp.Sharp, opts: CompressOptions): sharp.Sharp {
  let p = pipeline;
  if (opts.maxWidth) {
    p = p.resize({ width: opts.maxWidth, withoutEnlargement: true });
  }
  switch (opts.outputFormat) {
    case "jpeg":
      return p.jpeg({ quality: opts.quality, progressive: opts.progressive ?? true, mozjpeg: true });
    case "webp":
      return p.webp({ quality: opts.quality });
    case "png":
      return p.png({ quality: opts.quality, compressionLevel: 9, palette: true });
    case "avif":
      return p.avif({ quality: opts.quality });
    default:
      return p;
  }
}

export function applyCrop(pipeline: sharp.Sharp, opts: CropOptions): sharp.Sharp {
  return pipeline.extract({
    left: opts.left,
    top: opts.top,
    width: opts.width,
    height: opts.height,
  });
}

export function applyRotate(pipeline: sharp.Sharp, opts: RotateOptions): sharp.Sharp {
  let p = pipeline.rotate(opts.degrees);
  if (opts.flipHorizontal) p = p.flop();
  if (opts.flipVertical) p = p.flip();
  return p;
}

export function applyFilter(pipeline: sharp.Sharp, opts: FilterOptions): sharp.Sharp {
  let p = pipeline;
  const modulate: { brightness?: number; saturation?: number } = {};
  if (opts.brightness !== undefined) modulate.brightness = opts.brightness / 100;
  if (opts.saturation !== undefined) modulate.saturation = opts.saturation / 100;
  if (Object.keys(modulate).length > 0) p = p.modulate(modulate);
  if (opts.contrast !== undefined && opts.contrast !== 100) {
    // linear(): output = input * a + b, so contrast as %:
    // a = contrast/100, b = 0.5 * (1 - contrast/100)
    const a = opts.contrast / 100;
    const b = 0.5 * (1 - a);
    p = p.linear(a, b);
  }
  if (opts.blur !== undefined && opts.blur > 0) p = p.blur(opts.blur);
  if (opts.grayscale !== undefined && opts.grayscale >= 100) {
    p = p.grayscale();
  }
  return p;
}

export function toFormatPipeline(pipeline: sharp.Sharp, format: string, quality = 90): sharp.Sharp {
  switch (format.toLowerCase()) {
    case "jpeg":
    case "jpg":
      return pipeline.jpeg({ quality, mozjpeg: true, progressive: true });
    case "png":
      return pipeline.png({ compressionLevel: 9, palette: true });
    case "webp":
      return pipeline.webp({ quality });
    case "avif":
      return pipeline.avif({ quality });
    case "tiff":
      return pipeline.tiff({ quality });
    default:
      return pipeline;
  }
}

export interface EffectPreset {
  grayscale?: number;
  sepia?: number;
  brightness?: number;
  saturation?: number;
  contrast?: number;
  blue_shift?: number;
  edge?: boolean;
}

export function applyEffects(
  pipeline: sharp.Sharp,
  preset: EffectPreset,
  intensity: number,
): sharp.Sharp {
  const t = intensity / 100;
  let p = pipeline;

  if (preset.edge) {
    p = p.convolve({
      width: 3,
      height: 3,
      kernel: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
    });
    return p;
  }

  if (preset.grayscale && preset.grayscale >= 100) {
    p = p.grayscale();
  }

  if (preset.sepia && preset.sepia > 0) {
    const sepiaStrength = (preset.sepia / 100) * t;
    const r = Math.round(112 * sepiaStrength + 255 * (1 - sepiaStrength));
    const g = Math.round(66 * sepiaStrength + 255 * (1 - sepiaStrength));
    const b = Math.round(20 * sepiaStrength + 255 * (1 - sepiaStrength));
    p = p.tint({ r, g, b });
  }

  if (preset.blue_shift && preset.blue_shift > 0) {
    const shift = (preset.blue_shift / 100) * t;
    const r = Math.round(200 * (1 - shift) + 255 * shift);
    const g = Math.round(220 * (1 - shift) + 255 * shift);
    const b = 255;
    p = p.tint({ r, g, b });
  }

  if (preset.brightness !== undefined && preset.brightness !== 100) {
    const adjusted = 1 + ((preset.brightness - 100) / 100) * t;
    p = p.modulate({ brightness: adjusted });
  }

  if (preset.saturation !== undefined && preset.saturation !== 100) {
    const adjusted = 1 + ((preset.saturation - 100) / 100) * t;
    p = p.modulate({ saturation: adjusted });
  }

  if (preset.contrast !== undefined && preset.contrast !== 100) {
    const adjusted = 1 + ((preset.contrast - 100) / 100) * t;
    const b = 0.5 * (1 - adjusted);
    p = p.linear(adjusted, b);
  }

  return p;
}
