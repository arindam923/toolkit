import sharp from "sharp";
import { z } from "zod";
import { validateInputPath, defaultOutputPath, ensureDir, fileSize, formatBytes } from "../utils/file-io.js";
import { getImageMetadata } from "../utils/image-io.js";
import { toolError, toolSuccess } from "../utils/error-handling.js";
import { RESIZE_PRESETS } from "../constants.js";

export const ImageResizeSchema = z
  .object({
    input_path: z.string().describe("Path to input image file"),
    output_path: z
      .string()
      .optional()
      .describe("Output file path (default: input_path with '_resized' suffix)"),
    width: z
      .number()
      .int()
      .min(1)
      .max(16384)
      .optional()
      .describe("Target width in pixels"),
    height: z
      .number()
      .int()
      .min(1)
      .max(16384)
      .optional()
      .describe("Target height in pixels"),
    scale_percent: z
      .number()
      .min(1)
      .max(1000)
      .optional()
      .describe("Scale by percentage (e.g., 50 = half size)"),
    preset: z
      .enum(["social", "web", "print", "thumbnail"])
      .optional()
      .describe(
        "Quick preset: social=1080x1080, web=1200x800, print=2400x1800, thumbnail=300x200",
      ),
    maintain_aspect: z
      .boolean()
      .default(true)
      .describe("Maintain aspect ratio when resizing"),
    quality: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(90)
      .describe("Output quality (1-100)"),
  })
  .strict();

export type ImageResizeInput = z.infer<typeof ImageResizeSchema>;

export async function imageResize(params: ImageResizeInput) {
  const validation = validateInputPath(params.input_path);
  if (!validation.valid) return toolError(validation.error!);

  const inputMeta = await getImageMetadata(params.input_path);
  const inputSize = fileSize(params.input_path);

  // Determine target dimensions
  let targetW: number | undefined;
  let targetH: number | undefined;

  if (params.preset) {
    const preset = RESIZE_PRESETS[params.preset];
    targetW = preset.width;
    targetH = preset.height;
  } else if (params.scale_percent) {
    const scale = params.scale_percent / 100;
    targetW = Math.round(inputMeta.width * scale);
    targetH = Math.round(inputMeta.height * scale);
  } else {
    targetW = params.width;
    targetH = params.height;
  }

  if (!targetW && !targetH) {
    return toolError(
      "No resize dimensions specified",
      "Provide width, height, scale_percent, or preset.",
    );
  }

  const outputPath =
    params.output_path ?? defaultOutputPath(params.input_path, "resized");
  await ensureDir(outputPath);

  const resizeOpts: sharp.ResizeOptions = {
    withoutEnlargement: true,
  };
  if (targetW) resizeOpts.width = targetW;
  if (targetH) resizeOpts.height = targetH;
  if (params.maintain_aspect) {
    resizeOpts.fit = "inside";
  } else {
    resizeOpts.fit = "fill";
  }

  const info = await sharp(params.input_path)
    .resize(resizeOpts)
    .jpeg({ quality: params.quality })
    .toFile(outputPath);

  const outputSize = fileSize(outputPath);

  const summary = [
    `Resized image saved to ${outputPath}`,
    `Dimensions: ${inputMeta.width}×${inputMeta.height} → ${info.width}×${info.height}`,
    `Size: ${formatBytes(inputSize)} → ${formatBytes(outputSize)}`,
  ].join("\n");

  return toolSuccess(summary, {
    success: true,
    output_path: outputPath,
    original_dimensions: { width: inputMeta.width, height: inputMeta.height },
    new_dimensions: { width: info.width, height: info.height },
    original_size_bytes: inputSize,
    new_size_bytes: outputSize,
    format: info.format,
  });
}
