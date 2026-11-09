import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { ContextualTestEffect, SkillContext, SkillRecord } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const expected = [
  { effect: { kind: 'dice-bonus', dice: 1 }, when: { kind: 'force-attribute', quantifier: 'majority-of-troops', attributeId: 'hatred' } },
  { effect: { kind: 'obstacle-modifier', delta: 1 }, when: { kind: 'allOf', conditions: [
    { kind: 'force-classification', classification: 'non-dwarven' },
    { kind: 'anyOf', conditions: [{ kind: 'terrain', terrain: 'mountains' }, { kind: 'terrain', terrain: 'underground' }] },
  ] } },
  { effect: { kind: 'obstacle-modifier', delta: 1 }, when: { kind: 'allOf', conditions: [
    { kind: 'terrain', terrain: 'heavily-wooded-countryside' }, { kind: 'force-contains-mount', mountKind: 'war-mount' },
  ] } },
  { effect: { kind: 'obstacle-modifier', delta: 1 }, when: { kind: 'anyOf', conditions: [
    { kind: 'force-contains-trait', traitId: 'prince-of-the-blood' }, { kind: 'force-contains-trait', traitId: 'aman' },
    { kind: 'force-contains-trait', traitId: 'fea' }, { kind: 'force-contains-trait', traitId: 'dvergar' },
  ] } },
  { effect: { kind: 'obstacle-modifier', delta: 2 }, when: { kind: 'area-condition', condition: 'enemy-scorched-earth' } },
  { effect: { kind: 'obstacle-modifier', delta: 2 }, when: { kind: 'prior-test-in-context', skillId: 'logistics', area: 'same-countryside', within: 'last-resources-maintenance-cycle' } },
  { effect: { kind: 'obstacle-modifier', delta: 2 }, when: { kind: 'allOf', conditions: [
    { kind: 'season', season: 'winter' }, { kind: 'anyOf', conditions: [
      { kind: 'force-contains-mount', mountKind: 'war-mount' }, { kind: 'force-contains-mount', mountKind: 'riding-mount' },
      { kind: 'force-contains-mount', mountKind: 'pack-animal' },
    ] },
  ] } },
] as const;
function register(modifier: unknown) {
  return createSkillCatalog({ ...generalSkillTranscriptionContent,
    skills: generalSkillTranscriptionContent.skills.map(skill => skill.id === 'logistics'
      ? { ...skill, testProfile: { kind: 'contextual', modifiers: [modifier] } } as SkillRecord : skill) });
}
describe('Logistics contextual test metadata', () => {
  it('preserves all seven independent RAW effects and composed conditions', () => {
    expect(catalog.skills.get('logistics')?.testProfile).toEqual({ kind: 'contextual', modifiers: expected });
    expect(expected.map(modifier => modifier.effect)).toEqual([
      { kind: 'dice-bonus', dice: 1 }, ...[1, 1, 1, 2, 2, 2].map(delta => ({ kind: 'obstacle-modifier', delta })),
    ]);
    expectTypeOf(expected[0].when).toExtend<SkillContext>();
    expectTypeOf(expected[0].effect).toExtend<ContextualTestEffect>();
    expectTypeOf(expected[0].effect).not.toExtend<Extract<ContextualTestEffect, { kind: 'obstacle-modifier' }>>();
    expect(expected[0].when.quantifier).toBe('majority-of-troops');
    expect(expected[3].when.conditions.map(condition => condition.traitId)).toEqual(['prince-of-the-blood', 'aman', 'fea', 'dvergar']);
  });
  it('preserves source classification without stock thresholds and same-area/cycle history', () => {
    expect(expected[1].when.conditions[0]).toEqual({ kind: 'force-classification', classification: 'non-dwarven' });
    expect(expected[5].when).toEqual({ kind: 'prior-test-in-context', skillId: 'logistics', area: 'same-countryside', within: 'last-resources-maintenance-cycle' });
    expect(catalog.skills.get('logistics')?.testProfile).not.toHaveProperty('base');
    expect(catalog.skills.get('logistics')?.resourceInteractions).toEqual([]);
  });
  it('round-trips nested force/environment/history references without changing Inconspicuous', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)));
    expect(restored.skills.get('logistics')?.testProfile?.modifiers).toEqual(expected);
    expect(restored.skills.get('inconspicuous')?.testProfile?.modifiers?.map(modifier => modifier.effect)).toEqual(
      [1, 1, 1, 2].map(delta => ({ kind: 'obstacle-modifier', delta })));
  });
  it.each([
    { kind: 'force-attribute', quantifier: 'any', attributeId: 'hatred' },
    { kind: 'force-attribute', quantifier: 'majority-of-troops', attributeId: '' },
    { kind: 'force-classification', classification: 'non-dwarven', threshold: 0.5 },
    { kind: 'force-classification', stockId: 'dwarf' },
    { kind: 'force-contains-mount', mountKind: 'horse' },
    { kind: 'force-contains-trait', traitId: '' }, { kind: 'force-contains-trait', traitId: 'aman', quantifier: 'all' },
    { kind: 'terrain', terrain: 'anywhere' }, { kind: 'season', season: '' },
    { kind: 'area-condition', condition: 'devastated' },
    { kind: 'prior-test-in-context', skillId: 'logistics', area: 'any-area', within: 'last-resources-maintenance-cycle' },
    { kind: 'prior-test-in-context', skillId: 'logistics', area: 'same-countryside' },
    { kind: 'prior-test-in-context', skillId: 'missing', area: 'same-countryside', within: 'last-resources-maintenance-cycle' },
    { kind: 'allOf', conditions: [expected[0].when] },
    { kind: 'anyOf', conditions: [expected[0].when, { kind: 'force-contains-mount', mountKind: '' }] },
  ])('rejects malformed/dangling contexts %j', when => {
    expect(() => register({ effect: { kind: 'dice-bonus', dice: 1 }, when })).toThrow();
  });
  it.each([
    { kind: 'dice-bonus', dice: 0 }, { kind: 'dice-bonus', dice: 1.5 }, { kind: 'dice-bonus', delta: 1 },
    { kind: 'dice-bonus', dice: 1, delta: 1 }, { kind: 'obstacle-modifier', dice: 1 },
    { kind: 'obstacle-modifier', delta: 0 }, { kind: 'obstacle-modifier', delta: Infinity },
    { kind: 'formula', expression: 'countTroops()' },
  ])('rejects malformed/cross-unit effects %j', effect => {
    expect(() => register({ effect, when: expected[0].when })).toThrow();
  });
});
