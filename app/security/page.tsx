import type { Metadata } from "next";
import { securityTools } from "@/data/security";
import SecurityNavbar from "@/components/security/SecurityNavbar";
import SecurityPageHeader from "@/components/security/SecurityPageHeader";
import SecurityToolsGrid from "@/components/security/SecurityToolsGrid";
import Footer from "@/components/home/Footer";

export const metadata: Metadata = {
  title: "Security Tools - Password Generator, Hash, Encrypt | ToolKit",
  description: "Free online security tools: password generator, hash generator, file/text encryption, random generator. All processing happens locally in your browser.",
  keywords: "security tools, password generator, hash generator, encrypt, decrypt, AES encryption, random generator, security scanner",
  openGraph: {
    title: "Security Tools - Free Online Privacy Tools",
    description: "Generate passwords, hashes, and encrypt files locally. All processing happens in your browser - nothing is sent to any server.",
  },
};

export default function SecurityPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="max-w-215 mx-auto px-2 lg:px-0 pt-5 pb-12">
        <SecurityNavbar />
        <SecurityPageHeader />
        <SecurityToolsGrid tools={securityTools} />
        <Footer />
      </div>
    </div>
  );
}
