import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { OpposingAbilityReference, SkillRecord, SkillReferenceTarget } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const expected = { kind: 'context-resolved-skill', actorRole: 'eavesdropper', resolution: 'manual' } as const;
const catalog = createSkillCatalog(generalSkillTranscriptionContent);
function register(opponent: unknown) {
  return createSkillCatalog({ ...generalSkillTranscriptionContent,
    skills: generalSkillTranscriptionContent.skills.map(skill => skill.id === 'jargon'
      ? { ...skill, testProfile: { kind: 'versus', opposingAbilities: [opponent] } } as SkillRecord : skill) });
}
describe('Context-resolved opposing skills', () => {
  it('preserves the eavesdropper skill without inventing an identity or default', () => {
    expectTypeOf<typeof expected>().toExtend<OpposingAbilityReference>();
    expectTypeOf<typeof expected>().not.toExtend<SkillReferenceTarget>();
    expect(catalog.skills.get('jargon')?.testProfile).toEqual({ kind: 'versus', opposingAbilities: [expected] });
    expect(expected).not.toHaveProperty('skillId');
    expect(expected).not.toHaveProperty('default');
    expect(expected).not.toHaveProperty('fallback');
  });
  it('round-trips intentional contextual resolution, rather than missing transcription', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)));
    expect(restored.skills.get('jargon')?.testProfile).toEqual(catalog.skills.get('jargon')?.testProfile);
    expect(restored.references.has('jargon')).toBe(false);
  });
  it('keeps fixed references catalog-resolved and unchanged', () => {
    expect(catalog.skills.get('inconspicuous')?.testProfile?.opposingAbilities).toEqual([{ kind: 'skill', skillId: 'observation' }]);
    expect(register({ kind: 'skill', skillId: 'observation' }).skills.get('jargon')?.testProfile?.opposingAbilities)
      .toEqual([{ kind: 'skill', skillId: 'observation' }]);
    expect(() => register({ kind: 'skill', skillId: 'missing' })).toThrow('Unknown skill reference');
  });
  it.each([
    { ...expected, actorRole: 'anyone' }, { ...expected, resolution: 'automatic' },
    { ...expected, skillId: 'observation' }, { ...expected, skillId: undefined },
    { ...expected, default: 'observation' }, { ...expected, fallback: 'perception' },
    { ...expected, abilityKind: 'stat' }, { ...expected, selector: 'any-ability' },
    { kind: 'context-resolved-stat', actorRole: 'eavesdropper', resolution: 'manual' },
    { kind: 'unresolved-source-reference', sourceLabel: 'eavesdropper skill' },
    { kind: 'anyOf', targets: [{ kind: 'skill', skillId: 'observation' }] },
  ])('rejects invalid or unrestricted contextual references %j', opponent => {
    expect(() => register(opponent)).toThrow();
  });
});
