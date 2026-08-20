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
}: {
  items: ChoiceCardData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {items.map((item) => {
        const active = item.id === selectedId;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`text-left paper-panel rounded-sm p-4 transition-all ${
              active
                ? "ring-2 ring-oxblood bg-parchment-dim"
                : "hover:bg-parchment-dim/50"
            }`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-display text-lg text-oxblood-deep">{item.name}</h3>
              {active && <span className="font-mono text-xs text-forest">chosen</span>}
            </div>
            <p className="mt-1 text-sm text-ink-soft italic">{item.blurb}</p>
            {item.meta && item.meta.length > 0 && (
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
