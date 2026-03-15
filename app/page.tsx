"use client";

import { useEffect, useState } from "react";

const categories = [
  {
    name: "Image Tools",
    count: 12,
    icon: "🖼️",
    iconBg: "rgba(255,92,53,0.1)",
    description:
      "Resize, compress, convert, crop, rotate, flip, watermark & enhance images.",
    tools: [
      "Resizer",
      "Compressor",
      "Converter",
      "Cropper",
      "BG Remover",
      "+7",
    ],
  },
  {
    name: "PDF Toolkit",
    count: 10,
    icon: "📄",
    iconBg: "rgba(124,92,255,0.1)",
    description:
      "Merge, split, compress, convert, lock, unlock, OCR & annotate PDFs.",
    tools: [
      "Merge",
      "Split",
      "Compress",
      "Word↔PDF",
      "OCR",
      "+5",
    ],
  },
  {
    name: "File Converter",
    count: 8,
    icon: "🔄",
    iconBg: "rgba(0,200,150,0.1)",
    description:
      "Change file formats instantly — images, docs, video, audio & archives.",
    tools: [
      "JPG→PNG",
      "HEIC→JPG",
      "DOCX→PDF",
      "MP4→GIF",
      "+4",
    ],
  },
  {
    name: "Video & GIF",
    count: 6,
    icon: "✂️",
    iconBg: "rgba(255,185,0,0.1)",
    description:
      "Trim video, extract frames, make GIFs, generate thumbnails & compress.",
    tools: [
      "Trimmer",
      "GIF Maker",
      "Compressor",
      "Thumbnail",
      "+2",
    ],
  },
  {
    name: "Security & Privacy",
    count: 5,
    icon: "🔐",
    iconBg: "rgba(52,152,219,0.1)",
    description:
      "Encrypt files, redact sensitive info, generate strong passwords & hashes.",
    tools: [
      "PDF Lock",
      "Redact",
      "Password Gen",
      "Hash",
      "+1",
    ],
  },
  {
    name: "Text & Data",
    count: 7,
    icon: "📝",
    iconBg: "rgba(255,92,53,0.08)",
    description:
      "Format JSON, minify code, count words, diff text, CSV viewer & converter.",
    tools: [
      "JSON Format",
      "Word Count",
      "CSV→JSON",
      "Text Diff",
      "+3",
    ],
  },
];

const imageTools = [
  {
    icon: "📐",
    name: "Bulk Image Resizer",
    desc: "Resize multiple images by px, %, or preset (social, print)",
    badge: "Free",
  },
  {
    icon: "🗜️",
    name: "Smart Compressor",
    desc: "Lossy/lossless compress with live quality preview",
    badge: "Free",
  },
  {
    icon: "✨",
    name: "BG Remover (AI)",
    desc: "One-click background removal with edge refinement",
    badge: "New",
  },
  {
    icon: "🎨",
    name: "Color Palette Extractor",
    desc: "Extract dominant colors as HEX / CSS variables",
    badge: "Free",
  },
  {
    icon: "💧",
    name: "Watermark Tool",
    desc: "Add text/image watermarks with opacity & position control",
    badge: "Pro",
  },
];

const pdfTools = [
  {
    icon: "📎",
    name: "PDF Merger",
    desc: "Drag-drop PDFs to merge in custom order",
    badge: "Free",
  },
  {
    icon: "✂️",
    name: "PDF Splitter",
    desc: "Extract pages, split by range or every N pages",
    badge: "Free",
  },
  {
    icon: "🔍",
    name: "PDF OCR",
    desc: "Extract searchable text from scanned PDFs",
    badge: "Pro",
  },
  {
    icon: "🔒",
    name: "PDF Lock / Unlock",
    desc: "Password-protect or remove PDF passwords",
    badge: "Free",
  },
  {
    icon: "🔄",
    name: "PDF ↔ Word / Excel",
    desc: "Accurate bidirectional conversions preserving layout",
    badge: "New",
  },
];

