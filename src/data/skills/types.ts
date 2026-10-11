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
  | { readonly kind: 'training'; readonly rootPurpose: 'aptitude-and-practice';
      readonly exponent: 'none'; readonly advancement: 'none'; readonly openingCost: 2 };

export type RollBehavior =
  | { readonly kind: 'standard' }
  | { readonly kind: 'open-ended'; readonly basis: 'magical' | 'attribute-root' }
  | { readonly kind: 'conditional'; readonly whenRoot: RootAbility;
      readonly then: 'open-ended'; readonly otherwise: 'standard' };

/** Attire and mismatch leaves describe the skill user relative to their environment.
 * Stock mismatch preserves the source race/crowd comparison without fixing a stock. */
export type SkillContext =
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
export type SkillSemanticCategory = 'melee-weapon' | 'ritual' | 'song';
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
export type SkillIntegration = SkillIntegrationIdentity & (
  | { readonly subsystem: 'magic'; readonly baseItemCreation?: MagicBaseItemCreation;
      readonly createdItemReference?: MagicCreatedItemReference; readonly createdItemValueEffects?: never; readonly equipmentUseEffect?: never; readonly wagerSettlement?: never; readonly purchaseNegotiation?: never; readonly structureResistance?: never }
  | { readonly subsystem: 'equipment'; readonly createdItemValueEffects?: readonly CreatedItemValueEffect[];
      readonly equipmentUseEffect?: EquipmentUseEffect; readonly baseItemCreation?: never; readonly createdItemReference?: never; readonly wagerSettlement?: never; readonly purchaseNegotiation?: never; readonly structureResistance?: StructureResistance }
  | { readonly subsystem: 'resources'; readonly createdItemValueEffects?: readonly CreatedItemValueEffect[]; readonly equipmentUseEffect?: never;
      readonly baseItemCreation?: never; readonly createdItemReference?: never; readonly wagerSettlement?: WagerSettlement; readonly purchaseNegotiation?: PurchaseNegotiation; readonly structureResistance?: never }
  | { readonly subsystem: Exclude<IntegrationTag, 'magic' | 'equipment' | 'resources'>;
      readonly baseItemCreation?: never; readonly createdItemReference?: never; readonly createdItemValueEffects?: never; readonly equipmentUseEffect?: never; readonly wagerSettlement?: never; readonly purchaseNegotiation?: never; readonly structureResistance?: never }
);

/** Reference to the target's live ability value; no lookup/calculation is performed. */
export type ObstacleBasis = {
  readonly kind: 'target-ability-exponent'; readonly ability: RootAbility; readonly snapshot: 'current';
};
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
  readonly kind: 'context-resolved-skill'; readonly actorRole: 'eavesdropper';
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
/** Descriptive skill-level test facts, not a roll-building or arbitration engine.
 * Missing modifiers remain untranscribed; manual adjustments explicitly lack deltas. */
export type SkillTestProfile = {
  readonly context?: SkillContext;
  readonly followUps?: readonly SkillTestFollowUp[];
  readonly modifiers?: readonly { readonly kind: 'obstacle'; readonly delta: number; readonly when: SkillContext }[];
} & (
  | { readonly kind: 'versus';
      /** Potential opponents, not simultaneous tests against every ability. */
      readonly opposingAbilities: OpposingAbilities;
      readonly base?: never; readonly adjustments?: never }
  | { readonly kind: 'obstacle'; readonly base: ObstacleBasis;
      readonly adjustments?: readonly ManualTestAdjustment[]; readonly opposingAbilities?: never }
);

export interface SkillMetadata {
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
