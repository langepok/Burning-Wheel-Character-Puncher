import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { ContextualTestEffect, ManualTestAdjustment, SkillCatalogContent, SkillContext } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const skill = catalog.skills.get('musical-instrument')!;
const modifier = { effect: { kind: 'advantage', resolution: 'canonical' },
  when: { kind: 'music-mood-suitability', relation: 'suitable' } } as const;
const withProfile = (testProfile: unknown) => ({ ...generalSkillTranscriptionContent,
  skills: generalSkillTranscriptionContent.skills.map(record => record.id === 'musical-instrument' ? { ...record, testProfile } : record),
}) as SkillCatalogContent;

describe('Musical Instrument canonical Advantage', () => {
  it('uses current listener Will as obstacle basis', () => {
    expect(skill.testProfile).toMatchObject({ kind: 'obstacle', base: { kind: 'target-ability-exponent',
      targetRole: 'listener', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' } });
    expect(skill.rootRule).toEqual({ kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'agility' }] });
    expect(skill.tools).toEqual({ kind: 'specific-item', item: 'instrument' });
  });
  it('preserves suitable music/mood as a relation and applies canonical Advantage', () => {
    expect(skill.testProfile?.modifiers).toEqual([modifier]);
    expectTypeOf<typeof modifier.effect>().toExtend<ContextualTestEffect>();
    expectTypeOf<typeof modifier.when>().toExtend<SkillContext>();
    expect(modifier.effect).not.toHaveProperty('dice');
    expect(modifier.effect).not.toHaveProperty('delta');
  });
  it('keeps Advantage distinct from dice, obstacle and manual obstacle effects', () => {
    expectTypeOf<typeof modifier.effect>().not.toExtend<Extract<ContextualTestEffect, { kind: 'dice-bonus' }>>();
    expectTypeOf<typeof modifier.effect>().not.toExtend<Extract<ContextualTestEffect, { kind: 'obstacle-modifier' }>>();
    expectTypeOf<typeof modifier.effect>().not.toExtend<ManualTestAdjustment>();
    expect(skill.testProfile).not.toHaveProperty('adjustments');
    expect(catalog.skills.get('logistics')?.testProfile?.modifiers?.[0].effect).toEqual({ kind: 'dice-bonus', dice: 1 });
    expect(catalog.skills.get('inconspicuous')?.testProfile?.modifiers?.[0].effect).toEqual({ kind: 'obstacle-modifier', delta: 1 });
    expect(catalog.skills.get('interrogation')?.testProfile?.kind).toBe('obstacle');
  });
  it('preserves canonical FoRK labels and additional-instrument guidance without a closed instrument list', () => {
    expect(skill.forkSuggestions?.suggestions).toEqual([
      { target: { kind: 'skill', skillId: 'sing' } }, { target: { kind: 'skill', skillId: 'composition' } },
      { target: { kind: 'category', category: 'musical-instrument', relevance: 'any' } },
    ]);
    expect(skill.semanticCategories).toEqual(['musical-instrument']);
    expect(catalog.families.has('musical-instrument')).toBe(false);
    expect(catalog.skills.get('mystery-meat-wise')?.coverage).toBe('complete');
  });
  it('round-trips structured relation and external canonical resolution', () => {
    expect(createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent))).skills.get(skill.id)).toEqual(skill);
  });
  it('allows composed suitability conditions without a mood evaluator', () => {
    const when = { kind: 'allOf', conditions: [modifier.when, { kind: 'culture', cultureId: 'synthetic-culture' }] };
    expect(createSkillCatalog(withProfile({ ...skill.testProfile, modifiers: [{ ...modifier, when }] })).skills.get(skill.id)?.testProfile?.modifiers?.[0].when).toEqual(when);
  });
  it.each([
    { kind: 'advantage', resolution: 'canonical', dice: 1 }, { kind: 'advantage', resolution: 'canonical', delta: 1 },
    { kind: 'advantage', resolution: 'manual' }, { kind: 'advantage' }, { kind: 'advantage', resolution: 'canonical', evaluator: 'mood' },
  ])('rejects invented numeric or execution semantics %j', effect => {
    expect(() => createSkillCatalog(withProfile({ ...skill.testProfile, modifiers: [{ ...modifier, effect }] }))).toThrow('Invalid skill test modifier');
  });
  it.each([
    { kind: 'music-mood-suitability', relation: 'unsuitable' }, { kind: 'music-mood-suitability' },
    { kind: 'music-mood-suitability', relation: 'suitable', performerMood: 'happy' },
    { kind: 'music-mood-suitability', relation: 'suitable', listenerTrait: 'musical' },
  ])('rejects malformed or substituted suitability relation %j', when => {
    expect(() => createSkillCatalog(withProfile({ ...skill.testProfile, modifiers: [{ ...modifier, when }] }))).toThrow();
  });
  it('rejects an invalid listener role instead of silently reinterpreting it', () => {
    expect(() => createSkillCatalog(withProfile({ ...skill.testProfile, base: {
      kind: 'target-ability-exponent', targetRole: 'performer', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' } }))).toThrow('Invalid obstacle basis');
  });
});
