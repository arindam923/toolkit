import { z } from "zod";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { successResult, errorResult } from "../utils/error-handling.js";
import { formatBytes, getFileSize } from "../utils/file-io.js";

export const ImageToPdfSchema = z.object({
  input_paths: z.array(z.string()).min(1).describe("Array of image file paths to convert"),
  output_path: z.string().describe("Path for output PDF file"),
  page_width: z.number().min(100).max(10000).optional().describe("Page width in points (default: image width)"),
  page_height: z.number().min(100).max(10000).optional().describe("Page height in points (default: image height)"),
  margin: z.number().min(0).max(500).default(0).describe("Page margin in points (default 0)"),
}).strict();

export async function imageToPdf(params: z.infer<typeof ImageToPdfSchema>) {
  try {
    const pdfDoc = await PDFDocument.create();

    for (const imagePath of params.input_paths) {
      const imageBytes = await readFile(imagePath);
      
      // Detect image format
      const metadata = await sharp(imageBytes).metadata();
      
      let image;
      if (metadata.format === "png") {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        // Convert to PNG for embedding (pdf-lib doesn't support JPEG directly in all cases)
        const pngBuffer = await sharp(imageBytes).png().toBuffer();
        image = await pdfDoc.embedPng(pngBuffer);
      }

      const pageWidth = params.page_width || image.width;
      const pageHeight = params.page_height || image.height;
      
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      
      const x = params.margin;
      const y = params.margin;
      const width = pageWidth - 2 * params.margin;
      const height = pageHeight - 2 * params.margin;
      
      page.drawImage(image, {
        x,
        y,
        width,
        height,
      });
    }

    const pdfBytes = await pdfDoc.save();
    await writeFile(params.output_path, pdfBytes);

    return successResult(
      `Converted ${params.input_paths.length} image(s) to PDF\nSaved to ${params.output_path}\nPages: ${params.input_paths.length}\nOutput size: ${formatBytes(pdfBytes.length)}`,
      {
        success: true,
        output_path: params.output_path,
        image_count: params.input_paths.length,
        page_count: params.input_paths.length,
        output_size_bytes: pdfBytes.length,
      },
    );
  } catch (error) {
    return errorResult(error);
  }
}
