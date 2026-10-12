import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { EquipmentResult, EquipmentUseEffect, CreatedItemValueEffect, StructureResistance, SkillIntegration } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const expected = {
  target: { kind: 'created-equipment', equipmentKindId: 'boots' },
  acquisition: { kind: 'enchantment-combination', requires: { kind: 'allOf', operands: [
    { kind: 'training', skillId: 'antiphon-union-training' },
    { kind: 'spell-song', subsystem: 'magic', sourceName: 'Song of Silence' },
  ] } },
  effect: { kind: 'skill-test-dice-bonus', recipient: 'equipment-user', skillId: 'stealthy', dice: 1 },
} as const;
const catalog = createSkillCatalog(generalSkillTranscriptionContent);
function register(equipmentResult: unknown) {
  return createSkillCatalog({ ...generalSkillTranscriptionContent,
    integrations: generalSkillTranscriptionContent.integrations.map(integration => integration.id === 'leathercraft-boots'
      ? { ...integration, equipmentResult } as SkillIntegration : integration) });
}
describe('Enchantment-acquired equipment result metadata', () => {
  it('preserves boots, both required components and the Stealthy-only die', () => {
    expectTypeOf<typeof expected>().toExtend<EquipmentResult>();
    expect(catalog.integrations.get('leathercraft-boots')?.equipmentResult).toEqual(expected);
    expect(catalog.skills.get('leathercraft')?.tools).toEqual({ kind: 'workshop' });
    expect(catalog.skills.get('antiphon-union-training')?.training?.kind).toBe('training');
    expect(catalog.skills.get('antiphon-union-training')?.tools).toEqual({ kind: 'none', expendable: false });
    expect(catalog.skills.has('song-of-silence')).toBe(false);
    expect(catalog.references.has('song-of-silence')).toBe(false);
    expect(expected.acquisition).not.toHaveProperty('cost');
    expect(expected.acquisition).not.toHaveProperty('obstacleDelta');
  });
  it('is distinct from tradeoff use bonuses, item value and structure resistance', () => {
    expectTypeOf<EquipmentResult>().not.toExtend<EquipmentUseEffect>();
    expectTypeOf<EquipmentResult>().not.toExtend<CreatedItemValueEffect>();
    expectTypeOf<EquipmentResult>().not.toExtend<StructureResistance>();
    expect(catalog.integrations.get('leathercraft-boots')).not.toHaveProperty('equipmentUseEffect');
    expect(catalog.integrations.get('leathercraft-boots')).not.toHaveProperty('createdItemValueEffects');
  });
  it('serializes references while leaving generic Antiphon integrations intact', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)));
    expect(restored.integrations.get('leathercraft-boots')?.equipmentResult).toEqual(expected);
    for (const id of ['jewelcraft-antiphon', 'gemcraft-antiphon', 'antiphon-creation']) {
      expect(restored.integrations.get(id)).toEqual(catalog.integrations.get(id));
    }
    expect(restored.integrations.get('leathercraft-antiphon')?.summary).toContain('no numeric belt effect');
    expect(restored.integrations.get('leathercraft-antiphon')).not.toHaveProperty('equipmentResult');
  });
  it.each([
    { ...expected, target: { kind: 'created-equipment', equipmentKindId: '' } },
    { ...expected, acquisition: { ...expected.acquisition, cost: { kind: 'crafting-obstacle-modifier', delta: 2 } } },
    { ...expected, acquisition: { ...expected.acquisition, inheritTools: true } },
    ...[
      { kind: 'allOf', operands: [] },
      { kind: 'allOf', operands: [expected.acquisition.requires.operands[0]] },
      { kind: 'anyOf', operands: expected.acquisition.requires.operands },
      { kind: 'allOf', operands: [expected.acquisition.requires.operands[0], expected.acquisition.requires.operands[0]] },
      ...[
        { kind: 'training', skillId: 'missing' }, { kind: 'training', skillId: 'stealthy' },
        { kind: 'skill', skillId: 'antiphon-union-training' },
        { kind: 'spell-song', subsystem: 'magic', sourceName: '' },
        { kind: 'spell-song', subsystem: 'equipment', sourceName: 'Song of Silence' },
        { ...expected.acquisition.requires.operands[1], skillId: 'song-of-silence' },
      ].map(component => ({ kind: 'allOf', operands: [expected.acquisition.requires.operands[0], component] })),
    ].map(requires => ({ ...expected, acquisition: { kind: 'enchantment-combination', requires } })),
    ...[
      { ...expected.effect, skillId: 'missing' }, { ...expected.effect, dice: 0 },
      { ...expected.effect, dice: 1.5 }, { ...expected.effect, kind: 'resources-value-dice' },
    ].map(effect => ({ ...expected, effect })),
  ])('rejects malformed acquisition/result/references %j', result => {
    expect(() => register(result)).toThrow();
  });
});
