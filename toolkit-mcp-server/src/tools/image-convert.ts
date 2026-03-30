import sharp from "sharp";
import { z } from "zod";
import {
  validateInputPath,
  ensureDir,
  fileSize,
  formatBytes,
} from "../utils/file-io.js";
import { getImageMetadata } from "../utils/image-io.js";
import { toolError, toolSuccess } from "../utils/error-handling.js";

export const ImageConvertSchema = z
  .object({
    input_path: z.string().describe("Path to input image file"),
    output_path: z
      .string()
      .optional()
      .describe("Output file path (default: same name with new extension)"),
    output_format: z
      .enum(["jpeg", "png", "webp", "avif"])
      .describe("Target output format"),
    quality: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(90)
      .describe("Output quality (1-100, affects JPEG/WebP/AVIF)"),
  })
  .strict();

export type ImageConvertInput = z.infer<typeof ImageConvertSchema>;

const FORMAT_EXT: Record<string, string> = {
  jpeg: ".jpg",
  png: ".png",
  webp: ".webp",
  avif: ".avif",
};

export async function imageConvert(params: ImageConvertInput) {
  const validation = validateInputPath(params.input_path);
  if (!validation.valid) return toolError(validation.error!);

  const inputMeta = await getImageMetadata(params.input_path);
  const inputSize = fileSize(params.input_path);

  const ext = FORMAT_EXT[params.output_format];
  const outputPath = params.output_path
    ? params.output_path
    : params.input_path.replace(/\.[^.]+$/, ext);
  await ensureDir(outputPath);

  let pipeline = sharp(params.input_path);

  switch (params.output_format) {
    case "jpeg":
      pipeline = pipeline.jpeg({ quality: params.quality, mozjpeg: true });
      break;
    case "png":
      pipeline = pipeline.png();
      break;
    case "webp":
      pipeline = pipeline.webp({ quality: params.quality });
      break;
    case "avif":
      pipeline = pipeline.avif({ quality: params.quality });
      break;
  }

  const info = await pipeline.toFile(outputPath);
  const outputSize = fileSize(outputPath);

  const summary = [
    `Converted image saved to ${outputPath}`,
    `Format: ${inputMeta.format} → ${params.output_format}`,
    `Dimensions: ${info.width}×${info.height}`,
    `Size: ${formatBytes(inputSize)} → ${formatBytes(outputSize)}`,
  ].join("\n");

  return toolSuccess(summary, {
    success: true,
    output_path: outputPath,
    original_format: inputMeta.format,
    new_format: params.output_format,
    dimensions: { width: info.width, height: info.height },
    original_size_bytes: inputSize,
    new_size_bytes: outputSize,
  });
}
