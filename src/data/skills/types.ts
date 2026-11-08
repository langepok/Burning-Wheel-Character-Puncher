import type { SkillId, StockId } from '../catalog/types';

export type SkillSource =
  | { readonly kind: 'audit-packet'; readonly url: string; readonly section: string;
      readonly pages?: { readonly printed: readonly number[]; readonly pdf: readonly number[] } }
  | { readonly kind: 'task-brief'; readonly document: string; readonly section: string };

export type RootAbility = { readonly kind: 'stat' | 'attribute'; readonly id: string };
export type AbilityReference = RootAbility | { readonly kind: 'skill'; readonly id: SkillId };
export type FixedRoot =
  | { readonly kind: 'single'; readonly ability: RootAbility }
  | { readonly kind: 'combined'; readonly abilities: readonly [RootAbility, RootAbility] };
export type RootRule = FixedRoot | {
  readonly kind: 'conditional';
  readonly cases: readonly { readonly stockIds: readonly StockId[]; readonly root: FixedRoot }[];
  readonly otherwise: FixedRoot;
};

/** Canonical printed labels; notably Seafaring and Seafarer are distinct. */
export type SkillType = 'Academic' | 'Artisan' | 'Craftsman' | 'Martial' | 'Martial Training' | 'Physical' |
  'Medicinal' | 'Military' | 'Military Training' | 'Sorcerous' | 'Special' | 'Wise' |
  'Social' | 'Peasant' | 'Forester' | 'Artist' | 'Musical' | 'School of Thought' | 'Seafaring' | 'Seafarer';

/** A composition contains at least two operands; no executable predicates. */
export type Operands<T> = readonly [T, T, ...T[]];

export type TrainingBehavior =
  | { readonly kind: 'exponent'; readonly rootPurpose: 'opening'; readonly advancement: 'standard' }
  | { readonly kind: 'training'; readonly rootUsage?: 'aptitude-only';
      readonly learningMethods: readonly ('practice' | 'instruction')[];
      readonly exponent: 'none'; readonly advancement: 'none'; readonly openingCost: 2 };

export type RollBehavior =
  | { readonly kind: 'standard' }
  | { readonly kind: 'open-ended'; readonly basis: 'magical' | 'attribute-root' }
  | { readonly kind: 'conditional'; readonly whenRoot: RootAbility;
      readonly then: 'open-ended'; readonly otherwise: 'standard' };

/** Source-defined manufacturing subjects, with no runtime category inference. */
export interface CraftingSubjectContext {
  readonly kind: 'crafting-subject';
  readonly operation: 'manufacturing';
  readonly anyOf: Operands<{ readonly category: string }>;
}
/** Attire and mismatch leaves describe the skill user relative to their environment.
 * Stock mismatch preserves the source race/crowd comparison without fixing a stock. */
export type SkillContext =
  | { readonly kind: 'music-mood-suitability'; readonly relation: 'suitable' }
  | CraftingSubjectContext
  | { readonly kind: 'test-context'; readonly context: 'versus-test' | 'detailed-conflict' }
  | { readonly kind: 'force-attribute'; readonly quantifier: 'majority-of-troops'; readonly attributeId: string }
  | { readonly kind: 'force-classification'; readonly classification: 'non-dwarven' }
  | { readonly kind: 'force-contains-mount'; readonly mountKind: 'war-mount' | 'riding-mount' | 'pack-animal' }
  | { readonly kind: 'force-contains-trait'; readonly traitId: string }
  | { readonly kind: 'terrain'; readonly terrain: 'mountains' | 'underground' | 'heavily-wooded-countryside' }
  | { readonly kind: 'season'; readonly season: 'winter' }
  | { readonly kind: 'area-condition'; readonly condition: 'enemy-scorched-earth' }
  | { readonly kind: 'prior-test-in-context'; readonly skillId: SkillId;
      readonly area: 'same-countryside'; readonly within: 'last-resources-maintenance-cycle' }
  | { readonly kind: 'outside-subsystem'; readonly subsystem: IntegrationTag }
  | { readonly kind: 'target-belief'; readonly constraint: 'prevents-disclosure-of-sought-information' }
  | { readonly kind: 'attire'; readonly attire: 'garish' | 'inappropriate' }
  | { readonly kind: 'social-station-mismatch'; readonly position: 'above' | 'below'; readonly relativeTo: 'appropriate-social-station' }
  | { readonly kind: 'regional-origin-mismatch'; readonly relativeTo: 'current-region' }
  | { readonly kind: 'stock-mismatch'; readonly relativeTo: 'target-crowd' }
  | { readonly kind: 'circumstance'; readonly circumstanceId: string }
  | { readonly kind: 'subject'; readonly subject: 'children' | 'great-wolves' | 'spiders' | 'rats-and-relatives' }
  | { readonly kind: 'activity'; readonly activity: 'potion-work' | 'wound-treatment' | 'hauling' | 'crafting' | 'pursuit' | 'travel' | 'field-maneuver' | 'reading' | 'writing' | 'tending-wounds-and-illness' | 'securing-a-person' }
  | { readonly kind: 'culture'; readonly cultureId: string }
  | { readonly kind: 'stock'; readonly stockId: StockId }
  | { readonly kind: 'target-trait'; readonly traitId: string }
  | { readonly kind: 'target-stock'; readonly stockId: StockId }
  | { readonly kind: 'target-culture'; readonly cultureId: string }
  | { readonly kind: 'target-origin'; readonly originId: string }
  | { readonly kind: 'allOf' | 'anyOf'; readonly conditions: Operands<SkillContext> };

export interface AvailabilityRestriction {
  readonly kind: 'stock-only';
  readonly stockIds: readonly StockId[];
  readonly scope: 'always' | 'character-burning';
}
export type OpeningRequirement = { readonly kind: 'known-skill'; readonly skillId: SkillId };
export type UseRequirement = {
  readonly kind: 'capability' | 'trait'; readonly id: string;
  // Summoning magic covers calling forth, binding and commanding spirits; academic use is separate.
  readonly use: 'aura-perception' | 'spell-casting' | 'summoning-magic';
};

export type ToolRequirement =
  | { readonly kind: 'none'; readonly expendable: false }
  | { readonly kind: 'generic' | 'traveling-gear' | 'workshop'; readonly expendable?: boolean }
  | { readonly kind: 'specific-item'; readonly item: string; readonly expendable?: boolean }
  | { readonly kind: 'allOf' | 'anyOf'; readonly requirements: Operands<ToolRequirement> }
  | { readonly kind: 'conditional'; readonly when: SkillContext;
      readonly then: ToolRequirement; readonly otherwise: ToolRequirement };

export type SkillReferenceTarget =
  | { readonly kind: 'skill'; readonly skillId: SkillId }
  | { readonly kind: 'unresolved-source-reference'; readonly sourceLabel: string;
      readonly probableTargetSkillId?: SkillId };
/** Curated categories, never inferred from names, prose or Skill Type labels. */
export type SkillSemanticCategory = 'melee-weapon' | 'ritual' | 'song' | 'musical-instrument';
export type ForkTarget = SkillReferenceTarget |
  { readonly kind: 'category'; readonly category: SkillSemanticCategory; readonly relevance: 'any' | 'appropriate' } |
  { readonly kind: 'skill-type'; readonly skillType: SkillType; readonly relevance: 'any' | 'appropriate' } |
  { readonly kind: 'skill-family'; readonly familyId: string; readonly relevance: 'any' | 'appropriate' } |
  { readonly kind: 'applicable-to-content' } |
  { readonly kind: 'allOf' | 'anyOf'; readonly targets: Operands<ForkTarget> };
export type ForkSuggestion = {
  readonly target: ForkTarget;
  readonly context?: SkillContext;
};
export interface ForkGuidance {
  readonly policy: 'guidance-not-whitelist';
  readonly manualContextualContributors: true;
  readonly suggestions: readonly ForkSuggestion[];
}

