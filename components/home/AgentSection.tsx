import { Cpu } from "lucide-react";

export function AgentSection() {
  return (
    <section className="border-b border-border bg-transparent overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-8 md:px-16 py-24 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-2 py-1 border border-brand-accent/30 bg-brand-accent/5 rounded">
              <Cpu className="w-4 h-4 text-brand-accent" />
              <span className="mono-label text-brand-accent">Protocol v2.1.0</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter leading-none">
              BUILT FOR AGENTS.
              <br />
              <span className="text-muted-foreground/40">READY FOR MCP.</span>
            </h2>
            <p className="text-muted-foreground text-sm uppercase tracking-widest leading-relaxed max-w-md">
              Toolkit is more than a UI. Every utility is exposed via Model
              Context Protocol (MCP), allowing AI agents to execute complex file
              operations with zero latency.
            </p>
            <div className="flex gap-4">
<button type="button" className="mono-label px-6 py-3 bg-foreground text-background font-bold hover:bg-brand-accent transition-colors">
								View MCP Docs
							</button>
							<button type="button" className="mono-label px-6 py-3 border border-border hover:border-foreground transition-colors">
								API Reference
							</button>
            </div>
          </div>
          <div className="relative">
            <div className="bg-background border border-border p-6 font-mono text-[11px] leading-relaxed shadow-2xl overflow-x-auto">
              <div className="flex items-center justify-between mb-4 border-b border-border pb-2 min-w-[240px]">
                <span className="text-muted-foreground">mcp_request.json</span>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-border" />
                  <div className="w-2 h-2 rounded-full bg-border" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-emerald-500">{"{"}</div>
                <div className="pl-4">
                  <span className="text-brand-accent">"method"</span>:{" "}
                  <span className="text-blue-400">"tools/call"</span>,
                </div>
                <div className="pl-4">
                  <span className="text-brand-accent">"params"</span>: {"{"}
                </div>
                <div className="pl-8">
                  <span className="text-brand-accent">"name"</span>:{" "}
                  <span className="text-blue-400">"pdf_sign"</span>,
                </div>
                <div className="pl-8">
                  <span className="text-brand-accent">"arguments"</span>: {"{"}
                </div>
                <div className="pl-12">
                  <span className="text-brand-accent">"file_id"</span>:{" "}
                  <span className="text-blue-400">"uuid_7721_x"</span>,
                </div>
                <div className="pl-12">
                  <span className="text-brand-accent">"signature"</span>:{" "}
                  <span className="text-blue-400">"digital_key_0x1"</span>
                </div>
                <div className="pl-8">{"}"}</div>
                <div className="pl-4">{"}"}</div>
                <div className="text-emerald-500">{"}"}</div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-accent/10 blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
