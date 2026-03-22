"use client";

import { useState, useCallback } from "react";
import Footer from "@/components/home/Footer";
import ToolHeader from "@/components/shared/ToolHeader";

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;

async function deriveKey(
  password: string,
  salt: BufferSource,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptText(
  text: string,
  password: string,
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(
    password,
    salt.buffer.slice(
      salt.byteOffset,
      salt.byteOffset + salt.byteLength,
    ),
  );

  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    data,
  );

  // Combine salt + iv + encrypted data
  const combined = new Uint8Array(
    salt.byteLength + iv.byteLength + encrypted.byteLength,
  );
  combined.set(salt, 0);
  combined.set(iv, salt.byteLength);
  combined.set(
    new Uint8Array(encrypted),
    salt.byteLength + iv.byteLength,
  );

  // Convert to base64 for easy display/copy
  return btoa(String.fromCharCode(...combined));
}

async function decryptText(
  base64Data: string,
  password: string,
): Promise<string> {
  const combined = Uint8Array.from(atob(base64Data), (c) =>
    c.charCodeAt(0),
  );

  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const data = combined.slice(28);

  const key = await deriveKey(
    password,
    salt.buffer.slice(
      salt.byteOffset,
      salt.byteOffset + salt.byteLength,
    ),
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    data,
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

export default function TextEncryptTool() {
  const [mode, setMode] = useState<"encrypt" | "decrypt">(
    "encrypt",
  );
  const [inputText, setInputText] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [outputText, setOutputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setInputText("");
    setPassword("");
    setConfirmPassword("");
    setOutputText("");
    setErrorMsg("");
  };

  const process = async () => {
    setErrorMsg("");
    setOutputText("");

    if (!inputText.trim()) {
      setErrorMsg("Please enter text to process");
      return;
    }

    if (!password) {
      setErrorMsg("Please enter a password");
      return;
    }

    if (
      mode === "encrypt" &&
      password !== confirmPassword
    ) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters");
      return;
    }

    setIsProcessing(true);

    try {
      let result: string;
      if (mode === "encrypt") {
        result = await encryptText(inputText, password);
      } else {
        // Check if it looks like base64
        if (!/^[A-Za-z0-9+/=]+$/.test(inputText.trim())) {
          throw new Error("Invalid encrypted data format");
        }
        result = await decryptText(
          inputText.trim(),
          password,
        );
      }

      setOutputText(result);
    } catch (err) {
      console.error("Processing failed:", err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : mode === "decrypt"
            ? "Decryption failed. Wrong password or corrupted data?"
            : "Encryption failed",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

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
            <span
              style={{ color: "var(--color-text-primary)" }}
            >
              Kit
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs"
              style={{
                background:
                  "var(--color-background-secondary)",
                border:
                  "0.5px solid var(--color-border-tertiary)",
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
          title="Text Encrypt/Decrypt"
          description="Encrypt text with AES-256-GCM using a password, or decrypt previously encrypted text."
          icon="📝"
        />

        {/* Tool Content */}
        <section className="mb-3">
          {/* Mode Toggle */}
          <div
            className="p-4 rounded-[14px] mb-2.5"
            style={{
              background: "var(--color-background-primary)",
            }}
          >
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => {
                  setMode("encrypt");
                  reset();
                }}
                className={`px-4 py-2 text-xs rounded-lg font-medium transition-all ${
                  mode === "encrypt"
                    ? "text-[#3498DB] border border-[#3498DB]"
                    : "text-[var(--color-text-secondary)] border border-transparent hover:border-[var(--color-border-tertiary)]"
                }`}
                style={{
                  background:
                    mode === "encrypt"
                      ? "rgba(52,152,219,0.08)"
                      : "transparent",
                }}
              >
                Encrypt
              </button>
              <button
                onClick={() => {
                  setMode("decrypt");
                  reset();
                }}
                className={`px-4 py-2 text-xs rounded-lg font-medium transition-all ${
                  mode === "decrypt"
                    ? "text-[#3498DB] border border-[#3498DB]"
                    : "text-[var(--color-text-secondary)] border border-transparent"
                }`}
                style={{
                  background:
                    mode === "decrypt"
                      ? "rgba(52,152,219,0.08)"
                      : "transparent",
                }}
              >
                Decrypt
              </button>
            </div>
          </div>

          {/* Input Text */}
          <div
            className="p-4 rounded-[14px] mb-2.5"
            style={{
              background: "var(--color-background-primary)",
            }}
          >
            <label
              className="block text-xs font-medium mb-1.5"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              {mode === "encrypt"
                ? "Plain Text"
                : "Encrypted Text (Base64)"}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={5}
              className="w-full p-3 rounded-[10px] text-xs font-mono resize-none outline-none"
              style={{
                background:
                  "var(--color-background-secondary)",
                color: "var(--color-text-primary)",
                border:
                  "0.5px solid var(--color-border-tertiary)",
              }}
              placeholder={
                mode === "encrypt"
                  ? "Enter text to encrypt..."
                  : "Paste encrypted base64 text..."
              }
            />
          </div>

          {/* Password */}
          <div
            className="p-4 rounded-[14px] mb-2.5"
            style={{
              background: "var(--color-background-primary)",
            }}
          >
            <label
              className="block text-xs font-medium mb-1.5"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              Password
            </label>
            <div className="space-y-2.5">
              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter password"
                className="w-full p-2.5 rounded-[10px] text-sm outline-none"
                style={{
                  background:
                    "var(--color-background-secondary)",
                  color: "var(--color-text-primary)",
                  border:
                    "0.5px solid var(--color-border-tertiary)",
                }}
              />
              {mode === "encrypt" && (
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Confirm password"
                  className="w-full p-2.5 rounded-[10px] text-sm outline-none"
                  style={{
                    background:
                      "var(--color-background-secondary)",
                    color: "var(--color-text-primary)",
                    border:
                      confirmPassword &&
                      password !== confirmPassword
                        ? "0.5px solid #dc2626"
                        : "0.5px solid var(--color-border-tertiary)",
                  }}
                />
              )}
            </div>
          </div>

          {/* Process Button */}
          <button
            onClick={process}
            disabled={
              isProcessing ||
              !inputText.trim() ||
              !password ||
              (mode === "encrypt" &&
                password !== confirmPassword)
            }
            className="w-full px-5.5 py-2.5 rounded-[10px] text-sm font-semibold cursor-pointer transition-all mb-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background:
                "linear-gradient(135deg, #7C5CFF, #9b7cff)",
              color: "#fff",
              boxShadow: "0 4px 12px rgba(124,92,255,0.3)",
            }}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                {mode === "encrypt"
                  ? "Encrypting..."
                  : "Decrypting..."}
              </span>
            ) : mode === "encrypt" ? (
              "Encrypt Text"
            ) : (
              "Decrypt Text"
            )}
          </button>

          {/* Output */}
          {outputText && (
            <div
              className="p-4 rounded-[10px]"
              style={{
                background:
                  "var(--color-background-primary)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <label
                  className="text-xs font-medium"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {mode === "encrypt"
                    ? "Encrypted Output"
                    : "Decrypted Text"}
                </label>
                <button
                  onClick={copyToClipboard}
                  className="text-[10px] px-2 py-0.5 rounded font-medium"
                  style={{
                    background:
                      "var(--color-background-secondary)",
                    border:
                      "0.5px solid var(--color-border-tertiary)",
                    color: copied
                      ? "#16a34a"
                      : "var(--color-text-primary)",
                  }}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <div
                className="p-3 rounded font-mono text-xs whitespace-pre-wrap break-all select-all"
                style={{
                  background:
                    "var(--color-background-secondary)",
                  color: "var(--color-text-primary)",
                }}
              >
                {outputText}
              </div>
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div
              className="p-3 rounded-[10px] mt-2.5"
              style={{ background: "rgba(239,68,68,0.08)" }}
            >
              <p
                className="text-[11px] font-medium"
                style={{ color: "#dc2626" }}
              >
                ⚠ {errorMsg}
              </p>
            </div>
          )}

          {/* Info */}
          <div
            className="p-3 rounded-[10px] mt-2.5"
            style={{ background: "rgba(124,92,255,0.08)" }}
          >
            <p
              className="text-xs"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              <strong style={{ color: "#7C5CFF" }}>
                Security:
              </strong>{" "}
              Uses AES-256-GCM authenticated encryption with
              100,000 iterations of PBKDF2 key derivation.
              Encrypted output includes salt and IV. Store
              passwords securely.
            </p>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
