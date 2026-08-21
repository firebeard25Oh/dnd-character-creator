"use client";

import { useEffect, useState } from "react";
import {
  ABILITY_LABELS,
  ABILITY_ORDER,
  AbilityKey,
  AbilityMethod,
  Race,
  abilityModifier,
  formatModifier,
  pointBuyCost,
  POINT_BUY_BUDGET,
  POINT_BUY_MIN,
  POINT_BUY_MAX,
} from "@/lib/data";

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
const INITIAL_ASSIGNMENTS = [0, 1, 2, 3, 4, 5];

interface DiceRoll {
  dice: number[];
  droppedIndex: number;
  total: number;
}

const METHODS: {
  id: AbilityMethod;
  label: string;
  eyebrow: string;
  description: string;
}[] = [
  {
    id: "standard",
    label: "Standard Array",
    eyebrow: "Quick & balanced",
    description: "Assign 15, 14, 13, 12, 10, and 8 across your six abilities.",
  },
  {
    id: "random",
    label: "Random Generation",
    eyebrow: "Trust the dice",
    description: "Roll 4d6 six times, dropping the lowest die from each roll.",
  },
  {
    id: "point-buy",
    label: "Point Cost",
    eyebrow: "Fine control",
    description: "Spend 27 points to build each score from a base of 8.",
  },
];

function makeScores(values: number[], assignments: number[]) {
  return ABILITY_ORDER.reduce(
    (next, key, index) => ({ ...next, [key]: values[assignments[index]] }),
    {} as Record<AbilityKey, number>
  );
}

function rollAbility(): DiceRoll {
  const dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  const lowest = Math.min(...dice);
  const droppedIndex = dice.indexOf(lowest);
  const total = dice.reduce((sum, die) => sum + die, 0) - lowest;
  return { dice, droppedIndex, total };
}

