// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type BadgeKey = "Free" | "Pro" | "New";

export interface ImageTool {
  icon: string;
  name: string;
  desc: string;
  badge: BadgeKey;
  path: string;
}

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

export const imageTools: ImageTool[] = [
  {
    icon: "📐",
    name: "Bulk Image Resizer",
    desc: "Resize multiple images by px, %, or preset (social, print)",
    badge: "Free",
    path: "/images/resizer",
  },
  {
    icon: "🗜️",
    name: "Smart Compressor",
    desc: "Lossy/lossless compress with live quality preview",
    badge: "Free",
    path: "/images/compressor",
  },
  {
    icon: "✨",
    name: "BG Remover (AI)",
    desc: "One-click background removal with edge refinement",
    badge: "New",
    path: "/images/remover",
  },
  {
    icon: "🎨",
    name: "Color Palette Extractor",
    desc: "Extract dominant colors as HEX / CSS variables",
    badge: "Free",
    path: "/images/extractor",
  },
  {
    icon: "💧",
    name: "Watermark Tool",
    desc: "Add text/image watermarks with opacity & position control",
    badge: "Pro",
    path: "/images/watermark",
  },
  {
    icon: "🔄",
    name: "Image Converter",
    desc: "Convert between JPG, PNG, WEBP, AVIF, and more formats",
    badge: "Free",
    path: "/files/converter",
  },
  {
    icon: "✂️",
    name: "Image Cropper",
    desc: "Crop images with aspect ratio presets",
    badge: "Free",
    path: "/images/cropper",
  },
  {
    icon: "🔄",
    name: "Image Rotator",
    desc: "Rotate and flip images",
    badge: "Free",
    path: "/images/rotator",
  },
  {
    icon: "📊",
    name: "Image Metadata Editor",
    desc: "View and edit EXIF, IPTC, and GPS data",
    badge: "Pro",
    path: "/images/metadata",
  },
  {
    icon: "🌈",
    name: "Image Filter Editor",
    desc: "Apply filters and adjust brightness, contrast, saturation",
    badge: "Pro",
    path: "/images/filter",
  },
  {
    icon: "🔍",
    name: "Image Upscaler",
    desc: "AI-powered image upscaling",
    badge: "Pro",
    path: "/images/upscaler",
  },
  {
    icon: "🎭",
    name: "Image Effects",
    desc: "Add effects like blur, sharpen, and vignette",
    badge: "Pro",
    path: "/images/effects",
  },
  {
    icon: "🧬",
    name: "Design System Generator",
    desc: "Extract color palette, typography, and design notes from UI screenshots",
    badge: "New",
    path: "/images/design-system-generator",
  },
];

export const badges: Record<
  BadgeKey,
  { bg: string; color: string }
> = {
  Free: { bg: "rgba(0,200,150,0.12)", color: "#00A87A" },
  Pro: { bg: "rgba(124,92,255,0.12)", color: "#7C5CFF" },
  New: { bg: "rgba(255,92,53,0.12)", color: "#FF5C35" },
};

export const IMAGE_PAGE_STATS = [
  {
    num: String(imageTools.length),
    label: "Tools available",
  },
  { num: "100%", label: "Browser-based" },
  { num: "0 MB", label: "Server uploads*" },
] as const;
