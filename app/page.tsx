"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Sun,
  Moon,
  Cpu,
  Grid,
  Command,
} from "lucide-react";
import { TOOLS, CATEGORIES, type Category } from "@/data/files";
import { AgentSection } from "@/components/home/AgentSection";
import { ToolRow } from "@/components/home/ToolRow";
import { useTheme } from "@/hooks/useTheme";

export default function App() {
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useTheme();
  const isDarkMode = theme === "dark";
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const registryRef = useRef<HTMLDivElement>(null);
  const agentRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "All" || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen font-sans selection:bg-brand-accent selection:text-white">
      <div className="fixed left-0 bottom-0 w-full h-16 border-t md:bottom-auto md:top-0 md:h-full md:w-16 md:border-t-0 md:border-r border-border bg-background z-50 flex flex-row md:flex-col items-center justify-around md:justify-start py-0 md:py-8 gap-0 md:gap-8">
        <button
          type="button"
          onClick={() => scrollTo(heroRef)}
          className="hidden md:flex w-10 h-10 bg-foreground text-background items-center justify-center font-bold text-xl cursor-pointer hover:bg-brand-accent transition-colors"
        >
          T
        </button>
        <div className="flex flex-row md:flex-col gap-8 md:gap-6 text-muted-foreground">
          <button
            type="button"
            onClick={() => scrollTo(heroRef)}
            className="cursor-pointer hover:text-foreground transition-colors"
          >
            <Command className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollTo(registryRef)}
            className="cursor-pointer hover:text-foreground transition-colors"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollTo(agentRef)}
            className="cursor-pointer hover:text-foreground transition-colors"
          >
            <Cpu className="w-5 h-5" />
          </button>
        </div>
        <div className="md:mt-auto flex flex-row md:flex-col gap-8 md:gap-6 items-center">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            {!mounted ? <Sun className="w-5 h-5" /> : isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <main className="pb-16 md:pb-0 md:pl-16">
        <section
          ref={heroRef}
          className="grid grid-cols-1 lg:grid-cols-2 min-h-[60vh] border-b border-border"
        >
          <div className="p-8 md:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-border bg-transparent">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="mono-label text-brand-accent font-bold">
                Toolkit v1.0.4
              </div>
              <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter leading-[0.9]">
                TOOLS FOR
                <br />
                <span className="text-muted-foreground/30">EVERY</span>
                <br />
                WORKFLOW.
              </h1>
              <p className="text-muted-foreground max-w-sm text-sm uppercase tracking-wider leading-relaxed">
                A technical suite of essential utilities for PDF, Image, and
                Document processing. Built for precision.
              </p>
            </motion.div>
          </div>
          <div className="p-8 md:p-16 bg-grid flex flex-col justify-end relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <div className="mono-label text-right">
                System Status: <span className="text-emerald-500">Operational</span>
                <br />
                Uptime: 99.99%
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-brand-accent/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative flex items-center bg-background border-2 border-foreground p-4">
                  <Search className="w-5 h-5 mr-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="EXECUTE SEARCH..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-mono uppercase outline-none placeholder:text-muted-foreground/30"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <kbd className="hidden sm:block font-mono text-[10px] border border-border px-2 py-1">
                    CMD+K
                  </kbd>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`mono-label px-3 py-1 border transition-colors ${
                      activeCategory === cat
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background border-border hover:border-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <div ref={agentRef}>
          <AgentSection />
        </div>

        <section ref={registryRef} className="bg-transparent min-h-screen">
          <div className="border-b border-border px-6 py-3 flex items-center text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            <div className="w-10">Icon</div>
            <div className="flex-1 px-4">Tool Name & Description</div>
            <div className="hidden md:block w-32 px-4">Category</div>
            <div className="hidden lg:block w-32 px-4">Status</div>
            <div className="w-10 text-right">Action</div>
          </div>

          <div className="flex flex-col">
            <AnimatePresence mode="popLayout">
              {filteredTools.map((tool) => (
                <ToolRow
                  key={tool.id}
                  tool={tool}
                  onClick={(t) => router.push(t.href)}
                />
              ))}
            </AnimatePresence>
          </div>

          {filteredTools.length === 0 && (
            <div className="p-20 text-center">
              <div className="mono-label text-lg">No matches found in database.</div>
            </div>
          )}
        </section>

        <footer className="border-t border-border p-8 md:p-16 bg-transparent grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="font-bold text-xl tracking-tighter">TOOLKIT.</div>
            <p className="text-xs text-muted-foreground leading-relaxed uppercase tracking-widest">
              A high-precision utility suite for the modern web. Built with
              performance and privacy as core primitives.
            </p>
          </div>
          <div className="space-y-4">
            <div className="mono-label">Navigation</div>
            <ul className="text-xs space-y-2 uppercase tracking-widest">
              <li>
                <a href="/directory" className="hover:text-brand-accent">
                  Directory
                </a>
              </li>
              <li>
                <a href="/docs" className="hover:text-brand-accent">
                  Documentation
                </a>
              </li>
              <li>
                <a href="/api" className="hover:text-brand-accent">
                  API Access
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <div className="mono-label">Legal</div>
            <ul className="text-xs space-y-2 uppercase tracking-widest">
              <li>
                <a href="/privacy" className="hover:text-brand-accent">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-brand-accent">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/security" className="hover:text-brand-accent">
                  Security
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <div className="mono-label">Connect</div>
            <div className="flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 border border-border flex items-center justify-center hover:border-foreground cursor-pointer transition-colors"
              >
                GH
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 border border-border flex items-center justify-center hover:border-foreground cursor-pointer transition-colors"
              >
                TW
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 border border-border flex items-center justify-center hover:border-foreground cursor-pointer transition-colors"
              >
                DC
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
