import { describe, expect, it } from 'vitest';
import spellFixture from '../fixtures/resources/spells.json';
import purchaseFixture from '../fixtures/resources/purchases.json';
import { humanResources, registerResources, relationshipRules, resourcePriceRules, startingAbilityRules, propertyAccessRule } from '../../src/data/resources';
import type { ResourceCost, ResourceDefinition } from '../../src/data/resources';

const catalog = registerResources(humanResources);
const get = (id: string) => catalog.get(`human.resource.${id}`)!;
const rps = (cost: ResourceCost) => {
  if (cost.kind !== 'fixed') throw new Error('Expected known cost');
  return cost.rps;
};

describe('Human resource source audit', () => {
  it('covers exactly the independently enumerated 67 spells', () => {
    const spells = humanResources.filter(d => d.category === 'spell');
    expect(spells).toHaveLength(67);
    expect(spells.map(d => d.sourceName).sort()).toEqual(spellFixture.map(r => r[0]).sort());
  });
  it.each(spellFixture)('%s retains printed %s rps, page %s', (name, rps, page) => {
    const spell = humanResources.find(d => d.category === 'spell' && d.sourceName === name)!;
    expect(spell.price).toEqual({ kind: 'fixed', rps, basis: 'printed' });
    expect(spell.source.printedPages).toContain(page);
    expect(spell.accounting).toEqual({ resources: false, circles: false });
    expect(spell.constraints).toContainEqual({ kind: 'skill', skillId: 'sorcery' });
  });
  it('registers without silently overwriting duplicates', () => {
    expect(registerResources(humanResources).size).toBe(humanResources.length);
    expect(() => registerResources([...humanResources, humanResources[0]])).toThrow(/Duplicate/);
  });
  it('preserves explicit stable spell IDs and the cross-page Wave source', () => {
    expect(catalog.get('human.spell.wyrd-light')?.sourceName).toBe('Wyrd Light');
    expect(catalog.get('human.spell.wave')?.source).toMatchObject({ printedPages: [221, 222], pdfPages: [223, 224] });
    expect(catalog.has('human.spell.persuasion')).toBe(true); // Separate from the skill ID.
  });
  it('has unique names within each stock/category and no duplicate stock scope', () => {
    const keys = humanResources.flatMap(d => d.stockIds.map(s => `${s}:${d.category}:${d.sourceName}`));
    expect(new Set(keys).size).toBe(keys.length);
    for (const d of humanResources) {
      expect(d.stockIds).toEqual(['human']);
      expect(d.source.pdfPages).toEqual(d.source.printedPages.map(p => p + 2));
    }
  });
  it.each(purchaseFixture.fixed)('%s costs %s on printed page %s', (id, price, page) => {
    expect(get(String(id)).price).toEqual({ kind: 'fixed', rps: price, basis: 'printed' });
    expect(get(String(id)).source.printedPages).toContain(page);
  });
  it('keeps the Arms purchase a priced bundle', () => {
    const arms = get('arms');
    const price = arms.price;
    expect(arms.configuration).toBe('arms');
    expect(price.kind).toBe('quality');
    if (price.kind !== 'quality') return;
    expect([rps(price.costs.poor), rps(price.costs['run-of-the-mill']), rps(price.costs.superior)]).toEqual(purchaseFixture.arms);
    expect(arms.constraints).toContainEqual({ kind: 'review', questionId: 'arms-composition' });
  });
  it.each(purchaseFixture.missiles)('%s quality prices match source arithmetic', (id, poor, normal, superior) => {
    const price = get(String(id)).price;
    expect(price.kind).toBe('quality');
    if (price.kind !== 'quality') return;
    expect([rps(price.costs.poor), rps(price.costs['run-of-the-mill']), rps(price.costs.superior)]).toEqual([poor, normal, superior]);
    expect(price.calculation).toBe('missile-quality');
  });
  it.each(purchaseFixture.armor)('%s suit/part prices preserve fractions and unknowns', (id, poor, normal, superior, half, third) => {
    const price = get(String(id)).price;
    expect(price.kind).toBe('armor');
    if (price.kind !== 'armor') return;
    expect([rps(price.costs.poor.suit), rps(price.costs['run-of-the-mill'].suit), rps(price.costs.superior.suit)]).toEqual([poor, normal, superior]);
    const parts = price.costs['run-of-the-mill'];
    expect([rps(parts.helmet), rps(parts.breastplate), rps(parts.greaves), rps(parts.leggings)]).toEqual([half, half, third, third]);
    expect(price.costs.superior.helmet).toEqual({ kind: 'unknown', questionId: 'superior-armor-parts' });
    expect(price.costs.poor.helmet).toEqual({ kind: 'unknown', questionId: 'poor-armor-parts' });
    expect(parts['half-sleeves']).toEqual({ kind: 'unknown', questionId: 'armor-half-pieces' });
  });
  it('matches the book\'s 41-rp mixed armor example (p. 203)', () => {
    const full = get('full-plated-mail').price, heavy = get('heavy-mail').price, light = get('light-mail').price;
    if (full.kind !== 'armor' || heavy.kind !== 'armor' || light.kind !== 'armor') throw new Error('Missing armor');
    expect(rps(full.costs['run-of-the-mill'].helmet) + rps(heavy.costs['run-of-the-mill'].breastplate)
      + rps(light.costs['run-of-the-mill'].greaves) + rps(light.costs['run-of-the-mill'].leggings)).toBe(41);
  });
  it('documents exact arithmetic rather than a universal quality multiplier', () => {
    expect(resourcePriceRules.missiles).toEqual({ poor: { numerator: 1, denominator: 2 }, poorRounding: 'up', superiorMultiplier: 3 });
    expect(resourcePriceRules.armor).toMatchObject({ superiorFullSuitMultiplier: 4, greavesAndLeggings: { numerator: 1, denominator: 3 }, partRounding: 'up' });
  });
  it.each(['workshop', 'herd', 'rent'])('%s has explicit Resources property inclusion and an unresolved Circles reading', id => {
    expect(get(id).accounting).toEqual({ resources: true, circles: { questionId: 'property-circles-inclusion' } });
    expect(get(id).accountingSource.printedPages).toContain(97);
  });
  it.each(['riding-mount', 'warhorse', 'companion-animal', 'cash', 'arms', 'skill-toolkit'])('%s is excluded despite being an owned asset', id => {
    expect(get(id).accounting).toEqual({ resources: false, circles: false });
  });
  it('retains every distinct property alternative and classifies it explicitly', () => {
    const properties = humanResources.filter(d => d.printedPropertyStar !== undefined);
    expect(properties).toHaveLength(30);
    expect(properties.every(d => d.category === 'property' && d.accounting.resources && d.accounting.circles === true)).toBe(true);
    expect(get('manor').printedPropertyStar).toBe(true);
    expect(get('carrack').printedPropertyStar).toBe(false);
    expect(get('carrack').constraints).toContainEqual({ kind: 'review', questionId: 'property-threshold' });
    expect(propertyAccessRule).toMatchObject({ textThresholdRps: 40, textComparison: 'greater-than', starredTierStartsAtRps: 40 });
    expect(propertyAccessRule.eligibleLifepathNames).toHaveLength(15);
  });
  it('records herd OR eligibility, without treating all mounts as herds', () => {
    expect(get('herd').constraints).toContainEqual({ kind: 'herd-eligibility', skillId: 'animal-husbandry', lifepathNames: ['Master of Horses', 'Merchant', 'Magnate'] });
    expect(get('riding-mount').constraints).toEqual([]);
  });
  it.each(['beak', 'spiked-pommel', 'weighted-pommel'])('%s charges the target weapon, not the bundle', id => {
    const d = get(id);
    expect(d.price.kind).toBe('target-quality');
    if (d.price.kind !== 'target-quality') return;
    expect([rps(d.price.costs.poor), rps(d.price.costs['run-of-the-mill']), rps(d.price.costs.superior)]).toEqual([1, 1, 4]);
    expect(d.additions?.target).toBe('physical-weapon');
    expect(d.source.printedPages).toEqual([202, 555]);
    expect(d.additions?.weaponKinds).toEqual(id === 'beak' ? ['polearm', 'axe', 'spear'] : undefined);
  });
  it.each(purchaseFixture.specialHeads)('%s is charged once per head type, not projectile', id => {
    const d = get(id);
    expect(d.price).toEqual({ kind: 'fixed', rps: 1, basis: 'printed' });
    expect(d.additions?.target).toBe('missile-purchase');
    for (const parent of d.additions!.parentDefinitionIds) expect(catalog.get(parent)?.configuration).toBe('missile');
    expect(d.source.printedPages).toContain(202);
  });
  it('keeps standard heads and kit shields included; standalone shield price remains unknown', () => {
    for (const id of ['hunting-head', 'helmeted-bolt', 'shield-in-kit']) expect(get(id).price.kind).toBe('included');
    expect(get('shield-standalone').price).toEqual({ kind: 'unknown', questionId: 'shield-standalone' });
    expect(get('cash').grants).toEqual({ cashDice: 1 });
  });
  it('records relationship significance, additive discounts and the floor from pp. 93–94', () => {
    expect(get('relationship').price).toEqual({ kind: 'relationship', baseRps: { minor: 5, significant: 10, powerful: 15 },
      modifiers: { 'immediate-family': -2, 'other-family': -1, romantic: -2, forbidden: -1, hateful: -2 }, minimumRps: 1 });
    expect(relationshipRules.exclusiveFamilyChoices).toEqual(['immediate-family', 'other-family']);
    expect(get('relationship').constraints.some(c => c.kind === 'social-limit')).toBe(false);
    expect(get('relationship').accounting).toEqual({ resources: false, circles: true });
  });
  it('keeps the companion exception fixed and requires a complete reciprocal character', () => {
    expect(get('companion').price).toEqual({ kind: 'fixed', rps: 10, basis: 'printed' });
    expect(get('companion').constraints).toContainEqual({ kind: 'companion-character', fewerLifepaths: 2, lowerExponentCap: true, reciprocalRelationshipRps: 10, ownGear: true });
  });
  it.each([['affiliation', [10, 25, 50]], ['reputation', [7, 25, 45]]] as const)('%s uses printed tiers and a per-category limit of three', (id, expected) => {
    const d = get(id);
    expect(d.price.kind).toBe('rating');
    if (d.price.kind !== 'rating') return;
    expect(d.price.tiers.map(t => t.rps)).toEqual(expected);
    expect(d.price.tiers.map(t => t.dice)).toEqual([1, 2, 3]);
    expect(d.constraints).toEqual([{ kind: 'social-limit', maximumPurchased: 3, distinctOrganizations: true }]);
    expect(d.accounting).toEqual({ resources: true, circles: false });
  });
  it('groups a gang without double-counting child spending', () => {
    expect(get('gang-or-crew').price).toEqual({ kind: 'sum-children', childDefinitionIds: ['human.resource.relationship', 'human.resource.affiliation', 'human.resource.reputation'], overheadRps: 0 });
    expect(get('gang-or-crew').accounting).toEqual({ resources: false, circles: false });
  });
  it('records p. 97 and the D-035 distinction between rounding and budget', () => {
    expect(startingAbilityRules).toMatchObject({ resourcesDivisor: 15, resourcesRounding: 'down',
      circlesWillDivisor: 2, circlesMinimum: 1, circlesShade: 'will', circlesQualifyingSpendThresholdRps: 50, circlesBonus: 1,
      grayResourcesExponentCost: 5, grayResourcesRequiresGmPermission: true,
      rawSoClose: { maximumShortfallRps: 2, allRpsSpent: true }, manualRoundUp: { default: false, rounding: 'up', budgetDelta: 0, decision: 'D-035' } });
  });
});

