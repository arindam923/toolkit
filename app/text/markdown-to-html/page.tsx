"use client";

import { useState } from "react";
import ToolLayout from "@/components/shared/ToolLayout";
import { FileText, Copy, Check } from "lucide-react";

function markdownToHtml(md: string): string {
  const html = md
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.*$)/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");
  return `<p>${html}</p>`;
}

export default function MarkdownToHtmlTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    setOutput(markdownToHtml(input));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Markdown to HTML"
      description="Convert Markdown text to HTML markup."
      icon={<FileText className="w-4 h-4" />}
      category="Text"
      id="markdown-to-html"
      parameters={
        <button
          type="button"
          onClick={handleConvert}
          disabled={!input}
          className="px-3 py-2 bg-foreground text-background text-xs font-bold hover:bg-brand-accent transition-colors disabled:opacity-50"
        >
          Convert to HTML
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
            {copied ? "Copied" : "Copy HTML"}
          </button>
        </div>
      }
    >
      <div className="flex-1 flex flex-col gap-4 p-4">
        <div className="flex-1 flex flex-col gap-2">
          <label className="mono-label text-[10px] text-muted-foreground">MARKDOWN INPUT</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"# Heading\n\n**Bold** and *italic* text.\n\n- List item 1\n- List item 2"}
            className="flex-1 min-h-[300px] bg-muted/30 border border-border rounded-lg p-3 font-mono text-sm resize-none focus:border-brand-accent outline-none"
          />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label className="mono-label text-[10px] text-muted-foreground">HTML OUTPUT</label>
          <textarea
            value={output}
            readOnly
            placeholder="HTML result will appear here..."
            className="flex-1 min-h-[300px] bg-muted/30 border border-border rounded-lg p-3 font-mono text-sm resize-none"
          />
        </div>
      </div>
    </ToolLayout>
  );
}
