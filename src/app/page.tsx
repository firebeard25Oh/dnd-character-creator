"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ABILITY_ORDER,
  AbilityKey,
  AbilityMethod,
  BACKGROUNDS,
  CLASSES,
  RACES,
} from "@/lib/data";
import { StepTabs, Step } from "@/components/StepTabs";
import { ChoiceGrid } from "@/components/ChoiceGrid";
import { AbilityScores } from "@/components/AbilityScores";
import { CharacterSheet } from "@/components/CharacterSheet";
import {
  CharacterDescription,
  CharacterDetails,
} from "@/components/CharacterDescription";
import { StepIntro } from "@/components/StepIntro";
import { generateFantasyName } from "@/lib/names";

const STORAGE_KEY = "dnd-character-creator:draft";

type StepId = "race" | "class" | "abilities" | "description" | "review";

interface Draft {
  name: string;
  raceId: string | null;
  classId: string | null;
  backgroundId: string | null;
  chosenSkills: string[];
  scores: Record<AbilityKey, number>;
  abilityMethod: AbilityMethod;
  details: CharacterDetails;
}

const emptyScores = ABILITY_ORDER.reduce(
  (acc, key) => ({ ...acc, [key]: 8 }),
  {} as Record<AbilityKey, number>
);

const emptyDraft: Draft = {
  name: "",
  raceId: null,
  classId: null,
  backgroundId: null,
  chosenSkills: [],
  scores: emptyScores,
  abilityMethod: "point-buy",
  details: {
    alignment: "",
    appearance: "",
    personality: "",
    ideal: "",
    bond: "",
    flaw: "",
  },
};

const stepSequence: StepId[] = ["race", "class", "abilities", "description", "review"];

