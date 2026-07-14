"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/shared/ToolLayout";
import { FileText } from "lucide-react";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
}

export default function TextDiffTool() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");

  const diff = useMemo<DiffLine[]>(() => {
    if (!text1 && !text2) return [];
    const lines1 = text1.split("\n");
    const lines2 = text2.split("\n");
    const result: DiffLine[] = [];
    const maxLen = Math.max(lines1.length, lines2.length);

    for (let i = 0; i < maxLen; i++) {
      const line1 = lines1[i];
      const line2 = lines2[i];

      if (line1 === undefined) {
        result.push({ type: "added", content: line2 });
      } else if (line2 === undefined) {
        result.push({ type: "removed", content: line1 });
      } else if (line1 === line2) {
        result.push({ type: "unchanged", content: line1 });
      } else {
        result.push({ type: "removed", content: line1 });
        result.push({ type: "added", content: line2 });
      }
    }
    return result;
  }, [text1, text2]);

  return (
    <ToolLayout
      title="Text Diff"
      description="Compare two texts and highlight differences line by line."
      icon={<FileText className="w-4 h-4" />}
      category="Text"
      id="text-diff"
      parameters={<></>}
      actions={<></>}
    >
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
        <div className="flex-1 flex flex-col gap-2">
          <label className="mono-label text-[10px] text-muted-foreground">ORIGINAL TEXT</label>
          <textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="Paste original text here..."
            className="flex-1 min-h-[300px] bg-muted/30 border border-border rounded-lg p-3 font-mono text-sm resize-none focus:border-brand-accent outline-none"
          />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label className="mono-label text-[10px] text-muted-foreground">MODIFIED TEXT</label>
          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="Paste modified text here..."
            className="flex-1 min-h-[300px] bg-muted/30 border border-border rounded-lg p-3 font-mono text-sm resize-none focus:border-brand-accent outline-none"
          />
        </div>
      </div>
      {diff.length > 0 && (
        <div className="border-t border-border p-4">
          <label className="mono-label text-[10px] text-muted-foreground mb-2 block">DIFF RESULT</label>
          <div className="bg-muted/30 border border-border rounded-lg p-3 font-mono text-sm max-h-[300px] overflow-y-auto">
            {diff.map((line, i) => (
              <div
                key={i}
                className={`py-0.5 ${
                  line.type === "added"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : line.type === "removed"
                    ? "bg-red-500/10 text-red-500"
                    : ""
                }`}
              >
                <span className="text-muted-foreground/50 mr-2">
                  {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                </span>
                {line.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
