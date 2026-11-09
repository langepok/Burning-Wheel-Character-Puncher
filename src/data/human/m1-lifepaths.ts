import type { LifepathDefinition, SourceReference } from '../catalog';

export const cityPilotSource: SourceReference = {
  document: 'docs/audits/CB-006_CITY_DWELLER_CATALOG.md',
  section: 'Verified rows',
  printedPages: [170],
  pdfPages: [172],
};

export const soldierPilotSource: SourceReference = {
  document: 'docs/audits/CB-006_PROFESSIONAL_SOLDIER_CATALOG.md',
  section: 'Verified rows',
  printedPages: [187],
  pdfPages: [189],
};

const common = {
  stockId: 'human',
  requirements: [],
  semanticTags: [],
  skillListMetadata: { completeness: 'partial', knownEntries: [] },
  specialRules: [],
  traitPointGrant: 1,
} as const;

export const m1Lifepaths: readonly LifepathDefinition[] = [
  {
    ...common,
    variantId: 'human.city-dweller.city-born',
    familyId: 'human.city-born',
    settingId: 'human.city-dweller',
    sourceName: 'City Born',
    isBorn: true,
    years: 12,
    resourceGrant: { kind: 'fixed', amount: 10 },
    statGrant: { kind: 'none' },
    skillPointGrant: { ordinary: 0, general: 4 },
    leads: { kind: 'to', settingIds: ['human.servitude-captive', 'human.noble-court', 'human.noble', 'human.outcast'] },
    source: cityPilotSource,
  },
  {
    ...common,
    variantId: 'human.city-dweller.runner',
    familyId: 'human.runner',
    settingId: 'human.city-dweller',
    sourceName: 'Runner',
    isBorn: false,
    years: 3,
    resourceGrant: { kind: 'fixed', amount: 7 },
    statGrant: { kind: 'physical', amount: 1 },
    skillPointGrant: { ordinary: 3, general: 0 },
    leads: { kind: 'to', settingIds: ['human.villager', 'human.professional-soldier'] },
    source: cityPilotSource,
  },
  {
    ...common,
    variantId: 'human.professional-soldier.foot-soldier',
    familyId: 'human.foot-soldier',
    settingId: 'human.professional-soldier',
    sourceName: 'Foot Soldier',
    isBorn: false,
    years: 3,
    resourceGrant: { kind: 'fixed', amount: 6 },
    statGrant: { kind: 'physical', amount: 1 },
    skillPointGrant: { ordinary: 6, general: 0 },
    leads: { kind: 'to', settingIds: ['human.outcast', 'human.villager', 'human.servitude-captive'] },
    source: soldierPilotSource,
  },
];
