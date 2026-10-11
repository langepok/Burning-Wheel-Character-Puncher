import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { DoubleObstaclePenalty, SkillRecord, SkillTestProfile } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const alternatives = { kind: 'anyOf', operands: [
  { ability: { kind: 'skill', skillId: 'escape-artist' } },
  { ability: { kind: 'stat', id: 'power' }, modifiers: [{ kind: 'double-obstacle-penalty' }] },
] } as const;
const expected = { kind: 'versus', context: { kind: 'activity', activity: 'securing-a-person' }, opposingAbilities: alternatives } as const;
const catalog = createSkillCatalog(generalSkillTranscriptionContent);
function register(opposingAbilities: unknown) {
  return createSkillCatalog({ ...generalSkillTranscriptionContent,
    skills: generalSkillTranscriptionContent.skills.map(skill => skill.id === 'knots'
      ? { ...skill, testProfile: { ...expected, opposingAbilities } } as SkillRecord : skill) });
}
describe('Mixed opposing alternatives / canonical Double Obstacle Penalty', () => {
  it('preserves securing-person scope, Escape Artist OR Power and the Power-only penalty', () => {
    expectTypeOf<typeof expected>().toExtend<SkillTestProfile>();
    expect(catalog.skills.get('knots')?.testProfile).toEqual(expected);
    expect(alternatives.operands[0]).not.toHaveProperty('modifiers');
    expect(alternatives.operands[1].modifiers).toEqual([{ kind: 'double-obstacle-penalty' }]);
    expect(catalog.skills.has('power')).toBe(false);
    expect(catalog.skills.has('escape-artist')).toBe(false);
    expect(catalog.references.get('escape-artist')?.source).toEqual([
      expect.objectContaining({ pages: { printed: [280], pdf: [282] } }),
    ]);
  });
  it('keeps the named mechanic distinct from additive deltas and final multipliers', () => {
    type Fixed = NonNullable<SkillTestProfile['modifiers']>[number];
    expectTypeOf<DoubleObstaclePenalty>().not.toExtend<Fixed>();
    expectTypeOf<{ kind: 'final-obstacle-multiplier'; factor: 2 }>().not.toExtend<DoubleObstaclePenalty>();
    expect(alternatives.operands[1].modifiers[0]).not.toHaveProperty('delta');
    expect(alternatives.operands[1].modifiers[0]).not.toHaveProperty('factor');
  });
  it('round-trips mixed alternatives without changing existing fixed/contextual profiles', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)));
    expect(restored.skills.get('knots')?.testProfile).toEqual(expected);
    expect(restored.skills.get('inconspicuous')?.testProfile?.opposingAbilities).toEqual([{ kind: 'skill', skillId: 'observation' }]);
    expect(restored.skills.get('jargon')?.testProfile?.opposingAbilities).toEqual([
      { kind: 'context-resolved-skill', actorRole: 'eavesdropper', resolution: 'manual' },
    ]);
  });
  it('resolves fixed skill alternatives through the catalog', () => {
    expect(() => register({ ...alternatives, operands: [
      { ability: { kind: 'skill', skillId: 'missing' } }, alternatives.operands[1],
    ] })).toThrow('Unknown skill reference');
  });
  it.each([
    undefined, { kind: 'allOf', operands: alternatives.operands }, { kind: 'anyOf', operands: [] },
    { kind: 'anyOf', operands: [alternatives.operands[0]] },
    { kind: 'anyOf', operands: [alternatives.operands[0], alternatives.operands[0]] },
    ...[
      { ability: { kind: 'stat', id: '' } }, { ability: { kind: 'stat', id: 1 } },
      { ability: { kind: 'stat', statId: 'power' } }, { ability: { kind: 'skill', skillId: '' } },
      { ability: { kind: 'unknown', id: 'power' } }, { ability: undefined },
      { ...alternatives.operands[1], modifiers: 'double penalty' },
      ...[
        { kind: 'obstacle', delta: 2 }, { kind: 'final-obstacle-multiplier', factor: 2 },
        { kind: 'double-obstacle-penalty', delta: 0 }, { kind: 'double-obstacle-penalty', factor: 2 },
        { kind: 'double-obstacle-penalty', expression: 'finalObstacle * 2' },
      ].map(modifier => ({ ...alternatives.operands[1], modifiers: [modifier] })),
    ].map(branch => ({ ...alternatives, operands: [alternatives.operands[0], branch] })),
  ])('rejects malformed alternatives/abilities/semantic penalties %j', opposingAbilities => {
    expect(() => register(opposingAbilities)).toThrow();
  });
});
