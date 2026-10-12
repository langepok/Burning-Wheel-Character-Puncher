import { readFileSync } from 'node:fs';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { SkillCatalogContent, TrainingBehavior, TrainingSourceChoice } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';
import { training } from '../../src/data/skills/general/shared';
import { skillFixtureContent } from '../../src/data/skills/fixtures';

const production = createSkillCatalog(generalSkillTranscriptionContent);
const fixtures = createSkillCatalog(skillFixtureContent);
const footnotes = [
  ['antiphon-union-training', 255], ['armor-training', 256], ['formation-fighting', 274],
  ['mounted-combat-training', 284], ['shield-training', 295], ['skirmish-tactics', 297],
  ['two-fisted-fighting-training', 306],
] as const;
const mounted = production.skills.get('mounted-combat-training')!;
const choice = mounted.trainingSourceChoice!;
const changeMounted = (patch: object) => ({ ...generalSkillTranscriptionContent,
  skills: generalSkillTranscriptionContent.skills.map(skill => skill.id === mounted.id ? { ...skill, ...patch } : skill),
}) as SkillCatalogContent;

describe('Training root usage and source identities (D-026)', () => {
  it.each(footnotes)('%s preserves its explicit footnote on book %i', (id, page) => {
    const record = production.skills.get(id) ?? fixtures.skills.get(id)!;
    expect(record.training).toEqual({ kind: 'training', rootUsage: 'aptitude-only',
      learningMethods: ['practice', 'instruction'], exponent: 'none', advancement: 'none', openingCost: 2 });
    expect(record.source.some(source => source.kind === 'audit-packet' &&
      source.pages?.printed.includes(page) && source.pages.pdf.includes(page + 2))).toBe(true);
  });
  it('does not infer root usage from generic Training learning methods or type', () => {
    expectTypeOf<typeof training>().toExtend<TrainingBehavior>();
    expect(training).not.toHaveProperty('rootUsage');
    const registered = createSkillCatalog(changeMounted({ training })).skills.get(mounted.id)!;
    expect(registered.skillType).toBe('Martial Training');
    expect(registered.training).not.toHaveProperty('rootUsage');
  });
  it('changing a learning method does not change aptitude-only root usage', () => {
    const result = createSkillCatalog(changeMounted({ training: { ...mounted.training, learningMethods: ['instruction'] } }));
    expect(result.skills.get(mounted.id)?.training).toMatchObject({ rootUsage: 'aptitude-only', learningMethods: ['instruction'] });
  });
  it('keeps two stable source identities, never aliases or fake Lancer Training', () => {
    expectTypeOf<typeof choice>().toExtend<TrainingSourceChoice>();
    expect(choice.options.map(option => [option.id, option.sourceLabel, option.archetype])).toEqual([
      ['mounted-combat-training', 'Mounted Combat Training', 'lancer'],
      ['mounted-combat-bowman-training', 'Mounted Combat: Bowman Training', 'bowman'],
    ]);
    expect(production.references.get('mounted-combat-bowman-training')?.sourceName).toBe('Mounted Combat: Bowman Training');
    expect([...production.skills.values(), ...production.references.values()].some(record => record.sourceName === 'Lancer Training')).toBe(false);
  });
  it.each([
    ['Outrider', 'mounted-combat-bowman-training'], ['Lancer', 'mounted-combat-training'],
  ])('Elven %s source resolves to %s', (lifepath, id) => {
    const options = choice.options.filter(option => option.sourceMappings.some(mapping => mapping.stockId === 'elf' && mapping.sourceName === lifepath));
    expect(options.map(option => option.id)).toEqual([id]);
    expect(options[0].sourceMappings[0].source).toContainEqual(expect.objectContaining({ pages: { printed: [137], pdf: [139] } }));
    expect(choice.options.flatMap(option => option.sourceMappings).some(mapping => mapping.sourceName === 'Bowman')).toBe(false);
  });
  it('permits both owned identities independently of acquisition selection', () => {
    const ownedTrainingIds = choice.options.map(option => option.id);
    expect(new Set(ownedTrainingIds).size).toBe(2);
    expect(choice).toMatchObject({ selectionScope: 'source-acquisition', ownership: 'independent' });
    for (const option of choice.options) {
      expect(option.source).toContainEqual(expect.objectContaining({ pages: { printed: [130], pdf: [132] } }));
    }
    // No character-state command/enforcement model is introduced by this content record.
    expect(createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent))).skills.get(mounted.id)?.trainingSourceChoice).toEqual(choice);
  });
  it('round-trips all seven footnotes through catalog integrity', () => {
    const restored = [generalSkillTranscriptionContent, skillFixtureContent].map(content => createSkillCatalog(JSON.parse(JSON.stringify(content))));
    for (const [id] of footnotes) expect((restored[0].skills.get(id) ?? restored[1].skills.get(id))?.training).toMatchObject({ rootUsage: 'aptitude-only' });
  });
  it.each([
    { rootUsage: 'practice' }, { learningMethods: [] }, { learningMethods: ['beginner-luck'] },
    { learningMethods: ['practice', 'practice'] }, { rootPurpose: 'opening' }, { exponent: 1 },
  ])('rejects malformed Training semantics %j', patch => {
    expect(() => createSkillCatalog(changeMounted({ training: { ...mounted.training, ...patch } }))).toThrow('Invalid Training metadata');
  });
  it.each([
    { ownership: 'exclusive' }, { selectionScope: 'character' },
    { options: [choice.options[0], choice.options[0]] },
    { options: [choice.options[0], { ...choice.options[1], id: 'missing-training' }] },
    { options: [choice.options[0], { ...choice.options[1], sourceLabel: 'Lancer Training' }] },
    { options: [choice.options[0], { ...choice.options[1], sourceMappings: [{ kind: 'lifepath', stockId: '', sourceName: 'Outrider', source: [] }] }] },
  ])('rejects invalid options/source mappings %j', patch => {
    expect(() => createSkillCatalog(changeMounted({ trainingSourceChoice: { ...choice, ...patch } }))).toThrow();
  });
  it('records the durable decision and corrects root/source documentation', () => {
    const decision = readFileSync('docs/DECISIONS.md', 'utf8').split('## D-026')[1].split('## Open decisions')[0];
    for (const text of ['rootUsage aptitude-only', 'Practice and instruction', 'not globally exclusive', 'Outrider', 'Lancer', '130/132']) expect(decision).toContain(text);
    const notes = readFileSync('docs/RULES_NOTES.md', 'utf8');
    expect(notes).not.toContain('Aptitude/practice');
    expect(notes).not.toContain('aptitude-and-' + 'practice');
    expect(notes).toContain('Elven Outrider grants Bowman');
  });
  it('keeps combat execution external', () => {
    expect(mounted.integrationTags).toContain('mounted-combat');
    expect(production.integrations.get('mounted-combat-external')?.subsystem).toBe('mounted-combat');
  });
});
