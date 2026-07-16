import { z } from "zod";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { readFile } from "node:fs/promises";
import { successResult, errorResult } from "../utils/error-handling.js";

export const PdfOcrSchema = z.object({
  input_path: z.string().describe("Path to input PDF file"),
  pages: z.string().optional().describe("Page ranges to process (e.g., '1-3,5'). If omitted, processes all pages"),
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

export async function pdfOcr(params: z.infer<typeof PdfOcrSchema>) {
  try {
    const pdfBytes = await readFile(params.input_path);
    const uint8Array = new Uint8Array(pdfBytes);
    
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;

    const pageNumbers = params.pages 
      ? parsePageRanges(params.pages, totalPages)
      : Array.from({ length: totalPages }, (_, i) => i + 1);

    const extractedText: { page: number; text: string }[] = [];

    for (const pageNum of pageNumbers) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const text = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      
      extractedText.push({ page: pageNum, text });
    }

    const fullText = extractedText
      .map(({ page, text }) => `--- Page ${page} ---\n${text}`)
      .join("\n\n");

    return successResult(
      `Extracted text from ${pageNumbers.length} page(s) of ${params.input_path}\n\n${fullText}`,
      {
        success: true,
        input_path: params.input_path,
        pages_processed: pageNumbers,
        total_pages: totalPages,
        extracted_text: extractedText,
      },
    );
  } catch (error) {
    return errorResult(error);
  }
}
