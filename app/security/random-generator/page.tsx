"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/shared/ToolLayout";
import { Dices, Copy, RefreshCw, Hash, FileJson, Layers, ShieldCheck, ChevronDown, Binary, Braces } from "lucide-react";

const CHAR_SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  hex: "0123456789abcdef",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  base64: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
};

type GeneratorType = "string" | "number" | "hex" | "base64" | "uuid";

export default function RandomGeneratorTool() {
  const [type, setType] = useState<GeneratorType>("string");
  const [length, setLength] = useState(32);
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<string[]>([]);
  const [separator, setSeparator] = useState("\n");
  const [copied, setCopied] = useState(false);

  const generateRandom = useCallback(
    (charset: string, len: number): string => {
      let result = "";
      const array = new Uint32Array(len);
      window.crypto.getRandomValues(array);
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
        case "string": {
          const stringChars = CHAR_SETS.lowercase + CHAR_SETS.uppercase + CHAR_SETS.symbols + CHAR_SETS.numbers;
          value = generateRandom(stringChars, length);
          break;
        }
        case "number": {
          const numChars = CHAR_SETS.numbers;
          value = generateRandom(numChars, length);
          break;
        }
        case "hex":
          value = generateRandom(CHAR_SETS.hex, length);
          break;
        case "base64":
          value = generateRandom(CHAR_SETS.base64, length);
          break;
        case "uuid":
          value = window.crypto.randomUUID();
          break;
        default:
          value = "";
      }

      newResults.push(value);
    }

    setResults(newResults);
  }, [type, length, count, generateRandom]);

  // Initial generate
  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

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

  const getCharsetInfo = () => {
    switch (type) {
      case "string": return { chars: 94, label: "ALPHANUM_SYMBOLS" };
      case "hex": return { chars: 16, label: "HEXADECIMAL" };
      case "base64": return { chars: 64, label: "BASE64_STANDARD" };
      case "number": return { chars: 10, label: "DECIMAL_DIGITS" };
      case "uuid": return { chars: 16, label: "UUID_V4_STRUCTURED" };
      default: return { chars: 0, label: "" };
    }
  };

  const info = getCharsetInfo();
  const combinations = Math.pow(info.chars, type === "uuid" ? 122 : length);
  const entropy = Math.log2(combinations || 1);

  return (
    <ToolLayout
      title="Random Generator"
      description="Omnichannel high-entropy source for strings, identifiers, and numeric sequences."
      icon={<Dices className="w-4 h-4" />}
      category="Security"
      id="rnd-gen"
      parameters={
        <div className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="generator-vector" className="mono-label text-muted-foreground text-[10px]">Generator Vector</label>
            <div id="generator-vector" className="grid grid-cols-1 gap-1.5">
              {[
                { id: "string", label: "ALPHANUMERIC", icon: <Layers className="w-3 h-3" /> },
                { id: "uuid", label: "UUID_V4", icon: <Braces className="w-3 h-3" /> },
                { id: "hex", label: "HEX_BUFFER", icon: <Binary className="w-3 h-3" /> },
                { id: "number", label: "DIGIT_STREAM", icon: <Hash className="w-3 h-3" /> },
                { id: "base64", label: "BASE64_RAW", icon: <FileJson className="w-3 h-3" /> },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setType(opt.id as GeneratorType)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded border transition-all ${
                    type === opt.id
                      ? "border-brand-accent/30 bg-brand-accent/5 text-foreground"
                      : "border-border bg-transparent text-muted-foreground hover:border-foreground/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {opt.icon}
                    <span className="mono-label text-[10px] font-bold">{opt.label}</span>
                  </div>
                  {type === opt.id && <div className="w-1 h-1 rounded-full bg-brand-accent" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
             <div className="flex items-center justify-between">
              <label htmlFor="matrix-length" className="mono-label text-muted-foreground text-[10px]">Matrix Length</label>
              <span className="mono-label text-brand-accent font-bold">{length} UNITS</span>
            </div>
            <input
              id="matrix-length"
              type="range"
              min="4"
              max="128"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              disabled={type === "uuid"}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-brand-accent disabled:opacity-20"
            />
          </div>

          <div className="space-y-3">
             <div className="flex items-center justify-between">
              <label htmlFor="instance-count" className="mono-label text-muted-foreground text-[10px]">Instance Count</label>
              <span className="mono-label text-brand-accent font-bold">{count} UNITS</span>
            </div>
            <input
              id="instance-count"
              type="range"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-brand-accent"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="buffer-separator" className="mono-label text-muted-foreground text-[10px]">Buffer Separator</label>
            <div className="relative">
              <select
                id="buffer-separator"
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-[10px] font-bold mono-label appearance-none hover:border-foreground/20 transition-colors cursor-pointer"
              >
                <option value="\n">NEW_LINE (\n)</option>
                <option value=",">COMMA (,)</option>
                <option value=" ">SPACE ( )</option>
                <option value="-">HYPHEN (-)</option>
                <option value=";">SEMICOLON (;)</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      }
      actions={
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            className="w-full py-4 bg-foreground text-background mono-label font-bold text-sm hover:bg-brand-accent transition-colors flex items-center justify-center gap-2"
          >
            Regenerate <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={copyAll}
            className={`w-full py-3 bg-transparent border border-border mono-label font-bold text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2 ${
              copied ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/5" : "text-foreground"
            }`}
          >
            {copied ? "Buffer Copied" : "Copy to Clipboard"} <Copy className="w-4 h-4" />
          </button>
        </div>
      }
    >
      <div className="flex-1 flex flex-col gap-8 py-8">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-accent/20 to-orange-500/20 blur-2xl rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative p-8 rounded-[32px] border border-border bg-background/50 backdrop-blur-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2 mono-label text-muted-foreground text-[10px]">
                <ShieldCheck className="w-3 h-3 text-brand-accent" /> OUTPUT_RANDOM_STREAM
              </div>
              <div className="mono-label text-brand-accent text-[9px] font-bold">
                {entropy.toFixed(1)} BITS_ENTROPY
              </div>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-3">
                {results.map((res, i) => (
                  <div key={`${res}-${i}`} className="group/item relative flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-transparent hover:border-brand-accent/30 hover:bg-muted/30 transition-all">
                    <span className="mono-label text-[8px] text-muted-foreground opacity-30 select-none">{(i+1).toString().padStart(3, '0')}</span>
                    <span className="flex-1 font-mono text-sm tracking-tight text-foreground break-all selection:bg-brand-accent selection:text-white">
                      {res}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-[32px] border border-border bg-muted/10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="mono-label text-foreground font-bold italic text-xs uppercase tracking-tight">Technical Specification</div>
            <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-widest leading-relaxed">
              GENERATED USING CRYPTO.GETRANDOMVALUES() AND WINDOW.CRYPTO.RANDOMUUID() PRIMITIVES. 
              THIS ENSURES CRYPTOGRAPHICALLY SECURE UNPREDICTABILITY SUITABLE FOR SECURITY IDENTIFIERS AND SESSION TOKENS.
            </p>
          </div>
          <div className="flex flex-col justify-end items-end space-y-1">
            <div className="mono-label text-muted-foreground text-[8px]">ACTIVE_CHAR_SET</div>
            <div className="mono-label text-foreground text-sm font-bold italic">{info.label}</div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
