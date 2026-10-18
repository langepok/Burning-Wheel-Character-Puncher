import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { SkillCatalogContent, UseRequirement } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const expected = { kind: 'trait', id: 'gifted', use: 'summoning-magic' } as const;
const register = (useRequirements: unknown) => createSkillCatalog({ ...generalSkillTranscriptionContent,
  skills: generalSkillTranscriptionContent.skills.map(skill => skill.id === 'summoning' ? { ...skill, useRequirements } : skill),
} as SkillCatalogContent);

describe('Summoning Gifted requirement is magical-use only', () => {
  it('uses the umbrella summoning-magic scope rather than generic spell-casting', () => {
    expectTypeOf<typeof expected>().toExtend<UseRequirement>();
    expect(catalog.skills.get('summoning')?.useRequirements).toEqual([expected]);
    expect(catalog.skills.get('summoning')?.summary).toContain('call forth, bind and command spirits');
  });
  it('does not require Gifted to possess, open or advance the skill, leaving academic pursuit possible', () => {
    expect(catalog.skills.get('summoning')).toMatchObject({ coverage: 'complete', openingRequirements: [],
      training: { kind: 'exponent', rootPurpose: 'opening', advancement: 'standard' } });
    expect(catalog.skills.get('summoning')?.summary).toContain('Without Gifted');
    expect(catalog.skills.get('summoning')?.summary).toContain('academic pursuit');
    expect(catalog.skills.get('summoning')?.capabilities).toEqual([]);
    expect(catalog.skills.get('summoning')?.testProfile).toBeUndefined();
  });
  it('keeps source availability, root, type, no tools and unmarked heading separate', () => {
    expect(catalog.skills.get('summoning')).toMatchObject({ rootRule: { kind: 'single', ability: { kind: 'stat', id: 'perception' } },
      skillType: 'Sorcerous', tools: { kind: 'none', expendable: false }, printedMarkers: [], rollBehavior: { kind: 'standard' },
      availabilityRestrictions: [{ kind: 'stock-only', stockIds: ['human'], scope: 'character-burning' }] });
  });
  it('references the external Codex procedure without defining spirits, obstacles or execution', () => {
    expect(catalog.integrations.get('summoning-codex')).toMatchObject({ skillId: 'summoning', subsystem: 'magic' });
    expect(catalog.integrations.get('summoning-codex')?.summary).toContain('Codex');
    expect(catalog.integrations.get('summoning-codex')?.spellListCasting).toBeUndefined();
    expect(catalog.skills.get('summoning')?.procedures).toBeUndefined();
    expect(catalog.skills.get('summoning')?.source.some(source => source.kind === 'audit-packet' && source.pages?.printed.includes(327) && source.pages.pdf.includes(329))).toBe(true);
  });
  it('keeps the academic Summoning FoRK into Demonology without copying the magical-use gate', () => {
    expect(catalog.skills.get('demonology')?.forkSuggestions?.suggestions).toContainEqual({ target: { kind: 'skill', skillId: 'summoning' } });
    expect(catalog.skills.get('demonology')?.useRequirements).toEqual([]);
    expect(catalog.skills.get('demonology')?.openingRequirements).toEqual([]);
  });
  it('preserves existing separate Sorcery and Aura Reading use scopes', () => {
    expect(catalog.skills.get('sorcery')?.useRequirements).toEqual([{ kind: 'trait', id: 'gifted', use: 'spell-casting' }]);
    expect(catalog.skills.get('aura-reading')?.useRequirements).toEqual([{ kind: 'capability', id: 'aura-perception', use: 'aura-perception' }]);
  });
  it('serializes the use-only requirement, academic summary and external reference', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)));
    expect(restored.skills.get('summoning')).toEqual(catalog.skills.get('summoning'));
    expect(restored.integrations.get('summoning-codex')).toEqual(catalog.integrations.get('summoning-codex'));
  });
  it.each([
    null, 'gifted', [null], [{ ...expected, kind: 'opening' }], [{ ...expected, use: 'all-uses' }],
    [{ ...expected, id: '' }], [{ ...expected, id: 1 }], [{ ...expected, use: 'summon-spirits-only-not-bind' }],
    [{ ...expected, openingRequired: true }],
  ].map(value => ({ value })))('rejects malformed or unscoped requirement $value', ({ value }) => {
    expect(() => register(value)).toThrow('Invalid use requirement');
  });
});
