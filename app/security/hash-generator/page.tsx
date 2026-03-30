"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/shared/ToolLayout";
import { Fingerprint, Copy, Download, RefreshCw, Layers, FileText, ShieldAlert, Cpu } from "lucide-react";

const HASH_ALGORITHMS = [
  { id: "SHA-256", name: "SHA-256", bits: 256, status: "SECURE" },
  { id: "SHA-512", name: "SHA-512", bits: 512, status: "SECURE" },
  { id: "SHA-1", name: "SHA-1", bits: 160, status: "LEGACY" },
] as const;

async function hashString(
  data: string | ArrayBuffer,
  algorithm: string,
): Promise<string> {
  const encoder = new TextEncoder();
  let dataBuffer: BufferSource;

  if (typeof data === "string") {
    dataBuffer = encoder.encode(data);
  } else {
    dataBuffer = data;
  }

  // Use Web Crypto API
  const cryptoAlgo = algorithm as "SHA-1" | "SHA-256" | "SHA-512";

  const hash = await crypto.subtle.digest(cryptoAlgo, dataBuffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function HashGeneratorTool() {
  const [inputType, setInputType] = useState<"text" | "file">("text");
  const [textInput, setTextInput] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [selectedAlgos, setSelectedAlgos] = useState<string[]>(["SHA-256", "SHA-512"]);
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [copyHint, setCopyHint] = useState<string | null>(null);

  const handleAlgoToggle = (algoId: string) => {
    setSelectedAlgos((prev) =>
      prev.includes(algoId)
        ? prev.filter((a) => a !== algoId)
        : [...prev, algoId],
    );
  };

  const generateHashes = useCallback(async () => {
    if (inputType === "text" && !textInput.trim()) return;
    if (inputType === "file" && !fileInput) return;

    setIsLoading(true);
    const newHashes: Record<string, string> = {};

    try {
      for (const algo of selectedAlgos) {
        if (inputType === "text") {
          const hash = await hashString(textInput, algo);
          newHashes[algo] = hash;
        } else if (fileInput) {
          const arrayBuffer = await fileInput.arrayBuffer();
          const hash = await hashString(arrayBuffer, algo);
          newHashes[algo] = hash;
        }
      }
      setHashes(newHashes);
    } catch (error) {
      console.error("Hash generation failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [inputType, textInput, fileInput, selectedAlgos]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileInput(e.target.files[0]);
      setHashes({});
    }
  };

  const handleCopy = (text: string, algo: string) => {
    navigator.clipboard.writeText(text);
    setCopyHint(algo);
    setTimeout(() => setCopyHint(null), 2000);
  };

  return (
    <ToolLayout
      title="Hash Generator"
      description="Compute cryptographic signatures for arbitrary text or binary payloads using hardware-accelerated WebCrypto primitives."
      icon={<Fingerprint className="w-4 h-4" />}
      category="Security"
      id="hash-gen"
      parameters={
        <div className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="source-vector" className="mono-label text-muted-foreground text-[10px]">Source Vector</label>
            <div id="source-vector" className="grid grid-cols-2 gap-2">
              {[
                { id: "text", label: "RAW_TEXT", icon: <FileText className="w-3 h-3" /> },
                { id: "file", label: "BINARY_FILE", icon: <Download className="w-3 h-3" /> },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setInputType(type.id as "text" | "file")}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded border transition-all mono-label text-[9px] font-bold ${
                    inputType === type.id
                      ? "bg-foreground text-background border-foreground shadow-sm"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/20"
                  }`}
                >
                  {type.icon}
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="active-algos" className="mono-label text-muted-foreground text-[10px]">Active Algorithms</label>
            <div id="active-algos" className="grid grid-cols-1 gap-2">
              {HASH_ALGORITHMS.map((algo) => (
                <button
                  key={algo.id}
                  type="button"
                  onClick={() => handleAlgoToggle(algo.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded border transition-all ${
                    selectedAlgos.includes(algo.id)
                      ? "border-brand-accent/30 bg-brand-accent/5 text-foreground"
                      : "border-border bg-transparent text-muted-foreground hover:border-foreground/20"
                  }`}
                >
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="mono-label text-[10px] font-bold">{algo.name}</span>
                    <span className="text-[8px] opacity-40">{algo.bits} BIT ENTROPY</span>
                  </div>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                    algo.status === 'SECURE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {algo.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      actions={
        <>
          <button
            type="button"
            onClick={generateHashes}
            disabled={isLoading || (inputType === "text" ? !textInput.trim() : !fileInput)}
            className="w-full py-4 bg-foreground text-background mono-label font-bold text-sm hover:bg-brand-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? "Computing..." : "Execute Hash"} <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => {
              setTextInput("");
              setFileInput(null);
              setHashes({});
            }}
            className="w-full py-3 bg-transparent text-muted-foreground border border-border mono-label font-bold text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2"
          >
            Clear Buffer
          </button>
        </>
      }
    >
      <div className="flex-1 flex flex-col gap-8 py-8">
        <div className="p-8 rounded-2xl border border-border bg-muted/5 space-y-6">
          <div className="flex items-center gap-2 mono-label text-muted-foreground text-[10px]">
            <Layers className="w-3 h-3" /> SOURCE_INPUT_BUFFER
          </div>
          
          {inputType === "text" ? (
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full h-48 bg-background/50 border border-border rounded-xl p-4 font-mono text-xs focus:border-brand-accent outline-none transition-colors resize-none placeholder:text-muted-foreground/20"
              placeholder="ENTER PLAIN TEXT PAYLOAD FOR DIGEST COMPUTATION..."
            />
          ) : (
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-brand-accent hover:bg-brand-accent/5 transition-all group">
              <input id="file-upload" type="file" onChange={handleFileChange} className="hidden" />
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Download className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="mono-label text-xs font-bold mb-1">
                {fileInput ? fileInput.name : "SELECT BINARY PAYLOAD"}
              </div>
              <div className="mono-label text-[9px] text-muted-foreground">
                {fileInput ? `${(fileInput.size / 1024 / 1024).toFixed(2)} MB` : "SUPPORTS ANY FILE UP TO 100MB"}
              </div>
            </label>
          )}
        </div>

        {Object.keys(hashes).length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mono-label text-brand-accent text-[10px]">
              <Cpu className="w-3 h-3" /> COMPUTED_DIGEST_OUTPUT
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(hashes).map(([algo, hash]) => (
                <div key={algo} className="group relative p-6 rounded-xl border border-border bg-background hover:border-brand-accent/30 transition-all overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                    <span className="mono-label text-[10px] font-bold text-brand-accent italic">{algo}_ALGO_RESULT</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(hash, algo)}
                      className={`flex items-center gap-2 mono-label text-[9px] font-bold py-1 px-3 rounded border transition-all ${
                        copyHint === algo 
                          ? "bg-emerald-500 text-white border-emerald-500" 
                          : "bg-muted text-muted-foreground border-border hover:bg-foreground hover:text-background"
                      }`}
                    >
                      {copyHint === algo ? "COPIED_TO_CLIPBOARD" : "COPY_RESULT"}
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="font-mono text-xs break-all leading-relaxed text-foreground bg-muted/30 p-4 rounded border border-border select-all selection:bg-brand-accent selection:text-white">
                    {hash}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="mono-label text-foreground font-bold italic">CRYPTOGRAPHIC_ADVISORY</h4>
              <p className="text-xs text-muted-foreground leading-relaxed uppercase tracking-widest leading-relaxed">
                SHA-1 IS CONSIDERED CRYPTOGRAPHICALLY BROKEN AND SHOULD ONLY BE USED FOR NON-SECURITY INTEGRITY CHECKS. FOR SENSITIVE DATA, USE SHA-256 OR SHA-512.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
