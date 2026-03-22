"use client";

import { useState, useCallback } from "react";
import Footer from "@/components/home/Footer";
import ToolHeader from "@/components/shared/ToolHeader";

const HASH_ALGORITHMS = [
  { id: "SHA-256", name: "SHA-256", bits: 256 },
  { id: "SHA-512", name: "SHA-512", bits: 512 },
  { id: "SHA-1", name: "SHA-1 (legacy)", bits: 160 },
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
  const cryptoAlgo =
    algorithm === "SHA-256"
      ? "SHA-256"
      : algorithm === "SHA-512"
        ? "SHA-512"
        : algorithm === "SHA-1"
          ? "SHA-1"
          : undefined;

  if (cryptoAlgo) {
    const hash = await crypto.subtle.digest(
      cryptoAlgo,
      dataBuffer,
    );
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  throw new Error(`Unsupported algorithm: ${algorithm}`);
}

export default function HashGeneratorTool() {
  const [inputType, setInputType] = useState<
    "text" | "file"
  >("text");
  const [textInput, setTextInput] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(
    null,
  );
  const [fileHash, setFileHash] = useState("");
  const [selectedAlgos, setSelectedAlgos] = useState<
    string[]
  >(["SHA-256", "SHA-512"]);
  const [hashes, setHashes] = useState<
    Record<string, string>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");

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
        } else {
          const arrayBuffer =
            await fileInput!.arrayBuffer();
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

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileInput(file);
      setFileName(file.name);
      setFileHash("");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
          title="Hash Generator"
          description="Generate cryptographic hashes (SHA-256, SHA-512, MD5, SHA-1) from text or files."
          icon="🔐"
        />

        {/* Tool Content */}
        <section className="mb-3">
          {/* Input Type Toggle */}
          <div
            className="p-4 rounded-[14px] mb-2.5"
            style={{
              background: "var(--color-background-primary)",
            }}
          >
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setInputType("text")}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                  inputType === "text"
                    ? "text-[#3498DB] border border-[#3498DB]"
                    : "text-[var(--color-text-secondary)] border border-transparent hover:border-[var(--color-border-tertiary)]"
                }`}
                style={{
                  background:
                    inputType === "text"
                      ? "rgba(52,152,219,0.08)"
                      : "transparent",
                }}
              >
                Text Input
              </button>
              <button
                onClick={() => setInputType("file")}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                  inputType === "file"
                    ? "text-[#3498DB] border border-[#3498DB]"
                    : "text-[var(--color-text-secondary)] border border-transparent hover:border-[var(--color-border-tertiary)]"
                }`}
                style={{
                  background:
                    inputType === "file"
                      ? "rgba(52,152,219,0.08)"
                      : "transparent",
                }}
              >
                File Upload
              </button>
            </div>

            {inputType === "text" ? (
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Enter Text
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) =>
                    setTextInput(e.target.value)
                  }
                  rows={4}
                  className="w-full p-3 rounded-[10px] text-xs font-mono resize-none outline-none"
                  style={{
                    background:
                      "var(--color-background-secondary)",
                    color: "var(--color-text-primary)",
                    border:
                      "0.5px solid var(--color-border-tertiary)",
                  }}
                  placeholder="Enter the text you want to hash..."
                />
              </div>
            ) : (
              <div>
                <label
                  className="flex flex-col items-center justify-center p-6 rounded-[10px] cursor-pointer border-2 border-dashed transition-all hover:border-[#3498DB]"
                  style={{
                    background:
                      "var(--color-background-secondary)",
                    borderColor: fileInput
                      ? "rgba(52,152,219,0.3)"
                      : "var(--color-border-tertiary)",
                  }}
                >
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="*/*"
                  />
                  <div className="text-2xl mb-2">📁</div>
                  <p
                    className="text-xs text-center"
                    style={{
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {fileInput ? (
                      <span className="font-medium text-[#3498DB]">
                        {fileName}
                      </span>
                    ) : (
                      "Click to select a file or drag it here"
                    )}
                  </p>
                  <p
                    className="text-[10px] mt-1"
                    style={{
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Any file type, up to 25MB
                  </p>
                </label>
                {fileInput && (
                  <div
                    className="mt-2 text-xs"
                    style={{
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Size:{" "}
                    {(fileInput.size / 1024 / 1024).toFixed(
                      2,
                    )}{" "}
                    MB
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Algorithm Selection */}
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
              Hash Algorithms
            </h3>
            <div className="space-y-2">
              {HASH_ALGORITHMS.map((algo) => (
                <label
                  key={algo.id}
                  className="flex items-center justify-between cursor-pointer p-2 rounded"
                  style={{
                    background:
                      "var(--color-background-secondary)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedAlgos.includes(
                        algo.id,
                      )}
                      onChange={() =>
                        handleAlgoToggle(algo.id)
                      }
                      className="w-4 h-4 accent-[#3498DB]"
                    />
                    <span
                      className="text-xs"
                      style={{
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {algo.name}
                    </span>
                  </div>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{
                      background: "rgba(52,152,219,0.1)",
                      color: "#3498DB",
                    }}
                  >
                    {algo.bits} bits
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateHashes}
            disabled={
              isLoading ||
              (inputType === "text"
                ? !textInput.trim()
                : !fileInput)
            }
            className="w-full px-5.5 py-2.5 rounded-[10px] text-sm font-semibold cursor-pointer transition-all mb-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background:
                "linear-gradient(135deg, #3498DB, #5dade2)",
              color: "#fff",
              boxShadow: "0 4px 12px rgba(52,152,219,0.3)",
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Generating...
              </span>
            ) : (
              "Generate Hash"
            )}
          </button>

          {/* Results */}
          {Object.keys(hashes).length > 0 && (
            <div className="space-y-2.5">
              <h3
                className="font-['Syne'] text-xs font-bold tracking-[2px] uppercase"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                Hash Results
              </h3>
              {Object.entries(hashes).map(
                ([algo, hash]) => (
                  <div
                    key={algo}
                    className="p-3 rounded-[10px]"
                    style={{
                      background:
                        "var(--color-background-primary)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="text-xs font-medium"
                        style={{ color: "#3498DB" }}
                      >
                        {algo}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(hash)
                        }
                        className="text-[10px] px-2 py-0.5 rounded font-medium"
                        style={{
                          background:
                            "var(--color-background-secondary)",
                          border:
                            "0.5px solid var(--color-border-tertiary)",
                          color:
                            "var(--color-text-primary)",
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
                      {hash}
                    </div>
                  </div>
                ),
              )}
            </div>
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
                Note:
              </strong>{" "}
              SHA-256 and SHA-512 are recommended for
              security-critical applications. SHA-1 is shown
              for legacy compatibility but is considered
              cryptographically broken.
            </p>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
