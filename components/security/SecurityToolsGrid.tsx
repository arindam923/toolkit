import { badges, BadgeKey, SecurityTool } from "@/data/security";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SecurityToolsGridProps {
  tools: SecurityTool[];
}

export default function SecurityToolsGrid({ tools }: SecurityToolsGridProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="mono-label text-foreground font-bold italic tracking-tight text-sm">
          SECURITY_MODULE_REGISTRY
        </h2>
        <div className="mono-label text-muted-foreground text-[9px]">
          {tools.length} MODULES_ONLINE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.path}
            href={tool.path}
            className="group relative p-6 rounded-2xl border border-border bg-background hover:border-brand-accent/30 hover:bg-muted/5 transition-all duration-300 overflow-hidden"
          >
            {/* Status Indicator */}
            <div className="absolute top-6 right-6">
              <span 
                className="mono-label text-[8px] px-2 py-0.5 rounded-full border border-current"
                style={{ 
                  color: badges[tool.badge as BadgeKey].color,
                  backgroundColor: `${badges[tool.badge as BadgeKey].color}10`
                }}
              >
                {tool.badge}
              </span>
            </div>

            <div className="flex gap-6">
              <div className="w-14 h-14 rounded-xl bg-muted border border-border flex items-center justify-center text-3xl group-hover:bg-brand-accent group-hover:text-white transition-colors duration-500">
                {tool.icon}
              </div>

              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-display font-medium tracking-tight text-foreground">
                  {tool.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed uppercase tracking-widest leading-relaxed line-clamp-2">
                  {tool.desc}
                </p>
                <div className="pt-2 flex items-center gap-2 text-brand-accent opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <span className="mono-label text-[9px] font-bold">INITIALIZE MODULE</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Decorative background number */}
            <div className="absolute -bottom-4 -right-2 text-8xl font-display font-black text-foreground/[0.02] select-none pointer-events-none group-hover:text-brand-accent/[0.05] transition-colors">
              {tool.name.charAt(0)}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
