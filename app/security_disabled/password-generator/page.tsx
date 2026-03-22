"use client";

import { useState, useCallback } from "react";
import Footer from "@/components/home/Footer";
import ToolHeader from "@/components/shared/ToolHeader";

const CHARS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

export default function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState("");
  const [includeLower, setIncludeLower] = useState(true);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  const generatePassword = useCallback(() => {
    let chars = "";
    if (includeLower) chars += CHARS.lowercase;
    if (includeUpper) chars += CHARS.uppercase;
    if (includeNumbers) chars += CHARS.numbers;
    if (includeSymbols) chars += CHARS.symbols;

    if (chars === "") {
      setPassword("");
      return;
    }

    let result = "";
    for (let i = 0; i < length; i++) {
      const idx = Math.floor(Math.random() * chars.length);
      result += chars[idx];
    }

    setPassword(result);
  }, [length, includeLower, includeUpper, includeNumbers, includeSymbols]);

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const calculateEntropy = () => {
    let charsetSize = 0;
    if (includeLower) charsetSize += 26;
    if (includeUpper) charsetSize += 26;
    if (includeNumbers) charsetSize += 10;
    if (includeSymbols) charsetSize += CHARS.symbols.length;
    if (charsetSize === 0) return 0;
    return Math.round(length * Math.log2(charsetSize));
  };

  const getStrengthLabel = (entropy: number) => {
    if (entropy < 28) return { text: "Weak", color: "#dc2626" };
    if (entropy < 36) return { text: "Fair", color: "#f59e0b" };
    if (entropy < 60) return { text: "Good", color: "#3b82f6" };
    if (entropy < 128) return { text: "Strong", color: "#16a34a" };
    return { text: "Very Strong", color: "#059669" };
  };

  const strength = getStrengthLabel(calculateEntropy());

  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="max-w-215 mx-auto px-2 lg:px-0 pt-5 pb-12">
        {/* Navigation */}
        <nav
          className="flex items-center justify-between mb-2.5 px-4 sm:px-6 py-3.5 rounded-[14px] border"
          style={{
            background: "var(--color-background-primary)",
            borderColor: "var(--color-border-tertiary)",
          }}
        >
          <div
            className="font-['Syne'] font-extrabold text-xl text-[#FF5C35]"
            style={{ letterSpacing: "-0.5px" }}
          >
            Tool
            <span style={{ color: "var(--color-text-primary)" }}>Kit</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs"
              style={{
                background: "var(--color-background-secondary)",
                border: "0.5px solid var(--color-border-tertiary)",
                color: "var(--color-text-secondary)",
              }}
            >
              <a
                href="/security"
                className="hover:text-[#3498DB] transition-colors"
              >
                ← Back to Security Tools
              </a>
            </div>
          </div>
        </nav>

        {/* Tool Header */}
        <ToolHeader
          title="Password Generator"
          description="Generate strong, random passwords with customizable character sets and length."
          icon="🔑"
        />

        {/* Tool Content */}
        <section className="mb-3">
          {/* Password Output */}
          <div
            className="p-5 rounded-[14px] mb-2.5"
            style={{ background: "var(--color-background-primary)" }}
          >
            <div className="mb-3">
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Generated Password
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 p-3 rounded-[10px] font-mono text-sm tracking-w"
                  style={{
                    background: "var(--color-background-secondary)",
                    color: "var(--color-text-primary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                  }}
                >
                  {password || "Click Generate to create a password"}
                </div>
                <button
                  onClick={generatePassword}
                  className="px-5 py-2 rounded-[10px] text-xs font-semibold cursor-pointer transition-all hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #3498DB, #5dade2)",
                    color: "#fff",
                  }}
                >
                  Generate
                </button>
                <button
                  onClick={handleCopy}
                  disabled={!password}
                  className="px-4 py-2 rounded-[10px] text-xs font-medium cursor-pointer transition-all border"
                  style={{
                    background: "transparent",
                    color: password ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                    borderColor: "var(--color-border-tertiary)",
                    opacity: password ? 1 : 0.5,
                  }}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>

            {password && calculateEntropy() > 0 && (
              <div className="flex items-center gap-3">
                <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  Entropy: {calculateEntropy()} bits
                </div>
                <div
                  className="text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ background: `${strength.color}20`, color: strength.color }}
                >
                  {strength.text}
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div
            className="p-4 rounded-[14px]"
            style={{ background: "var(--color-background-primary)" }}
          >
            <h3
              className="font-['Syne'] text-xs font-bold tracking-[2px] uppercase mb-3"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Password Settings
            </h3>

            {/* Character Sets */}
            <div className="space-y-2.5 mb-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs" style={{ color: "var(--color-text-primary)" }}>
                  Lowercase (a-z)
                </span>
                <input
                  type="checkbox"
                  checked={includeLower}
                  onChange={(e) => setIncludeLower(e.target.checked)}
                  className="w-4 h-4 accent-[#3498DB]"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs" style={{ color: "var(--color-text-primary)" }}>
                  Uppercase (A-Z)
                </span>
                <input
                  type="checkbox"
                  checked={includeUpper}
                  onChange={(e) => setIncludeUpper(e.target.checked)}
                  className="w-4 h-4 accent-[#3498DB]"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs" style={{ color: "var(--color-text-primary)" }}>
                  Numbers (0-9)
                </span>
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="w-4 h-4 accent-[#3498DB]"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs" style={{ color: "var(--color-text-primary)" }}>
                  Symbols (!@#$%...)
                </span>
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="w-4 h-4 accent-[#3498DB]"
                />
              </label>
            </div>

            {/* Length Slider */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="text-xs"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Password Length
                </label>
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#3498DB" }}
                >
                  {length} characters
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="64"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full accent-[#3498DB]"
                style={{ height: "4px" }}
              />
              <div className="flex justify-between text-[10px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
                <span>4</span>
                <span>64</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div
            className="p-3 rounded-[10px] mt-2.5"
            style={{ background: "rgba(52,152,219,0.08)" }}
          >
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong style={{ color: "#3498DB" }}>Security Tip:</strong> Use a unique, strong password for each account. Consider using a password manager to store them securely.
            </p>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
