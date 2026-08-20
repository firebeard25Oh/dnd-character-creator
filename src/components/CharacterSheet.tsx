"use client";

import {
  ABILITY_LABELS,
  ABILITY_ORDER,
  AbilityKey,
  Background,
  CharClass,
  Race,
  abilityModifier,
  formatModifier,
} from "@/lib/data";

export function CharacterSheet({
  name,
  race,
  charClass,
  background,
  scores,
  skills,
}: {
  name: string;
  race: Race;
  charClass: CharClass;
  background: Background;
  scores: Record<AbilityKey, number>;
  skills: string[];
}) {
  const conMod = abilityModifier(scores.con + (race.bonuses.con ?? 0));
  const hp = charClass.hitDie + conMod;
  const proficiencyBonus = 2;

  return (
    <div id="character-sheet" className="paper-panel rounded-sm p-6 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-brass/50 pb-4">
        <div>
          <h2 className="font-display text-3xl text-oxblood-deep">{name || "Unnamed Adventurer"}</h2>
          <p className="text-ink-soft italic mt-1">
            {race.name} {charClass.name} · {background.name}
          </p>
        </div>
        <div className="flex gap-6 font-mono text-sm text-ink-soft">
          <div className="text-center">
            <p className="text-2xl text-oxblood-deep">{hp}</p>
            <p className="uppercase text-xs">HP</p>
          </div>
          <div className="text-center">
            <p className="text-2xl text-oxblood-deep">{race.speed}</p>
            <p className="uppercase text-xs">Speed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl text-oxblood-deep">+{proficiencyBonus}</p>
            <p className="uppercase text-xs">Prof.</p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6">
        {ABILITY_ORDER.map((key) => {
          const total = scores[key] + (race.bonuses[key] ?? 0);
          const mod = abilityModifier(total);
          const isSave = charClass.savingThrows.includes(key);
          return (
            <div key={key} className="text-center border border-ink-soft/25 rounded-sm py-3">
              <p className="text-xs font-display uppercase tracking-wide text-ink-soft">
                {ABILITY_LABELS[key].slice(0, 3)}
              </p>
              <p className="font-mono text-2xl mt-1">{total}</p>
              <p className="font-mono text-sm text-oxblood-deep">{formatModifier(mod)}</p>
              {isSave && <p className="text-[10px] font-mono text-forest mt-1">save prof.</p>}
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div>
          <h3 className="font-display text-sm uppercase tracking-wide text-oxblood-deep mb-2">
            Skill proficiencies
          </h3>
          <ul className="space-y-1">
            {skills.map((s) => (
              <li key={s} className="text-sm font-mono flex gap-2">
                <span className="text-brass">◆</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm uppercase tracking-wide text-oxblood-deep mb-2">
            Traits &amp; features
          </h3>
          <ul className="space-y-1">
            {race.traits.map((t) => (
              <li key={t} className="text-sm font-mono flex gap-2">
                <span className="text-forest">◆</span>
                {t}
              </li>
            ))}
            <li className="text-sm font-mono flex gap-2">
              <span className="text-forest">◆</span>
              {background.feature}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
