import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { CraftedConsumableEffect, SkillCatalogContent, SkillIntegration } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const integration = catalog.integrations.get('nogger-consumption')!;
const consumption = integration.craftedConsumableEffect!;
const register = (value: unknown, subsystem = 'equipment') => createSkillCatalog({ ...generalSkillTranscriptionContent,
  integrations: generalSkillTranscriptionContent.integrations.map(record => record.id === integration.id
    ? { ...record, subsystem, craftedConsumableEffect: value } : record),
} as SkillCatalogContent);
const changeCase = (index: number, patch: object) => ({ ...consumption,
  cases: consumption.cases.map((value, i) => i === index ? { ...value, ...patch } : value),
});
const duration = { kind: 'attribute-derived-duration', unit: 'hour', base: 10,
  subtract: { kind: 'attribute', id: 'health' }, snapshot: 'current' } as const;

describe('Nogger crafted consumable source cases', () => {
  it('belongs to the crafted consumable and equipment integration, not a skill-test outcome', () => {
    expect(integration.subsystem).toBe('equipment');
    expect(consumption.target).toBe('crafted-consumable');
    expect(consumption.recipientRole).toBe('consumer');
    expect(consumption.caseSemantics).toBe('independent-source-conditions');
    expectTypeOf<typeof consumption>().toExtend<CraftedConsumableEffect>();
    expect(catalog.skills.get('nogger')?.testProfile).toBeUndefined();
    expect(catalog.skills.get('nogger')?.tools).toEqual({ kind: 'workshop' });
    expect(catalog.skills.get('nogger')?.rollBehavior).toEqual({ kind: 'open-ended', basis: 'magical' });
  });
  it('Dwarf full draught gives separate next-Health and scene-Social scopes, once active', () => {
    expect(consumption.cases[0]).toEqual({
      recipient: { kind: 'stock', stockId: 'dwarf' }, dose: { kind: 'full-draught' },
      repeat: 'once-active-non-stacking', effects: [
        { kind: 'dice-bonus', dice: 1, scope: { kind: 'next-ability-test', ability: { kind: 'attribute', id: 'health' } } },
        { kind: 'obstacle-modifier', delta: 1, scope: { kind: 'skill-type-tests', skillType: 'Social' }, duration: { kind: 'current-scene' } },
      ],
    });
  });
  it('Dwarf drunkenness uses consumed steins >= current Forte, with bounded derived duration', () => {
    expect(consumption.cases[1]).toEqual({ recipient: { kind: 'stock', stockId: 'dwarf' },
      dose: { kind: 'consumed-quantity-threshold', unit: 'stein', comparison: 'at-least',
        recipientAbility: { kind: 'stat', id: 'forte' }, snapshot: 'current' },
      repeat: 'unspecified', effects: [{ kind: 'intoxication', condition: 'drunk',
        modifier: { kind: 'obstacle-modifier', delta: 1, scope: { kind: 'all-tests' } }, duration }],
    });
    expect(duration).not.toHaveProperty('formula');
    expect(duration).not.toHaveProperty('minimum');
    expect(duration).not.toHaveProperty('calculatedHours');
  });
  it('non-Dwarf mouthful gives intoxication only, no restorative package or inherited duration', () => {
    expect(consumption.cases[2]).toEqual({ recipient: { kind: 'not-stock', stockId: 'dwarf' }, dose: { kind: 'mouthful' },
      repeat: 'unspecified', restorativeBenefit: 'none', effects: [{ kind: 'intoxication', condition: 'drunk',
        modifier: { kind: 'obstacle-modifier', delta: 1, scope: { kind: 'all-tests' } }, duration: { kind: 'unspecified' } }],
    });
    expect(consumption.cases[2].effects).not.toContainEqual(consumption.cases[0].effects[0]);
    expect(consumption.cases[2].effects).not.toContainEqual(consumption.cases[0].effects[1]);
  });
  it('serializes all three source cases with distinct duration/scope semantics', () => {
    expect(createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent))).integrations.get(integration.id)).toEqual(integration);
  });
  it('accepts source-authored synthetic stock conditions without Dwarf engine assumptions', () => {
    const value = { ...consumption, cases: consumption.cases.map(source => ({ ...source,
      recipient: { ...source.recipient, stockId: 'synthetic-stock' } })) };
    expect(register(value).integrations.get(integration.id)?.craftedConsumableEffect).toEqual(value);
  });
  it('is not Resources interaction, use bonus, valuation or structure resistance', () => {
    expect(integration).not.toHaveProperty('equipmentUseEffect');
    expect(integration).not.toHaveProperty('createdItemValueEffects');
    expect(integration).not.toHaveProperty('structureResistance');
    expect(() => register(consumption, 'resources')).toThrow();
  });
  it.each([
    { recipient: { kind: 'stock', stockId: '' } }, { recipient: { kind: 'target-stock', stockId: 'dwarf' } },
    { repeat: 'per-dose' }, { restorativeBenefit: 'auto' }, { effects: [] },
    { dose: { kind: 'consumed-quantity-threshold', unit: 'mug', comparison: 'at-least', recipientAbility: { kind: 'stat', id: 'forte' }, snapshot: 'current' } },
    { dose: { kind: 'consumed-quantity-threshold', unit: 'stein', comparison: 'greater-than', recipientAbility: { kind: 'stat', id: 'forte' }, snapshot: 'current' } },
    { dose: { kind: 'consumed-quantity-threshold', unit: 'stein', comparison: 'at-least', recipientAbility: { kind: 'stat', id: '' }, snapshot: 'current' } },
    { dose: { kind: 'full-draught', liters: 1 } },
    { effects: [{ kind: 'dice-bonus', dice: 0, scope: { kind: 'next-ability-test', ability: { kind: 'attribute', id: 'health' } } }] },
    { effects: [{ kind: 'dice-bonus', dice: 1, scope: { kind: 'all-tests' } }] },
    { effects: [{ kind: 'obstacle-modifier', delta: 1, scope: { kind: 'skill-type-tests', skillType: 'Unknown Type' }, duration: { kind: 'current-scene' } }] },
  ])('rejects malformed consumable case %j', patch => {
    expect(() => register(changeCase(0, patch))).toThrow('Invalid crafted consumable');
  });
  it.each([
    { kind: 'formula', formula: '10 - Health' }, { ...duration, base: 1.5 },
    { ...duration, subtract: { kind: 'stat', id: 'health' } }, { ...duration, minimum: 0 },
    { kind: 'unspecified', hours: 10 }, { kind: 'attribute-derived-duration', unit: 'hour', base: 10 },
  ])('rejects invalid/free-form/clamped derived duration %j', invalidDuration => {
    const effect = consumption.cases[1].effects[0];
    expect(() => register(changeCase(1, { effects: [{ ...effect, duration: invalidDuration }] }))).toThrow('Invalid crafted consumable');
  });
  it('remains a descriptor, not an executable integration', () => {
    expect(() => register({ ...consumption, evaluator: 'consume' })).toThrow('Invalid crafted consumable');
    expectTypeOf<typeof integration>().toExtend<SkillIntegration>();
  });
});
