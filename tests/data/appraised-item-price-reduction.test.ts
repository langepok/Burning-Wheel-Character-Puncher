import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { AppraisedItemPriceReduction, SkillIntegration } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const skill = catalog.skills.get('shrewd-appraisal');
const expected = { kind: 'appraised-item-price-reduction', target: 'appraised-item',
  basis: { kind: 'identified-flaws' }, magnitude: 'source-unspecified' } as const;
const register = (priceReduction: unknown, subsystem = 'resources') => createSkillCatalog({
  ...generalSkillTranscriptionContent, integrations: generalSkillTranscriptionContent.integrations.map(entry =>
    entry.id === 'shrewd-appraisal-price-reduction' ? { ...entry, priceReduction, subsystem } as unknown as SkillIntegration : entry),
});

describe('Shrewd Appraisal source-shaped economic effect', () => {
  it('stores price reduction of the appraised item based on identified flaws', () => {
    expectTypeOf<typeof expected>().toExtend<AppraisedItemPriceReduction>();
    expect(catalog.integrations.get('shrewd-appraisal-price-reduction')).toMatchObject({
      subsystem: 'resources', skillId: 'shrewd-appraisal', priceReduction: expected,
    });
    expect(skill?.capabilities).toEqual([{ kind: 'subsystem-capability', id: 'appraised-item-price-reduction',
      integrationId: 'shrewd-appraisal-price-reduction' }]);
    expect(skill?.resourceInteractions).toEqual([]);
  });
  it('leaves magnitude unspecified with no Resources, percentage or currency conversion', () => {
    expect(catalog.integrations.get('shrewd-appraisal-price-reduction')?.priceReduction).toEqual(expected);
    expect(catalog.integrations.get('shrewd-appraisal-price-reduction')?.purchaseNegotiation).toBeUndefined();
    expect(catalog.integrations.get('shrewd-appraisal-price-reduction')?.createdItemValueEffects).toBeUndefined();
  });
  it.each([['Common goods', 2], ['Expensive goods', 3], ['Rare goods', 4], ['Unique goods', 5]])(
    'preserves %s at Ob %s as source guidance', (category, obstacle) => {
      expect(skill?.summary).toContain(`${category} Ob ${obstacle}`);
    });
  it('retains Perception, Social, no tools, Dwarves-only and appropriate Wise/Haggling guidance', () => {
    expect(skill?.rootRule).toEqual({ kind: 'single', ability: { kind: 'stat', id: 'perception' } });
    expect(skill?.skillType).toBe('Social');
    expect(skill?.tools).toEqual({ kind: 'none', expendable: false });
    expect(skill?.availabilityRestrictions).toEqual([{ kind: 'stock-only', stockIds: ['dwarf'], scope: 'always' }]);
    expect(skill?.forkSuggestions?.suggestions).toEqual([
      { target: { kind: 'skill-family', familyId: 'wises', relevance: 'appropriate' } },
      { target: { kind: 'skill', skillId: 'haggling' } },
    ]);
    expect(skill?.printedMarkers).toEqual(['§']);
    expect(skill?.rollBehavior).toEqual({ kind: 'open-ended', basis: 'magical' });
  });
  it('keeps ordinary Appraisal separate without an alias, upgrade or inherited effect', () => {
    expect(catalog.skills.get('appraisal')?.id).not.toBe(skill?.id);
    expect(skill?.relations).toEqual([]);
    expect([...catalog.integrations.values()].filter(entry => entry.skillId === 'appraisal' && entry.priceReduction)).toEqual([]);
    expect(catalog.skills.get('appraisal')?.integrationTags).toEqual(['resources']);
  });
  it('round-trips the effect and complete definition through catalog validation', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)));
    expect(restored.integrations.get('shrewd-appraisal-price-reduction')?.priceReduction).toEqual(expected);
    expect(restored.skills.get('shrewd-appraisal')).toEqual(skill);
  });
  it.each([
    null, {}, { ...expected, kind: 'resources-obstacle-modifier' }, { ...expected, target: 'created-item' },
    { ...expected, basis: null }, { ...expected, basis: { kind: 'accurate-valuation' } },
    { ...expected, basis: { kind: 'identified-flaws', generateFlaws: true } },
    { ...expected, magnitude: -1 }, { ...expected, magnitude: 'zero' },
  ])('rejects malformed price reduction %j', value => {
    expect(() => register(value)).toThrow('Invalid appraised-item price reduction');
  });
  it.each(['resourcesObstacleModifier', 'delta', 'percentage', 'currency', 'cashDice', 'itemValueDice',
    'minimumPrice', 'stacking', 'bargainingProcedure', 'generateFlaws', 'evaluator'])(
    'rejects invented numeric/transaction/execution field %s', field => {
      expect(() => register({ ...expected, [field]: 1 })).toThrow('Invalid appraised-item price reduction');
    });
  it.each(['equipment', 'magic', 'fight'])('rejects the economic descriptor in %s', subsystem => {
    expect(() => register(expected, subsystem)).toThrow('Invalid appraised-item price reduction');
  });
});
