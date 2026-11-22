/** M3-A2 boundary contracts only. No commands, projection runtime, draft schema
 * migration, inventory simulation or automatic integration with Sheet in M3-A1. */
import type { LifepathVariantId, SkillId, SourceReference, StockId } from '../data/catalog';
import type { ArmorPiece, RelationshipSignificance, ResourceId, ResourceQuality } from '../data/resources';
import type { Ability } from '../rules/burning';
import type { BuildMode } from './lifepath-history';

export type ResourcePurchaseId = string;
export type ResourceItemId = string;

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
      readonly substitutions: readonly { readonly itemId: ResourceItemId; readonly armorDefinitionId: ResourceId; readonly note: string }[] }
  | { readonly kind: 'skill-kit'; readonly skillId: SkillId; readonly description: string }
  | { readonly kind: 'relationship'; readonly npcName: string; readonly description: string; readonly significance: RelationshipSignificance;
      readonly family: 'none' | 'immediate' | 'other'; readonly romantic: boolean; readonly forbidden: boolean; readonly hateful: boolean;
      readonly additionalConditions: string }
  | { readonly kind: 'companion'; readonly npcName: string; readonly description: string; readonly linkedCharacterId: string }
  | { readonly kind: 'social'; readonly dice: 1 | 2 | 3; readonly organizationId: string; readonly description: string; readonly scope: string }
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
    readonly source: readonly SourceReference[];
    readonly overrides: readonly { readonly code: string; readonly explanation: string }[];
    /** Sum must equal originalPaidRps. Refund restores these same pools. */
    readonly funding: readonly {
      readonly poolId: string;
      readonly paidRps: number;
      readonly origin: { readonly kind: 'lifepath'; readonly variantId: LifepathVariantId; readonly occurrence: number }
        | { readonly kind: 'override'; readonly reason: string };
      readonly access: 'available' | 'outlaw-locked';
    }[];
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
  readonly budget: ResourceTotal;
  readonly spentRps: number;
  readonly remaining: ResourceTotal;
  readonly qualifyingSpend: { readonly resourcesRps: number; readonly circlesRps: ResourceTotal };
  readonly startingResources: { readonly rawExponent: number; readonly ability: Ability;
    readonly manualRoundUpApplied: boolean; readonly rawSoCloseEligible: boolean | 'unknown' };
  readonly startingCircles: { readonly ability: Ability | null; readonly propertyAndRelationshipBonus: 0 | 1 | 'unresolved' };
  /** Physical declarations stay separate from social/spell acquisitions. */
  readonly items: readonly (ResourceItemDeclaration & { readonly purchaseId: ResourcePurchaseId;
    readonly modificationPurchaseIds: readonly ResourcePurchaseId[] })[];
  readonly socialBonuses: readonly { readonly purchaseId?: ResourcePurchaseId; readonly traitId?: string;
    readonly kind: 'affiliation' | 'reputation'; readonly dice: number; readonly organizationId: string }[];
  readonly diagnostics: readonly { readonly code: string; readonly purchaseId?: ResourcePurchaseId;
    readonly questionId?: string; readonly severity: 'error' | 'review'; readonly message: string }[];
}
