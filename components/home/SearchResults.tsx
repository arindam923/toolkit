import { allTools, CATEGORY_ICON_MAP, CATEGORY_BG_MAP } from "@/data/home";

interface SearchResultsProps {
  query: string;
}

export default function SearchResults({ query }: SearchResultsProps) {
  const results = allTools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(query.toLowerCase()) ||
      tool.desc.toLowerCase().includes(query.toLowerCase()) ||
      tool.category.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <section className="mb-3">
      <div className="mb-3">
        <h2
          className="font-['Syne'] text-xs font-bold tracking-[2px] uppercase mb-0.5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Search Results
        </h2>
        <p
          className="text-sm font-medium"
          style={{ color: "var(--color-text-primary)" }}
        >
          {results.length} tools found
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {results.map((tool, i) => (
          <div
            key={i}
            className="relative p-5 rounded-[14px] cursor-pointer transition-all hover:-translate-y-0.5"
            style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            {/* Category label */}
            <div
              className="absolute top-3.5 right-3.5 text-[10px] font-semibold font-['Syne']"
              style={{ color: "var(--color-text-secondary)", opacity: 0.5 }}
            >
              {tool.category}
            </div>

            {/* Icon */}
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl mb-2.5"
              style={{ background: CATEGORY_BG_MAP[tool.category] }}
            >
              {CATEGORY_ICON_MAP[tool.category]}
            </div>

            <h3
              className="font-['Syne'] text-sm font-bold mb-1.5"
              style={{ color: "var(--color-text-primary)" }}
            >
              {tool.name}
            </h3>
            <p
              className="text-[11.5px] leading-relaxed mb-2.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {tool.desc}
            </p>

            {/* Arrow */}
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
  );
}
