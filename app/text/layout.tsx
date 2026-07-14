import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text & Data Tools",
  description: "Text processing, formatting, and conversion utilities.",
};

export default function TextLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
