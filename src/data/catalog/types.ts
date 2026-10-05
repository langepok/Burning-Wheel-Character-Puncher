export type StockId = string;
export type SettingId = string;
export type LifepathVariantId = string;
export type LifepathFamilyId = string;
export type SkillId = string;

export interface SourceReference {
  readonly document: string;
  readonly section: string;
  readonly printedPages: readonly number[];
  readonly pdfPages: readonly number[];
}

export interface StockDefinition {
  readonly id: StockId;
  readonly sourceName: string;
}

export interface SettingDefinition {
  readonly id: SettingId;
  readonly stockId: StockId;
  readonly sourceName: string;
  readonly uiQualifier: string;
  /** Referenced destinations need not have their complete definition loaded yet. */
  readonly coverage: 'loaded' | 'reference-only';
  readonly kind?: 'setting' | 'subsetting';
  readonly aliases: readonly string[];
}

/** A named reference is not a selectable row or a claim that its grants are known. */
export interface FamilyDefinition {
  readonly id: LifepathFamilyId;
  readonly stockId: StockId;
  readonly sourceName: string;
  readonly coverage: 'loaded' | 'reference-only';
  readonly source: SourceReference;
}

export interface SkillReference {
  readonly id: SkillId;
  readonly sourceName: string;
}

export const semanticTags = [
  'acolyte', 'sergeant', 'guard', 'horse-related', 'priest', 'sorcerous',
  'female-gender-specific',
] as const;
export type SemanticTag = typeof semanticTags[number];

export type StatGrant =
  | { readonly kind: 'none' }
  | { readonly kind: 'mental'; readonly amount: number }
  | { readonly kind: 'physical'; readonly amount: number }
  | { readonly kind: 'chooseMentalOrPhysical'; readonly amount: number }
  | { readonly kind: 'mentalAndPhysical'; readonly mental: number; readonly physical: number };

export type LeadDefinition =
  | { readonly kind: 'to'; readonly settingIds: readonly SettingId[] }
  | { readonly kind: 'any' }
  | { readonly kind: 'anyExcept'; readonly excludedSettingIds: readonly SettingId[] };

/** Declarative predicates only. This module does not evaluate character legality. */
export type RequirementNode =
  | { readonly kind: 'allOf' | 'anyOf'; readonly items: readonly RequirementNode[] }
  | { readonly kind: 'position'; readonly mode: 'only' | 'except'; readonly positions: readonly number[] }
  | { readonly kind: 'maxOccurrences'; readonly count: number }
  | { readonly kind: 'priorFamily'; readonly familyId: LifepathFamilyId }
  | { readonly kind: 'priorSetting'; readonly settingId: SettingId }
  | { readonly kind: 'priorSemanticTag'; readonly tag: SemanticTag }
  | { readonly kind: 'characterGender'; readonly gender: 'female' | 'male' }
  | { readonly kind: 'finalLifepathCountAtMost'; readonly count: number }
  | { readonly kind: 'finalStartingAgeGreaterThan'; readonly age: number }
  | { readonly kind: 'priorLifepathSkillListContains'; readonly skillId: SkillId };

export type DerivedSkillPointScope = 'ordinary-only' | 'ordinary-and-general' | 'unspecified';

export interface WifeDerivedGrant {
  readonly id: string;
  readonly kind: 'wifeDerivedGrant';
  readonly husbandSettingId: SettingId;
  readonly skillPointScope: DerivedSkillPointScope;
  readonly skillFraction: 0.5;
  readonly skillRounding: 'down';
  readonly resourceFraction: 0.5;
  // No resource-rounding policy is supplied by these catalog audit notes.
  readonly source: SourceReference;
}

export type ResourceGrant =
  | { readonly kind: 'fixed'; readonly amount: number }
  | { readonly kind: 'wifeDerived'; readonly base: number; readonly specialRuleId: string };

/** Only audited metadata; absence from known entries does not imply absence from the full list. */
export type SkillListEntry =
  | { readonly kind: 'skill'; readonly skillId: SkillId }
  | { readonly kind: 'oneOf'; readonly skillIds: readonly SkillId[] };

export interface LifepathDefinition {
  readonly variantId: LifepathVariantId;
  readonly familyId: LifepathFamilyId;
  readonly stockId: StockId;
  readonly settingId: SettingId;
  readonly sourceName: string;
  readonly isBorn: boolean;
  readonly years: number;
  readonly resourceGrant: ResourceGrant;
  readonly statGrant: StatGrant;
  readonly leads: LeadDefinition;
  readonly skillPointGrant: { readonly ordinary: number; readonly general: number };
  readonly traitPointGrant: number;
  readonly requirements: readonly RequirementNode[];
  readonly semanticTags: readonly SemanticTag[];
  readonly semanticTagSource?: string;
  readonly skillListMetadata: { readonly completeness: 'partial'; readonly knownEntries: readonly SkillListEntry[] };
  readonly specialRules: readonly WifeDerivedGrant[];
  readonly source: SourceReference;
}

export interface CatalogContent {
  readonly stocks: readonly StockDefinition[];
  readonly settings: readonly SettingDefinition[];
  readonly families: readonly FamilyDefinition[];
  readonly skills: readonly SkillReference[];
  readonly lifepaths: readonly LifepathDefinition[];
}

export interface GameCatalog {
  readonly stocks: ReadonlyMap<StockId, StockDefinition>;
  readonly settings: ReadonlyMap<SettingId, SettingDefinition>;
  readonly families: ReadonlyMap<LifepathFamilyId, FamilyDefinition>;
  readonly skills: ReadonlyMap<SkillId, SkillReference>;
  readonly lifepaths: ReadonlyMap<LifepathVariantId, LifepathDefinition>;
}
