// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

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
