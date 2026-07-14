"use client";

import { useState } from "react";
import ToolLayout from "@/components/shared/ToolLayout";
import { FileText, Copy, Check, Minimize2, Maximize2 } from "lucide-react";

export default function JsonFormatTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    setError("");
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const handleMinify = () => {
    setError("");
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="JSON Format"
      description="Pretty-print or minify JSON data with syntax validation."
      icon={<FileText className="w-4 h-4" />}
      category="Text"
      id="json-format"
      parameters={
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleFormat}
              disabled={!input}
              className="flex items-center gap-2 px-3 py-2 bg-foreground text-background text-xs font-bold hover:bg-brand-accent transition-colors disabled:opacity-50"
            >
              <Maximize2 className="w-3 h-3" /> Format
            </button>
            <button
              type="button"
              onClick={handleMinify}
              disabled={!input}
              className="flex items-center gap-2 px-3 py-2 bg-foreground text-background text-xs font-bold hover:bg-brand-accent transition-colors disabled:opacity-50"
            >
              <Minimize2 className="w-3 h-3" /> Minify
            </button>
          </div>
        </div>
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
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      }
    >
      <div className="flex-1 flex flex-col gap-4 p-4">
        <div className="flex-1 flex flex-col gap-2">
          <label className="mono-label text-[10px] text-muted-foreground">INPUT</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"key": "value"}'
            className="flex-1 min-h-[300px] bg-muted/30 border border-border rounded-lg p-3 font-mono text-sm resize-none focus:border-brand-accent outline-none"
          />
        </div>
        {error && (
          <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 text-xs font-mono">
            {error}
          </div>
        )}
        <div className="flex-1 flex flex-col gap-2">
          <label className="mono-label text-[10px] text-muted-foreground">OUTPUT</label>
          <textarea
            value={output}
            readOnly
            placeholder="Result will appear here..."
            className="flex-1 min-h-[300px] bg-muted/30 border border-border rounded-lg p-3 font-mono text-sm resize-none"
          />
        </div>
      </div>
    </ToolLayout>
  );
}
