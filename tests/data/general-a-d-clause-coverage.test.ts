import { describe, expect, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);

// Checked against the printed General Skill List, book 253–254 / PDF 255–256.
// Each row retains its own subject and obstacle; the numbers alone are insufficient.
const guidance: ReadonlyArray<readonly [string, readonly (readonly [string, number])[]]> = [
  ['accounting', [
    ['single-income, single-residence taxes', 1], ['personal finances', 2], ['family income', 3],
    ['small business books', 4], ['estate books', 5], ['large business books', 6], ['town books', 7],
    ['city books', 8], ['province books', 9], ['nation books', 10],
  ]],
  ['acting', [['mummery', 1], ['morality play', 2], ['religious miracle', 3], ['religious mystery', 4], ['classics', 5]]],
  ['administration', [
    ['yourself', 1], ['shop', 2], ['confraternity', 3], ['small commune', 4], ['small guild', 5],
    ['small secret society', 6], ['large secret society', 7], ['small trading concern', 8],
    ['large guild', 9], ['giant trading concern', 10],
  ]],
  ['ages-of-the-etharch', [
    ['current age', 1], ['Third Age', 2], ['Second Age', 3], ['First Age', 4], ['Years of the Sun', 5],
    ['before the first Etharchs', 6],
  ]],
  ['alchemy', [['earth', 1], ['water or other liquid', 2], ['metal', 3], ['blood', 4]]],
  ['almanac', [
    ['general seasonal weather', 1], ['planting and harvest times', 2],
    ['reasonably accurate weather prediction', 3], ['festivals and holidays', 4],
  ]],
  ['anatomy', [['dog anatomy', 1], ['superficial human anatomy', 2], ['major human organs', 3],
    ['circulatory system', 4], ['human dissection', 5]]],
  ['animal-husbandry', [['chickens', 1], ['pigs or goats', 2], ['cows or horses', 3], ['exotic animals', 4]]],
];

describe('General Skill List clause review: Abbey-wise through Animal Husbandry', () => {
  it.each(guidance)('preserves each printed obstacle subject and number for %s', (id, rows) => {
    const summary = catalog.skills.get(id)?.summary;
    for (const [subject, obstacle] of rows) {
      expect(summary).toMatch(new RegExp(`\\b${subject} Ob ${obstacle}\\b`));
    }
  });

  it('records the Administration continuation separately from its heading', () => {
    expect(catalog.skills.get('administration')?.source.map(source =>
      source.kind === 'audit-packet' ? source.pages : undefined)).toEqual([
      { printed: [253], pdf: [255] }, { printed: [254], pdf: [256] },
    ]);
  });

  it('preserves the two distinct capabilities described by Almanac', () => {
    const summary = catalog.skills.get('almanac')?.summary;
    expect(summary).toContain('always tell the time of year nearly to the day');
    expect(summary).toContain('accurate predictions about the season’s weather');
  });
});
