"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/shared/ToolLayout";
import { MessageSquare, Lock, Unlock, Copy, RefreshCw, KeyRound, ShieldCheck, AlertTriangle, CheckCircle2, ChevronDown } from "lucide-react";

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
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [inputText, setInputText] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleProcess = async () => {
    setErrorMsg("");
    setOutputText("");

    if (!inputText.trim()) {
      setErrorMsg("BUFFER_EMPTY: NO_TEXT_ENTERED");
      return;
    }

    if (!password) {
      setErrorMsg("KEY_REQUIRED: ENTER_PASSPHRASE");
      return;
    }

    if (mode === "encrypt" && password !== confirmPassword) {
      setErrorMsg("KEY_MISMATCH: PASSWORDS_DO_NOT_MATCH");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("STRENGTH_INSUFFICIENT: MIN_8_CHARS");
      return;
    }

    setIsProcessing(true);

    try {
      let result: string;
      if (mode === "encrypt") {
        result = await encryptText(inputText, password);
      } else {
        if (!/^[A-Za-z0-9+/=]+$/.test(inputText.trim().replace(/\s/g, ""))) {
          throw new Error("Invalid base64 encoding detected");
        }
        result = await decryptText(inputText.trim().replace(/\s/g, ""), password);
      }
      setOutputText(result);
    } catch (err) {
      console.error("Processing failed:", err);
      setErrorMsg(
        err instanceof Error
          ? `EXEC_ERROR: ${err.message.toUpperCase().replace(/\s+/g, "_")}`
          : "EXEC_ERROR: DECRYPTION_FAILED_CHECK_KEY"
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
    <ToolLayout
      title="Message Crypt"
      description="Secure text encryption for sensitive communication. Employs AES-256-GCM with PBKDF2 key derivation."
      icon={<MessageSquare className="w-4 h-4" />}
      category="Security"
      id="msg-crypt"
      parameters={
        <div className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="operation-mode" className="mono-label text-muted-foreground text-[10px]">Operation Mode</label>
            <div id="operation-mode" className="grid grid-cols-2 gap-2">
              {[
                { id: "encrypt", label: "LOCK_ENCRYPT", icon: <Lock className="w-3 h-3" /> },
                { id: "decrypt", label: "UNLOCK_DECRYPT", icon: <Unlock className="w-3 h-3" /> },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMode(m.id as "encrypt" | "decrypt");
                    reset();
                  }}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded border transition-all mono-label text-[9px] font-bold ${
                    mode === m.id
                      ? "bg-foreground text-background border-foreground shadow-sm"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/20"
                  }`}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="entropy-key" className="mono-label text-muted-foreground text-[10px]">Entropy Key (Password)</label>
            <div className="space-y-2">
              <div className="relative">
                <input
                  id="entropy-key"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm focus:border-brand-accent outline-none"
                  placeholder="ENTER_SECURE_KEY"
                />
                <KeyRound className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground/30" />
              </div>
              
              {mode === "encrypt" && (
                <input
                  aria-label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-muted/30 border rounded-lg px-3 py-2 text-sm focus:border-brand-accent outline-none ${
                    confirmPassword && password !== confirmPassword ? "border-red-500/50" : "border-border"
                  }`}
                  placeholder="CONFIRM_SECURE_KEY"
                />
              )}
            </div>
          </div>
        </div>
      }
      actions={
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleProcess}
            disabled={isProcessing || !inputText.trim() || !password}
            className="w-full py-4 bg-foreground text-background mono-label font-bold text-sm hover:bg-brand-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : `Execute ${mode.toUpperCase()}`}
            <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            type="button"
            onClick={reset}
            className="w-full py-3 bg-transparent text-muted-foreground border border-border mono-label font-bold text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2"
          >
            Reset Buffer
          </button>
        </div>
      }
    >
      <div className="flex-1 flex flex-col gap-8 py-8">
        <div className="space-y-3 flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <label htmlFor="input-stream" className="mono-label text-muted-foreground text-[10px]">Input Stream</label>
            <span className="mono-label text-[9px] text-muted-foreground opacity-30 select-none">BUFFER_ID: TX_001</span>
          </div>
          <textarea
            id="input-stream"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 min-h-[160px] bg-muted/10 border border-border rounded-2xl p-6 text-sm font-mono focus:border-brand-accent outline-none resize-none transition-colors selection:bg-brand-accent/20"
            placeholder={mode === "encrypt" ? "ENTER_RAW_PAYLOAD_HERE..." : "PASTE_BASE64_CIPHERTEXT_HERE..."}
          />
        </div>

        {outputText && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 mono-label text-brand-accent text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" /> OPERATION_SUCCESSFUL
              </div>
              <button
                type="button"
                onClick={copyToClipboard}
                className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all mono-label text-[9px] font-bold ${
                  copied ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-muted border-border text-muted-foreground hover:border-foreground/20"
                }`}
              >
                {copied ? "COPIED" : "COPY_RESULT"} <Copy className="w-3 h-3" />
              </button>
            </div>
            <div className="p-6 rounded-2xl bg-foreground text-background font-mono text-sm break-all selection:bg-brand-accent selection:text-white shadow-2xl shadow-brand-accent/10">
              {outputText}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div className="space-y-1">
              <div className="mono-label text-red-500 font-bold italic text-xs">VULNERABILITY_DETECTED</div>
              <p className="mono-label text-[10px] text-red-500/70">{errorMsg}</p>
            </div>
          </div>
        )}

        <div className="p-8 rounded-[32px] border border-border bg-muted/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ShieldCheck className="w-24 h-24" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="mono-label text-foreground font-bold italic text-xs">CRYPTO_INFRASTRUCTURE</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "PROTOCOL", value: "AES-GCM" },
                { label: "BITS", value: "256 BIT" },
                { label: "KDF", value: "PBKDF2" },
                { label: "ROUNDS", value: "100K" },
              ].map((spec) => (
                <div key={spec.label} className="space-y-1">
                  <div className="mono-label text-muted-foreground text-[8px]">{spec.label}</div>
                  <div className="mono-label text-foreground text-[10px] font-bold">{spec.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
