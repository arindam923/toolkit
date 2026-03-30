import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "File Converter - JPG, PNG, WEBP, HEIC, DOCX | ToolKit",
  description: "Free online file converter: JPG to PNG, PNG to JPG, WEBP, HEIC to JPG, DOCX to PDF, and more. Fast, secure, browser-based conversion.",
  keywords: "file converter, image converter, jpg to png, png to jpg, webp converter, heic converter, docx to pdf, convert files online",
  openGraph: {
    title: "File Converter - Free Online File Conversion",
    description: "Convert between all major file formats online. All conversions happen in your browser - files never leave your device.",
  },
};

export default function FilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
