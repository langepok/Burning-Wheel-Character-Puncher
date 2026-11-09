import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { AdvanceInjuryClock, SkillCatalogContent, SkillTestProfile } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const expected = { kind: 'advance-injury-clock', clock: 'blood-clock', target: 'treated-wound', stages: 1,
  applicability: 'external-anatomy-of-injury' } as const;
const outcome = { trigger: { kind: 'failure' }, effects: [expected] } as const;
const profile = { kind: 'contextual', outcomes: [outcome] } as const;
const register = (testProfile: unknown) => createSkillCatalog({ ...generalSkillTranscriptionContent,
  skills: generalSkillTranscriptionContent.skills.map(skill => skill.id === 'surgery' ? { ...skill, testProfile } : skill),
} as SkillCatalogContent);
const effect = (fields: object) => ({ ...profile, outcomes: [{ ...outcome, effects: [{ ...expected, ...fields }] }] });

describe('Surgery ordinary-failure injury-clock consequence', () => {
  it('advances treated-wound blood clock by exactly one stage on ordinary failure', () => {
    expectTypeOf<typeof expected>().toExtend<AdvanceInjuryClock>();
    expectTypeOf<typeof profile>().toExtend<SkillTestProfile>();
    expect(catalog.skills.get('surgery')?.testProfile).toEqual(profile);
    expect(catalog.skills.get('surgery')?.adverseOutcomes).toBeUndefined();
  });
  it('leaves applicability external, without a severity ladder or a non-bleeding wound policy', () => {
    expect(catalog.skills.get('surgery')?.summary).toContain('wounds of all types');
    expect(catalog.skills.get('surgery')?.testProfile?.outcomes?.[0].effects).toEqual([expected]);
    expect(catalog.skills.get('surgery')?.useRequirements).toEqual([]);
    expect(catalog.integrations.get('surgery-injury')?.summary).toContain('Anatomy of Injury');
  });
  it('keeps the external treatment reference without replacing or stacking generic failed-treatment effects', () => {
    expect(catalog.skills.get('surgery')?.integrationTags).toEqual(['injury']);
    expect(catalog.integrations.get('surgery-injury')).toMatchObject({ skillId: 'surgery', subsystem: 'injury' });
    expect(catalog.skills.get('surgery')?.testProfile?.outcomes).toEqual([outcome]);
  });
  it('preserves root, type, expendable tools and the four FoRKs', () => {
    expect(catalog.skills.get('surgery')).toMatchObject({ skillType: 'Medicinal',
      rootRule: { kind: 'combined', abilities: [{ kind: 'stat', id: 'perception' }, { kind: 'stat', id: 'agility' }] },
      tools: { kind: 'generic', expendable: true } });
    expect(catalog.skills.get('surgery')?.forkSuggestions?.suggestions).toEqual(
      ['anatomy', 'field-dressing', 'apothecary', 'bloodletting'].map(skillId => ({ target: { kind: 'skill', skillId } })));
  });
  it('round-trips clock metadata without executing injury consequences', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)));
    expect(restored.skills.get('surgery')).toEqual(catalog.skills.get('surgery'));
    expect(restored.integrations.get('surgery-injury')).toEqual(catalog.integrations.get('surgery-injury'));
  });
  it.each([0, -1, 0.5, NaN, Infinity])('rejects invalid stage advancement %s', stages => {
    expect(() => register(effect({ stages }))).toThrow('Invalid injury-clock outcome');
  });
  it.each([
    { kind: 'wound-severity-increase' }, { clock: 'wound-category' }, { target: 'all-wounds' },
    { applicability: 'all-wounds-have-a-clock' }, { applicability: 'superficial-and-light-have-no-effect' },
    { woundSeverityDelta: 1 }, { ladder: ['midi', 'severe', 'traumatic', 'mortal'] }, { createClock: true },
    { replacesGenericFailure: true }, { stacksWithAllFailureEffects: true }, { timer: 1 }, { onMortal: 'death' },
  ])('rejects malformed clock effects or invented downstream semantics %j', fields => {
    expect(() => register(effect(fields))).toThrow('Invalid');
  });
  it.each(['zero-successes', 'failed-clock-timer'])('rejects a substituted trigger %s', kind => {
    expect(() => register({ ...profile, outcomes: [{ ...outcome, trigger: { kind } }] })).toThrow('Invalid skill test outcome');
  });
});
