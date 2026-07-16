// Synchronized with the main registry in data/files.tsx.
// Edit data/files.tsx first, then update this file to match.

export type BadgeKey = "Free" | "Pro" | "New" | "Coming Soon";

export interface PdfTool {
  icon: string;
  name: string;
  desc: string;
  badge: BadgeKey;
  path: string;
}

export const pdfTools: PdfTool[] = [
  {
    icon: "📝",
    name: "PDF Annotator",
    desc: "Add text annotations to the first page of PDF documents.",
    badge: "Pro",
    path: "/pdf/annotate",
  },
  {
    icon: "🗜️",
    name: "PDF Compressor",
    desc: "Reduce PDF file size by stripping metadata and using object streams.",
    badge: "Free",
    path: "/pdf/compress",
  },
  {
    icon: "📄",
    name: "PDF to Word",
    desc: "Convert PDF documents to editable Word (.docx) files with preserved text.",
    badge: "Pro",
    path: "/pdf/convert",
  },
  {
    icon: "📄",
    name: "Image to PDF",
    desc: "Convert images to PDF documents. Supports JPG, PNG, and WebP.",
    badge: "Free",
    path: "/pdf/image-to-pdf",
  },
  {
    icon: "📎",
    name: "PDF Merger",
    desc: "Combine multiple PDF files into a single document.",
    badge: "Free",
    path: "/pdf/merge",
  },
  {
    icon: "🔍",
    name: "PDF OCR",
    desc: "Extract selectable text from PDF documents.",
    badge: "Pro",
    path: "/pdf/ocr",
  },
  {
    icon: "🔴",
    name: "PDF Redactor",
    desc: "Search and redact sensitive text from PDF documents.",
    badge: "Pro",
    path: "/pdf/redact",
  },
  {
    icon: "🔒",
    name: "PDF Unlock",
    desc: "Remove password protection from PDF documents.",
    badge: "Free",
    path: "/pdf/security",
  },
  {
    icon: "✂️",
    name: "PDF Splitter",
    desc: "Extract pages, split by range, or split every N pages into a ZIP.",
    badge: "Free",
    path: "/pdf/split",
  },
  {
    icon: "🖼️",
    name: "PDF to Image",
    desc: "Convert PDF pages to high-quality PNG, JPEG, or WebP images packaged in a ZIP.",
    badge: "Free",
    path: "/pdf/to-image",
  },
];

export const badges: Record<BadgeKey, { bg: string; color: string }> = {
  Free: { bg: "rgba(0,200,150,0.12)", color: "#00A87A" },
  Pro: { bg: "rgba(124,92,255,0.12)", color: "#7C5CFF" },
  New: { bg: "rgba(255,92,53,0.12)", color: "#FF5C35" },
  "Coming Soon": { bg: "rgba(107,114,128,0.12)", color: "#6B7280" },
};

export const PDF_PAGE_STATS = [
  { num: String(pdfTools.length), label: "Tools available" },
  { num: "100%", label: "Browser-based" },
  { num: "0 MB", label: "Server uploads*" },
] as const;
