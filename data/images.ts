// Synchronized with the main registry in data/files.tsx.
// Edit data/files.tsx first, then update this file to match.

export type BadgeKey = "Free" | "Pro" | "New" | "Coming Soon";

export interface ImageTool {
  icon: string;
  name: string;
  desc: string;
  badge: BadgeKey;
  path: string;
}

export const imageTools: ImageTool[] = [
  {
    icon: "🗜️",
    name: "Smart Compressor",
    desc: "Compress images with smart optimization using WebP format for best results.",
    badge: "Free",
    path: "/images/compressor",
  },
  {
    icon: "🔄",
    name: "Image Converter",
    desc: "Convert images between JPG, PNG, WEBP, and AVIF formats with quality control.",
    badge: "Free",
    path: "/images/converter",
  },
  {
    icon: "✂️",
    name: "Image Cropper",
    desc: "Crop images with freehand or preset aspect ratio. Drag the crop box to select area.",
    badge: "Free",
    path: "/images/cropper",
  },
  {
    icon: "🧬",
    name: "Design System Generator",
    desc: "Upload UI screenshots to extract palette, typography, and actionable design notes.",
    badge: "New",
    path: "/images/design-system-generator",
  },
  {
    icon: "🎭",
    name: "Image Effects",
    desc: "Apply artistic effects like sepia, vintage, HDR, warm, cool, sketch, and emboss.",
    badge: "Free",
    path: "/images/effects",
  },
  {
    icon: "🌈",
    name: "Color Palette Extractor",
    desc: "Extract dominant colors from images and export as HEX, RGB, or HSL.",
    badge: "Free",
    path: "/images/extractor",
  },
  {
    icon: "🎨",
    name: "Image Filter Editor",
    desc: "Apply advanced filters with precise control over brightness, contrast, saturation, blur, and grayscale.",
    badge: "Free",
    path: "/images/filter",
  },
  {
    icon: "📊",
    name: "Image Metadata Editor",
    desc: "View and edit basic EXIF metadata (title, description, artist, copyright) for JPEG images.",
    badge: "Free",
    path: "/images/metadata",
  },
  {
    icon: "✨",
    name: "BG Remover (AI)",
    desc: "AI-powered background removal using the RMBG-1.4 model.",
    badge: "Pro",
    path: "/images/remover",
  },
  {
    icon: "📐",
    name: "Bulk Image Resizer",
    desc: "Resize multiple images by pixels, percentage, or preset dimensions for social media, print, or web.",
    badge: "Free",
    path: "/images/resizer",
  },
  {
    icon: "🔄",
    name: "Image Rotator",
    desc: "Rotate and flip images by 90, 180, 270 degrees, or custom angles.",
    badge: "Free",
    path: "/images/rotator",
  },
  {
    icon: "🔍",
    name: "Image Upscaler",
    desc: "Upscale images using Gemini AI image editing. Requires a Gemini API key.",
    badge: "Pro",
    path: "/images/upscaler",
  },
  {
    icon: "💧",
    name: "Watermark Tool",
    desc: "Add text watermarks with customizable text, font size, opacity, color, and position.",
    badge: "Free",
    path: "/images/watermark",
  },
];

export const badges: Record<BadgeKey, { bg: string; color: string }> = {
  Free: { bg: "rgba(0,200,150,0.12)", color: "#00A87A" },
  Pro: { bg: "rgba(124,92,255,0.12)", color: "#7C5CFF" },
  New: { bg: "rgba(255,92,53,0.12)", color: "#FF5C35" },
  "Coming Soon": { bg: "rgba(107,114,128,0.12)", color: "#6B7280" },
};

export const IMAGE_PAGE_STATS = [
  { num: String(imageTools.length), label: "Tools available" },
  { num: "100%", label: "Browser-based" },
  { num: "0 MB", label: "Server uploads*" },
] as const;
