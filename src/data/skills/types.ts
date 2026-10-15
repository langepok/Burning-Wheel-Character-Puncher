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
  readonly use: 'aura-perception' | 'spell-casting';
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
export type ResourceInteraction = {
  readonly kind: 'recover-taxed-resources' | 'produce-cash';
  readonly context?: SkillContext;
};
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
}
/** Valuation of the crafting result, never the character's Resources pool. */
export type CreatedItemValueModifier =
  | { readonly target: 'created-item'; readonly measure: 'resources-obstacle'; readonly delta: number }
  | { readonly target: 'created-item'; readonly measure: 'resources-value-dice'; readonly delta: number };
export type CreatedItemValueEffect =
  | { readonly kind: 'automatic'; readonly modifier: CreatedItemValueModifier }
  | { readonly kind: 'optional-tradeoff'; readonly choiceTiming: 'before-roll';
      readonly modifier: Extract<CreatedItemValueModifier, { measure: 'resources-obstacle' }>;
      readonly cost: { readonly kind: 'crafting-obstacle-modifier'; readonly delta: number } };
export type MagicCreatedItemReference =
  | { readonly kind: 'enchanting-matrix'; readonly target: 'created-item' }
  | { readonly kind: 'antiphon-union'; readonly target: 'created-item'; readonly skillId: SkillId };
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
/** Independent source-defined dimensions; no twelve-row expansion or evaluator. */
export interface CraftedPoison {
  readonly target: 'created-poison';
  readonly potencies: readonly PoisonPotency[];
  readonly deliveries: readonly PoisonDelivery[];
}

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

export type SkillIntegration = SkillIntegrationIdentity & (
  | { readonly subsystem: 'magic'; readonly fatePronouncement?: FatePronouncement; readonly spellListCasting?: SpellListCasting; readonly craftedPoison?: never; readonly craftedConsumableEffect?: never; readonly baseItemCreation?: MagicBaseItemCreation; readonly sustainedSpellReference?: SustainedSpellReference;
      readonly createdItemReference?: MagicCreatedItemReference; readonly equipmentResult?: never; readonly createdItemValueEffects?: never; readonly equipmentUseEffect?: never; readonly wagerSettlement?: never; readonly purchaseNegotiation?: never; readonly structureResistance?: never }
  | { readonly subsystem: 'equipment'; readonly fatePronouncement?: never; readonly spellListCasting?: never; readonly craftedPoison?: CraftedPoison; readonly craftedConsumableEffect?: CraftedConsumableEffect; readonly sustainedSpellReference?: never; readonly createdItemValueEffects?: readonly CreatedItemValueEffect[];
      readonly equipmentUseEffect?: EquipmentUseEffect; readonly equipmentResult?: EquipmentResult; readonly baseItemCreation?: never; readonly createdItemReference?: never; readonly wagerSettlement?: never; readonly purchaseNegotiation?: never; readonly structureResistance?: StructureResistance }
  | { readonly subsystem: 'resources'; readonly fatePronouncement?: never; readonly spellListCasting?: never; readonly craftedPoison?: never; readonly craftedConsumableEffect?: never; readonly sustainedSpellReference?: never; readonly createdItemValueEffects?: readonly CreatedItemValueEffect[]; readonly equipmentUseEffect?: never;
      readonly equipmentResult?: never; readonly baseItemCreation?: never; readonly createdItemReference?: never; readonly wagerSettlement?: WagerSettlement; readonly purchaseNegotiation?: PurchaseNegotiation; readonly structureResistance?: never }
  | { readonly subsystem: Exclude<IntegrationTag, 'magic' | 'equipment' | 'resources'>; readonly fatePronouncement?: never; readonly spellListCasting?: never; readonly craftedPoison?: never; readonly craftedConsumableEffect?: never; readonly sustainedSpellReference?: never;
      readonly equipmentResult?: never; readonly baseItemCreation?: never; readonly createdItemReference?: never; readonly createdItemValueEffects?: never; readonly equipmentUseEffect?: never; readonly wagerSettlement?: never; readonly purchaseNegotiation?: never; readonly structureResistance?: never }
) & (
  | { readonly subsystem: 'fight'; readonly shieldUse?: ShieldUse }
  | { readonly subsystem: Exclude<IntegrationTag, 'fight'>; readonly shieldUse?: never }
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
export type SkillTestOutcomeEffect =
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
export type SkillProcedure = DurationRestSubstitution | LinkedPretest | ItemSearch;
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
  readonly selection: { readonly kind: 'real-weapon-skills'; readonly contextRequired: true };
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
