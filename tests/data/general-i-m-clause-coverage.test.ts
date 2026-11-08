import { describe, expect, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const standard = [1, 2, 3, 4, 5];
const rows: ReadonlyArray<readonly [string, readonly number[]]> = [
  ['illuminations', standard], ['insect-husbandry', [1, 2, 3, 4]], ['jargon', [1, 2]],
  ['jewelcraft', standard], ['jeweler', [1, 1, 2, 3, 3, 3, 3, 4, 5, 6, 6, 7]],
  ['knots', [1, 2, 3, 4, 1, 2]], ['lapidary', [1, 2, 3, 3, 4, 5, 6]], ['leathercraft', standard],
  ['links', standard], ['lithography', standard], ['lock-pick', [1, 2, 3, 3, 4, 5]], ['locksmith', standard],
  ['logistics', [1, 2, 3, 4, 5, 6, 8, 10]], ['lyric-of-law', [1, 2, 3, 4]],
  ['mason', [1, 2, 3, 2, 3, 4, 5, 6, 7]], ['mending', [1, 2, 3, 4, 1, 2, 4, 6, 8]],
  ['midwifery', [2, 3, 4, 5, 6]], ['miller', [1, 2, 3, 4, 5, 6]], ['mimicry', [1, 2, 3, 4]],
  ['mining', [1, 2, 3, 5, 5, 9]], ['munitions', [1, 2, 3, 4, 5, 7]], ['music-composition', standard],
];
describe('General Skill List I–M clause review', () => {
  it.each(rows)('%s retains its printed obstacle rows', (id, expected) => {
    expect([...(catalog.skills.get(id)?.summary ?? '').matchAll(/\bOb (\d+)\b/g)].map(match => Number(match[1])))
      .toEqual(expected);
  });
  it('keeps armor damage dice distinct from the Mending obstacle', () => {
    const summary = catalog.skills.get('mending')?.summary;
    for (const row of ['light (1D) Ob 1', 'moderate (2D) Ob 2', 'bad (3D) Ob 4', 'shredded (4D) Ob 6', 'ruined (5D) Ob 8'])
      expect(summary).toContain(row);
  });
  it('preserves explicit bomb Mark values as product guidance, with no Mark invented for powder', () => {
    const summary = catalog.skills.get('munitions')?.summary;
    for (const row of ['small bomb (B4 Mark) Ob 2', 'medium bomb (B6 Mark for the bomb) Ob 3',
      'pistol or powder Ob 4', 'large bomb (B8 Mark) Ob 5', 'very large bomb (B12 Mark) Ob 7'])
      expect(summary).toContain(row);
  });
});
