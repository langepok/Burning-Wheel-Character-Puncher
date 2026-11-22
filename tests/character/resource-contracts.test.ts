import { describe, expect, expectTypeOf, it } from 'vitest';
import { humanResources, registerResources, resourceQuestions } from '../../src/data/resources';
import type { ResourceDefinition } from '../../src/data/resources';
import type {
  ResourceConfiguration, ResourceFundingAllocation, ResourceFundingAccess,
  ResourceProjection, ResourcePurchase,
} from '../../src/character/resource-contracts';

// These are compile-time boundary examples and catalog checks, not an engine.
// `npm run typecheck` checks expectTypeOf assertions; Vitest checks catalog data.
type Armor = Extract<ResourceConfiguration, { kind: 'armor' }>;
type Affiliation = Extract<ResourceConfiguration, { kind: 'affiliation' }>;
type Reputation = Extract<ResourceConfiguration, { kind: 'reputation' }>;
type Relationship = Extract<ResourceConfiguration, { kind: 'relationship' }>;
type Companion = Extract<ResourceConfiguration, { kind: 'companion' }>;
const get = (id: string) => humanResources.find(d => d.id === `human.resource.${id}`)!;

describe('Optional included equipment and contextual property benefits', () => {
  it.each(['gambeson', 'reinforced-leather', 'light-mail', 'heavy-mail', 'plated-mail', 'full-plated-mail'])('%s offers a shield without granting one', id => {
    const armor = get(id);
    expect(armor.includedOptions).toEqual(['human.resource.shield-in-kit']);
    expect(armor.grants).toBeUndefined();
    expectTypeOf<'shieldIncluded' extends keyof NonNullable<ResourceDefinition['grants']> ? true : false>().toEqualTypeOf<false>();
  });
  it('represents opting out and explicit selection without a full-suit-only gate', () => {
    const helmet: Armor = { kind: 'armor', quality: 'run-of-the-mill', piece: 'helmet', substitutions: [], selectedIncludedDefinitionIds: [] };
    const suit: Armor = { ...helmet, piece: 'suit' };
    const selected: Armor = { ...suit, selectedIncludedDefinitionIds: ['human.resource.shield-in-kit'] };
    // Representability is not a new RAW ruling on every conceivable armor kit.
    const reviewedPartialKit: Armor = { ...selected, piece: 'breastplate' };
    expect(helmet.selectedIncludedDefinitionIds).toEqual([]);
    expect(suit.selectedIncludedDefinitionIds).toEqual([]);
    expect(selected.selectedIncludedDefinitionIds).toEqual(reviewedPartialKit.selectedIncludedDefinitionIds);
    expect(get('shield-in-kit').price.kind).toBe('included');
    expect(get('shield-standalone').price.kind).toBe('unknown');
  });
  it('rejects a missing or incorrectly linked included option', () => {
    const replace = (includedOptions: string[]) => humanResources.map(d => d.id === get('gambeson').id ? { ...d, includedOptions } : d);
    expect(() => registerResources(replace(['missing']))).toThrow(/Dangling/);
    expect(() => registerResources(replace(['human.resource.hunting-head']))).toThrow(/included option/);
    expect(() => registerResources(replace(['human.resource.cash']))).toThrow(/included option/);
  });
  it.each(['shield', 'helmet'])('allows an independently priced %s in a synthetic content pack', name => {
    // No Dwarf/Orc price is asserted or added to the Human catalog.
    const definition: ResourceDefinition = {
      ...get('shoes'), id: `test.resource.${name}`, stockIds: ['test'], sourceName: `Test ${name}`,
      source: { document: 'Synthetic fixture, not RAW', section: 'Paid equipment', printedPages: [1], pdfPages: [1] },
      price: { kind: 'fixed', rps: 9, basis: 'printed' },
    };
    const registered = registerResources([definition]).get(definition.id)!;
    expect(registered.price).toEqual({ kind: 'fixed', rps: 9, basis: 'printed' });
    expect(registered.includedOptions).toBeUndefined();
    expect(registered.grants).toBeUndefined();
  });
  it('describes appropriate staff without creating or granting NPCs', () => {
    const properties = humanResources.filter(d => d.printedPropertyStar !== undefined);
    expect(properties).toHaveLength(30);
    for (const property of properties) {
      expect(property.propertyBenefits).toEqual({ staff: 'as-appropriate' });
      expect(property.grants).toBeUndefined();
    }
    expectTypeOf<'staffIncluded' extends keyof NonNullable<ResourceDefinition['grants']> ? true : false>().toEqualTypeOf<false>();
    expectTypeOf<keyof NonNullable<ResourceDefinition['propertyBenefits']>>().toEqualTypeOf<'staff'>();
  });
  it('retains the audited catalog and unresolved-question scope', () => {
    expect(registerResources(humanResources).size).toBe(144);
    expect(humanResources.filter(d => d.category === 'spell')).toHaveLength(67);
    expect(resourceQuestions).toHaveLength(14);
  });
});

