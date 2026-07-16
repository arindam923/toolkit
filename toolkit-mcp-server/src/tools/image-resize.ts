import { z } from "zod";
import { loadImage, getMetadata, applyResize, writeImage } from "../utils/image-io.js";
import { deriveOutputPath, formatBytes } from "../utils/file-io.js";
import { successResult, errorResult } from "../utils/error-handling.js";
import { RESIZE_PRESETS, ResizePresetSchema, MAX_DIMENSION, DEFAULT_QUALITY } from "../constants.js";
import type { FitMode } from "../types.js";

export const ResizeSchema = z.object({
  input_path: z.string().describe("Path to input image file (JPG, PNG, WebP, AVIF, TIFF, GIF)"),
  output_path: z.string().optional().describe("Path for output file. Defaults to input_path with '_resized' suffix"),
  width: z.number().int().min(1).max(MAX_DIMENSION).optional().describe("Target width in pixels"),
  height: z.number().int().min(1).max(MAX_DIMENSION).optional().describe("Target height in pixels"),
  scale_percent: z.number().min(1).max(1000).optional().describe("Scale by percentage (e.g. 50 = half size)"),
  preset: ResizePresetSchema.optional().describe("Quick preset: social=1080x1080, web=1200x800, print=2400x1800, thumbnail=300x200"),
  fit: z.enum(["cover", "contain", "fill", "inside", "outside"]).default("cover").describe("Resize fit mode"),
  maintain_aspect: z.boolean().default(true).describe("Maintain aspect ratio when resizing"),
  quality: z.number().int().min(1).max(100).default(DEFAULT_QUALITY).describe("Output quality (1-100)"),
}).strict().refine(
  (v) => v.width || v.height || v.scale_percent || v.preset,
  { message: "Provide at least one of: width, height, scale_percent, or preset" },
);

export async function imageResize(params: z.infer<typeof ResizeSchema>) {
  try {
    const pipeline = await loadImage(params.input_path);
    const meta = await getMetadata(params.input_path);

    let targetWidth = params.width;
    let targetHeight = params.height;

    if (params.preset) {
      targetWidth = RESIZE_PRESETS[params.preset].width;
      targetHeight = RESIZE_PRESETS[params.preset].height;
    }

    if (params.scale_percent) {
      targetWidth = Math.round(meta.width * (params.scale_percent / 100));
      targetHeight = Math.round(meta.height * (params.scale_percent / 100));
    }

    const resized = applyResize(pipeline, {
      width: targetWidth,
      height: targetHeight,
      fit: (params.fit as FitMode) || "cover",
      maintainAspect: params.maintain_aspect,
      withoutEnlargement: true,
    });

    const outputPath = params.output_path ?? deriveOutputPath(params.input_path, "_resized");
    const { outputSize } = await writeImage(resized, outputPath);

    return successResult(
      `Resized image saved to ${outputPath}\nDimensions: ${meta.width}x${meta.height} → ${targetWidth ?? "auto"}x${targetHeight ?? "auto"}\nSize: ${formatBytes(meta.size)} → ${formatBytes(outputSize)}`,
      {
        success: true,
        output_path: outputPath,
        original_dimensions: { width: meta.width, height: meta.height },
        new_dimensions: { width: targetWidth, height: targetHeight },
        original_size_bytes: meta.size,
        new_size_bytes: outputSize,
      },
    );
  } catch (error) {
    return errorResult(error);
  }
}