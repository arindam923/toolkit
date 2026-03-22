import { categories } from "@/data/home";

export default function CategoriesSection() {
  return (
    <section className="mb-3">
      <div className="mb-3">
        <h2
          className="font-['Syne'] text-xs font-bold tracking-[2px] uppercase mb-0.5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Categories
        </h2>
        <p
          className="text-sm font-medium"
          style={{ color: "var(--color-text-primary)" }}
        >
          6 tool categories, 55+ individual tools
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {categories.map((cat, idx) => (
          <a
            key={`cat-${idx}`}
            href={cat.name === "Image Tools" ? "/images" : cat.name === "PDF Toolkit" ? "/pdf" : cat.name === "File Converter" ? "/files" : cat.name === "Security & Privacy" ? "/security" : "#"}
            className="relative p-5 rounded-[14px] cursor-pointer transition-all hover:-translate-y-0.5 block"
            style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              textDecoration: "none",
            }}
            onClick={(e) => {
              if (cat.name !== "Image Tools" && cat.name !== "PDF Toolkit" && cat.name !== "File Converter" && cat.name !== "Security & Privacy") e.preventDefault();
            }}
          >
            {/* Count badge */}
            <div
              className="absolute top-3.5 right-3.5 text-[10px] font-semibold font-['Syne']"
              style={{ color: "var(--color-text-secondary)", opacity: 0.5 }}
            >
              {cat.count} tools
            </div>

            {/* Icon */}
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl mb-2.5"
              style={{ background: cat.iconBg }}
            >
              {cat.icon}
            </div>

            <h3
              className="font-['Syne'] text-sm font-bold mb-1.5"
              style={{ color: "var(--color-text-primary)" }}
            >
              {cat.name}
            </h3>

            <p
              className="text-[11.5px] leading-relaxed mb-2.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {cat.description}
            </p>

            {/* Tool pills */}
            <div className="flex flex-wrap gap-1">
              {cat.tools.map((tool, j) => (
                <span
                  key={`tool-${j}`}
                  className="text-[10px] px-2 py-0.75 rounded-[20px] font-['DM_Sans']"
                  style={{
                    background: "var(--color-background-secondary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {tool}
                </span>
              ))}
            </div>

            {/* Arrow */}
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
  );
}
