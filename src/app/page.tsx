"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ABILITY_ORDER,
  AbilityKey,
  AbilityMethod,
  BACKGROUNDS,
  CLASS_STARTING_EQUIPMENT,
  CLASSES,
  RACES,
  resolveStartingEquipment,
} from "@/lib/data";
import { StepTabs, Step } from "@/components/StepTabs";
import { ChoiceGrid } from "@/components/ChoiceGrid";
import { AbilityScores } from "@/components/AbilityScores";
import { CharacterSheet } from "@/components/CharacterSheet";
import { generateFantasyName } from "@/lib/names";
import { StartingEquipment } from "@/components/StartingEquipment";

const STORAGE_KEY = "dnd-character-creator:draft";

type StepId = "race" | "class" | "background" | "abilities" | "equipment" | "review";

interface Draft {
  name: string;
  raceId: string | null;
  classId: string | null;
  backgroundId: string | null;
  chosenSkills: string[];
  scores: Record<AbilityKey, number>;
  abilityMethod: AbilityMethod;
  equipmentSelections: Record<string, string>;
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
  equipmentSelections: {},
};

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
          scores: { ...emptyScores, ...saved.scores },
          equipmentSelections: saved.equipmentSelections ?? {},
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
  const classEquipment = charClass ? CLASS_STARTING_EQUIPMENT[charClass.id] : null;
  const equipment = useMemo(
    () =>
      resolveStartingEquipment(
        draft.classId,
        draft.backgroundId,
        draft.equipmentSelections
      ),
    [draft.classId, draft.backgroundId, draft.equipmentSelections]
  );
  const equipmentComplete =
    !!classEquipment &&
    classEquipment.choices.every((choice) => !!draft.equipmentSelections[choice.id]);

  const backgroundSkills = background?.skills ?? [];
  const allSkills = Array.from(new Set([...backgroundSkills, ...draft.chosenSkills]));

  const steps: Step[] = [
    { id: "race", label: "Race", done: !!draft.raceId },
    { id: "class", label: "Class", done: !!draft.classId },
    { id: "background", label: "Background", done: !!draft.backgroundId },
    { id: "abilities", label: "Ability Scores", done: true },
    { id: "equipment", label: "Starting Equipment", done: equipmentComplete },
    {
      id: "review",
      label: "Character Sheet",
      done: !!(race && charClass && background && equipmentComplete),
    },
  ];

  const canReview = !!(race && charClass && background && equipmentComplete);

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
      equipment,
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
        <StepTabs steps={steps} activeId={activeStep} onSelect={(id) => setActiveStep(id as StepId)} />

        <section>
          <div className="mb-6 grid gap-5 border-b border-brass/40 pb-5 sm:grid-cols-2 sm:gap-0">
            <div className="sm:pr-6">
              <label
                htmlFor="character-name"
                className="mb-1 block font-display text-xs uppercase tracking-wide text-ink-soft"
              >
                Character name
              </label>
              <input
                id="character-name"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="e.g. Serrin Nightbrook"
                className="w-full min-w-0 border-b-2 border-ink-soft/30 bg-transparent py-1 font-display text-xl outline-none placeholder:text-ink-soft/40 focus:border-oxblood"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setDraft((d) => ({ ...d, name: generateFantasyName(d.name) }))
                  }
                  className="shrink-0 rounded-sm border border-ink-soft/20 px-2 py-1 font-mono text-[0.65rem] uppercase tracking-wide text-ink-soft/60 transition-colors hover:border-brass/50 hover:bg-brass/5 hover:text-oxblood-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood"
                >
                  <span aria-hidden="true" className="mr-1 text-brass/70">
                    ✦
                  </span>
                  Generate name
                </button>
                {background && (
                  <p
                    aria-label={`Character background: ${background.name}`}
                    className="text-right font-display text-sm uppercase tracking-wide text-oxblood-deep"
                  >
                    {background.name}
                  </p>
                )}
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-4 sm:border-l sm:border-brass/30 sm:pl-6">
              <div>
                <dt className="font-display text-xs uppercase tracking-wide text-ink-soft">
                  Character race
                </dt>
                <dd
                  className={`mt-2 font-display text-lg ${
                    race ? "text-oxblood-deep" : "text-ink-soft/40"
                  }`}
                >
                  {race?.name ?? "Not chosen"}
                </dd>
              </div>
              <div>
                <dt className="font-display text-xs uppercase tracking-wide text-ink-soft">
                  Character class
                </dt>
                <dd
                  className={`mt-2 font-display text-lg ${
                    charClass ? "text-oxblood-deep" : "text-ink-soft/40"
                  }`}
                >
                  {charClass?.name ?? "Not chosen"}
                </dd>
              </div>
            </dl>
          </div>

          {activeStep === "race" && (
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
          )}

          {activeStep === "class" && (
            <ChoiceGrid
              items={CLASSES.map((c) => ({
                id: c.id,
                name: c.name,
                blurb: c.blurb,
                meta: [`Hit die d${c.hitDie}`, `Choose ${c.numSkillChoices} skills`],
              }))}
              selectedId={draft.classId}
              onSelect={(id) =>
                setDraft((d) => ({
                  ...d,
                  classId: id,
                  chosenSkills: [],
                  equipmentSelections: {},
                }))
              }
              emphasizeSelection
            />
          )}

          {activeStep === "background" && (
            <ChoiceGrid
              items={BACKGROUNDS.map((b) => ({
                id: b.id,
                name: b.name,
                blurb: b.blurb,
                meta: b.skills,
              }))}
              selectedId={draft.backgroundId}
              onSelect={(id) => setDraft((d) => ({ ...d, backgroundId: id }))}
              emphasizeSelection
            />
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

          {charClass && (activeStep === "class" || activeStep === "abilities") && (
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

          {activeStep === "equipment" && (
            <StartingEquipment
              charClass={charClass}
              background={background}
              equipment={classEquipment}
              selections={draft.equipmentSelections}
              onSelect={(choiceId, optionId) =>
                setDraft((d) => ({
                  ...d,
                  equipmentSelections: {
                    ...d.equipmentSelections,
                    [choiceId]: optionId,
                  },
                }))
              }
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
                  equipment={equipment}
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
                Finish choosing a race, class, background, and starting equipment to see your
                character sheet.
              </p>
            ))}
        </section>
      </main>
    </div>
  );
}
