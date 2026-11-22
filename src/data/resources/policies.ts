import type { ResourcePriceRules, ResourceQuestion } from './types';
import { bw } from './source';

export const resourcePriceRules: ResourcePriceRules = {
  missiles: { poor: { numerator: 1, denominator: 2 }, poorRounding: 'up', superiorMultiplier: 3 },
  armor: { helmetAndBreastplate: { numerator: 1, denominator: 2 }, greavesAndLeggings: { numerator: 1, denominator: 3 },
    partRounding: 'up', poor: { numerator: 1, denominator: 2 }, poorRounding: 'up', superiorFullSuitMultiplier: 4 },
};

export const relationshipRules = {
  source: bw('Relationships', 93, 94),
  baseRps: { minor: 5, significant: 10, powerful: 15 },
  modifiers: { 'immediate-family': -2, 'other-family': -1, romantic: -2, forbidden: -1, hateful: -2 },
  minimumRps: 1,
  // Project representation: one family choice, not two simultaneous discounts.
  exclusiveFamilyChoices: ['immediate-family', 'other-family'],
  recommendedImportantRelationships: [1, 2], // advice, NOT a maximum
} as const;

export const propertyAccessRule = {
  source: bw('Property', 205),
  textThresholdRps: 40, textComparison: 'greater-than', starredTierStartsAtRps: 40,
  // Source labels include references outside the current lifepath catalog.
  // Resolve explicitly at engine integration; never match decorated UI names.
  eligibleLifepathNames: ['Noble Born', 'Minister', 'Town Official', 'Merchant', 'Magnate', 'Steward',
    'Master of Horse', 'Master of Hounds', 'Bailiff', 'Justiciar', 'Coroner', 'Constable', 'Treasurer', 'Bishop', 'Abbot'],
  questionId: 'property-threshold',
} as const;

export const startingAbilityRules = {
  source: bw('Resources and Circles Abilities', 97),
  resourcesDivisor: 15, resourcesRounding: 'down',
  grayResourcesExponentCost: 5, grayResourcesRequiresGmPermission: true,
  circlesWillDivisor: 2, circlesRounding: 'down', circlesMinimum: 1, circlesShade: 'will',
  circlesQualifyingSpendThresholdRps: 50, circlesBonus: 1,
  rawSoClose: { maximumShortfallRps: 2, allRpsSpent: true },
  manualRoundUp: { default: false, rounding: 'up', budgetDelta: 0, decision: 'D-035' },
} as const;

