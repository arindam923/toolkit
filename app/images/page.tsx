"use client";

import { useState } from "react";

const imageTools = [
  {
    icon: "📐",
    name: "Bulk Image Resizer",
    desc: "Resize multiple images by px, %, or preset (social, print)",
    badge: "Free",
    path: "/images/resizer",
  },
  {
    icon: "🗜️",
    name: "Smart Compressor",
    desc: "Lossy/lossless compress with live quality preview",
    badge: "Free",
    path: "/images/compressor",
  },
  {
    icon: "✨",
    name: "BG Remover (AI)",
    desc: "One-click background removal with edge refinement",
    badge: "New",
    path: "/images/remover",
  },
  {
    icon: "🎨",
    name: "Color Palette Extractor",
    desc: "Extract dominant colors as HEX / CSS variables",
    badge: "Free",
    path: "/images/extractor",
  },
  {
    icon: "💧",
    name: "Watermark Tool",
    desc: "Add text/image watermarks with opacity & position control",
    badge: "Pro",
    path: "/images/watermark",
  },
  {
    icon: "🔄",
    name: "Image Converter",
    desc: "Convert between JPG, PNG, WEBP, AVIF, and more formats",
    badge: "Free",
    path: "/images/converter",
  },
  {
    icon: "✂️",
    name: "Image Cropper",
    desc: "Crop images with aspect ratio presets",
    badge: "Free",
    path: "/images/cropper",
  },
  {
    icon: "🔄",
    name: "Image Rotator",
    desc: "Rotate and flip images",
    badge: "Free",
    path: "/images/rotator",
  },
  {
    icon: "📊",
    name: "Image Metadata Editor",
    desc: "View and edit EXIF, IPTC, and GPS data",
    badge: "Pro",
    path: "/images/metadata",
  },
  {
    icon: "🌈",
    name: "Image Filter Editor",
    desc: "Apply filters and adjust brightness, contrast, saturation",
    badge: "Pro",
    path: "/images/filter",
  },
  {
    icon: "🔍",
    name: "Image Upscaler",
    desc: "AI-powered image upscaling",
    badge: "Pro",
    path: "/images/upscaler",
  },
  {
    icon: "🎭",
    name: "Image Effects",
    desc: "Add effects like blur, sharpen, and vignette",
    badge: "Pro",
    path: "/images/effects",
  },
];

const badges: Record<string, { bg: string; color: string }> = {
  Free: { bg: "rgba(0,200,150,0.12)", color: "#00A87A" },
  Pro: { bg: "rgba(124,92,255,0.12)", color: "#7C5CFF" },
  New: { bg: "rgba(255,92,53,0.12)", color: "#FF5C35" },
};

export default function ImageToolsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = imageTools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="max-w-215 mx-auto px-2 lg:px-0 pt-5 pb-12">
        {/* Navigation */}
        <nav
          className="flex items-center justify-between mb-2.5 px-4 sm:px-6 py-3.5 rounded-[14px] border"
          style={{
            background: "var(--color-background-primary)",
            borderColor: "var(--color-border-tertiary)",
          }}
        >
          <div
            className="font-['Syne'] font-extrabold text-xl text-[#FF5C35]"
            style={{ letterSpacing: "-0.5px" }}
          >
            Tool
            <span style={{ color: "var(--color-text-primary)" }}>
              Kit
            </span>
          </div>
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
                  style={{
                    borderColor: "var(--color-text-secondary)",
                  }}
                >
                  <div
                    className="absolute bottom-[-3px] right-[-3px] w-1 h-0.5 rounded-sm rotate-45"
                    style={{
                      background: "var(--color-text-secondary)",
                    }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs w-32 sm:w-40"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>
            </div>
          </div>
        </nav>

        {/* Page Header */}
        <section
          className="relative overflow-hidden px-6 sm:px-10 py-8 sm:py-11 rounded-[14px] mb-2.5"
          style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-[200px] sm:w-[300px] h-full pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, transparent 40%, rgba(255,92,53,0.06) 100%)",
            }}
          />

          <div className="relative">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[20px] text-[11px] font-medium mb-4"
              style={{
                background: "rgba(255,92,53,0.1)",
                color: "#FF5C35",
                letterSpacing: "0.3px",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF5C35] animate-pulse" />
              Image Processing Tools
            </div>

            <h1
              className="font-['Syne'] font-extrabold text-[26px] sm:text-[36px] leading-tight tracking-[-1px] mb-3"
              style={{ color: "var(--color-text-primary)" }}
            >
              All Image Tools
              <br />
              <em
                style={{
                  color: "#FF5C35",
                  fontStyle: "normal",
                }}
              >
                in one place.
              </em>
            </h1>

            <p
              className="text-sm leading-relaxed max-w-[440px] mb-6"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              Resize, compress, convert, crop, remove backgrounds, and enhance images with our comprehensive image processing tools.
            </p>

            <div
              className="flex gap-7 mt-7 pt-6"
              style={{
                borderTop: "0.5px solid var(--color-border-tertiary)",
              }}
            >
              <div>
                <div
                  className="font-['Syne'] text-xl font-bold"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  {imageTools.length}
                </div>
                <div
                  className="text-[11px] mt-0.5"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Tools available
                </div>
              </div>
              <div>
                <div
                  className="font-['Syne'] text-xl font-bold"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  100%
                </div>
                <div
                  className="text-[11px] mt-0.5"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Browser-based
                </div>
              </div>
              <div>
                <div
                  className="font-['Syne'] text-xl font-bold"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  0 MB
                </div>
                <div
                  className="text-[11px] mt-0.5"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Server uploads*
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Image Tools Grid */}
        <section className="mb-3">
          <div className="mb-3">
            <h2
              className="font-['Syne'] text-xs font-bold tracking-[2px] uppercase mb-0.5"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              Image Tools
            </h2>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--color-text-primary)" }}
            >
              {filteredTools.length} tools available
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredTools.map((tool, i) => (
              <a
                key={i}
                href={tool.path}
                className="p-5 rounded-[14px] cursor-pointer transition-all hover:-translate-y-0.5 block relative text-decoration-none"
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  color: "inherit",
                }}
              >
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl mb-2.5"
                  style={{ background: "rgba(255,92,53,0.1)" }}
                >
                  {tool.icon}
                </div>
                <h3
                  className="font-['Syne'] text-sm font-bold mb-1.5"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  {tool.name}
                </h3>
                <p
                  className="text-[11.5px] leading-relaxed mb-2.5"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {tool.desc}
                </p>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-[20px] font-medium"
                  style={badges[tool.badge]}
                >
                  {tool.badge}
                </span>
                <div
                  className="absolute bottom-3.5 right-3.5 text-[14px] opacity-0 translate-x-[-4px] transition-all"
                  style={{ color: "#FF5C35" }}
                >
                  →
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer
          className="mt-8 px-6 py-8 rounded-[14px]"
          style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="font-['Syne'] font-extrabold text-lg text-[#FF5C35]">
                Tool
                <span
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  Kit
                </span>
              </div>
              <div
                className="flex gap-4 text-xs"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                <a
                  href="#"
                  className="hover:text-[#FF5C35] transition-colors"
                >
                  Privacy
                </a>
                <a
                  href="#"
                  className="hover:text-[#FF5C35] transition-colors"
                >
                  Terms
                </a>
                <a
                  href="#"
                  className="hover:text-[#FF5C35] transition-colors"
                >
                  Contact
                </a>
              </div>
            </div>
            <div
              className="flex items-center gap-4 text-xs"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              <span>Made with ❤️ in India</span>
              <span>•</span>
              <span>© 2026 ToolKit</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}