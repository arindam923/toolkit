import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Tools - Resize, Compress, Convert & More | ToolKit",
  description: "Free online image tools: resize, compress, convert, crop, rotate, flip, watermark, remove background, extract colors, and more. 100% browser-based, privacy-first.",
  keywords: "image tools, image compressor, image resizer, image converter, background remover, image cropper, watermark tool, color extractor, image effects",
  openGraph: {
    title: "Image Tools - Free Online Image Processing",
    description: "Resize, compress, convert, and edit images online. All tools run in your browser - files never leave your device.",
  },
};

export default function ImagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
