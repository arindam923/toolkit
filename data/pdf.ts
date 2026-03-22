// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type BadgeKey = "Free" | "Pro" | "New";

export interface PdfTool {
  icon: string;
  name: string;
  desc: string;
  badge: BadgeKey;
  path: string;
}

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

export const pdfTools: PdfTool[] = [
  {
    icon: "📎",
    name: "PDF Merger",
    desc: "Drag-drop PDFs to merge in custom order",
    badge: "Free",
    path: "/pdf/merge",
  },
  {
    icon: "✂️",
    name: "PDF Splitter",
    desc: "Extract pages, split by range or every N pages",
    badge: "Free",
    path: "/pdf/split",
  },
  {
    icon: "🔍",
    name: "PDF OCR",
    desc: "Extract searchable text from scanned PDFs",
    badge: "Pro",
    path: "/pdf/ocr",
  },
  {
    icon: "🔒",
    name: "PDF Lock / Unlock",
    desc: "Password-protect or remove PDF passwords",
    badge: "Free",
    path: "/pdf/security",
  },
  {
    icon: "📄",
    name: "PDF to Word",
    desc: "Convert PDFs to editable Word documents",
    badge: "New",
    path: "/pdf/convert",
  },
  {
    icon: "🗜️",
    name: "PDF Compressor",
    desc: "Reduce PDF file size without losing quality",
    badge: "Pro",
    path: "/pdf/compress",
  },
  {
    icon: "🖼️",
    name: "PDF to Image",
    desc: "Convert PDF pages to high-quality images",
    badge: "Free",
    path: "/pdf/to-image",
  },
  {
    icon: "📄",
    name: "Image to PDF",
    desc: "Convert images to PDF document",
    badge: "Free",
    path: "/pdf/image-to-pdf",
  },
  {
    icon: "🔴",
    name: "PDF Redactor",
    desc: "Redact sensitive information from PDFs",
    badge: "Pro",
    path: "/pdf/redact",
  },
  {
    icon: "📝",
    name: "PDF Annotator",
    desc: "Add annotations to PDFs",
    badge: "Pro",
    path: "/pdf/annotate",
  },
];

export const badges: Record<BadgeKey, { bg: string; color: string }> = {
  Free: { bg: "rgba(0,200,150,0.12)", color: "#00A87A" },
  Pro: { bg: "rgba(124,92,53,0.12)", color: "#7C5CFF" },
  New: { bg: "rgba(255,92,53,0.12)", color: "#FF5C35" },
};

export const PDF_PAGE_STATS = [
  { num: String(pdfTools.length), label: "Tools available" },
  { num: "100%", label: "Browser-based" },
  { num: "0 MB", label: "Server uploads*" },
] as const;
