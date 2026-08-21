"use client";

interface ChoiceCardData {
  id: string;
  name: string;
  blurb: string;
  meta?: string[];
}

export function ChoiceGrid({
  items,
  selectedId,
  onSelect,
  emphasizeSelection = false,
}: {
  items: ChoiceCardData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  emphasizeSelection?: boolean;
}) {
  return (
    <div className="grid sm:grid-cols-2 auto-rows-fr gap-4">
      {items.map((item) => {
        const active = item.id === selectedId;
        const simplified = emphasizeSelection && !active;
        const selectionClass = emphasizeSelection
          ? active
            ? "choice-card-selected"
            : selectedId !== null
              ? "choice-card-muted"
              : "hover:bg-parchment-dim/50"
          : active
            ? "ring-2 ring-oxblood bg-parchment-dim"
            : "hover:bg-parchment-dim/50";
        return (
          <button
            key={item.id}
            aria-pressed={active}
            onClick={() => {
              if (!active) onSelect(item.id);
            }}
            className={`paper-panel rounded-sm p-4 transition-all ${selectionClass} ${
              simplified ? "min-h-36 flex flex-col items-center justify-center text-center" : "text-left"
            }`}
          >
            <div className={simplified ? "" : "flex items-baseline justify-between gap-2"}>
              <h3
                className={`font-display text-oxblood-deep ${
                  simplified ? "text-2xl uppercase tracking-wide" : "text-lg"
                }`}
              >
                {item.name}
              </h3>
            </div>
            <p className="mt-1 text-sm text-ink-soft italic">{item.blurb}</p>
            {!simplified && item.meta && item.meta.length > 0 && (
              <ul className="mt-3 space-y-1">
                {item.meta.map((m, i) => (
                  <li key={i} className="text-xs font-mono text-ink-soft flex gap-2">
                    <span className="text-brass">◆</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            )}
          </button>
        );
      })}
    </div>
  );
}
