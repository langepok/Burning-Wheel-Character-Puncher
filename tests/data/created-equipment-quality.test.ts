import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { CreatedEquipmentQuality, SkillCatalogContent, SkillIntegration } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const expected = { kind: 'created-equipment-quality', outputKind: 'weapon',
  superior: { qualityRef: { kind: 'external-equipment-quality', id: 'superior-quality-weapon' },
    craftingObstacleAdjustment: 2, trigger: 'successful-manufacturing-test' },
  poor: { qualityRef: { kind: 'external-equipment-quality', id: 'poor-quality-weapon' },
    trigger: 'failed-manufacturing-test', genericFailureInteraction: 'unresolved' },
} as const;
const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const id = 'weaponsmith-quality';
const register = (createdEquipmentQuality: unknown, subsystem = 'equipment') => createSkillCatalog({ ...generalSkillTranscriptionContent,
  integrations: generalSkillTranscriptionContent.integrations.map(record => record.id === id ? { ...record, subsystem, createdEquipmentQuality } : record),
} as SkillCatalogContent);

describe('Weaponsmith external created-output quality', () => {
  it('preserves generic superior/poor references and their separate manufacturing conditions', () => {
    expectTypeOf<typeof expected>().toExtend<CreatedEquipmentQuality>();
    expect(catalog.integrations.get(id)?.createdEquipmentQuality).toEqual(expected);
  });
  it('keeps poor output generic-failure interaction unresolved rather than replacing or stacking consequences', () => {
    expect(expected.poor).toEqual({ qualityRef: { kind: 'external-equipment-quality', id: 'poor-quality-weapon' },
      trigger: 'failed-manufacturing-test', genericFailureInteraction: 'unresolved' });
    expect(catalog.skills.get('weaponsmith')?.testProfile).toBeUndefined();
    expect(catalog.skills.get('weaponsmith')?.procedures).toBeUndefined();
  });
  it('does not import War Art-specific armor/shield rerolls, balance dice or conflict resolution', () => {
    const integration = catalog.integrations.get(id);
    expect(integration?.sourceSpecificQualities).toBeUndefined();
    expect(integration?.weaponImprovements).toBeUndefined();
    expect(catalog.integrations.get('war-art-results')?.sourceSpecificQualities?.reconciliation.kind).toBe('unresolved-source-conflict');
    expect(catalog.integrations.get('war-art-results')?.createdEquipmentQuality).toBeUndefined();
  });
  it('preserves source root/type/tools/FoRK and all manufacturing obstacles', () => {
    const skill = catalog.skills.get('weaponsmith');
    expect(skill).toMatchObject({ coverage: 'complete', skillType: 'Craftsman', tools: { kind: 'workshop' },
      rootRule: { kind: 'combined', abilities: [{ kind: 'stat', id: 'perception' }, { kind: 'stat', id: 'agility' }] } });
    expect(skill?.forkSuggestions?.suggestions).toEqual([{ target: { kind: 'skill', skillId: 'blacksmith' } }]);
    for (const row of ['knife Ob 1', 'spear/short sword/mace/light axe Ob 2', 'arming/long sword Ob 3', 'polearm Ob 4'])
      expect(skill?.summary).toContain(row);
  });
  it('round-trips quality categories without resolving stats or applying failure consequences', () => {
    expect(createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent))).integrations.get(id)?.createdEquipmentQuality).toEqual(expected);
  });
  it('restricts created-equipment quality to its equipment boundary', () => {
    const valid = { id, skillId: 'weaponsmith', subsystem: 'equipment', summary: 'Manufacturing quality references.', source: [], createdEquipmentQuality: expected } as const;
    expectTypeOf<typeof valid>().toExtend<SkillIntegration>();
    const invalid = { ...valid, subsystem: 'resources' } as const;
    expectTypeOf<typeof invalid>().not.toExtend<SkillIntegration>();
    expect(() => register(expected, 'resources')).toThrow('Invalid');
  });
  it.each([
    { ...expected, outputKind: 'armor' },
    { ...expected, superior: { ...expected.superior, craftingObstacleAdjustment: 0 } },
    { ...expected, superior: { ...expected.superior, craftingObstacleAdjustment: -2 } },
    { ...expected, superior: { ...expected.superior, trigger: 'automatic' } },
    { ...expected, superior: { ...expected.superior, qualityRef: { kind: 'skill', id: 'superior-quality-weapon' } } },
    { ...expected, superior: { ...expected.superior, qualityRef: { kind: 'external-equipment-quality', id: 'war-art-superior-armor' } } },
    { ...expected, superior: { ...expected.superior, balanceDice: 1 } },
    { ...expected, superior: { ...expected.superior, damage: 'B6' } },
    { ...expected, poor: { ...expected.poor, trigger: 'deliberately-fail' } },
    { ...expected, poor: { ...expected.poor, trigger: 'zero-successes' } },
    { ...expected, poor: { ...expected.poor, craftingObstacleAdjustment: -1 } },
    { ...expected, poor: { ...expected.poor, genericFailureInteraction: 'replaces-all' } },
    { ...expected, poor: { ...expected.poor, genericFailureInteraction: 'stacks' } },
    { ...expected, poor: { ...expected.poor, genericFailureInteraction: 'exclusive-outcome' } },
    { ...expected, poor: { ...expected.poor, qualityRef: { kind: 'external-equipment-quality', id: '' } } },
    { ...expected, diceSuppression: true }, { ...expected, chooseZeroSuccesses: true },
    { ...expected, rerolls: 'ones' }, { ...expected, poor: null }, null, {},
  ])('rejects malformed quality data or invented failure/stat mechanics %j', value => {
    expect(() => register(value)).toThrow('Invalid');
  });
});
