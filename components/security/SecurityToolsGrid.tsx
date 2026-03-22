import { badges, BadgeKey, SecurityTool } from "@/data/security";

interface SecurityToolsGridProps {
  tools: SecurityTool[];
}

export default function SecurityToolsGrid({ tools }: SecurityToolsGridProps) {
  return (
    <section className="mb-3">
      <div className="mb-3">
        <h2
          className="font-['Syne'] text-xs font-bold tracking-[2px] uppercase mb-0.5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Security Tools
        </h2>
        <p
          className="text-sm font-medium"
          style={{ color: "var(--color-text-primary)" }}
        >
          {tools.length} tools available
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {tools.map((tool, i) => (
          <a
            key={i}
            href={tool.path}
            className="p-5 rounded-[14px] cursor-pointer transition-all hover:-translate-y-0.5 block relative"
            style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl mb-2.5"
              style={{ background: "rgba(52,152,219,0.1)" }}
            >
              {tool.icon}
            </div>

            <h3
              className="font-['Syne'] text-sm font-bold mb-1.5"
              style={{ color: "var(--color-text-primary)" }}
            >
              {tool.name}
            </h3>

            <p
              className="text-[11.5px] leading-relaxed mb-2.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {tool.desc}
            </p>

            <span
              className="text-[10px] px-2 py-0.5 rounded-[20px] font-medium"
              style={badges[tool.badge as BadgeKey]}
            >
              {tool.badge}
            </span>

            {/* Arrow */}
            <div
              className="absolute bottom-3.5 right-3.5 text-[14px] opacity-0 translate-x-[-4px] transition-all"
              style={{ color: "#3498DB" }}
            >
              →
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