/** Describes a contributor's dice, not an executable reroll or roll-building function. */
export interface SpecialForkBehavior {
  readonly id: string;
  readonly target: { readonly kind: 'any-skill-except-types'; readonly excluded: readonly SkillType[] };
  readonly die: {
    readonly six: 'reroll-normally';
    readonly one: { readonly action: 'reroll'; readonly onFailure: { readonly subtractSuccesses: 1 } };
  };
  readonly alternative: { readonly kind: 'linked-test'; readonly usesSpecialForkDie: false };
  readonly source: readonly SkillSource[];
}

export interface SkillRollContributor {
  readonly sourceSkillId: SkillId;
  readonly role: 'fork';
  readonly behavior: { readonly kind: 'ordinary-fork' } |
    { readonly kind: 'special-fork'; readonly behaviorId: string };
  readonly source: readonly SkillSource[];
}

/** Only concrete obstacle-guidance sources; alternatives are not combined tests. */
export type ObstacleReferenceTarget = Extract<SkillReferenceTarget, { kind: 'skill' }> |
  { readonly kind: 'anyOf'; readonly targets: Operands<Extract<SkillReferenceTarget, { kind: 'skill' }>> };

export type SkillRelation =
  /** The owning skill is the source; this relation never inherits target metadata. */
  | { readonly kind: 'obstacle-reference'; readonly targets: ObstacleReferenceTarget; readonly context: SkillContext }
  | { readonly kind: 'same-mechanics' | 'includes-capability' | 'specialized-version';
      readonly target: AbilityReference; readonly context?: SkillContext }
  | { readonly kind: 'contextual-substitution' | 'replacement';
      readonly target: AbilityReference; readonly context: SkillContext }
  | { readonly kind: 'mechanics-reuse-with-additions'; readonly target: AbilityReference;
      /** Omitted when the additional effects have not yet been transcribed. */
      readonly additionalCapabilityIds?: readonly string[] };

export type SkillCapability =
  | { readonly kind: 'literacy'; readonly actions: readonly ('read' | 'write')[]; readonly context?: SkillContext }
  | { readonly kind: 'subsystem-capability'; readonly id: string; readonly integrationId: string };
export type ResourceInteraction = { readonly context?: SkillContext } & (
  | { readonly kind: 'recover-taxed-resources'; readonly cashDice?: never }
  | { readonly kind: 'produce-cash'; readonly cashDice?: number }
);
export type IntegrationTag = 'fight' | 'range-and-cover' | 'duel-of-wits' | 'injury' | 'resources' |
  'magic' | 'equipment' | 'mounted-combat' | 'military-campaign' | 'poisons' | 'ambush' | 'battlefield-communication';

/** Index/extension record only; subsystem execution is deliberately absent. */
interface SkillIntegrationIdentity {
  readonly id: string;
  readonly skillId: SkillId;
  readonly context?: SkillContext;
  readonly summary: string;
  readonly source: readonly SkillSource[];
}
/** Reference to the preceding creation stage; does not inherit or evaluate tools. */
export interface MagicBaseItemCreation {
  readonly stage: 'base-item-creation';
  readonly requiredMethod: { readonly kind: 'applicable-skill-song' };
  readonly follows: 'selected-skill-own-rules-and-tools';
  readonly obstacle?: { readonly kind: 'natural-obstacle-with-minimum'; readonly minimum: number };
  readonly requiredQuality?: 'highest-quality';
}
export interface MagicSpellSongTransfer {
  readonly after: 'base-item-creation';
  readonly follows: 'spell-song-own-rules';
  readonly attempts: 1;
  readonly effect: { readonly target: 'created-item'; readonly activeWhen: 'item-used' };
}
/** Valuation of the crafting result, never the character's Resources pool. */
export type CreatedItemValueModifier =
  | { readonly target: 'created-item'; readonly measure: 'resources-obstacle'; readonly delta: number }
  | { readonly target: 'created-item'; readonly measure: 'resources-value-dice'; readonly delta: number }
  /** Semantic value target is known; RAW omits its measurement unit. Never default to dice. */
  | { readonly target: 'created-item'; readonly measure: 'resources-value'; readonly delta: number;
      readonly unit: 'source-unspecified'; readonly source: readonly SkillSource[] };
export type CreatedItemValueEffect =
  | { readonly kind: 'automatic'; readonly modifier: CreatedItemValueModifier }
  | { readonly kind: 'optional-tradeoff'; readonly choiceTiming: 'before-roll';
      readonly modifier: Extract<CreatedItemValueModifier, { measure: 'resources-obstacle' }>;
      readonly cost: { readonly kind: 'crafting-obstacle-modifier'; readonly delta: number } };
export type MagicCreatedItemReference =
  | { readonly kind: 'enchanting-matrix'; readonly target: 'created-item' }
  | { readonly kind: 'antiphon-union'; readonly target: 'created-item'; readonly skillId: SkillId };
/** The crafted output's tool role, independent of the construction skill's tools. */
export interface CreatedEquipmentCapability {
  readonly kind: 'created-equipment-capability';
  readonly output: { readonly kind: 'created-equipment'; readonly equipmentKindId: string };
  readonly capability: { readonly kind: 'counts-as-tool'; readonly purpose: 'destroying-structures' };
}
/** A property acquired by the crafting result, not an intrinsic skill bonus. */
export interface EquipmentUseEffect {
  readonly target: { readonly kind: 'created-equipment'; readonly equipmentKindId: string };
  readonly effect: { readonly kind: 'advantage-dice'; readonly dice: number;
    readonly recipient: 'equipment-user'; readonly appliesTo: 'tests-using-equipment' };
  readonly acquisition: { readonly kind: 'crafting-obstacle-tradeoff'; readonly choice: 'optional';
    readonly obstacleDelta: number;
    /** Unspecified does not assert permission or prohibition to repeat. */
    readonly repeatability: 'single-tradeoff' | 'per-increment' | 'unspecified';
    readonly requiresSuccessfulCreation: true };
}
/** Ordinary quality categories remain external; this describes their manufacturing source. */
export interface CreatedEquipmentQuality {
  readonly kind: 'created-equipment-quality'; readonly outputKind: 'weapon';
  readonly superior: {
    readonly qualityRef: { readonly kind: 'external-equipment-quality'; readonly id: 'superior-quality-weapon' };
    readonly craftingObstacleAdjustment: number; readonly trigger: 'successful-manufacturing-test';
  };
  readonly poor: {
    readonly qualityRef: { readonly kind: 'external-equipment-quality'; readonly id: 'poor-quality-weapon' };
    readonly trigger: 'failed-manufacturing-test'; readonly genericFailureInteraction: 'unresolved';
  };
}

