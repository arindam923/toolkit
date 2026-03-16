import { plans } from "@/data/home";

export default function PricingSection() {
  return (
    <section className="mb-3">
      <div className="mb-3">
        <h2
          className="font-['Syne'] text-xs font-bold tracking-[2px] uppercase mb-0.5"
          style={{ color: "var(--color-text-secondary)" }}
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
              background: "var(--color-background-primary)",
              border: plan.featured
                ? "1.5px solid #7C5CFF"
                : "0.5px solid var(--color-border-tertiary)",
            }}
          >
            {plan.featured && (
              <div
                className="text-[10px] font-semibold tracking-wide inline-block mb-2 px-2.5 py-0.75 rounded-[20px]"
                style={{ background: "rgba(124,92,255,0.12)", color: "#7C5CFF" }}
              >
                MOST POPULAR
              </div>
            )}

            <div
              className="font-['Syne'] text-[13px] font-bold mb-1"
              style={{ color: "var(--color-text-primary)" }}
            >
              {plan.name}
            </div>

            <div
              className="font-['Syne'] text-[26px] font-extrabold"
              style={{ color: "var(--color-text-primary)" }}
            >
              {plan.price}{" "}
              <span
                className="text-[13px] font-normal"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {plan.period}
              </span>
            </div>

            <div
              className="text-[11px] my-1.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {plan.desc}
            </div>

            <ul
              className="text-left text-[11.5px] flex flex-col gap-1.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {plan.features.map((feat, j) => (
                <li key={j} style={{ color: "var(--color-text-secondary)" }}>
                  <span style={{ color: "#00C896", fontWeight: 700 }}>✓ </span>
                  {feat}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
