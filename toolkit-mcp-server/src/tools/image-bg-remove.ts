import { z } from "zod";
import sharp from "sharp";
import { pipeline } from "@huggingface/transformers";
import { getMetadata, writeImage } from "../utils/image-io.js";
import { deriveOutputPath, formatBytes } from "../utils/file-io.js";
import { successResult, errorResult } from "../utils/error-handling.js";

// Lazy-load the model — first call downloads and caches it
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let segmentationPipeline: any = null;

async function getSegmentationPipeline() {
  if (!segmentationPipeline) {
    segmentationPipeline = await pipeline(
      "image-segmentation",
      "Xenova/segformer-b0-finetuned-ade-512-512",
      { device: "cpu" },
    );
  }
  return segmentationPipeline;
}

export const BgRemoveSchema = z.object({
  input_path: z.string().describe("Path to input image file"),
  output_path: z.string().optional().describe("Path for output file. Defaults to input_path with '_nobg.png'"),
  threshold: z.number().min(0).max(1).default(0.5).describe("Segmentation confidence threshold (0-1, default 0.5). Lower = more aggressive removal"),
  feather: z.number().min(0).max(20).default(2).describe("Feather edges by N pixels for smoother compositing (0-20, default 2)"),
  invert: z.boolean().default(false).describe("Invert: remove the main subject instead of the background"),
}).strict();

interface SegmentationResult {
  label: string;
  score: number;
  mask: { width: number; height: number; data: Uint8Array };
}

export async function imageBgRemove(params: z.infer<typeof BgRemoveSchema>) {
  try {
    const meta = await getMetadata(params.input_path);

    // Load the image as raw RGBA for pixel manipulation
    const rawImage = await sharp(params.input_path)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = rawImage;
    const { width, height, channels } = info;

    // Run AI segmentation — the model returns segmentation masks
    const segmenter = await getSegmentationPipeline();
    const rawResult = await segmenter(params.input_path, { threshold: params.threshold });
    const result = (Array.isArray(rawResult) ? rawResult : [rawResult]) as SegmentationResult[];

    // Background-like class labels to exclude from the foreground mask
    const backgroundLabels = new Set(["background", "wall", "floor", "sky", "grass", "road", "street"]);

    // Build a composite foreground mask at the model's resolution
    let modelWidth = 0;
    let modelHeight = 0;
    let fgMask: Uint8Array | null = null;

    for (const segment of result) {
      if (backgroundLabels.has(segment.label.toLowerCase())) continue;

      const mask = segment.mask;
      if (!fgMask) {
        modelWidth = mask.width;
        modelHeight = mask.height;
        fgMask = new Uint8Array(modelWidth * modelHeight);
      }

      // Union this segment's mask into the foreground mask
      const maskData = mask.data;
      for (let i = 0; i < fgMask.length; i++) {
        if (maskData[i] > 128) fgMask[i] = 255;
      }
    }

    // If no foreground found, try taking all non-background segments
    if (!fgMask || fgMask.every(v => v === 0)) {
      for (const segment of result) {
        const mask = segment.mask;
        if (!fgMask) {
          modelWidth = mask.width;
          modelHeight = mask.height;
          fgMask = new Uint8Array(modelWidth * modelHeight);
        }
        const maskData = mask.data;
        for (let i = 0; i < fgMask.length; i++) {
          if (maskData[i] > 128) fgMask[i] = 255;
        }
      }
    }

    // Apply invert option
    if (params.invert && fgMask) {
      for (let i = 0; i < fgMask.length; i++) {
        fgMask[i] = fgMask[i] > 0 ? 0 : 255;
      }
    }

    // If we still have no mask, fall back to no-op with warning
    if (!fgMask) {
      const outputPath = params.output_path ?? deriveOutputPath(params.input_path, "_nobg", "png");
      await sharp(params.input_path).ensureAlpha().toFile(outputPath);
      return successResult(
        `Background removal completed (best-effort)\nNo clear foreground detected — saved original with alpha channel\nSaved to ${outputPath}`,
        {
          success: true,
          output_path: outputPath,
          original_dimensions: { width, height },
          original_size_bytes: meta.size,
          warning: "No foreground segment detected",
        },
      );
    }

    // Upscale the mask from model resolution to original image resolution
    const upscaledMask = await sharp(Buffer.from(fgMask.buffer, fgMask.byteOffset, fgMask.byteLength), {
      raw: { width: modelWidth, height: modelHeight, channels: 1 },
    })
      .resize(width, height, { kernel: "lanczos3" })
      .raw()
      .toBuffer();

    // Optionally feather the edges
    let alphaMask: Buffer;
    if (params.feather > 0) {
      alphaMask = await sharp(upscaledMask, {
        raw: { width, height, channels: 1 },
      })
        .blur(params.feather)
        .raw()
        .toBuffer();
    } else {
      alphaMask = upscaledMask;
    }

    // Apply alpha mask to the original RGBA image data
    const outputData = Buffer.alloc(data.length);
    data.copy(outputData);
    for (let i = 0; i < width * height; i++) {
      outputData[i * channels + 3] = alphaMask[i];
    }

    // Write the result as PNG (supports transparency)
    const outputPath = params.output_path ?? deriveOutputPath(params.input_path, "_nobg", "png");
    const resultPipeline = sharp(outputData, {
      raw: { width, height, channels },
    }).png();

    const { outputSize } = await writeImage(resultPipeline, outputPath);

    return successResult(
      `Background removed with AI segmentation\nSaved to ${outputPath}\nDimensions: ${width}x${height}\nSegments found: ${result.length}\nSize: ${formatBytes(meta.size)} → ${formatBytes(outputSize)}`,
      {
        success: true,
        output_path: outputPath,
        original_dimensions: { width, height },
        segments_detected: result.length,
        threshold: params.threshold,
        feather: params.feather,
        original_size_bytes: meta.size,
        new_size_bytes: outputSize,
        output_format: "png",
      },
    );
  } catch (error) {
    return errorResult(error);
  }
}
