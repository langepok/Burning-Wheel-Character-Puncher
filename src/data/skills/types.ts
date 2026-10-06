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

export type SkillContext =
  | { readonly kind: 'subject'; readonly subject: 'children' | 'great-wolves' | 'spiders' | 'rats-and-relatives' }
  | { readonly kind: 'activity'; readonly activity: 'potion-work' | 'wound-treatment' | 'hauling' | 'crafting' | 'pursuit' | 'travel' | 'field-maneuver' }
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
  | { readonly kind: 'allOf' | 'anyOf'; readonly requirements: Operands<ToolRequirement> };

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

export type SkillRelation =
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
export type ResourceInteraction = { readonly kind: 'recover-taxed-resources' | 'produce-cash' };
export type IntegrationTag = 'fight' | 'range-and-cover' | 'duel-of-wits' | 'injury' | 'resources' |
  'magic' | 'equipment' | 'mounted-combat' | 'military-campaign' | 'poisons' | 'ambush' | 'battlefield-communication';

/** Index/extension record only; subsystem execution is deliberately absent. */
export interface SkillIntegration {
  readonly id: string;
  readonly skillId: SkillId;
  readonly subsystem: IntegrationTag;
  readonly context?: SkillContext;
  readonly summary: string;
  readonly source: readonly SkillSource[];
}

export interface SkillMetadata {
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
