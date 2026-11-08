import { describe, expect, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
describe('General Skill List N–R clause review', () => {
  it.each([
    ['navigation', [1, 2, 3, 4, 5, 6, 10]], ['nogger', [2, 3, 5]], ['purple-song', [1, 2, 3, 4, 5, 6]],
  ] as const)('%s preserves printed obstacles', (id, expected) => {
    expect([...(catalog.skills.get(id)?.summary ?? '').matchAll(/\bOb (\d+)\b/g)].map(row => Number(row[1])))
      .toEqual(expected);
  });
  it('preserves the Vintner comparison without importing its mechanics', () => {
    const skill = catalog.skills.get('purple-song');
    expect(skill?.summary).toContain('similar to Vintner');
    expect(skill?.relations).toEqual([]);
    expect(catalog.integrations.get('purple-song-antiphon')?.summary).toContain('Lyric of Healing or Doom of Strength');
  });
  it('keeps the flavor text about Roden separate from the Ratiquette context', () => {
    const skill = catalog.skills.get('ratiquette');
    expect(skill?.summary).toContain('Roden consider it an insult');
    expect(skill?.availabilityRestrictions).toEqual([]);
  });
});
