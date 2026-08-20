"use client";

import {
  ABILITY_LABELS,
  ABILITY_ORDER,
  AbilityKey,
  Race,
  abilityModifier,
  formatModifier,
  pointBuyCost,
  POINT_BUY_BUDGET,
  POINT_BUY_MIN,
  POINT_BUY_MAX,
} from "@/lib/data";

export function AbilityScores({
  scores,
  setScores,
  race,
}: {
  scores: Record<AbilityKey, number>;
  setScores: (scores: Record<AbilityKey, number>) => void;
  race: Race | null;
}) {
  const spent = ABILITY_ORDER.reduce((sum, key) => sum + pointBuyCost(scores[key]), 0);
  const remaining = POINT_BUY_BUDGET - spent;

  function adjust(key: AbilityKey, delta: number) {
    const next = scores[key] + delta;
    if (next < POINT_BUY_MIN || next > POINT_BUY_MAX) return;
    const nextCost = spent - pointBuyCost(scores[key]) + pointBuyCost(next);
    if (nextCost > POINT_BUY_BUDGET) return;
    setScores({ ...scores, [key]: next });
  }

  return (
    <div>
      <div className="paper-panel rounded-sm p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="font-display text-sm uppercase tracking-wide text-ink-soft">
            Point-buy ledger
          </p>
          <p className="text-xs text-ink-soft mt-1">
            Every ability starts at 8. Raising a score costs more points the higher it climbs.
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl text-oxblood-deep">{remaining}</p>
          <p className="text-xs font-mono text-ink-soft">points left</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {ABILITY_ORDER.map((key) => {
          const base = scores[key];
          const bonus = race?.bonuses[key] ?? 0;
          const total = base + bonus;
          const mod = abilityModifier(total);
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
                  aria-label={`Decrease ${ABILITY_LABELS[key]}`}
                  onClick={() => adjust(key, -1)}
                  disabled={base <= POINT_BUY_MIN}
                  className="h-8 w-8 rounded-full border border-ink-soft/40 font-mono text-ink disabled:opacity-30 hover:bg-parchment-dim"
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
                  aria-label={`Increase ${ABILITY_LABELS[key]}`}
                  onClick={() => adjust(key, 1)}
                  disabled={base >= POINT_BUY_MAX}
                  className="h-8 w-8 rounded-full border border-ink-soft/40 font-mono text-ink disabled:opacity-30 hover:bg-parchment-dim"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
