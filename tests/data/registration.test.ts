import { describe, expect, it } from 'vitest';
import { createCatalog, getLifepathDisplayLabel, normalizeSettingId, parseLeadDefinition, validateCatalog } from '../../src/data/catalog';
import type { CatalogContent, LifepathDefinition } from '../../src/data/catalog';
import { humanContent } from '../../src/data/human';
import { syntheticContent } from '../fixtures/synthetic-content';

function replaceRow(id: string, patch: Partial<LifepathDefinition>): CatalogContent {
  return { ...humanContent, lifepaths: humanContent.lifepaths.map(row => row.variantId === id ? { ...row, ...patch } : row) };
}

describe('stock-independent catalog registration', () => {
  it('works with only non-Human content, and when registered alongside Human', () => {
    for (const packs of [[syntheticContent], [humanContent, syntheticContent]]) {
      const before = JSON.stringify(packs);
      const catalog = createCatalog(...packs);
      expect(validateCatalog(catalog)).toEqual([]);
      expect(catalog.stocks.has('test.stock')).toBe(true);
      expect(catalog.settings.get('test.setting')?.stockId).toBe('test.stock');
      expect([...catalog.lifepaths.values()].filter(row => row.stockId === 'test.stock').map(row => row.variantId)).toEqual(['test.variant']);
      expect(getLifepathDisplayLabel(catalog.lifepaths.get('test.variant')!, catalog)).toBe('Synthetic record');
      expect(normalizeSettingId('Test place', 'test.stock', catalog)).toBe('test.setting');
      expect(parseLeadDefinition('Test place', 'test.stock', catalog)).toEqual({ kind: 'to', settingIds: ['test.setting'] });
      expect(JSON.stringify(packs)).toBe(before);
    }
  });

  it('qualifies cross-stock collisions through setting metadata without changing identity', () => {
    const content: CatalogContent = {
      ...syntheticContent,
      lifepaths: syntheticContent.lifepaths.map(row => ({ ...row, sourceName: 'Conscript' })),
    };
    const catalog = createCatalog(humanContent, content);
    const record = catalog.lifepaths.get('test.variant')!;
    expect(getLifepathDisplayLabel(record, catalog)).toBe('Synthetic Conscript');
    expect(record.familyId).toBe('test.family');
    expect(record.sourceName).toBe('Conscript');
    expect(catalog.lifepaths.size).toBe(61);
  });

  it('does not infer categories or skill metadata from names, labels or skills', () => {
    const content: CatalogContent = {
      ...syntheticContent,
      skills: [{ id: 'test.sorcery', sourceName: 'Sorcery' }, { id: 'test.riding', sourceName: 'Riding' }],
      lifepaths: syntheticContent.lifepaths.map(row => ({
        ...row, sourceName: 'Guard Priest Acolyte Horse',
        skillListMetadata: { completeness: 'partial', knownEntries: [
          { kind: 'skill', skillId: 'test.sorcery' }, { kind: 'skill', skillId: 'test.riding' },
        ] },
      })),
    };
    expect(createCatalog(content).lifepaths.get('test.variant')?.semanticTags).toEqual([]);
  });

  it('distinguishes zero from one trait point without inventing full trait lists', () => {
    const zero = createCatalog(syntheticContent).lifepaths.get('test.variant')!;
    const one = createCatalog({
      ...syntheticContent, lifepaths: syntheticContent.lifepaths.map(row => ({ ...row, traitPointGrant: 1 })),
    }).lifepaths.get('test.variant')!;
    expect(zero.traitPointGrant).toBe(0);
    expect(one.traitPointGrant).toBe(1);
  });
});

