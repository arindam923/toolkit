export default function Footer() {
  return (
    <footer
      className="mt-8 px-6 py-8 rounded-[14px]"
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="font-['Syne'] font-extrabold text-lg text-[#FF5C35]">
            Tool
            <span style={{ color: "var(--color-text-primary)" }}>Kit</span>
          </div>

          {/* Tagline */}
          <div
            className="flex gap-4 text-xs uppercase tracking-widest"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <span>Browser-based</span>
            <span>•</span>
            <span>Privacy-first</span>
            <span>•</span>
            <span>MCP — in development</span>
          </div>
        </div>

        {/* Copyright */}
        <div
          className="flex items-center gap-4 text-xs"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <span>Made with ❤️ in India</span>
          <span>•</span>
          <span>© 2026 ToolKit</span>
        </div>
      </div>
    </footer>
  );
}
