import { flowSteps } from "@/data/home";

export default function UserFlow() {
  return (
    <section className="mb-3">
      <div className="mb-3">
        <h2
          className="font-['Syne'] text-xs font-bold tracking-[2px] uppercase mb-0.5"
          style={{ color: "var(--color-text-secondary)" }}
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
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "10px",
              marginBottom: i < flowSteps.length - 1 ? "8px" : "0",
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold font-['Syne'] mb-2"
              style={{ background: "#FF5C35", color: "#fff" }}
            >
              {step.num}
            </div>
            <h4
              className="text-xs font-semibold mb-0.75 font-['Syne']"
              style={{ color: "var(--color-text-primary)" }}
            >
              {step.title}
            </h4>
            <p
              className="text-[11px] leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
