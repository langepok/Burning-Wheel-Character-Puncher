import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { SkillAdverseOutcome, SkillCatalogContent, SkillContext } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const munitions = catalog.skills.get('munitions')!;
const adverse = munitions.adverseOutcomes![0];
const replace = (value: unknown) => ({ ...generalSkillTranscriptionContent,
  skills: generalSkillTranscriptionContent.skills.map(skill => skill.id === 'munitions'
    ? { ...skill, adverseOutcomes: [value] } : skill),
}) as SkillCatalogContent;

describe('Munitions source-defined crafting adverse outcome', () => {
  it('preserves absolute failure as zero successes, not an ordinary failed test', () => {
    expect(adverse.trigger).toEqual({ kind: 'zero-successes' });
    expectTypeOf<{ kind: 'test-failure'; successes: 1 }>().not.toExtend<SkillAdverseOutcome['trigger']>();
    expect(() => createSkillCatalog(replace({ ...adverse, trigger: { kind: 'test-failure', successes: 1 } }))).toThrow();
    expectTypeOf<typeof adverse>().toExtend<SkillAdverseOutcome>();
  });
  it.each(['powder', 'explosive'])('preserves %s manufacturing in scope', category => {
    expect(adverse.when).toEqual({ kind: 'crafting-subject', operation: 'manufacturing',
      anyOf: [{ category: 'powder' }, { category: 'explosive' }] });
    expect(adverse.when.anyOf).toContainEqual({ category });
    expectTypeOf<typeof adverse.when>().toExtend<SkillContext>();
  });
  it('damages the maker using the created device Mark reference, not fixed damage', () => {
    expect(adverse.outcome).toEqual({ kind: 'damage', recipient: 'maker', severity: {
      kind: 'created-item-damage-reference', result: 'mark', resolution: 'manual-contextual' } });
    expect(adverse.sourceOutcomeLabels).toEqual(['cook-off', 'misfire']);
  });
  it('does not copy bomb item values or invent powder damage', () => {
    // Independent source oracle: bomb item Mark facts, book 284 / PDF 286.
    // These belong to item data, not the skill adverse-outcome descriptor.
    const bombMarkFacts = ['B4', 'B6', 'B8', 'B12'];
    const serialized = JSON.stringify(adverse);
    for (const mark of bombMarkFacts) expect(serialized).not.toContain(mark);
    expect(adverse.outcome.severity).not.toHaveProperty('dice');
    expect(adverse.outcome.severity).not.toHaveProperty('powderMark');
    expect(Object.values(adverse.outcome.severity).every(value => typeof value === 'string')).toBe(true);
    expect(adverse.outcome.severity.resolution).toBe('manual-contextual');
  });
  it('retains independently audited root, tools, FoRK and burning-only stock restriction', () => {
    expect(munitions.rootRule).toEqual({ kind: 'combined', abilities: [{ kind: 'stat', id: 'perception' }, { kind: 'stat', id: 'agility' }] });
    expect(munitions.tools).toEqual({ kind: 'workshop' });
    expect(munitions.forkSuggestions?.suggestions).toEqual([{ target: { kind: 'skill', skillId: 'alchemy' } }]);
    expect(munitions.availabilityRestrictions).toEqual([{ kind: 'stock-only', stockIds: ['human'], scope: 'character-burning' }]);
  });
  it('round-trips adverse scope, labels and unresolved/contextual item reference', () => {
    expect(createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent))).skills.get('munitions')?.adverseOutcomes).toEqual([adverse]);
  });
  it('accepts another source-defined crafting subject without a Munitions-specific evaluator', () => {
    const when = { kind: 'crafting-subject', operation: 'manufacturing', anyOf: [{ category: 'synthetic-material' }, { category: 'synthetic-device' }] };
    expect(createSkillCatalog(replace({ ...adverse, when })).skills.get('munitions')?.adverseOutcomes?.[0].when).toEqual(when);
  });
  it.each([
    { trigger: { kind: 'test-failure' } }, { trigger: { kind: 'zero-successes', obstacle: 4 } },
    { outcome: { ...adverse.outcome, recipient: 'target' } },
    { outcome: { ...adverse.outcome, severity: { kind: 'fixed-damage', dice: 4 } } },
    { outcome: { ...adverse.outcome, severity: { ...adverse.outcome.severity, result: 'incidental' } } },
    { outcome: { ...adverse.outcome, severity: { ...adverse.outcome.severity, resolution: 'automatic' } } },
    { outcome: { ...adverse.outcome, severity: { ...adverse.outcome.severity, powderMark: 'B4' } } },
    { sourceOutcomeLabels: [] }, { sourceOutcomeLabels: [''] }, { evaluator: 'detonate' },
  ])('rejects invented or malformed adverse-outcome metadata %j', patch => {
    expect(() => createSkillCatalog(replace({ ...adverse, ...patch }))).toThrow('Invalid adverse outcome');
  });
  it.each([
    { kind: 'crafting-subject', operation: 'using', anyOf: [{ category: 'powder' }, { category: 'explosive' }] },
    { kind: 'crafting-subject', operation: 'manufacturing', anyOf: [] },
    { kind: 'crafting-subject', operation: 'manufacturing', anyOf: [{ category: 'powder' }] },
    { kind: 'crafting-subject', operation: 'manufacturing', anyOf: [{ category: '' }, { category: 'explosive' }] },
    { kind: 'crafting-subject', operation: 'manufacturing', anyOf: [{ category: 'powder' }, { category: 'powder' }] },
    { kind: 'crafting-subject', operation: 'manufacturing', anyOf: [{ category: 'powder', mark: 4 }, { category: 'explosive' }] },
  ])('rejects malformed crafting-subject composition %j', when => {
    expect(() => createSkillCatalog(replace({ ...adverse, when }))).toThrow();
  });
});