/** Source-shaped crafting options; costs are not arbitrary expressions. */
export type WeaponImprovement = { readonly kind: 'weapon-improvement'; readonly repeatability: 'once-per-physical-weapon' } & (
  | { readonly improvement: 'versus-armor'; readonly delta: number; readonly craftingObstacle: { readonly kind: 'current-weapon-va-plus-one' } }
  | { readonly improvement: 'balance-die'; readonly dice: number; readonly craftingObstacleAdjustment: number;
      readonly capabilityRef: { readonly kind: 'external-equipment-capability'; readonly id: 'balance-dice' } }
  | { readonly improvement: 'weapon-power'; readonly delta: number; readonly craftingObstacle: { readonly kind: 'current-weapon-power' } }
);
export interface WeaponImprovementOptions {
  readonly kind: 'weapon-improvement-options'; readonly target: 'physical-weapon'; readonly selection: 'independent-options';
  readonly options: readonly WeaponImprovement[];
}
/** Entry-specific results deliberately do not import global equipment-quality semantics. */
export interface SourceSpecificEquipmentQualities {
  readonly kind: 'source-specific-equipment-qualities'; readonly sourceSkillId: SkillId;
  readonly combination: 'source-unspecified';
  readonly reconciliation: { readonly kind: 'unresolved-source-conflict'; readonly auditId: string; readonly deferredTo: 'equipment-audit' };
  readonly options: readonly ({ readonly sourceLabel: string; readonly craftingObstacleAdjustment: number } & (
    | { readonly quality: 'dwarven-made'; readonly outputs: readonly ['armor', 'shield'];
        readonly effect: { readonly kind: 'source-specific-reroll'; readonly face: 1; readonly selection: 'one-rolled-one'; readonly recurrence: 'once' } }
    | { readonly quality: 'superior'; readonly outputs: readonly ['armor'];
        readonly effect: { readonly kind: 'source-specific-reroll'; readonly face: 1; readonly selection: 'all-rolled-ones'; readonly recurrence: 'every-applicable-roll' } }
  ))[];
}
/** Eligibility of the skill performing this crafting test, never an unrelated owned skill. */
export interface CraftingShadeRequirement {
  readonly kind: 'crafting-shade-requirement'; readonly outputShade: 'gray'; readonly requiredCraftingAbilityShade: 'gray';
  readonly ability: { readonly kind: 'effective-crafting-skill'; readonly source: 'owning-skill'; readonly snapshot: 'at-test' };
  readonly qualification: { readonly kind: 'anyOf'; readonly paths: readonly [
    { readonly kind: 'actual-skill-shade' },
    { readonly kind: 'temporary-shade-shift'; readonly source: { readonly kind: 'external-rule'; readonly subsystem: 'artha'; readonly id: 'temporary-epiphany' } },
  ] };
}

/** External spell-song source identities are not owned General skill records. */
export type EnchantmentComponent =
  | { readonly kind: 'training'; readonly skillId: SkillId }
  | { readonly kind: 'spell-song'; readonly subsystem: 'magic'; readonly sourceName: string };
export interface EquipmentResult {
  readonly target: { readonly kind: 'created-equipment'; readonly equipmentKindId: string };
  readonly acquisition: { readonly kind: 'enchantment-combination';
    readonly requires: { readonly kind: 'allOf'; readonly operands: Operands<EnchantmentComponent> } };
  readonly effect: { readonly kind: 'skill-test-dice-bonus'; readonly recipient: 'equipment-user';
    readonly skillId: SkillId; readonly dice: number };
}
export interface SustainedSpellReference {
  readonly actorRole: 'sorcerer'; readonly while: 'using-owning-skill';
  readonly permission: 'maintain-sustained-spells';
  readonly requiredRetest: { readonly kind: 'tax';
    readonly rules: { readonly kind: 'external-subsystem-rule'; readonly subsystem: 'magic'; readonly sourceName: string } };
}
export type PrizeObstacleReference = { readonly kind: 'same-as-prize-obstacle' };
export type WagerSettlementOutcome =
  | { readonly when: 'loser-resources-test-passed'; readonly recipient: 'winner';
      readonly effect: { readonly kind: 'resources-advancement-credit'; readonly obstacle: PrizeObstacleReference } }
  | { readonly when: 'loser-resources-taxed'; readonly recipient: 'winner';
      readonly effect: { readonly kind: 'cash-from-taxed-dice';
        readonly amount: { readonly kind: 'taxed-dice-count'; readonly role: 'loser' } } };
/** A closed descriptive settlement class, not executable branches or a scripting DSL. */
export interface WagerSettlement {
  readonly kind: 'wager-settlement';
  readonly roles: { readonly winner: 'versus-test-winner'; readonly loser: 'versus-test-loser' };
  readonly prize: { readonly measure: 'resources-obstacle'; readonly setBefore: 'versus-skill-test' };
  readonly loserResourcesTest: { readonly roller: 'loser'; readonly after: 'versus-skill-test'; readonly obstacle: PrizeObstacleReference };
  /** Independently conditioned facts. Array order implies neither execution nor exclusivity. */
  readonly outcomes: readonly WagerSettlementOutcome[];
}
/** Price effect of finding flaws, not a numeric Resources/cash/valuation modifier. */
export interface JudicialFineAssessment {
  readonly kind: 'judicial-fine-assessment';
  readonly output: { readonly kind: 'resources-obstacle'; readonly purpose: 'judicial-fine' };
  readonly determination: 'source-unspecified';
}

export interface AppraisedItemPriceReduction {
  readonly kind: 'appraised-item-price-reduction';
  readonly target: 'appraised-item';
  readonly basis: { readonly kind: 'identified-flaws' };
  readonly magnitude: 'source-unspecified';
}
/** Describes negotiation facts without a purchase or commerce evaluator. */
export interface PurchaseNegotiation {
  readonly kind: 'purchase-negotiation';
  readonly roles: readonly ['buyer', 'seller'];
  readonly test: { readonly kind: 'versus' };
  readonly subject: 'price-purchase-terms-and-contracts';
  readonly buyerObstacleAdjustment: { readonly kind: 'obstacle-modifier';
    readonly target: 'relevant-negotiation-obstacle'; readonly choice: 'optional'; readonly delta: number };
}
/** Resistance belongs to the created structure, not to an equipment user's skill. */
export interface StructureResistance {
  readonly kind: 'structure-resistance';
  readonly target: 'created-structure';
  readonly acquisition: { readonly kind: 'crafting-obstacle-tradeoff'; readonly choice: 'optional'; readonly obstacleDelta: number;
    readonly repeatability: 'single-tradeoff' | 'per-increment' | 'unspecified' };
  readonly effect: { readonly kind: 'obstacle-modifier'; readonly delta: number;
    readonly target: 'tests-against-created-structure'; readonly appliesTo: readonly ('alter' | 'destroy')[] };
}
/** Limited source-shaped duration, not an arithmetic expression language. */
export type ConsumableDuration =
  | { readonly kind: 'current-scene' | 'unspecified' }
  | { readonly kind: 'attribute-derived-duration'; readonly unit: 'hour'; readonly base: number;
      readonly subtract: { readonly kind: 'attribute'; readonly id: string }; readonly snapshot: 'current' };
export type ConsumableEffect =
  | { readonly kind: 'dice-bonus'; readonly dice: number;
      readonly scope: { readonly kind: 'next-ability-test'; readonly ability: RootAbility } }
  | { readonly kind: 'obstacle-modifier'; readonly delta: number;
      readonly scope: { readonly kind: 'skill-type-tests'; readonly skillType: SkillType }; readonly duration: ConsumableDuration }
  | { readonly kind: 'intoxication'; readonly condition: 'drunk';
      readonly modifier: { readonly kind: 'obstacle-modifier'; readonly delta: number; readonly scope: { readonly kind: 'all-tests' } };
      readonly duration: ConsumableDuration };
/** All dose/ability/effect recipients are the consumer, never the crafting actor. */
export interface CraftedConsumableEffect {
  readonly recipientRole: 'consumer';
  readonly target: 'crafted-consumable'; readonly caseSemantics: 'independent-source-conditions';
  readonly cases: readonly {
    readonly recipient: { readonly kind: 'stock' | 'not-stock'; readonly stockId: StockId };
    readonly dose: { readonly kind: 'full-draught' | 'mouthful' } |
      { readonly kind: 'consumed-quantity-threshold'; readonly unit: 'stein'; readonly comparison: 'at-least';
        readonly recipientAbility: RootAbility; readonly snapshot: 'current' };
    readonly repeat: 'once-active-non-stacking' | 'unspecified';
    readonly restorativeBenefit?: 'none';
    readonly effects: readonly [ConsumableEffect, ...ConsumableEffect[]];
  }[];
}

/** Product effects are not crafting-test modifiers or created-device Mark references. */
export type PoisonEffect =
  | { readonly kind: 'obstacle-penalty'; readonly delta: number; readonly scope: 'source-unspecified' }
  | { readonly kind: 'fixed-wound'; readonly severity: { readonly shade: 'black'; readonly exponent: number } };
