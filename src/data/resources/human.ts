import type { ArmorPiece, ResourceCost, ResourceDefinition, ResourceQuality } from './types';
import { bw, fixed, noAccounting, propertyAccounting, unknown } from './source';
import { relationshipRules } from './policies';

const base = (id: string, sourceName: string, pages: number[]): Omit<ResourceDefinition, 'price' | 'note'> => ({
  id: `human.resource.${id}`, sourceName, stockIds: ['human'], category: 'gear',
  source: bw(sourceName, ...pages), accountingSource: bw('Starting Resources; Starting Circles Bonus', 97),
  accounting: noAccounting, constraints: [], configuration: 'plain',
});

const missiles: readonly [string, string, number][] = [
  ['throwing-weapons', 'Throwing Weapons', 3], ['hunting-bow', 'Hunting Bow', 5],
  ['great-bow', 'Great Bow', 10], ['crossbow', 'Crossbow', 7],
  ['heavy-crossbow', 'Heavy Crossbow', 12], ['pistol', 'Pistol', 15], ['arquebus', 'Arquebus', 20],
];
const physicalWeaponParents = ['human.resource.arms', ...missiles.map(([id]) => `human.resource.${id}`)];
const armors: readonly [string, string, number][] = [
  ['gambeson', 'Gambeson', 3], ['reinforced-leather', 'Reinforced Leather', 6],
  ['light-mail', 'Light Mail', 10], ['heavy-mail', 'Heavy Mail', 15],
  ['plated-mail', 'Plated Mail', 20], ['full-plated-mail', 'Full Plated Mail', 50],
];
export const humanArmorIds = armors.map(([id]) => `human.resource.${id}`);

// Only confirmed formulas are expanded; this is static catalog construction.
function armorCosts(full: number, quality: ResourceQuality): Readonly<Record<ArmorPiece, ResourceCost>> {
  const part = (divisor: number) => quality === 'run-of-the-mill'
    ? fixed(Math.ceil(full / divisor), 'derived')
    : unknown(quality === 'poor' ? 'poor-armor-parts' : 'superior-armor-parts');
  return {
    suit: quality === 'run-of-the-mill' ? fixed(full) : fixed(quality === 'poor' ? Math.ceil(full / 2) : full * 4, 'derived'),
    helmet: part(2), breastplate: part(2), greaves: part(3), leggings: part(3),
    'half-sleeves': unknown('armor-half-pieces'), 'half-leggings': unknown('armor-half-pieces'),
  };
}

const gearRows: readonly [string, string, number, number, string][] = [
  ['riding-mount', 'Riding Mount or Pack Animal', 5, 203, 'Basic riding tack accompanies the purchase (p. 93). Not a property contribution.'],
  ['warhorse', 'Warhorse (Courser)', 12, 203, 'Battle-trained mount. Animal stats and use remain outside M3.'],
  ['clothes', 'Clothes', 1, 203, 'Everyday wardrobe appropriate to station, not one outfit.'],
  ['traveling-gear', 'Traveling Gear', 1, 203, 'Appropriate road essentials including rope; contents are reviewed with the GM.'],
  ['shoes', 'Shoes', 1, 203, 'Ordinary footwear.'],
  ['personal-effects', 'Personal Effects', 1, 204, 'Sentimental personal belongings; describe the chosen objects.'],
  ['finery', 'Finery', 5, 204, 'Special-occasion wardrobe appropriate to station, not one garment.'],
  ['skill-toolkit', 'Skill Toolkit', 8, 204, 'Specify the skill and appropriate tools. Consumable refills and assistance rules belong to play.'],
  ['companion-animal', 'Companion Animal', 3, 204, 'For example a dog, cat or falcon. Not a relationship or property contribution.'],
];

