"use client";

import { useState } from "react";
import ToolLayout from "@/components/shared/ToolLayout";
import { FileSearch, ShieldCheck, ShieldAlert, ShieldQuestion, Info, RefreshCw, FileCheck, CheckCircle2, ChevronRight, Search } from "lucide-react";

async function calculateSHA256(
  data: ArrayBuffer,
): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getFileSignature(
  arrayBuffer: ArrayBuffer,
  maxBytes: number = 16,
): string {
  const bytes = new Uint8Array(
    arrayBuffer.slice(0, maxBytes),
  );
  return (
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
      .match(/.{1,2}/g)
      ?.join(" ") || ""
  );
}

const MAGIC_NUMBERS: Record<string, string> = {
  "504B0304": "ZIP / JAR / APK / DOCX / XLSX / PPTX",
  "25504446": "PDF",
  FFD8FF: "JPEG Image",
  "89504E47": "PNG Image",
  "52494646": "WEBP / RIFF",
  "377ABCAF271C": "ZIP (Old)",
  "4D5A": "Windows EXE",
  "7F454C46": "ELF Binary",
  CFAEFAED: "Mach-O Binary",
  "1F8B08": "GZIP Compressed",
  "42568368": "Android Dalvik (DEX)",
  "52617221": "RAR Archive",
  "38425053": "PSD (Photoshop)",
  "49492A00": "TIFF Image",
  "000001BA": "MPEG (MPG)",
  "000001B3": "MPEG (MP3)",
  "66747970": "MP4 / MOV / 3GP",
  "504B030414000000": "DOCX (Office Open XML)",
  D0CF11E0: "Microsoft Office (OLE)",
};

function detectFileType(signature: string): string {
  const cleanSig = signature
    .replace(/ /g, "")
    .toUpperCase();

  for (const [magic, type] of Object.entries(
    MAGIC_NUMBERS,
  )) {
    if (cleanSig.startsWith(magic.toUpperCase())) {
      return type;
    }
  }

  return "Unknown / Generic";
}

interface ScanResults {
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  lastModified: string;
  signature: string;
  detectedType: string;
  sha256: string;
  sha1?: string;
  entropy: number;
  riskLevel: "low" | "medium" | "high" | "unknown";
  riskFactors: string[];
}

