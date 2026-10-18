import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { CreatedItemValueModifier, SkillCatalogContent } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const context = { kind: 'circumstance', circumstanceId: 'working-with-mithril' } as const;
const integration = catalog.integrations.get('white-metal-artifice-mithril')!;
const modifier = integration?.createdItemValueEffects?.[0].modifier;
const register = (value: unknown) => createSkillCatalog({ ...generalSkillTranscriptionContent,
  integrations: generalSkillTranscriptionContent.integrations.map(record => record.id === 'white-metal-artifice-mithril'
    ? { ...record, createdItemValueEffects: [{ kind: 'automatic', modifier: value }] } : record),
} as SkillCatalogContent);

describe('White Metal Artifice independent effects and unresolved mithril unit', () => {
  it('keeps ordinary obstacle increase and optional tradeoff separate', () => {
    expect(catalog.integrations.get('white-metal-artifice-value')?.createdItemValueEffects).toEqual([
      { kind: 'automatic', modifier: { target: 'created-item', measure: 'resources-obstacle', delta: 1 } },
      { kind: 'optional-tradeoff', choiceTiming: 'before-roll', modifier: { target: 'created-item', measure: 'resources-obstacle', delta: 1 },
        cost: { kind: 'crafting-obstacle-modifier', delta: 2 } },
    ]);
    expect(catalog.integrations.get('white-metal-artifice-value')?.context).toBeUndefined();
  });
  it('stores mithril value +2 with unknown unit and exact source provenance, never obstacle or asserted dice', () => {
    expect(integration.context).toEqual(context);
    expect(modifier).toMatchObject({ target: 'created-item', measure: 'resources-value', delta: 2, unit: 'source-unspecified' });
    expect(modifier).toHaveProperty('source', integration.source);
    expect(integration.source[0]).toMatchObject({ pages: { printed: [308], pdf: [310] } });
    type Unspecified = Extract<CreatedItemValueModifier, { measure: 'resources-value' }>;
    type Dice = Extract<CreatedItemValueModifier, { measure: 'resources-value-dice' }>;
    expectTypeOf<Unspecified>().not.toExtend<Dice>();
  });
  it('keeps Gemcraft explicitly +1D without adding an unknown unit or changing its data', () => {
    expect(catalog.integrations.get('gemcraft-value')?.createdItemValueEffects).toEqual([
      { kind: 'automatic', modifier: { target: 'created-item', measure: 'resources-value-dice', delta: 1 } },
    ]);
  });
  it('applies +1 owning-test Ob under mithril context, independently of created-item value', () => {
    expect(catalog.skills.get('white-metal-artifice')?.testProfile).toEqual({ kind: 'contextual', modifiers: [
      { effect: { kind: 'obstacle-modifier', delta: 1 }, when: context },
    ] });
    expect(catalog.skills.get('white-metal-artifice')?.resourceInteractions).toEqual([]);
  });
  it('keeps the enchanter vessel in a separate magic integration', () => {
    expect(catalog.integrations.get('white-metal-artifice-matrix')).toMatchObject({ subsystem: 'magic',
      createdItemReference: { kind: 'enchanting-matrix', target: 'created-item' } });
    expect(integration.createdItemReference).toBeUndefined();
  });
  it('preserves root/type/tools/restriction/FoRK and source guidance', () => {
    const skill = catalog.skills.get('white-metal-artifice');
    expect(skill).toMatchObject({ coverage: 'complete', rootRule: { kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'agility' }] },
      skillType: 'Craftsman', tools: { kind: 'workshop' }, printedMarkers: ['§'], availabilityRestrictions: [{ kind: 'stock-only', stockIds: ['dwarf'], scope: 'always' }] });
    expect(skill?.forkSuggestions?.suggestions).toEqual([{ target: { kind: 'skill', skillId: 'gem-artifice' } }]);
    for (const row of ['hairpins Ob 1', 'spoons/cups Ob 2', 'jewelry Ob 3', 'armor/weapon embellishment Ob 3', 'tea service Ob 4', 'scepters/rods Ob 5', 'crowns Ob 6']) expect(skill?.summary).toContain(row);
  });
  it('round-trips conditional value and unknown unit without resolving economic effects', () => {
    expect(createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent))).integrations.get(integration.id)).toEqual(integration);
  });
  it.each([
    { unit: 'dice' }, { unit: 'obstacle' }, { unit: undefined }, { source: [] }, { source: [{}] },
    { source: [{ kind: 'unknown' }] }, { source: [{ kind: 'audit-packet', url: '', section: 'mithril' }] },
    { source: [{ kind: 'audit-packet', url: 'https://example.test', section: 'mithril', pages: { printed: [], pdf: [] } }] },
    { measure: 'resources-value-dice' }, { measure: 'resources-obstacle' }, { delta: 0 }, { delta: 0.5 },
    { computedPrice: 2 },
  ])('rejects malformed units/provenance and silent conversions %j', fields => {
    expect(() => register({ ...modifier, ...fields })).toThrow('Invalid created-item value');
  });
});
