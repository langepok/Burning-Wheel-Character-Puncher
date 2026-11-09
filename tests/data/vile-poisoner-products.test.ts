import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { CraftedPoison, CraftedPoisonProduct, PoisonTestScope, SkillCatalogContent } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const contact = { kind: 'crafted-poison', variant: 'stinging-nettling-contact', craftingObstacle: 2,
  exposure: { kind: 'skin-contact' }, outcomes: [
    { kind: 'condition', recipient: 'victim', condition: 'boils' },
    { kind: 'test-obstacle-penalty', recipient: 'victim', amount: 2,
      scopes: ['physical-tests', 'martial-tests', 'social-tests'], duration: { kind: 'scene', count: 1 } },
  ] } as const;
const ingested = { kind: 'crafted-poison', variant: 'debilitating-ingested', craftingObstacle: 4,
  exposure: { kind: 'ingested' }, resistance: { actor: 'victim', ability: { kind: 'stat', id: 'forte' }, obstacle: 4 },
  onResistanceFailure: { magnitude: { kind: 'margin-of-failure', source: 'resistance-test' }, effects: [
    { kind: 'reduce-health', recipient: 'victim', duration: 'permanent' },
    { kind: 'reduce-health-maximum', recipient: 'victim', duration: 'permanent' },
  ] } } as const;
const weapon = { kind: 'crafted-poison', variant: 'deadly-weapon', craftingObstacle: 5,
  application: { kind: 'weapon-coating', allowedTargets: ['blade', 'arrowhead'] },
  exposure: { kind: 'injected-by-hit', requiredHitResult: 'mark' },
  delayedOutcome: { delay: { kind: 'six-plus-target-forte', unit: 'exchange' },
    outcome: { kind: 'wound', recipient: 'victim', severity: { shade: 'black', exponent: 9 }, quantity: 1, relation: 'additional' } } } as const;
const expected = { target: 'created-poison', products: [contact, ingested, weapon] } as const;
const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const id = 'vile-poisoner-products';
const register = (craftedPoison: unknown) => createSkillCatalog({ ...generalSkillTranscriptionContent,
  integrations: generalSkillTranscriptionContent.integrations.map(record => record.id === id ? { ...record, craftedPoison } : record),
} as SkillCatalogContent);
const product = (value: unknown) => ({ target: 'created-poison', products: [value] });

