import { pdfTools } from "@/data/pdf";
import PdfNavbar from "@/components/pdf/PdfNavbar";
import PdfPageHeader from "@/components/pdf/PdfPageHeader";
import PdfToolsGrid from "@/components/pdf/PdfToolsGrid";
import Footer from "@/components/home/Footer";

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