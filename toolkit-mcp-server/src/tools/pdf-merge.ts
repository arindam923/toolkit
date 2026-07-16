import { z } from "zod";
import { PDFDocument } from "pdf-lib";
import { readFile, writeFile } from "node:fs/promises";
import { successResult, errorResult } from "../utils/error-handling.js";
import { formatBytes } from "../utils/file-io.js";

export const PdfMergeSchema = z.object({
  input_paths: z.array(z.string()).min(2).describe("Array of PDF file paths to merge (minimum 2)"),
  output_path: z.string().describe("Path for merged PDF output"),
}).strict();

export async function pdfMerge(params: z.infer<typeof PdfMergeSchema>) {
  try {
    const mergedPdf = await PDFDocument.create();

    let totalPages = 0;
    const pageCountPerFile: number[] = [];

    for (const inputPath of params.input_paths) {
      const pdfBytes = await readFile(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      
      pages.forEach((page) => mergedPdf.addPage(page));
      pageCountPerFile.push(pdf.getPageCount());
      totalPages += pdf.getPageCount();
    }

    const mergedBytes = await mergedPdf.save();
    await writeFile(params.output_path, mergedBytes);

    return successResult(
      `Merged ${params.input_paths.length} PDFs into ${params.output_path}\nTotal pages: ${totalPages}\nPages per file: ${pageCountPerFile.join(", ")}\nOutput size: ${formatBytes(mergedBytes.length)}`,
      {
        success: true,
        output_path: params.output_path,
        input_count: params.input_paths.length,
        total_pages: totalPages,
        pages_per_file: pageCountPerFile,
        output_size_bytes: mergedBytes.length,
      },
    );
  } catch (error) {
    return errorResult(error);
  }
}