export default function Home() {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [activeStep, setActiveStep] = useState<StepId>("race");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage on first mount only — this syncs React
    // state with an external system (the browser's storage), which is
    // exactly what effects are for.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Draft>;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDraft({
          ...emptyDraft,
          ...saved,
          details: { ...emptyDraft.details, ...saved.details },
        });
      }
    } catch {
      // ignore corrupt/missing draft
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, loaded]);

  const race = useMemo(() => RACES.find((r) => r.id === draft.raceId) ?? null, [draft.raceId]);
  const charClass = useMemo(() => CLASSES.find((c) => c.id === draft.classId) ?? null, [draft.classId]);
  const background = useMemo(
    () => BACKGROUNDS.find((b) => b.id === draft.backgroundId) ?? null,
    [draft.backgroundId]
  );

  const backgroundSkills = background?.skills ?? [];
  const allSkills = Array.from(new Set([...backgroundSkills, ...draft.chosenSkills]));

  const steps: Step[] = [
    { id: "race", label: "Race", done: !!draft.raceId },
    { id: "class", label: "Class", done: !!draft.classId },
    { id: "abilities", label: "Ability Scores", done: true },
    { id: "description", label: "Describe Character", done: !!draft.backgroundId },
    { id: "review", label: "Character Sheet", done: !!(race && charClass && background) },
  ];

  const canReview = !!(race && charClass && background);
  const activeStepIndex = stepSequence.indexOf(activeStep);
  const canContinue =
    activeStep === "race"
      ? !!draft.raceId
      : activeStep === "class"
        ? !!draft.classId
        : activeStep === "description"
          ? !!draft.backgroundId
          : true;

  function toggleSkill(skill: string) {
    if (!charClass) return;
    const alreadyFromBackground = backgroundSkills.includes(skill);
    if (alreadyFromBackground) return;
    setDraft((d) => {
      const has = d.chosenSkills.includes(skill);
      if (has) return { ...d, chosenSkills: d.chosenSkills.filter((s) => s !== skill) };
      if (d.chosenSkills.length >= charClass.numSkillChoices) return d;
      return { ...d, chosenSkills: [...d.chosenSkills, skill] };
    });
  }

  function startOver() {
    if (!window.confirm("Clear this character and start a new one?")) return;
    setDraft(emptyDraft);
    setActiveStep("race");
  }

  function downloadCharacter() {
    if (!race || !charClass || !background) return;
    const payload = {
      name: draft.name || "Unnamed Adventurer",
      race: race.name,
      class: charClass.name,
      background: background.name,
      abilityScores: draft.scores,
      skills: allSkills,
      description: draft.details,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(draft.name || "character").toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-brass/40 px-6 py-5 flex items-center justify-between">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.2em] text-brass">Chronicle</p>
          <h1 className="font-display text-2xl text-oxblood-deep">Character Creator</h1>
        </div>
        <button
          onClick={startOver}
          className="font-mono text-xs uppercase tracking-wide text-ink-soft hover:text-oxblood-deep border border-ink-soft/30 rounded-sm px-3 py-2"
        >
          Start over
        </button>
      </header>

      <main className="flex-1 grid md:grid-cols-[220px_1fr] gap-6 max-w-6xl w-full mx-auto px-6 py-8">
        <aside>
          <StepTabs
            steps={steps}
            activeId={activeStep}
            onSelect={(id) => setActiveStep(id as StepId)}
          />
          <a
            href="https://www.dndbeyond.com/sources/dnd/basic-rules-2014/step-by-step-characters"
            target="_blank"
            rel="noreferrer"
            className="mt-5 hidden border-t border-brass/30 pt-4 font-mono text-[10px] uppercase leading-relaxed tracking-wide text-ink-soft transition-colors hover:text-oxblood md:block"
          >
            Guided by the 2014 Basic Rules ↗
          </a>
        </aside>

        <section>
          <div className="mb-6">
            <label
              htmlFor="character-name"
              className="block font-display text-xs uppercase tracking-wide text-ink-soft mb-1"
            >
              Character name
            </label>
            <div className="flex items-end gap-3">
              <input
                id="character-name"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="e.g. Serrin Nightbrook"
                className="min-w-0 flex-1 bg-transparent border-b-2 border-ink-soft/30 focus:border-oxblood outline-none font-display text-xl py-1 placeholder:text-ink-soft/40"
              />
              <button
                type="button"
                onClick={() =>
                  setDraft((d) => ({ ...d, name: generateFantasyName(d.name) }))
                }
                className="shrink-0 rounded-sm border border-brass/70 px-3 py-2 font-mono text-xs uppercase tracking-wide text-oxblood-deep transition-colors hover:bg-brass/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood"
              >
                <span aria-hidden="true" className="mr-1.5 text-brass">
                  ✦
                </span>
                Generate name
              </button>
            </div>
          </div>

          {activeStep === "race" && (
            <div>
              <StepIntro step={1} title="Choose a Race">
                Your race shapes your adventurer&apos;s identity, natural talents, speed, and
                inherited traits. Choose the story that excites you, whether or not it follows a
                familiar archetype.
              </StepIntro>
              <ChoiceGrid
                items={RACES.map((r) => ({
                  id: r.id,
                  name: r.name,
                  blurb: r.blurb,
                  meta: [
                    ...Object.entries(r.bonuses).map(([k, v]) => `+${v} ${k.toUpperCase()}`),
                    `Speed ${r.speed} ft.`,
                  ],
                }))}
                selectedId={draft.raceId}
                onSelect={(id) => setDraft((d) => ({ ...d, raceId: id }))}
                emphasizeSelection
              />
            </div>
          )}

          {activeStep === "class" && (
            <div>
              <StepIntro step={2} title="Choose a Class">
                Your class is your adventuring vocation. It determines your core capabilities,
                starting toughness, saving throws, and the skills you can train.
              </StepIntro>
              <ChoiceGrid
                items={CLASSES.map((c) => ({
                  id: c.id,
                  name: c.name,
                  blurb: c.blurb,
                  meta: [`Hit die d${c.hitDie}`, `Choose ${c.numSkillChoices} skills`],
                }))}
                selectedId={draft.classId}
                onSelect={(id) =>
                  setDraft((d) => ({ ...d, classId: id, chosenSkills: [] }))
                }
                emphasizeSelection
              />
            </div>
          )}

          {activeStep === "abilities" && (
            <AbilityScores
              scores={draft.scores}
              setScores={(scores) => setDraft((d) => ({ ...d, scores }))}
              method={draft.abilityMethod ?? "point-buy"}
              setMethod={(abilityMethod) => setDraft((d) => ({ ...d, abilityMethod }))}
              race={race}
            />
          )}

          {charClass && activeStep === "class" && (
            <div className="paper-panel rounded-sm p-4 mt-6">
              <h3 className="font-display text-sm uppercase tracking-wide text-oxblood-deep mb-2">
                Choose {charClass.numSkillChoices} class skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {charClass.skillChoices.map((skill) => {
                  const chosen = draft.chosenSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`font-mono text-xs px-3 py-1.5 rounded-full border ${
                        chosen
                          ? "bg-forest text-parchment border-forest"
                          : "border-ink-soft/30 text-ink-soft hover:border-forest"
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs font-mono text-ink-soft mt-2">
                {draft.chosenSkills.length} / {charClass.numSkillChoices} selected
              </p>
            </div>
          )}

          {activeStep === "description" && (
            <CharacterDescription
              backgroundId={draft.backgroundId}
              details={draft.details}
              onBackgroundChange={(backgroundId) =>
                setDraft((current) => ({ ...current, backgroundId }))
              }
              onDetailsChange={(details) => setDraft((current) => ({ ...current, details }))}
            />
          )}

          {activeStep === "review" &&
            (canReview ? (
              <div>
                <CharacterSheet
                  name={draft.name}
                  race={race!}
                  charClass={charClass!}
                  background={background!}
                  scores={draft.scores}
                  skills={allSkills}
                  details={draft.details}
                />
                <button
                  onClick={downloadCharacter}
                  className="mt-6 font-display text-sm uppercase tracking-wide bg-oxblood text-parchment px-5 py-3 rounded-sm hover:bg-oxblood-deep"
                >
                  Download character (.json)
                </button>
              </div>
            ) : (
              <p className="text-ink-soft italic">
                Finish choosing a race, class, and background to see your character sheet.
              </p>
            ))}

          {activeStep !== "review" && (
            <div className="mt-8 flex items-center justify-between border-t border-brass/30 pt-5">
              <button
                type="button"
                onClick={() => setActiveStep(stepSequence[activeStepIndex - 1])}
                disabled={activeStepIndex === 0}
                className="font-display text-xs uppercase tracking-wide text-ink-soft hover:text-oxblood disabled:invisible"
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(stepSequence[activeStepIndex + 1])}
                disabled={!canContinue}
                className="rounded-sm bg-oxblood px-5 py-2.5 font-display text-xs uppercase tracking-wide text-parchment transition-colors hover:bg-oxblood-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue to {steps[activeStepIndex + 1]?.label}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
