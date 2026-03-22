// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type BadgeKey = "Free" | "Pro" | "New";

export interface SecurityTool {
  icon: string;
  name: string;
  desc: string;
  badge: BadgeKey;
  path: string;
}

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

export const securityTools: SecurityTool[] = [
  {
    icon: "🔑",
    name: "Password Generator",
    desc: "Generate strong, random passwords with customizable options",
    badge: "Free",
    path: "/security/password-generator",
  },
  {
    icon: "🔐",
    name: "Hash Generator",
    desc: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes from files or text",
    badge: "Free",
    path: "/security/hash-generator",
  },
  {
    icon: "📁",
    name: "File Encrypt/Decrypt",
    desc: "Encrypt and decrypt files using AES-256 encryption",
    badge: "Pro",
    path: "/security/file-encrypt",
  },
  {
    icon: "📝",
    name: "Text Encrypt/Decrypt",
    desc: "Encrypt and decrypt text with secure AES encryption",
    badge: "Pro",
    path: "/security/text-encrypt",
  },
  {
    icon: "🔍",
    name: "Security Scanner",
    desc: "Analyze files for metadata, permissions, and potential security risks",
    badge: "Free",
    path: "/security/scanner",
  },
  {
    icon: "🎲",
    name: "Random Generator",
    desc: "Generate random strings, numbers, and cryptographic keys",
    badge: "Free",
    path: "/security/random-generator",
  },
];

export const badges: Record<BadgeKey, { bg: string; color: string }> = {
  Free: { bg: "rgba(0,200,150,0.12)", color: "#00A87A" },
  Pro: { bg: "rgba(124,92,255,0.12)", color: "#7C5CFF" },
  New: { bg: "rgba(255,92,53,0.12)", color: "#FF5C35" },
};

export const SECURITY_PAGE_STATS = [
  { num: String(securityTools.length), label: "Tools available" },
  { num: "100%", label: "Browser-based" },
  { num: "0 MB", label: "Server uploads*" },
] as const;
