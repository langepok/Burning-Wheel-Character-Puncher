import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { DurationRestSubstitution, LinkedPretest, SkillRecord, SkillIntegration } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const rest = {
  kind: 'duration-rest-substitution', substitutesFor: 'sleep-rest',
  obstacle: { kind: 'duration-based-obstacle', unit: 'hour', firstUnitObstacle: 1, additionalUnitObstacleDelta: 1 },
  effect: { kind: 'rest-equivalence', durationUnit: 'hour', restPerUnit: 1, appliesTo: ['wound-recovery', 'tax-recovery'] },
  onFailure: { kind: 'falls-asleep', timing: 'at-some-point' },
} as const;
const linked = {
  kind: 'linked-pretest', target: 'subsequent-skill-test', semantics: { kind: 'canonical-rule', rule: 'linked-test' },
  specialResolution: {
    when: { kind: 'anyOf', conditions: [{ kind: 'test-context', context: 'versus-test' }, { kind: 'test-context', context: 'detailed-conflict' }] },
    test: { kind: 'versus', actingAbility: { kind: 'skill', id: 'meditation' },
      opposingAbility: { kind: 'context-resolved-skill', actorRole: 'opponent', resolution: 'manual' } },
    onWin: { kind: 'dice-bonus', dice: 1, appliesTo: 'linked-target-test' },
  },
} as const;
const catalog = createSkillCatalog(generalSkillTranscriptionContent);
function register(procedures: unknown, activityFacts?: unknown) {
  return createSkillCatalog({ ...generalSkillTranscriptionContent, skills: generalSkillTranscriptionContent.skills.map(skill =>
    skill.id === 'meditation' ? { ...skill, procedures, ...(activityFacts === undefined ? {} : { activityFacts }) } as SkillRecord : skill) });
}
describe('Meditation distinct procedures and source facts', () => {
  it('preserves Ob 1 for the first hour, +1 per additional hour, hourly rest and failure without invented timing/credit', () => {
    expectTypeOf<typeof rest>().toExtend<DurationRestSubstitution>();
    expect(catalog.skills.get('meditation')?.procedures?.[0]).toEqual(rest);
    expect(rest.obstacle).toEqual({ kind: 'duration-based-obstacle', unit: 'hour', firstUnitObstacle: 1, additionalUnitObstacleDelta: 1 });
    expect(rest.effect).toEqual({ kind: 'rest-equivalence', durationUnit: 'hour', restPerUnit: 1, appliesTo: ['wound-recovery', 'tax-recovery'] });
    expect(rest.onFailure).toEqual({ kind: 'falls-asleep', timing: 'at-some-point' });
    expect(rest.onFailure).not.toHaveProperty('creditedHours');
  });
  it('preserves canonical ordinary linked semantics and the scoped opposed win benefit separately', () => {
    expectTypeOf<typeof linked>().toExtend<LinkedPretest>();
    expect(catalog.skills.get('meditation')?.procedures?.[1]).toEqual(linked);
    expect(catalog.skills.get('meditation')?.procedures).toHaveLength(2);
    expect(catalog.skills.get('meditation')?.testProfile).toBeUndefined();
    expect(linked).not.toHaveProperty('onWin');
    expect(linked).not.toHaveProperty('ordinaryResolution');
    expect(linked.specialResolution.test.opposingAbility).not.toHaveProperty('skillId');
  });
  it('keeps vague awareness / Perception-or-Observation detection and sustained magic separate from rest and centering', () => {
    expect(catalog.skills.get('meditation')?.activityFacts).toEqual([
      { kind: 'vague-surroundings-awareness' }, { kind: 'permitted-test', abilities: { kind: 'anyOf', operands: [
        { kind: 'stat', id: 'perception' }, { kind: 'skill', id: 'observation' },
      ] }, purpose: { kind: 'detect-skill-use', skillId: 'stealthy' } },
    ]);
    expect(catalog.skills.has('awareness')).toBe(false);
    expect(catalog.references.has('awareness')).toBe(false);
    expect(catalog.integrations.get('meditation-sustaining')?.sustainedSpellReference).toEqual({
      actorRole: 'sorcerer', while: 'using-owning-skill', permission: 'maintain-sustained-spells',
      requiredRetest: { kind: 'tax', rules: { kind: 'external-subsystem-rule', subsystem: 'magic', sourceName: 'The Power Still Flows Through Him' } },
    });
  });
  it('round-trips procedures, context-resolved opponent and external magic reference', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)));
    expect(restored.skills.get('meditation')).toEqual(catalog.skills.get('meditation'));
    expect(restored.integrations.get('meditation-sustaining')).toEqual(catalog.integrations.get('meditation-sustaining'));
  });
  it.each([
    { ...rest, obstacle: { ...rest.obstacle, unit: 'day' } },
    { ...rest, obstacle: { ...rest.obstacle, firstUnitObstacle: 0 } },
    { ...rest, obstacle: { ...rest.obstacle, additionalUnitObstacleDelta: 1.5 } },
    { ...rest, obstacle: { ...rest.obstacle, formula: 'hours' } },
    { ...rest, effect: { ...rest.effect, restPerUnit: 0 } },
    { ...rest, effect: { ...rest.effect, appliesTo: ['wound-recovery'] } },
    { ...rest, onFailure: { ...rest.onFailure, timing: 'after-one-hour' } },
    { ...rest, onFailure: { ...rest.onFailure, creditedHours: 0 } },
    { ...rest, partialCredit: true },
    { ...linked, ordinaryResolution: { kind: 'versus' } },
    { ...linked, target: 'self' },
    { ...linked, specialResolution: { ...linked.specialResolution, when: { kind: 'test-context', context: 'every-test' } } },
    ...[
      { ...linked.specialResolution.test, actingAbility: { kind: 'skill', id: 'missing' } },
      { ...linked.specialResolution.test, opposingAbility: { kind: 'skill', skillId: 'observation' } },
      { ...linked.specialResolution.test, opposingAbility: { ...linked.specialResolution.test.opposingAbility, actorRole: 'eavesdropper' } },
      { ...linked.specialResolution.test, opposingAbility: { ...linked.specialResolution.test.opposingAbility, default: 'observation' } },
    ].map(test => ({ ...linked, specialResolution: { ...linked.specialResolution, test } })),
    { ...linked, specialResolution: { ...linked.specialResolution, onWin: { kind: 'dice-bonus', dice: 0, appliesTo: 'linked-target-test' } } },
  ])('rejects malformed/invented procedural metadata %j', procedure => {
    expect(() => register([procedure])).toThrow();
  });
  it.each([
    [{ kind: 'vague-surroundings-awareness', abilityId: 'awareness' }],
    [{ kind: 'permitted-test', abilities: { kind: 'anyOf', operands: [{ kind: 'skill', id: 'missing' }, { kind: 'stat', id: 'perception' }] }, purpose: { kind: 'detect-skill-use', skillId: 'stealthy' } }],
    [{ kind: 'permitted-test', abilities: { kind: 'anyOf', operands: [{ kind: 'stat', id: '' }, { kind: 'skill', id: 'observation' }] }, purpose: { kind: 'detect-skill-use', skillId: 'stealthy' } }],
  ])('validates awareness/ability facts %j', facts => {
    expect(() => register([rest, linked], facts)).toThrow();
  });
  it('validates the external magic rule reference', () => {
    const content = { ...generalSkillTranscriptionContent, integrations: generalSkillTranscriptionContent.integrations.map(integration =>
      integration.id === 'meditation-sustaining' ? { ...integration, sustainedSpellReference: {
        ...integration.sustainedSpellReference, requiredRetest: { kind: 'tax', rules: { kind: 'external-subsystem-rule', subsystem: 'magic', sourceName: '' } },
      } } as SkillIntegration : integration) };
    expect(() => createSkillCatalog(content)).toThrow('Invalid sustained-spell reference');
  });
});
