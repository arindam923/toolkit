import { z } from "zod";
import { loadImage, getMetadata, applyCompress, writeImage, toFormatPipeline, applyRotate, applyFilter } from "../utils/image-io.js";
import { deriveOutputPath, formatBytes } from "../utils/file-io.js";
import { successResult, errorResult } from "../utils/error-handling.js";
import {
  COMPRESS_PRESETS,
  CompressPresetSchema,
  DEFAULT_QUALITY,
  CropAspectPresetSchema,
  MAX_DIMENSION,
  FILTER_PRESETS,
  FilterPresetSchema,
} from "../constants.js";

export const CompressSchema = z.object({
  input_path: z.string().describe("Path to input image file"),
  output_path: z.string().optional().describe("Path for output file. Defaults to input_path with '_compressed' and appropriate extension"),
  quality: z.number().int().min(1).max(100).optional().describe("Output quality (1-100). Override preset or use default 80"),
  output_format: z.enum(["jpeg", "webp", "png", "avif"]).optional().describe("Output format. Defaults to webp (best compression)"),
  max_width: z.number().int().min(1).max(16384).optional().describe("Max width in pixels. Image scaled down if larger"),
  progressive: z.boolean().default(true).describe("Use progressive encoding for JPEG (smaller, slower decode)"),
  preset: CompressPresetSchema.optional().describe("Quick preset: web_optimized, email, social_media, thumbnail"),
}).strict().refine(
  (v) => v.quality || v.output_format || v.preset || v.max_width || true,
  { message: "Unreachable" },
);

export async function imageCompress(params: z.infer<typeof CompressSchema>) {
  try {
    const pipeline = await loadImage(params.input_path);
    const meta = await getMetadata(params.input_path);

    let quality = params.quality ?? DEFAULT_QUALITY;
    let outputFormat: "jpeg" | "webp" | "png" | "avif" = params.output_format ?? "webp";
    let maxWidth = params.max_width;

    if (params.preset) {
      const p = COMPRESS_PRESETS[params.preset];
      quality = p.quality;
      outputFormat = p.output_format;
      maxWidth = maxWidth ?? p.max_width;
    }

    const compressed = applyCompress(pipeline, {
      quality,
      outputFormat,
      maxWidth,
      progressive: params.progressive,
    });

    const ext = outputFormat === "jpeg" ? "jpg" : outputFormat;
    const outputPath = params.output_path ?? deriveOutputPath(params.input_path, "_compressed", ext);
    const { outputSize } = await writeImage(compressed, outputPath);

    const reduction = meta.size > 0 ? Math.round((1 - outputSize / meta.size) * 100) : 0;

    return successResult(
      `Compressed image saved to ${outputPath}\nSize: ${formatBytes(meta.size)} → ${formatBytes(outputSize)} (${reduction}% smaller)\nFormat: ${meta.format} → ${outputFormat}`,
      {
        success: true,
        output_path: outputPath,
        original_size_bytes: meta.size,
        new_size_bytes: outputSize,
        reduction_percent: reduction,
        output_format: outputFormat,
        quality,
      },
    );
  } catch (error) {
    return errorResult(error);
  }
}

export const ConvertSchema = z.object({
  input_path: z.string().describe("Path to input image file"),
  output_path: z.string().optional().describe("Path for output file. Defaults to input_path with '_converted' and new extension"),
  format: z.enum(["jpeg", "jpg", "png", "webp", "avif", "tiff"]).describe("Target format"),
  quality: z.number().int().min(1).max(100).default(90).describe("Output quality (1-100). Affects lossy formats"),
}).strict();

export async function imageConvert(params: z.infer<typeof ConvertSchema>) {
  try {
    const pipeline = await loadImage(params.input_path);
    const meta = await getMetadata(params.input_path);

    const targetFormat = params.format.toLowerCase() === "jpg" ? "jpeg" : params.format.toLowerCase();
    const converted = toFormatPipeline(pipeline, targetFormat, params.quality);

    const ext = params.format.toLowerCase() === "jpeg" ? "jpg" : params.format.toLowerCase();
    const outputPath = params.output_path ?? deriveOutputPath(params.input_path, "_converted", ext);
    const { outputSize } = await writeImage(converted, outputPath);

    return successResult(
      `Converted image saved to ${outputPath}\nFormat: ${meta.format} → ${targetFormat}\nSize: ${formatBytes(meta.size)} → ${formatBytes(outputSize)}`,
      {
        success: true,
        output_path: outputPath,
        original_format: meta.format,
        new_format: targetFormat,
        original_size_bytes: meta.size,
        new_size_bytes: outputSize,
      },
    );
  } catch (error) {
    return errorResult(error);
  }
}

