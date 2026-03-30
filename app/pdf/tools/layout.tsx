import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Free online PDF processing tool. All processing happens in your browser - your files never leave your device.",
  keywords: "pdf processing, pdf tool, free pdf tool, browser-based pdf tool",
};

export default function PdfToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
