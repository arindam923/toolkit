import { z } from "zod";
import { PDFDocument } from "pdf-lib";
import { readFile, writeFile } from "node:fs/promises";
import { successResult, errorResult } from "../utils/error-handling.js";
import { formatBytes } from "../utils/file-io.js";

export const PdfSplitSchema = z.object({
  input_path: z.string().describe("Path to input PDF file"),
  output_path: z.string().describe("Base path for output PDFs (will append _page_N.pdf)"),
  pages: z.string().optional().describe("Page ranges to extract (e.g., '1-3,5,7-9'). If omitted, splits into individual pages"),
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

export async function pdfSplit(params: z.infer<typeof PdfSplitSchema>) {
  try {
    const pdfBytes = await readFile(params.input_path);
    const pdf = await PDFDocument.load(pdfBytes);
    const totalPages = pdf.getPageCount();

    const outputFiles: string[] = [];

    if (params.pages) {
      // Extract specific pages
      const pageNumbers = parsePageRanges(params.pages, totalPages);
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(pdf, pageNumbers.map(n => n - 1)); // 0-indexed
      
      pages.forEach((page) => newPdf.addPage(page));
      
      const newBytes = await newPdf.save();
      await writeFile(params.output_path, newBytes);
      outputFiles.push(params.output_path);

      return successResult(
        `Extracted ${pageNumbers.length} pages from ${params.input_path}\nPages: ${pageNumbers.join(", ")}\nSaved to ${params.output_path}\nOutput size: ${formatBytes(newBytes.length)}`,
        {
          success: true,
          output_path: params.output_path,
          extracted_pages: pageNumbers,
          output_size_bytes: newBytes.length,
        },
      );
    } else {
      // Split into individual pages
      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(page);
        
        const outputPath = params.output_path.replace(/\.pdf$/i, `_page_${i + 1}.pdf`);
        const newBytes = await newPdf.save();
        await writeFile(outputPath, newBytes);
        outputFiles.push(outputPath);
      }

      return successResult(
        `Split ${params.input_path} into ${totalPages} individual PDFs\nOutput files: ${outputFiles.join(", ")}\nTotal pages: ${totalPages}`,
        {
          success: true,
          output_files: outputFiles,
          total_pages: totalPages,
        },
      );
    }
  } catch (error) {
    return errorResult(error);
  }
}
