import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { ItemSearch, SkillCatalogContent, SkillProcedure } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const skill = catalog.skills.get('scavenging')!;
const search = skill.procedures![0] as ItemSearch;
const register = (procedure: unknown) => createSkillCatalog({ ...generalSkillTranscriptionContent,
  skills: generalSkillTranscriptionContent.skills.map(record => record.id === skill.id ? { ...record, procedures: [procedure] } : record),
} as SkillCatalogContent);

describe('Scavenging typed request constraints and manual source guidance', () => {
  it('allows player-declared item types and explicitly excludes specific/unique requests', () => {
    expectTypeOf<typeof search>().toExtend<SkillProcedure>();
    expect(search.kind).toBe('item-search');
    expect(search.request).toEqual({ declaredBy: 'player', granularity: 'item-type',
      specificItemAllowed: false, uniqueItemAllowed: false, resolution: 'manual' });
    expect(search).not.toHaveProperty('classifier');
    expect(search).not.toHaveProperty('onSuccess');
    expect(search).not.toHaveProperty('inventory');
  });
  it('requires a contextually suitable place and keeps location examples non-exhaustive', () => {
    expect(search.contextRequirement).toEqual({ kind: 'suitable-location', purpose: 'scavenging',
      resolution: 'contextual', examplesPolicy: 'non-exhaustive', examples: ['midden', 'ruin', 'battlefield'] });
    const anotherExample = { ...search, contextRequirement: { ...search.contextRequirement, examples: ['another-source-guidance-location'] } };
    expect(() => register(anotherExample)).not.toThrow();
    expect(search.contextRequirement).not.toHaveProperty('allowedLocations');
  });
  it.each([
    ['detritus-or-junk', 1, ['rags', 'scraps']],
    ['common-household-goods', 2, ['clothing', 'food', 'cookware']],
    ['hard-to-find-items', 3, ['medicine', 'weapons', 'tools']],
    ['valuable-items', 4, ['money', 'antiques']],
    ['rare-objects', 5, ['documents', 'books', 'specialized tools']],
    ['obscure-or-out-of-place-items', 6, ['oddities', 'head in a jar', 'crown']],
  ])('preserves %s at Ob %s with illustrative examples', (id, obstacle, examples) => {
    expect(search.obstacleGuidance.categories.find(category => category.id === id)).toMatchObject({ id, obstacle, examples });
  });
  it('does not make categories/examples an item taxonomy or outcome generator', () => {
    expect(search.obstacleGuidance.resolution).toBe('contextual');
    expect(search.obstacleGuidance.examplesPolicy).toBe('non-exhaustive');
    expect(search.obstacleGuidance.categories).toHaveLength(6);
    const categories = search.obstacleGuidance.categories.map((category, i) => i ? category : { ...category, examples: ['another-illustrative-item'] });
    expect(() => register({ ...search, obstacleGuidance: { ...search.obstacleGuidance, categories } })).not.toThrow();
    search.obstacleGuidance.categories.forEach(category => expect(category).not.toHaveProperty('itemIds'));
  });
  it('preserves root, tools, printed type and open appropriate Wise FoRK guidance', () => {
    expect(skill.rootRule).toEqual({ kind: 'single', ability: { kind: 'stat', id: 'perception' } });
    expect(skill.skillType).toBe('Peasant');
    expect(skill.tools).toEqual({ kind: 'none', expendable: false });
    expect(skill.forkSuggestions?.suggestions).toEqual([{ target: { kind: 'skill', skillId: 'foraging' } },
      { target: { kind: 'skill-family', familyId: 'wises', relevance: 'appropriate' } }]);
    expect(skill.resourceInteractions).toEqual([]);
  });
  it('serializes request, contextual requirement and obstacle categories independently', () => {
    expect(createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent))).skills.get(skill.id)?.procedures).toEqual([search]);
  });
  it.each([
    null, { ...search, kind: 'spawn-item' },
    { ...search, request: { ...search.request, granularity: 'specific-item' } },
    { ...search, request: { ...search.request, specificItemAllowed: true } },
    { ...search, request: { ...search.request, uniqueItemAllowed: true } },
    { ...search, request: { ...search.request, resolution: 'text-classifier' } },
    { ...search, contextRequirement: { ...search.contextRequirement, resolution: 'world-evaluator' } },
    { ...search, contextRequirement: { ...search.contextRequirement, examplesPolicy: 'whitelist' } },
    { ...search, contextRequirement: { ...search.contextRequirement, allowedLocations: ['ruin'] } },
    { ...search, obstacleGuidance: { ...search.obstacleGuidance, examplesPolicy: 'whitelist' } },
    { ...search, obstacleGuidance: { ...search.obstacleGuidance, categories: [] } },
    { ...search, obstacleGuidance: { ...search.obstacleGuidance, categories: [{ id: 'junk', label: 'Junk', obstacle: 0, examples: [] }] } },
    { ...search, obstacleGuidance: { ...search.obstacleGuidance, categories: [{ ...search.obstacleGuidance.categories[0], itemIds: ['rag'] }] } },
    { ...search, obstacleGuidance: { ...search.obstacleGuidance, categories: [search.obstacleGuidance.categories[0], search.obstacleGuidance.categories[0]] } },
    { ...search, onSuccess: { spawnItem: true } },
  ])('rejects malformed search metadata or invented runtime semantics %j', value => {
    expect(() => register(value)).toThrow('Invalid');
  });
});
