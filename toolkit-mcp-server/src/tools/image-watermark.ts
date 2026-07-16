import { z } from "zod";
import sharp from "sharp";
import { loadImage, getMetadata, writeImage } from "../utils/image-io.js";
import { deriveOutputPath, formatBytes } from "../utils/file-io.js";
import { successResult, errorResult } from "../utils/error-handling.js";

export const WatermarkSchema = z.object({
  input_path: z.string().describe("Path to input image file"),
  output_path: z.string().optional().describe("Path for output file. Defaults to input_path with '_watermark' suffix"),
  text: z.string().describe("Watermark text"),
  position: z.enum(["top-left", "top-right", "bottom-left", "bottom-right", "center"]).default("bottom-right").describe("Position of watermark"),
  opacity: z.number().min(0).max(100).default(50).describe("Watermark opacity percentage (0-100, default 50)"),
  color: z.string().default("#ffffff").describe("Watermark color in hex format (default #ffffff)"),
  font_size: z.number().min(10).max(200).default(32).describe("Font size in pixels (default 32)"),
}).strict();

function calculatePosition(
  imageWidth: number,
  imageHeight: number,
  textWidth: number,
  textHeight: number,
  position: string,
  padding: number = 20,
): { left: number; top: number } {
  switch (position) {
    case "top-left":
      return { left: padding, top: padding };
    case "top-right":
      return { left: imageWidth - textWidth - padding, top: padding };
    case "bottom-left":
      return { left: padding, top: imageHeight - textHeight - padding };
    case "bottom-right":
      return { left: imageWidth - textWidth - padding, top: imageHeight - textHeight - padding };
    case "center":
      return { left: (imageWidth - textWidth) / 2, top: (imageHeight - textHeight) / 2 };
    default:
      return { left: imageWidth - textWidth - padding, top: imageHeight - textHeight - padding };
  }
}

function createTextSvg(
  text: string,
  fontSize: number,
  color: string,
  opacity: number,
): Buffer {
  // Estimate text width (rough approximation)
  const textWidth = text.length * fontSize * 0.6;
  const textHeight = fontSize * 1.2;

  const svg = `
    <svg width="${textWidth}" height="${textHeight}">
      <text
        x="0"
        y="${fontSize}"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="${color}"
        fill-opacity="${opacity / 100}"
      >${text}</text>
    </svg>
  `;

  return Buffer.from(svg);
}

export async function imageWatermark(params: z.infer<typeof WatermarkSchema>) {
  try {
    const pipeline = await loadImage(params.input_path);
    const meta = await getMetadata(params.input_path);

    const { width: imageWidth, height: imageHeight } = meta;

    // Create SVG text overlay
    const svgBuffer = createTextSvg(
      params.text,
      params.font_size,
      params.color,
      params.opacity,
    );

    // Get text dimensions
    const textMeta = await sharp(svgBuffer).metadata();
    const textWidth = textMeta.width ?? params.text.length * params.font_size * 0.6;
    const textHeight = textMeta.height ?? params.font_size * 1.2;

    // Calculate position
    const position = calculatePosition(
      imageWidth,
      imageHeight,
      textWidth,
      textHeight,
      params.position,
    );

    // Composite the text overlay
    const watermarked = pipeline.composite([
      {
        input: svgBuffer,
        left: position.left,
        top: position.top,
      },
    ]);

    const outputPath = params.output_path ?? deriveOutputPath(params.input_path, "_watermark");
    const { outputSize } = await writeImage(watermarked, outputPath);

    return successResult(
      `Applied text watermark "${params.text}" at ${params.position}\nOpacity: ${params.opacity}%\nSaved to ${outputPath}\nSize: ${formatBytes(meta.size)} → ${formatBytes(outputSize)}`,
      {
        success: true,
        output_path: outputPath,
        text: params.text,
        position: params.position,
        opacity: params.opacity,
        color: params.color,
        original_size_bytes: meta.size,
        new_size_bytes: outputSize,
      },
    );
  } catch (error) {
    return errorResult(error);
  }
}
