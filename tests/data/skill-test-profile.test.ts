import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { SkillRecord, SkillTestProfile, SkillContext } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';
import { testProfileFixtureContent } from '../../src/data/skills/test-profile-fixtures';

const expected = {
  kind: 'versus', opposingAbilities: [{ kind: 'skill', skillId: 'observation' }], modifiers: [
    { effect: { kind: 'obstacle-modifier', delta: 1 }, when: { kind: 'anyOf', conditions: [{ kind: 'attire', attire: 'garish' }, { kind: 'attire', attire: 'inappropriate' }] } },
    { effect: { kind: 'obstacle-modifier', delta: 1 }, when: { kind: 'anyOf', conditions: [{ kind: 'social-station-mismatch', position: 'above', relativeTo: 'appropriate-social-station' }, { kind: 'social-station-mismatch', position: 'below', relativeTo: 'appropriate-social-station' }] } },
    { effect: { kind: 'obstacle-modifier', delta: 1 }, when: { kind: 'regional-origin-mismatch', relativeTo: 'current-region' } },
    { effect: { kind: 'obstacle-modifier', delta: 2 }, when: { kind: 'stock-mismatch', relativeTo: 'target-crowd' } },
  ],
} as const;
const catalog = createSkillCatalog(generalSkillTranscriptionContent);
function register(testProfile: unknown) {
  return createSkillCatalog({ ...generalSkillTranscriptionContent, skills: generalSkillTranscriptionContent.skills.map(skill =>
    skill.id === 'inconspicuous' ? { ...skill, testProfile } as SkillRecord : skill) });
}

describe('Skill-level opposed-test metadata', () => {
  it('preserves all four independent Inconspicuous penalties and Observation opposition', () => {
    expectTypeOf<typeof expected>().toExtend<SkillTestProfile>();
    expect(catalog.skills.get('inconspicuous')?.testProfile).toEqual(expected);
    expect(expected.modifiers.map(modifier => modifier.effect.delta)).toEqual([1, 1, 1, 2]);
    expect(catalog.skills.get('inconspicuous')?.integrationTags).toEqual([]);
    expect(catalog.skills.get('inconspicuous')?.resourceInteractions).toEqual([]);
  });
  it('preserves comparison to the environment rather than identifying a target origin/stock', () => {
    expectTypeOf<typeof expected.modifiers[2]['when']>().toExtend<SkillContext>();
    expect(expected.modifiers[2].when).toEqual({ kind: 'regional-origin-mismatch', relativeTo: 'current-region' });
    expect(expected.modifiers[3].when).toEqual({ kind: 'stock-mismatch', relativeTo: 'target-crowd' });
  });
  it('represents multiple Observation opponents and the Stealthy opponent without guessing advantages', () => {
    const fixtures = createSkillCatalog(testProfileFixtureContent);
    expect(fixtures.skills.get('observation')?.testProfile?.opposingAbilities).toEqual(
      ['inconspicuous', 'stealthy', 'sleight-of-hand', 'trapper'].map(skillId => ({ kind: 'skill', skillId })));
    expect(fixtures.skills.get('stealthy')?.testProfile).toEqual({ kind: 'versus', opposingAbilities: [{ kind: 'skill', skillId: 'observation' }] });
    expect(catalog.skills.has('observation')).toBe(false);
    expect(catalog.skills.has('stealthy')).toBe(false);
  });
  it.each([generalSkillTranscriptionContent, testProfileFixtureContent])('round trips declarative profiles through catalog validation', content => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(content)) as typeof content);
    for (const skill of content.skills) expect(restored.skills.get(skill.id)?.testProfile).toEqual(skill.testProfile);
  });
  it('rejects unresolved opposing identities', () => {
    expect(() => register({ ...expected, opposingAbilities: [{ kind: 'skill', skillId: 'missing' }] })).toThrow('Unknown skill reference');
  });
  it.each([
    null, { ...expected, kind: 'standard' }, { ...expected, opposingAbilities: [] },
    { ...expected, opposingAbilities: [{ kind: 'stat', id: 'perception' }] },
    { ...expected, opposingAbilities: [{ kind: 'skill', skillId: '' }] },
    { ...expected, modifiers: 'dress penalty' },
    ...[0, 1.5, NaN, Infinity].map(delta => ({ ...expected, modifiers: [{ effect: { kind: 'obstacle-modifier', delta }, when: expected.modifiers[2].when }] })),
    { ...expected, modifiers: [{ kind: 'dice', delta: 1, when: expected.modifiers[2].when }] },
    { ...expected, modifiers: [{ effect: { kind: 'obstacle-modifier', delta: 1 } }] },
  ])('rejects malformed profiles/modifiers %j', value => {
    expect(() => register(value)).toThrow();
  });
  it.each([
    'inappropriate attire', null, {}, { kind: 'attire', attire: 'any-clothing' },
    { kind: 'social-station-mismatch', position: 'station-id' },
    { kind: 'social-station-mismatch', position: 'above' },
    { kind: 'social-station-mismatch', position: 'above', relativeTo: 'target-station' },
    { kind: 'regional-origin-mismatch', relativeTo: 'target-origin' },
    { kind: 'stock-mismatch', relativeTo: 'target-stock' },
    { kind: 'anyOf', conditions: [{ kind: 'attire', attire: 'garish' }] },
    { kind: 'anyOf', conditions: [{ kind: 'attire', attire: 'garish' }, { kind: 'attire', attire: 'unknown' }] },
  ])('rejects malformed structured context %j', when => {
    expect(() => register({ ...expected, modifiers: [{ effect: { kind: 'obstacle-modifier', delta: 1 }, when }] })).toThrow();
  });
});
