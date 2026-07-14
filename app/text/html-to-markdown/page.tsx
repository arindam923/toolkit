"use client";

import { useState } from "react";
import ToolLayout from "@/components/shared/ToolLayout";
import { FileText, Copy, Check } from "lucide-react";

function htmlToMarkdown(html: string): string {
  const md = html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
    .replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*")
    .replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
    .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, "```\n$1\n```\n\n")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, "$1")
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, "$1")
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return md;
}

export default function HtmlToMarkdownTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    setOutput(htmlToMarkdown(input));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="HTML to Markdown"
      description="Convert HTML markup to clean Markdown text."
      icon={<FileText className="w-4 h-4" />}
      category="Text"
      id="html-to-markdown"
      parameters={
        <button
          type="button"
          onClick={handleConvert}
          disabled={!input}
          className="px-3 py-2 bg-foreground text-background text-xs font-bold hover:bg-brand-accent transition-colors disabled:opacity-50"
        >
          Convert to Markdown
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
          {copied ? "Copied" : "Copy Markdown"}
        </button>
      }
    >
      <div className="flex-1 flex flex-col gap-4 p-4">
        <div className="flex-1 flex flex-col gap-2">
          <label className="mono-label text-[10px] text-muted-foreground">HTML INPUT</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'<h1>Heading</h1>\n\n<p>Paragraph with <strong>bold</strong> text.</p>'}
            className="flex-1 min-h-[300px] bg-muted/30 border border-border rounded-lg p-3 font-mono text-sm resize-none focus:border-brand-accent outline-none"
          />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label className="mono-label text-[10px] text-muted-foreground">MARKDOWN OUTPUT</label>
          <textarea
            value={output}
            readOnly
            placeholder="Markdown result will appear here..."
            className="flex-1 min-h-[300px] bg-muted/30 border border-border rounded-lg p-3 font-mono text-sm resize-none"
          />
        </div>
      </div>
    </ToolLayout>
  );
}