export const CropSchema = z.object({
  input_path: z.string().describe("Path to input image file"),
  output_path: z.string().optional().describe("Path for output file. Defaults to input_path with '_cropped' suffix"),
  left: z.number().int().min(0).max(MAX_DIMENSION).optional().describe("X offset of crop box (pixels from left)"),
  top: z.number().int().min(0).max(MAX_DIMENSION).optional().describe("Y offset of crop box (pixels from top)"),
  width: z.number().int().min(1).max(MAX_DIMENSION).optional().describe("Width of crop box in pixels"),
  height: z.number().int().min(1).max(MAX_DIMENSION).optional().describe("Height of crop box in pixels"),
  aspect: CropAspectPresetSchema.default("free").describe("Aspect ratio preset; ignored if width & height given. e.g. '1:1', '16:9', '4:3', '9:16', 'free'"),
  anchor: z.enum(["top-left", "center", "top-right", "bottom-left", "bottom-right"]).default("center").describe("Where to place the crop box when using aspect preset"),
}).strict().refine(
  (v) => v.width && v.height || v.aspect !== "free",
  { message: "Provide width+height, or set aspect to a non-free preset" },
);

function aspectToRatio(aspect: string): [number, number] | null {
  if (aspect === "free") return null;
  const [w, h] = aspect.split(":").map(Number);
  return [w, h];
}

export async function imageCrop(params: z.infer<typeof CropSchema>) {
  try {
    const pipeline = await loadImage(params.input_path);
    const meta = await getMetadata(params.input_path);

    let cropLeft = params.left ?? 0;
    let cropTop = params.top ?? 0;
    let cropWidth = params.width;
    let cropHeight = params.height;

    if ((!cropWidth || !cropHeight) && params.aspect !== "free") {
      const ratio = aspectToRatio(params.aspect);
      if (ratio) {
        const [rw, rh] = ratio;
        const targetRatio = rw / rh;
        const imgRatio = meta.width / meta.height;
        if (imgRatio > targetRatio) {
          cropHeight = meta.height;
          cropWidth = Math.round(meta.height * targetRatio);
        } else {
          cropWidth = meta.width;
          cropHeight = Math.round(meta.width / targetRatio);
        }
        if (params.anchor === "center") {
          cropLeft = Math.round((meta.width - cropWidth) / 2);
          cropTop = Math.round((meta.height - cropHeight) / 2);
        } else if (params.anchor === "top-left") {
          cropLeft = 0; cropTop = 0;
        } else if (params.anchor === "top-right") {
          cropLeft = meta.width - cropWidth; cropTop = 0;
        } else if (params.anchor === "bottom-left") {
          cropLeft = 0; cropTop = meta.height - cropHeight;
        } else if (params.anchor === "bottom-right") {
          cropLeft = meta.width - cropWidth; cropTop = meta.height - cropHeight;
        }
      }
    }

    if (!cropWidth || !cropHeight) {
      throw new Error("crop requires width and height, or a non-free aspect preset");
    }
    if (cropLeft < 0 || cropTop < 0 || cropLeft + cropWidth > meta.width || cropTop + cropHeight > meta.height) {
      throw new Error(
        `Crop region (${cropLeft},${cropTop} ${cropWidth}x${cropHeight}) out of bounds. Image is ${meta.width}x${meta.height}.`,
      );
    }

    const cropped = pipeline.extract({
      left: cropLeft,
      top: cropTop,
      width: cropWidth,
      height: cropHeight,
    });

    const outputPath = params.output_path ?? deriveOutputPath(params.input_path, "_cropped");
    const { outputSize } = await writeImage(cropped, outputPath);

    return successResult(
      `Cropped image saved to ${outputPath}\nRegion: (${cropLeft},${cropTop}) ${cropWidth}x${cropHeight} from ${meta.width}x${meta.height}\nSize: ${formatBytes(meta.size)} → ${formatBytes(outputSize)}`,
      {
        success: true,
        output_path: outputPath,
        crop_region: { left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight },
        original_dimensions: { width: meta.width, height: meta.height },
        new_dimensions: { width: cropWidth, height: cropHeight },
        original_size_bytes: meta.size,
        new_size_bytes: outputSize,
      },
    );
  } catch (error) {
    return errorResult(error);
  }
}

export const RotateSchema = z.object({
  input_path: z.string().describe("Path to input image file"),
  output_path: z.string().optional().describe("Path for output file. Defaults to input_path with '_rotated' suffix"),
  degrees: z.number().min(0).max(360).default(0).describe("Rotation in degrees clockwise (0, 90, 180, 270, or any value 0-360)"),
  flip_horizontal: z.boolean().default(false).describe("Flip image horizontally (left-right mirror)"),
  flip_vertical: z.boolean().default(false).describe("Flip image vertically (top-bottom mirror)"),
}).strict().refine(
  (v) => v.degrees !== 0 || v.flip_horizontal || v.flip_vertical,
  { message: "Provide degrees != 0 or set a flip" },
);

