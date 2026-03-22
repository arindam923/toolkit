"use client";

import { useState, useCallback } from "react";
import Footer from "@/components/home/Footer";
import ToolHeader from "@/components/shared/ToolHeader";

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

  // Check for common formats by extension might not be available here
  return "Unknown / Generic";
}

export default function SecurityScannerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<{
    fileName: string;
    fileSize: string;
    fileType: string;
    mimeType: string;
    lastModified: string;
    signature: string;
    detectedType: string;
    sha256: string;
    sha1?: string;
    entropy?: number;
    riskLevel: "low" | "medium" | "high" | "unknown";
    riskFactors: string[];
  } | null>(null);

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

  // Compute SHA-1 hash for the file
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

  const scan = async () => {
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

      // Assess risk based on file type and entropy
      const riskFactors: string[] = [];
      let riskLevel: "low" | "medium" | "high" | "unknown" =
        "low";

      if (entropy < 3) {
        riskFactors.push(
          "Very low entropy suggests plaintext or highly compressible data",
        );
      } else if (entropy > 7.5) {
        riskFactors.push(
          "High entropy indicates encrypted or compressed data",
        );
      }

      const executableTypes = [
        "Windows EXE",
        "ELF Binary",
        "Mach-O Binary",
        "Android Dalvik (DEX)",
      ];
      if (
        executableTypes.some((t) =>
          detectedType.includes(t),
        )
      ) {
        riskLevel = "medium";
        riskFactors.push(
          "Executable file format - verify source",
        );
      }

      if (detectedType === "Unknown / Generic") {
        riskLevel = "medium";
        riskFactors.push(
          "Unknown file type - exercise caution",
        );
      }

      if (file.size > 100 * 1024 * 1024) {
        riskLevel = "medium";
        riskFactors.push("Large file size (>100MB)");
      }

      if (
        detectedType.includes("ZIP") ||
        detectedType.includes("ZIP (Old)")
      ) {
        riskFactors.push(
          "Archive file - may contain multiple files",
        );
      }

      setScanResults({
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        fileType: file.type || "Unknown",
        mimeType: file.type || "Not specified",
        lastModified: new Date(
          file.lastModified,
        ).toLocaleString(),
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
          title="Security Scanner"
          description="Analyze files for metadata, detect file type, verify integrity, and identify potential security risks."
          icon="🔍"
        />

        {/* Tool Content */}
        <section className="mb-3">
          {/* File Upload */}
          <div
            className="p-4 rounded-[14px] mb-2.5"
            style={{
              background: "var(--color-background-primary)",
            }}
          >
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
                    setScanResults(null);
                  }
                }}
                className="hidden"
                accept="*/*"
              />
              <div className="text-2xl mb-2">🔍</div>
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
                  "Select a file to scan"
                )}
              </p>
              <p
                className="text-[10px] mt-1"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                Any file up to 25MB
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
                MB • Type: {file.type || "Unknown"}
              </div>
            )}
          </div>

          {/* Scan Button */}
          <button
            onClick={scan}
            disabled={isScanning || !file}
            className="w-full px-5.5 py-2.5 rounded-[10px] text-sm font-semibold cursor-pointer transition-all mb-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background:
                "linear-gradient(135deg, #3498DB, #5dade2)",
              color: "#fff",
              boxShadow: "0 4px 12px rgba(52,152,219,0.3)",
            }}
          >
            {isScanning ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Scanning...
              </span>
            ) : (
              "Scan File"
            )}
          </button>

          {/* Results */}
          {scanResults && (
            <div className="space-y-2.5">
              <h3
                className="font-['Syne'] text-xs font-bold tracking-[2px] uppercase"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                Scan Results
              </h3>

              {/* Risk Level */}
              <div
                className="p-3 rounded-[10px]"
                style={{
                  background:
                    scanResults.riskLevel === "high"
                      ? "rgba(239,68,68,0.08)"
                      : scanResults.riskLevel === "medium"
                        ? "rgba(245,158,11,0.08)"
                        : "rgba(34,197,94,0.08)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="px-2 py-0.5 rounded text-[10px] font-semibold"
                    style={{
                      background:
                        scanResults.riskLevel === "high"
                          ? "rgba(239,68,68,0.15)"
                          : scanResults.riskLevel ===
                              "medium"
                            ? "rgba(245,158,11,0.15)"
                            : "rgba(34,197,94,0.15)",
                      color:
                        scanResults.riskLevel === "high"
                          ? "#dc2626"
                          : scanResults.riskLevel ===
                              "medium"
                            ? "#f59e0b"
                            : "#16a34a",
                    }}
                  >
                    {scanResults.riskLevel.toUpperCase()}{" "}
                    RISK
                  </div>
                  <span
                    className="text-[11px]"
                    style={{
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Based on file type and analysis
                  </span>
                </div>
                {scanResults.riskFactors.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {scanResults.riskFactors.map(
                      (factor, i) => (
                        <li
                          key={i}
                          className="text-[10px] flex items-start gap-1"
                          style={{
                            color:
                              "var(--color-text-secondary)",
                          }}
                        >
                          <span
                            style={{ color: "#FF5C35" }}
                          >
                            •
                          </span>{" "}
                          {factor}
                        </li>
                      ),
                    )}
                  </ul>
                )}
              </div>

              {/* File Info Grid */}
              <div
                className="p-3 rounded-[10px]"
                style={{
                  background:
                    "var(--color-background-primary)",
                }}
              >
                <div
                  className="text-xs font-medium mb-2"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  File Information
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span
                      style={{
                        color:
                          "var(--color-text-secondary)",
                      }}
                    >
                      File Name
                    </span>
                    <span
                      className="font-mono"
                      style={{
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {scanResults.fileName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span
                      style={{
                        color:
                          "var(--color-text-secondary)",
                      }}
                    >
                      File Size
                    </span>
                    <span
                      style={{
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {scanResults.fileSize}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span
                      style={{
                        color:
                          "var(--color-text-secondary)",
                      }}
                    >
                      MIME Type
                    </span>
                    <span
                      className="font-mono"
                      style={{
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {scanResults.mimeType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span
                      style={{
                        color:
                          "var(--color-text-secondary)",
                      }}
                    >
                      Last Modified
                    </span>
                    <span
                      style={{
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {scanResults.lastModified}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span
                      style={{
                        color:
                          "var(--color-text-secondary)",
                      }}
                    >
                      Detected Type
                    </span>
                    <span
                      className="font-mono"
                      style={{ color: "#3498DB" }}
                    >
                      {scanResults.detectedType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span
                      style={{
                        color:
                          "var(--color-text-secondary)",
                      }}
                    >
                      Entropy
                    </span>
                    <span
                      style={{
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {scanResults.entropy} bits/byte
                    </span>
                  </div>
                </div>
              </div>

              {/* Hashes */}
              <div className="space-y-2">
                <div
                  className="p-3 rounded-[10px]"
                  style={{
                    background:
                      "var(--color-background-primary)",
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-[10px] font-medium"
                      style={{
                        color:
                          "var(--color-text-secondary)",
                      }}
                    >
                      SHA-256
                    </span>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          scanResults.sha256,
                        )
                      }
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        background:
                          "var(--color-background-secondary)",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      Copy
                    </button>
                  </div>
                  <div
                    className="p-2 rounded font-mono text-[10px] break-all select-all"
                    style={{
                      background:
                        "var(--color-background-secondary)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {scanResults.sha256}
                  </div>
                </div>

                <div
                  className="p-3 rounded-[10px]"
                  style={{
                    background:
                      "var(--color-background-primary)",
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-[10px] font-medium"
                      style={{
                        color:
                          "var(--color-text-secondary)",
                      }}
                    >
                      SHA-1 (for comparison)
                    </span>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          scanResults.sha1 || "",
                        )
                      }
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        background:
                          "var(--color-background-secondary)",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      Copy
                    </button>
                  </div>
                  <div
                    className="p-2 rounded font-mono text-[10px] break-all select-all"
                    style={{
                      background:
                        "var(--color-background-secondary)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {scanResults.sha1}
                  </div>
                  <p
                    className="text-[9px] mt-1"
                    style={{
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    SHA-1 provided for legacy compatibility
                    - not recommended for security use
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reset */}
          {scanResults && (
            <button
              onClick={reset}
              className="w-full px-4 py-2 rounded-[10px] text-xs font-medium mt-2.5"
              style={{
                background: "transparent",
                color: "var(--color-text-secondary)",
                border:
                  "0.5px solid var(--color-border-tertiary)",
              }}
            >
              Scan Another File
            </button>
          )}

          {/* Info */}
          <div
            className="p-3 rounded-[10px] mt-2.5"
            style={{ background: "rgba(52,152,219,0.08)" }}
          >
            <p
              className="text-xs"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              <strong style={{ color: "#3498DB" }}>
                Scanner Info:
              </strong>{" "}
              This tool reads file signatures (magic
              numbers) to detect file types, computes
              SHA-256 for integrity verification, and
              estimates entropy to identify
              encrypted/compressed data. All processing
              happens locally in your browser.
            </p>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
