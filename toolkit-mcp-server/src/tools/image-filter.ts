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

const FILTER_PRESETS = {
  vintage: { brightness: 1.1, saturation: 0.7, blur: 0.5, tint: "#d4a574" },
  vivid: { brightness: 1.15, saturation: 1.5, blur: 0, tint: null },
  black_and_white: { brightness: 1.0, saturation: 0, blur: 0, tint: null },
  cinematic: { brightness: 0.9, saturation: 0.8, blur: 0.3, tint: "#3a506b" },
  soft_focus: { brightness: 1.05, saturation: 0.9, blur: 2, tint: null },
} as const;

type FilterPreset = keyof typeof FILTER_PRESETS;

export const ImageFilterSchema = z
  .object({
    input_path: z.string().describe("Path to input image file"),
    output_path: z
      .string()
      .optional()
      .describe("Output file path (default: input_path with '_filtered' suffix)"),
    brightness: z
      .number()
      .min(0)
      .max(2)
      .default(1)
      .describe("Brightness multiplier (0.5=dark, 1=normal, 1.5=bright)"),
    contrast: z
      .number()
      .min(0)
      .max(2)
      .default(1)
      .describe("Contrast multiplier (0.5=low, 1=normal, 1.5=high)"),
    saturation: z
      .number()
      .min(0)
      .max(3)
      .default(1)
      .describe("Saturation multiplier (0=grayscale, 1=normal, 2=double)"),
    blur_sigma: z
      .number()
      .min(0)
      .max(20)
      .default(0)
      .describe("Gaussian blur radius (0=no blur, 3+=heavy blur)"),
    grayscale: z
      .boolean()
      .default(false)
      .describe("Convert to grayscale"),
    preset: z
      .enum(["vintage", "vivid", "black_and_white", "cinematic", "soft_focus"])
      .optional()
      .describe(
        "Named preset: vintage (warm, desaturated), vivid (bright, saturated), black_and_white, cinematic (dark, cool tint), soft_focus (slight blur)",
      ),
    quality: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(90)
      .describe("Output quality (1-100)"),
  })
  .strict();

export type ImageFilterInput = z.infer<typeof ImageFilterSchema>;

export async function imageFilter(params: ImageFilterInput) {
  const validation = validateInputPath(params.input_path);
  if (!validation.valid) return toolError(validation.error!);

  const inputMeta = await getImageMetadata(params.input_path);
  const inputSize = fileSize(params.input_path);

  // Merge preset values with explicit params
  let brightness = params.brightness;
  let saturation = params.saturation;
  let blurSigma = params.blur_sigma;
  let tint: string | null = null;
  let grayscale = params.grayscale;

  if (params.preset) {
    const preset = FILTER_PRESETS[params.preset as FilterPreset];
    brightness = preset.brightness;
    saturation = preset.saturation;
    blurSigma = preset.blur;
    tint = preset.tint;
    if (params.preset === "black_and_white") grayscale = true;
  }

  const outputPath =
    params.output_path ?? defaultOutputPath(params.input_path, "filtered");
  await ensureDir(outputPath);

  let pipeline = sharp(params.input_path);

  // Apply modulate (brightness, saturation)
  if (brightness !== 1 || saturation !== 1) {
    pipeline = pipeline.modulate({
      brightness,
      saturation,
    });
  }

  // Apply gamma for contrast (gamma < 1 = more contrast, > 1 = less contrast)
  if (params.contrast !== 1) {
    const gamma = 1 / params.contrast;
    pipeline = pipeline.gamma(Math.max(0.1, Math.min(3, gamma)));
  }

  // Apply blur
  if (blurSigma > 0) {
    pipeline = pipeline.blur(blurSigma);
  }

  // Apply grayscale
  if (grayscale) {
    pipeline = pipeline.grayscale();
  }

  // Apply color tint via tint (if preset includes one)
  if (tint) {
    pipeline = pipeline.tint(tint);
  }

  const info = await pipeline
    .jpeg({ quality: params.quality })
    .toFile(outputPath);
  const outputSize = fileSize(outputPath);

  const appliedFilters: string[] = [];
  if (brightness !== 1) appliedFilters.push(`brightness=${brightness}`);
  if (params.contrast !== 1) appliedFilters.push(`contrast=${params.contrast}`);
  if (saturation !== 1) appliedFilters.push(`saturation=${saturation}`);
  if (blurSigma > 0) appliedFilters.push(`blur=${blurSigma}`);
  if (grayscale) appliedFilters.push("grayscale");
  if (tint) appliedFilters.push(`tint=${tint}`);
  if (params.preset) appliedFilters.push(`preset=${params.preset}`);

  const summary = [
    `Filtered image saved to ${outputPath}`,
    `Applied: ${appliedFilters.join(", ") || "none"}`,
    `Dimensions: ${info.width}×${info.height}`,
    `Size: ${formatBytes(inputSize)} → ${formatBytes(outputSize)}`,
  ].join("\n");

  return toolSuccess(summary, {
    success: true,
    output_path: outputPath,
    filters_applied: appliedFilters,
    preset: params.preset ?? null,
    dimensions: { width: info.width, height: info.height },
    original_size_bytes: inputSize,
    new_size_bytes: outputSize,
  });
}