describe('catalog integrity failures', () => {
  it.each(['stocks', 'settings', 'families', 'skills', 'lifepaths'] as const)('rejects duplicate %s ids', key => {
    const invalid = { ...humanContent, [key]: [...humanContent[key], humanContent[key][0]] } as CatalogContent;
    expect(() => createCatalog(invalid)).toThrow(/duplicate/);
  });

  it.each([
    ['stock', { stockId: 'missing' }, /stock reference/],
    ['setting', { settingId: 'missing' }, /setting reference/],
    ['family', { familyId: 'missing' }, /family reference/],
    ['Lead', { leads: { kind: 'to', settingIds: ['missing'] } }, /setting reference/],
    ['exclusion', { leads: { kind: 'anyExcept', excludedSettingIds: ['missing'] } }, /setting reference/],
    ['family prerequisite', { requirements: [{ kind: 'priorFamily', familyId: 'missing' }] }, /family reference/],
    ['setting prerequisite', { requirements: [{ kind: 'priorSetting', settingId: 'missing' }] }, /setting reference/],
    ['skill prerequisite', { requirements: [{ kind: 'priorLifepathSkillListContains', skillId: 'missing' }] }, /skill reference/],
    ['nested unknown node', { requirements: [{ kind: 'allOf', items: [{ kind: 'anyOf', items: [{ kind: 'unrecognized' }] }] }] }, /requirement kind/],
    ['unknown tag', { semanticTags: ['not-a-category'] }, /semantic tag/],
    ['unknown stat', { statGrant: { kind: 'M+P' } }, /stat grant kind/],
    ['unknown Lead', { leads: { kind: 'unknown' } }, /Lead kind/],
    ['unknown resource', { resourceGrant: { kind: 'unknown' } }, /resource grant kind/],
    ['negative points', { skillPointGrant: { ordinary: -1, general: 0 } }, /ordinary skill points/],
    ['fractional trait points', { traitPointGrant: 0.5 }, /trait points/],
    ['invalid position', { requirements: [{ kind: 'position', mode: 'only', positions: [0] }] }, /position/],
    ['empty boolean node', { requirements: [{ kind: 'anyOf', items: [] }] }, /Empty/],
    ['duplicate Leads', { leads: { kind: 'to', settingIds: ['human.peasant', 'human.peasant'] } }, /Duplicate/],
  ] as const)('rejects %s corruption', (_label, patch, message) => {
    expect(() => createCatalog(replaceRow('human.peasant.farmer', patch as unknown as Partial<LifepathDefinition>))).toThrow(message);
  });

  it('rejects a registered setting or family from a different stock', () => {
    for (const patch of [{ settingId: 'test.setting' }, { familyId: 'test.family' }]) {
      expect(() => createCatalog(replaceRow('human.peasant.farmer', patch), syntheticContent)).toThrow(/reference/);
    }
  });

  it('rejects dangling Wife references and false inheritance scope', () => {
    const wife = humanContent.lifepaths.find(row => row.variantId === 'human.peasant.country-wife')!;
    for (const patch of [
      { husbandSettingId: 'missing' }, { skillPointScope: false }, { skillRounding: 'up' },
    ]) {
      const invalid = { ...wife.specialRules[0], ...patch };
      expect(() => createCatalog(replaceRow(wife.variantId, {
        specialRules: [invalid] as unknown as LifepathDefinition['specialRules'],
      }))).toThrow();
    }
    expect(() => createCatalog(replaceRow(wife.variantId, {
      resourceGrant: { kind: 'wifeDerived', base: 5, specialRuleId: 'missing' },
    }))).toThrow(/special-rule reference/);
  });

  it('rejects unknown partial skill metadata references', () => {
    expect(() => createCatalog(replaceRow('human.peasant.hunter', {
      skillListMetadata: { completeness: 'partial', knownEntries: [{ kind: 'oneOf', skillIds: ['javelin', 'missing'] }] },
    }))).toThrow(/skill reference/);
  });

  it('rejects unknown stock references on definitions and ambiguous aliases', () => {
    expect(() => createCatalog({ ...syntheticContent, stocks: [] })).toThrow(/stock reference/);
    expect(() => createCatalog({
      ...humanContent,
      settings: humanContent.settings.map(setting => setting.id === 'human.peasant' ? { ...setting, aliases: ['Village'] } : setting),
    })).toThrow(/Ambiguous/);
  });

  it('does not silently turn reference-only families into invented rows', () => {
    const catalog = createCatalog(humanContent);
    const references = [...catalog.families.values()].filter(family => family.coverage === 'reference-only');
    expect(references).toHaveLength(15);
    expect(references.every(family => ![...catalog.lifepaths.values()].some(row => row.familyId === family.id))).toBe(true);
    expect(() => createCatalog({
      ...humanContent,
      families: humanContent.families.map(family => family.id === 'human.priest' ? { ...family, coverage: 'loaded' } : family),
    })).toThrow(/family coverage/);
  });
});
