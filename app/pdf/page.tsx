import type { Metadata } from "next";
import { pdfTools } from "@/data/pdf";
import PdfNavbar from "@/components/pdf/PdfNavbar";
import PdfPageHeader from "@/components/pdf/PdfPageHeader";
import PdfToolsGrid from "@/components/pdf/PdfToolsGrid";
import Footer from "@/components/home/Footer";

export const metadata: Metadata = {
  title: "PDF Tools - Merge, Split, Compress, Convert | ToolKit",
  description: "Free online PDF tools: merge, split, compress, convert to Word, OCR, lock/unlock, annotate, redact. All processing happens in your browser.",
  keywords: "pdf tools, pdf merge, pdf split, pdf compressor, pdf converter, pdf ocr, pdf security, pdf redact, pdf annotate",
  openGraph: {
    title: "PDF Tools - Free Online PDF Processing",
    description: "Merge, split, compress, convert and edit PDFs online. All tools run in your browser - files never leave your device.",
  },
};

export default function PdfPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="max-w-215 mx-auto px-2 lg:px-0 pt-5 pb-12">
        <PdfNavbar />
        <PdfPageHeader />
        <PdfToolsGrid tools={pdfTools} />
        <Footer />
      </div>
    </div>
  );
}