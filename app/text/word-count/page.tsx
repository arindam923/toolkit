"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/shared/ToolLayout";
import { Type, Copy, Check } from "lucide-react";

export default function WordCountTool() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    if (!input) {
      return { words: 0, characters: 0, charactersNoSpaces: 0, lines: 0, paragraphs: 0 };
    }
    const words = input.trim() ? input.trim().split(/\s+/).length : 0;
    const characters = input.length;
    const charactersNoSpaces = input.replace(/\s/g, "").length;
    const lines = input.split("\n").length;
    const paragraphs = input.trim() ? input.trim().split(/\n\s*\n/).length : 0;
    return { words, characters, charactersNoSpaces, lines, paragraphs };
  }, [input]);

  const handleCopy = () => {
    const text = `Words: ${stats.words}\nCharacters: ${stats.characters}\nCharacters (no spaces): ${stats.charactersNoSpaces}\nLines: ${stats.lines}\nParagraphs: ${stats.paragraphs}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Word Count"
      description="Count words, characters, lines, and paragraphs in text."
      icon={<Type className="w-4 h-4" />}
      category="Text"
      id="word-count"
      parameters={
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Words", value: stats.words },
            { label: "Characters", value: stats.characters },
            { label: "Chars (no spaces)", value: stats.charactersNoSpaces },
            { label: "Lines", value: stats.lines },
            { label: "Paragraphs", value: stats.paragraphs },
          ].map((stat) => (
            <div key={stat.label} className="p-3 bg-muted/30 border border-border rounded-lg">
              <div className="mono-label text-[8px] text-muted-foreground">{stat.label.toUpperCase()}</div>
              <div className="text-2xl font-bold font-mono">{stat.value}</div>
            </div>
          ))}
        </div>
      }
      actions={
        <button
          type="button"
          onClick={handleCopy}
          disabled={!input}
          className="flex items-center justify-center gap-2 w-full py-3 bg-foreground text-background mono-label font-bold text-sm hover:bg-brand-accent transition-colors disabled:opacity-50"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied" : "Copy Stats"}
        </button>
      }
    >
      <div className="flex-1 flex flex-col gap-2 p-4">
        <label className="mono-label text-[10px] text-muted-foreground">INPUT TEXT</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste your text here..."
          className="flex-1 min-h-[400px] bg-muted/30 border border-border rounded-lg p-3 font-mono text-sm resize-none focus:border-brand-accent outline-none"
        />
      </div>
    </ToolLayout>
  );
}
