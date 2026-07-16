import { z } from "zod";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { successResult, errorResult } from "../utils/error-handling.js";
import { formatBytes } from "../utils/file-io.js";

// @ts-ignore - canvas doesn't have types
import { createCanvas } from "canvas";

export const PdfToImageSchema = z.object({
  input_path: z.string().describe("Path to input PDF file"),
  output_path: z.string().describe("Base path for output images (will append _page_N.<format>)"),
  format: z.enum(["png", "jpeg", "webp"]).default("png").describe("Output image format"),
  pages: z.string().optional().describe("Page ranges to convert (e.g., '1-3,5'). If omitted, converts all pages"),
  scale: z.number().min(1).max(5).default(2).describe("Render scale factor (1-5, default 2). Higher = better quality but larger files"),
  quality: z.number().min(1).max(100).default(90).describe("Output quality for JPEG/WebP (1-100, default 90)"),
}).strict();

function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  const pages: Set<number> = new Set();
  const parts = rangeStr.split(",").map(s => s.trim());
  
  for (const part of parts) {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(s => parseInt(s.trim()));
      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid page range: ${part}`);
      }
      for (let i = start; i <= end; i++) {
        if (i >= 1 && i <= totalPages) {
          pages.add(i);
        }
      }
    } else {
      const page = parseInt(part);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        pages.add(page);
      }
    }
  }
  
  return Array.from(pages).sort((a, b) => a - b);
}

export async function pdfToImage(params: z.infer<typeof PdfToImageSchema>) {
  try {
    const pdfBytes = await readFile(params.input_path);
    const uint8Array = new Uint8Array(pdfBytes);
    
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;

    const pageNumbers = params.pages 
      ? parsePageRanges(params.pages, totalPages)
      : Array.from({ length: totalPages }, (_, i) => i + 1);

    const outputFiles: string[] = [];

    for (const pageNum of pageNumbers) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: params.scale });
      
      // Create a real canvas using node-canvas
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');
      
      // Render the PDF page to canvas
      await page.render({
        canvasContext: context as any,
        viewport,
      }).promise;

      // Convert canvas to buffer
      const imageBuffer = canvas.toBuffer('image/png');

      // Convert to output format using sharp
      const outputPath = params.output_path.replace(/\.(png|jpg|jpeg|webp)$/i, `_page_${pageNum}.${params.format}`);
      
      const outputBuffer = await sharp(imageBuffer)
        .toFormat(params.format === "jpeg" ? "jpeg" : params.format, {
          quality: params.quality,
        })
        .toBuffer();

      await writeFile(outputPath, outputBuffer);
      outputFiles.push(outputPath);
    }

    return successResult(
      `Converted ${pageNumbers.length} PDF page(s) to ${params.format.toUpperCase()} images\nPages: ${pageNumbers.join(", ")}\nOutput files: ${outputFiles.join(", ")}\nScale: ${params.scale}x`,
      {
        success: true,
        output_files: outputFiles,
        pages_converted: pageNumbers,
        format: params.format,
        scale: params.scale,
      },
    );
  } catch (error) {
    return errorResult(error);
  }
}
