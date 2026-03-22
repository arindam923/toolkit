import { FILES_PAGE_STATS } from "@/data/files";

export default function FilesPageHeader() {
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
            "linear-gradient(135deg, transparent 40%, rgba(0,200,150,0.06) 100%)",
        }}
      />

      <div className="relative">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[20px] text-[11px] font-medium mb-4"
          style={{
            background: "rgba(0,200,150,0.1)",
            color: "#00A87A",
            letterSpacing: "0.3px",
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#00A87A] animate-pulse" />
          File Converter Tools
        </div>

        {/* Headline */}
        <h1
          className="font-['Syne'] font-extrabold text-[26px] sm:text-[36px] leading-tight tracking-[-1px] mb-3"
          style={{ color: "var(--color-text-primary)" }}
        >
          All File Converters
          <br />
          <em style={{ color: "#00A87A", fontStyle: "normal" }}>in one place.</em>
        </h1>

        {/* Subheading */}
        <p
          className="text-sm leading-relaxed max-w-[440px] mb-6"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Convert between different file formats instantly. Images, documents, videos,
          and more — all processed locally in your browser.
        </p>

        {/* Stats */}
        <div
          className="flex gap-7 mt-7 pt-6"
          style={{ borderTop: "0.5px solid var(--color-border-tertiary)" }}
        >
          {FILES_PAGE_STATS.map((stat, idx) => (
            <div key={idx}>
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
