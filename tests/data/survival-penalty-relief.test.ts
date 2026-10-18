import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { ObstaclePenaltyRelief, SkillCatalogContent, SkillProcedure } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const relief = { kind: 'obstacle-penalty-relief', testObstacle: 5, trigger: 'success',
  targetPenalty: { kind: 'obstacle-penalty', target: 'existing-penalty', magnitude: 1 },
  effect: 'shrug-off', scope: 'source-unspecified', duration: 'source-unspecified' } as const;
const register = (procedure: unknown) => createSkillCatalog({ ...generalSkillTranscriptionContent,
  skills: generalSkillTranscriptionContent.skills.map(skill => skill.id === 'survival'
    ? { ...skill, procedures: [procedure] } : skill),
} as SkillCatalogContent);

describe('Survival named penalty relief', () => {
  it('preserves Ob 5 success against an existing +1 Ob penalty', () => {
    expectTypeOf<typeof relief>().toExtend<ObstaclePenaltyRelief>();
    expectTypeOf<typeof relief>().toExtend<SkillProcedure>();
    expect(catalog.skills.get('survival')?.procedures).toEqual([relief]);
  });
  it.each(['basic shelter Ob 1', 'basic water Ob 2', 'survival food Ob 3',
    'water or shelter in extreme conditions Ob 4', 'shrug off a +1 Ob penalty Ob 5'])('preserves guidance: %s', row => {
    expect(catalog.skills.get('survival')?.summary).toContain(row);
  });
  it('keeps scope and duration unspecified without universal negative modifiers or Injury inheritance', () => {
    const skill = catalog.skills.get('survival');
    expect(skill?.testProfile).toBeUndefined();
    expect(skill?.integrationTags).toEqual([]);
    expect(skill?.relations).toEqual([]);
    expect(skill?.procedures).toEqual([relief]);
  });
  it('preserves the source root, type, tools and FoRKs', () => {
    expect(catalog.skills.get('survival')).toMatchObject({ skillType: 'Forester', tools: { kind: 'traveling-gear' },
      rootRule: { kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'perception' }] } });
    expect(catalog.skills.get('survival')?.forkSuggestions?.suggestions).toEqual(
      ['foraging', 'hunting'].map(skillId => ({ target: { kind: 'skill', skillId } })));
  });
  it('round-trips declarative metadata without applying relief', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)));
    expect(restored.skills.get('survival')).toEqual(catalog.skills.get('survival'));
  });
  it.each([0, -1, 1.5, NaN, Infinity])('rejects invalid obstacle %s', testObstacle => {
    expect(() => register({ ...relief, testObstacle })).toThrow('Invalid penalty relief');
  });
  it.each([0, -1, 0.5, NaN, Infinity])('rejects invalid penalty magnitude %s', magnitude => {
    expect(() => register({ ...relief, targetPenalty: { ...relief.targetPenalty, magnitude } })).toThrow('Invalid penalty relief');
  });
  it.each([
    { scope: 'environmental-only' }, { scope: 'wound-only' }, { scope: 'any-penalty' },
    { duration: 'permanent' }, { duration: 'scene' }, { duration: 'one-test' },
    { trigger: 'failure' }, { effect: 'delete-permanently' }, { modifier: -1 },
    { inheritedProcedure: 'shrug-it-off' }, { healthTest: true },
    { targetPenalty: { kind: 'obstacle-penalty', target: 'future-tests', magnitude: 1 } },
    { targetPenalty: { kind: 'obstacle-penalty', target: 'existing-penalty', magnitude: 1, wound: 'superficial' } },
    { targetPenalty: null }, { targetPenalty: {} },
  ])('rejects malformed relief or invented execution semantics %j', fields => {
    expect(() => register({ ...relief, ...fields })).toThrow('Invalid penalty relief');
  });
});
