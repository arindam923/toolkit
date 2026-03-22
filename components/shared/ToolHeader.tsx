import React from "react";

interface ToolHeaderProps {
  title: string;
  description: string;
  icon: string;
}

export default function ToolHeader({ title, description, icon }: ToolHeaderProps) {
  return (
    <section
      className="relative overflow-hidden px-6 sm:px-10 py-8 sm:py-11 rounded-[14px] mb-2.5"
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      <div
        className="absolute top-0 right-0 w-[200px] sm:w-[300px] h-full pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, transparent 40%, rgba(255,92,53,0.06) 100%)",
        }}
      />

      <div className="relative">
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[20px] text-[11px] font-medium mb-4"
          style={{
            background: "rgba(255,92,53,0.1)",
            color: "#FF5C35",
            letterSpacing: "0.3px",
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF5C35] animate-pulse" />
          Browser-based processing
        </div>

        <h1
          className="font-['Syne'] font-extrabold text-[26px] sm:text-[36px] leading-tight tracking-[-1px] mb-3"
          style={{ color: "var(--color-text-primary)" }}
        >
          {icon} {title}
        </h1>

        <p
          className="text-sm leading-relaxed max-w-[440px] mb-6"
          style={{
            color: "var(--color-text-secondary)",
          }}
        >
          {description}
        </p>
      </div>
    </section>
  );
}