// Separate alternatives have stable IDs, even when the book groups their price.
// Star is retained independently of the unresolved >40 rule, including ships.
export const humanPropertyRows: readonly [id: string, name: string, rps: number, starred: boolean][] = [
  ['leaky-shack', 'Leaky Shack', 1, false], ['small-cottage', 'Small Cottage', 3, false],
  ['house', 'House', 10, false], ['cottage-industry', 'Cottage Industry', 10, false],
  ['villa', 'Villa', 15, false], ['farm', 'Farm', 15, false], [ 'knights-fee', "Knight's Fee", 15, false],
  ['small-business', 'Small Business', 20, false], ['moderate-business', 'Moderate-sized Business', 30, false],
  ['manor', 'Manor', 40, true], ['estate', 'Estate', 40, true], ['urban-hotel', 'Urban Hotel', 40, true],
  ['well-paid-position', 'Well-paid Position', 45, true],
  ['successful-small-business', 'Successful Small Business', 60, true], ['large-business', 'Large Business', 60, true], ['keep', 'Keep', 60, true],
  ['fortress', 'Fortress', 75, true], ['moderate-estate', 'Moderate-sized Estate', 75, true],
  ['castle-with-town', 'Castle with Attendant Town', 90, true], ['large-estate', 'Large Estate', 90, true],
  ['palace', 'Palace', 105, true], ['government-position', 'Government Position in a Prosperous Town', 105, true],
  ['rowboat', 'Rowboat', 5, false], ['skiff', 'Skiff', 5, false], ['longboat', 'Longboat', 10, false],
  ['junk', 'Junk', 15, false], ['felucca', 'Felucca', 30, false], ['carrack', 'Carrack', 60, false],
  ['caravel', 'Caravel', 75, false], ['treasure-ship', 'Treasure Ship', 105, false],
];

const arrowHeads: readonly [string, string][] = [
  ['bodkin-head', 'Bodkin Head'], ['leaf-head', 'Leaf Head'], ['frog-crotch', 'Frog Crotch'],
  ['blunt-head', 'Blunt Head'], ['barbed-tip', 'Barbed Tip'],
];
const boltHeads: readonly [string, string][] = [
  ['mallet-head', 'Mallet Head'], ['fisted-bolt', 'Fisted Bolt'], ['spear-tip', 'Spear Tip'],
];

