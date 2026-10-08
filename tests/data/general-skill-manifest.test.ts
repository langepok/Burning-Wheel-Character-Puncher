import { describe, expect, it } from 'vitest';
import { generalSkillManifest } from './general-skill-manifest';

describe('Independent General Skill List canonical manifest', () => {
  it('has distinct explicit identities and provenance throughout the source range', () => {
    expect(new Set(generalSkillManifest.map(entry => entry.id)).size).toBe(generalSkillManifest.length);
    expect(new Set(generalSkillManifest.map(entry => entry.sourceName)).size).toBe(generalSkillManifest.length);
    for (const entry of generalSkillManifest) {
      expect(entry.id).not.toBe('');
      expect(entry.printedPage).toBeGreaterThanOrEqual(253);
      expect(entry.printedPage).toBeLessThanOrEqual(309);
      expect(entry.pdfPage).toBe(entry.printedPage + 2);
    }
  });
  it('keeps family/choice headings and separate skill identities distinct', () => {
    const entry = (id: string) => generalSkillManifest.find(value => value.id === id);
    expect(entry('history')?.kind).toBe('family');
    expect(entry('wises')?.kind).toBe('family');
    expect(entry('appropriate-weapons')?.kind).toBe('choice');
    for (const [first, second] of [['boxing', 'martial-arts'], ['drinking', 'drunking'], ['orc-wise', 'ore-wise']]) {
      expect(entry(first)).toBeDefined();
      expect(entry(second)).toBeDefined();
      expect(entry(first)?.id).not.toBe(entry(second)?.id);
    }
  });
});