export type PoisonPotency =
  | { readonly kind: 'sickening' | 'debilitating'; readonly craftingObstacle: number;
      readonly effect: Extract<PoisonEffect, { kind: 'obstacle-penalty' }> }
  | { readonly kind: 'deadly'; readonly craftingObstacle: number;
      readonly effect: Extract<PoisonEffect, { kind: 'fixed-wound' }> };
export interface PoisonDelivery {
  readonly kind: 'ingestion' | 'blade' | 'inhaled-vapor' | 'contact';
  readonly craftingObstacleDelta: number;
}
/** Scopes are the printed test categories, not inferred stat lists or Skill Types. */
export type PoisonTestScope = 'physical-tests' | 'martial-tests' | 'social-tests';
/** Distinct source products; no inferred cross-product combinations or exposure execution. */
export type CraftedPoisonProduct = { readonly kind: 'crafted-poison'; readonly craftingObstacle: number } & (
  | { readonly variant: 'stinging-nettling-contact'; readonly exposure: { readonly kind: 'skin-contact' };
      readonly outcomes: readonly [
        { readonly kind: 'condition'; readonly recipient: 'victim'; readonly condition: 'boils' },
        { readonly kind: 'test-obstacle-penalty'; readonly recipient: 'victim'; readonly amount: number;
          readonly scopes: readonly ['physical-tests', 'martial-tests', 'social-tests'];
          readonly duration: { readonly kind: 'scene'; readonly count: number } },
      ] }
  | { readonly variant: 'debilitating-ingested'; readonly exposure: { readonly kind: 'ingested' };
      readonly resistance: { readonly actor: 'victim'; readonly ability: { readonly kind: 'stat'; readonly id: 'forte' }; readonly obstacle: number };
      /** One resistance-test magnitude supplies both reductions; no floor or recovery policy. */
      readonly onResistanceFailure: { readonly magnitude: { readonly kind: 'margin-of-failure'; readonly source: 'resistance-test' };
        readonly effects: readonly [
          { readonly kind: 'reduce-health'; readonly recipient: 'victim'; readonly duration: 'permanent' },
          { readonly kind: 'reduce-health-maximum'; readonly recipient: 'victim'; readonly duration: 'permanent' },
        ] } }
  | { readonly variant: 'deadly-weapon';
      readonly application: { readonly kind: 'weapon-coating'; readonly allowedTargets: readonly ['blade', 'arrowhead'] };
      readonly exposure: { readonly kind: 'injected-by-hit'; readonly requiredHitResult: 'mark' };
      readonly delayedOutcome: {
        /** Exactly six plus victim Forte exchanges; not an arithmetic AST or computed duration. */
        readonly delay: { readonly kind: 'six-plus-target-forte'; readonly unit: 'exchange' };
        readonly outcome: { readonly kind: 'wound'; readonly recipient: 'victim';
          readonly severity: { readonly shade: 'black'; readonly exponent: number }; readonly quantity: number; readonly relation: 'additional' };
      } }
);
/** Independent potency/delivery and distinct products are mutually exclusive source forms. */
export type CraftedPoison = { readonly target: 'created-poison' } & (
  | { readonly potencies: readonly PoisonPotency[]; readonly deliveries: readonly PoisonDelivery[]; readonly products?: never }
  | { readonly products: readonly CraftedPoisonProduct[]; readonly potencies?: never; readonly deliveries?: never }
);

/** Governing skill/list access is distinct from individual spell ownership/state. */
export interface SpellListCasting {
  readonly kind: 'spell-list-casting';
  readonly spellListRef: { readonly kind: 'external-spell-list'; readonly subsystem: 'magic';
    readonly id: string; readonly sourceName: string };
  readonly obstacleSource: 'referenced-spell-list';
  readonly acquisition: { readonly kind: 'separate-purchase-or-learning' };
}

/** Catalog role relationships only; no Belief ids, text, catalog or runtime state. */
export interface FatePronouncement {
  readonly kind: 'fate-pronouncement'; readonly trigger: { readonly kind: 'test-success' };
  readonly pronouncement: { readonly actorRole: 'caster-player'; readonly permission: 'may-pronounce-target-fate' };
  readonly targetBeliefInspection: { readonly entityKind: 'belief'; readonly ownerRole: 'target';
    readonly readerRole: 'caster-player'; readonly permission: 'may-inspect' };
  readonly targetBeliefReference: { readonly entityKind: 'belief'; readonly ownerRole: 'target'; readonly selection: 'manual' };
  readonly targetBeliefLink: { readonly cardinality: 'one'; readonly resolution: 'manual' };
  readonly suitablyDire: { readonly resolution: 'manual'; readonly examplesPolicy: 'non-exhaustive'; readonly examples: readonly string[] };
  /** Caster/target are characters; caster-player is the caster character's player. */
  readonly casterCommitment: { readonly entityKind: 'belief'; readonly ownerRole: 'caster'; readonly action: 'change';
    readonly mustMatchPronouncedFate: { readonly resolution: 'manual' } };
  readonly validity: { readonly requiresCasterCommitmentBelief: true;
    readonly invalidatedBy: readonly ['missing-caster-belief-commitment', 'caster-commitment-belief-changed'] };
  readonly targetAgency: { readonly resolution: 'player-choice'; readonly fateDoesNotCompelBehavior: true };
  readonly fulfillmentDetermination: 'manual'; readonly fatalFulfillmentDetermination: 'manual';
  /** Independently conditioned source facts, not an execution order or exclusive branches. */
  readonly fulfillmentRewards: readonly [
    { readonly trigger: { readonly kind: 'manual-fate-fulfilled' }; readonly recipient: 'fated-character-player';
      readonly reward: { readonly kind: 'artha'; readonly arthaType: 'deeds'; readonly amount: 1 } },
    { readonly trigger: { readonly kind: 'manual-fatal-fate-fulfillment' }; readonly recipient: 'fated-character-player-next-campaign-character';
      readonly reward: { readonly kind: 'starting-artha'; readonly arthaType: 'deeds'; readonly amount: 1 } },
  ];
}

/** Contextual actor skill selection is not an opposing ability or a source typo. */
export type ActingAbilityReference = AbilityReference | {
  readonly kind: 'context-resolved-skill'; readonly role: 'appropriate-boxing-skill'; readonly resolution: 'manual';
};
export interface ActingAbilityChoice {
  readonly kind: 'one-of'; readonly options: Operands<ActingAbilityReference>;
}
/** Shield-related contributions/access only, not general availability of other actions. */
export interface ShieldUse {
  readonly kind: 'shield-use';
  readonly trainedDefenseAccess: readonly [
    { readonly action: 'block'; readonly shieldContribution: 'defense-dice' },
    { readonly action: 'counterstrike'; readonly shieldContribution: 'defensive-portion' },
    { readonly action: 'block-and-strike'; readonly access: 'enabled'; readonly shieldContribution: 'defensive-portion' },
  ];
  readonly untrainedDefenseAccess: readonly [{ readonly action: 'block'; readonly shieldContribution: 'defense-dice' }];
  readonly shieldStrike: { readonly action: 'strike'; readonly implement: 'shield'; readonly actor: 'primary-actor';
    readonly actingAbility: ActingAbilityChoice };
}

/** Every permission is scoped to the eligible pair and owning Training.
 * Physical/profile identity and acting weapon skills remain external (D-027). */
