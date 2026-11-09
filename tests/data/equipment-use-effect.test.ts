import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { CreatedItemValueEffect, EquipmentUseEffect, ResourceInteraction, SkillIntegration } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const forge = {
  target: { kind: 'created-equipment', equipmentKindId: 'forge' },
  effect: { kind: 'advantage-dice', dice: 1, recipient: 'equipment-user', appliesTo: 'tests-using-equipment' },
  acquisition: { kind: 'crafting-obstacle-tradeoff', choice: 'optional', obstacleDelta: 2,
    repeatability: 'per-increment', requiresSuccessfulCreation: true },
} as const;

describe('Created-equipment use bonus metadata', () => {
  it('stores Forge Artifice per-increment cost/bonus and successful creation', () => {
    expect(catalog.integrations.get('forge-artifice-use')).toMatchObject({ subsystem: 'equipment', equipmentUseEffect: forge });
    expect(catalog.skills.get('forge-artifice')?.capabilities).toContainEqual({ kind: 'subsystem-capability', id: 'forge-use-bonus', integrationId: 'forge-artifice-use' });
    expect(catalog.integrations.get('forge-artifice-use')?.equipmentUseEffect?.acquisition).not.toHaveProperty('max');
  });
  it('preserves Black Metal tools bonus without inferring repeatability', () => {
    expect(catalog.integrations.get('black-metal-artifice-use')?.equipmentUseEffect).toEqual({
      ...forge, target: { kind: 'created-equipment', equipmentKindId: 'tools' },
      acquisition: { ...forge.acquisition, repeatability: 'unspecified' },
    });
    expect(catalog.skills.get('black-metal-artifice')?.resourceInteractions).toEqual([]);
  });
  it('distinguishes equipment-owned use effects from value effects and direct Resources effects', () => {
    expectTypeOf<typeof forge>().toExtend<EquipmentUseEffect>();
    expectTypeOf<EquipmentUseEffect>().not.toExtend<CreatedItemValueEffect>();
    expectTypeOf<EquipmentUseEffect>().not.toExtend<ResourceInteraction>();
    expect(catalog.integrations.get('forge-artifice-use')?.createdItemValueEffects).toBeUndefined();
  });
  it('round-trips the descriptors through catalog integrity validation', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)) as typeof generalSkillTranscriptionContent);
    for (const id of ['forge-artifice-use', 'black-metal-artifice-use']) {
      expect(restored.integrations.get(id)).toEqual(catalog.integrations.get(id));
    }
  });
  it('can represent an explicitly single tradeoff without applying it to Black Metal', () => {
    const effect: EquipmentUseEffect = { ...forge, acquisition: { ...forge.acquisition, repeatability: 'single-tradeoff' } };
    expect(register(effect).integrations.get('forge-artifice-use')?.equipmentUseEffect).toEqual(effect);
    expect(catalog.integrations.get('black-metal-artifice-use')?.equipmentUseEffect?.acquisition.repeatability).toBe('unspecified');
  });
  it.each([
    { ...forge, target: { kind: 'created-equipment', equipmentKindId: '' } },
    { ...forge, target: { kind: 'created-equipment', equipmentKindId: ' ' } },
    { ...forge, target: { kind: 'skill', equipmentKindId: 'forge' } },
    { ...forge, effect: { ...forge.effect, dice: 0 } },
    { ...forge, effect: { ...forge.effect, dice: 1.5 } },
    { ...forge, effect: { ...forge.effect, kind: 'resources-value-dice' } },
    { ...forge, effect: { ...forge.effect, recipient: 'skill-owner' } },
    { ...forge, effect: { ...forge.effect, appliesTo: 'all-tests' } },
    { ...forge, acquisition: { ...forge.acquisition, obstacleDelta: 0 } },
    { ...forge, acquisition: { ...forge.acquisition, repeatability: 'guess-from-skill' } },
    { ...forge, acquisition: { ...forge.acquisition, requiresSuccessfulCreation: false } },
    { ...forge, acquisition: { ...forge.acquisition, choice: 'automatic' } },
  ])('rejects malformed equipment-use metadata %j', effect => {
    expect(() => register(effect as unknown as EquipmentUseEffect)).toThrow('Invalid equipment-use effect');
  });
  it.each(['resources', 'magic', 'fight'] as const)('rejects an equipment-use effect under %s', subsystem => {
    expect(() => createSkillCatalog({ ...generalSkillTranscriptionContent,
      integrations: generalSkillTranscriptionContent.integrations.map(integration => integration.id === 'forge-artifice-use'
        ? { ...integration, subsystem } as unknown as SkillIntegration : integration),
    })).toThrow('Invalid equipment-use effect');
  });
});

function register(equipmentUseEffect: EquipmentUseEffect) {
  return createSkillCatalog({ ...generalSkillTranscriptionContent,
    integrations: generalSkillTranscriptionContent.integrations.map(integration => integration.id === 'forge-artifice-use'
      ? { ...integration, equipmentUseEffect } as SkillIntegration : integration),
  });
}
