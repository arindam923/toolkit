"use client";

import { useState, useCallback } from "react";
import Footer from "@/components/home/Footer";
import ToolHeader from "@/components/shared/ToolHeader";

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;

async function deriveKey(
  password: string,
  salt: Uint8Array,
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
      salt: new Uint8Array(salt.buffer as ArrayBuffer),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptFile(
  file: File,
  password: string,
): Promise<Blob> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);

  const arrayBuffer = await file.arrayBuffer();
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    arrayBuffer,
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

  return new Blob([combined], {
    type: "application/octet-stream",
  });
}

async function decryptFile(
  encryptedBlob: Blob,
  password: string,
): Promise<Blob> {
  const combined = new Uint8Array(
    await encryptedBlob.arrayBuffer(),
  );

  // Extract salt (first 16 bytes), iv (next 12 bytes), and encrypted data
  const salt = new Uint8Array(combined.slice(0, 16).buffer);
  const iv = combined.slice(16, 28);
  const data = combined.slice(28);

  const key = await deriveKey(password, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    data,
  );

  return new Blob([decrypted]);
}

export default function FileEncryptTool() {
  const [mode, setMode] = useState<"encrypt" | "decrypt">(
    "encrypt",
  );
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<
    string | null
  >(null);
  const [downloadName, setDownloadName] = useState("");

  const reset = () => {
    setFile(null);
    setPassword("");
    setConfirmPassword("");
    setStatus("idle");
    setErrorMsg("");
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
  };

  const process = async () => {
    setErrorMsg("");
    setStatus("idle");

    if (!file) {
      setErrorMsg("Please select a file");
      return;
    }

    if (
      mode === "encrypt" &&
      password !== confirmPassword
    ) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (!password) {
      setErrorMsg("Please enter a password");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters");
      return;
    }

    setIsProcessing(true);

    try {
      let resultBlob: Blob;

      if (mode === "encrypt") {
        resultBlob = await encryptFile(file, password);
        setDownloadName(`${file.name}.enc`);
      } else {
        resultBlob = await decryptFile(file, password);
        // Try to restore original name by removing .enc if present
        const name = file.name.endsWith(".enc")
          ? file.name.slice(0, -4)
          : `${file.name}.decrypted`;
        setDownloadName(name);
      }

      const url = URL.createObjectURL(resultBlob);
      setDownloadUrl(url);
      setStatus("success");
    } catch (err) {
      console.error("Processing failed:", err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Processing failed. Wrong password?",
      );
      setStatus("error");
    } finally {
      setIsProcessing(false);
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
          title="File Encrypt/Decrypt"
          description="Encrypt files with AES-256-GCM using a password, or decrypt previously encrypted files."
          icon="📁"
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
                type="button"
                onClick={() => {
                  setMode("encrypt");
                  reset();
                }}
                className={`px-4 py-2 text-xs rounded-lg font-medium transition-all ${
                  mode === "encrypt"
                    ? "text-[#3498DB] border border-[#3498DB]"
                    : "text-[var(--color-text-secondary)] border border-transparent"
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
                type="button"
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

            {/* File Upload */}
            <label
              className="flex flex-col items-center justify-center p-6 rounded-[10px] cursor-pointer border-2 border-dashed transition-all hover:border-[#3498DB]"
              style={{
                background:
                  "var(--color-background-secondary)",
                borderColor: file
                  ? "rgba(52,152,219,0.3)"
                  : "var(--color-border-tertiary)",
              }}
            >
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFile(e.target.files[0]);
                    setStatus("idle");
                    setErrorMsg("");
                  }
                }}
                className="hidden"
                accept={
                  mode === "decrypt" ? ".enc,*/*" : "*/*"
                }
              />
              <div className="text-2xl mb-2">📁</div>
              <p
                className="text-xs text-center"
                style={{
                  color: "var(--color-text-primary)",
                }}
              >
                {file ? (
                  <span className="font-medium text-[#3498DB]">
                    {file.name}
                  </span>
                ) : (
                  `Select a file to ${mode}`
                )}
              </p>
              <p
                className="text-[10px] mt-1"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                {mode === "encrypt"
                  ? "Any file up to 25MB"
                  : "Encrypted file (.enc) or any file"}
              </p>
            </label>

            {file && (
              <div
                className="mt-2 text-[10px]"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                Size: {(file.size / 1024 / 1024).toFixed(2)}{" "}
                MB
              </div>
            )}
          </div>

          {/* Password */}
          <div
            className="p-4 rounded-[14px] mb-2.5"
            style={{
              background: "var(--color-background-primary)",
            }}
          >
            <h3
              className="font-['Syne'] text-xs font-bold tracking-[2px] uppercase mb-3"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              Password
            </h3>
            <div className="space-y-2.5">
              <div>
                <label
                  htmlFor="password"
                  className="block text-[10px] mb-1"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {mode === "encrypt"
                    ? "Encryption Password"
                    : "Decryption Password"}
                </label>
                <input
                  name="password"
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
              </div>
              {mode === "encrypt" && (
                <div>
                  <label
                    htmlFor="password"
                    className="block text-[10px] mb-1"
                    style={{
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Confirm Password
                  </label>
                  <input
                    name="password"
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
                  {confirmPassword &&
                    password !== confirmPassword && (
                      <p
                        className="text-[10px] mt-1"
                        style={{ color: "#dc2626" }}
                      >
                        Passwords do not match
                      </p>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Process Button */}
          <button
            type="button"
            onClick={process}
            disabled={
              isProcessing ||
              !file ||
              (mode === "encrypt" &&
                password !== confirmPassword) ||
              !password
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
              "Encrypt File"
            ) : (
              "Decrypt File"
            )}
          </button>

          {/* Success/Error Messages */}
          {status === "success" && downloadUrl && (
            <div
              className="p-3 rounded-[10px] mb-2.5"
              style={{ background: "rgba(34,197,94,0.08)" }}
            >
              <p
                className="text-[11px] mb-2 font-medium"
                style={{ color: "#16a34a" }}
              >
                ✓{" "}
                {mode === "encrypt"
                  ? "Encryption"
                  : "Decryption"}{" "}
                complete!
              </p>
              <a
                href={downloadUrl}
                download={downloadName}
                className="block w-full py-2 text-xs font-semibold text-center rounded"
                style={{
                  background: "rgba(34,197,94,0.15)",
                  color: "#16a34a",
                }}
              >
                ⬇ Download{" "}
                {mode === "encrypt"
                  ? "Encrypted"
                  : "Decrypted"}{" "}
                File
              </a>
              <button
                type="button"
                onClick={reset}
                className="w-full mt-2 py-2 text-xs font-medium rounded"
                style={{
                  background: "transparent",
                  color: "var(--color-text-secondary)",
                  border:
                    "0.5px solid var(--color-border-tertiary)",
                }}
              >
                Reset
              </button>
            </div>
          )}

          {errorMsg && (
            <div
              className="p-3 rounded-[10px] mb-2.5"
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
                Security Info:
              </strong>{" "}
              Uses AES-256-GCM encryption with PBKDF2 key
              derivation (100,000 iterations). Encrypted
              files have{" "}
              {mode === "encrypt"
                ? "the extension .enc added"
                : "the .enc extension removed"}
              .
            </p>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
