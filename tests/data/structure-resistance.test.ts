import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { CreatedItemValueEffect, EquipmentUseEffect, ResourceInteraction, SkillIntegration, StructureResistance } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';
import { structureResistanceFixtureContent } from '../../src/data/skills/structure-resistance-fixtures';

const expected = {
  kind: 'structure-resistance', target: 'created-structure',
  acquisition: { kind: 'crafting-obstacle-tradeoff', choice: 'optional', obstacleDelta: 2, repeatability: 'unspecified' },
  effect: { kind: 'obstacle-modifier', delta: 1, target: 'tests-against-created-structure', appliesTo: ['alter', 'destroy'] },
} as const;
const catalog = createSkillCatalog(generalSkillTranscriptionContent);

describe('Created-structure resistance', () => {
  it('preserves Hallmaster building cost and the structure-owned alter/destroy penalty', () => {
    expect(catalog.integrations.get('hallmaster-resistance')).toMatchObject({ subsystem: 'equipment', structureResistance: expected });
    expect(catalog.skills.get('hallmaster')?.capabilities).toEqual([{ kind: 'subsystem-capability', id: 'structure-resistance', integrationId: 'hallmaster-resistance' }]);
  });
  it('preserves the partial Stone Artifice oracle when its full production record is transcribed', () => {
    const fixture = createSkillCatalog(structureResistanceFixtureContent);
    expect(fixture.integrations.get('stone-artifice-resistance')?.structureResistance).toEqual(expected);
    expect(fixture.skills.get('stone-artifice')?.coverage).toBe('partial');
    expect(catalog.skills.get('stone-artifice')?.coverage).toBe('complete');
    expect(catalog.integrations.get('stone-artifice-resistance')?.structureResistance).toEqual(expected);
  });
  it('distinguishes resistance from use bonuses, value and direct Resources interaction', () => {
    expectTypeOf<typeof expected>().toExtend<StructureResistance>();
    expectTypeOf<StructureResistance>().not.toExtend<EquipmentUseEffect>();
    expectTypeOf<StructureResistance>().not.toExtend<CreatedItemValueEffect>();
    expectTypeOf<StructureResistance>().not.toExtend<ResourceInteraction>();
    expect(catalog.integrations.get('hallmaster-resistance')?.equipmentUseEffect).toBeUndefined();
  });
  it.each(['hallmaster', 'stone-artifice'])('serializes %s resistance without inventing repeatability', id => {
    const content = id === 'hallmaster' ? generalSkillTranscriptionContent : structureResistanceFixtureContent;
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(content)) as typeof content);
    expect(restored.integrations.get(`${id}-resistance`)?.structureResistance).toEqual(expected);
    expect(restored.integrations.get(`${id}-resistance`)?.structureResistance?.acquisition).not.toHaveProperty('max');
  });
  it.each([
    { ...expected, target: 'created-item' }, { ...expected, kind: 'equipment-use-effect' },
    { ...expected, acquisition: { ...expected.acquisition, obstacleDelta: 0 } },
    { ...expected, acquisition: { ...expected.acquisition, obstacleDelta: 1.5 } },
    { ...expected, acquisition: { ...expected.acquisition, choice: 'automatic' } },
    { ...expected, acquisition: { ...expected.acquisition, repeatability: 'assumed-stackable' } },
    { ...expected, effect: { ...expected.effect, kind: 'advantage-dice' } },
    { ...expected, effect: { ...expected.effect, delta: -1 } },
    { ...expected, effect: { ...expected.effect, target: 'equipment-user' } },
    { ...expected, effect: { ...expected.effect, appliesTo: ['use'] } },
    { ...expected, effect: { ...expected.effect, appliesTo: ['alter', 'alter'] } },
    { ...expected, effect: { ...expected.effect, appliesTo: ['alter', 'destroy', 'use'] } },
  ])('rejects malformed structure resistance %j', value => {
    expect(() => register(value as unknown as StructureResistance)).toThrow('Invalid structure resistance');
  });
  it.each(['resources', 'magic', 'fight'] as const)('rejects resistance in %s', subsystem => {
    expect(() => createSkillCatalog({ ...generalSkillTranscriptionContent, integrations: generalSkillTranscriptionContent.integrations.map(entry =>
      entry.id === 'hallmaster-resistance' ? { ...entry, subsystem } as unknown as SkillIntegration : entry) })).toThrow('Invalid structure resistance');
  });
});

function register(structureResistance: StructureResistance) {
  return createSkillCatalog({ ...generalSkillTranscriptionContent, integrations: generalSkillTranscriptionContent.integrations.map(entry =>
    entry.id === 'hallmaster-resistance' ? { ...entry, structureResistance } as SkillIntegration : entry) });
}