describe('Vile Poisoner distinct crafted products', () => {
  it('preserves exactly three source products, separate from independent potency/delivery Poisons', () => {
    expectTypeOf<typeof expected>().toExtend<CraftedPoison>();
    expectTypeOf<typeof contact>().toExtend<CraftedPoisonProduct>();
    expectTypeOf<typeof ingested>().toExtend<CraftedPoisonProduct>();
    expectTypeOf<typeof weapon>().toExtend<CraftedPoisonProduct>();
    expect(catalog.integrations.get(id)?.craftedPoison).toEqual(expected);
    expect(catalog.integrations.get('poisons-crafted-product')?.craftedPoison).not.toHaveProperty('products');
    expect(catalog.skills.has('stinging-nettling-contact')).toBe(false);
    expect(catalog.skills.has('debilitating-ingested')).toBe(false);
    expect(catalog.skills.has('deadly-weapon')).toBe(false);
  });
  it('contact produces boils and a one-scene penalty to source scopes without resistance or taxonomy inference', () => {
    expect(catalog.integrations.get(id)?.craftedPoison?.products?.[0]).toEqual(contact);
    expectTypeOf<(typeof contact.outcomes)[1]['scopes'][number]>().toExtend<PoisonTestScope>();
    expect(contact.outcomes[1].scopes).toEqual(['physical-tests', 'martial-tests', 'social-tests']);
    expect(contact).not.toHaveProperty('resistance');
  });
  it('ingested failed Forte resistance shares one magnitude across two permanent reductions', () => {
    expect(catalog.integrations.get(id)?.craftedPoison?.products?.[1]).toEqual(ingested);
    expect(ingested.onResistanceFailure.magnitude).toEqual({ kind: 'margin-of-failure', source: 'resistance-test' });
    expect(ingested.onResistanceFailure.effects.map(effect => effect.duration)).toEqual(['permanent', 'permanent']);
  });
  it('weapon poison preserves literal Mark injection, additional B9 wound and named six-plus-Forte delay', () => {
    expect(catalog.integrations.get(id)?.craftedPoison?.products?.[2]).toEqual(weapon);
    expect(weapon.delayedOutcome.delay).toEqual({ kind: 'six-plus-target-forte', unit: 'exchange' });
  });
  it('preserves source skill metadata without an exposure test profile on the crafting skill', () => {
    const skill = catalog.skills.get('vile-poisoner');
    expect(skill).toMatchObject({ coverage: 'complete', rootRule: { kind: 'combined', abilities: [{ kind: 'stat', id: 'perception' }, { kind: 'stat', id: 'agility' }] },
      skillType: 'Medicinal', tools: { kind: 'generic', expendable: true }, printedMarkers: ['§'],
      availabilityRestrictions: [{ kind: 'stock-only', stockIds: ['orc'], scope: 'always' }], integrationTags: ['equipment', 'poisons'] });
    expect(skill?.forkSuggestions?.suggestions).toEqual([{ target: { kind: 'skill', skillId: 'herbalism' } }]);
    expect(skill?.testProfile).toBeUndefined();
  });
  it('round-trips products without performing exposure, resistance, Health changes or scheduling', () => {
    expect(createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent))).integrations.get(id)?.craftedPoison).toEqual(expected);
  });
  it.each([
    { ...expected, products: [] }, { ...expected, products: [contact, contact] },
    { ...expected, potencies: [] }, { ...expected, deliveries: [] },
    { ...expected, dosesPerBatch: 1 }, { ...expected, stacking: 'cumulative' },
    product({ ...contact, craftingObstacle: 0 }), product({ ...contact, craftingObstacle: 0.5 }),
    product({ ...contact, exposure: { kind: 'any-contact' } }),
    product({ ...contact, resistance: { ability: { kind: 'stat', id: 'forte' }, obstacle: 4 } }),
    product({ ...contact, outcomes: [contact.outcomes[0], { ...contact.outcomes[1], scopes: ['all-tests'] }] }),
    product({ ...contact, outcomes: [contact.outcomes[0], { ...contact.outcomes[1], scopes: ['Physical', 'Martial', 'Social'] }] }),
    product({ ...contact, outcomes: [contact.outcomes[0], { ...contact.outcomes[1], duration: { kind: 'scene', count: 0 } }] }),
    product({ ...ingested, resistance: { ...ingested.resistance, ability: { kind: 'attribute', id: 'health' } } }),
    product({ ...ingested, onResistanceFailure: { ...ingested.onResistanceFailure, magnitude: { kind: 'fixed', value: 1 } } }),
    product({ ...ingested, onResistanceFailure: { ...ingested.onResistanceFailure, magnitude: { kind: 'margin-of-failure', source: 'crafting-test' } } }),
    product({ ...ingested, onResistanceFailure: { ...ingested.onResistanceFailure, effects: [ingested.onResistanceFailure.effects[0]] } }),
    product({ ...ingested, onResistanceFailure: { ...ingested.onResistanceFailure, effects: [
      { ...ingested.onResistanceFailure.effects[0], duration: 'scene' }, ingested.onResistanceFailure.effects[1],
    ] } }),
    product({ ...ingested, healthFloor: 0 }), product({ ...ingested, deathAtZero: true }), product({ ...ingested, recovery: 'rest' }),
    product({ ...weapon, application: { kind: 'weapon-coating', allowedTargets: ['any-weapon'] } }),
    product({ ...weapon, exposure: { kind: 'injected-by-hit', requiredHitResult: 'mark-or-better' } }),
    product({ ...weapon, exposure: { kind: 'any-successful-hit' } }),
    product({ ...weapon, exposure: { kind: 'injected-by-hit', requiredHitResult: 'superb' } }),
    product({ ...weapon, delayedOutcome: { ...weapon.delayedOutcome, delay: { kind: 'formula', expression: '6 + forte' } } }),
    product({ ...weapon, delayedOutcome: { ...weapon.delayedOutcome, delay: { kind: 'six-plus-target-forte', unit: 'scene' } } }),
    product({ ...weapon, delayedOutcome: { ...weapon.delayedOutcome, outcome: { ...weapon.delayedOutcome.outcome, relation: 'replaces-hit' } } }),
    product({ ...weapon, delayedOutcome: { ...weapon.delayedOutcome, outcome: { ...weapon.delayedOutcome.outcome, quantity: 0 } } }),
    product({ ...weapon, delayedOutcome: { ...weapon.delayedOutcome, outcome: { ...weapon.delayedOutcome.outcome, severity: { shade: 'mark', exponent: 9 } } } }),
    product({ ...weapon, delayedOutcome: { ...weapon.delayedOutcome, outcome: { ...weapon.delayedOutcome.outcome, severity: { shade: 'black', exponent: 0 } } } }),
    product({ ...weapon, coatingDuration: 1 }), product({ ...weapon, missedAttackExpendsDose: true }),
    product({ ...weapon, armorPreventsInjection: true }), product({ ...weapon, variant: 'unreviewed' }),
    product(null), product({}),
  ])('rejects malformed products or invented execution semantics %j', value => {
    expect(() => register(value)).toThrow('Invalid crafted poison');
  });
});
