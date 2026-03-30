"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/shared/ToolLayout";
import { Key, Copy, RefreshCw, Shield, AlertTriangle, CheckCircle } from "lucide-react";

const CHARS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

export default function PasswordGeneratorTool() {
  const [length, setLength] = useState(24);
  const [password, setPassword] = useState("");
  const [includeLower, setIncludeLower] = useState(true);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  const generatePassword = useCallback(() => {
    let chars = "";
    if (includeLower) chars += CHARS.lowercase;
    if (includeUpper) chars += CHARS.uppercase;
    if (includeNumbers) chars += CHARS.numbers;
    if (includeSymbols) chars += CHARS.symbols;

    if (chars === "") {
      setPassword("");
      return;
    }

    let result = "";
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }

    setPassword(result);
  }, [length, includeLower, includeUpper, includeNumbers, includeSymbols]);

  // Generate on initial load
  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const calculateEntropy = () => {
    let charsetSize = 0;
    if (includeLower) charsetSize += 26;
    if (includeUpper) charsetSize += 26;
    if (includeNumbers) charsetSize += 10;
    if (includeSymbols) charsetSize += CHARS.symbols.length;
    if (charsetSize === 0) return 0;
    return Math.round(length * Math.log2(charsetSize));
  };

  const getStrength = (entropy: number) => {
    if (entropy < 40) return { label: "CRITICAL", color: "text-red-500", bg: "bg-red-500/10", icon: <AlertTriangle className="w-3 h-3" /> };
    if (entropy < 80) return { label: "MODERATE", color: "text-amber-500", bg: "bg-amber-500/10", icon: <Shield className="w-3 h-3" /> };
    return { label: "SECURE", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: <CheckCircle className="w-3 h-3" /> };
  };

  const entropy = calculateEntropy();
  const strength = getStrength(entropy);

  return (
    <ToolLayout
      title="Password Generator"
      description="Generate high-entropy cryptographic passcodes with modular character constraints and length control."
      icon={<Key className="w-4 h-4" />}
      category="Security"
      id="pwd-gen"
      parameters={
        <div className="space-y-6">
          <div className="space-y-3">
             <div className="flex items-center justify-between">
              <label htmlFor="entropy-slider" className="mono-label text-muted-foreground text-[10px]">Entropy Length</label>
              <span className="mono-label text-brand-accent font-bold">{length} CHARS</span>
            </div>
            <input
              id="entropy-slider"
              type="range"
              min="8"
              max="128"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-brand-accent"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="char-sets" className="mono-label text-muted-foreground text-[10px]">Character Sets</label>
            <div id="char-sets" className="grid grid-cols-1 gap-2">
              {[
                { label: "Lowercase (a-z)", state: includeLower, setter: setIncludeLower },
                { label: "Uppercase (A-Z)", state: includeUpper, setter: setIncludeUpper },
                { label: "Numbers (0-9)", state: includeNumbers, setter: setIncludeNumbers },
                { label: "Symbols (!@#$)", state: includeSymbols, setter: setIncludeSymbols },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => item.setter(!item.state)}
                  className={`flex items-center justify-between px-3 py-2 rounded border transition-all ${
                    item.state 
                      ? "border-brand-accent/30 bg-brand-accent/5 text-foreground" 
                      : "border-border bg-transparent text-muted-foreground hover:border-foreground/20"
                  }`}
                >
                  <span className="mono-label text-[10px]">{item.label}</span>
                  <div className={`w-3 h-3 rounded-full border border-current flex items-center justify-center`}>
                    {item.state && <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />}
                  </div>
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
            onClick={generatePassword}
            className="w-full py-4 bg-foreground text-background mono-label font-bold text-sm hover:bg-brand-accent transition-colors flex items-center justify-center gap-2"
          >
            Regenerate <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!password}
            className="w-full py-3 bg-transparent text-foreground border border-border mono-label font-bold text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {copied ? "Copied to Buffer" : "Copy to Clipboard"} <Copy className="w-4 h-4" />
          </button>
        </>
      }
    >
      <div className="flex-1 flex flex-col justify-center py-12">
        <div className="relative group">
          <div className="absolute -inset-4 bg-brand-accent/5 blur-2xl rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative p-12 rounded-[32px] border border-border bg-background/50 backdrop-blur-sm text-center space-y-8">
            <div className="space-y-2">
              <div className="mono-label text-muted-foreground text-[10px]">Generated Sequence</div>
              <div className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-foreground break-all selection:bg-brand-accent selection:text-white">
                {password}
              </div>
            </div>

            <div className="flex items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-1">
                <div className="text-2xl font-display font-bold text-foreground">{entropy}</div>
                <div className="mono-label text-muted-foreground text-[9px]">BITS_ENTROPY</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${strength.bg} ${strength.color}`}>
                  {strength.icon}
                  <span className="mono-label text-[10px] font-bold">{strength.label}</span>
                </div>
                <div className="mono-label text-muted-foreground text-[9px]">SECURITY_LEVEL</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 rounded-2xl border border-border bg-muted/10">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-brand-accent/10 text-brand-accent">
              <Shield className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="mono-label text-foreground font-bold italic">PRO TIP / SECURITY_BEST_PRACTICE</h4>
              <p className="text-xs text-muted-foreground leading-relaxed uppercase tracking-widest leading-relaxed">
                NEVER USE THE SAME PASSWORD ACROSS MULTIPLE SERVICES. THIS GENERATOR RUNS ENTIRELY LOCALLY USING WINDOW.CRYPTO FOR CRYPTOGRAPHICALLY SECURE RANDOMNESS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
