import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Free online image processing tool. All processing happens in your browser - your files never leave your device.",
  keywords: "image processing, image tool, free image tool, browser-based image tool",
};

export default function ImagesToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
