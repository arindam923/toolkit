import React from "react";

interface PreviewProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export default function Preview({
  children,
  title = "Real-time Preview",
  className = "",
}: PreviewProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>
        {title}
      </h3>
      <div className="border rounded-lg overflow-hidden" style={{ borderColor: "var(--color-border-tertiary)" }}>
        {children}
      </div>
    </div>
  );
}