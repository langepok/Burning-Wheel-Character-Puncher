import type { CatalogContent, SourceReference } from '../../src/data/catalog';

// Entirely synthetic data for a registration test. This is not Burning Wheel content.
const source: SourceReference = {
  document: 'tests/fixtures/synthetic-content.ts', section: 'Synthetic registration fixture',
  printedPages: [1], pdfPages: [1],
};

export const syntheticContent: CatalogContent = {
  stocks: [{ id: 'test.stock', sourceName: 'Synthetic stock' }],
  settings: [{
    id: 'test.setting', stockId: 'test.stock', sourceName: 'Synthetic setting',
    uiQualifier: 'Synthetic', coverage: 'loaded', kind: 'setting', aliases: ['Test place'],
  }],
  families: [{
    id: 'test.family', stockId: 'test.stock', sourceName: 'Synthetic record', coverage: 'loaded', source,
  }],
  skills: [],
  lifepaths: [{
    variantId: 'test.variant', familyId: 'test.family', stockId: 'test.stock', settingId: 'test.setting',
    sourceName: 'Synthetic record', isBorn: false, years: 0,
    resourceGrant: { kind: 'fixed', amount: 0 }, statGrant: { kind: 'none' },
    leads: { kind: 'any' }, skillPointGrant: { ordinary: 0, general: 0 }, traitPointGrant: 0,
    requirements: [], semanticTags: [], specialRules: [],
    skillListMetadata: { completeness: 'partial', knownEntries: [] }, source,
  }],
};
