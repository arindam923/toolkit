"use client";

import { useState } from "react";
import ToolLayout from "@/components/shared/ToolLayout";
import { FileText, Copy, Check, ArrowRight } from "lucide-react";

export default function CsvToJsonTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    setError("");
    try {
      const lines = input.trim().split("\n");
      if (lines.length < 2) {
        throw new Error("CSV must have at least a header row and one data row");
      }
      const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      const result = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        const obj: Record<string, string> = {};
        headers.forEach((header, i) => {
          obj[header] = values[i] || "";
        });
        return obj;
      });
      setOutput(JSON.stringify(result, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="CSV to JSON"
      description="Convert CSV data to JSON array format."
      icon={<FileText className="w-4 h-4" />}
      category="Text"
      id="csv-to-json"
      parameters={
        <button
          type="button"
          onClick={handleConvert}
          disabled={!input}
          className="flex items-center gap-2 px-3 py-2 bg-foreground text-background text-xs font-bold hover:bg-brand-accent transition-colors disabled:opacity-50"
        >
          Convert <ArrowRight className="w-3 h-3" />
        </button>
      }
      actions={
        <button
          type="button"
          onClick={handleCopy}
          disabled={!output}
          className="flex items-center justify-center gap-2 w-full py-3 bg-foreground text-background mono-label font-bold text-sm hover:bg-brand-accent transition-colors disabled:opacity-50"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied" : "Copy JSON"}
        </button>
      }
    >
      <div className="flex-1 flex flex-col gap-4 p-4">
        <div className="flex-1 flex flex-col gap-2">
          <label className="mono-label text-[10px] text-muted-foreground">CSV INPUT</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"name,age,city\nJohn,30,NYC\nJane,25,LA"}
            className="flex-1 min-h-[300px] bg-muted/30 border border-border rounded-lg p-3 font-mono text-sm resize-none focus:border-brand-accent outline-none"
          />
        </div>
        {error && (
          <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 text-xs font-mono">
            {error}
          </div>
        )}
        <div className="flex-1 flex flex-col gap-2">
          <label className="mono-label text-[10px] text-muted-foreground">JSON OUTPUT</label>
          <textarea
            value={output}
            readOnly
            placeholder="JSON result will appear here..."
            className="flex-1 min-h-[300px] bg-muted/30 border border-border rounded-lg p-3 font-mono text-sm resize-none"
          />
        </div>
      </div>
    </ToolLayout>
  );
}
