"use client";

import { useState, useCallback, useEffect } from "react";
import Footer from "@/components/home/Footer";
import ToolHeader from "@/components/shared/ToolHeader";

const CHAR_SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  hex: "0123456789abcdefABCDEF",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  base64: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
};

export default function RandomGeneratorTool() {
  const [type, setType] = useState<"string" | "number" | "hex" | "base64" | "uuid">("string");
  const [length, setLength] = useState(16);
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<string[]>([]);
  const [separator, setSeparator] = useState("\n");
  const [copied, setCopied] = useState(false);

  const generateRandom = useCallback(
    (charset: string, len: number): string => {
      let result = "";
      const array = new Uint32Array(len);
      crypto.getRandomValues(array);
      for (let i = 0; i < len; i++) {
        result += charset[array[i] % charset.length];
      }
      return result;
    },
    []
  );

  const handleGenerate = useCallback(() => {
    const newResults: string[] = [];

    for (let i = 0; i < count; i++) {
      let value: string;

      switch (type) {
        case "string":
          const stringChars = (
            (CHAR_SETS.lowercase + CHAR_SETS.uppercase + CHAR_SETS.symbols + CHAR_SETS.numbers)
          );
          value = generateRandom(stringChars, length);
          break;
        case "number":
          const min = Math.pow(10, length - 1);
          const max = Math.pow(10, length) - 1;
          const array = new Uint32Array(1);
          crypto.getRandomValues(array);
          const num = min + (array[0] % (max - min + 1));
          value = num.toString();
          break;
        case "hex":
          value = generateRandom(CHAR_SETS.hex, length);
          break;
        case "base64":
          value = generateRandom(CHAR_SETS.base64, length);
          break;
        case "uuid":
          const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
          value = uuid;
          break;
        default:
          value = "";
      }

      newResults.push(value);
    }

    setResults(newResults);
  }, [type, length, count, generateRandom]);

  const copyAll = async () => {
    const text = results.join(separator);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  // Calculate character set info
  const getCharsetInfo = () => {
    switch (type) {
      case "string":
        return {
          chars: CHAR_SETS.lowercase.length + CHAR_SETS.uppercase.length + CHAR_SETS.numbers.length + CHAR_SETS.symbols.length,
          label: "a-z, A-Z, 0-9, symbols",
        };
      case "hex":
        return { chars: CHAR_SETS.hex.length, label: "0-9, a-f, A-F" };
      case "base64":
        return { chars: CHAR_SETS.base64.length, label: "A-Z, a-z, 0-9, +, /, =" };
      case "number":
        return { chars: 10, label: "0-9 only" };
      case "uuid":
        return { chars: 16, label: "hex with hyphens" };
      default:
        return { chars: 0, label: "" };
    }
  };

  const charsetInfo = getCharsetInfo();
  const totalCombinations = Math.pow(charsetInfo.chars, type === "number" ? length : (type === "uuid" ? 32 : length));
  const bitsOfEntropy = Math.log2(totalCombinations);

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
          title="Random Generator"
          description="Generate random strings, numbers, hex values, base64 strings, and UUIDs for development and testing."
          icon="🎲"
        />

        {/* Tool Content */}
        <section className="mb-3">
          {/* Type Selection */}
          <div
            className="p-4 rounded-[14px] mb-2.5"
            style={{ background: "var(--color-background-primary)" }}
          >
            <label
              className="block text-xs font-medium mb-2.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Generator Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: "string", label: "String", desc: "Alphanum + symbols" },
                { id: "number", label: "Number", desc: "Digits only" },
                { id: "hex", label: "Hex", desc: "0-9, a-f" },
                { id: "base64", label: "Base64", desc: "Base64 chars" },
                { id: "uuid", label: "UUID", desc: "GUID v4" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setType(opt.id as typeof type)}
                  className={`p-2.5 text-left transition-all rounded-lg ${
                    type === opt.id
                      ? "border border-[#3498DB] text-[#3498DB]"
                      : "border border-transparent hover:border-[var(--color-border-tertiary)]"
                  }`}
                  style={{
                    background: type === opt.id ? "rgba(52,152,219,0.08)" : "transparent",
                  }}
                >
                  <div className="text-xs font-semibold mb-0.5">{opt.label}</div>
                  <div className="text-[9px]" style={{ color: "var(--color-text-secondary)" }}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div
            className="p-4 rounded-[14px] mb-2.5"
            style={{ background: "var(--color-background-primary)" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                  {type === "uuid" ? "UUID Count" : "Length"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max={type === "uuid" ? "100" : "128"}
                    value={type === "uuid" ? count : length}
                    onChange={(e) => {
                      if (type === "uuid") {
                        setCount(Number(e.target.value));
                      } else {
                        setLength(Number(e.target.value));
                      }
                    }}
                    className="flex-1 accent-[#3498DB]"
                  />
                  <span
                    className="text-xs font-semibold w-12 text-right"
                    style={{ color: "#3498DB" }}
                  >
                    {type === "uuid" ? count : length}
                  </span>
                </div>
                {type !== "uuid" && (
                  <div className="flex justify-between text-[9px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    <span>1</span>
                    <span>128</span>
                  </div>
                )}
              </div>

              {type === "string" && (
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                    Quantity
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="flex-1 accent-[#3498DB]"
                    />
                    <span
                      className="text-xs font-semibold w-12 text-right"
                      style={{ color: "#3498DB" }}
                    >
                      {count}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>
                Separator (for multiple values)
              </label>
              <select
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                className="w-full p-2 rounded-[10px] text-xs outline-none"
                style={{
                  background: "var(--color-background-secondary)",
                  color: "var(--color-text-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <option value="\n">New line</option>
                <option value=",">Comma (,)</option>
                <option value=" ">Space</option>
                <option value="-">Hyphen (-)</option>
                <option value=";">Semicolon (;)</option>
              </select>
            </div>

            <div className="mt-3 text-[10px] flex items-center justify-between" style={{ color: "var(--color-text-secondary)" }}>
              <span>Character set: {charsetInfo.label}</span>
              <span>Entropy: {bitsOfEntropy.toFixed(1)} bits</span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            className="w-full px-5.5 py-2.5 rounded-[10px] text-sm font-semibold cursor-pointer transition-all mb-2.5"
            style={{
              background: "linear-gradient(135deg, #3498DB, #5dade2)",
              color: "#fff",
              boxShadow: "0 4px 12px rgba(52,152,219,0.3)",
            }}
          >
            Generate Random
          </button>

          {/* Results */}
          {results.length > 0 && (
            <div
              className="p-4 rounded-[14px]"
              style={{ background: "var(--color-background-primary)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <label
                  className="text-xs font-medium"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Generated ({results.length} item{results.length > 1 ? "s" : ""})
                </label>
                <button
                  onClick={copyAll}
                  className="text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1"
                  style={{
                    background: "var(--color-background-secondary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    color: copied ? "#16a34a" : "var(--color-text-primary)",
                  }}
                >
                  {copied ? "✓ Copied" : "Copy All"}
                </button>
              </div>
              <div
                className="p-3 rounded font-mono text-xs whitespace-pre-wrap break-all select-all max-h-64 overflow-y-auto"
                style={{
                  background: "var(--color-background-secondary)",
                  color: "var(--color-text-primary)",
                }}
              >
                {results.join(separator)}
              </div>
            </div>
          )}

          {/* Info */}
          <div
            className="p-3 rounded-[10px] mt-2.5"
            style={{ background: "rgba(52,152,219,0.08)" }}
          >
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <strong style={{ color: "#3498DB" }}>Note:</strong> Random values are generated using the browser's cryptographic random number generator (crypto.getRandomValues). For secure applications like password generation, ensure sufficient length and character variety.
            </p>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
