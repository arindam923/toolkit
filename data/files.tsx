
import type { ReactNode } from "react";
import {
  Search,
  FileText,
  Image as ImageIcon,
  Shield,
  Type,
  Sun,
  Moon,
  ArrowRight,
  Zap,
  Cpu,
  Download,
  Lock,
  Scissors,
  Layers,
  Maximize,
  PenTool,
  Grid,
  ChevronRight,
  Command,
} from "lucide-react";

export type BadgeKey = "Free" | "Pro" | "New" | "Coming Soon";

export interface FileTool {
  icon: string;
  name: string;
  desc: string;
  badge: BadgeKey;
  path: string;
  fromFormat: string;
  toFormat: string;
  comingSoon?: boolean;
}

export type Category =
  | "All"
  | "PDF"
  | "Image"
  | "File"
  | "Security"
  | "Video"
  | "Text";

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: Category;
  icon: ReactNode;
  isPaid: boolean;
  mcpAvailable: boolean;
  status: "Stable" | "Beta" | "Legacy";
  href: string;
}
export const CATEGORIES: Category[] = [
  "All",
  "PDF",
  "Image",
  "File",
  "Security",
  "Text",
];

export const TOOLS: Tool[] = [
  {
    id: "img-compress",
    name: "Smart Compressor",
    description:
      "Compress images with smart optimization using WebP format for best results. Adjust quality and maximum dimensions.",
    category: "Image",
    href: "/images/compressor",
    icon: <ImageIcon className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "img-converter",
    name: "Image Converter",
    description:
      "Convert images between JPG, PNG, WEBP, and AVIF formats with quality control.",
    category: "Image",
    href: "/images/converter",
    icon: <ImageIcon className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "img-cropper",
    name: "Image Cropper",
    description:
      "Crop images with freehand or preset aspect ratio. Drag the crop box to select area.",
    category: "Image",
    href: "/images/cropper",
    icon: <Scissors className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: false,
    status: "Stable",
  },
  {
    id: "design-system",
    name: "Design System Generator",
    description:
      "Upload UI screenshots to extract palette, typography, and actionable design notes.",
    category: "Image",
    href: "/images/design-system-generator",
    icon: <Layers className="w-4 h-4" />,
    isPaid: true,
    mcpAvailable: true,
    status: "Beta",
  },
  {
    id: "img-effects",
    name: "Image Effects",
    description:
      "Apply artistic effects like sepia, vintage, HDR, warm, cool, sketch, and emboss with adjustable intensity. See real-time preview before downloading.",
    category: "Image",
    href: "/images/effects",
    icon: <Zap className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: false,
    status: "Stable",
  },
  {
    id: "color-extract",
    name: "Color Palette Extractor",
    description:
      "Extract dominant colors from images and export as HEX, RGB, or HSL. Perfect for designers.",
    category: "Image",
    href: "/images/extractor",
    icon: <PenTool className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "img-filter",
    name: "Image Filter Editor",
    description:
      "Apply advanced filters with precise control over brightness, contrast, saturation, blur, and grayscale. See real-time preview before downloading.",
    category: "Image",
    href: "/images/filter",
    icon: <Zap className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: false,
    status: "Stable",
  },
  {
    id: "img-metadata",
    name: "Image Metadata Editor",
    description:
      "View and edit EXIF, IPTC, and GPS metadata. Add copyright information, author details, and descriptions.",
    category: "Image",
    href: "/images/metadata",
    icon: <FileText className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "bg-remover",
    name: "BG Remover (AI)",
    description:
      "AI-powered background removal. Remove backgrounds from images automatically with high precision using RMBG-1.4 model.",
    category: "Image",
    href: "/images/remover",
    icon: <ImageIcon className="w-4 h-4" />,
    isPaid: true,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "img-resizer",
    name: "Bulk Image Resizer",
    description:
      "Resize multiple images by pixels, percentage, or preset dimensions for social media, print, or web.",
    category: "Image",
    href: "/images/resizer",
    icon: <Maximize className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "img-rotator",
    name: "Image Rotator",
    description:
      "Rotate and flip images by 90 degrees, 180 degrees, or custom angles. Supports horizontal and vertical flips. See real-time preview before downloading.",
    category: "Image",
    href: "/images/rotator",
    icon: <ImageIcon className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: false,
    status: "Stable",
  },
  {
    id: "img-upscaler",
    name: "Image Upscaler",
    description:
      "Upscale images using AI with multiple free strategies. Works in any browser!",
    category: "Image",
    href: "/images/upscaler",
    icon: <Maximize className="w-4 h-4" />,
    isPaid: true,
    mcpAvailable: true,
    status: "Beta",
  },
  {
    id: "img-watermark",
    name: "Watermark Tool",
    description:
      "Add text watermarks with customizable text, font size, opacity, color, and position. See real-time preview before downloading.",
    category: "Image",
    href: "/images/watermark",
    icon: <Type className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: false,
    status: "Stable",
  },

  {
    id: "pdf-annotate",
    name: "PDF Annotator",
    description:
      "Add annotations, comments, highlights, and other markups to PDF documents.",
    category: "PDF",
    href: "/pdf/annotate",
    icon: <PenTool className="w-4 h-4" />,
    isPaid: true,
    mcpAvailable: false,
    status: "Beta",
  },
  {
    id: "pdf-compress",
    name: "PDF Compressor",
    description:
      "Reduce PDF file size without losing quality using advanced compression algorithms.",
    category: "PDF",
    href: "/pdf/compress",
    icon: <Download className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "pdf-convert",
    name: "PDF to Word",
    description:
      "Convert PDF documents to editable Word (.docx) files with preserved formatting.",
    category: "PDF",
    href: "/pdf/convert",
    icon: <FileText className="w-4 h-4" />,
    isPaid: true,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "img-to-pdf",
    name: "Image to PDF",
    description:
      "Convert images to PDF documents. Support for JPG, PNG, WebP, and other common image formats.",
    category: "PDF",
    href: "/pdf/image-to-pdf",
    icon: <Layers className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "pdf-merge",
    name: "PDF Merger",
    description:
      "Combine multiple PDF files into a single document. Drag and drop to reorder pages.",
    category: "PDF",
    href: "/pdf/merge",
    icon: <Layers className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "pdf-ocr",
    name: "PDF OCR",
    description:
      "Extract text from PDF documents. Perfect for copying content from scanned documents.",
    category: "PDF",
    href: "/pdf/ocr",
    icon: <Type className="w-4 h-4" />,
    isPaid: true,
    mcpAvailable: true,
    status: "Beta",
  },
  {
    id: "pdf-redact",
    name: "PDF Redactor",
    description:
      "Redact sensitive information from PDF documents to ensure privacy and compliance.",
    category: "PDF",
    href: "/pdf/redact",
    icon: <Shield className="w-4 h-4" />,
    isPaid: true,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "pdf-security",
    name: "PDF Lock / Unlock",
    description:
      "Remove password protection from PDF documents. (Password protection coming soon)",
    category: "PDF",
    href: "/pdf/security",
    icon: <Lock className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "pdf-split",
    name: "PDF Splitter",
    description:
      "Extract specific pages or ranges from PDF documents. Split by single page, range, or every N pages.",
    category: "PDF",
    href: "/pdf/split",
    icon: <Scissors className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "pdf-to-img",
    name: "PDF to Image",
    description:
      "Convert PDF pages to high-quality images in various formats including JPG, PNG, and WebP.",
    category: "PDF",
    href: "/pdf/to-image",
    icon: <ImageIcon className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },

  {
    id: "avif-to-jpg",
    name: "AVIF to JPG Converter",
    description: "Convert AVIF images to JPG format for better compatibility.",
    category: "File",
    href: "/files/avif-to-jpg",
    icon: <FileText className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "docx-to-pdf",
    name: "DOCX to PDF Converter",
    description: "Convert Word documents to PDF format.",
    category: "File",
    href: "/files/docx-to-pdf",
    icon: <FileText className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "heic-to-jpg",
    name: "HEIC to JPG Converter",
    description: "Convert HEIC images to JPG format for better compatibility.",
    category: "File",
    href: "/files/heic-to-jpg",
    icon: <FileText className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "jpg-to-png",
    name: "JPG to PNG Converter",
    description: "Convert JPG images to PNG format with transparency support.",
    category: "File",
    href: "/files/converter?from=jpg&to=png",
    icon: <FileText className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "pdf-to-docx",
    name: "PDF to DOCX Converter",
    description: "Convert PDF documents to editable Word format.",
    category: "File",
    href: "/files/pdf-to-docx",
    icon: <FileText className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "png-to-jpg",
    name: "PNG to JPG Converter",
    description: "Convert PNG images to JPG format for smaller file sizes.",
    category: "File",
    href: "/files/converter?from=png&to=jpg",
    icon: <FileText className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "image-converter",
    name: "Image Converter",
    description: "Convert between JPG, PNG, WEBP, and AVIF formats. Supports batch conversion with quality control.",
    category: "File",
    href: "/files/converter",
    icon: <FileText className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "png-to-webp",
    name: "PNG to WEBP Converter",
    description: "Convert PNG images to WEBP format for better compression.",
    category: "File",
    href: "/files/converter?from=png&to=webp",
    icon: <FileText className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "webp-to-png",
    name: "WEBP to PNG Converter",
    description: "Convert WEBP images to PNG format.",
    category: "File",
    href: "/files/converter?from=webp&to=png",
    icon: <FileText className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "webp-to-jpg",
    name: "WEBP to JPG Converter",
    description: "Convert WEBP images to JPG format for better compatibility.",
    category: "File",
    href: "/files/converter?from=webp&to=jpg",
    icon: <FileText className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "jpg-to-webp",
    name: "JPG to WEBP Converter",
    description: "Convert JPG images to WEBP format for better compression.",
    category: "File",
    href: "/files/converter?from=jpg&to=webp",
    icon: <FileText className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },

  {
    id: "file-encrypt",
    name: "File Encrypt/Decrypt",
    description:
      "Encrypt files with AES-256-GCM using a password, or decrypt previously encrypted files.",
    category: "Security",
    href: "/security_disabled/file-encrypt",
    icon: <Lock className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "hash-gen",
    name: "Hash Generator",
    description:
      "Generate cryptographic hashes (SHA-256, SHA-512, MD5, SHA-1) from text or files.",
    category: "Security",
    href: "/security/hash-generator",
    icon: <Shield className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "password-gen",
    name: "Password Generator",
    description:
      "Generate strong, random passwords with customizable options including length, characters, and complexity.",
    category: "Security",
    href: "/security/password-generator",
    icon: <Shield className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "text-encrypt",
    name: "Text Encrypt/Decrypt",
    description:
      "Encrypt and decrypt text with secure AES encryption.",
    category: "Security",
    href: "/security/text-encrypt",
    icon: <Lock className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "security-scanner",
    name: "Security Scanner",
    description:
      "Analyze files for metadata, permissions, and potential security risks.",
    category: "Security",
    href: "/security/scanner",
    icon: <Shield className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: false,
    status: "Stable",
  },
  {
    id: "random-generator",
    name: "Random Generator",
    description:
      "Generate random strings, numbers, and cryptographic keys.",
    category: "Security",
    href: "/security/random-generator",
    icon: <Shield className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: false,
    status: "Stable",
  },
  // Text Tools
  {
    id: "json-format",
    name: "JSON Format",
    description:
      "Format and validate JSON data with proper indentation.",
    category: "Text",
    href: "/text/json-format",
    icon: <Type className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "word-count",
    name: "Word Count",
    description:
      "Count words, characters, sentences, and paragraphs in text.",
    category: "Text",
    href: "/text/word-count",
    icon: <Type className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: false,
    status: "Stable",
  },
  {
    id: "csv-json",
    name: "CSV to JSON",
    description:
      "Convert CSV data to JSON format.",
    category: "Text",
    href: "/text/csv-json",
    icon: <Type className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "text-diff",
    name: "Text Diff",
    description:
      "Compare text differences between two strings.",
    category: "Text",
    href: "/text/text-diff",
    icon: <Type className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: false,
    status: "Stable",
  },
  {
    id: "markdown-html",
    name: "Markdown to HTML",
    description:
      "Convert Markdown to HTML.",
    category: "Text",
    href: "/text/markdown-html",
    icon: <Type className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "html-markdown",
    name: "HTML to Markdown",
    description:
      "Convert HTML to Markdown.",
    category: "Text",
    href: "/text/html-markdown",
    icon: <Type className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: true,
    status: "Stable",
  },
  {
    id: "text-minifier",
    name: "Text Minifier",
    description:
      "Minify HTML, CSS, and JavaScript code.",
    category: "Text",
    href: "/text/text-minifier",
    icon: <Type className="w-4 h-4" />,
    isPaid: false,
    mcpAvailable: false,
    status: "Stable",
  },
];