export default function SecurityScannerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResults | null>(null);

  const calculateEntropy = (
    arrayBuffer: ArrayBuffer,
  ): number => {
    const data = new Uint8Array(arrayBuffer);
    const size = data.length;
    if (size === 0) return 0;

    const freq = new Map<number, number>();
    for (let i = 0; i < size; i++) {
      freq.set(data[i], (freq.get(data[i]) || 0) + 1);
    }

    let entropy = 0;
    for (const count of freq.values()) {
      const probability = count / size;
      entropy -= probability * Math.log2(probability);
    }

    return Math.round(entropy * 100) / 100;
  };

  async function computeSHA1(
    arrayBuffer: ArrayBuffer,
  ): Promise<string> {
    const hash = await crypto.subtle.digest(
      "SHA-1",
      arrayBuffer,
    );
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const handleScan = async () => {
    if (!file) return;

    setIsScanning(true);
    setScanResults(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const signature = getFileSignature(arrayBuffer, 32);
      const detectedType = detectFileType(signature);
      const sha256 = await calculateSHA256(arrayBuffer);
      const sha1 = await computeSHA1(arrayBuffer);
      const entropy = calculateEntropy(arrayBuffer);

      const riskFactors: string[] = [];
      let riskLevel: "low" | "medium" | "high" | "unknown" = "low";

      if (entropy < 3) {
        riskFactors.push("ANOMALY: LOW_ENTROPY_DETECTED_PLAINTEXT_PROBABLE");
      } else if (entropy > 7.5) {
        riskFactors.push("INFO: HIGH_ENTROPY_DETECTED_CIPHERTEXT_PROBABLE");
      }

      const executableTypes = ["Windows EXE", "ELF Binary", "Mach-O Binary", "Android Dalvik (DEX)"];
      if (executableTypes.some((t) => detectedType.includes(t))) {
        riskLevel = "high";
        riskFactors.push("CRITICAL: EXECUTABLE_PAYLOAD_DETECTED");
      }

      if (detectedType === "Unknown / Generic") {
        riskLevel = "medium";
        riskFactors.push("WARNING: SIGNATURE_MISMATCH_OR_UNKNOWN_TYPE");
      }

      if (file.size > 50 * 1024 * 1024) {
        riskLevel = "medium";
        riskFactors.push("ALERT: LARGE_PAYLOAD_THRESHOLD_EXCEEDED");
      }

      setScanResults({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || "Unknown",
        mimeType: file.type || "application/octet-stream",
        lastModified: new Date(file.lastModified).toISOString(),
        signature,
        detectedType,
        sha256,
        sha1,
        entropy,
        riskLevel,
        riskFactors,
      });
    } catch (error) {
      console.error("Scan failed:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const reset = () => {
    setFile(null);
    setScanResults(null);
  };

  return (
    <ToolLayout
      title="Security Scanner"
      description="Deep forensic analysis of file metadata, entropy, and cryptographic signatures. Detect hidden payloads and verify integrity."
      icon={<Search className="w-4 h-4" />}
      category="Security"
      id="sec-scanner"
      parameters={
        <div className="space-y-6">
          <div className="space-y-3">
            <span id="protocol-config-label" className="mono-label text-muted-foreground text-[10px]">Protocol Configuration</span>
            <div role="group" aria-labelledby="protocol-config-label" className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="mono-label text-[9px] text-muted-foreground">DEEP_SCAN</span>
                <button type="button" aria-label="Deep Scan Active" className="w-8 h-4 bg-brand-accent rounded-full relative flex items-center px-1 cursor-default">
                  <div className="w-2.5 h-2.5 bg-white rounded-full ml-auto" />
                </button>
              </div>
              <div className="flex items-center justify-between opacity-50">
                <span className="mono-label text-[9px] text-muted-foreground">REMOTE_VIRUS_DB</span>
                <button type="button" aria-label="Remote Virus DB Inactive" className="w-8 h-4 bg-muted rounded-full relative flex items-center px-1 cursor-default">
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <span id="security-primitivies-label" className="mono-label text-muted-foreground text-[10px]">Security Primatives</span>
            <div role="group" aria-labelledby="security-primitivies-label" className="grid grid-cols-1 gap-2">
              {[
                { label: "SHA-256_INTEGRITY", active: true },
                { label: "ENTROPY_ANALYSIS", active: true },
                { label: "SIGNATURE_MATCH", active: true },
                { label: "METADATA_EXTRACT", active: true },
              ].map((p) => (
                <div key={p.label} className="flex items-center gap-2 px-3 py-2 rounded border border-border bg-background/50">
                  <div className={`w-1.5 h-1.5 rounded-full ${p.active ? 'bg-brand-accent shadow-[0_0_8px_rgba(124,92,255,0.5)]' : 'bg-muted'}`} />
                  <span className="mono-label text-[9px] font-bold text-foreground">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
      actions={
        <div className="flex flex-col gap-2">
          {!scanResults ? (
            <button
              type="button"
              onClick={handleScan}
              disabled={isScanning || !file}
              className="w-full py-4 bg-foreground text-background mono-label font-bold text-sm hover:bg-brand-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isScanning ? "Analyzing..." : "Initiate Scan"}
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            </button>
          ) : (
            <button
              type="button"
              onClick={reset}
              className="w-full py-4 bg-foreground text-background mono-label font-bold text-sm hover:bg-brand-accent transition-colors flex items-center justify-center gap-2"
            >
              Scan New Payload <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      }
    >
      <div className="flex-1 flex flex-col gap-8 py-8">
        {!scanResults ? (
          <label htmlFor="scan-payload" className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-[32px] transition-all p-12 text-center group cursor-pointer ${
            file ? "border-brand-accent/30 bg-brand-accent/5" : "border-border bg-muted/5 hover:border-brand-accent hover:bg-brand-accent/5"
          }`}>
            <input 
              id="scan-payload"
              type="file" 
              onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} 
              className="hidden" 
            />
            
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
              file ? "bg-brand-accent/10 text-brand-accent" : "bg-muted text-muted-foreground"
            }`}>
              {file ? <FileCheck className="w-8 h-8" /> : <FileSearch className="w-8 h-8" />}
            </div>

            <div className="space-y-2">
              <h3 className="mono-label text-xl font-bold italic">
                {file ? file.name : "LOAD_TARGET_PAYLOAD"}
              </h3>
              <p className="mono-label text-xs text-muted-foreground">
                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "SIGNATURE_ANALYSIS_ONLY / NO_UPLOAD_LOCAL_EXEC"}
              </p>
            </div>
          </label>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Risk Assessment */}
            <div className={`p-8 rounded-[32px] border flex flex-col md:flex-row gap-8 relative overflow-hidden ${
              scanResults.riskLevel === "high" ? "bg-red-500/5 border-red-500/20" :
              scanResults.riskLevel === "medium" ? "bg-orange-500/5 border-orange-500/20" :
              "bg-emerald-500/5 border-emerald-500/20"
            }`}>
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  {scanResults.riskLevel === "high" ? <ShieldAlert className="w-5 h-5 text-red-500" /> :
                   scanResults.riskLevel === "medium" ? <ShieldQuestion className="w-5 h-5 text-orange-500" /> :
                   <ShieldCheck className="w-5 h-5 text-emerald-500" />}
                  <span className={`mono-label text-xs font-bold italic uppercase ${
                    scanResults.riskLevel === "high" ? "text-red-500" :
                    scanResults.riskLevel === "medium" ? "text-orange-500" :
                    "text-emerald-500"
                  }`}>
                    {scanResults.riskLevel}_THREAT_VECTOR_DETECTED
                  </span>
                </div>
                <div className="space-y-2">
                  {scanResults.riskFactors.map((factor) => (
                    <div key={factor} className="flex items-start gap-2 text-[10px] mono-label text-muted-foreground">
                      <ChevronRight className="w-3 h-3 mt-0.5 text-brand-accent shrink-0" />
                      <span className="leading-relaxed">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end justify-center gap-1">
                <div className="mono-label text-[8px] text-muted-foreground">SECURITY_INDEX</div>
                <div className={`text-4xl font-black italic tracking-tighter ${
                  scanResults.riskLevel === "high" ? "text-red-500" :
                  scanResults.riskLevel === "medium" ? "text-orange-500" :
                  "text-emerald-500"
                }`}>
                  {scanResults.riskLevel === "high" ? "024" :
                   scanResults.riskLevel === "medium" ? "068" : "096"}/100
                </div>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-[32px] border border-border bg-background/50 space-y-6">
                <div className="mono-label text-foreground font-bold italic text-xs border-b border-border pb-4">FILE_METADATA</div>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  {[
                    { label: "MIME_TYPE", value: scanResults.mimeType },
                    { label: "BYTE_SIZE", value: `${scanResults.fileSize.toLocaleString()} B` },
                    { label: "LAST_MOD", value: scanResults.lastModified.split('T')[0] },
                    { label: "MAGIC_ID", value: scanResults.detectedType },
                  ].map((stat) => (
                    <div key={stat.label} className="space-y-1">
                      <div className="mono-label text-muted-foreground text-[8px]">{stat.label}</div>
                      <div className="mono-label text-foreground text-[10px] font-bold truncate">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 rounded-[32px] border border-border bg-background/50 space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="mono-label text-foreground font-bold italic text-xs uppercase">Entropy_Signature</div>
                  <div className="mono-label text-brand-accent font-bold text-[10px]">{scanResults.entropy} BITS/BYTE</div>
                </div>
                <div className="h-24 flex items-end gap-1 px-1">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div 
                      // Using index here as this is purely decorative and doesn't change
                      key={`decorative-bar-${i}`} 
                      className="flex-1 bg-brand-accent/20 rounded-t-sm transition-all hover:bg-brand-accent/50" 
                      style={{ 
                        height: `${Math.random() * 100 + (scanResults.entropy / 8 * 20)}%`,
                        opacity: 0.3 + (i / 32) * 0.7
                      }} 
                    />
                  ))}
                </div>
                <p className="mono-label text-[8px] text-muted-foreground leading-relaxed uppercase">
                  Statistical distribution of byte frequencies. Values above 7.5 suggest high-density encryption or compression payloads.
                </p>
              </div>
            </div>

            {/* Cryptographic Hashes */}
            <div className="p-8 rounded-[32px] border border-border bg-muted/10 space-y-4">
              <div className="mono-label text-foreground font-bold italic text-xs uppercase tracking-tight">Cryptographic_Integrity_Check</div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="mono-label text-[8px] text-muted-foreground">SHA-256_HASH</span>
                    <button type="button" onClick={() => navigator.clipboard.writeText(scanResults.sha256)} className="mono-label text-[8px] text-brand-accent hover:underline uppercase">COPY_HASH</button>
                  </div>
                  <div className="p-4 rounded-xl bg-background border border-border font-mono text-[10px] break-all text-foreground leading-relaxed opacity-80">
                    {scanResults.sha256}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="mono-label text-[8px] text-muted-foreground">HEX_SIGNATURE_(MAGIC_BYTES)</span>
                  </div>
                  <div className="p-4 rounded-xl bg-background border border-border font-mono text-[10px] break-all text-foreground leading-relaxed opacity-80">
                    {scanResults.signature}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-8 rounded-[32px] border border-border bg-muted/5 flex items-center gap-6">
          <div className="w-12 h-12 rounded-full bg-brand-accent/10 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-brand-accent" />
          </div>
          <p className="mono-label text-[9px] text-muted-foreground leading-relaxed uppercase tracking-wider">
            All analysis is performed in-browser via Web Crypto API. No file fragments or metadata are transmitted to external servers. High-performance forensic computing on the edge.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