describe('Social purchase descriptions and mechanical data', () => {
  it('accepts a reputation without an organization or polarity', () => {
    const reputation: Reputation = {
      kind: 'reputation', name: 'Водится со следопытами', description: 'Жители толкуют это по-разному.',
      audience: 'Жители Бри', scope: 'Бри и окрестности', dice: 1,
    };
    expect(reputation).not.toHaveProperty('organizationId');
    expect(reputation).not.toHaveProperty('polarity');
    expectTypeOf<Reputation['organizationId']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<'polarity' extends keyof Reputation ? true : false>().toEqualTypeOf<false>();
    expectTypeOf<Reputation['dice']>().toEqualTypeOf<1 | 2 | 3>();
  });
  it('accepts an affiliation described without a registry ID, with an optional link', () => {
    const affiliation: Affiliation = { kind: 'affiliation', name: 'Друзья следопытов', description: 'Помогаем местному отряду.', scope: 'Местная группа', dice: 1 };
    const linked: Affiliation = { ...affiliation, organizationId: 'rangers' };
    expect(affiliation).not.toHaveProperty('organizationId');
    expect(linked.organizationId).toBe('rangers');
  });
  it('provides names/descriptions for ordinary relationships and accompanying NPCs', () => {
    const relationship: Relationship = {
      kind: 'relationship', name: 'Ненавистный кузен', npcName: 'Durion', description: 'Старый семейный конфликт.',
      significance: 'minor', family: 'other', romantic: false, forbidden: false, hateful: true, additionalConditions: '',
    };
    const companion: Companion = { kind: 'companion', name: 'Мой оруженосец', npcName: 'Robin', description: 'Друг в путешествии.', linkedCharacterId: 'npc-robin' };
    expect(relationship.name).not.toBe(relationship.npcName);
    expect(companion.linkedCharacterId).toBe('npc-robin');
    expectTypeOf<Relationship['name']>().toEqualTypeOf<string>();
    expectTypeOf<Companion['description']>().toEqualTypeOf<string>();
  });
  it('keeps reputation audience optional organization linkage in projections too', () => {
    type Bonus = ResourceProjection['socialBonuses'][number];
    const bonus: Bonus = { kind: 'reputation', name: 'Водится со следопытами', description: 'Контекст определяет реакцию.', audience: 'Жители Бри', scope: 'Бри', dice: 1, purchaseId: 'purchase-1' };
    expect(bonus).not.toHaveProperty('organizationId');
    expectTypeOf<Extract<Bonus, {kind: 'reputation'}>['organizationId']>().toEqualTypeOf<string | undefined>();
  });
  it('requires structured mechanics independent of free text', () => {
    expectTypeOf<Affiliation['dice']>().toEqualTypeOf<1 | 2 | 3>();
    expectTypeOf<Relationship['hateful']>().toEqualTypeOf<boolean>();
    expectTypeOf<ResourcePurchase['originalPaidRps']>().toEqualTypeOf<number>();
    // Negative compilation checks must fail even though the text mentions a rating/modifier.
    // @ts-expect-error A free description is not a dice rating.
    const noRating: Reputation = { kind: 'reputation', name: 'Local', description: '1D reputation', audience: 'Locals', scope: 'Town' };
    // @ts-expect-error Family and hostility still require structured values.
    const noModifiers: Relationship = { kind: 'relationship', name: 'Enemy', npcName: 'X', description: 'Hateful cousin', significance: 'minor', additionalConditions: '' };
    expect(noRating.description).toBe('1D reputation');
    expect(noModifiers.description).toBe('Hateful cousin');
  });
});

describe('Historical funding versus current access', () => {
  it('keeps access and active traits out of stored funding allocations', () => {
    expectTypeOf<ResourcePurchase['provenance']['funding'][number]>().toEqualTypeOf<ResourceFundingAllocation>();
    expectTypeOf<keyof ResourceFundingAllocation>().toEqualTypeOf<'poolId' | 'paidRps' | 'origin'>();
    const funding: ResourceFundingAllocation = { poolId: 'city-1', paidRps: 5,
      origin: { kind: 'lifepath', variantId: 'human.city-dweller.city-born', occurrence: 1 } };
    expect(funding).not.toHaveProperty('access');
  });
  it('represents reversible access and other conditions only in the projection', () => {
    const restricted: ResourceFundingAccess = { poolId: 'city-1', access: 'restricted', reasons: [{ code: 'outlaw', traitId: 'outlaw', message: 'Active Outlaw condition' }] };
    const available: ResourceFundingAccess = { poolId: 'city-1', access: 'available', reasons: [] };
    const unresolved: ResourceFundingAccess = { poolId: 'city-1', access: 'unresolved', reasons: [{ code: 'context-needed', message: 'Review another active condition' }] };
    const projections: ResourceProjection['fundingAccess'][] = [[available], [restricted], [available], [unresolved]];
    expect(projections.map(p => p[0].poolId)).toEqual(['city-1', 'city-1', 'city-1', 'city-1']);
    // Contract representability only; trait/undo evaluation is specified in the A2 vectors.
    expectTypeOf<ResourceProjection['fundingAccess'][number]>().toEqualTypeOf<ResourceFundingAccess>();
  });
});
