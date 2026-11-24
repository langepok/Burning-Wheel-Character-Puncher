import type { Fraction, SkillId, SourceReference, StockId } from '../catalog';

export type ResourceId = string;
export type ResourceQuality = 'poor' | 'run-of-the-mill' | 'superior';
export type ResourceCategory = 'gear' | 'property' | 'relationship' | 'affiliation' | 'reputation' | 'spell' | 'cash' | 'composite';

/** Zero, missing price and unavailable purchase are different states. */
export type ResourceCost =
  | { readonly kind: 'fixed'; readonly rps: number; readonly basis: 'printed' | 'derived' }
  | { readonly kind: 'unknown'; readonly questionId: string }
  | { readonly kind: 'unavailable'; readonly reason: string }
  | { readonly kind: 'included'; readonly parentDefinitionIds: readonly ResourceId[] };

export type ArmorPiece = 'suit' | 'helmet' | 'breastplate' | 'greaves' | 'leggings' | 'half-sleeves' | 'half-leggings';
export type RelationshipSignificance = 'minor' | 'significant' | 'powerful';
export type RelationshipModifier = 'immediate-family' | 'other-family' | 'romantic' | 'forbidden' | 'hateful';

export type ResourcePrice = ResourceCost
  | { readonly kind: 'quality'; readonly costs: Readonly<Record<ResourceQuality, ResourceCost>>;
      readonly calculation: 'printed-tiers' | 'missile-quality'; readonly baseRps: number }
  | { readonly kind: 'armor'; readonly fullSuitRps: number;
      readonly costs: Readonly<Record<ResourceQuality, Readonly<Record<ArmorPiece, ResourceCost>>>> }
  | { readonly kind: 'relationship'; readonly baseRps: Readonly<Record<RelationshipSignificance, number>>;
      readonly modifiers: Readonly<Record<RelationshipModifier, number>>; readonly minimumRps: number }
  | { readonly kind: 'rating'; readonly tiers: readonly { readonly dice: 1 | 2 | 3; readonly rps: number; readonly scope: string }[] }
  | { readonly kind: 'target-quality'; readonly costs: Readonly<Record<ResourceQuality, ResourceCost>> }
  | { readonly kind: 'sum-children'; readonly childDefinitionIds: readonly ResourceId[]; readonly overheadRps: 0 };

export type ResourceConstraint =
  | { readonly kind: 'skill'; readonly skillId: SkillId }
  | { readonly kind: 'herd-eligibility'; readonly skillId: SkillId; readonly lifepathNames: readonly string[] }
  | { readonly kind: 'review'; readonly questionId: string }
  | { readonly kind: 'social-limit'; readonly maximumPurchased: number; readonly distinctOrganizations: true }
  | { readonly kind: 'companion-character'; readonly fewerLifepaths: number; readonly lowerExponentCap: true;
      readonly reciprocalRelationshipRps: number; readonly ownGear: true };

/** Exact paid-rp inclusion; semantic category is never used as a shortcut. */
export interface ResourceAccounting {
  readonly resources: boolean;
  readonly circles: boolean | { readonly questionId: string };
}

export interface ResourceDefinition {
  readonly id: ResourceId;
  readonly sourceName: string;
  readonly stockIds: readonly StockId[];
  readonly category: ResourceCategory;
  readonly source: SourceReference;
  readonly accountingSource: SourceReference;
  readonly accounting: ResourceAccounting;
  readonly price: ResourcePrice;
  readonly constraints: readonly ResourceConstraint[];
  readonly configuration: 'plain' | 'arms' | 'missile' | 'armor' | 'weapon-modification' | 'ammunition' | 'skill-kit' | 'relationship' | 'companion' | 'social' | 'gang';
  readonly note: string;
  /** Structural declaration capability, not a weapon/profile classifier.
   * Omitted: descriptive `other` items only where declarations are supported. */
  readonly declaredItemKinds?: readonly ('weapon' | 'armor' | 'shield' | 'other')[];
  readonly additions?: { readonly target: 'physical-weapon' | 'missile-purchase'; readonly parentDefinitionIds: readonly ResourceId[];
    readonly weaponKinds?: readonly ('axe' | 'spear' | 'polearm')[];
    readonly ammunitionKind?: 'arrow' | 'bolt' };
  readonly grants?: { readonly cashDice?: number };
  /** Optional no-extra-cost components, never automatically materialized. Each
   * option has its own definition and included-price parent references. This
   * does not make shields/helmets of other stocks universally free. */
  readonly includedOptions?: readonly ResourceId[];
  /** Descriptive entitlement where appropriate to the property (BWGR p. 205),
   * not a count, NPC identity, relationship purchase or generation instruction. */
  readonly propertyBenefits?: { readonly staff: 'as-appropriate' };
  readonly printedPropertyStar?: boolean;
}

export interface ResourceQuestion {
  readonly id: string;
  readonly source: SourceReference;
  readonly observation: string;
  readonly recommendation: string;
}

/** Declarative arithmetic references, not a pricing evaluator. */
export interface ResourcePriceRules {
  readonly missiles: { readonly poor: Fraction; readonly poorRounding: 'up'; readonly superiorMultiplier: number };
  readonly armor: { readonly helmetAndBreastplate: Fraction; readonly greavesAndLeggings: Fraction;
    readonly partRounding: 'up'; readonly poor: Fraction; readonly poorRounding: 'up'; readonly superiorFullSuitMultiplier: number };
}
