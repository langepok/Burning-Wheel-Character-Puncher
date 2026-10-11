import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { DynamicTestModifier, ManualTestAdjustment, SkillRecord, SkillTestFollowUp, SkillTestProfile } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const context = { kind: 'outside-subsystem', subsystem: 'duel-of-wits' } as const;
const expected = {
  trigger: { kind: 'test-success', source: 'primary-test' }, context,
  test: { actor: 'target', ability: { kind: 'attribute', id: 'steel' } },
  modifiers: [{ kind: 'dynamic-value', target: 'hesitation-obstacle', operation: 'add',
    value: { kind: 'extra-successes', source: 'primary-test' } }],
} as const;
const catalog = createSkillCatalog(generalSkillTranscriptionContent);
function register(followUp: unknown) {
  return createSkillCatalog({ ...generalSkillTranscriptionContent, skills: generalSkillTranscriptionContent.skills.map(skill =>
    skill.id === 'intimidation' ? { ...skill, testProfile: { ...skill.testProfile, followUps: [followUp] } } as SkillRecord : skill) });
}

describe('Skill-test follow-up metadata', () => {
  it('preserves the scoped primary obstacle and exact target Steel follow-up', () => {
    expectTypeOf<typeof expected>().toExtend<SkillTestFollowUp>();
    expect(catalog.skills.get('intimidation')?.testProfile).toEqual({ kind: 'obstacle', context,
      base: { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' },
      adjustments: [], followUps: [expected] });
    expect(catalog.skills.get('intimidation')?.useContext).toBeUndefined();
    expect(catalog.skills.get('intimidation')?.integrationTags).toEqual(['duel-of-wits']);
    expect(catalog.skills.has('steel')).toBe(false);
    expect(catalog.references.has('steel')).toBe(false);
  });
  it('distinguishes a referenced dynamic value from fixed and unquantified adjustments', () => {
    type FixedModifier = NonNullable<SkillTestProfile['modifiers']>[number];
    expectTypeOf<typeof expected.modifiers[0]>().toExtend<DynamicTestModifier>();
    expectTypeOf<DynamicTestModifier>().not.toExtend<FixedModifier>();
    expectTypeOf<DynamicTestModifier>().not.toExtend<ManualTestAdjustment>();
    expect(expected.modifiers[0]).not.toHaveProperty('delta');
    expect(expected.modifiers[0].value).toEqual({ kind: 'extra-successes', source: 'primary-test' });
    expect(catalog.skills.get('interrogation')?.testProfile?.followUps).toBeUndefined();
  });
  it('serializes trigger, scope, actor, attribute and the unevaluated value reference', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)) as typeof generalSkillTranscriptionContent);
    expect(restored.skills.get('intimidation')?.testProfile?.followUps).toEqual([expected]);
  });
  it('allows catalog-resolved skills and generic actor roles without a stock assumption', () => {
    const variant = { ...expected, test: { actor: 'primary-actor', ability: { kind: 'skill', id: 'observation' } } } as const;
    expect(register(variant).skills.get('intimidation')?.testProfile?.followUps).toEqual([variant]);
  });
  it.each(['missing', 'steel'])('rejects dangling/fake skill ability %s', id => {
    expect(() => register({ ...expected, test: { actor: 'target', ability: { kind: 'skill', id } } })).toThrow('Unknown skill reference');
  });
  it.each([
    { ...expected, trigger: { kind: 'test-failure', source: 'primary-test' } },
    { ...expected, trigger: { kind: 'test-success', source: 'follow-up-test' } },
    { ...expected, context: undefined }, { ...expected, context: 'outside Duel of Wits' },
    { ...expected, context: { kind: 'outside-subsystem', subsystem: 'unknown' } },
    { ...expected, test: { actor: 'winner', ability: expected.test.ability } },
    { ...expected, test: { actor: 'target', ability: { kind: 'attribute', id: '' } } },
    { ...expected, test: { actor: 'target', ability: { kind: 'attribute', id: 1 } } },
    { ...expected, test: { actor: 'target', ability: { kind: 'unknown', id: 'steel' } } },
    { ...expected, modifiers: [] },
    { ...expected, modifiers: [{ ...expected.modifiers[0], kind: 'obstacle', delta: 1 }] },
    { ...expected, modifiers: [{ ...expected.modifiers[0], target: 'resources-obstacle' }] },
    { ...expected, modifiers: [{ ...expected.modifiers[0], operation: 'subtract' }] },
    { ...expected, modifiers: [{ ...expected.modifiers[0], delta: 0 }] },
    { ...expected, modifiers: [{ ...expected.modifiers[0], value: 2 }] },
    { ...expected, modifiers: [{ ...expected.modifiers[0], value: { kind: 'fixed', amount: 2 } }] },
    { ...expected, modifiers: [{ ...expected.modifiers[0], value: { kind: 'extra-successes', source: 'missing-test' } }] },
    { ...expected, modifiers: [{ ...expected.modifiers[0], value: { kind: 'formula', expression: 'successes - obstacle' } }] },
  ])('rejects malformed follow-up metadata %j', followUp => {
    expect(() => register(followUp)).toThrow();
  });
});
