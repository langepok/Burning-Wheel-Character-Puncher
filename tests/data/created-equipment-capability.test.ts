import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { CreatedEquipmentCapability, EquipmentUseEffect, SkillIntegration } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';
import { structureResistanceFixtureContent } from '../../src/data/skills/structure-resistance-fixtures';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const skill = catalog.skills.get('siege-engineer');
const expected = { kind: 'created-equipment-capability', output: { kind: 'created-equipment', equipmentKindId: 'war-machine' },
  capability: { kind: 'counts-as-tool', purpose: 'destroying-structures' } } as const;
const register = (createdEquipmentCapability: unknown, subsystem = 'equipment') => createSkillCatalog({
  ...generalSkillTranscriptionContent, integrations: generalSkillTranscriptionContent.integrations.map(entry =>
    entry.id === 'siege-engineer-output' ? { ...entry, createdEquipmentCapability, subsystem } as unknown as SkillIntegration : entry),
});

describe('Siege Engineer created-equipment capability', () => {
  it('attaches tool applicability to the crafted war machine without a numeric use effect', () => {
    expectTypeOf<typeof expected>().toExtend<CreatedEquipmentCapability>();
    expectTypeOf<typeof expected>().not.toExtend<EquipmentUseEffect>();
    expect(catalog.integrations.get('siege-engineer-output')).toMatchObject({
      skillId: 'siege-engineer', subsystem: 'equipment', createdEquipmentCapability: expected,
    });
    expect(skill?.capabilities).toEqual([{ kind: 'subsystem-capability', id: 'created-equipment-capability', integrationId: 'siege-engineer-output' }]);
    expect(skill?.testProfile).toBeUndefined();
    expect(skill?.resourceInteractions).toEqual([]);
  });
  it('keeps building tools independent of the resulting war machine', () => {
    expect(skill?.tools).toEqual({ kind: 'generic' });
    const changed = createSkillCatalog({ ...generalSkillTranscriptionContent,
      skills: generalSkillTranscriptionContent.skills.map(record => record.id === 'siege-engineer'
        ? { ...record, tools: { kind: 'none', expendable: false } as const } : record),
    });
    expect(changed.integrations.get('siege-engineer-output')?.createdEquipmentCapability).toEqual(expected);
  });
  it.each([
    ['Simple ram or scaling ladder', 1], ['Metal-capped ram', 2], ['Covered ram or siege tower', 3],
    ['Massive traction trebuchet', 4], ['Massive metal-capped covered ram', 5],
  ])('preserves building guidance %s Ob %i', (label, obstacle) => {
    expect(skill?.summary).toContain('Building guidance:');
    expect(skill?.summary).toContain(`${label} Ob ${obstacle}`);
  });
  it('preserves source root, type, FoRKs and character-burning restriction', () => {
    expect(skill?.rootRule).toEqual({ kind: 'single', ability: { kind: 'stat', id: 'perception' } });
    expect(skill?.skillType).toBe('Artisan');
    expect(skill?.forkSuggestions?.suggestions).toEqual(['blacksmith', 'munitions', 'rude-carpentry'].map(skillId => ({ target: { kind: 'skill', skillId } })));
    expect(skill?.availabilityRestrictions).toEqual([{ kind: 'stock-only', stockIds: ['orc'], scope: 'character-burning' }]);
  });
  it('round-trips output capability without introducing damage, an operator or a numerical bonus', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)));
    const integration = restored.integrations.get('siege-engineer-output');
    expect(integration?.createdEquipmentCapability).toEqual(expected);
    expect(integration?.equipmentUseEffect).toBeUndefined();
    expect(integration?.createdItemValueEffects).toBeUndefined();
    expect(integration?.structureResistance).toBeUndefined();
    expect(restored.skills.get('siege-engineer')).toEqual(skill);
  });
  it('preserves the separate Hallmaster/Stone Artifice structure-resistance contract', () => {
    const fixture = createSkillCatalog(structureResistanceFixtureContent);
    for (const [loaded, id] of [[catalog, 'hallmaster-resistance'], [fixture, 'stone-artifice-resistance']] as const) {
      expect(loaded.integrations.get(id)?.structureResistance).toEqual({ kind: 'structure-resistance', target: 'created-structure',
        acquisition: { kind: 'crafting-obstacle-tradeoff', choice: 'optional', obstacleDelta: 2, repeatability: 'unspecified' },
        effect: { kind: 'obstacle-modifier', delta: 1, target: 'tests-against-created-structure', appliesTo: ['alter', 'destroy'] } });
      expect(loaded.integrations.get(id)?.createdEquipmentCapability).toBeUndefined();
    }
  });
  it.each([
    null, {}, { ...expected, kind: 'equipment-use-bonus' }, { ...expected, output: null },
    { ...expected, output: { kind: '' } }, { ...expected, output: { ...expected.output, equipmentKindId: '' } }, { ...expected, capability: { kind: 'advantage-dice', dice: 1 } },
    { ...expected, capability: { kind: 'counts-as-tool', purpose: 'siege-engineer-test' } },
    { ...expected, output: { kind: 'war-machine', damage: 'B10' } },
    { ...expected, capability: { ...expected.capability, skillId: 'power' } },
  ])('rejects malformed output/tool capability %j', value => {
    expect(() => register(value)).toThrow('Invalid created-equipment capability');
  });
  it.each(['dice', 'obstacleDelta', 'damage', 'IMS', 'VA', 'operatingAbility', 'attackProcedure',
    'crewRequirement', 'ammunition', 'destructionTiming', 'evaluator'])(
    'rejects unsupported numeric/operating/destruction field %s', field => {
      expect(() => register({ ...expected, [field]: 1 })).toThrow('Invalid created-equipment capability');
    });
  it.each(['resources', 'magic', 'fight'])('rejects crafted-equipment capability in %s', subsystem => {
    expect(() => register(expected, subsystem)).toThrow('Invalid created-equipment capability');
  });
});
