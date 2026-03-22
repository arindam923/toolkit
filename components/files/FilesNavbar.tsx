"use client";

import Link from "next/link";

interface FilesNavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function FilesNavbar({
  searchQuery,
  onSearchChange,
}: FilesNavbarProps) {
  return (
    <nav
      className="flex items-center justify-between mb-2.5 px-4 sm:px-6 py-3.5 rounded-[14px] border"
      style={{
        background: "var(--color-background-primary)",
        borderColor: "var(--color-border-tertiary)",
      }}
    >
      {/* Logo */}
      <Link href="/">
        <div
          className="font-['Syne'] font-extrabold text-xl text-[#FF5C35]"
          style={{ letterSpacing: "-0.5px" }}
        >
          Tool
          <span style={{ color: "var(--color-text-primary)" }}>Kit</span>
        </div>
      </Link>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <div
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs"
            style={{
              background: "var(--color-background-secondary)",
              border: "0.5px solid var(--color-border-tertiary)",
              color: "var(--color-text-secondary)",
            }}
          >
            <div
              className="w-3 h-3 border-1.5 rounded-full relative"
              style={{ borderColor: "var(--color-text-secondary)" }}
            >
              <div
                className="absolute bottom-[-3px] right-[-3px] w-1 h-0.5 rounded-sm rotate-45"
                style={{ background: "var(--color-text-secondary)" }}
              />
            </div>
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-32 sm:w-40"
              style={{ color: "var(--color-text-primary)" }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