export interface TwoWeaponUse {
  readonly kind: 'two-weapon-use';
  readonly equipmentRequirements: {
    readonly weaponCount: 2;
    readonly eachWeapon: { readonly handedness: 'one-handed'; readonly maxWeaponLength: 'long' };
    readonly offHand: { readonly relativeWeight: { readonly relation: 'less-than-or-equal'; readonly compareTo: 'other-weapon' } };
  };
  readonly permissions: {
    readonly offHandStrike: { readonly action: 'strike'; readonly penalty: 'negated' };
    readonly simultaneousStrike: { readonly action: 'strike'; readonly enabled: true; readonly timing: 'simultaneous';
      readonly diceAllocation: { readonly kind: 'split-pool'; readonly targets: 'two-weapons'; readonly allocation: 'player-chosen' } };
    readonly blockAndStrike: { readonly action: 'block-and-strike'; readonly enabled: true;
      readonly accessBasis: 'owning-training-and-eligible-pair';
      readonly diceAllocation: { readonly kind: 'split-skill-dice'; readonly between: readonly ['attack', 'defense']; readonly allocation: 'player-chosen' } };
  };
}

/** Permission constraints only; participant limit is not a helper/dice cap. */
export interface Cooperation {
  readonly kind: 'cooperation';
  readonly appliesTo: { readonly kind: 'external-subsystem-roll'; readonly subsystem: 'range-and-cover'; readonly roll: 'maneuver' };
  readonly participants: {
    readonly roles: readonly ['helper', 'recipient'];
    readonly requirement: { readonly kind: 'known-training'; readonly skillId: SkillId; readonly appliesTo: 'each-participant' };
    readonly relationship: { readonly team: 'same' };
    readonly maxParticipants: number;
  };
}

/** Three named source procedures; no arithmetic AST or treatment execution. */
export interface PoisonTreatment {
  readonly kind: 'poison-treatment';
  readonly branches: readonly [
    { readonly poisonEffectKind: 'injury';
      readonly obstacle: { readonly kind: 'procedure-reference'; readonly skillId: SkillId; readonly procedure: 'wound-treatment'; readonly input: 'caused-wound' };
      readonly onSuccess: { readonly kind: 'halve-die-penalty'; readonly target: 'poison-caused-die-penalties'; readonly rounding: 'up' } },
    { readonly poisonEffectKind: 'obstacle-penalty';
      readonly obstacle: { readonly kind: 'current-penalty'; readonly penaltyKind: 'obstacle' };
      readonly onExtraSuccesses: { readonly kind: 'reduce-obstacle-penalty'; readonly basis: 'successes-over-obstacle'; readonly rate: 'source-unspecified' } },
    { readonly poisonEffectKind: 'direct-dice-subtraction';
      readonly obstacle: { readonly kind: 'double-current-dice-subtraction' };
      readonly onExtraSuccesses: { readonly kind: 'restore-dice'; readonly dicePerSuccessOverObstacle: 1 } },
  ];
}

/** A role-bound audience rule, not stored character state or narrative text matching.
 * Future runtimes may bind entity/character roles to stable ids under D-028. */
export interface BattlefieldCommandBroadcast {
  readonly kind: 'battlefield-command-broadcast';
  readonly extends: { readonly kind: 'skill'; readonly skillId: SkillId; readonly aspect: 'audibility-distance' };
  readonly trigger: { readonly kind: 'issues-command'; readonly actorRole: 'commander' };
  readonly audience: {
    readonly role: 'soldier'; readonly roleResolution: 'manual-contextual'; readonly quantifier: 'all-qualifying';
    readonly relationshipToCommander: {
      readonly kind: 'anyOf'; readonly entityKinds: readonly ['trait', 'instinct', 'belief'];
      readonly ownerRole: 'recipient'; readonly relation: 'about-character'; readonly characterRole: 'commander';
      readonly resolution: { readonly kind: 'manual-or-structured-reference'; readonly entityIdentity: 'stable-runtime-id';
        readonly aboutCharacterIdentity: 'must-match-commander'; readonly otherwise: 'manual-contextual' };
    };
  };
  readonly range: { readonly kind: 'any-distance-within-battlefield'; readonly participants: readonly ['commander', 'recipient'] };
  readonly effect: { readonly kind: 'can-hear-command' };
}

/** Separate medicine recipes; effects are metadata, not injury state changes. */
export interface MedicinalPreparations {
  readonly painRelief: { readonly testObstacle: number;
    readonly effect: { readonly kind: 'relieve-pain-obstacle-penalty'; readonly magnitude: number } };
  readonly localNumbing: { readonly testObstacle: number;
    readonly effect: { readonly kind: 'reduce-wound-die-penalty'; readonly dice: number };
    readonly sideEffect: { readonly kind: 'obstacle-penalty'; readonly scope: 'all-tests'; readonly delta: number };
    readonly duration: { readonly unit: 'hours'; readonly amount: number } };
}

export interface ArmorTrainingPenalties {
  readonly untrained: { readonly appliesTo: 'all-tests'; readonly lightMail: number; readonly heavyMailOrHeavier: number };
  readonly trained: { readonly armorObstaclePenalties: 'removed'; readonly armorFatiguePenalties: 'mitigated';
    readonly clumsyWeight: 'still-applies' };
}

export interface ArtilleryProcedure {
  readonly constructionCrew: { readonly laborers: 'teams'; readonly minimumCarpenters: number };
  readonly blackPowderAlternative: {
    readonly when: 'campaign-uses-black-powder-weapons';
    readonly covers: readonly ['cannons', 'bombards', 'shot'];
    readonly activities: readonly ['manufacture', 'operation'];
    readonly bombsAndPowderSkillId: SkillId;
  };
}

export interface SpiritAuraObstacle {
  readonly kind: 'detect-spirit-presence-and-nature';
  readonly base: number;
  readonly subtract: 'spirit-strength';
}

export interface OpposingForceHesitation {
  readonly threshold: { readonly kind: 'opposing-force-mean-will' };
  readonly trigger: 'exceeds-threshold';
  readonly effect: { readonly kind: 'add-margin-to-opposing-hesitation'; readonly duration: 'conflict' };
}

export interface UnarmedCombatAccess {
  readonly actions: readonly ['attack', 'defense', 'basic'];
  readonly specialActions: 'permitted' | 'excluded';
  readonly foundWeapons?: { readonly countsAs: 'melee-weapon'; readonly actingAbility: 'owning-skill' };
}

