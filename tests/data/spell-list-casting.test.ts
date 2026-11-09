import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { SkillCatalogContent, SpellListCasting } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const integration = catalog.integrations.get('rituals-of-night-casting')!;
const casting = integration.spellListCasting!;
const register = (value: unknown, subsystem = 'magic') => createSkillCatalog({ ...generalSkillTranscriptionContent,
  integrations: generalSkillTranscriptionContent.integrations.map(record => record.id === integration.id
    ? { ...record, subsystem, spellListCasting: value } : record),
} as SkillCatalogContent);

describe('Rituals of Night external spell list and separate acquisition', () => {
  it('separates governing skill from external spell list and independently acquired spells', () => {
    expectTypeOf<typeof casting>().toExtend<SpellListCasting>();
    expect(integration.skillId).toBe('rituals-of-night');
    expect(integration.subsystem).toBe('magic');
    expect(casting).toEqual({ kind: 'spell-list-casting', spellListRef: {
      kind: 'external-spell-list', subsystem: 'magic', id: 'rituals-of-night', sourceName: 'Rituals of Night' },
      obstacleSource: 'referenced-spell-list', acquisition: { kind: 'separate-purchase-or-learning' } });
    expect(casting).not.toHaveProperty('spells');
    expect(casting).not.toHaveProperty('grantedSpells');
    expect(casting.acquisition).not.toHaveProperty('cost');
    expect(casting.acquisition).not.toHaveProperty('procedure');
    expect(catalog.skills.get('rituals-of-night')?.skillType).toBe('Sorcerous');
    expect(catalog.skills.get('rituals-of-night')?.rootRule).toEqual({ kind: 'single', ability: { kind: 'stat', id: 'perception' } });
    expect(catalog.skills.get('rituals-of-night')?.availabilityRestrictions).toEqual([{ kind: 'stock-only', stockIds: ['orc'], scope: 'always' }]);
  });
  it('keeps Rituals of Blood source-shaped with no inferred acquisition metadata', () => {
    const blood = catalog.integrations.get('rituals-of-blood-external');
    expect(blood?.spellListCasting).toBeUndefined();
    expect(blood?.summary).toContain('Rituals of Night and Blood');
    expect(catalog.skills.get('rituals-of-blood')?.useRequirements).toEqual([]);
  });
  it('round-trips external references without loading spells or resolving them as skills', () => {
    expect(createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent))).integrations.get(integration.id)?.spellListCasting).toEqual(casting);
    const external = { ...casting, spellListRef: { ...casting.spellListRef, id: 'synthetic-unloaded-spell-list', sourceName: 'Synthetic list' } };
    expect(register(external).integrations.get(integration.id)?.spellListCasting).toEqual(external);
    expect(catalog.skills.has('synthetic-unloaded-spell-list')).toBe(false);
  });
  it.each([
    null, { ...casting, kind: 'grant-spells' }, { ...casting, spellListRef: 'rituals-of-night' },
    { ...casting, spellListRef: { ...casting.spellListRef, kind: 'skill' } },
    { ...casting, spellListRef: { ...casting.spellListRef, subsystem: 'fight' } },
    { ...casting, spellListRef: { ...casting.spellListRef, id: '' } },
    { ...casting, spellListRef: { ...casting.spellListRef, sourceName: ' ' } },
    { ...casting, obstacleSource: 'governing-skill' }, { ...casting, acquisition: { kind: 'all-spells-granted' } },
    { ...casting, acquisition: { kind: 'separate-purchase-or-learning', cost: 1 } },
    { ...casting, acquisition: { kind: 'separate-purchase-or-learning', procedure: 'practice' } },
    { ...casting, spells: [] }, { ...casting, grantedSpells: 'all' },
    { ...casting, spellListRef: { ...casting.spellListRef, obstacles: [1] } },
  ])('rejects malformed references and invented ownership/acquisition %j', value => {
    expect(() => register(value)).toThrow('Invalid spell-list casting');
  });
  it('keeps the descriptor within magic integration', () => {
    expect(() => register(casting, 'equipment')).toThrow('Invalid spell-list casting');
  });
});