export async function imageRotate(params: z.infer<typeof RotateSchema>) {
  try {
    const pipeline = await loadImage(params.input_path);
    const meta = await getMetadata(params.input_path);

    const rotated = applyRotate(pipeline, {
      degrees: params.degrees,
      flipHorizontal: params.flip_horizontal,
      flipVertical: params.flip_vertical,
    });

    const outputPath = params.output_path ?? deriveOutputPath(params.input_path, "_rotated");
    const { outputSize } = await writeImage(rotated, outputPath);

    const newW = [90, 270].includes(params.degrees) ? meta.height : meta.width;
    const newH = [90, 270].includes(params.degrees) ? meta.width : meta.height;

    return successResult(
      `Rotated image saved to ${outputPath}\nTransform: ${params.degrees}°${params.flip_horizontal ? " + flipH" : ""}${params.flip_vertical ? " + flipV" : ""}\nDimensions: ${meta.width}x${meta.height} → ${newW}x${newH}\nSize: ${formatBytes(meta.size)} → ${formatBytes(outputSize)}`,
      {
        success: true,
        output_path: outputPath,
        degrees: params.degrees,
        flip_horizontal: params.flip_horizontal,
        flip_vertical: params.flip_vertical,
        new_dimensions: { width: newW, height: newH },
        original_size_bytes: meta.size,
        new_size_bytes: outputSize,
      },
    );
  } catch (error) {
    return errorResult(error);
  }
}

export const FilterSchema = z.object({
  input_path: z.string().describe("Path to input image file"),
  output_path: z.string().optional().describe("Path for output file. Defaults to input_path with '_filtered' suffix"),
  brightness: z.number().min(0).max(200).optional().describe("Brightness percentage (100 = no change, <100 darker, >100 brighter)"),
  saturation: z.number().min(0).max(200).optional().describe("Saturation percentage (100 = no change, 0 = grayscale, 200 = max)"),
  contrast: z.number().min(0).max(200).optional().describe("Contrast percentage (100 = no change)"),
  blur: z.number().min(0).max(100).optional().describe("Blur sigma (0 = none, higher = more blur)"),
  grayscale: z.number().min(0).max(100).optional().describe("Grayscale amount (0-100; 100 = full grayscale)"),
  preset: FilterPresetSchema.optional().describe("Apply named preset: vintage, vivid, black_and_white, cinematic, soft_focus. Overridden by explicit settings."),
}).strict();

export async function imageFilter(params: z.infer<typeof FilterSchema>) {
  try {
    const pipeline = await loadImage(params.input_path);
    const meta = await getMetadata(params.input_path);

    let opts = {
      brightness: params.brightness,
      saturation: params.saturation,
      contrast: params.contrast,
      blur: params.blur,
      grayscale: params.grayscale,
    };

    if (params.preset) {
      const preset = FILTER_PRESETS[params.preset as keyof typeof FILTER_PRESETS];
      opts = {
        brightness: params.brightness ?? preset.brightness,
        saturation: params.saturation ?? preset.saturation,
        contrast: params.contrast ?? preset.contrast,
        blur: params.blur,
        grayscale: params.grayscale ?? preset.grayscale,
      };
    }

    const filtered = applyFilter(pipeline, opts);
    const outputPath = params.output_path ?? deriveOutputPath(params.input_path, "_filtered");
    const { outputSize } = await writeImage(filtered, outputPath);

    const applied: string[] = [];
    if (params.preset) applied.push(`preset=${params.preset}`);
    if (opts.brightness !== undefined && opts.brightness !== 100) applied.push(`brightness=${opts.brightness}`);
    if (opts.saturation !== undefined && opts.saturation !== 100) applied.push(`saturation=${opts.saturation}`);
    if (opts.contrast !== undefined && opts.contrast !== 100) applied.push(`contrast=${opts.contrast}`);
    if (opts.blur !== undefined && opts.blur > 0) applied.push(`blur=${opts.blur}`);
    if (opts.grayscale !== undefined && opts.grayscale > 0) applied.push(`grayscale=${opts.grayscale}`);

    return successResult(
      `Filtered image saved to ${outputPath}\nApplied: ${applied.join(", ") || "no changes"}\nSize: ${formatBytes(meta.size)} → ${formatBytes(outputSize)}`,
      {
        success: true,
        output_path: outputPath,
        preset: params.preset,
        adjustments: opts,
        original_size_bytes: meta.size,
        new_size_bytes: outputSize,
      },
    );
  } catch (error) {
    return errorResult(error);
  }
}