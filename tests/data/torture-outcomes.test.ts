import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { SkillCatalogContent, SkillTestProfile } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const declaration = { kind: 'declared-intent', requiredBeforeTest: true, content: 'submit-or-reveal', specificity: 'exact' } as const;
const base = { kind: 'highest-of-target-abilities', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'forte' }], snapshot: 'current' } as const;
const debilitating = { kind: 'grant-trait', recipient: 'target',
  traitSelection: { kind: 'contextual', quality: 'debilitating', examplesPolicy: 'non-exhaustive', examples: ['Maimed', 'Missing Eye'] },
  value: { kind: 'test-obstacle', source: 'primary-test' } } as const;
const beneficial = { kind: 'grant-trait', recipient: 'target',
  traitSelection: { kind: 'contextual', quality: 'beneficial', purpose: ['resist-privation', 'resist-torture', 'resist-interrogation'] },
  value: { kind: 'source-unspecified' } } as const;
const choice = { kind: 'gm-selected-consequence', resolution: 'gm-choice', alternatives: [
  { kind: 'injury', recipient: 'target', severity: 'source-unspecified' },
  { kind: 'death', recipient: 'target' }, beneficial,
] } as const;
const success = { trigger: { kind: 'success' }, effects: [
  { kind: 'declared-intent-fulfilled', recipient: 'target', intent: { kind: 'declared-intent', source: 'primary-test' } }, debilitating,
] } as const;
const failure = { trigger: { kind: 'failure' }, effects: [choice] } as const;
const profile = { kind: 'obstacle', declaredIntent: declaration, base, outcomes: [success, failure] } as const;
const register = (testProfile: unknown) => createSkillCatalog({ ...generalSkillTranscriptionContent,
  skills: generalSkillTranscriptionContent.skills.map(skill => skill.id === 'torture' ? { ...skill, testProfile } : skill),
} as SkillCatalogContent);
const successEffect = (effect: unknown) => ({ ...profile, outcomes: [{ ...success, effects: [effect] }] });
const failChoice = (fields: object) => ({ ...profile, outcomes: [{ ...failure, effects: [{ ...choice, ...fields }] }] });

describe('Torture declared intent and source outcomes', () => {
  it('requires exact pre-test intent and higher target Will/Forte without a formula', () => {
    expectTypeOf<typeof profile>().toExtend<SkillTestProfile>();
    expect(catalog.skills.get('torture')?.testProfile).toEqual(profile);
  });
  it('success refers to the same declared intent and grants a contextual debilitating trait', () => {
    expect(catalog.skills.get('torture')?.testProfile?.outcomes?.[0]).toEqual(success);
  });
  it('leaves examples non-exhaustive and trait value as the primary test obstacle reference', () => {
    expect(debilitating.traitSelection.examplesPolicy).toBe('non-exhaustive');
    expect(debilitating.value).toEqual({ kind: 'test-obstacle', source: 'primary-test' });
  });
  it('failure preserves three GM alternatives without severity, threshold or beneficial trait value invention', () => {
    expect(catalog.skills.get('torture')?.testProfile?.outcomes?.[1]).toEqual(failure);
    expect(choice.alternatives.map(effect => effect.kind)).toEqual(['injury', 'death', 'grant-trait']);
  });
  it('preserves conditional Orc Hatred/open-ended behavior without a magical marker', () => {
    expect(catalog.skills.get('torture')).toMatchObject({
      rootRule: { kind: 'conditional', cases: [{ stockIds: ['orc'], root: { kind: 'single', ability: { kind: 'attribute', id: 'hatred' } } }],
        otherwise: { kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'perception' }] } },
      rollBehavior: { kind: 'conditional', whenRoot: { kind: 'attribute', id: 'hatred' }, then: 'open-ended', otherwise: 'standard' },
      skillType: 'Special', tools: { kind: 'generic' }, printedMarkers: [],
    });
    expect(catalog.skills.get('torture')?.forkSuggestions?.suggestions).toEqual(
      ['anatomy', 'surgery', 'interrogation'].map(skillId => ({ target: { kind: 'skill', skillId } })));
  });
  it('round-trips all metadata without applying trait/injury/death outcomes', () => {
    expect(createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent))).skills.get('torture'))
      .toEqual(catalog.skills.get('torture'));
  });
  it.each([
    { requiredBeforeTest: false }, { content: 'question' }, { specificity: 'general' }, { parseIntent: true },
  ])('rejects malformed declaration %j', fields => {
    expect(() => register({ ...profile, declaredIntent: { ...declaration, ...fields } })).toThrow();
  });
  it('rejects success with a missing declared intent', () => {
    expect(() => register({ kind: 'obstacle', base, outcomes: [success] })).toThrow();
  });
  it.each([
    { kind: 'lowest-of-target-abilities' }, { kind: 'average-target-abilities' }, { snapshot: 'opening' },
    { abilities: [] }, { abilities: [{ kind: 'stat', id: 'will' }] },
    { abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'will' }] },
    { abilities: [{ kind: 'stat', id: '' }, { kind: 'stat', id: 'forte' }] },
    { abilities: [{ kind: 'skill', id: 'missing-skill' }, { kind: 'stat', id: 'forte' }] }, { formula: 'max(will,forte)' },
  ])('rejects malformed obstacle comparison %j', fields => {
    expect(() => register({ ...profile, base: { ...base, ...fields } })).toThrow();
  });
  it.each([
    { ...success.effects[0], intent: { kind: 'declared-intent', source: 'other-test' } },
    { ...debilitating, value: { kind: 'fixed', value: 3 } },
    { ...debilitating, value: { kind: 'test-obstacle', source: 'other-test' } },
    { ...debilitating, traitSelection: { ...debilitating.traitSelection, examplesPolicy: 'whitelist' } },
    { ...debilitating, traitSelection: { ...debilitating.traitSelection, traitId: 'maimed' } },
    { ...debilitating, woundSeverity: 'severe' },
  ])('rejects invented success outcome semantics %j', effect => {
    expect(() => register(successEffect(effect))).toThrow();
  });
  it.each([
    { resolution: 'random' }, { resolution: 'player-choice' }, { alternatives: [] },
    { alternatives: [choice.alternatives[0], choice.alternatives[1]] },
    { alternatives: [{ ...choice.alternatives[0], severity: 'B10' }, choice.alternatives[1], beneficial] },
    { alternatives: [choice.alternatives[0], { ...choice.alternatives[1], woundThreshold: 'mortal' }, beneficial] },
    { alternatives: [choice.alternatives[0], choice.alternatives[1], { ...beneficial, value: { kind: 'fixed', value: 1 } }] },
    { alternatives: [choice.alternatives[0], choice.alternatives[1], { ...beneficial, traitSelection: { ...beneficial.traitSelection, purpose: [] } }] },
  ])('rejects malformed GM choice or invented consequences %j', fields => {
    expect(() => register(failChoice(fields))).toThrow();
  });
  it('rejects GM consequences on success and debilitating grants on failure', () => {
    expect(() => register(successEffect(choice))).toThrow();
    expect(() => register({ ...profile, outcomes: [{ ...failure, effects: [debilitating] }] })).toThrow();
  });
});
