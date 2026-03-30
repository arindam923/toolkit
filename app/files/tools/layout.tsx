import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Free online file converter. All processing happens in your browser - your files never leave your device.",
  keywords: "file converter, file conversion, free file converter, browser-based converter",
};

export default function FilesToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
