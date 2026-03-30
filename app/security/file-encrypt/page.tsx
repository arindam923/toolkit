"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/shared/ToolLayout";
import { Lock, Unlock, Download, ShieldCheck, KeyRound, RefreshCw, AlertTriangle, FileCheck, CheckCircle2 } from "lucide-react";

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
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
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

  const handleProcess = async () => {
    setErrorMsg("");
    setStatus("idle");

    if (!file) {
      setErrorMsg("BUFFER_EMPTY: NO_FILE_SELECTED");
      return;
    }

    if (mode === "encrypt" && password !== confirmPassword) {
      setErrorMsg("KEY_MISMATCH: PASSWORDS_DO_NOT_MATCH");
      return;
    }

    if (!password) {
      setErrorMsg("KEY_REQUIRED: ENTER_PASSPHRASE");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("STRENGTH_INSUFFICIENT: MIN_8_CHARS");
      return;
    }

    setIsProcessing(true);

    try {
      let resultBlob: Blob;

      if (mode === "encrypt") {
        resultBlob = await encryptFile(file, password);
        setDownloadName(`${file.name}.vault`);
      } else {
        resultBlob = await decryptFile(file, password);
        const name = file.name.endsWith(".vault")
          ? file.name.slice(0, -6)
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
          ? `EXEC_ERROR: ${err.message.toUpperCase().replace(/\s+/g, '_')}`
          : "EXEC_ERROR: DECRYPTION_FAILED_CHECK_KEY"
      );
      setStatus("error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="File Vault"
      description="Military-grade AES-256-GCM file encryption. Secure your sensitive documents before cloud transit or local storage."
      icon={<Lock className="w-4 h-4" />}
      category="Security"
      id="file-vault"
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
          {status === "success" && downloadUrl ? (
            <a
              href={downloadUrl}
              download={downloadName}
              className="w-full py-4 bg-emerald-500 text-white mono-label font-bold text-sm hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
            >
              Download Result <Download className="w-4 h-4" />
            </a>
          ) : (
            <button
              type="button"
              onClick={handleProcess}
              disabled={isProcessing || !file || !password}
              className="w-full py-4 bg-foreground text-background mono-label font-bold text-sm hover:bg-brand-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : `Execute ${mode.toUpperCase()}`} 
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            </button>
          )}
          
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
        <label htmlFor="file-vault-upload" className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl transition-all p-12 text-center group cursor-pointer ${
          file ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-muted/5 hover:border-brand-accent hover:bg-brand-accent/5"
        }`}>
          <input 
            id="file-vault-upload"
            type="file" 
            onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} 
            className="hidden" 
          />
          
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
            file ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
          }`}>
            {file ? <FileCheck className="w-8 h-8" /> : <Download className="w-8 h-8" />}
          </div>

          <div className="space-y-2">
            <h3 className="mono-label text-xl font-bold italic">
              {file ? file.name : `SELECT_LOCAL_PAYLOAD_FOR_${mode.toUpperCase()}`}
            </h3>
            <p className="mono-label text-xs text-muted-foreground">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "AES-256-GCM / PBKDF2 / LOCAL_EXECUTION_ONLY"}
            </p>
          </div>
        </label>

        {status === "error" && (
          <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div className="space-y-1">
              <div className="mono-label text-red-500 font-bold italic text-xs">VULNERABILITY_DETECTED</div>
              <p className="mono-label text-[10px] text-red-500/70">{errorMsg}</p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <div className="space-y-1">
              <div className="mono-label text-emerald-500 font-bold italic text-xs">MODULE_SUCCESS</div>
              <p className="mono-label text-[10px] text-emerald-500/70">
                {mode === "encrypt" ? "PAYLOAD_ENCRYPTED_AND_WRAPPED_SUCCESSFULLY" : "PAYLOAD_EXTRACTED_WITHOUT_INTEGRITY_ERRORS"}
              </p>
            </div>
          </div>
        )}

        <div className="p-8 rounded-3xl border border-border bg-muted/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ShieldCheck className="w-24 h-24" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="mono-label text-foreground font-bold italic text-xs">INFRASTRUCTURE_SPECIFICATION</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "ALGO_CORE", value: "AES-GCM" },
                { label: "KEY_SIZE", value: "256 BIT" },
                { label: "KDF_PRIM", value: "PBKDF2" },
                { label: "ITER_COUNT", value: "100K" },
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
