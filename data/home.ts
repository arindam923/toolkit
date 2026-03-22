// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type BadgeKey = "Free" | "Pro" | "New";

export interface Category {
  name: string;
  count: number;
  icon: string;
  iconBg: string;
  description: string;
  tools: string[];
}

export interface SpotlightTool {
  icon: string;
  name: string;
  desc: string;
  badge: BadgeKey;
}

export interface Feature {
  icon: string;
  title: string;
  desc: string;
}

export interface FlowStep {
  num: number;
  title: string;
  desc: string;
}

export interface Tool {
  name: string;
  desc: string;
  category: string;
}

export interface Plan {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  featured: boolean;
}

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

export const categories: Category[] = [
  {
    name: "Image Tools",
    count: 12,
    icon: "🖼️",
    iconBg: "rgba(255,92,53,0.1)",
    description:
      "Resize, compress, convert, crop, rotate, flip, watermark & enhance images.",
    tools: ["Resizer", "Compressor", "Converter", "Cropper", "BG Remover", "+7"],
  },
  {
    name: "PDF Toolkit",
    count: 10,
    icon: "📄",
    iconBg: "rgba(124,92,255,0.1)",
    description:
      "Merge, split, compress, convert, lock, unlock, OCR & annotate PDFs.",
    tools: ["Merge", "Split", "Compress", "Word↔PDF", "OCR", "+5"],
  },
  {
    name: "File Converter",
    count: 8,
    icon: "🔄",
    iconBg: "rgba(0,200,150,0.1)",
    description:
      "Change file formats instantly — images, docs, video, audio & archives.",
    tools: ["JPG→PNG", "HEIC→JPG", "DOCX→PDF", "MP4→GIF", "+4"],
  },
  {
    name: "Video & GIF",
    count: 6,
    icon: "✂️",
    iconBg: "rgba(255,185,0,0.1)",
    description:
      "Trim video, extract frames, make GIFs, generate thumbnails & compress.",
    tools: ["Trimmer", "GIF Maker", "Compressor", "Thumbnail", "+2"],
  },
  {
    name: "Security & Privacy",
    count: 6,
    icon: "🔐",
    iconBg: "rgba(52,152,219,0.1)",
    description:
      "Encrypt files, redact sensitive info, generate strong passwords & hashes.",
    tools: ["Password Gen", "Hash Gen", "File Encrypt", "Text Encrypt", "+2"],
  },
  {
    name: "Text & Data",
    count: 7,
    icon: "📝",
    iconBg: "rgba(255,92,53,0.08)",
    description:
      "Format JSON, minify code, count words, diff text, CSV viewer & converter.",
    tools: ["JSON Format", "Word Count", "CSV→JSON", "Text Diff", "+3"],
  },
];

export const imageTools: SpotlightTool[] = [
  {
    icon: "📐",
    name: "Bulk Image Resizer",
    desc: "Resize multiple images by px, %, or preset (social, print)",
    badge: "Free",
  },
  {
    icon: "🗜️",
    name: "Smart Compressor",
    desc: "Lossy/lossless compress with live quality preview",
    badge: "Free",
  },
  {
    icon: "✨",
    name: "BG Remover (AI)",
    desc: "One-click background removal with edge refinement",
    badge: "New",
  },
  {
    icon: "🎨",
    name: "Color Palette Extractor",
    desc: "Extract dominant colors as HEX / CSS variables",
    badge: "Free",
  },
  {
    icon: "💧",
    name: "Watermark Tool",
    desc: "Add text/image watermarks with opacity & position control",
    badge: "Pro",
  },
];

export const pdfTools: SpotlightTool[] = [
  {
    icon: "📎",
    name: "PDF Merger",
    desc: "Drag-drop PDFs to merge in custom order",
    badge: "Free",
  },
  {
    icon: "✂️",
    name: "PDF Splitter",
    desc: "Extract pages, split by range or every N pages",
    badge: "Free",
  },
  {
    icon: "🔍",
    name: "PDF OCR",
    desc: "Extract searchable text from scanned PDFs",
    badge: "Pro",
  },
  {
    icon: "🔒",
    name: "PDF Lock / Unlock",
    desc: "Password-protect or remove PDF passwords",
    badge: "Free",
  },
  {
    icon: "🔄",
    name: "PDF ↔ Word / Excel",
    desc: "Accurate bidirectional conversions preserving layout",
    badge: "New",
  },
];

