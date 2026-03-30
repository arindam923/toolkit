import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security Tools - Password Generator, Hash, Encrypt | ToolKit",
  description: "Free online security tools: password generator, hash generator, file/text encryption, random generator. All processing happens locally in your browser.",
  keywords: "security tools, password generator, hash generator, encrypt, decrypt, AES encryption, random generator, security scanner",
  openGraph: {
    title: "Security Tools - Free Online Privacy Tools",
    description: "Generate passwords, hashes, and encrypt files locally. All processing happens in your browser - nothing is sent to any server.",
  },
};

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