export const fileTools: FileTool[] = [
  {
    icon: "🖼️",
    name: "JPG to PNG",
    desc: "Convert JPG images to PNG format",
    badge: "Free",
    path: "/files/jpg-to-png",
    fromFormat: "jpg",
    toFormat: "png",
  },
  {
    icon: "🖼️",
    name: "PNG to JPG",
    desc: "Convert PNG images to JPG format",
    badge: "Free",
    path: "/files/png-to-jpg",
    fromFormat: "png",
    toFormat: "jpg",
  },
  {
    icon: "🖼️",
    name: "WEBP to PNG",
    desc: "Convert WEBP images to PNG format",
    badge: "Free",
    path: "/files/webp-to-png",
    fromFormat: "webp",
    toFormat: "png",
  },
  {
    icon: "🖼️",
    name: "PNG to WEBP",
    desc: "Convert PNG images to WEBP format",
    badge: "Free",
    path: "/files/png-to-webp",
    fromFormat: "png",
    toFormat: "webp",
  },
  {
    icon: "🖼️",
    name: "HEIC to JPG",
    desc: "Convert HEIC images to JPG format",
    badge: "Free",
    path: "/files/heic-to-jpg",
    fromFormat: "heic",
    toFormat: "jpg",
  },
  {
    icon: "🖼️",
    name: "AVIF to JPG",
    desc: "Convert AVIF images to JPG format",
    badge: "Free",
    path: "/files/avif-to-jpg",
    fromFormat: "avif",
    toFormat: "jpg",
  },
  {
    icon: "📄",
    name: "DOCX to PDF",
    desc: "Convert Word documents to PDF",
    badge: "Coming Soon",
    path: "/files/docx-to-pdf",
    fromFormat: "docx",
    toFormat: "pdf",
    comingSoon: true,
  },
  {
    icon: "📄",
    name: "PDF to DOCX",
    desc: "Convert PDF to Word documents",
    badge: "Coming Soon",
    path: "/files/pdf-to-docx",
    fromFormat: "pdf",
    toFormat: "docx",
    comingSoon: true,
  },
  {
    icon: "🎬",
    name: "MP4 to GIF",
    desc: "Convert videos to animated GIFs",
    badge: "Coming Soon",
    path: "#",
    fromFormat: "mp4",
    toFormat: "gif",
    comingSoon: true,
  },
  {
    icon: "🎬",
    name: "GIF to MP4",
    desc: "Convert GIFs to MP4 videos",
    badge: "Coming Soon",
    path: "#",
    fromFormat: "gif",
    toFormat: "mp4",
    comingSoon: true,
  },
  {
    icon: "📄",
    name: "Excel to PDF",
    desc: "Convert Excel spreadsheets to PDF",
    badge: "Coming Soon",
    path: "#",
    fromFormat: "xlsx",
    toFormat: "pdf",
    comingSoon: true,
  },
  {
    icon: "📄",
    name: "PPT to PDF",
    desc: "Convert PowerPoint to PDF",
    badge: "Coming Soon",
    path: "#",
    fromFormat: "pptx",
    toFormat: "pdf",
    comingSoon: true,
  },
];

export const badges: Record<BadgeKey, { bg: string; color: string }> = {
  Free: { bg: "rgba(0,200,150,0.12)", color: "#00A87A" },
  Pro: { bg: "rgba(124,92,255,0.12)", color: "#7C5CFF" },
  New: { bg: "rgba(255,92,53,0.12)", color: "#FF5C35" },
  "Coming Soon": { bg: "rgba(107,114,128,0.12)", color: "#6B7280" },
};

export const FILES_PAGE_STATS = [
  { num: String(fileTools.length), label: "Tools available" },
  { num: "100%", label: "Browser-based" },
  { num: "0 MB", label: "Server uploads*" },
] as const;