export type SkillIntegration = SkillIntegrationIdentity & (
  | { readonly subsystem: 'magic'; readonly fatePronouncement?: FatePronouncement; readonly spellListCasting?: SpellListCasting; readonly craftedPoison?: never; readonly craftedConsumableEffect?: never; readonly baseItemCreation?: MagicBaseItemCreation; readonly spellSongTransfer?: MagicSpellSongTransfer; readonly sustainedSpellReference?: SustainedSpellReference;
      readonly createdItemReference?: MagicCreatedItemReference; readonly equipmentResult?: never; readonly createdItemValueEffects?: never; readonly equipmentUseEffect?: never; readonly wagerSettlement?: never; readonly purchaseNegotiation?: never; readonly priceReduction?: never; readonly judicialFineAssessment?: never; readonly structureResistance?: never; readonly createdEquipmentCapability?: never }
  | { readonly subsystem: 'equipment'; readonly fatePronouncement?: never; readonly spellListCasting?: never; readonly craftedPoison?: CraftedPoison; readonly craftedConsumableEffect?: CraftedConsumableEffect; readonly sustainedSpellReference?: never; readonly createdItemValueEffects?: readonly CreatedItemValueEffect[];
      readonly equipmentUseEffect?: EquipmentUseEffect; readonly equipmentResult?: EquipmentResult; readonly baseItemCreation?: never; readonly spellSongTransfer?: never; readonly createdItemReference?: never; readonly wagerSettlement?: never; readonly purchaseNegotiation?: never; readonly priceReduction?: never; readonly judicialFineAssessment?: never; readonly structureResistance?: StructureResistance; readonly createdEquipmentCapability?: CreatedEquipmentCapability }
  | { readonly subsystem: 'resources'; readonly fatePronouncement?: never; readonly spellListCasting?: never; readonly craftedPoison?: never; readonly craftedConsumableEffect?: never; readonly sustainedSpellReference?: never; readonly createdItemValueEffects?: readonly CreatedItemValueEffect[]; readonly equipmentUseEffect?: never;
      readonly equipmentResult?: never; readonly baseItemCreation?: never; readonly spellSongTransfer?: never; readonly createdItemReference?: never; readonly wagerSettlement?: WagerSettlement; readonly purchaseNegotiation?: PurchaseNegotiation; readonly priceReduction?: AppraisedItemPriceReduction; readonly judicialFineAssessment?: JudicialFineAssessment; readonly structureResistance?: never; readonly createdEquipmentCapability?: never }
  | { readonly subsystem: Exclude<IntegrationTag, 'magic' | 'equipment' | 'resources'>; readonly fatePronouncement?: never; readonly spellListCasting?: never; readonly craftedPoison?: never; readonly craftedConsumableEffect?: never; readonly sustainedSpellReference?: never;
      readonly equipmentResult?: never; readonly baseItemCreation?: never; readonly spellSongTransfer?: never; readonly createdItemReference?: never; readonly createdItemValueEffects?: never; readonly equipmentUseEffect?: never; readonly wagerSettlement?: never; readonly purchaseNegotiation?: never; readonly priceReduction?: never; readonly judicialFineAssessment?: never; readonly structureResistance?: never; readonly createdEquipmentCapability?: never }
) & (
  | { readonly subsystem: 'military-campaign'; readonly artilleryProcedure?: ArtilleryProcedure; readonly opposingForceHesitation?: OpposingForceHesitation }
  | { readonly subsystem: Exclude<IntegrationTag, 'military-campaign'>; readonly artilleryProcedure?: never; readonly opposingForceHesitation?: never }
) & (
  | { readonly subsystem: 'magic'; readonly spiritAuraObstacle?: SpiritAuraObstacle }
  | { readonly subsystem: Exclude<IntegrationTag, 'magic'>; readonly spiritAuraObstacle?: never }
) & (
  | { readonly subsystem: 'fight'; readonly shieldUse?: ShieldUse; readonly twoWeaponUse?: TwoWeaponUse; readonly unarmedCombatAccess?: UnarmedCombatAccess }
  | { readonly subsystem: Exclude<IntegrationTag, 'fight'>; readonly shieldUse?: never; readonly twoWeaponUse?: never; readonly unarmedCombatAccess?: never }
) & (
  | { readonly subsystem: 'range-and-cover'; readonly cooperation?: Cooperation }
  | { readonly subsystem: Exclude<IntegrationTag, 'range-and-cover'>; readonly cooperation?: never }
) & (
  | { readonly subsystem: 'injury'; readonly poisonTreatment?: PoisonTreatment; readonly medicinalPreparations?: MedicinalPreparations }
  | { readonly subsystem: Exclude<IntegrationTag, 'injury'>; readonly poisonTreatment?: never; readonly medicinalPreparations?: never }
) & (
  | { readonly subsystem: 'battlefield-communication'; readonly battlefieldCommandBroadcast?: BattlefieldCommandBroadcast }
  | { readonly subsystem: Exclude<IntegrationTag, 'battlefield-communication'>; readonly battlefieldCommandBroadcast?: never }
) & (
  | { readonly subsystem: 'equipment'; readonly weaponImprovements?: WeaponImprovementOptions;
      readonly sourceSpecificQualities?: SourceSpecificEquipmentQualities; readonly craftingShadeRequirement?: CraftingShadeRequirement; readonly createdEquipmentQuality?: CreatedEquipmentQuality; readonly armorTraining?: ArmorTrainingPenalties }
  | { readonly subsystem: Exclude<IntegrationTag, 'equipment'>; readonly weaponImprovements?: never;
      readonly sourceSpecificQualities?: never; readonly craftingShadeRequirement?: never; readonly createdEquipmentQuality?: never; readonly armorTraining?: never }
);

/** Closed source-shaped alternatives, not reusable arithmetic expressions. */
export interface RuneCastingFateObstacle {
  readonly kind: 'rune-casting-fate-obstacle'; readonly targetRole: 'target';
  readonly candidates: readonly [
    { readonly kind: 'ten-minus-highest-social-standing-total'; readonly components: readonly ['circles', 'reputation', 'affiliation'] },
    { readonly kind: 'ten-minus-most-expensive-non-common-trait' },
  ];
  readonly choose: 'lower-obstacle';
}
/** Live ability exponent references; no lookup, aggregation or tie resolution. */
export type ObstacleBasis =
  | RuneCastingFateObstacle
  | { readonly kind: 'highest-of-target-abilities'; readonly abilities: readonly [RootAbility, RootAbility]; readonly snapshot: 'current' }
  | { readonly kind: 'target-ability-exponent'; readonly targetRole?: 'listener'; readonly ability: RootAbility; readonly snapshot: 'current' }
  | { readonly kind: 'crowd-ability-exponent'; readonly ability: RootAbility;
      readonly statistic: 'most-common'; readonly snapshot: 'current' };
/** Unquantified is an audited fact, not a default zero or an omitted numeric value. */
export type ManualTestAdjustment = {
  readonly kind: 'manual'; readonly quantity: 'unquantified'; readonly delta?: never;
} & (
  | { readonly source: 'target-traits'; readonly examples?: never }
  | { readonly source: 'situational-disadvantage'; readonly examples?: readonly SkillContext[] }
);
/** Roles are local to the owning primary test, not skill-specific actor models. */
export type SkillTestActor = 'primary-actor' | 'target';
export type TestResultValueReference = { readonly kind: 'extra-successes'; readonly source: 'primary-test' };
export type DynamicTestModifier = {
  readonly kind: 'dynamic-value'; readonly target: 'hesitation-obstacle'; readonly operation: 'add';
  readonly value: TestResultValueReference; readonly delta?: never;
};
export interface SkillTestFollowUp {
  readonly trigger: { readonly kind: 'test-success'; readonly source: 'primary-test' };
  readonly context: SkillContext;
  readonly test: { readonly actor: SkillTestActor; readonly ability: AbilityReference };
  readonly modifiers: readonly [DynamicTestModifier, ...DynamicTestModifier[]];
}
/** Source-supported contextual selection is distinct from missing transcription. */
export type OpposingAbilityReference = Extract<SkillReferenceTarget, { kind: 'skill' }> | {
  readonly kind: 'context-resolved-skill'; readonly actorRole: 'eavesdropper' | 'opponent';
  readonly resolution: 'manual'; readonly skillId?: never;
};
/** Canonical penalty: base obstacle/opponent successes double before other modifiers.
 * Execution is deferred; this is not a multiplier of the final obstacle. */
export type DoubleObstaclePenalty = { readonly kind: 'double-obstacle-penalty' };
export interface OpposingAbilityAlternative {
  readonly ability: Extract<SkillReferenceTarget, { kind: 'skill' }> | RootAbility;
  readonly modifiers?: readonly DoubleObstaclePenalty[];
}
export type OpposingAbilities = readonly [OpposingAbilityReference, ...OpposingAbilityReference[]] |
  { readonly kind: 'anyOf'; readonly operands: Operands<OpposingAbilityAlternative> };
/** Canonical Advantage delegates amount/resolution to general rules/context.
 * It is distinct from both numeric dice bonuses and obstacle adjustments. */
export type ContextualTestEffect =
  | { readonly kind: 'advantage'; readonly resolution: 'canonical'; readonly dice?: never; readonly delta?: never }
  | { readonly kind: 'dice-bonus'; readonly dice: number }
  | { readonly kind: 'obstacle-modifier'; readonly delta: number };
export interface ContextualTestModifier {
  readonly effect: ContextualTestEffect;
  readonly when: SkillContext;
}
/** Character/world-state results, never test-pool modifiers. */
export type JourneyNavigationOutcome =
  | { readonly kind: 'journey-navigation'; readonly recipient: 'primary-actor';
      readonly result: 'intended-destination'; readonly delay: 'none' }
  | { readonly kind: 'journey-navigation'; readonly recipient: 'travelling-party'; readonly state: 'lost';
      /** Actor plus companions; alternatives have no inferred selection policy. */
      readonly alternatives: readonly [
        { readonly arrival: 'intended-destination'; readonly appointments: 'missed-if-applicable' },
        { readonly arrival: 'unintended-location' },
      ] };