export const features: Feature[] = [
  {
    icon: "🔒",
    title: "Privacy First",
    desc: "Processing happens in your browser using WebAssembly & Canvas API. Files never leave your device for most tools. Those that need server-side processing auto-delete within 1 hour.",
  },
  {
    icon: "⚡",
    title: "Batch Processing",
    desc: "Upload 50+ files at once. Apply the same settings to all. Download as a single ZIP. Progress bar per file and overall. Works even on slow connections.",
  },
  {
    icon: "👁️",
    title: "Live Preview",
    desc: "Every tool shows a before/after split view as you adjust settings. No surprises on download. Compare original vs output size in real-time.",
  },
  {
    icon: "📱",
    title: "Works Everywhere",
    desc: "Fully responsive — desktop, tablet, mobile. PWA installable. Offline capable for browser-based tools. Share tool URLs directly for quick access.",
  },
  {
    icon: "🤖",
    title: "AI-Powered Tools",
    desc: "Background remover, image upscaler, PDF OCR, and auto-tag generator are powered by on-device ML models (ONNX Runtime) — no cloud API costs for basic tiers.",
  },
  {
    icon: "📋",
    title: "Tool History",
    desc: "Browser-local history of recent conversions. One-click re-process with same settings. Export your workflow as a recipe to share with teammates.",
  },
];

export const flowSteps: FlowStep[] = [
  {
    num: 1,
    title: "Pick a Tool",
    desc: "Search or browse by category. Instant tool discovery.",
  },
  {
    num: 2,
    title: "Drop Your File",
    desc: "Drag & drop or paste. Batch upload supported.",
  },
  {
    num: 3,
    title: "Configure",
    desc: "Adjust settings with live preview. Presets for common use-cases.",
  },
  {
    num: 4,
    title: "Download",
    desc: "Instant download. ZIP for bulk. Auto-delete files after session.",
  },
];

export const allTools: Tool[] = [
  // Image Tools
  { name: "Bulk Image Resizer", desc: "Resize multiple images by px, %, or preset (social, print)", category: "Images" },
  { name: "Smart Compressor", desc: "Lossy/lossless compress with live quality preview", category: "Images" },
  { name: "BG Remover (AI)", desc: "One-click background removal with edge refinement", category: "Images" },
  { name: "Color Palette Extractor", desc: "Extract dominant colors as HEX / CSS variables", category: "Images" },
  { name: "Watermark Tool", desc: "Add text/image watermarks with opacity & position control", category: "Images" },
  { name: "Image Converter", desc: "Convert between JPG, PNG, WEBP, AVIF, and more formats", category: "Images" },
  { name: "Image Cropper", desc: "Crop images with aspect ratio presets", category: "Images" },
  { name: "Image Rotator", desc: "Rotate and flip images", category: "Images" },
  { name: "Image Metadata Editor", desc: "View and edit EXIF, IPTC, and GPS data", category: "Images" },
  { name: "Image Filter Editor", desc: "Apply filters and adjust brightness, contrast, saturation", category: "Images" },
  { name: "Image Upscaler", desc: "AI-powered image upscaling", category: "Images" },
  { name: "Image Effects", desc: "Add effects like blur, sharpen, and vignette", category: "Images" },
  // PDF Tools
  { name: "PDF Merger", desc: "Drag-drop PDFs to merge in custom order", category: "PDF" },
  { name: "PDF Splitter", desc: "Extract pages, split by range or every N pages", category: "PDF" },
  { name: "PDF OCR", desc: "Extract searchable text from scanned PDFs", category: "PDF" },
  { name: "PDF Lock / Unlock", desc: "Password-protect or remove PDF passwords", category: "PDF" },
  { name: "PDF ↔ Word / Excel", desc: "Accurate bidirectional conversions preserving layout", category: "PDF" },
  { name: "PDF Compressor", desc: "Reduce PDF file size without losing quality", category: "PDF" },
  { name: "PDF to Image", desc: "Convert PDF pages to images", category: "PDF" },
  { name: "Image to PDF", desc: "Convert images to PDF", category: "PDF" },
  { name: "PDF Redactor", desc: "Redact sensitive information from PDFs", category: "PDF" },
  { name: "PDF Annotator", desc: "Add annotations to PDFs", category: "PDF" },
  // File Converter
  { name: "JPG→PNG", desc: "Convert JPG to PNG", category: "Files" },
  { name: "HEIC→JPG", desc: "Convert HEIC to JPG", category: "Files" },
  { name: "DOCX→PDF", desc: "Convert DOCX to PDF", category: "Files" },
  { name: "MP4→GIF", desc: "Convert MP4 to GIF", category: "Files" },
  { name: "PDF→DOCX", desc: "Convert PDF to DOCX", category: "Files" },
  { name: "PNG→JPG", desc: "Convert PNG to JPG", category: "Files" },
  { name: "WEBP→PNG", desc: "Convert WEBP to PNG", category: "Files" },
  { name: "AVIF→JPG", desc: "Convert AVIF to JPG", category: "Files" },
  // Video & GIF
  { name: "Trimmer", desc: "Trim video", category: "Video" },
  { name: "GIF Maker", desc: "Make GIFs from videos", category: "Video" },
  { name: "Compressor", desc: "Compress video files", category: "Video" },
  { name: "Thumbnail", desc: "Generate video thumbnails", category: "Video" },
  { name: "Video to Audio", desc: "Extract audio from video", category: "Video" },
  { name: "GIF to MP4", desc: "Convert GIF to MP4", category: "Video" },
  // Security & Privacy
  { name: "Password Generator", desc: "Generate strong, random passwords", category: "Security" },
  { name: "Hash Generator", desc: "Generate SHA and MD5 hashes", category: "Security" },
  { name: "File Encrypt/Decrypt", desc: "Encrypt and decrypt files with AES-256", category: "Security" },
  { name: "Text Encrypt/Decrypt", desc: "Encrypt and decrypt text securely", category: "Security" },
  { name: "Security Scanner", desc: "Analyze files for security risks", category: "Security" },
  { name: "Random Generator", desc: "Generate random strings, numbers, UUIDs", category: "Security" },
  // Text & Data
  { name: "JSON Format", desc: "Format JSON data", category: "Text" },
  { name: "Word Count", desc: "Count words", category: "Text" },
  { name: "CSV→JSON", desc: "Convert CSV to JSON", category: "Text" },
  { name: "Text Diff", desc: "Compare text differences", category: "Text" },
  { name: "Markdown→HTML", desc: "Convert Markdown to HTML", category: "Text" },
  { name: "HTML→Markdown", desc: "Convert HTML to Markdown", category: "Text" },
  { name: "Text Minifier", desc: "Minify text", category: "Text" },
];

