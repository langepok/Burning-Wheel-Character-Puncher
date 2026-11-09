import { describe, expect, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
describe('General Skill List S–Z clause review', () => {
  it('preserves the Wises Say Yes condition and both family sources without an evaluator', () => {
    const family = catalog.families.get('wises');
    expect(family?.summary).toContain('Say Yes when a Wise test offers no interesting, compelling or important failure');
    expect(family?.source.map(source => source.kind === 'audit-packet' ? source.pages?.printed : undefined))
      .toEqual([[309], [253]]);
    expect([...(family?.summary ?? '').matchAll(/\bOb (\d+)\b/g)].map(row => Number(row[1])))
      .toEqual([1, 2, 3, 4, 5, 7, 8]);
  });
  it('preserves Write’s two statements without inventing a Read opening requirement', () => {
    const write = catalog.skills.get('write');
    expect(write?.summary).toContain('copyist');
    expect(write?.summary).toContain('transcribing thoughts in reasonably coherent written form');
    expect(write?.openingRequirements).toEqual([]);
    expect(write?.capabilities).toEqual([{ kind: 'literacy', actions: ['write'] }]);
  });
  it('retains typical shipwright crew as guidance and does not infer a mandatory crew', () => {
    expect(catalog.skills.get('shipwright')?.summary).toContain('usually directs carpenters, blacksmiths and laborers');
    expect(catalog.skills.get('shipwright')?.openingRequirements).toEqual([]);
    expect(catalog.skills.get('shipwright')?.procedures).toBeUndefined();
  });
});
