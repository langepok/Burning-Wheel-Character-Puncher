import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { PoisonTreatment, SkillIntegration } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const skill = catalog.skills.get('song-of-soothing');
const expected = { kind: 'poison-treatment', branches: [
  { poisonEffectKind: 'injury', obstacle: { kind: 'procedure-reference', skillId: 'herbalism', procedure: 'wound-treatment', input: 'caused-wound' },
    onSuccess: { kind: 'halve-die-penalty', target: 'poison-caused-die-penalties', rounding: 'up' } },
  { poisonEffectKind: 'obstacle-penalty', obstacle: { kind: 'current-penalty', penaltyKind: 'obstacle' },
    onExtraSuccesses: { kind: 'reduce-obstacle-penalty', basis: 'successes-over-obstacle', rate: 'source-unspecified' } },
  { poisonEffectKind: 'direct-dice-subtraction', obstacle: { kind: 'double-current-dice-subtraction' },
    onExtraSuccesses: { kind: 'restore-dice', dicePerSuccessOverObstacle: 1 } },
] } as const;
const register = (poisonTreatment: unknown, subsystem = 'injury') => createSkillCatalog({
  ...generalSkillTranscriptionContent, integrations: generalSkillTranscriptionContent.integrations.map(record =>
    record.id === 'song-of-soothing-treatment' ? { ...record, poisonTreatment, subsystem } as unknown as SkillIntegration : record),
});
const branch = (index: number, fields: object) => ({ ...expected, branches: expected.branches.map((value, i) => i === index ? { ...value, ...fields } : value) });

describe('Song of Soothing injury reference and asymmetric poison treatment', () => {
  it('keeps ordinary injury treatment as contextual Herbalism reuse, separate from poison procedures', () => {
    expect(skill?.relations).toEqual([{ kind: 'same-mechanics', target: { kind: 'skill', id: 'herbalism' }, context: { kind: 'activity', activity: 'wound-treatment' } }]);
    expect(skill?.tools).toEqual({ kind: 'generic' });
    expect(catalog.skills.get('herbalism')?.tools).toEqual({ kind: 'generic', expendable: true });
  });
  it('retains source root, type, magical marker and Elven restriction', () => {
    expect(skill).toMatchObject({ rootRule: { kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'perception' }] },
      skillType: 'Medicinal', printedMarkers: ['§'], availabilityRestrictions: [{ kind: 'stock-only', stockIds: ['elf'], scope: 'always' }] });
  });
  it('preserves exactly three source-shaped branches in Injury integration', () => {
    expectTypeOf<typeof expected>().toExtend<PoisonTreatment>();
    expect(catalog.integrations.get('song-of-soothing-treatment')).toMatchObject({ subsystem: 'injury', poisonTreatment: expected });
    expect(catalog.integrations.get('song-of-soothing-treatment')?.poisonTreatment?.branches).toHaveLength(3);
  });
  it('uses the caused-wound Herbalism obstacle and halves poison die penalties, round up', () => {
    expect(catalog.integrations.get('song-of-soothing-treatment')?.poisonTreatment?.branches[0]).toEqual(expected.branches[0]);
  });
  it('leaves obstacle-penalty reduction rate unspecified while retaining the margin relationship', () => {
    expect(catalog.integrations.get('song-of-soothing-treatment')?.poisonTreatment?.branches[1]).toEqual(expected.branches[1]);
  });
  it('uses double direct dice subtraction as Ob and restores one die per extra success', () => {
    expect(catalog.integrations.get('song-of-soothing-treatment')?.poisonTreatment?.branches[2]).toEqual(expected.branches[2]);
  });
  it('round-trips the reference and all treatment branches without executing penalty arithmetic', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)));
    expect(restored.skills.get('song-of-soothing')).toEqual(skill);
    expect(restored.integrations.get('song-of-soothing-treatment')?.poisonTreatment).toEqual(expected);
    expect(catalog.skills.get('poisons')?.integrationTags).not.toContain('injury');
  });
  it.each([
    null, {}, { ...expected, branches: [] }, { ...expected, branches: expected.branches.slice(0, 2) },
    { ...expected, branches: [...expected.branches, expected.branches[0]] },
    branch(0, { obstacle: { ...expected.branches[0].obstacle, input: 'arbitrary-wound' } }),
    branch(0, { onSuccess: { ...expected.branches[0].onSuccess, rounding: 'down' } }),
    branch(0, { onSuccess: { ...expected.branches[0].onSuccess, target: 'wound-recovery' } }),
    branch(0, { onSuccess: { ...expected.branches[0].onSuccess, roundingAppliesTo: 'remaining-penalty' } }),
    branch(1, { obstacle: { kind: 'current-penalty', penaltyKind: 'dice' } }),
    branch(1, { onExtraSuccesses: { ...expected.branches[1].onExtraSuccesses, rate: 1 } }),
    branch(1, { onExtraSuccesses: { ...expected.branches[1].onExtraSuccesses, perExtraSuccess: -1 } }),
    branch(2, { obstacle: { kind: 'double-obstacle-penalty' } }),
    branch(2, { onExtraSuccesses: { kind: 'restore-dice', dicePerSuccessOverObstacle: 2 } }),
  ])('rejects malformed treatment or unsupported cross-branch semantics %j', value => {
    expect(() => register(value)).toThrow('Invalid poison treatment');
  });
  it.each(['duration', 'resistance', 'recoveryTimeline', 'onFailure', 'formula', 'evaluator'])(
    'rejects invented procedure field %s', field => {
      expect(() => register({ ...expected, [field]: 1 })).toThrow('Invalid poison treatment');
    });
  it.each(['', 'unknown-skill'])('rejects unresolved skill identity in procedure reference %s', skillId => {
    expect(() => register(branch(0, { obstacle: { ...expected.branches[0].obstacle, skillId } }))).toThrow();
  });
  it.each(['magic', 'equipment', 'poisons'])('rejects treatment in %s', subsystem => {
    expect(() => register(expected, subsystem)).toThrow('Invalid poison treatment');
  });
});