const features = [
  {
    icon: "🔒",
    title: "Privacy First",
    desc: "Processing happens in your browser using WebAssembly & Canvas API. Files never leave your device for most tools. Those that need server-side processing auto-delete within 1 hour.",
  },
  {
    icon: "⚡",
    title: "Batch Processing",
    desc: "Upload 50+ files at once. Apply the same settings to all. Download as a single ZIP. Progress bar per file and overall. Works even on slow connections.",
  },
  {
    icon: "👁️",
    title: "Live Preview",
    desc: "Every tool shows a before/after split view as you adjust settings. No surprises on download. Compare original vs output size in real-time.",
  },
  {
    icon: "📱",
    title: "Works Everywhere",
    desc: "Fully responsive — desktop, tablet, mobile. PWA installable. Offline capable for browser-based tools. Share tool URLs directly for quick access.",
  },
  {
    icon: "🤖",
    title: "AI-Powered Tools",
    desc: "Background remover, image upscaler, PDF OCR, and auto-tag generator are powered by on-device ML models (ONNX Runtime) — no cloud API costs for basic tiers.",
  },
  {
    icon: "📋",
    title: "Tool History",
    desc: "Browser-local history of recent conversions. One-click re-process with same settings. Export your workflow as a recipe to share with teammates.",
  },
];

const flowSteps = [
  {
    num: 1,
    title: "Pick a Tool",
    desc: "Search or browse by category. Instant tool discovery.",
  },
  {
    num: 2,
    title: "Drop Your File",
    desc: "Drag & drop or paste. Batch upload supported.",
  },
  {
    num: 3,
    title: "Configure",
    desc: "Adjust settings with live preview. Presets for common use-cases.",
  },
  {
    num: 4,
    title: "Download",
    desc: "Instant download. ZIP for bulk. Auto-delete files after session.",
  },
];

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/ forever",
    desc: "Everything you need daily",
    features: [
      "All core tools",
      "Up to 10 files / batch",
      "25 MB file size limit",
      "Standard processing speed",
      "Watermarked PDF export*",
    ],
    featured: false,
  },
  {
    name: "Pro",
    price: "₹199",
    period: "/ month",
    desc: "For power users",
    features: [
      "All tools + AI features",
      "Unlimited batch size",
      "500 MB file size limit",
      "Priority processing",
      "No watermarks, no ads",
    ],
    featured: true,
  },
  {
    name: "Teams",
    price: "₹999",
    period: "/ month",
    desc: "For small businesses",
    features: [
      "Up to 10 seats",
      "API access (1000 calls/mo)",
      "1 GB file size limit",
      "Workflow automation",
      "Priority support",
    ],
    featured: false,
  },
];

const badges: Record<
  string,
  { bg: string; color: string }
