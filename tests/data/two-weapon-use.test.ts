import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { SkillCatalogContent, SkillIntegration, TwoWeaponUse } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const id = 'two-fisted-fighting-use';
const expected = { kind: 'two-weapon-use', equipmentRequirements: {
  weaponCount: 2, eachWeapon: { handedness: 'one-handed', maxWeaponLength: 'long' },
  offHand: { relativeWeight: { relation: 'less-than-or-equal', compareTo: 'other-weapon' } },
}, permissions: {
  offHandStrike: { action: 'strike', penalty: 'negated' },
  simultaneousStrike: { action: 'strike', enabled: true, timing: 'simultaneous',
    diceAllocation: { kind: 'split-pool', targets: 'two-weapons', allocation: 'player-chosen' } },
  blockAndStrike: { action: 'block-and-strike', enabled: true, accessBasis: 'owning-training-and-eligible-pair',
    diceAllocation: { kind: 'split-skill-dice', between: ['attack', 'defense'], allocation: 'player-chosen' } },
} } as const;
const register = (twoWeaponUse: unknown, subsystem = 'fight', skillId = 'two-fisted-fighting-training') => createSkillCatalog({
  ...generalSkillTranscriptionContent,
  skills: generalSkillTranscriptionContent.skills.map(record => record.id === 'two-fisted-fighting-training' && skillId !== record.id
    ? { ...record, capabilities: [] } : record),
  integrations: generalSkillTranscriptionContent.integrations.map(record => record.id === id
    ? { ...record, skillId, subsystem, twoWeaponUse } : record),
} as SkillCatalogContent);

describe('Two-Fisted Fighting Training equipment, permissions and allocations', () => {
  it('preserves Agility and Aptitude-only Training without an acting exponent', () => {
    const skill = catalog.skills.get('two-fisted-fighting-training');
    expect(skill).toMatchObject({ coverage: 'complete', skillType: 'Martial Training', tools: { kind: 'none', expendable: false },
      rootRule: { kind: 'single', ability: { kind: 'stat', id: 'agility' } }, printedMarkers: ['*'],
      training: { kind: 'training', rootUsage: 'aptitude-only', learningMethods: ['practice', 'instruction'],
        exponent: 'none', advancement: 'none', openingCost: 2 } });
    expect(skill?.testProfile).toBeUndefined();
  });
  it('preserves the complete source descriptor without invented defaults or numeric bonuses', () => {
    expectTypeOf<typeof expected>().toExtend<TwoWeaponUse>();
    expect(catalog.integrations.get(id)?.twoWeaponUse).toEqual(expected);
    expect(catalog.integrations.get(id)?.subsystem).toBe('fight');
  });
  it('reuses Block & Strike action identity through a distinct prerequisite path', () => {
    const shield = catalog.integrations.get('shield-training-use')!.shieldUse!;
    expect(expected.permissions.blockAndStrike.action).toBe(shield.trainedDefenseAccess[2].action);
    expect(catalog.integrations.get(id)?.shieldUse).toBeUndefined();
    expect(catalog.skills.get('two-fisted-fighting-training')?.relations).toEqual([]);
    expect(expected.permissions.blockAndStrike.accessBasis).toBe('owning-training-and-eligible-pair');
  });
  it('keeps off-hand Strike exemption separate from each dice allocation and weapon profile identity', () => {
    expect(expected.permissions.offHandStrike).toEqual({ action: 'strike', penalty: 'negated' });
    expect(expected.permissions.simultaneousStrike.diceAllocation).toEqual({ kind: 'split-pool', targets: 'two-weapons', allocation: 'player-chosen' });
    expect(expected.permissions.blockAndStrike.diceAllocation).toEqual({ kind: 'split-skill-dice', between: ['attack', 'defense'], allocation: 'player-chosen' });
    expect(catalog.skills.get('two-fisted-fighting-training')?.combatUseChoice).toBeUndefined();
  });
  it('round-trips without choosing weapons, skills or dice allocations', () => {
    expect(createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent))).integrations.get(id)?.twoWeaponUse).toEqual(expected);
  });
  it('cannot attach the descriptor to other subsystems or a non-Training owner', () => {
    expect(() => register(expected, 'resources')).toThrow('Invalid two-weapon-use');
    expect(() => register(expected, 'fight', 'sword')).toThrow('Invalid two-weapon-use');
    const fightRecord = { id, skillId: 'two-fisted-fighting-training', subsystem: 'fight', twoWeaponUse: expected,
      summary: 'Source-shaped two-weapon permissions.', source: [] } as const;
    expectTypeOf<typeof fightRecord>().toExtend<SkillIntegration>();
    const wrongSubsystem = { ...fightRecord, subsystem: 'resources' } as const;
    expectTypeOf<typeof wrongSubsystem>().not.toExtend<SkillIntegration>();
  });
  it.each([
    { weaponCount: 1 }, { weaponCount: 3 }, { eachWeapon: { handedness: 'two-handed', maxWeaponLength: 'long' } },
    { eachWeapon: { handedness: 'one-handed', maxWeaponLength: 'longest' } },
    { eachWeapon: { ...expected.equipmentRequirements.eachWeapon, sameSkill: true } },
    { offHand: { relativeWeight: { relation: 'greater-than', compareTo: 'other-weapon' } } },
    { offHand: { ...expected.equipmentRequirements.offHand, mustBeShorter: true } },
    { sameLength: true }, { sameProfile: true }, { shieldsQualify: true },
  ])('rejects malformed or invented weapon-pair constraints %j', fields => {
    expect(() => register({ ...expected, equipmentRequirements: { ...expected.equipmentRequirements, ...fields } })).toThrow('Invalid two-weapon-use');
  });
  it.each([
    { action: 'block' }, { action: 'all-off-hand-actions' }, { magnitude: 1 }, { penalty: -1 },
  ])('rejects broad or numeric penalty exemptions %j', fields => {
    expect(() => register({ ...expected, permissions: { ...expected.permissions,
      offHandStrike: { ...expected.permissions.offHandStrike, ...fields } } })).toThrow('Invalid two-weapon-use');
  });
  it.each([
    { allocation: 'equal' }, { defaultSplit: [0.5, 0.5] }, { minimumDice: 1 }, { bonusDice: 1 },
    { kind: 'two-full-pools' }, { actingAbility: { kind: 'skill', id: 'two-fisted-fighting-training' } },
  ])('rejects invented simultaneous-Strike allocations %j', fields => {
    expect(() => register({ ...expected, permissions: { ...expected.permissions, simultaneousStrike: {
      ...expected.permissions.simultaneousStrike, diceAllocation: { ...expected.permissions.simultaneousStrike.diceAllocation, ...fields },
    } } })).toThrow('Invalid two-weapon-use');
  });
  it.each([
    { accessBasis: 'owns-shield-training' }, { shieldContribution: 'defense-dice' }, { shieldVA: 1 },
    { shieldDamage: 'B3' }, { grantsTraining: 'shield-training' },
    { diceAllocation: { kind: 'split-skill-dice', between: ['attack', 'defense'], allocation: 'equal' } },
  ])('rejects Shield inheritance and invented Block & Strike rules %j', fields => {
    expect(() => register({ ...expected, permissions: { ...expected.permissions,
      blockAndStrike: { ...expected.permissions.blockAndStrike, ...fields } } })).toThrow('Invalid two-weapon-use');
  });
  it.each([null, {}, { ...expected, actionCost: 1 }, { ...expected, damage: 'B3' }, { ...expected, permissions: null }])('rejects malformed descriptors %j', value => {
    expect(() => register(value)).toThrow('Invalid two-weapon-use');
  });
});
