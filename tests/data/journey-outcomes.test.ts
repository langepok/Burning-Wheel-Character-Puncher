import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { SkillCatalogContent, SkillTestOutcomeEffect, ContextualTestEffect } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const success = { kind: 'journey-navigation', recipient: 'primary-actor', result: 'intended-destination', delay: 'none' } as const;
const failure = { kind: 'journey-navigation', recipient: 'travelling-party', state: 'lost', alternatives: [
  { arrival: 'intended-destination', appointments: 'missed-if-applicable' },
  { arrival: 'unintended-location' },
] } as const;
const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const skill = catalog.skills.get('orienteering')!;
const register = (trigger: 'success' | 'failure', effect: unknown) => createSkillCatalog({
  ...generalSkillTranscriptionContent, skills: generalSkillTranscriptionContent.skills.map(record => record.id === skill.id
    ? { ...record, testProfile: { ...skill.testProfile, outcomes: [{ trigger: { kind: trigger }, effects: [effect] }] } } : record),
} as SkillCatalogContent);

describe('Orienteering source-defined journey outcomes', () => {
  it('success finds the intended way without delay, not a quantified travel bonus', () => {
    expectTypeOf<typeof success>().toExtend<SkillTestOutcomeEffect>();
    expectTypeOf<typeof success>().not.toExtend<ContextualTestEffect>();
    expect(skill.testProfile?.outcomes?.[0]).toEqual({ trigger: { kind: 'success' }, effects: [success] });
  });
  it('failure first makes the actor and companions lost, then preserves exactly two alternatives', () => {
    expectTypeOf<typeof failure>().toExtend<SkillTestOutcomeEffect>();
    expect(skill.testProfile?.outcomes?.[1]).toEqual({ trigger: { kind: 'failure' }, effects: [failure] });
    expect(failure.alternatives).toHaveLength(2);
    expect(failure.alternatives[0]).toEqual({ arrival: 'intended-destination', appointments: 'missed-if-applicable' });
    expect(failure.alternatives[1]).toEqual({ arrival: 'unintended-location' });
    expect(failure).not.toHaveProperty('selection');
    expect(failure).not.toHaveProperty('delay');
    expect(failure).not.toHaveProperty('distance');
  });
  it('maps supply fixed 1D, separately from Musical Instrument canonical Advantage and required tools', () => {
    expect(skill.testProfile?.modifiers).toEqual([{ effect: { kind: 'dice-bonus', dice: 1 },
      when: { kind: 'circumstance', circumstanceId: 'using-map' } }]);
    expect(catalog.skills.get('musical-instrument')?.testProfile?.modifiers?.[0].effect)
      .toEqual({ kind: 'advantage', resolution: 'canonical' });
    expect(skill.tools).toEqual({ kind: 'none', expendable: false });
    expect(skill.rootRule).toEqual({ kind: 'single', ability: { kind: 'stat', id: 'perception' } });
    expect(skill.forkSuggestions?.suggestions).toEqual([{ target: { kind: 'skill', skillId: 'navigation' } }]);
  });
  it('round-trips outcomes without changing travel state or selecting an alternative', () => {
    expect(createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent))).skills.get(skill.id)?.testProfile)
      .toEqual(skill.testProfile);
  });
  it.each([
    { ...success, delay: 0 }, { ...success, delay: 'one-hour' }, { ...success, result: 'random-destination' },
    { ...success, recipient: 'travelling-party' }, { ...success, distance: 10 },
  ])('rejects malformed/invented success metadata %j', invalid => {
    expect(() => register('success', invalid)).toThrow('Invalid journey outcome');
  });
  it.each([
    { ...failure, state: 'delayed' }, { ...failure, recipient: 'primary-actor' },
    { ...failure, alternatives: [] }, { ...failure, alternatives: [failure.alternatives[0]] },
    { ...failure, alternatives: [...failure.alternatives, failure.alternatives[1]] },
    { ...failure, alternatives: [{ arrival: 'intended-destination' }, failure.alternatives[1]] },
    { ...failure, alternatives: [failure.alternatives[0], { arrival: 'unintended-location', distance: 5 }] },
    { ...failure, delay: 2 }, { ...failure, selection: 'random' }, { ...failure, selection: 'gm' },
    { ...failure, selection: 'player' }, { ...failure, selection: 'first-applicable' },
    { ...failure, selection: 'margin-of-failure' }, { ...failure, weights: [1, 1] },
  ])('rejects malformed alternatives or invented resolution %j', invalid => {
    expect(() => register('failure', invalid)).toThrow('Invalid journey outcome');
  });
  it('keeps success and failure journey facts on their respective triggers', () => {
    expect(() => register('success', failure)).toThrow('Invalid journey outcome');
    expect(() => register('failure', success)).toThrow('Invalid journey outcome');
  });
});
