import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { SkillRecord, SkillRelation } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const context = { kind: 'activity', activity: 'tending-wounds-and-illness' } as const;
const single = { kind: 'obstacle-reference', targets: { kind: 'skill', skillId: 'apothecary' }, context } as const;
const alternative = { kind: 'obstacle-reference', targets: { kind: 'anyOf', targets: [
  { kind: 'skill', skillId: 'field-dressing' }, { kind: 'skill', skillId: 'apothecary' },
] }, context } as const;
const catalog = createSkillCatalog(generalSkillTranscriptionContent);
function register(relation: unknown) {
  return createSkillCatalog({ ...generalSkillTranscriptionContent, skills: generalSkillTranscriptionContent.skills.map(skill =>
    skill.id === 'insect-husbandry' ? { ...skill, relations: [relation] } as SkillRecord : skill) });
}

describe('Scoped obstacle-guidance references', () => {
  it('preserves Insect Husbandry ownership and the medical-only Apothecary reference', () => {
    expectTypeOf<typeof single>().toExtend<SkillRelation>();
    expect(catalog.skills.get('insect-husbandry')).toMatchObject({ id: 'insect-husbandry', coverage: 'complete', relations: [single] });
    expect(catalog.skills.get('insect-husbandry')?.testProfile).toBeUndefined();
    expect(catalog.skills.get('insect-husbandry')?.forkSuggestions?.suggestions).toEqual([]);
    expect(catalog.skills.get('insect-husbandry')?.capabilities).toEqual([]);
  });
  it.each(['animal-husbandry', 'bird-husbandry'])('%s uses Field Dressing OR Apothecary for medical obstacles', id => {
    expectTypeOf<typeof alternative>().toExtend<SkillRelation>();
    expect(catalog.skills.get(id)?.relations).toEqual([alternative]);
  });
  it('does not describe whole-mechanics reuse, substitution or capability inclusion', () => {
    expectTypeOf<typeof single>().not.toExtend<Extract<SkillRelation, { kind: 'same-mechanics' | 'includes-capability' | 'specialized-version' }>>();
    expectTypeOf<typeof single>().not.toExtend<Extract<SkillRelation, { kind: 'contextual-substitution' | 'replacement' }>>();
    expect(single).not.toHaveProperty('target');
  });
  it('keeps own roots, types, tools and roll behavior when target metadata changes', () => {
    const changed = createSkillCatalog({ ...generalSkillTranscriptionContent, skills: generalSkillTranscriptionContent.skills.map(skill =>
      ['apothecary', 'field-dressing'].includes(skill.id) ? { ...skill,
        rootRule: { kind: 'single', ability: { kind: 'stat', id: 'power' } },
        skillType: 'Sorcerous', tools: { kind: 'workshop' }, rollBehavior: { kind: 'open-ended', basis: 'magical' },
      } as SkillRecord : skill) });
    for (const id of ['insect-husbandry', 'animal-husbandry', 'bird-husbandry']) {
      expect(changed.skills.get(id)).toEqual(catalog.skills.get(id));
      expect(changed.skills.get(id)).toMatchObject({ rootRule: { kind: 'single', ability: { kind: 'stat', id: 'will' } }, tools: { kind: 'generic' }, rollBehavior: { kind: 'standard' } });
    }
    expect(changed.skills.get('insect-husbandry')?.skillType).toBe('Forester');
    expect(changed.skills.get('animal-husbandry')?.skillType).toBe('Peasant');
    expect(changed.skills.get('bird-husbandry')?.skillType).toBe('Forester');
    expect(changed.skills.get('apothecary')?.skillType).toBe('Sorcerous');
  });
  it('serializes both target forms and composed contexts through validation', () => {
    const nested = { ...single, context: { kind: 'allOf', conditions: [context,
      { kind: 'anyOf', conditions: [{ kind: 'circumstance', circumstanceId: 'synthetic-first' }, { kind: 'circumstance', circumstanceId: 'synthetic-second' }] },
    ] } } as const;
    const content = { ...generalSkillTranscriptionContent, skills: generalSkillTranscriptionContent.skills.map(skill =>
      skill.id === 'insect-husbandry' ? { ...skill, relations: [nested] } : skill) };
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(content)) as typeof content);
    expect(restored.skills.get('insect-husbandry')?.relations).toEqual([nested]);
    expect(restored.skills.get('animal-husbandry')?.relations).toEqual([alternative]);
    expect(restored.skills.get('bird-husbandry')?.relations).toEqual([alternative]);
  });
  it.each([
    { ...single, targets: { kind: 'skill', skillId: 'missing' } },
    { ...alternative, targets: { kind: 'anyOf', targets: [{ kind: 'skill', skillId: 'field-dressing' }, { kind: 'skill', skillId: 'missing' }] } },
  ])('rejects dangling obstacle sources %j', relation => {
    expect(() => register(relation)).toThrow('Unknown skill reference');
  });
  it.each([
    { ...single, targets: null }, { ...single, targets: { kind: 'skill', skillId: '' } },
    { ...single, targets: { kind: 'stat', id: 'perception' } },
    { ...single, targets: { kind: 'anyOf', targets: [] } },
    { ...single, targets: { kind: 'anyOf', targets: [single.targets] } },
    { ...single, targets: { kind: 'anyOf', targets: [single.targets, single.targets] } },
    { ...single, targets: { kind: 'allOf', targets: alternative.targets.targets } },
    { ...single, targets: { kind: 'anyOf', targets: [single.targets, { kind: 'unresolved-source-reference', sourceLabel: 'Apothecary' }] } },
    { ...single, context: undefined }, { ...single, context: 'wounds or illness' },
    { ...single, context: { kind: 'activity', activity: 'unknown' } },
    { ...single, context: { kind: 'anyOf', conditions: [context] } },
  ])('rejects malformed obstacle references %j', relation => {
    expect(() => register(relation)).toThrow();
  });
});