/** Injury subsystem owns clock applicability and all downstream consequences. */
export interface AdvanceInjuryClock {
  readonly kind: 'advance-injury-clock';
  readonly clock: 'blood-clock';
  readonly target: 'treated-wound';
  readonly stages: number;
  readonly applicability: 'external-anatomy-of-injury';
}
/** Declaration content remains free-form runtime narrative; only its source requirement is catalog data. */
export interface DeclaredIntentRequirement {
  readonly kind: 'declared-intent'; readonly requiredBeforeTest: true;
  readonly content: 'submit-or-reveal'; readonly specificity: 'exact';
}
export interface DebilitatingTraitGrant {
  readonly kind: 'grant-trait'; readonly recipient: 'target';
  readonly traitSelection: { readonly kind: 'contextual'; readonly quality: 'debilitating';
    readonly examplesPolicy: 'non-exhaustive'; readonly examples: readonly string[] };
  readonly value: { readonly kind: 'test-obstacle'; readonly source: 'primary-test' };
}
export interface BeneficialResistanceTraitGrant {
  readonly kind: 'grant-trait'; readonly recipient: 'target';
  readonly traitSelection: { readonly kind: 'contextual'; readonly quality: 'beneficial';
    readonly purpose: readonly ['resist-privation', 'resist-torture', 'resist-interrogation'] };
  readonly value: { readonly kind: 'source-unspecified' };
}
/** Bounded source alternatives, not recursive scripting or injury/trait execution. */
export interface GmSelectedConsequence {
  readonly kind: 'gm-selected-consequence'; readonly resolution: 'gm-choice';
  readonly alternatives: readonly [
    { readonly kind: 'injury'; readonly recipient: 'target'; readonly severity: 'source-unspecified' },
    { readonly kind: 'death'; readonly recipient: 'target' },
    BeneficialResistanceTraitGrant,
  ];
}
export type SkillTestOutcomeEffect =
  | { readonly kind: 'declared-intent-fulfilled'; readonly recipient: 'target';
      readonly intent: { readonly kind: 'declared-intent'; readonly source: 'primary-test' } }
  | DebilitatingTraitGrant
  | GmSelectedConsequence
  | AdvanceInjuryClock
  | JourneyNavigationOutcome
  | { readonly kind: 'name-bestowal' | 'name-bestowal-denied'; readonly recipient: SkillTestActor }
  | { readonly kind: 'reputation'; readonly recipient: SkillTestActor;
      readonly reputationKind: 'ordinary' | 'infamous';
      readonly dice: { readonly kind: 'fixed'; readonly value: number } |
        { readonly kind: 'unspecified'; readonly value?: never } };
export interface SkillTestOutcome {
  readonly trigger: { readonly kind: 'success' | 'failure' };
  readonly effects: readonly [SkillTestOutcomeEffect, ...SkillTestOutcomeEffect[]];
}

/** Descriptive skill-level test facts, not a roll-building or arbitration engine.
 * Missing modifiers remain untranscribed; manual adjustments explicitly lack deltas. */
export type SkillTestProfile = {
  readonly declaredIntent?: DeclaredIntentRequirement;
  readonly outcomes?: readonly SkillTestOutcome[];
  readonly context?: SkillContext;
  readonly followUps?: readonly SkillTestFollowUp[];
  readonly modifiers?: readonly ContextualTestModifier[];
} & (
  | { readonly kind: 'versus';
      /** Potential opponents, not simultaneous tests against every ability. */
      readonly opposingAbilities: OpposingAbilities;
      readonly base?: never; readonly adjustments?: never }
  | { readonly kind: 'obstacle'; readonly base: ObstacleBasis;
      readonly adjustments?: readonly ManualTestAdjustment[]; readonly opposingAbilities?: never }
  /** Effects on source-guided tests, without inventing an obstacle basis or opponent. */
  | { readonly kind: 'contextual'; readonly base?: never; readonly adjustments?: never; readonly opposingAbilities?: never }
);

/** Source-defined created-item damage remains a reference, never a fixed wound. */
export interface SkillAdverseOutcome {
  readonly trigger: { readonly kind: 'zero-successes' };
  readonly when: CraftingSubjectContext;
  readonly sourceOutcomeLabels: readonly [string, ...string[]];
  readonly outcome: {
    readonly kind: 'damage'; readonly recipient: 'maker';
    readonly severity: { readonly kind: 'created-item-damage-reference'; readonly result: 'mark';
      readonly resolution: 'manual-contextual' };
  };
}

/** A closed progression descriptor, not a formula or a duration evaluator. */
export interface DurationRestSubstitution {
  readonly kind: 'duration-rest-substitution'; readonly substitutesFor: 'sleep-rest';
  readonly obstacle: { readonly kind: 'duration-based-obstacle'; readonly unit: 'hour';
    readonly firstUnitObstacle: number; readonly additionalUnitObstacleDelta: number };
  readonly effect: { readonly kind: 'rest-equivalence'; readonly durationUnit: 'hour';
    readonly restPerUnit: number; readonly appliesTo: readonly ['wound-recovery', 'tax-recovery'] };
  readonly onFailure: { readonly kind: 'falls-asleep'; readonly timing: 'at-some-point' };
}
export interface LinkedPretest {
  readonly kind: 'linked-pretest'; readonly target: 'subsequent-skill-test';
  readonly semantics: { readonly kind: 'canonical-rule'; readonly rule: 'linked-test' };
  readonly specialResolution: {
    readonly when: SkillContext;
    readonly test: { readonly kind: 'versus'; readonly actingAbility: Extract<AbilityReference, { kind: 'skill' }>;
      readonly opposingAbility: Extract<OpposingAbilityReference, { kind: 'context-resolved-skill' }> & { readonly actorRole: 'opponent' } };
    readonly onWin: { readonly kind: 'dice-bonus'; readonly dice: number; readonly appliesTo: 'linked-target-test' };
  };
}
/** Request legality and manual obstacle guidance, not an inventory/world query. */
export interface ItemSearch {
  readonly kind: 'item-search';
  readonly request: { readonly declaredBy: 'player'; readonly granularity: 'item-type';
    readonly specificItemAllowed: false; readonly uniqueItemAllowed: false; readonly resolution: 'manual' };
  readonly contextRequirement: { readonly kind: 'suitable-location'; readonly purpose: 'scavenging';
    readonly resolution: 'contextual'; readonly examplesPolicy: 'non-exhaustive'; readonly examples: readonly string[] };
  readonly obstacleGuidance: { readonly kind: 'category-based'; readonly resolution: 'contextual';
    readonly examplesPolicy: 'non-exhaustive'; readonly categories: readonly {
      readonly id: string; readonly label: string; readonly obstacle: number; readonly examples: readonly string[];
    }[] };
}
/** Source-shaped voyage supply consequences, without downstream crew/inventory execution. */
export interface SupplyManagement {
  readonly kind: 'supply-management';
  readonly success: { readonly kind: 'no-supply-problem' };
  readonly failure: {
    readonly shortage: { readonly kind: 'critical-supply-shortage'; readonly supplySelection: 'contextual';
      readonly examplesPolicy: 'non-exhaustive'; readonly examples: readonly string[] };
    readonly consequences: readonly [
      { readonly kind: 'serious-complications'; readonly resolution: 'contextual' },
      { readonly kind: 'crew-mortality'; readonly onset: 'begins'; readonly quantity: 'source-unspecified';
        readonly timing: 'source-unspecified'; readonly cause: 'shortage-of-critical-supply' },
      { readonly kind: 'morale-harm'; readonly magnitude: 'source-unspecified' },
    ];
  };
  /** Explicit source rows only; no duration, supply or voyage formula. */
  readonly obstacleGuidance: {
    readonly vessels: readonly { readonly vessels: readonly string[]; readonly obstacle: number }[];
    readonly journeyModifiers: readonly { readonly journey: string; readonly obstacleDelta: number }[];
  };
}
/** Relief targets an existing penalty; it is not a transferable negative modifier.
 * Scope, duration and execution remain unresolved by this source descriptor. */
