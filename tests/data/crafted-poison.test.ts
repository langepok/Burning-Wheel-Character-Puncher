import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { CraftedPoison, SkillCatalogContent, PoisonPotency, PoisonDelivery } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const integration = catalog.integrations.get('poisons-crafted-product')!;
const poison = integration.craftedPoison!;
const register = (value: unknown, subsystem = 'equipment') => createSkillCatalog({ ...generalSkillTranscriptionContent,
  integrations: generalSkillTranscriptionContent.integrations.map(record => record.id === integration.id
    ? { ...record, subsystem, craftedPoison: value } : record),
} as SkillCatalogContent);
const potency = (patch: object) => ({ ...poison, potencies: [{ ...poison.potencies[0], ...patch }, ...poison.potencies.slice(1)] });
const delivery = (patch: object) => ({ ...poison, deliveries: [{ ...poison.deliveries[0], ...patch }, ...poison.deliveries.slice(1)] });

describe('Poisons independent potency and delivery dimensions', () => {
  it('belongs to the crafted product, separate from crafting actor outcomes and Nogger consumption', () => {
    expectTypeOf<typeof poison>().toExtend<CraftedPoison>();
    expect(poison.target).toBe('created-poison');
    expect(integration.subsystem).toBe('equipment');
    expect(catalog.skills.get('poisons')?.integrationTags).toEqual(['equipment', 'poisons']);
    expect(catalog.skills.get('poisons')?.testProfile).toBeUndefined();
    expect(catalog.skills.get('poisons')?.rootRule).toEqual({ kind: 'single', ability: { kind: 'stat', id: 'perception' } });
    expect(catalog.skills.get('poisons')?.tools).toEqual({ kind: 'generic', expendable: true });
    expect(catalog.skills.get('poisons')?.skillType).toBe('Special');
    expect(integration.craftedConsumableEffect).toBeUndefined();
  });
  it.each([
    ['sickening', 2, { kind: 'obstacle-penalty', delta: 1, scope: 'source-unspecified' }],
    ['debilitating', 3, { kind: 'obstacle-penalty', delta: 2, scope: 'source-unspecified' }],
    ['deadly', 4, { kind: 'fixed-wound', severity: { shade: 'black', exponent: 10 } }],
  ])('preserves %s base crafting obstacle and product effect', (kind, craftingObstacle, effect) => {
    expect(poison.potencies.find(value => value.kind === kind)).toEqual({ kind, craftingObstacle, effect });
  });
  it('stores ingestion baseline and delivery costs separately', () => {
    expect(poison.deliveries).toEqual([
      { kind: 'ingestion', craftingObstacleDelta: 0 }, { kind: 'blade', craftingObstacleDelta: 1 },
      { kind: 'inhaled-vapor', craftingObstacleDelta: 2 }, { kind: 'contact', craftingObstacleDelta: 3 },
    ]);
    expectTypeOf<typeof poison.potencies[number]>().toExtend<PoisonPotency>();
    expectTypeOf<typeof poison.deliveries[number]>().toExtend<PoisonDelivery>();
  });
  it.each([['sickening', [2, 3, 4, 5]], ['debilitating', [3, 4, 5, 6]], ['deadly', [4, 5, 6, 7]]] as const)(
    'checks %s totals in tests only; delivery never changes the effect', (kind, totals) => {
      const variant = poison.potencies.find(value => value.kind === kind)!;
      expect(poison.deliveries.map(method => variant.craftingObstacle + method.craftingObstacleDelta)).toEqual(totals);
      poison.deliveries.forEach(method => { expect(method).not.toHaveProperty('effect'); });
      expect(variant).not.toHaveProperty('totalObstacle');
    });
  it('does not invent penalty scope, time or resistance, or convert B10 to Mark/weapon damage', () => {
    for (const variant of poison.potencies) {
      expect(variant.effect).not.toHaveProperty('duration');
      expect(variant.effect).not.toHaveProperty('resistance');
      expect(variant.effect).not.toHaveProperty('onset');
      expect(variant.effect).not.toHaveProperty('repeatability');
    }
    expect(poison.potencies[2].effect).not.toHaveProperty('result');
  });
  it('serializes each dimension independently and round-trips catalog integrity', () => {
    expect(JSON.parse(JSON.stringify(poison.potencies))).toEqual(poison.potencies);
    expect(JSON.parse(JSON.stringify(poison.deliveries))).toEqual(poison.deliveries);
    expect(createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent))).integrations.get(integration.id)?.craftedPoison).toEqual(poison);
  });
  it('keeps Alchemical unresolved with no silent Alchemy replacement', () => {
    expect(catalog.skills.get('poisons')?.forkSuggestions?.suggestions).toEqual([
      { target: { kind: 'skill', skillId: 'herbalism' } }, { target: { kind: 'skill', skillId: 'apothecary' } },
      { target: { kind: 'unresolved-source-reference', sourceLabel: 'Alchemical', probableTargetSkillId: 'alchemy' } },
    ]);
  });
  it.each([
    null, { ...poison, target: 'maker' }, { ...poison, potencies: [] }, { ...poison, deliveries: [] },
    potency({ kind: 'custom-script' }), potency({ craftingObstacle: 0 }), potency({ craftingObstacle: 2.5 }),
    potency({ effect: { kind: 'obstacle-penalty', delta: 1, scope: 'all-tests' } }),
    potency({ effect: { kind: 'obstacle-penalty', delta: 0, scope: 'source-unspecified' } }),
    potency({ effect: { ...poison.potencies[0].effect, duration: 2 } }),
    potency({ effect: { ...poison.potencies[0].effect, resistance: 'health' } }),
    potency({ effect: { kind: 'fixed-wound', severity: { shade: 'black', exponent: 0 } } }),
    potency({ effect: { kind: 'fixed-wound', severity: { shade: 'black', exponent: 10, result: 'mark' } } }),
    potency({ effect: { kind: 'damage-dice', dice: 10 } }),
    delivery({ kind: 'unknown' }), delivery({ craftingObstacleDelta: -1 }), delivery({ craftingObstacleDelta: 1.5 }),
    delivery({ effect: poison.potencies[0].effect }),
    { ...poison, potencies: [poison.potencies[0], poison.potencies[0]] },
    { ...poison, deliveries: [poison.deliveries[0], poison.deliveries[0]] },
    { ...poison, evaluator: 'exposure' },
  ])('rejects malformed or invented poison metadata %j', value => {
    expect(() => register(value)).toThrow('Invalid crafted poison');
  });
  it('rejects poison metadata on unrelated subsystems', () => {
    expect(() => register(poison, 'resources')).toThrow('Invalid crafted poison subsystem');
  });
});
