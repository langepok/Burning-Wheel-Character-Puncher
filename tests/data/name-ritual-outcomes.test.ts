import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { ContextualTestEffect, SkillCatalogContent, SkillTestOutcomeEffect } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const ritual = catalog.skills.get('name-ritual')!;
const success = { trigger: { kind: 'success' }, effects: [
  { kind: 'name-bestowal', recipient: 'target' },
  { kind: 'reputation', recipient: 'target', reputationKind: 'ordinary', dice: { kind: 'fixed', value: 1 } },
] } as const;
const failure = { trigger: { kind: 'failure' }, effects: [
  { kind: 'name-bestowal-denied', recipient: 'target' },
  { kind: 'reputation', recipient: 'target', reputationKind: 'infamous', dice: { kind: 'unspecified' } },
] } as const;
const withOutcomes = (outcomes: unknown) => ({ ...generalSkillTranscriptionContent,
  skills: generalSkillTranscriptionContent.skills.map(skill => skill.id === 'name-ritual'
    ? { ...skill, testProfile: { ...ritual.testProfile, outcomes } } : skill),
}) as SkillCatalogContent;

describe('Name Ritual source-supported test outcomes', () => {
  it('uses current target Will, independently of the Will/Perception root', () => {
    expect(ritual.testProfile).toMatchObject({ kind: 'obstacle', base: {
      kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' } });
    expect(ritual.rootRule).toEqual({ kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'perception' }] });
    expect(ritual.tools).toEqual({ kind: 'none', expendable: false });
    expect(ritual.availabilityRestrictions).toEqual([{ kind: 'stock-only', stockIds: ['orc'], scope: 'character-burning' }]);
    expect(ritual.forkSuggestions?.suggestions).toEqual([{ target: { kind: 'skill', skillId: 'orc-wise' } }]);
  });
  it('success bestows a name and fixed 1D ordinary reputation on the target', () => {
    expect(ritual.testProfile?.outcomes?.[0]).toEqual(success);
    expectTypeOf<typeof success.effects[1]>().toExtend<SkillTestOutcomeEffect>();
    expectTypeOf<typeof success.effects[1]>().not.toExtend<ContextualTestEffect>();
    expect(ritual.testProfile).not.toHaveProperty('modifiers');
  });
  it('failure denies naming and gives infamous reputation of explicitly unspecified magnitude', () => {
    expect(ritual.testProfile?.outcomes?.[1]).toEqual(failure);
    expect(failure.effects[1].dice).not.toHaveProperty('value');
    expect(failure.effects[1].dice).not.toEqual({ kind: 'fixed', value: 0 });
    expect(failure.effects[1].dice).not.toEqual({ kind: 'fixed', value: 1 });
    expect(failure.effects[1]).not.toHaveProperty('audience');
    expect(failure.effects[1]).not.toHaveProperty('scope');
    expect(failure.effects[0]).not.toHaveProperty('duration');
  });
  it('keeps both recipients the target, never automatically the ritual performer', () => {
    expect(ritual.testProfile?.outcomes?.flatMap(outcome => outcome.effects.map(effect => effect.recipient))).toEqual(['target', 'target', 'target', 'target']);
  });
  it('round-trips separate conditions, effects and explicit unspecified dice', () => {
    expect(createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent))).skills.get(ritual.id)?.testProfile?.outcomes).toEqual([success, failure]);
  });
  it('supports the existing generic primary actor role for other source outcomes', () => {
    const other = { ...success, effects: [{ kind: 'name-bestowal', recipient: 'primary-actor' }] };
    expect(createSkillCatalog(withOutcomes([other])).skills.get(ritual.id)?.testProfile?.outcomes).toEqual([other]);
  });
  it.each([
    null, [], [{ trigger: { kind: 'zero-successes' }, effects: success.effects }],
    [{ ...success, effects: [] }], [{ ...success, trigger: { kind: 'success', evaluator: 'name' } }],
    [success, success], [{ ...success, effects: [{ kind: 'name-bestowal', recipient: 'listener' }] }],
    [{ ...success, effects: [{ kind: 'dice-bonus', recipient: 'target', dice: 1 }] }],
    [{ ...success, effects: [{ ...success.effects[1], audience: 'all-orcs' }] }],
    [{ ...success, effects: [{ ...success.effects[1], dice: { kind: 'fixed', value: 0 } }] }],
    [{ ...success, effects: [{ ...success.effects[1], dice: { kind: 'fixed', value: 1.5 } }] }],
    [{ ...failure, effects: [{ ...failure.effects[1], dice: { kind: 'unspecified', value: 1 } }] }],
    [{ ...failure, effects: [{ ...failure.effects[1], dice: undefined }] }],
    [{ ...failure, effects: [{ ...failure.effects[0], permanent: true }] }],
  ])('rejects malformed or invented outcome metadata %j', outcomes => {
    expect(() => createSkillCatalog(withOutcomes(outcomes))).toThrow('Invalid skill test outcome');
  });
  it('preserves the reviewed Navigation source without inventing result procedures', () => {
    const navigation = catalog.skills.get('navigation')!;
    expect(navigation.rootRule).toEqual({ kind: 'single', ability: { kind: 'stat', id: 'perception' } });
    expect(navigation.skillType).toBe('Seafaring');
    expect(navigation.tools).toEqual({ kind: 'generic' });
    expect(navigation.forkSuggestions?.suggestions).toEqual(['astrology', 'orienteering', 'pilot'].map(skillId => ({ target: { kind: 'skill', skillId } })));
    expect(navigation.testProfile).toBeUndefined();
  });
});
