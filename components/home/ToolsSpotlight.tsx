import { imageTools, pdfTools, badges, BadgeKey } from "@/data/home";
import { SpotlightTool } from "@/data/home";

function ToolList({ tools }: { tools: SpotlightTool[] }) {
  return (
    <div className="flex flex-col gap-2">
      {tools.map((tool, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-2.5 rounded-[10px] cursor-pointer transition-all"
          style={{
            background: "var(--color-background-secondary)",
            border: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          <span className="text-lg min-w-7">{tool.icon}</span>
          <div className="flex-1">
            <div
              className="text-[13px] font-medium"
              style={{ color: "var(--color-text-primary)" }}
            >
              {tool.name}
            </div>
            <div
              className="text-[11px] mt-0.25"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {tool.desc}
            </div>
          </div>
          <span
            className="text-[10px] px-2 py-0.5 rounded-[20px] font-medium"
            style={badges[tool.badge as BadgeKey]}
          >
            {tool.badge}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ToolsSpotlight() {
  return (
    <section className="mb-3">
      <div className="mb-3">
        <h2
          className="font-['Syne'] text-xs font-bold tracking-[2px] uppercase mb-0.5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Tools Spotlight
        </h2>
        <p
          className="text-sm font-medium"
          style={{ color: "var(--color-text-primary)" }}
        >
          Popular tools and what they do
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Image Suite */}
        <div
          className="p-4 sm:p-6 rounded-[14px]"
          style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          <h3
            className="font-['Syne'] text-base font-bold mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            🖼️ Image Suite
          </h3>
          <ToolList tools={imageTools} />
        </div>

        {/* PDF Toolkit */}
        <div
          className="p-4 sm:p-6 rounded-[14px]"
          style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          <h3
            className="font-['Syne'] text-base font-bold mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            📄 PDF Toolkit
          </h3>
          <ToolList tools={pdfTools} />
        </div>
      </div>
    </section>
  );
}
