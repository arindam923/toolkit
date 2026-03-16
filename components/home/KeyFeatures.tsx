import { features } from "@/data/home";

export default function KeyFeatures() {
  return (
    <section className="mb-3">
      <div className="mb-3">
        <h2
          className="font-['Syne'] text-xs font-bold tracking-[2px] uppercase mb-0.5"
          style={{ color: "var(--color-text-secondary)" }}
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
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            <h4
              className="font-['Syne'] text-[13px] font-bold mb-1.5"
              style={{ color: "var(--color-text-primary)" }}
            >
              {feat.icon} {feat.title}
            </h4>
            <p
              className="text-[12px] leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {feat.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