> = {
  Free: { bg: "rgba(0,200,150,0.12)", color: "#00A87A" },
  Pro: { bg: "rgba(124,92,255,0.12)", color: "#7C5CFF" },
  New: { bg: "rgba(255,92,53,0.12)", color: "#FF5C35" },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("All Tools");
  const [gridDots, setGridDots] = useState<
    React.ReactNode[]
  >([]);

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

  const tabs = [
    "All Tools",
    "Images",
    "PDF",
    "Files",
    "Video",
  ];

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
            <span
              style={{ color: "var(--color-text-primary)" }}
            >
              Kit
            </span>
          </div>
          <div className="hidden md:flex gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="px-3 py-1.5 rounded-[20px] text-xs border transition-all cursor-pointer font-['DM_Sans']"
                style={{
                  background:
                    activeTab === tab
                      ? "#FF5C35"
                      : "transparent",
                  color:
                    activeTab === tab
                      ? "#fff"
                      : "var(--color-text-secondary)",
                  borderColor:
                    "var(--color-border-tertiary)",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs"
              style={{
                background:
                  "var(--color-background-secondary)",
                border:
                  "0.5px solid var(--color-border-tertiary)",
                color: "var(--color-text-secondary)",
              }}
            >
              <div
                className="w-3 h-3 border-1.5 rounded-full relative"
                style={{
                  borderColor:
                    "var(--color-text-secondary)",
                }}
              >
                <div
                  className="absolute bottom-[-3px] right-[-3px] w-1 h-0.5 rounded-sm rotate-45"
                  style={{
                    background:
                      "var(--color-text-secondary)",
                  }}
                />
              </div>
              <span>Search tools...</span>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section
          className="relative overflow-hidden px-6 sm:px-10 py-8 sm:py-11 rounded-[14px] mb-2.5"
          style={{
            background: "var(--color-background-primary)",
            border:
              "0.5px solid var(--color-border-tertiary)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-[200px] sm:w-[300px] h-full pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, transparent 40%, rgba(124,92,255,0.06) 100%)",
            }}
          />
          <div
            className="absolute right-[20px] sm:right-[30px] top-4 sm:top-5 grid grid-cols-6 sm:grid-cols-8 gap-1 sm:gap-2"
            style={{ opacity: 0.06 }}
          >
            {gridDots}
          </div>

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
              100% Free to Start — No signup needed
            </div>

            <h1
              className="font-['Syne'] font-extrabold text-[26px] sm:text-[36px] leading-tight tracking-[-1px] mb-3"
              style={{ color: "var(--color-text-primary)" }}
            >
              Every tool you need,
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
              Compress, convert, resize, remove backgrounds,
              merge PDFs, extract text — all your daily file
              tasks done fast, in your browser. No uploads
              to shady servers.
            </p>

            <div className="flex gap-2.5 flex-wrap">
              <button
                type="button"
                className="px-5.5 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-opacity"
                style={{
                  background: "#FF5C35",
                  color: "#fff",
                }}
              >
                Explore Tools
              </button>
              <button
                type="button"
                className="px-5.5 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-colors border"
                style={{
                  background: "transparent",
                  color: "var(--color-text-primary)",
                  borderColor:
                    "var(--color-border-tertiary)",
                }}
              >
                How it works →
              </button>
            </div>

            <div
              className="flex gap-7 mt-7 pt-6"
              style={{
                borderTop:
                  "0.5px solid var(--color-border-tertiary)",
              }}
            >
              {[
                { num: "48+", label: "Tools available" },
                { num: "100%", label: "Browser-based" },
                { num: "0 MB", label: "Server uploads*" },
                { num: "2M+", label: "Files processed" },
              ].map((stat, idx) => (
                <div key={`stat-${idx}`}>
                  <div
                    className="font-['Syne'] text-xl font-bold"
                    style={{
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {stat.num}
                  </div>
                  <div
                    className="text-[11px] mt-0.5"
                    style={{
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-3">
          <div className="mb-3">
            <h2
              className="font-['Syne'] text-xs font-bold tracking-[2px] uppercase mb-0.5"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              Categories
            </h2>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--color-text-primary)" }}
            >
              8 tool categories, 48+ individual tools
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {categories.map((cat, idx) => (
              <div
                key={`cat-${idx}`}
                className="relative p-5 rounded-[14px] cursor-pointer transition-all hover:-translate-y-0.5"
                style={{
                  background:
                    "var(--color-background-primary)",
                  border:
                    "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <div
                  className="absolute top-3.5 right-3.5 text-[10px] font-semibold font-['Syne']"
                  style={{
                    color: "var(--color-text-secondary)",
                    opacity: 0.5,
                  }}
                >
                  {cat.count} tools
                </div>
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl mb-2.5"
                  style={{ background: cat.iconBg }}
                >
                  {cat.icon}
                </div>
                <h3
                  className="font-['Syne'] text-sm font-bold mb-1.5"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  {cat.name}
                </h3>
                <p
                  className="text-[11.5px] leading-relaxed mb-2.5"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {cat.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {cat.tools.map((tool, j) => (
                    <span
                      key={`tool-${j}`}
                      className="text-[10px] px-2 py-0.75 rounded-[20px] font-['DM_Sans']"
                      style={{
                        background:
                          "var(--color-background-secondary)",
                        border:
                          "0.5px solid var(--color-border-tertiary)",
                        color:
                          "var(--color-text-secondary)",
                      }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
                <div
                  className="absolute bottom-3.5 right-3.5 text-[14px] opacity-0 translate-x-[-4px] transition-all"
                  style={{ color: "#FF5C35" }}
                >
                  →
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tools Spotlight */}
        <section className="mb-3">
          <div className="mb-3">
            <h2
              className="font-['Syne'] text-xs font-bold tracking-[2px] uppercase mb-0.5"
              style={{
                color: "var(--color-text-secondary)",
              }}
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
            <div
              className="p-4 sm:p-6 rounded-[14px]"
              style={{
                background:
                  "var(--color-background-primary)",
                border:
                  "0.5px solid var(--color-border-tertiary)",
              }}
            >
              <h3
                className="font-['Syne'] text-base font-bold mb-4"
                style={{
                  color: "var(--color-text-primary)",
                }}
              >
                🖼️ Image Suite
              </h3>
              <div className="flex flex-col gap-2">
                {imageTools.map((tool, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-[10px] cursor-pointer transition-all"
                    style={{
                      background:
                        "var(--color-background-secondary)",
                      border:
                        "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    <span className="text-lg min-w-7">
                      {tool.icon}
                    </span>
                    <div className="flex-1">
                      <div
                        className="text-[13px] font-medium"
                        style={{
                          color:
                            "var(--color-text-primary)",
                        }}
                      >
                        {tool.name}
                      </div>
                      <div
                        className="text-[11px] mt-0.25"
                        style={{
                          color:
                            "var(--color-text-secondary)",
                        }}
                      >
                        {tool.desc}
                      </div>
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-[20px] font-medium"
                      style={badges[tool.badge]}
                    >
                      {tool.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="p-4 sm:p-6 rounded-[14px]"
              style={{
                background:
                  "var(--color-background-primary)",
                border:
                  "0.5px solid var(--color-border-tertiary)",
              }}
            >
              <h3
                className="font-['Syne'] text-base font-bold mb-4"
                style={{
                  color: "var(--color-text-primary)",
                }}
              >
                📄 PDF Toolkit
              </h3>
              <div className="flex flex-col gap-2">
                {pdfTools.map((tool, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-[10px] cursor-pointer transition-all"
                    style={{
                      background:
                        "var(--color-background-secondary)",
                      border:
                        "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    <span className="text-lg min-w-7">
                      {tool.icon}
                    </span>
                    <div className="flex-1">
                      <div
                        className="text-[13px] font-medium"
                        style={{
                          color:
                            "var(--color-text-primary)",
                        }}
                      >
                        {tool.name}
                      </div>
                      <div
                        className="text-[11px] mt-0.25"
                        style={{
                          color:
                            "var(--color-text-secondary)",
                        }}
                      >
                        {tool.desc}
                      </div>
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-[20px] font-medium"
                      style={badges[tool.badge]}
                    >
                      {tool.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* User Flow */}
        <section className="mb-3">
          <div className="mb-3">
            <h2
              className="font-['Syne'] text-xs font-bold tracking-[2px] uppercase mb-0.5"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              User Flow
            </h2>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--color-text-primary)" }}
            >
              How a tool interaction works — 4 simple steps
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {flowSteps.map((step, i) => (
              <div
                key={i}
                className="flex-1 p-4 relative h-30"
                style={{
                  background:
                    "var(--color-background-primary)",
                  border:
                    "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "10px",
                  marginBottom:
                    i < flowSteps.length - 1 ? "8px" : "0",
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold font-['Syne'] mb-2"
                  style={{
                    background: "#FF5C35",
                    color: "#fff",
                  }}
                >
                  {step.num}
                </div>
                <h4
                  className="text-xs font-semibold mb-0.75 font-['Syne']"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  {step.title}
                </h4>
                <p
                  className="text-[11px] leading-relaxed"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-3">
          <div className="mb-3">
            <h2
              className="font-['Syne'] text-xs font-bold tracking-[2px] uppercase mb-0.5"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              Key Features
            </h2>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--color-text-primary)" }}
            >
              What makes this site stand out
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {features.map((feat, i) => (
              <div
                key={i}
                className="p-[18px] rounded-[14px]"
                style={{
                  background:
                    "var(--color-background-primary)",
                  border:
                    "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <h4
                  className="font-['Syne'] text-[13px] font-bold mb-1.5"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  {feat.icon} {feat.title}
                </h4>
                <p
                  className="text-[12px] leading-relaxed"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="mb-3">
          <div className="mb-3">
            <h2
              className="font-['Syne'] text-xs font-bold tracking-[2px] uppercase mb-0.5"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              Monetization
            </h2>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--color-text-primary)" }}
            >
              Freemium pricing model
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {plans.map((plan, i) => (
              <div
                key={i}
                className="p-5 rounded-[14px] text-center"
                style={{
                  background:
                    "var(--color-background-primary)",
                  border: plan.featured
                    ? "1.5px solid #7C5CFF"
                    : "0.5px solid var(--color-border-tertiary)",
                }}
              >
                {plan.featured && (
                  <div
                    className="text-[10px] font-semibold tracking-wide inline-block mb-2 px-2.5 py-0.75 rounded-[20px]"
                    style={{
                      background: "rgba(124,92,255,0.12)",
                      color: "#7C5CFF",
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}
                <div
                  className="font-['Syne'] text-[13px] font-bold mb-1"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  {plan.name}
                </div>
                <div
                  className="font-['Syne'] text-[26px] font-extrabold"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  {plan.price}{" "}
                  <span
                    className="text-[13px] font-normal"
                    style={{
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {plan.period}
                  </span>
                </div>
                <div
                  className="text-[11px] my-1.5"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {plan.desc}
                </div>
                <ul
                  className="text-left text-[11.5px] flex flex-col gap-1.5"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {plan.features.map((feat, j) => (
                    <li
                      key={j}
                      style={{
                        color:
                          "var(--color-text-secondary)",
                      }}
                    >
                      <span
                        style={{
                          color: "#00C896",
                          fontWeight: 700,
                        }}
                      >
                        ✓{" "}
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer
          className="mt-8 px-6 py-8 rounded-[14px]"
          style={{
            background: "var(--color-background-primary)",
            border:
              "0.5px solid var(--color-border-tertiary)",
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
