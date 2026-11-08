import { describe, expect, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';
import { humanContent } from '../../src/data/human';
import type { RequirementNode } from '../../src/data/catalog';
import { generalSkillManifest } from './general-skill-manifest';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
// Source-audited acquisition option, not a standalone General heading or a stock restriction.
const sourceOptions = new Set(['mounted-combat-bowman-training']);
// Explicit source-authored History topic references; never infer topic identity from a label.
const historyTopics = new Set(['ancient-history', 'obscure-history']);
const classification = (id: string) => catalog.skills.has(id) ? 'general'
  : catalog.choices.has(id) ? 'choice' : historyTopics.has(id) ? 'general-family-topic' : sourceOptions.has(id) ? 'out-of-heading-scope' : 'unresolved';
const requirementSkills = (nodes: readonly RequirementNode[]): string[] => nodes.flatMap(node =>
  node.kind === 'allOf' || node.kind === 'anyOf' ? requirementSkills(node.items)
    : node.kind === 'priorLifepathSkillListContains' ? [node.skillId] : []);

describe('General catalog identity and core fields, and known lifepath references', () => {
  it('covers every manifest identity exactly once in the correct kind, without canonical reference-only placeholders', () => {
    expect(generalSkillManifest).toHaveLength(427);
    expect(catalog.skills.size).toBe(424);
    expect(catalog.families.size).toBe(2);
    expect(catalog.choices.size).toBe(1);
    for (const entry of generalSkillManifest) {
      const matches = [catalog.skills, catalog.families, catalog.choices, catalog.references].filter(map => map.has(entry.id));
      expect(matches, entry.id).toHaveLength(1);
    }
    expect(new Set([...catalog.skills.values()].map(skill => skill.sourceName)).size).toBe(424);
    for (const skill of catalog.skills.values()) {
      expect(skill.coverage, skill.id).toBe('complete');
      expect(skill.source.length, skill.id).toBeGreaterThan(0);
      for (const field of ['rootRule', 'skillType', 'tools', 'training', 'rollBehavior', 'availabilityRestrictions',
        'openingRequirements', 'useRequirements', 'forkSuggestions', 'relations', 'capabilities', 'resourceInteractions', 'integrationTags'])
        expect(skill, `${skill.id}.${field}`).toHaveProperty(field);
    }
  });
  it('keeps four non-heading source references explicit rather than pretending they are complete General skills', () => {
    expect([...catalog.references.keys()].sort()).toEqual(['ancient-history', 'escape-artist', 'mounted-combat-bowman-training', 'obscure-history']);
    for (const id of historyTopics) {
      expect(classification(id)).toBe('general-family-topic');
      expect(catalog.references.get(id)?.source[0]).toMatchObject({ pages: { printed: [277], pdf: [279] } });
    }
    expect(catalog.families.get('history')?.ownership).toBe('separate-skill-per-topic');
    expect(classification('mounted-combat-bowman-training')).toBe('out-of-heading-scope');
    expect(classification('escape-artist')).toBe('unresolved');
    expect(classification('appropriate-weapons')).toBe('choice');
    expect(classification('not-an-audited-reference')).toBe('unresolved');
  });
  it('resolves all three current registered lifepath references as General without fuzzy source-name matching', () => {
    expect(humanContent.skills.map(skill => skill.id).sort()).toEqual(['bow', 'javelin', 'sorcery']);
    for (const reference of humanContent.skills) {
      expect(classification(reference.id)).toBe('general');
      expect(catalog.skills.get(reference.id)?.sourceName).toBe(reference.sourceName);
    }
  });
  it('resolves four known uses of three skill IDs across 60 partial lifepath skill lists', () => {
    expect(humanContent.lifepaths).toHaveLength(60);
    const uses = humanContent.lifepaths.flatMap(lifepath => [
      ...lifepath.skillListMetadata.knownEntries.flatMap(entry => entry.kind === 'skill' ? [entry.skillId] : [...entry.skillIds]),
      ...requirementSkills(lifepath.requirements),
    ]);
    expect(uses).toHaveLength(4);
    expect([...new Set(uses)].sort()).toEqual(['bow', 'javelin', 'sorcery']);
    for (const id of uses) expect(classification(id)).toBe('general');
    expect(humanContent.lifepaths.every(lifepath => lifepath.skillListMetadata.completeness === 'partial')).toBe(true);
  });
});
