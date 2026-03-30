import Link from "next/link";
import { Search } from "lucide-react";

export default function SecurityNavbar() {
  return (
    <nav className="flex items-center justify-between mb-12 px-8 py-4 rounded-[24px] border border-border bg-background/50 backdrop-blur-xl shadow-2xl shadow-brand-accent/5 sticky top-5 z-50">
      {/* Logo */}
      <Link href="/">
        <div className="font-display font-black text-2xl tracking-tighter text-brand-accent uppercase group flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center text-background group-hover:scale-110 transition-transform">
            <Search className="w-4 h-4" />
          </div>
          <div>
            Tool<span className="text-foreground">Kit.</span>
            <div className="h-0.5 w-0 group-hover:w-full bg-brand-accent transition-all duration-300" />
          </div>
        </div>
      </Link>

      {/* Search */}
      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <div className="flex items-center bg-muted/20 border border-border/50 px-4 py-2 rounded-full group-focus-within:border-brand-accent/50 group-focus-within:bg-background transition-all">
            <Search className="w-4 h-4 mr-3 text-muted-foreground group-focus-within:text-brand-accent transition-colors" />
            <input
              type="text"
              placeholder="SEARCH PROTECTED MODULES..."
              className="bg-transparent border-none outline-none font-mono text-[9px] uppercase tracking-[0.2em] w-48 text-foreground placeholder:text-muted-foreground/30 focus:placeholder:text-muted-foreground/10"
            />
          </div>
        </div>
        
        <div className="w-px h-6 bg-border mx-2" />
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="mono-label text-[8px] text-muted-foreground">AUTH_STATUS</span>
            <span className="mono-label text-[10px] font-bold text-emerald-500">ENCRYPTED</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>
      </div>
    </nav>
  );
}
