"use client";

export interface Step {
  id: string;
  label: string;
  done: boolean;
}

export function StepTabs({
  steps,
  activeId,
  onSelect,
}: {
  steps: Step[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav className="flex md:flex-col gap-2 md:gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
      {steps.map((step, i) => {
        const active = step.id === activeId;
        return (
          <button
            key={step.id}
            onClick={() => onSelect(step.id)}
            className={`group relative flex items-center gap-3 whitespace-nowrap px-4 py-3 text-left font-display text-sm tracking-wide uppercase transition-colors border-l-4 ${
              active
                ? "bg-parchment-dim border-oxblood text-oxblood-deep"
                : "border-transparent text-ink-soft hover:bg-parchment-dim/60 hover:border-brass"
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs ${
                step.done
                  ? "bg-forest text-parchment"
                  : active
                  ? "bg-oxblood text-parchment"
                  : "bg-transparent border border-ink-soft/40 text-ink-soft/70"
              }`}
            >
              {step.done ? "✓" : i + 1}
            </span>
            {step.label}
          </button>
        );
      })}
    </nav>
  );
}