export interface ObstaclePenaltyRelief {
  readonly kind: 'obstacle-penalty-relief';
  readonly testObstacle: number;
  readonly trigger: 'success';
  readonly targetPenalty: { readonly kind: 'obstacle-penalty'; readonly target: 'existing-penalty'; readonly magnitude: number };
  readonly effect: 'shrug-off';
  readonly scope: 'source-unspecified';
  readonly duration: 'source-unspecified';
}
export interface BattlefieldHesitationRelief {
  readonly kind: 'battlefield-hesitation-relief';
  readonly range: 'audible-voice';
  readonly commanderMustNotHesitate: true;
  readonly obstacle: 'amount-of-hesitation';
  readonly effect: { readonly kind: 'subtract-success-margin'; readonly appliesTo: 'all-hesitation-in-presence' };
}
export interface FieldManeuverLinkedTest {
  readonly kind: 'field-maneuver-linked-test';
  readonly subsystem: 'range-and-cover';
  readonly opposition: 'highest-will-on-own-team';
  readonly benefit: 'may-link-to-team-field-maneuvers';
}
export interface CodeDeciphering {
  readonly kind: 'code-deciphering';
  readonly obstacle: 'code-creation-test-successes';
  readonly decipherWith: { readonly kind: 'anyOf'; readonly skillIds: Operands<SkillId> };
}
export type DrinkingProcedure =
  | { readonly kind: 'drinker-contest'; readonly aim: 'drink-without-showing-it'; readonly test: 'versus';
      readonly recommendation: 'preferred' }
  | { readonly kind: 'drinker-contest'; readonly aim: 'fastest-intoxication'; readonly test: 'versus';
      readonly speedBasis: 'more-successes-faster'; readonly reducesAlcoholRequired: false }
  | { readonly kind: 'appear-sober'; readonly test: 'versus';
      readonly opponent: { readonly kind: 'stat'; readonly id: 'perception' } };
export type SkillProcedure = DurationRestSubstitution | LinkedPretest | ItemSearch | SupplyManagement |
  ObstaclePenaltyRelief | BattlefieldHesitationRelief | FieldManeuverLinkedTest | CodeDeciphering | DrinkingProcedure;
/** Facts during use of the owning skill; no new ability named Awareness. */
export type SkillActivityFact =
  | { readonly kind: 'vague-surroundings-awareness' }
  | { readonly kind: 'permitted-test'; readonly abilities: { readonly kind: 'anyOf'; readonly operands: Operands<AbilityReference> };
      readonly purpose: { readonly kind: 'detect-skill-use'; readonly skillId: SkillId } };

/** Selection is local to a source acquisition; option ownership is independent. */
export interface TrainingSourceChoice {
  readonly kind: 'training-source-options';
  readonly selectionScope: 'source-acquisition';
  readonly ownership: 'independent';
  readonly appropriateness: 'character-and-setting';
  readonly options: Operands<{
    readonly id: SkillId;
    readonly sourceLabel: string;
    readonly archetype: string;
    readonly source: readonly SkillSource[];
    readonly sourceMappings: readonly {
      readonly kind: 'lifepath'; readonly stockId: StockId;
      readonly sourceName: string; readonly source: readonly SkillSource[];
    }[];
  }>;
}

/** A named external profile, not a skill or an inventory item; it need not be loaded. */
export interface ExternalCombatProfileReference {
  readonly kind: 'external-combat-profile'; readonly subsystem: 'fight'; readonly catalog: 'weapon-appendix';
  readonly id: string; readonly sourceName: string;
}
export interface CombatUseChoice {
  readonly kind: 'combat-use-choice';
  readonly weaponIdentity: 'shared-physical-item'; readonly selection: 'per-combat-use';
  readonly options: Operands<{ readonly id: string; readonly combatProfileRef: ExternalCombatProfileReference }>;
}

export interface SkillMetadata {
  readonly combatUseChoice?: CombatUseChoice;
  readonly adverseOutcomes?: readonly SkillAdverseOutcome[];
  readonly trainingSourceChoice?: TrainingSourceChoice;
  readonly procedures?: readonly SkillProcedure[];
  readonly activityFacts?: readonly SkillActivityFact[];
  readonly testProfile?: SkillTestProfile;
  readonly familyMembership?: { readonly familyId: string; readonly topicId: string };
  readonly rootRule: RootRule;
  readonly skillType: SkillType;
  readonly semanticCategories?: readonly SkillSemanticCategory[];
  readonly availabilityRestrictions: readonly AvailabilityRestriction[];
  readonly openingRequirements: readonly OpeningRequirement[];
  readonly useRequirements: readonly UseRequirement[];
  readonly useContext?: SkillContext;
  /** Audited non-Training base cost only; absence is untranscribed, not 1. */
  readonly baseOpeningCostOverride?: {
    readonly kind: 'fixed'; readonly points: number; readonly source: readonly SkillSource[];
  };
  readonly tools: ToolRequirement;
  readonly training: TrainingBehavior;
  readonly rollBehavior: RollBehavior;
  readonly printedMarkers: readonly ('§' | '*')[];
  readonly forkSuggestions: ForkGuidance;
  readonly specialForkBehaviorId?: string;
  readonly relations: readonly SkillRelation[];
  readonly capabilities: readonly SkillCapability[];
  readonly resourceInteractions: readonly ResourceInteraction[];
  readonly integrationTags: readonly IntegrationTag[];
  readonly sourceAliases?: readonly string[];
}
export interface SkillIdentity {
  readonly id: SkillId;
  readonly sourceName: string;
  readonly summary: string;
  readonly source: readonly SkillSource[];
}
export interface SkillDefinition extends SkillIdentity, SkillMetadata { readonly coverage: 'complete' }
/** A missing field is untranscribed evidence, never a negative/default rule. */
export interface SkillAuditFixture extends SkillIdentity, Partial<SkillMetadata> { readonly coverage: 'partial' }
export type SkillRecord = SkillDefinition | SkillAuditFixture;
export interface SkillNameReference {
  readonly id: SkillId;
  readonly sourceName: string;
  readonly source: readonly SkillSource[];
}

export interface SkillFamilyDefinition {
  readonly id: string;
  readonly sourceName: string;
  readonly ownership: 'separate-skill-per-topic';
  readonly defaults: Readonly<Partial<SkillMetadata>>;
  readonly summary: string;
  readonly source: readonly SkillSource[];
}
export interface OwnedSkillTopic {
  readonly familyId: string;
  readonly topicId: string;
  readonly sourceName: string;
  readonly metadataOverrides: Readonly<Partial<SkillMetadata>>;
}
export type SkillChoiceExpression = {
  readonly id: string;
  readonly sourceName: string;
  readonly kind: 'appropriate-weapons';
  readonly selection: { readonly kind: 'real-weapon-skills'; readonly contextRequired: true;
    readonly considerations?: readonly ['lifepaths', 'character-concept', 'game-setting'];
    readonly cardinality?: 'any-and-all-appropriate' };
  readonly source: readonly SkillSource[];
};
export interface SkillCatalogContent {
  readonly skills: readonly SkillRecord[];
  readonly references: readonly SkillNameReference[];
  readonly families: readonly SkillFamilyDefinition[];
  readonly choices: readonly SkillChoiceExpression[];
  readonly forkBehaviors: readonly SpecialForkBehavior[];
  readonly integrations: readonly SkillIntegration[];
}
