// Synchronized with the main registry in data/files.tsx.
// Edit data/files.tsx first, then update this file to match.

export type BadgeKey = "Free" | "Pro" | "New" | "Coming Soon";

export interface SecurityTool {
  icon: string;
  name: string;
  desc: string;
  badge: BadgeKey;
  path: string;
}

export const securityTools: SecurityTool[] = [
  {
    icon: "📁",
    name: "File Encrypt/Decrypt",
    desc: "Encrypt and decrypt files using AES-256-GCM with PBKDF2 key derivation.",
    badge: "Free",
    path: "/security/file-encrypt",
  },
  {
    icon: "🔐",
    name: "Hash Generator",
    desc: "Generate SHA-1, SHA-256, and SHA-512 hashes from files or text.",
    badge: "Free",
    path: "/security/hash-generator",
  },
  {
    icon: "🔑",
    name: "Password Generator",
    desc: "Generate strong, random passwords with customizable options.",
    badge: "Free",
    path: "/security/password-generator",
  },
  {
    icon: "🎲",
    name: "Random Generator",
    desc: "Generate random strings, numbers, UUIDs, hex buffers, and base64 data.",
    badge: "Free",
    path: "/security/random-generator",
  },
  {
    icon: "🔍",
    name: "Security Scanner",
    desc: "Analyze files for metadata, magic bytes, entropy, and integrity hashes.",
    badge: "Free",
    path: "/security/scanner",
  },
  {
    icon: "📝",
    name: "Text Encrypt/Decrypt",
    desc: "Encrypt and decrypt text with AES-256-GCM.",
    badge: "Free",
    path: "/security/text-encrypt",
  },
];

export const badges: Record<BadgeKey, { bg: string; color: string }> = {
  Free: { bg: "rgba(0,200,150,0.12)", color: "#00A87A" },
  Pro: { bg: "rgba(124,92,255,0.12)", color: "#7C5CFF" },
  New: { bg: "rgba(255,92,53,0.12)", color: "#FF5C35" },
  "Coming Soon": { bg: "rgba(107,114,128,0.12)", color: "#6B7280" },
};

export const SECURITY_PAGE_STATS = [
  { num: String(securityTools.length), label: "Tools available" },
  { num: "100%", label: "Browser-based" },
  { num: "0 MB", label: "Server uploads*" },
] as const;