export const plans: Plan[] = [
  {
    name: "Free",
    price: "₹0",
    period: "/ forever",
    desc: "Everything you need daily",
    features: [
      "All core tools",
      "Up to 10 files / batch",
      "25 MB file size limit",
      "Standard processing speed",
      "Watermarked PDF export*",
    ],
    featured: false,
  },
  {
    name: "Pro",
    price: "₹199",
    period: "/ month",
    desc: "For power users",
    features: [
      "All tools + AI features",
      "Unlimited batch size",
      "500 MB file size limit",
      "Priority processing",
      "No watermarks, no ads",
    ],
    featured: true,
  },
  {
    name: "Teams",
    price: "₹999",
    period: "/ month",
    desc: "For small businesses",
    features: [
      "Up to 10 seats",
      "API access (1000 calls/mo)",
      "1 GB file size limit",
      "Workflow automation",
      "Priority support",
    ],
    featured: false,
  },
];

export const badges: Record<BadgeKey, { bg: string; color: string }> = {
  Free: { bg: "rgba(0,200,150,0.12)", color: "#00A87A" },
  Pro: { bg: "rgba(124,92,255,0.12)", color: "#7C5CFF" },
  New: { bg: "rgba(255,92,53,0.12)", color: "#FF5C35" },
};

export const NAV_TABS = ["All Tools", "Images", "PDF", "Files", "Security", "Video"] as const;

export const HERO_STATS = [
  { num: "48+", label: "Tools available" },
  { num: "100%", label: "Browser-based" },
  { num: "0 MB", label: "Server uploads*" },
  { num: "2M+", label: "Files processed" },
] as const;

export const CATEGORY_ICON_MAP: Record<string, string> = {
  Images: "🖼️",
  PDF: "📄",
  Files: "🔄",
  Video: "✂️",
  Security: "🔐",
  Text: "📝",
};

export const CATEGORY_BG_MAP: Record<string, string> = {
  Images: "rgba(255,92,53,0.1)",
  PDF: "rgba(124,92,255,0.1)",
  Files: "rgba(0,200,150,0.1)",
  Video: "rgba(255,185,0,0.1)",
  Security: "rgba(52,152,219,0.1)",
  Text: "rgba(255,92,53,0.08)",
};
