import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { ManualTestAdjustment, ObstacleBasis, SkillRecord, SkillTestProfile } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';
import { targetObstacleFixtureContent } from '../../src/data/skills/target-obstacle-fixtures';

const base = { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' } as const;
const adjustments = [
  { kind: 'manual', source: 'target-traits', quantity: 'unquantified' },
  { kind: 'manual', source: 'situational-disadvantage', quantity: 'unquantified', examples: [
    { kind: 'target-belief', constraint: 'prevents-disclosure-of-sought-information' },
  ] },
] as const;
const expected = { kind: 'obstacle', base, adjustments } as const;
const catalog = createSkillCatalog(generalSkillTranscriptionContent);
function register(testProfile: unknown) {
  return createSkillCatalog({ ...generalSkillTranscriptionContent, skills: generalSkillTranscriptionContent.skills.map(skill =>
    skill.id === 'interrogation' ? { ...skill, testProfile } as SkillRecord : skill) });
}

describe('Target-derived obstacle facts', () => {
  it('preserves current target Will and the two independent unquantified sources', () => {
    expectTypeOf<typeof base>().toExtend<ObstacleBasis>();
    expectTypeOf<typeof expected>().toExtend<SkillTestProfile>();
    expectTypeOf<typeof adjustments[0]>().toExtend<ManualTestAdjustment>();
    expect(catalog.skills.get('interrogation')?.testProfile).toEqual(expected);
    expect(catalog.skills.get('interrogation')?.resourceInteractions).toEqual([]);
    expect(catalog.skills.get('interrogation')?.integrationTags).toEqual([]);
  });
  it('stores Belief as a structured example, with no invented delta or per-Belief formula', () => {
    const profile = catalog.skills.get('interrogation')?.testProfile;
    expect(profile?.adjustments?.[1]).toEqual(adjustments[1]);
    for (const adjustment of profile?.adjustments ?? []) {
      expect(adjustment).not.toHaveProperty('delta');
      expect(adjustment.quantity).toBe('unquantified');
    }
    expect(adjustments[1]).not.toHaveProperty('when');
  });
  it('lets Intimidation reuse the obstacle basis without Interrogation adjustments', () => {
    const fixture = createSkillCatalog(targetObstacleFixtureContent);
    expect(fixture.skills.get('intimidation')?.testProfile).toEqual({ kind: 'obstacle', base });
    expect(fixture.skills.get('intimidation')?.coverage).toBe('partial');
    expect(catalog.skills.get('intimidation')?.coverage).toBe('complete');
    expect(catalog.skills.get('intimidation')?.testProfile?.base).toEqual(base);
    expect(catalog.skills.get('intimidation')?.testProfile?.adjustments).toEqual([]);
  });
  it.each([generalSkillTranscriptionContent, targetObstacleFixtureContent])('serializes basis and manual facts intact', content => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(content)) as typeof content);
    const id = content === generalSkillTranscriptionContent ? 'interrogation' : 'intimidation';
    expect(restored.skills.get(id)?.testProfile).toEqual(createSkillCatalog(content).skills.get(id)?.testProfile);
  });
  it('keeps the ability boundary generic for stock-specific attributes', () => {
    const syntheticBase = { ...base, ability: { kind: 'attribute', id: 'synthetic-stock-attribute' } } as const;
    expect(register({ ...expected, base: syntheticBase }).skills.get('interrogation')?.testProfile?.base).toEqual(syntheticBase);
  });
  it.each([
    { ...base, kind: 'fixed' }, { ...base, snapshot: 'opening' },
    { ...base, ability: null }, { ...base, ability: { kind: 'skill', id: 'will' } },
    { ...base, ability: { kind: 'stat', id: '' } }, { ...base, ability: { kind: 'stat', id: '  ' } },
    { ...base, ability: { kind: 'stat', id: 1 } },
  ])('rejects malformed target ability/basis %j', invalidBase => {
    expect(() => register({ ...expected, base: invalidBase })).toThrow('Invalid obstacle basis');
  });
  it.each([0, 1, -1, undefined])('rejects explicit manual delta %j, including zero', delta => {
    expect(() => register({ ...expected, adjustments: [{ ...adjustments[0], delta }] })).toThrow('Invalid manual test adjustment');
  });
  it.each([
    { kind: 'manual', source: 'target-traits' },
    { ...adjustments[0], source: 'every-trait' }, { ...adjustments[0], quantity: 'fixed' },
    { ...adjustments[0], kind: 'numeric' }, { ...adjustments[0], examples: adjustments[1].examples },
    { ...adjustments[1], examples: 'Beliefs prevent disclosure' },
    { ...adjustments[1], examples: [{ kind: 'target-belief', constraint: 'every-belief' }] },
    { ...adjustments[1], examples: [{ kind: 'anyOf', conditions: [] }] },
  ])('rejects malformed manual adjustments/examples %j', adjustment => {
    expect(() => register({ ...expected, adjustments: [adjustment] })).toThrow();
  });
  it('keeps opposing skills and obstacle bases in distinct profile branches', () => {
    expect(() => register({ ...expected, opposingAbilities: [{ kind: 'skill', skillId: 'observation' }] })).toThrow('Invalid skill test profile');
    expect(() => register({ kind: 'versus', opposingAbilities: [{ kind: 'skill', skillId: 'observation' }], adjustments })).toThrow('Invalid skill test profile');
  });
});
