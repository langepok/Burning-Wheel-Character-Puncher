import { describe, expect, it } from 'vitest';
import type { RequirementNode } from '../../src/data/catalog';
import { humanContent } from '../../src/data/human';

// Explicit expected trees protect precedence and named-family vs semantic/setting distinctions.
const prior = (id: string): RequirementNode => ({ kind: 'priorFamily', familyId: `human.${id}` });
const any = (...items: RequirementNode[]): RequirementNode => ({ kind: 'anyOf', items });
const families = (...ids: string[]) => any(...ids.map(prior));
const notSecond: RequirementNode = { kind: 'position', mode: 'except', positions: [2] };
const expected: Record<string, readonly RequirementNode[]> = {
  'human.peasant.head-of-household': [notSecond],
  'human.peasant.midwife': [any({ kind: 'priorSemanticTag', tag: 'female-gender-specific' }, prior('farmer'), prior('itinerant-priest'))],
  'human.peasant.elder': [{ kind: 'finalStartingAgeGreaterThan', age: 50 }],
  'human.peasant.augur': [any(prior('midwife'), prior('country-wife'), {
    kind: 'allOf', items: [{ kind: 'characterGender', gender: 'female' }, { kind: 'finalLifepathCountAtMost', count: 3 }],
  })],
  'human.peasant.itinerant-priest': [{ kind: 'priorSemanticTag', tag: 'acolyte' }],
  'human.peasant.recluse-wizard': [{ kind: 'priorLifepathSkillListContains', skillId: 'sorcery' }],
  'human.villager.kid': [{ kind: 'position', mode: 'only', positions: [2] }, { kind: 'maxOccurrences', count: 1 }],
  'human.villager.miner': [families('laborer', 'conscript', 'farmer', 'foot-soldier')],
  'human.villager.taskmaster': [any(prior('village-sergeant'), { kind: 'priorSetting', settingId: 'human.professional-soldier' })],
  'human.villager.hosteller': [notSecond],
  'human.villager.village-sergeant': [families('village-tough', 'squire', 'freebooter', 'sergeant-at-arms', 'man-at-arms')],
  'human.villager.corrupt-sergeant': [families('village-tough', 'squire', 'freebooter', 'sergeant-at-arms', 'man-at-arms')],
  'human.villager.tax-collector': [notSecond],
  'human.villager.cobbler': [prior('apprentice')],
  'human.villager.farrier': [prior('apprentice')],
  'human.villager.village-priest': [prior('acolyte')],
  'human.villager.venal-priest': [any(prior('acolyte'), prior('clerk'), prior('student'), { kind: 'priorSetting', settingId: 'human.religious' })],
  'human.villager.journeyman': [prior('apprentice')],
  'human.villager.cloth-dyer': [prior('apprentice')],
  'human.villager.bowyer': [families('apprentice', 'huntsman', 'forester', 'archer')],
  'human.villager.master-craftsman': [prior('journeyman')],
  'human.villager.vintner': [notSecond],
  'human.villager.mining-engineer': [families('apprentice', 'miner', 'student', 'journeyman')],
  'human.villager.town-official': [families('clerk', 'priest', 'student')],
  'human.villager.merchant': [families('accountant', 'sea-captain', 'shopkeeper', 'smuggler', 'fence', 'vintner', 'chamberlain')],
};

describe('audited requirement trees (data only)', () => {
  it.each(humanContent.lifepaths)('$variantId', row => {
    expect(row.requirements).toEqual(expected[row.variantId] ?? []);
  });

  it('retains exact named Priest separately from the broad priest category', () => {
    expect(humanContent.families.find(family => family.id === 'human.priest')).toMatchObject({
      sourceName: 'Priest', coverage: 'reference-only',
    });
    expect(humanContent.lifepaths.some(row => row.familyId === 'human.priest')).toBe(false);
  });
});
