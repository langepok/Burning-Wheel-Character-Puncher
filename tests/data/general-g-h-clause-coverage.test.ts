import { describe, expect, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const rows: ReadonlyArray<readonly [string, readonly number[]]> = [
  ['gem-artifice', [1, 2, 3, 4, 5, 6, 10]], ['gemcraft', [1, 2, 3, 4, 5]],
  ['grain-appraisal', [1, 2]], ['grain-song', [1, 2]], ['hallmaster', [1, 2, 3, 4, 5, 6, 7, 8, 9]],
  ['hauling', [1, 2, 3, 4]], ['heraldry', [1, 2, 3, 4, 5]], ['herbalism', [1, 2, 3, 4, 5, 6]],
  ['hunting', [1, 2, 3, 4, 5, 6, 7]],
];
describe('General Skill List G–H clause review (book 275–278)', () => {
  it.each(rows)('%s preserves its printed obstacle sequence', (id, expected) => {
    expect([...(catalog.skills.get(id)?.summary ?? '').matchAll(/\bOb (\d+)\b/g)].map(row => Number(row[1])))
      .toEqual(expected);
  });
  it('keeps Great Wolf Will guidance separate from medical capability', () => {
    const skill = catalog.skills.get('great-wolf-husbandry');
    expect(skill?.summary).toContain('Most husbandry obstacles are based on the animal’s Will');
    expect(skill?.relations).toMatchObject([{ kind: 'includes-capability',
      target: { kind: 'skill', id: 'field-dressing' } }]);
    expect(skill?.testProfile).toMatchObject({ kind: 'obstacle',
      context: { circumstanceId: 'typical-great-wolf-husbandry-test' },
      base: { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' } } });
  });
  it('preserves History’s own cultural default and obstacle guidance without collapsing topic ownership', () => {
    const family = catalog.families.get('history');
    expect(family?.summary).toContain('unless the player or lifepath establishes otherwise');
    expect([...(family?.summary ?? '').matchAll(/\bOb (\d+)\b/g)].map(row => Number(row[1]))).toEqual([1, 2, 3, 4, 5, 6]);
    expect(family?.ownership).toBe('separate-skill-per-topic');
  });
});
