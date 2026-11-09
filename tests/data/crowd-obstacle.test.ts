import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { ObstacleBasis, SkillRecord } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const base = { kind: 'crowd-ability-exponent', ability: { kind: 'stat', id: 'will' },
  statistic: 'most-common', snapshot: 'current' } as const;
const catalog = createSkillCatalog(generalSkillTranscriptionContent);
function register(invalidBase: unknown) {
  return createSkillCatalog({ ...generalSkillTranscriptionContent, skills: generalSkillTranscriptionContent.skills.map(skill =>
    skill.id === 'oratory' ? { ...skill, testProfile: { kind: 'obstacle', base: invalidBase } } as SkillRecord : skill) });
}

describe('Oratory crowd-derived obstacle metadata', () => {
  it('preserves current crowd Will and most-common aggregation as a distinct typed basis', () => {
    expectTypeOf<typeof base>().toExtend<ObstacleBasis>();
    expect(catalog.skills.get('oratory')?.testProfile).toEqual({ kind: 'obstacle', base });
    expect(base.kind).not.toBe('target-ability-exponent');
    expect(base).not.toHaveProperty('tieBreaking');
    expect(base).not.toHaveProperty('rounding');
  });
  it('keeps printed FoRKs and Duel of Wits separate from aggregation', () => {
    expect(catalog.skills.get('oratory')?.forkSuggestions?.suggestions).toEqual(
      ['command', 'persuasion', 'rhetoric'].map(skillId => ({ target: { kind: 'skill', skillId } })));
    expect(catalog.skills.get('oratory')?.integrationTags).toEqual(['duel-of-wits']);
    expect(catalog.skills.get('oratory')?.rootRule).toEqual({ kind: 'single', ability: { kind: 'stat', id: 'will' } });
  });
  it('serializes without computing or resolving a crowd value', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)));
    expect(restored.skills.get('oratory')?.testProfile?.base).toEqual(base);
    expect(base).not.toHaveProperty('value');
  });
  it.each([
    { ...base, statistic: 'average' }, { ...base, statistic: 'max' }, { ...base, statistic: 'min' },
    { ...base, statistic: undefined }, { ...base, snapshot: 'opening' },
    { ...base, ability: { kind: 'skill', id: 'will' } }, { ...base, ability: { kind: 'stat', id: '' } },
    { ...base, ability: null }, { ...base, tieBreaking: 'highest' }, { ...base, rounding: 'down' },
    { ...base, weights: [1] }, { ...base, targetRole: 'listener' },
    { ...base, ability: { kind: 'stat', id: 'will', value: 4 } },
  ])('rejects unsupported/malformed crowd basis %j', invalid => {
    expect(() => register(invalid)).toThrow('Invalid obstacle basis');
  });
});
