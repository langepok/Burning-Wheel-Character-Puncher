/** Acquisition contracts shared by the headless engine and future UI. */
import type { LifepathVariantId, SkillId, SourceReference, StockId } from '../data/catalog';
import type { ArmorPiece, RelationshipSignificance, ResourceId, ResourceQuality } from '../data/resources';
import type { Ability } from '../rules/burning';
import type { BuildMode } from './lifepath-history';

export type ResourcePurchaseId = string;
export type ResourceItemId = string;

/** User-authored fiction; never parsed for price, dice, hostility or eligibility. */
export interface ResourceSocialDescription {
  readonly name: string;
  readonly description: string;
}

/** A descriptive organization/audience is sufficient without a registry entry.
 * RAW scope/limits still apply; an optional ID is only a structural link. No
 * universal reputation polarity or computed audience reaction is prescribed. */
export type ResourceSocialContext = ResourceSocialDescription & {
  readonly organizationId?: string;
  readonly scope: string;
} & (
  | { readonly kind: 'affiliation' }
  | { readonly kind: 'reputation'; readonly audience: string }
);

/** Historical source/charge only. Neither buying nor refunding Outlaw changes
 * this record. Refund returns the original charge to the same original pool. */
export interface ResourceFundingAllocation {
  readonly poolId: string;
  readonly paidRps: number;
  readonly origin: { readonly kind: 'lifepath'; readonly variantId: LifepathVariantId; readonly occurrence: number }
    | { readonly kind: 'override'; readonly reason: string };
}

/** Current derived access to a source's resources/assets, recomputed from active
 * traits and conditions. This is NOT a spending prohibition: Outlaw explicitly
 * permits spending the affected rps. Mixed funding/starting projections remain
 * subject to the existing unresolved RAW question. Never persist as provenance. */
export interface ResourceFundingAccess {
  readonly poolId: string;
  readonly access: 'available' | 'restricted' | 'unresolved';
  readonly reasons: readonly { readonly code: string; readonly traitId?: string; readonly message: string }[];
}

/** A declaration of a physical object, not its equipment slots or attack rows. */
export interface ResourceItemDeclaration {
  readonly id: ResourceItemId;
  readonly name: string;
  readonly kind: 'weapon' | 'armor' | 'shield' | 'other';
  readonly weaponKind?: 'axe' | 'spear' | 'polearm' | 'other';
  readonly quality?: ResourceQuality;
  /** Future external profile references: several profiles may share this item. */
  readonly profileIds?: readonly string[];
  readonly source: readonly SourceReference[];
}

export type ResourceConfiguration =
  | { readonly kind: 'plain'; readonly description: string }
  | { readonly kind: 'quality'; readonly quality: ResourceQuality; readonly description: string }
  | { readonly kind: 'armor'; readonly quality: ResourceQuality; readonly piece: ArmorPiece;
      /** Empty by default. No shield is inferred from the chosen armor piece.
       * Selection refers to optional catalog components; no full-suit-only rule. */
      readonly selectedIncludedDefinitionIds: readonly ResourceId[];
      readonly substitutions: readonly { readonly itemId: ResourceItemId; readonly armorDefinitionId: ResourceId; readonly note: string }[] }
  | { readonly kind: 'skill-kit'; readonly skillId: SkillId; readonly description: string }
  | (ResourceSocialDescription & { readonly kind: 'relationship'; readonly npcName: string; readonly significance: RelationshipSignificance;
      readonly family: 'none' | 'immediate' | 'other'; readonly romantic: boolean; readonly forbidden: boolean; readonly hateful: boolean;
      readonly additionalConditions: string })
  | (ResourceSocialDescription & { readonly kind: 'companion'; readonly npcName: string; readonly linkedCharacterId: string })
  | (ResourceSocialContext & { readonly dice: 1 | 2 | 3 })
  | { readonly kind: 'gang'; readonly organizationId: string; readonly seniorRelationshipPurchaseId: ResourcePurchaseId;
      readonly affiliationPurchaseId: ResourcePurchaseId; readonly reputationPurchaseId: ResourcePurchaseId }
  | { readonly kind: 'addition'; readonly description: string };

export interface ResourcePurchase {
  readonly id: ResourcePurchaseId; // Never the catalog ID: duplicate acquisitions are legal.
  readonly definitionId: ResourceId;
  readonly configuration: ResourceConfiguration;
  /** Immutable actual debit, not today's calculated catalog price. Containers pay 0;
   * their children own their debits. An included child pays 0 only with a valid parent. */
  readonly originalPaidRps: number;
  readonly provenance: {
    readonly mode: BuildMode;
    readonly origin: 'catalog' | 'free-creation';
    readonly catalogRevision: string;
    /** Original quotation is historical; current legality is evaluated separately. */
    readonly quotedCost?: import('../rules/resource-types').QuotedResourceCost;
    readonly reviews?: readonly import('../rules/resource-types').ResourceReview[];
    readonly reviewContext?: string;
    readonly source: readonly SourceReference[];
    readonly overrides: readonly { readonly code: string; readonly explanation: string }[];
    /** Sum must equal originalPaidRps. Refund restores these same pools. */
    readonly funding: readonly ResourceFundingAllocation[];
  };
  readonly links: {
    readonly parentPurchaseId?: ResourcePurchaseId;
    readonly targetItemId?: ResourceItemId; // Required for physical-weapon modifications.
    readonly groupPurchaseId?: ResourcePurchaseId;
  };
  readonly declaredItems: readonly ResourceItemDeclaration[];
}

export interface ResourceBurningChoices {
  readonly roundUpResources: boolean; // Default false, manual D-035 provenance.
  readonly grayResources: { readonly requested: boolean; readonly gmPermissionRecorded: boolean };
}

export type ResourceTotal = { readonly kind: 'known'; readonly rps: number }
  | { readonly kind: 'incomplete'; readonly knownRps: number; readonly unresolvedIds: readonly string[] };

export interface ResourceProjection {
  readonly stockId: StockId;
  /** Starting expendable cash dice; spending them during play is outside this engine. */
  readonly cashDice?: number;
  /** Numeric fields remain useful draft previews; unresolved values are not certified. */
  readonly calculationStatus?: { readonly resources: 'known' | 'unresolved'; readonly circles: 'known' | 'unresolved' };
  readonly budget: ResourceTotal;
  readonly spentRps: number;
  readonly remaining: ResourceTotal;
  /** Recomputed on trait/context changes, Undo/Redo and import; not historical flags. */
  readonly fundingAccess: readonly ResourceFundingAccess[];
  readonly qualifyingSpend: { readonly resourcesRps: number; readonly circlesRps: ResourceTotal };
  readonly startingResources: { readonly rawExponent: number; readonly ability: Ability;
    readonly manualRoundUpApplied: boolean; readonly rawSoCloseEligible: boolean | 'unknown' };
  readonly startingCircles: { readonly ability: Ability | null; readonly propertyAndRelationshipBonus: 0 | 1 | 'unresolved' };
  /** Physical declarations stay separate from social/spell acquisitions. */
  readonly items: readonly (ResourceItemDeclaration & { readonly purchaseId: ResourcePurchaseId;
    readonly modificationPurchaseIds: readonly ResourcePurchaseId[] })[];
  readonly socialBonuses: readonly (ResourceSocialContext & { readonly purchaseId?: ResourcePurchaseId;
    readonly traitId?: string; readonly dice: number })[];
  readonly diagnostics: readonly { readonly code: string; readonly purchaseId?: ResourcePurchaseId;
    readonly questionId?: string; readonly severity: 'error' | 'review'; readonly message: string }[];
}
