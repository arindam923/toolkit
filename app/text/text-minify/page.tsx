"use client";

import { useState } from "react";
import ToolLayout from "@/components/shared/ToolLayout";
import { FileText, Copy, Check } from "lucide-react";

export default function TextMinifyTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleMinify = () => {
    const minified = input
      .replace(/\s+/g, " ")
      .replace(/\s*([{}();:,<>])\s*/g, "$1")
      .replace(/\s*([=+\-*/<>!&|])\s*/g, "$1")
      .trim();
    setOutput(minified);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Text Minifier"
      description="Remove extra whitespace and minify text content."
      icon={<FileText className="w-4 h-4" />}
      category="Text"
      id="text-minify"
      parameters={
        <button
          type="button"
          onClick={handleMinify}
          disabled={!input}
          className="px-3 py-2 bg-foreground text-background text-xs font-bold hover:bg-brand-accent transition-colors disabled:opacity-50"
        >
          Minify
        </button>
      }
      actions={
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!output}
            className="flex items-center justify-center gap-2 w-full py-3 bg-foreground text-background mono-label font-bold text-sm hover:bg-brand-accent transition-colors disabled:opacity-50"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy Minified"}
          </button>
          {input && output && (
            <div className="text-center text-[10px] text-muted-foreground">
              {input.length} → {output.length} chars ({Math.round((1 - output.length / input.length) * 100)}% smaller)
            </div>
          )}
        </div>
      }
    >
      <div className="flex-1 flex flex-col gap-4 p-4">
        <div className="flex-1 flex flex-col gap-2">
          <label className="mono-label text-[10px] text-muted-foreground">INPUT TEXT</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste text to minify..."
            className="flex-1 min-h-[300px] bg-muted/30 border border-border rounded-lg p-3 font-mono text-sm resize-none focus:border-brand-accent outline-none"
          />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label className="mono-label text-[10px] text-muted-foreground">MINIFIED OUTPUT</label>
          <textarea
            value={output}
            readOnly
            placeholder="Minified result will appear here..."
            className="flex-1 min-h-[300px] bg-muted/30 border border-border rounded-lg p-3 font-mono text-sm resize-none"
          />
        </div>
      </div>
    </ToolLayout>
  );
}
