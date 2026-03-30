import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Free online security tool. All processing happens in your browser - your data never leaves your device.",
  keywords: "security tool, free security tool, browser-based security tool, encrypt, decrypt",
};

export default function SecurityToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
