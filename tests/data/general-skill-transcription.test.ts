import { describe, expect, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';
import { generalSkillManifest } from './general-skill-manifest';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const reviewed = generalSkillManifest.filter(entry => entry.sourceName[0].toLowerCase() <= 'd' ||
  ('sourceParent' in entry && entry.sourceParent === 'doctrine') ||
  ['E', 'F', 'G'].includes(entry.sourceName[0]));

describe('Reviewed General Skill List transcription blocks', () => {
  it('covers every reviewed A–G entry exactly with the correct record kind/name/page', () => {
    const expectedSkills = reviewed.filter(entry => entry.kind !== 'family' && entry.kind !== 'choice');
    expect([...catalog.skills.keys()].sort()).toEqual(expectedSkills.map(entry => entry.id).sort());
    for (const entry of reviewed) {
      const record = entry.kind === 'choice' ? catalog.choices.get(entry.id) : catalog.skills.get(entry.id);
      expect(record?.sourceName).toBe(entry.sourceName);
      expect(record?.source).toContainEqual(expect.objectContaining({ pages: { printed: [entry.printedPage], pdf: [entry.pdfPage] } }));
      if (entry.kind !== 'choice') expect(catalog.skills.get(entry.id)?.coverage).toBe('complete');
    }
  });
  it('registers full Gem records and their independent valuation/magic metadata', () => {
    expect(catalog.skills.get('gem-artifice')).toMatchObject({ coverage: 'complete', skillType: 'Artisan', tools: { kind: 'workshop' } });
    expect(catalog.integrations.get('gem-artifice-value')?.createdItemValueEffects).toContainEqual({ kind: 'automatic', modifier: { target: 'created-item', measure: 'resources-obstacle', delta: 1 } });
    expect(catalog.integrations.get('gemcraft-value')?.createdItemValueEffects).toEqual([{ kind: 'automatic', modifier: { target: 'created-item', measure: 'resources-value-dice', delta: 1 } }]);
    expect(catalog.integrations.get('gem-artifice-matrix')?.subsystem).toBe('magic');
    expect(catalog.integrations.get('gemcraft-antiphon')?.subsystem).toBe('magic');
    expect(catalog.integrations.has('white-metal-artifice-value')).toBe(false);
  });
  it('keeps Games of Chance settlement separate from Gambling', () => {
    expect(catalog.skills.get('gambling')).toMatchObject({ coverage: 'complete', skillType: 'Special', tools: { kind: 'traveling-gear' } });
    expect(catalog.skills.get('games-of-chance')?.coverage).toBe('complete');
    expect(catalog.references.has('games-of-chance')).toBe(false);
  });
  it('retains the E–F source distinctions and audited Forge Artifice metadata', () => {
    expect(catalog.skills.get('earth-wise')?.skillType).toBe('Wise');
    expect(catalog.skills.get('firebuilding')?.forkSuggestions?.suggestions).toContainEqual({ target: { kind: 'unresolved-source-reference', sourceLabel: 'Survivalist', probableTargetSkillId: 'survival' } });
    expect(catalog.skills.get('forge-artifice')?.coverage).toBe('complete');
    expect(catalog.references.has('forge-artifice')).toBe(false);
    expect(catalog.skills.get('empyrealia')?.forkSuggestions?.suggestions).toContainEqual({ target: { kind: 'category', category: 'ritual', relevance: 'any' } });
    expect(catalog.skills.get('estate-management')?.tools).toEqual({ kind: 'specific-item', item: 'estate' });
    expect(catalog.skills.get('estate-management')?.resourceInteractions).toEqual([{ kind: 'recover-taxed-resources' }]);
    expect(catalog.skills.get('field-dressing')?.tools).toEqual({ kind: 'traveling-gear', expendable: true });
    expect(catalog.skills.get('falconry')?.tools).toEqual({ kind: 'allOf', requirements: [{ kind: 'generic' }, { kind: 'specific-item', item: 'falcon' }] });
  });
  it('serializes and registers the reviewed records and their nested references', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)) as typeof generalSkillTranscriptionContent);
    expect([...restored.skills]).toEqual([...catalog.skills]);
    expect([...restored.integrations]).toEqual([...catalog.integrations]);
  });
  it('preserves difficult A–D source facts independently of default helpers', () => {
    expect(catalog.skills.get('blacksmith')?.resourceInteractions).toEqual([{ kind: 'recover-taxed-resources', context: { kind: 'circumstance', circumstanceId: 'suitable-workplace' } }]);
    expect(catalog.skills.get('carpentry')?.resourceInteractions).toEqual([{ kind: 'recover-taxed-resources' }]);
    expect(catalog.skills.get('antiphon-union-training')).toMatchObject({ skillType: 'Artisan', training: { kind: 'training', exponent: 'none' }, tools: { kind: 'none', expendable: false } });
    expect(catalog.integrations.get('antiphon-creation')?.baseItemCreation).toEqual({ stage: 'base-item-creation', requiredMethod: { kind: 'applicable-skill-song' }, follows: 'selected-skill-own-rules-and-tools' });
    expect(catalog.skills.get('dwarven-rune-script')?.tools).toEqual({ kind: 'conditional', when: { kind: 'activity', activity: 'writing' }, then: { kind: 'generic', expendable: true }, otherwise: { kind: 'none', expendable: false } });
    expect(catalog.skills.get('demonology')?.forkSuggestions?.suggestions).toEqual(['ancient-history', 'obscure-history', 'summoning', 'doctrine'].map(skillId => ({ target: { kind: 'skill', skillId } })));
    expect(catalog.skills.get('drinking')?.rootRule).toEqual({ kind: 'single', ability: { kind: 'stat', id: 'forte' } });
    expect(catalog.skills.get('drunking')?.rootRule).toEqual({ kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'forte' }] });
    expect(catalog.skills.get('drum-maker')?.tools).toEqual({ kind: 'none', expendable: false });
    expect(catalog.skills.has('appropriate-weapons')).toBe(false);
  });
  it('preserves generic Wise Special type separately from explicitly printed Wise overrides', () => {
    expect(catalog.families.get('wises')?.defaults.skillType).toBe('Special');
    expect(catalog.skills.get('abbey-wise')?.skillType).toBe('Special');
    expect(catalog.skills.get('black-legion-wise')?.skillType).toBe('Wise');
    expect(catalog.skills.get('black-legion-wise')?.tools).toEqual({ kind: 'generic' });
  });
  it('keeps the three named Doctrine variations explicit without inventing a family or a prerequisite to knowing Doctrine', () => {
    for (const id of ['cult-doctrine', 'foreign-doctrine', 'heretical-doctrine']) {
      expect(catalog.skills.get(id)?.coverage).toBe('complete');
      expect(catalog.skills.get(id)?.familyMembership).toBeUndefined();
      expect(catalog.skills.get(id)?.openingRequirements).toEqual([]);
      expect(catalog.skills.get(id)?.relations).toEqual([{ kind: 'specialized-version', target: { kind: 'skill', id: 'doctrine' } }]);
    }
  });
});
