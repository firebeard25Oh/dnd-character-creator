export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

export const ABILITY_ORDER: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

export interface Race {
  id: string;
  name: string;
  blurb: string;
  bonuses: Partial<Record<AbilityKey, number>>;
  speed: number;
  traits: string[];
}

export interface CharClass {
  id: string;
  name: string;
  blurb: string;
  hitDie: number;
  primaryAbility: AbilityKey;
  savingThrows: AbilityKey[];
  skillChoices: string[];
  numSkillChoices: number;
}

export interface Background {
  id: string;
  name: string;
  blurb: string;
  skills: string[];
  feature: string;
}

export const RACES: Race[] = [
  {
    id: "human",
    name: "Human",
    blurb: "Adaptable and ambitious, found in every corner of every land.",
    bonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    speed: 30,
    traits: ["One extra language of your choice"],
  },
  {
    id: "elf",
    name: "Elf",
    blurb: "Graceful and long-lived, with keen senses and a bond to magic.",
    bonuses: { dex: 2 },
    speed: 30,
    traits: ["Darkvision 60 ft.", "Advantage on saves vs. being charmed", "Doesn't need to sleep"],
  },
  {
    id: "dwarf",
    name: "Dwarf",
    blurb: "Stout and hardy, at home in mountain halls and deep tunnels.",
    bonuses: { con: 2 },
    speed: 25,
    traits: ["Darkvision 60 ft.", "Resistance to poison damage", "Trained with battleaxes and warhammers"],
  },
  {
    id: "halfling",
    name: "Halfling",
    blurb: "Small, nimble, and famously lucky.",
    bonuses: { dex: 2 },
    speed: 25,
    traits: ["Reroll a natural 1 on attacks, checks, or saves (once)", "Can move through larger creatures' spaces"],
  },
  {
    id: "dragonborn",
    name: "Dragonborn",
    blurb: "Draconic ancestry given proud, scaled form.",
    bonuses: { str: 2, cha: 1 },
    speed: 30,
    traits: ["Breath weapon (elemental damage)", "Resistance to your draconic damage type"],
  },
  {
    id: "tiefling",
    name: "Tiefling",
    blurb: "Marked by an infernal bloodline, sharp-witted and self-reliant.",
    bonuses: { cha: 2, int: 1 },
    speed: 30,
    traits: ["Darkvision 60 ft.", "Resistance to fire damage", "Knows the Thaumaturgy cantrip"],
  },
];

export const CLASSES: CharClass[] = [
  {
    id: "fighter",
    name: "Fighter",
    blurb: "A master of weapons and armor, built to lead the front line.",
    hitDie: 10,
    primaryAbility: "str",
    savingThrows: ["str", "con"],
    skillChoices: ["Acrobatics", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"],
    numSkillChoices: 2,
  },
  {
    id: "wizard",
    name: "Wizard",
    blurb: "A scholar of arcane secrets, powerful but fragile.",
    hitDie: 6,
    primaryAbility: "int",
    savingThrows: ["int", "wis"],
    skillChoices: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"],
    numSkillChoices: 2,
  },
  {
    id: "rogue",
    name: "Rogue",
    blurb: "Quick, quiet, and always one step ahead.",
    hitDie: 8,
    primaryAbility: "dex",
    savingThrows: ["dex", "int"],
    skillChoices: [
      "Acrobatics",
      "Athletics",
      "Deception",
      "Insight",
      "Intimidation",
      "Investigation",
      "Perception",
      "Persuasion",
      "Sleight of Hand",
      "Stealth",
    ],
    numSkillChoices: 4,
  },
  {
    id: "cleric",
    name: "Cleric",
    blurb: "A conduit for divine power, part healer and part crusader.",
    hitDie: 8,
    primaryAbility: "wis",
    savingThrows: ["wis", "cha"],
    skillChoices: ["History", "Insight", "Medicine", "Persuasion", "Religion"],
    numSkillChoices: 2,
  },
  {
    id: "ranger",
    name: "Ranger",
    blurb: "A hunter and tracker at home in the wild.",
    hitDie: 10,
    primaryAbility: "dex",
    savingThrows: ["str", "dex"],
    skillChoices: [
      "Animal Handling",
      "Athletics",
      "Insight",
      "Investigation",
      "Nature",
      "Perception",
      "Stealth",
      "Survival",
    ],
    numSkillChoices: 3,
  },
  {
    id: "bard",
    name: "Bard",
    blurb: "A performer whose words and music carry real magic.",
    hitDie: 8,
    primaryAbility: "cha",
    savingThrows: ["dex", "cha"],
    skillChoices: [
      "Athletics",
      "Deception",
      "History",
      "Insight",
      "Intimidation",
      "Investigation",
      "Persuasion",
      "Sleight of Hand",
    ],
    numSkillChoices: 3,
  },
];

export const BACKGROUNDS: Background[] = [
  {
    id: "acolyte",
    name: "Acolyte",
    blurb: "Raised in service to a temple, comfortable with ritual and doctrine.",
    skills: ["Insight", "Religion"],
    feature: "Shelter of the Faithful — temples of your faith will provide free healing and lodging.",
  },
  {
    id: "criminal",
    name: "Criminal",
    blurb: "A history of breaking the law, and a network to show for it.",
    skills: ["Deception", "Stealth"],
    feature: "Criminal Contact — a reliable, anonymous contact for illicit information and dealings.",
  },
  {
    id: "sage",
    name: "Sage",
    blurb: "A lifetime spent studying and copying texts in search of knowledge.",
    skills: ["Arcana", "History"],
    feature: "Researcher — you know where to find lore, even if you don't know it yourself.",
  },
  {
    id: "soldier",
    name: "Soldier",
    blurb: "Trained for war, whether by conscription, ambition, or necessity.",
    skills: ["Athletics", "Intimidation"],
    feature: "Military Rank — soldiers of your former army recognize your authority and defer to you.",
  },
];

export const POINT_BUY_BUDGET = 27;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 15;

export function pointBuyCost(score: number): number {
  const costs: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
  return costs[score] ?? 0;
}

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}
