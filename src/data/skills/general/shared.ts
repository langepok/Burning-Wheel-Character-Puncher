import type { FixedRoot, ForkGuidance, ForkSuggestion, SkillDefinition, SkillMetadata, SkillSource, ToolRequirement } from '../types';

export const evidence = (name: string, page: number): SkillSource => ({
  kind: 'audit-packet',
  url: 'https://github.com/langepok/Burning-Wheel-Character-Puncher/blob/skill-catalog-general-a-z/docs/audits/GENERAL_SKILL_CATALOG_AZ.md',
  section: `BWGR (2018): ${name}`, pages: { printed: [page], pdf: [page + 2] },
});
export const stat = (id: string): FixedRoot => ({ kind: 'single', ability: { kind: 'stat', id } });
export const combined = (first: string, second: string): FixedRoot => ({ kind: 'combined',
  abilities: [{ kind: 'stat', id: first }, { kind: 'stat', id: second }] });
export const hatred: FixedRoot = { kind: 'single', ability: { kind: 'attribute', id: 'hatred' } };
export const none: ToolRequirement = { kind: 'none', expendable: false };
export const generic: ToolRequirement = { kind: 'generic' };
export const expendable: ToolRequirement = { kind: 'generic', expendable: true };
export const workshop: ToolRequirement = { kind: 'workshop' };
export const traveling: ToolRequirement = { kind: 'traveling-gear' };
export const item = (name: string): ToolRequirement => ({ kind: 'specific-item', item: name });
export const writingTools: ToolRequirement = { kind: 'conditional', when: { kind: 'activity', activity: 'writing' },
  then: expendable, otherwise: none };
export const fork = (skillId: string): ForkSuggestion => ({ target: { kind: 'skill', skillId } });
export const sourceFork = (sourceLabel: string, probableTargetSkillId?: string): ForkSuggestion => ({
  target: { kind: 'unresolved-source-reference', sourceLabel, ...(probableTargetSkillId ? { probableTargetSkillId } : {}) },
});
export const guidance = (...suggestions: ForkSuggestion[]): ForkGuidance => ({ policy: 'guidance-not-whitelist',
  manualContextualContributors: true, suggestions });
export const forks = (...ids: string[]) => guidance(...ids.map(fork));
export const melee: ForkSuggestion = { target: { kind: 'category', category: 'melee-weapon', relevance: 'appropriate' } };
export const only = (ids: string[], scope: 'always' | 'character-burning' = 'always') =>
  [{ kind: 'stock-only', stockIds: ids, scope }] as const;
export const magical = { printedMarkers: ['§'], rollBehavior: { kind: 'open-ended', basis: 'magical' } } as const;
export const training = { kind: 'training', rootPurpose: 'aptitude-and-practice', exponent: 'none',
  advancement: 'none', openingCost: 2 } as const;

/** Empty fields follow the reviewed General entry, not an omitted partial fixture.
 * Default exponent/roll behavior follows the Skill List introduction; exceptions
 * are authored explicitly. This helper neither infers markers/types nor evaluates rules.
 */
export function define(id: string, sourceName: string, page: number, summary: string,
  metadata: Pick<SkillMetadata, 'rootRule' | 'skillType' | 'tools'> & Partial<SkillMetadata>): SkillDefinition {
  return { id, sourceName, coverage: 'complete', summary, source: [evidence(sourceName, page)],
    availabilityRestrictions: [], openingRequirements: [], useRequirements: [],
    training: { kind: 'exponent', rootPurpose: 'opening', advancement: 'standard' }, rollBehavior: { kind: 'standard' },
    printedMarkers: [], forkSuggestions: guidance(), relations: [], capabilities: [], resourceInteractions: [],
    integrationTags: [], ...metadata };
}