export const humanPurchases: readonly ResourceDefinition[] = [
  { ...base('arms', 'Arms', [202]), configuration: 'arms',
    price: { kind: 'quality', baseRps: 5, calculation: 'printed-tiers', costs: { poor: fixed(3), 'run-of-the-mill': fixed(5), superior: fixed(20) } },
    constraints: [{ kind: 'review', questionId: 'arms-composition' }],
    note: 'One idiom-appropriate hand-weapon bundle. Each declared physical weapon has its own identity; no separate charge for included weapons (D-034).' },
  ...missiles.map(([id, name, rps]): ResourceDefinition => ({
    ...base(id, name, [202]), configuration: 'missile',
    price: { kind: 'quality', baseRps: rps, calculation: 'missile-quality',
      costs: { poor: fixed(Math.ceil(rps / 2), 'derived'), 'run-of-the-mill': fixed(rps), superior: fixed(rps * 3, 'derived') } },
    note: 'Includes adequate standard ammunition. Poor: half rounded up; superior: three times normal. Special head types are separate purchases.',
  })),
  ...armors.map(([id, name, rps]): ResourceDefinition => ({
    ...base(id, name, [202, 203, 479, 480]), configuration: 'armor',
    price: { kind: 'armor', fullSuitRps: rps, costs: { poor: armorCosts(rps, 'poor'),
      'run-of-the-mill': armorCosts(rps, 'run-of-the-mill'), superior: armorCosts(rps, 'superior') } },
    includedOptions: ['human.resource.shield-in-kit'],
    note: 'Suit includes helmet, arms, chest and legs. Individual full pieces have printed fractions. Lighter substitutions are allowed; heavier additions are purchased. No invented refund or half-piece discount.',
  })),
  ...gearRows.map(([id, name, rps, page, note]): ResourceDefinition => ({
    ...base(id, name, [202, page]), price: fixed(rps), note,
    configuration: id === 'skill-toolkit' ? 'skill-kit' : 'plain',
  })),
  { ...base('shield-in-kit', 'Shield (included in armor kit)', [203, 480]),
    price: { kind: 'included', parentDefinitionIds: humanArmorIds },
    note: 'Optional selected component of an armor kit, not an automatic grant or a repeatable free standalone shield.' },
  { ...base('shield-standalone', 'Shield (standalone)', [203, 480]),
    price: unknown('shield-standalone'), note: 'Reference-only purchase option: no printed standalone price.' },
  { ...base('cash', 'Cash', [202, 204]), category: 'cash', price: fixed(6), grants: { cashDice: 1 },
    note: 'Grants one expendable cash die, not a Resources exponent, property, or six cash dice.' },
  { ...base('workshop', 'Workshop', [202, 204]), configuration: 'skill-kit', price: fixed(20),
    accounting: { resources: true, circles: { questionId: 'property-circles-inclusion' } }, accountingSource: bw('Workshop; Starting Circles Bonus', 204, 97),
    note: 'Large skill toolkit with suitable premises; explicitly counts as property. Multiple helpers are a play effect.' },
  { ...base('herd', 'Herd of Animals', [202, 204]), price: fixed(20),
    accounting: { resources: true, circles: { questionId: 'property-circles-inclusion' } }, accountingSource: bw('Herd of Animals; Starting Circles Bonus', 204, 97),
    constraints: [{ kind: 'herd-eligibility', skillId: 'animal-husbandry', lifepathNames: ['Master of Horses', 'Merchant', 'Magnate'] }],
    note: 'Appropriate herd; Animal Husbandry skill OR one listed lifepath. Printed Master of Horses differs from Property wording Master of Horse.' },
  { ...base('rent', 'Rent', [202, 205]), category: 'property', price: fixed(5),
    accounting: { resources: true, circles: { questionId: 'property-circles-inclusion' } }, accountingSource: bw('Rent; Starting Circles Bonus', 205, 97),
    note: 'Leased dwelling/land; counts as property and an Ob 2 Resources maintenance test. Maintenance is not another burning purchase.' },
  ...humanPropertyRows.map(([id, name, rps, starred]): ResourceDefinition => ({
    ...base(id, name, [205]), category: 'property', price: fixed(rps), accounting: propertyAccounting,
    printedPropertyStar: starred,
    // All property participates in unresolved aggregate/per-item threshold review.
    constraints: [{ kind: 'review', questionId: 'property-threshold' }], propertyBenefits: { staff: 'as-appropriate' },
    note: `${starred ? 'Starred' : 'Unstarred'} printed price. Appropriate staff, buildings and accoutrements; no other free catalog purchases.`,
  })),
  ...(['spiked-pommel', 'weighted-pommel', 'beak'] as const).map((id): ResourceDefinition => ({
    ...base(id, { 'spiked-pommel': 'Spiked Pommel', 'weighted-pommel': 'Weighted Pommel', beak: 'Beak' }[id], [202, 555]),
    configuration: 'weapon-modification', price: { kind: 'target-quality', costs: { poor: fixed(1), 'run-of-the-mill': fixed(1), superior: fixed(4) } },
    additions: { target: 'physical-weapon', parentDefinitionIds: physicalWeaponParents,
      ...id === 'beak' ? { weaponKinds: ['polearm', 'axe', 'spear'] as const } : {} },
    constraints: [{ kind: 'review', questionId: 'weapon-modification-stacking' }],
    note: 'Charge per modification per physical weapon; quality comes from that weapon. Pommels: any weapon in p. 555 wording; extended missile mounting needs review, not an invented price.',
  })),
  ...[...arrowHeads.map(r => [...r, 'arrow', 558] as const), ...boltHeads.map(r => [...r, 'bolt', 557] as const)].map(([id, name, ammunitionKind, page]): ResourceDefinition => ({
    ...base(id, name, [202, page]), configuration: 'ammunition', price: fixed(1),
    additions: { target: 'missile-purchase', ammunitionKind,
      parentDefinitionIds: (ammunitionKind === 'arrow' ? ['hunting-bow', 'great-bow'] : ['crossbow', 'heavy-crossbow']).map(p => `human.resource.${p}`) },
    note: 'One rp per special head type, as many of that type as needed. No per-projectile charge or unprinted quality multiplier.',
  })),
  ...([['hunting-head', 'Hunting Head', 'arrow', 558], ['helmeted-bolt', 'Helmeted', 'bolt', 557]] as const).map(([id, name, ammunitionKind, page]): ResourceDefinition => ({
    ...base(id, name, [202, page]), configuration: 'ammunition',
    price: { kind: 'included', parentDefinitionIds: (ammunitionKind === 'arrow' ? ['hunting-bow', 'great-bow'] : ['crossbow', 'heavy-crossbow']).map(p => `human.resource.${p}`) },
    note: 'Standard head profile already covered by adequate ammunition, not a special-head surcharge.',
  })),
  { ...base('relationship', 'Relationship', [93, 94]), category: 'relationship', configuration: 'relationship',
    accounting: { resources: false, circles: true }, price: { kind: 'relationship',
      baseRps: relationshipRules.baseRps, modifiers: relationshipRules.modifiers, minimumRps: 1 },
    constraints: [{ kind: 'review', questionId: 'relationship-combinations' }],
    note: 'Name and describe a recurring important NPC; significance, family, romance, forbidden and hostile ties affect price. One or two is advice, not a hard cap.' },
  { ...base('companion', 'Bodyguard, Squire or Apprentice', [96]), category: 'relationship', configuration: 'companion',
    accounting: { resources: false, circles: true }, price: fixed(10),
    constraints: [{ kind: 'companion-character', fewerLifepaths: 2, lowerExponentCap: true, reciprocalRelationshipRps: 10, ownGear: true },
      { kind: 'review', questionId: 'companion-limits' }],
    note: 'Fixed ten rps, no ordinary relationship discounts. Linked NPC must be fully created and pay for a reciprocal relationship and their own gear.' },
  { ...base('affiliation', 'Affiliation', [94, 95, 96]), category: 'affiliation', configuration: 'social',
    accounting: { resources: true, circles: false },
    price: { kind: 'rating', tiers: [{ dice: 1, rps: 10, scope: 'small/local/specialized' }, { dice: 2, rps: 25, scope: 'large/regional/expansive' }, { dice: 3, rps: 50, scope: 'national/powerful/ruling' }] },
    constraints: [{ kind: 'social-limit', maximumPurchased: 3, distinctOrganizations: true }],
    note: 'Specific one-sentence organization and standing; within the character\'s Circles. Keep bonus dice separate from base Circles.' },
  { ...base('reputation', 'Reputation', [95, 96]), category: 'reputation', configuration: 'social',
    accounting: { resources: true, circles: false },
    price: { kind: 'rating', tiers: [{ dice: 1, rps: 7, scope: 'local/minor' }, { dice: 2, rps: 25, scope: 'regional/notable' }, { dice: 3, rps: 45, scope: 'national/major' }] },
    constraints: [{ kind: 'social-limit', maximumPurchased: 3, distinctOrganizations: true }],
    note: 'Describe the reputation and the community/area where it applies; no automatic addition to base Circles.' },
  { ...base('gang-or-crew', 'Gangs and Crews', [96]), category: 'composite', configuration: 'gang',
    price: { kind: 'sum-children', childDefinitionIds: ['human.resource.relationship', 'human.resource.affiliation', 'human.resource.reputation'], overheadRps: 0 },
    note: 'Relationship to senior member (or second-in-command if PC leads), affiliation with group and reputation within it. Children carry charges and accounting; container must never double-count them.' },
];
