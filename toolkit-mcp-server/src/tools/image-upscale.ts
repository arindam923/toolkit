import { z } from "zod";
import sharp from "sharp";
import { loadImage, getMetadata, writeImage } from "../utils/image-io.js";
import { deriveOutputPath, formatBytes } from "../utils/file-io.js";
import { successResult, errorResult } from "../utils/error-handling.js";

export const UpscaleSchema = z.object({
  input_path: z.string().describe("Path to input image file"),
  output_path: z.string().optional().describe("Path for output file. Defaults to input_path with '_upscaled' suffix"),
  scale: z.enum(["2x", "4x"]).default("2x").describe("Upscale factor: 2x or 4x"),
  enhance: z.boolean().default(true).describe("Apply sharpening and detail enhancement after upscale"),
  denoise: z.boolean().default(true).describe("Apply denoising before upscale (recommended for old photos)"),
  fix_old_photo: z.boolean().default(false).describe("Optimize for old/damaged photos: aggressive denoise + moderate sharpen"),
}).strict();

export async function imageUpscale(params: z.infer<typeof UpscaleSchema>) {
  try {
    const pipeline = await loadImage(params.input_path);
    const meta = await getMetadata(params.input_path);

    const scaleFactor = params.scale === "4x" ? 4 : 2;
    const targetWidth = meta.width * scaleFactor;
    const targetHeight = meta.height * scaleFactor;

    // Cap at reasonable max to avoid memory issues
    if (targetWidth > 16384 || targetHeight > 16384) {
      throw new Error(
        `Upscaled dimensions (${targetWidth}x${targetHeight}) exceed 16384px max. Try 2x instead.`,
      );
    }

    // Build the pipeline
    let p = pipeline;

    // Step 1: Denoise (before upscale — better results)
    if (params.fix_old_photo || params.denoise) {
      const sigma = params.fix_old_photo ? 1.5 : 0.8;
      p = p.blur(sigma);
    }

    // Step 2: Upscale with Lanczos3 (highest quality kernel)
    p = p.resize(targetWidth, targetHeight, {
      kernel: "lanczos3",
      fastShrinkOnLoad: false,
    });

    // Step 3: Sharpen / enhance details
    if (params.fix_old_photo || params.enhance) {
      const sigma = params.fix_old_photo ? 0.6 : 0.8;
      p = p.sharpen(sigma);
    }

    // Step 4: Slight contrast/saturation boost for old photos
    if (params.fix_old_photo) {
      p = p.modulate({ brightness: 1.05, saturation: 1.15 });
    }

    const outputPath = params.output_path ?? deriveOutputPath(params.input_path, "_upscaled");
    const { outputSize } = await writeImage(p, outputPath);

    const enhancements: string[] = [];
    if (params.fix_old_photo) enhancements.push("old-photo-restore");
    else {
      if (params.denoise) enhancements.push("denoise");
      if (params.enhance) enhancements.push("sharpen");
    }

    return successResult(
      `Upscaled image ${params.scale} with high-quality Lanczos3 kernel\nSaved to ${outputPath}\nDimensions: ${meta.width}x${meta.height} → ${targetWidth}x${targetHeight}\nEnhancements: ${enhancements.join(", ") || "none"}\nSize: ${formatBytes(meta.size)} → ${formatBytes(outputSize)}`,
      {
        success: true,
        output_path: outputPath,
        scale: params.scale,
        original_dimensions: { width: meta.width, height: meta.height },
        new_dimensions: { width: targetWidth, height: targetHeight },
        enhancements,
        original_size_bytes: meta.size,
        new_size_bytes: outputSize,
      },
    );
  } catch (error) {
    return errorResult(error);
  }
}
