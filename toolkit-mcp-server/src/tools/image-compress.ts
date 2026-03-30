import sharp from "sharp";
import { z } from "zod";
import {
  validateInputPath,
  defaultOutputPath,
  ensureDir,
  fileSize,
  formatBytes,
} from "../utils/file-io.js";
import { getImageMetadata } from "../utils/image-io.js";
import { toolError, toolSuccess } from "../utils/error-handling.js";
import { COMPRESS_PRESETS } from "../constants.js";

export const ImageCompressSchema = z
  .object({
    input_path: z.string().describe("Path to input image file"),
    output_path: z
      .string()
      .optional()
      .describe("Output file path (default: input_path with '_compressed' suffix)"),
    quality: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(80)
      .describe("Compression quality (1=smallest, 100=best)"),
    max_width: z
      .number()
      .int()
      .min(1)
      .max(16384)
      .optional()
      .describe("Max width — larger images are scaled down"),
    max_height: z
      .number()
      .int()
      .min(1)
      .max(16384)
      .optional()
      .describe("Max height — larger images are scaled down"),
    format: z
      .enum(["jpeg", "png", "webp"])
      .optional()
      .describe("Output format (default: same as input)"),
    preset: z
      .enum(["web_optimized", "email", "social_media", "thumbnail"])
      .optional()
      .describe(
        "Compression preset: web_optimized (80% quality, WebP, max 1200w), email (60%, max 800w), social_media (85%, max 1080w), thumbnail (70%, max 300w)",
      ),
  })
  .strict();

export type ImageCompressInput = z.infer<typeof ImageCompressSchema>;

export async function imageCompress(params: ImageCompressInput) {
  const validation = validateInputPath(params.input_path);
  if (!validation.valid) return toolError(validation.error!);

  const inputMeta = await getImageMetadata(params.input_path);
  const inputSize = fileSize(params.input_path);

  // Apply preset overrides
  let quality = params.quality;
  let maxWidth = params.max_width;
  let format = params.format;

  if (params.preset) {
    const preset = COMPRESS_PRESETS[params.preset];
    quality = preset.quality;
    if (preset.maxWidth) maxWidth = preset.maxWidth;
    if (preset.format) format = preset.format as "jpeg" | "png" | "webp";
  }

  const outputFormat = format ?? (inputMeta.format as string);
  const ext =
    outputFormat === "jpeg"
      ? ".jpg"
      : outputFormat === "png"
        ? ".png"
        : ".webp";

  const outputPath = params.output_path
    ? params.output_path
    : defaultOutputPath(params.input_path, "compressed").replace(
        /\.[^.]+$/,
        ext,
      );
  await ensureDir(outputPath);

  let pipeline = sharp(params.input_path);

  // Resize if max dimensions set
  if (maxWidth || params.max_height) {
    pipeline = pipeline.resize({
      width: maxWidth,
      height: params.max_height,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Apply format compression
  switch (outputFormat) {
    case "jpeg":
    case "jpg":
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      break;
    case "png":
      pipeline = pipeline.png({ compressionLevel: Math.round((100 - quality) / 11) });
      break;
    case "webp":
      pipeline = pipeline.webp({ quality });
      break;
    default:
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  }

  const info = await pipeline.toFile(outputPath);
  const outputSize = fileSize(outputPath);
  const savings = Math.round((1 - outputSize / inputSize) * 100);

  const summary = [
    `Compressed image saved to ${outputPath}`,
    `Format: ${info.format} | Quality: ${quality}%`,
    `Dimensions: ${inputMeta.width}×${inputMeta.height} → ${info.width}×${info.height}`,
    `Size: ${formatBytes(inputSize)} → ${formatBytes(outputSize)} (${savings > 0 ? `−${savings}%` : `+${Math.abs(savings)}%`})`,
  ].join("\n");

  return toolSuccess(summary, {
    success: true,
    output_path: outputPath,
    format: info.format,
    quality,
    original_dimensions: { width: inputMeta.width, height: inputMeta.height },
    new_dimensions: { width: info.width, height: info.height },
    original_size_bytes: inputSize,
    new_size_bytes: outputSize,
    savings_percent: savings,
  });
}
