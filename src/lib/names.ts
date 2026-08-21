const GIVEN_NAMES = [
  "Aelar",
  "Brynna",
  "Caelan",
  "Daelis",
  "Elowen",
  "Fendrel",
  "Garrick",
  "Ilyra",
  "Kaelen",
  "Liora",
  "Merric",
  "Nyssa",
  "Orin",
  "Perrin",
  "Riven",
  "Sable",
  "Serrin",
  "Thalia",
  "Vaelis",
  "Wren",
] as const;

const FAMILY_NAMES = [
  "Amberfall",
  "Blackbriar",
  "Dawnwhisper",
  "Deepdelver",
  "Emberforge",
  "Evenwood",
  "Frostmantle",
  "Goldleaf",
  "Hawkwinter",
  "Ironfoot",
  "Lightweaver",
  "Moonbrook",
  "Nightbrook",
  "Oakenshield",
  "Ravencrest",
  "Silverstring",
  "Stormward",
  "Thornvale",
  "Wildheart",
  "Windmere",
] as const;

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

export function generateFantasyName(
  previousName = "",
  random: () => number = Math.random
): string {
  const givenName = pick(GIVEN_NAMES, random);
  const familyName = pick(FAMILY_NAMES, random);
  const generatedName = `${givenName} ${familyName}`;

  if (generatedName !== previousName) return generatedName;

  const nextFamilyIndex = (FAMILY_NAMES.indexOf(familyName) + 1) % FAMILY_NAMES.length;
  return `${givenName} ${FAMILY_NAMES[nextFamilyIndex]}`;
}
