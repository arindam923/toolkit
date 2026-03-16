"use client";

import { useEffect, useState } from "react";
import { HERO_STATS } from "@/data/home";

export default function HeroSection() {
  const [gridDots, setGridDots] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const dots = [];
    for (let i = 0; i < 64; i++) {
      dots.push(
        <div
          key={i}
          className="w-[3px] h-[3px] rounded-full"
          style={{ background: "#7C5CFF", opacity: 0.06 }}
        />,
      );
    }
    setGridDots(dots);
  }, []);

  return (
    <section
      className="relative overflow-hidden px-6 sm:px-10 py-8 sm:py-11 rounded-[14px] mb-2.5"
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      {/* Gradient overlay */}
      <div
        className="absolute top-0 right-0 w-[200px] sm:w-[300px] h-full pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, transparent 40%, rgba(124,92,255,0.06) 100%)",
        }}
      />

      {/* Dot grid */}
      <div
        className="absolute right-[20px] sm:right-[30px] top-4 sm:top-5 grid grid-cols-6 sm:grid-cols-8 gap-1 sm:gap-2"
        style={{ opacity: 0.06 }}
      >
        {gridDots}
      </div>

      <div className="relative">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[20px] text-[11px] font-medium mb-4"
          style={{
            background: "rgba(255,92,53,0.1)",
            color: "#FF5C35",
            letterSpacing: "0.3px",
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF5C35] animate-pulse" />
          100% Free to Start — No signup needed
        </div>

        {/* Headline */}
        <h1
          className="font-['Syne'] font-extrabold text-[26px] sm:text-[36px] leading-tight tracking-[-1px] mb-3"
          style={{ color: "var(--color-text-primary)" }}
        >
          Every tool you need,
          <br />
          <em style={{ color: "#FF5C35", fontStyle: "normal" }}>in one place.</em>
        </h1>

        {/* Subheading */}
        <p
          className="text-sm leading-relaxed max-w-[440px] mb-6"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Compress, convert, resize, remove backgrounds, merge PDFs, extract
          text — all your daily file tasks done fast, in your browser. No
          uploads to shady servers.
        </p>

        {/* CTAs */}
        <div className="flex gap-2.5 flex-wrap">
          <button
            type="button"
            className="px-5.5 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-opacity"
            style={{ background: "#FF5C35", color: "#fff" }}
          >
            Explore Tools
          </button>
          <button
            type="button"
            className="px-5.5 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-colors border"
            style={{
              background: "transparent",
              color: "var(--color-text-primary)",
              borderColor: "var(--color-border-tertiary)",
            }}
          >
            How it works →
          </button>
        </div>

        {/* Stats */}
        <div
          className="flex gap-7 mt-7 pt-6"
          style={{ borderTop: "0.5px solid var(--color-border-tertiary)" }}
        >
          {HERO_STATS.map((stat, idx) => (
            <div key={`stat-${idx}`}>
              <div
                className="font-['Syne'] text-xl font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {stat.num}
              </div>
              <div
                className="text-[11px] mt-0.5"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
