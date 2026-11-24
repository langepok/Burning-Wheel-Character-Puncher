import type { ResourceDefinition } from '../data/resources';
import type { ResourceBurningChoices, ResourceConfiguration, ResourceFundingAllocation, ResourceItemDeclaration, ResourcePurchase, ResourceTotal } from '../character/resource-contracts';

export type ResourceCatalog = ReadonlyMap<string, ResourceDefinition>;
export interface ResourceReview { readonly questionId: string; readonly explanation: string }
export interface ResourceRequest {
  readonly id: string;
  readonly definitionId: string;
  readonly configuration: ResourceConfiguration;
  readonly links?: ResourcePurchase['links'];
  readonly declaredItems?: readonly ResourceItemDeclaration[];
  readonly funding?: readonly ResourceFundingAllocation[];
  readonly reviews?: readonly ResourceReview[];
  readonly override?: { readonly paidRps: number; readonly reason: string };
}
export interface ResourceIssue {
  readonly code: string;
  readonly message: string;
  readonly severity: 'error' | 'review';
  readonly blocking: boolean;
  readonly questionId?: string;
  readonly purchaseId?: string;
}
export type QuotedResourceCost = { readonly kind: 'known'; readonly rps: number }
  | { readonly kind: 'unknown'; readonly questionId: string }
  | { readonly kind: 'unavailable'; readonly reason: string };
export interface ResourceQuote {
  readonly cost: QuotedResourceCost;
  readonly status: 'available' | 'unavailable' | 'review' | 'override';
  readonly payableRps?: number;
  readonly funding?: readonly ResourceFundingAllocation[];
  readonly diagnostics: readonly ResourceIssue[];
  readonly companionRequirements?: { readonly maximumLifepaths: number | null; readonly maximumExponent: number | null; readonly reciprocalRelationshipRps: number; readonly ownGear: true };
}
export interface ResourcePool {
  readonly id: string;
  readonly origin: ResourceFundingAllocation['origin'];
  readonly settingId?: string;
  readonly grantedRps: number;
  readonly spentRps: number;
  readonly remainingRps: number;
  readonly unresolvedIds: readonly string[];
}
export interface ResourceBudget { readonly total: ResourceTotal; readonly pools: readonly ResourcePool[] }
/** Facts from another character / campaign, never a generated NPC or cached projection. */
export interface ResourceContext {
  readonly campaignLifepathLimit?: number;
  readonly campaignExponentCap?: number;
  readonly companions?: Readonly<Record<string, { readonly complete: boolean; readonly lifepathCount: number; readonly highestExponent: number; readonly reciprocalRelationshipRps: number; readonly ownGearPaid: boolean }>>;
  readonly accessConditions?: readonly { readonly poolId: string; readonly code: string; readonly message: string; readonly access: 'restricted' | 'unresolved' }[];
}
export interface ResourceBudgetOverride { readonly id: string; readonly rps: number; readonly reason: string }
export const defaultResourceChoices: ResourceBurningChoices = {
  roundUpResources:false, grayResources:{requested:false,gmPermissionRecorded:false},
};
