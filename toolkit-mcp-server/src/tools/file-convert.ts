import { z } from "zod";
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { successResult, errorResult } from "../utils/error-handling.js";
import { formatBytes, getFileSize } from "../utils/file-io.js";

export const FileConvertSchema = z.object({
  input_paths: z.array(z.string()).min(1).describe("Array of image file paths to convert"),
  output_format: z.enum(["jpg", "jpeg", "png", "webp", "avif", "tiff"]).describe("Target format"),
  output_dir: z.string().describe("Output directory for converted files"),
  quality: z.number().min(1).max(100).default(90).describe("Output quality for lossy formats (1-100, default 90)"),
}).strict();

export async function fileConvert(params: z.infer<typeof FileConvertSchema>) {
  try {
    const outputFiles: string[] = [];
    const conversions: { input: string; output: string; originalSize: number; newSize: number }[] = [];

    for (const inputPath of params.input_paths) {
      const imageBuffer = await readFile(inputPath);
      const originalSize = await getFileSize(inputPath);
      
      // Determine output format
      const format = params.output_format.toLowerCase();
      const ext = format === "jpeg" ? "jpg" : format;
      
      // Get filename without extension
      const path = await import("node:path");
      const parsed = path.parse(inputPath);
      const baseName = parsed.name;
      const outputPath = path.join(params.output_dir, `${baseName}.${ext}`);

      // Convert using sharp
      let sharpInstance = sharp(imageBuffer);
      
      let convertedBuffer: Buffer;
      switch (format) {
        case "jpg":
        case "jpeg":
          convertedBuffer = await sharpInstance.jpeg({ quality: params.quality, mozjpeg: true }).toBuffer();
          break;
        case "png":
          convertedBuffer = await sharpInstance.png({ quality: params.quality, compressionLevel: 9 }).toBuffer();
          break;
        case "webp":
          convertedBuffer = await sharpInstance.webp({ quality: params.quality }).toBuffer();
          break;
        case "avif":
          convertedBuffer = await sharpInstance.avif({ quality: params.quality }).toBuffer();
          break;
        case "tiff":
          convertedBuffer = await sharpInstance.tiff({ quality: params.quality }).toBuffer();
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      await writeFile(outputPath, convertedBuffer);
      const newSize = convertedBuffer.length;
      
      outputFiles.push(outputPath);
      conversions.push({
        input: inputPath,
        output: outputPath,
        originalSize,
        newSize,
      });
    }

    const totalOriginal = conversions.reduce((sum, c) => sum + c.originalSize, 0);
    const totalNew = conversions.reduce((sum, c) => sum + c.newSize, 0);
    const reduction = totalOriginal > 0 ? Math.round((1 - totalNew / totalOriginal) * 100) : 0;

    return successResult(
      `Converted ${conversions.length} file(s) to ${params.output_format.toUpperCase()}\nOutput directory: ${params.output_dir}\nOutput files: ${outputFiles.join(", ")}\nTotal size: ${formatBytes(totalOriginal)} → ${formatBytes(totalNew)} (${reduction > 0 ? `${reduction}% smaller` : `${Math.abs(reduction)}% larger`})`,
      {
        success: true,
        output_files: outputFiles,
        file_count: conversions.length,
        output_format: params.output_format,
        total_original_size_bytes: totalOriginal,
        total_new_size_bytes: totalNew,
        reduction_percent: reduction,
      },
    );
  } catch (error) {
    return errorResult(error);
  }
}
