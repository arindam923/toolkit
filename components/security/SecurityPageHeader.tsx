import { SECURITY_PAGE_STATS } from "@/data/security";

export default function SecurityPageHeader() {
  return (
    <section className="relative overflow-hidden px-8 py-16 rounded-[24px] mb-8 border border-border bg-muted/10">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-grid opacity-50" />
      
      {/* Brand Accent Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-accent/10 border border-brand-accent/20 rounded-full mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
          <span className="mono-label text-brand-accent text-[9px] font-bold">
            Security & Privacy Infrastructure
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter leading-[0.85] uppercase mb-8">
          ENCRYPT.
          <br />
          <span className="text-muted-foreground/30">PROTECT.</span>
          <br />
          <span className="text-brand-accent">ANONYMIZE.</span>
        </h1>

        {/* Subheading */}
        <p className="text-muted-foreground max-w-lg text-sm uppercase tracking-widest leading-relaxed mb-12">
          High-precision cryptographic utilities for the modern web. 
          Everything stays in your browser. No data ever leaves your system.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap gap-12 pt-8 border-t border-border/50">
          {SECURITY_PAGE_STATS.map((stat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-3xl font-display font-bold tracking-tighter text-foreground">
                {stat.num}
              </div>
              <div className="mono-label text-muted-foreground text-[9px]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