export const resourceQuestions: readonly ResourceQuestion[] = [
  { id: 'superior-armor-parts', source: bw('Armor', 202, 203),
    observation: 'Superior price is four times a full suit; individual-piece pricing does not specify how to apply it.',
    recommendation: 'Keep superior partial-piece prices unknown. Review four times the piece versus a full-suit charge; do not choose silently.' },
  { id: 'poor-armor-parts', source: bw('Armor; Stray Resource Points', 96, 202, 203),
    observation: 'Order of quality/part rounding is not explicit; the p. 96 gambeson prose and example differ.',
    recommendation: 'Use confirmed full-suit costs. Keep poor partial costs unknown pending a rounding decision; do not let a stray-point example replace the price table.' },
  { id: 'armor-half-pieces', source: bw('Mixing and Customizing Armor', 479, 480),
    observation: 'Half sleeves and leggings change protection and weight; no new resource-point price or refund is stated.',
    recommendation: 'Represent customization separately. Do not infer half cost. A bought suit may trade down pieces; no automatic refund.' },
  { id: 'property-threshold', source: bw('Property', 205),
    observation: 'The 40-rp tier is starred, but prose restricts spending more than 40. Per-item versus aggregate spending and unstarred ships are not explicit.',
    recommendation: 'Require contextual review of property spending until policy is agreed. Preserve price, star and exception list; do not block only starred entries.' },
  { id: 'arms-composition', source: bw('Gear; Arms', 93, 202),
    observation: 'Arms supplies idiom-appropriate hand weapons with examples, but no numerical limit or exhaustive allowed set.',
    recommendation: 'D-034 reviewed bundle contents, no per-included-weapon charge and no unlimited arsenal. Appendix profiles do not define separate purchases.' },
  { id: 'weapon-modification-stacking', source: bw('Arms; Miscellaneous Weapon Gear', 202, 555),
    observation: 'Individual applicability is printed. Repeated beaks and simultaneous spiked/weighted pommels have no explicit combination rule.',
    recommendation: 'Retain item-targeted charges. Review combinations, repeat installations and weapons with built-in profiles; do not infer either universal compatibility or a ban.' },
  { id: 'relationship-combinations', source: bw('Relationships', 93, 94),
    observation: 'The cousin-and-hatred example establishes additive discounts. All possible fictional combinations are not enumerated.',
    recommendation: 'Use one family choice and boolean other modifiers; sum applicable discounts then clamp at 1. Flag contradictory fiction for review, not an invented universal incompatibility matrix.' },
  { id: 'companion-limits', source: bw('Bodyguards, Squires and Apprentices', 96),
    observation: 'Companion costs 10, has two fewer lifepaths than the PC limit and a lower exponent cap (6 to 5 example). Tiny or unspecified campaign limits are not handled.',
    recommendation: 'No relationship discounts. Require a fully burned linked character, reciprocal 10-rp relationship and own gear. Diagnose missing campaign limits rather than manufacture a character.' },
  { id: 'wife-grants', source: bw('Country Wife; Village Wife; City Wife', 164, 169, 177),
    observation: 'Half/half/quarter husband-derived resource grants lack explicit resource rounding; unresolved husband choices leave the budget incomplete.',
    recommendation: 'Reuse WifeDerivedGrant and preserve the incomplete budget diagnostic. D-013 repeat rounding alone does not decide wife-grant rounding or ordering.' },
  { id: 'outlaw-pools', source: bw('Outlaw', 200, 339),
    observation: 'City/Noble/Religious-derived resources may be spent but remain inaccessible until the trait is voted off. Other resources are normal.',
    recommendation: 'Preserve funding-pool provenance and access state. Resolve how locked assets participate in starting projections and mixed-funded purchases before automation.' },
  { id: 'spell-price-discrepancies', source: bw('Purchasing Spells; Sorcery Spells', 205, 207, 210, 211, 212, 213, 219, 221, 223),
    observation: 'Several printed prices disagree with the generic obstacle-based guidance.',
    recommendation: 'Use explicit printed prices for this catalog. General formula is for custom pricing, not correction of published entries.' },
  { id: 'shield-standalone', source: bw('Armor; Shields', 203, 480),
    observation: 'An armor kit can include a shield without added cost; no standalone Human shield price is printed.',
    recommendation: 'Allow an included shield only through an armor parent. Keep standalone pricing unknown, not zero.' },
  { id: 'property-circles-inclusion', source: bw('Starting Circles Bonus; Workshop; Herd; Rent', 97, 204, 205),
    observation: 'Workshop, herd and rent explicitly count as property when factoring Resources. Circles separately specifies property, not gear; cross-application of that reclassification is not explicit.',
    recommendation: 'Resources inclusion is confirmed. Treat Circles inclusion as unresolved until an interpretation is accepted; do not silently infer it from ownership or a UI category.' },
  { id: 'social-trait-interactions', source: bw('Multiple Reputations and Affiliations; Keys to the Church; Lesson of One', 96, 331, 332),
    observation: 'The purchase maximum is three of each; traits may grant or modify social benefits without paid rps.',
    recommendation: 'Keep granted dice and paid acquisitions separate. Only actual qualifying rps enter p. 97 arithmetic; audit trait-specific combinations in M3-A2.' },
];
