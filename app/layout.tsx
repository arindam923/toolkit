import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ToolKit - Every tool you need, in one place",
  description: "Compress, convert, resize, remove backgrounds, merge PDFs, extract text — all your daily file tasks done fast, in your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
