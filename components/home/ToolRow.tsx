import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import type { Tool } from "@/data/files";

interface ToolRowProps {
  tool: Tool;
  onClick: (tool: Tool) => void;
}

export function ToolRow({ tool, onClick }: ToolRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => onClick(tool)}
      className="data-row group flex items-center px-6 py-4 cursor-pointer border-b border-border hover:bg-muted/10"
    >
      <div className="w-10 flex-shrink-0">
        <div className="w-8 h-8 rounded border border-border flex items-center justify-center bg-muted group-hover:bg-foreground group-hover:text-background transition-colors">
          {tool.icon}
        </div>
      </div>
      <div className="flex-1 min-w-0 px-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{tool.name}</span>
          {tool.isPaid && (
            <span className="mono-label bg-brand-accent/10 text-brand-accent px-1.5 py-0.5 rounded leading-none">
              Pro
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {tool.description}
        </p>
      </div>
      <div className="hidden md:block w-32 px-4">
        <span className="mono-label">{tool.category}</span>
      </div>
      <div className="hidden lg:block w-32 px-4">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              tool.status === "Stable"
                ? "bg-emerald-500"
                : tool.status === "Beta"
                  ? "bg-amber-500"
                  : "bg-muted"
            }`}
          />
          <span className="mono-label">{tool.status}</span>
        </div>
      </div>
      <div className="w-10 flex justify-end">
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
      </div>
    </motion.div>
  );
}