describe('Resource registration boundaries', () => {
  const replace = (changes: Partial<ResourceDefinition>) => humanResources.map(d => d.id === 'human.resource.arms' ? { ...d, ...changes } : d);
  it.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid fixed price %s', value => {
    expect(() => registerResources(replace({ price: { kind: 'fixed', rps: value, basis: 'printed' } }))).toThrow(/price/);
  });
  it('rejects missing source evidence', () => {
    expect(() => registerResources(replace({ source: { ...get('arms').source, printedPages: [] } }))).toThrow(/source/);
  });
  it('rejects dangling parents and untracked questions', () => {
    expect(() => registerResources(replace({ price: { kind: 'included', parentDefinitionIds: ['missing'] } }))).toThrow(/Dangling/);
    expect(() => registerResources(replace({ price: { kind: 'unknown', questionId: 'invented' } }))).toThrow(/question/);
    const quality = get('arms').price;
    if (quality.kind !== 'quality') throw new Error('Missing quality price');
    expect(() => registerResources(replace({ price: { ...quality, costs: { ...quality.costs, superior: { kind: 'included', parentDefinitionIds: ['missing'] } } } }))).toThrow(/Dangling/);
  });
  it('rejects cyclic composite/inclusion dependencies', () => {
    expect(() => registerResources(replace({ price: { kind: 'included', parentDefinitionIds: ['human.resource.arms'] } }))).toThrow(/Cyclic/);
  });
  it('rejects composite double accounting', () => {
    expect(() => registerResources(replace({ price: { kind: 'sum-children', childDefinitionIds: ['human.resource.cash'], overheadRps: 0 }, accounting: { resources: true, circles: false } }))).toThrow(/double accounting/);
  });
  it('distinguishes a true zero, unknown and unavailable cost without inventing a price', () => {
    const prices: ResourceCost[] = [{ kind: 'fixed', rps: 0, basis: 'derived' },
      { kind: 'unknown', questionId: 'shield-standalone' }, { kind: 'unavailable', reason: 'No purchase option for this content pack' }];
    for (const price of prices) expect(registerResources(replace({ price })).get('human.resource.arms')?.price).toEqual(price);
  });
  it('registers another stock without Human-specific engine assumptions', () => {
    const other: ResourceDefinition = { ...get('cash'), id: 'example.resource.coin', stockIds: ['example'], sourceName: 'Example coin' };
    expect(registerResources([other]).get(other.id)).toBe(other);
  });
});
