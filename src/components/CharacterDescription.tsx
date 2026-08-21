import { BACKGROUNDS } from "@/lib/data";
import { ChoiceGrid } from "@/components/ChoiceGrid";
import { StepIntro } from "@/components/StepIntro";

const ALIGNMENTS = [
  "Lawful Good",
  "Neutral Good",
  "Chaotic Good",
  "Lawful Neutral",
  "True Neutral",
  "Chaotic Neutral",
  "Lawful Evil",
  "Neutral Evil",
  "Chaotic Evil",
];

export interface CharacterDetails {
  alignment: string;
  appearance: string;
  personality: string;
  ideal: string;
  bond: string;
  flaw: string;
}

export function CharacterDescription({
  backgroundId,
  details,
  onBackgroundChange,
  onDetailsChange,
}: {
  backgroundId: string | null;
  details: CharacterDetails;
  onBackgroundChange: (id: string | null) => void;
  onDetailsChange: (details: CharacterDetails) => void;
}) {
  function update(field: keyof CharacterDetails, value: string) {
    onDetailsChange({ ...details, [field]: value });
  }

  const background = BACKGROUNDS.find((option) => option.id === backgroundId);

  return (
    <div>
      <StepIntro step={4} title="Describe Your Character">
        Choose where your adventurer came from, then capture the traits that make them a person
        rather than a collection of statistics. These details can grow as you play.
      </StepIntro>

      <div className="mb-7">
        <h3 className="mb-3 font-display text-sm uppercase tracking-wide text-oxblood-deep">
          Choose a background
        </h3>
        <ChoiceGrid
          items={BACKGROUNDS.map((background) => ({
            id: background.id,
            name: background.name,
            blurb: background.blurb,
            meta: background.skills,
          }))}
          selectedId={backgroundId}
          onSelect={onBackgroundChange}
          emphasizeSelection
        />
        {background && (
          <div className="paper-panel mt-4 rounded-sm p-4">
            <p className="font-display text-xs uppercase tracking-wide text-brass">
              Background feature
            </p>
            <p className="mt-1 text-sm text-ink-soft">{background.feature}</p>
          </div>
        )}
      </div>

      <div className="rule my-7" />

      <div>
        <div className="mb-4">
          <h3 className="font-display text-lg text-oxblood-deep">Bring them to life</h3>
          <p className="mt-1 text-sm text-ink-soft">
            These prompts are optional, but they give your character a point of view at the table.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="font-display text-xs uppercase tracking-wide text-ink-soft">
            Alignment
            <select
              value={details.alignment}
              onChange={(event) => update("alignment", event.target.value)}
              className="mt-1.5 w-full rounded-sm border border-ink-soft/30 bg-parchment px-3 py-2.5 font-body text-base normal-case tracking-normal text-ink outline-none focus:border-oxblood"
            >
              <option value="">Choose an alignment</option>
              {ALIGNMENTS.map((alignment) => (
                <option key={alignment} value={alignment}>
                  {alignment}
                </option>
              ))}
            </select>
          </label>

          <label className="font-display text-xs uppercase tracking-wide text-ink-soft">
            Appearance
            <input
              value={details.appearance}
              onChange={(event) => update("appearance", event.target.value)}
              placeholder="Build, features, clothing…"
              className="mt-1.5 w-full rounded-sm border border-ink-soft/30 bg-white/20 px-3 py-2 font-body text-base normal-case tracking-normal text-ink outline-none placeholder:text-ink-soft/40 focus:border-oxblood"
            />
          </label>

          {(
            [
              ["personality", "Personality traits", "How do they act around others?"],
              ["ideal", "Ideal", "What principle guides them?"],
              ["bond", "Bond", "What matters most to them?"],
              ["flaw", "Flaw", "What weakness gets in their way?"],
            ] as const
          ).map(([field, label, placeholder]) => (
            <label
              key={field}
              className="font-display text-xs uppercase tracking-wide text-ink-soft"
            >
              {label}
              <textarea
                value={details[field]}
                onChange={(event) => update(field, event.target.value)}
                placeholder={placeholder}
                rows={3}
                className="mt-1.5 block w-full resize-y rounded-sm border border-ink-soft/30 bg-white/20 px-3 py-2 font-body text-base normal-case tracking-normal text-ink outline-none placeholder:text-ink-soft/40 focus:border-oxblood"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
