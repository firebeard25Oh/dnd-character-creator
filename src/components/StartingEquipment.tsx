"use client";

import {
  Background,
  BACKGROUND_STARTING_EQUIPMENT,
  CharClass,
  StartingEquipment as StartingEquipmentData,
} from "@/lib/data";

function EquipmentList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm text-ink-soft">
          <span className="text-brass" aria-hidden="true">
            ◆
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function StartingEquipment({
  charClass,
  background,
  equipment,
  selections,
  onSelect,
}: {
  charClass: CharClass | null;
  background: Background | null;
  equipment: StartingEquipmentData | null;
  selections: Record<string, string>;
  onSelect: (choiceId: string, optionId: string) => void;
}) {
  if (!charClass) {
    return (
      <div className="paper-panel rounded-sm p-6">
        <h2 className="font-display text-2xl text-oxblood-deep">Starting Equipment</h2>
        <p className="mt-2 text-ink-soft italic">
          Choose a class first to see the weapons, armor, and adventuring gear available to you.
        </p>
      </div>
    );
  }

  const backgroundItems = background
    ? (BACKGROUND_STARTING_EQUIPMENT[background.id] ?? [])
    : [];

  return (
    <div className="space-y-6">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.18em] text-brass">
          Step 5
        </p>
        <h2 className="font-display text-2xl text-oxblood-deep">Starting Equipment</h2>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Your class and background provide your first weapons, armor, and adventuring gear.
          Choose one option from each group below.
        </p>
      </header>

      <section className="paper-panel rounded-sm p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-lg text-oxblood-deep">{charClass.name} equipment</h3>
          <span className="font-mono text-xs uppercase tracking-wide text-ink-soft">
            {equipment?.choices.filter((choice) => selections[choice.id]).length ?? 0} /{" "}
            {equipment?.choices.length ?? 0} choices
          </span>
        </div>

        <div className="mt-5 space-y-5">
          {equipment?.choices.map((choice) => (
            <fieldset key={choice.id}>
              <legend className="font-display text-xs uppercase tracking-wide text-ink-soft">
                {choice.prompt}
              </legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {choice.options.map((option) => {
                  const selected = selections[choice.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onSelect(choice.id, option.id)}
                      className={`rounded-sm border px-4 py-3 text-left transition-colors ${
                        selected
                          ? "border-oxblood bg-oxblood text-parchment"
                          : "border-ink-soft/25 bg-white/10 text-ink hover:border-brass hover:bg-parchment-dim/50"
                      }`}
                    >
                      <span className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border ${
                            selected
                              ? "border-parchment bg-parchment text-oxblood"
                              : "border-ink-soft/50"
                          }`}
                        >
                          {selected ? "✓" : ""}
                        </span>
                        <span>
                          <span className="block font-display text-sm">{option.label}</span>
                          {option.items.length > 1 && (
                            <span
                              className={`mt-1 block text-xs ${
                                selected ? "text-parchment/75" : "text-ink-soft"
                              }`}
                            >
                              {option.items.join(" · ")}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        {equipment && equipment.fixed.length > 0 && (
          <div className="mt-6 border-t border-brass/35 pt-4">
            <h4 className="font-display text-xs uppercase tracking-wide text-ink-soft">
              Always included
            </h4>
            <EquipmentList items={equipment.fixed} />
          </div>
        )}
      </section>

      <section className="paper-panel rounded-sm p-5">
        <h3 className="font-display text-lg text-oxblood-deep">Background equipment</h3>
        {background ? (
          <>
            <p className="mt-1 text-sm italic text-ink-soft">
              Included with the {background.name} background
            </p>
            <EquipmentList items={backgroundItems} />
          </>
        ) : (
          <p className="mt-2 text-ink-soft italic">
            Choose a background to add its tools, clothing, keepsakes, and starting gold.
          </p>
        )}
      </section>

      <p className="text-xs text-ink-soft">
        Prefer to buy your own gear? The 2014 Basic Rules allow you to take your class&apos;s
        starting gold instead, with your DM&apos;s approval.
      </p>
    </div>
  );
}
