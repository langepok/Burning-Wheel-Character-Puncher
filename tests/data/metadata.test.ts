import { describe, expect, it } from 'vitest';
import { createCatalog, normalizeSettingId, parseLeadDefinition, semanticTags } from '../../src/data/catalog';
import { humanContent } from '../../src/data/human';
import type { DerivedSkillPointScope, SemanticTag, StatGrant } from '../../src/data/catalog';

const catalog = createCatalog(humanContent);
const row = (id: string) => catalog.lifepaths.get(id)!;

describe('curated CB-013 membership', () => {
  const members: Record<SemanticTag, readonly string[]> = {
    acolyte: ['human.villager.acolyte', 'human.villager.failed-acolyte'],
    sergeant: ['human.villager.village-sergeant', 'human.villager.corrupt-sergeant'],
    guard: [],
    'horse-related': ['human.villager.groom', 'human.villager.farrier'],
    priest: ['human.peasant.itinerant-priest', 'human.villager.village-priest', 'human.villager.venal-priest'],
    sorcerous: ['human.peasant.augur', 'human.peasant.recluse-wizard'],
    'female-gender-specific': ['human.peasant.midwife', 'human.peasant.country-wife', 'human.villager.serving-girl', 'human.villager.village-wife'],
  };
  it.each(semanticTags)('encodes exactly the scoped %s members', tag => {
    expect(humanContent.lifepaths.filter(lp => lp.semanticTags.includes(tag)).map(lp => lp.variantId).sort())
      .toEqual([...members[tag]].sort());
  });
  it('records provenance and keeps Sorcery metadata distinct from semantic membership', () => {
    for (const lp of humanContent.lifepaths.filter(lp => lp.semanticTags.length)) {
      expect(lp.semanticTagSource).toBe('docs/audits/CB-013_SEMANTIC_CATEGORIES.md');
    }
    expect(row('human.peasant.augur').skillListMetadata).toEqual({
      completeness: 'partial', knownEntries: [{ kind: 'skill', skillId: 'sorcery' }],
    });
    expect(row('human.peasant.recluse-wizard').requirements).toEqual([
      { kind: 'priorLifepathSkillListContains', skillId: 'sorcery' },
    ]);
    // That row's own skill list is not supplied by CB-006; its tag must not manufacture one.
    expect(row('human.peasant.recluse-wizard').skillListMetadata).toEqual({ completeness: 'partial', knownEntries: [] });
  });
});

describe('special grants and metadata', () => {
  it.each([
    ['human.peasant.country-wife', 'human.peasant', 'unspecified', 'Country Wife special rule'],
    ['human.villager.village-wife', 'human.villager', 'ordinary-and-general', 'Village Wife special rule'],
  ])('preserves %s with its independent source scope', (id, setting, scope, section) => {
    const lp = row(id!);
    expect(lp.resourceGrant).toEqual({ kind: 'wifeDerived', base: 5, specialRuleId: `${id}.husband-grants` });
    expect(lp.specialRules).toHaveLength(1);
    expect(lp.specialRules[0]).toEqual({
      id: `${id}.husband-grants`, kind: 'wifeDerivedGrant', husbandSettingId: setting,
      skillPointScope: scope, skillFraction: 0.5, skillRounding: 'down', resourceFraction: 0.5,
      source: { ...lp.source, section },
    });
    expect(lp.skillPointGrant).toEqual({ ordinary: 2, general: 0 });
    // Serialization must not erase the explicit unresolved value or coerce it to false.
    expect(JSON.parse(JSON.stringify(lp)).specialRules[0].skillPointScope).toBe(scope);
  });
  it('distinguishes both-pool grants from a choice of pool', () => {
    for (const id of ['human.peasant.hunter', 'human.peasant.trapper', 'human.villager.master-craftsman']) {
      expect(row(id).statGrant).toEqual({ kind: 'mentalAndPhysical', mental: 1, physical: 1 });
    }
    for (const id of ['human.villager.village-sergeant', 'human.villager.corrupt-sergeant', 'human.villager.journeyman']) {
      expect(row(id).statGrant).toEqual({ kind: 'chooseMentalOrPhysical', amount: 1 });
    }
  });
  it('retains mixed point pools and structured partial skill metadata', () => {
    expect(row('human.peasant.peasant-pilgrim').skillPointGrant).toEqual({ ordinary: 3, general: 1 });
    expect(row('human.villager.master-craftsman').skillPointGrant).toEqual({ ordinary: 6, general: 3 });
    expect(row('human.peasant.hunter').skillListMetadata).toEqual({
      completeness: 'partial', knownEntries: [{ kind: 'oneOf', skillIds: ['javelin', 'bow'] }],
    });
  });
  it('keeps differently printed Peddler families distinct', () => {
    expect(row('human.peasant.peddler').familyId).toBe('human.peddler');
    expect(row('human.villager.village-peddler').familyId).toBe('human.village-peddler');
  });
  it('rejects conflated shapes at compile time', () => {
    // @ts-expect-error A both-pool grant has two amounts, not one player-choice amount.
    const invalidBoth: StatGrant = { kind: 'mentalAndPhysical', amount: 1 };
    // @ts-expect-error A choice does not grant both pools.
    const invalidChoice: StatGrant = { kind: 'chooseMentalOrPhysical', mental: 1, physical: 1 };
    // @ts-expect-error The unresolved scope is an explicit value, never false.
    const invalidScope: DerivedSkillPointScope = false;
    expect([invalidBoth, invalidChoice, invalidScope]).toHaveLength(3);
  });
});

describe('structured Lead import and alias normalization', () => {
  it.each([
    ['Soldier', 'human.professional-soldier'], ['City', 'human.city-dweller'],
    ['Court', 'human.noble-court'], ['Village', 'human.villager'], ['Serv.', 'human.servitude-captive'],
  ])('normalizes %s to %s from registered metadata', (label, id) => {
    expect(normalizeSettingId(label!, 'human', catalog)).toBe(id);
  });
  it('preserves Any and the distinct exclusion predicates', () => {
    expect(parseLeadDefinition('Any', 'human', catalog)).toEqual({ kind: 'any' });
    expect(parseLeadDefinition('Any except Noble', 'human', catalog)).toEqual(row('human.villager.serving-girl').leads);
    expect(parseLeadDefinition('Any except Noble and Court', 'human', catalog)).toEqual(row('human.villager.kid').leads);
    expect(parseLeadDefinition('Any except Noble and Noble Court', 'human', catalog)).toEqual(row('human.villager.village-priest').leads);
    expect(row('human.villager.serving-girl').leads).not.toEqual(row('human.villager.kid').leads);
  });
  it('normalizes fixed destinations and preserves the audited self-Lead', () => {
    expect(parseLeadDefinition('Court; Peasant, Village', 'human', catalog)).toEqual(row('human.villager.vintner').leads);
  });
  it.each(['Unknown', '', 'Peasant,', 'Soldier, Professional Soldier'])('rejects malformed or unrecognized Leads: %s', text => {
    expect(() => parseLeadDefinition(text, 'human', catalog)).toThrow();
  });
});
