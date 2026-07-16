import { z } from "zod";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { readFile, writeFile } from "node:fs/promises";
import { successResult, errorResult } from "../utils/error-handling.js";
import { formatBytes } from "../utils/file-io.js";

export const PdfRedactSchema = z.object({
  input_path: z.string().describe("Path to input PDF file"),
  output_path: z.string().describe("Path for redacted PDF output"),
  regions: z.array(z.object({
    page: z.number().min(1).describe("Page number (1-indexed)"),
    x: z.number().min(0).describe("X coordinate in points"),
    y: z.number().min(0).describe("Y coordinate in points"),
    width: z.number().min(1).describe("Width in points"),
    height: z.number().min(1).describe("Height in points"),
  })).min(1).describe("Array of rectangular regions to redact"),
  color: z.string().optional().default("black").describe("Redaction color (default: black)"),
}).strict();

export async function pdfRedact(params: z.infer<typeof PdfRedactSchema>) {
  try {
    const pdfBytes = await readFile(params.input_path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    // Parse color
    let redactionColor = rgb(0, 0, 0); // black
    if (params.color === "white") {
      redactionColor = rgb(1, 1, 1);
    } else if (params.color === "gray") {
      redactionColor = rgb(0.5, 0.5, 0.5);
    }

    let redactionCount = 0;

    for (const region of params.regions) {
      const pageIndex = region.page - 1;
      if (pageIndex < 0 || pageIndex >= pages.length) {
        throw new Error(`Invalid page number: ${region.page}. PDF has ${pages.length} pages.`);
      }

      const page = pages[pageIndex];
      
      // Draw a filled rectangle to cover the sensitive content
      page.drawRectangle({
        x: region.x,
        y: region.y,
        width: region.width,
        height: region.height,
        color: redactionColor,
      });

      redactionCount++;
    }

    const redactedBytes = await pdfDoc.save();
    await writeFile(params.output_path, redactedBytes);

    return successResult(
      `Redacted ${redactionCount} region(s) from ${params.input_path}\nSaved to ${params.output_path}\nRedaction color: ${params.color}\nOutput size: ${formatBytes(redactedBytes.length)}`,
      {
        success: true,
        output_path: params.output_path,
        redaction_count: redactionCount,
        output_size_bytes: redactedBytes.length,
      },
    );
  } catch (error) {
    return errorResult(error);
  }
}