function ScoreAssignments({
  values,
  assignments,
  onAssign,
  race,
}: {
  values: number[];
  assignments: number[];
  onAssign: (abilityIndex: number, sourceIndex: number) => void;
  race: Race | null;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {ABILITY_ORDER.map((key, abilityIndex) => {
        const base = values[assignments[abilityIndex]];
        const bonus = race?.bonuses[key] ?? 0;
        const total = base + bonus;
        return (
          <label key={key} className="paper-panel rounded-sm p-4">
            <span className="flex items-center justify-between">
              <span className="font-display text-sm uppercase tracking-wide text-oxblood-deep">
                {ABILITY_LABELS[key]}
              </span>
              <span className="font-mono text-xs text-ink-soft">
                {formatModifier(abilityModifier(total))} mod
              </span>
            </span>
            <span className="mt-3 flex items-center gap-3">
              <select
                aria-label={`${ABILITY_LABELS[key]} score`}
                value={assignments[abilityIndex]}
                onChange={(event) => onAssign(abilityIndex, Number(event.target.value))}
                className="min-w-0 flex-1 rounded-sm border border-ink-soft/30 bg-parchment px-3 py-2 font-mono text-lg text-ink outline-none focus:border-oxblood"
              >
                {values.map((value, sourceIndex) => (
                  <option key={sourceIndex} value={sourceIndex}>
                    {value}
                  </option>
                ))}
              </select>
              {bonus !== 0 && (
                <span className="font-mono text-sm text-forest">
                  +{bonus} = {total}
                </span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export function AbilityScores({
  scores,
  setScores,
  method,
  setMethod,
  race,
}: {
  scores: Record<AbilityKey, number>;
  setScores: (scores: Record<AbilityKey, number>) => void;
  method: AbilityMethod;
  setMethod: (method: AbilityMethod) => void;
  race: Race | null;
}) {
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [randomRolls, setRandomRolls] = useState<DiceRoll[]>([]);
  const [randomValues, setRandomValues] = useState(() =>
    ABILITY_ORDER.map((key) => scores[key])
  );
  const [isRolling, setIsRolling] = useState(false);
  const spent = ABILITY_ORDER.reduce((sum, key) => sum + pointBuyCost(scores[key]), 0);
  const remaining = POINT_BUY_BUDGET - spent;

  useEffect(() => {
    if (!isRolling) return;

    const updateDice = () => setRandomRolls(Array.from({ length: 6 }, rollAbility));
    updateDice();
    const interval = window.setInterval(updateDice, 100);
    const timeout = window.setTimeout(() => {
      const finalRolls = Array.from({ length: 6 }, rollAbility);
      const values = finalRolls.map((roll) => roll.total);
      setRandomRolls(finalRolls);
      setRandomValues(values);
      setAssignments(INITIAL_ASSIGNMENTS);
      setScores(makeScores(values, INITIAL_ASSIGNMENTS));
      setIsRolling(false);
    }, 900);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [isRolling, setScores]);

  function chooseMethod(nextMethod: AbilityMethod) {
    if (nextMethod === method) return;
    setMethod(nextMethod);
    setAssignments(INITIAL_ASSIGNMENTS);

    if (nextMethod === "standard") {
      setScores(makeScores(STANDARD_ARRAY, INITIAL_ASSIGNMENTS));
    } else if (nextMethod === "point-buy") {
      setScores(
        ABILITY_ORDER.reduce(
          (next, key) => ({ ...next, [key]: POINT_BUY_MIN }),
          {} as Record<AbilityKey, number>
        )
      );
    }
  }

  function assignScore(values: number[], abilityIndex: number, sourceIndex: number) {
    const nextAssignments = [...assignments];
    const previousAbility = nextAssignments.indexOf(sourceIndex);
    [nextAssignments[abilityIndex], nextAssignments[previousAbility]] = [
      nextAssignments[previousAbility],
      nextAssignments[abilityIndex],
    ];
    setAssignments(nextAssignments);
    setScores(makeScores(values, nextAssignments));
  }

  function adjust(key: AbilityKey, delta: number) {
    const next = scores[key] + delta;
    if (next < POINT_BUY_MIN || next > POINT_BUY_MAX) return;
    const nextCost = spent - pointBuyCost(scores[key]) + pointBuyCost(next);
    if (nextCost > POINT_BUY_BUDGET) return;
    setScores({ ...scores, [key]: next });
  }

  return (
    <div>
      <div className="mb-6">
        <p className="font-display text-xs uppercase tracking-[0.18em] text-brass">
          Generate your scores
        </p>
        <h2 className="mt-1 font-display text-2xl text-oxblood-deep">
          Choose an ability score method
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Determine your six starting scores with one of these three methods. You can switch
          methods at any time.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3" role="group" aria-label="Ability score method">
        {METHODS.map((option) => {
          const selected = option.id === method;
          return (
            <button
              type="button"
              key={option.id}
              aria-pressed={selected}
              onClick={() => chooseMethod(option.id)}
              className={`rounded-sm border p-4 text-left transition ${
                selected
                  ? "border-oxblood bg-oxblood text-parchment shadow-md"
                  : "paper-panel border-ink-soft/20 text-ink hover:-translate-y-0.5 hover:border-brass"
              }`}
            >
              <span
                className={`block font-mono text-[10px] uppercase tracking-[0.16em] ${
                  selected ? "text-parchment/70" : "text-brass"
                }`}
              >
                {option.eyebrow}
              </span>
              <span className="mt-1 block font-display text-base">{option.label}</span>
              <span
                className={`mt-2 block text-xs leading-relaxed ${
                  selected ? "text-parchment/80" : "text-ink-soft"
                }`}
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rule my-6" />

      {method === "standard" && (
        <div>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="font-display text-lg text-oxblood-deep">Assign the standard array</h3>
              <p className="mt-1 text-xs text-ink-soft">
                Selecting an assigned score swaps it with the ability currently using that value.
              </p>
            </div>
            <p className="font-mono text-xs text-ink-soft">15 · 14 · 13 · 12 · 10 · 8</p>
          </div>
          <ScoreAssignments
            values={STANDARD_ARRAY}
            assignments={assignments}
            onAssign={(abilityIndex, sourceIndex) =>
              assignScore(STANDARD_ARRAY, abilityIndex, sourceIndex)
            }
            race={race}
          />
        </div>
      )}

      {method === "random" && (
        <div>
          <div className="paper-panel mb-5 rounded-sm p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg text-oxblood-deep">Roll six scores</h3>
                <p className="mt-1 text-xs text-ink-soft">
                  Each result totals the highest three of four six-sided dice.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRolling(true)}
                disabled={isRolling}
                className="rounded-sm bg-forest px-5 py-2.5 font-display text-xs uppercase tracking-wide text-parchment hover:bg-forest/90 disabled:cursor-wait disabled:opacity-70"
              >
                {isRolling ? "Rolling…" : randomRolls.length ? "Roll again" : "Roll 4d6 six times"}
              </button>
            </div>

            {randomRolls.length > 0 && (
              <div
                className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3"
                aria-live="polite"
                aria-label={isRolling ? "Dice are rolling" : "Final dice results"}
              >
                {randomRolls.map((roll, rollIndex) => (
                  <div key={rollIndex} className="rounded-sm border border-ink-soft/15 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase text-ink-soft">
                        Roll {rollIndex + 1}
                      </span>
                      <span className="font-mono text-lg text-oxblood-deep">{roll.total}</span>
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      {roll.dice.map((die, dieIndex) => (
                        <span
                          key={dieIndex}
                          title={dieIndex === roll.droppedIndex ? `${die} dropped` : `${die}`}
                          className={`dice-face ${isRolling ? "dice-rolling" : ""} ${
                            dieIndex === roll.droppedIndex ? "dice-dropped" : ""
                          }`}
                        >
                          {die}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isRolling && randomRolls.length > 0 && (
            <div>
              <h3 className="mb-4 font-display text-lg text-oxblood-deep">
                Assign your rolled scores
              </h3>
              <ScoreAssignments
                values={randomValues}
                assignments={assignments}
                onAssign={(abilityIndex, sourceIndex) =>
                  assignScore(randomValues, abilityIndex, sourceIndex)
                }
                race={race}
              />
            </div>
          )}

          {!isRolling && randomRolls.length === 0 && (
            <p className="py-8 text-center italic text-ink-soft">
              Roll the dice to generate scores you can assign.
            </p>
          )}
        </div>
      )}

      {method === "point-buy" && (
        <div>
          <div className="paper-panel mb-6 flex items-center justify-between gap-4 rounded-sm p-4">
            <div>
              <p className="font-display text-sm uppercase tracking-wide text-ink-soft">
                Point-cost ledger
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                Every ability starts at 8. Higher scores cost progressively more points.
              </p>
            </div>
            <div className="shrink-0 text-right" aria-live="polite">
              <p className="font-mono text-2xl text-oxblood-deep">{remaining}</p>
              <p className="font-mono text-xs text-ink-soft">points left</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {ABILITY_ORDER.map((key) => {
              const base = scores[key];
              const bonus = race?.bonuses[key] ?? 0;
              const total = base + bonus;
              const mod = abilityModifier(total);
              const increaseCost = spent - pointBuyCost(base) + pointBuyCost(base + 1);
              return (
                <div key={key} className="paper-panel rounded-sm p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm uppercase tracking-wide text-oxblood-deep">
                      {ABILITY_LABELS[key]}
                    </span>
                    <span className="font-mono text-xs text-ink-soft">
                      {formatModifier(mod)} mod
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      aria-label={`Decrease ${ABILITY_LABELS[key]}`}
                      onClick={() => adjust(key, -1)}
                      disabled={base <= POINT_BUY_MIN}
                      className="h-8 w-8 rounded-full border border-ink-soft/40 font-mono text-ink hover:bg-parchment-dim disabled:opacity-30"
                    >
                      −
                    </button>
                    <div className="flex-1 text-center">
                      <span className="font-mono text-xl">{base}</span>
                      {bonus !== 0 && (
                        <span className="ml-2 font-mono text-sm text-forest">
                          +{bonus} = {total}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label={`Increase ${ABILITY_LABELS[key]}`}
                      onClick={() => adjust(key, 1)}
                      disabled={base >= POINT_BUY_MAX || increaseCost > POINT_BUY_BUDGET}
                      className="h-8 w-8 rounded-full border border-ink-soft/40 font-mono text-ink hover:bg-parchment-dim disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
