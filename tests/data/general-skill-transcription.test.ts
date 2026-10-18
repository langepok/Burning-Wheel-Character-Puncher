import { describe, expect, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';
import { generalSkillManifest } from './general-skill-manifest';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const reviewed = generalSkillManifest.filter(entry => entry.sourceName[0].toLowerCase() <= 'r' ||
  ['saddlery', 'saint-wise', 'scavenging', 'sculpture', 'scutwork-wise', 'seamanship', 'seduction', 'servant-wise', 'sewing', 'shield-training', 'ship-management', 'ship-wise', 'shipwright', 'shortcut-wise', 'shrewd-appraisal', 'siege-engineer', 'signaling', 'silent-fury', 'silver-trumpet', 'sing'].includes(entry.id));

describe('Reviewed General Skill List transcription blocks', () => {
  it('preserves Signaling tool alternatives and source metadata', () => {
    expect(catalog.skills.get('signaling')).toMatchObject({ rootRule: { kind: 'single', ability: { kind: 'stat', id: 'perception' } },
      skillType: 'Seafaring', tools: { kind: 'anyOf', requirements: [
        { kind: 'specific-item', item: 'signaling-lantern' }, { kind: 'specific-item', item: 'signal-flags' },
      ] }, forkSuggestions: { suggestions: [{ target: { kind: 'skill', skillId: 'cryptography' } }] } });
  });
  it('preserves Silent Fury as a distinct magical Elven identity using Intimidation mechanics', () => {
    expect(catalog.skills.get('silent-fury')).toMatchObject({ rootRule: { kind: 'single', ability: { kind: 'stat', id: 'will' } },
      skillType: 'Social', tools: { kind: 'none', expendable: false }, printedMarkers: ['§'],
      rollBehavior: { kind: 'open-ended', basis: 'magical' },
      availabilityRestrictions: [{ kind: 'stock-only', stockIds: ['elf'], scope: 'always' }],
      relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'intimidation' } }],
      forkSuggestions: { suggestions: [{ target: { kind: 'skill', skillId: 'paean-of-deeds' } }] },
      testProfile: { kind: 'obstacle', base: { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' } } });
    expect(catalog.skills.get('silent-fury')?.sourceAliases).toBeUndefined();
  });
  it('preserves Silver Trumpet instrument and Elven character-burning restriction', () => {
    expect(catalog.skills.get('silver-trumpet')).toMatchObject({ rootRule: { kind: 'single', ability: { kind: 'stat', id: 'will' } },
      skillType: 'Musical', tools: { kind: 'specific-item', item: 'elven-silver-trumpet' },
      availabilityRestrictions: [{ kind: 'stock-only', stockIds: ['elf'], scope: 'character-burning' }], printedMarkers: [] });
  });
  it('preserves Sing listener Will and canonical Advantage without an invented fixed bonus or opposed pretest', () => {
    expect(catalog.skills.get('sing')).toMatchObject({ rootRule: { kind: 'single', ability: { kind: 'stat', id: 'will' } },
      skillType: 'Musical', tools: { kind: 'none', expendable: false },
      forkSuggestions: { suggestions: [{ target: { kind: 'skill', skillId: 'poetry' } }] },
      testProfile: { kind: 'obstacle', base: { kind: 'target-ability-exponent', targetRole: 'listener', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' },
        modifiers: [{ effect: { kind: 'advantage', resolution: 'canonical' }, when: { kind: 'music-mood-suitability', relation: 'suitable' } }] } });
    expect(catalog.skills.get('sing')?.procedures).toBeUndefined();
    expect(catalog.skills.get('sing')?.summary).toContain('linked tests');
  });
  it('preserves Shipwright source spellings as unresolved FoRK guidance and the following bare Wises', () => {
    const shipwright = catalog.skills.get('shipwright');
    expect(shipwright?.rootRule).toEqual({ kind: 'single', ability: { kind: 'stat', id: 'perception' } });
    expect(shipwright?.skillType).toBe('Craftsman');
    expect(shipwright?.tools).toEqual({ kind: 'workshop' });
    expect(shipwright?.forkSuggestions?.suggestions).toEqual([
      { target: { kind: 'unresolved-source-reference', sourceLabel: 'Engineer', probableTargetSkillId: 'engineering' } },
      { target: { kind: 'unresolved-source-reference', sourceLabel: 'Carpenter', probableTargetSkillId: 'carpentry' } },
      { target: { kind: 'skill', skillId: 'boatwright' } },
    ]);
    for (const topic of ['ship', 'shortcut']) {
      expect(catalog.skills.get(`${topic}-wise`)).toMatchObject({
        coverage: 'complete', rootRule: { kind: 'single', ability: { kind: 'stat', id: 'perception' } },
        skillType: 'Special', tools: { kind: 'none', expendable: false }, familyMembership: { familyId: 'wises', topicId: topic },
      });
    }
  });
  it('preserves P source relations, requirements and contextual modifiers before Poisons', () => {
    expect(catalog.skills.get('paean-of-deeds')?.relations).toEqual([{ kind: 'same-mechanics', target: { kind: 'skill', id: 'conspicuous' } }]);
    expect(catalog.skills.get('paean-of-deeds')?.availabilityRestrictions).toEqual([{ kind: 'stock-only', stockIds: ['elf'], scope: 'always' }]);
    expect(catalog.skills.get('persuasion')?.testProfile).toEqual({ kind: 'obstacle', base: {
      kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' } });
    expect(catalog.skills.get('philosophy')?.forkSuggestions?.suggestions).toContainEqual({ target: { kind: 'skill-family', familyId: 'history', relevance: 'any' } });
    expect(catalog.skills.get('playwright')?.openingRequirements).toEqual([{ kind: 'known-skill', skillId: 'write' }]);
    expect(catalog.skills.get('poetry')?.testProfile?.modifiers).toEqual([{ effect: { kind: 'obstacle-modifier', delta: 1 },
      when: { kind: 'circumstance', circumstanceId: 'mimicking-another-poets-style' } }]);
    const poisonous = catalog.skills.get('poisonous-platitudes');
    expect(poisonous?.rootRule).toEqual({ kind: 'single', ability: { kind: 'attribute', id: 'hatred' } });
    expect(poisonous?.rollBehavior).toEqual({ kind: 'open-ended', basis: 'attribute-root' });
    expect(poisonous?.relations).toEqual(['persuasion', 'soothing-platitudes'].map(id => ({ kind: 'includes-capability', target: { kind: 'skill', id } })));
    expect(poisonous?.testProfile?.base).toEqual({ kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' });
    expect(poisonous?.integrationTags).toEqual(['duel-of-wits']);
  });
  it('completes P with separate crafting roots, open Wises and source-backed magic reference', () => {
    expect(catalog.skills.get('potter')?.rootRule).toEqual({ kind: 'combined', abilities: [{ kind: 'stat', id: 'perception' }, { kind: 'stat', id: 'agility' }] });
    expect(catalog.skills.get('potter')?.tools).toEqual({ kind: 'generic', expendable: true });
    expect(catalog.skills.get('prospecting')?.forkSuggestions?.suggestions).toEqual([
      { target: { kind: 'skill-family', familyId: 'wises', relevance: 'appropriate' } },
      { target: { kind: 'skill', skillId: 'mining' } }, { target: { kind: 'skill', skillId: 'mason' } },
    ]);
    expect(catalog.skills.get('purple-song')?.availabilityRestrictions).toEqual([{ kind: 'stock-only', stockIds: ['elf'], scope: 'always' }]);
    expect(catalog.skills.get('purple-song')?.tools).toEqual({ kind: 'workshop' });
    expect(catalog.skills.get('purple-song')?.rollBehavior).toEqual({ kind: 'open-ended', basis: 'magical' });
    expect(catalog.integrations.get('purple-song-antiphon')?.createdItemReference).toEqual({ kind: 'antiphon-union', target: 'created-item', skillId: 'antiphon-union-training' });
    expect(catalog.integrations.get('purple-song-antiphon')?.equipmentResult).toBeUndefined();
    expect(catalog.skills.get('purple-song')?.relations).toEqual([]);
  });
  it('preserves reviewed R contexts, literacy, roots, mechanics references and printed Seafaring labels', () => {
    expect(catalog.skills.get('ratiquette')?.relations).toEqual([{ kind: 'contextual-substitution', target: { kind: 'skill', id: 'etiquette' }, context: { kind: 'subject', subject: 'rats-and-relatives' } }]);
    expect(catalog.skills.get('read')?.capabilities).toEqual([{ kind: 'literacy', actions: ['read'] }]);
    expect(catalog.skills.get('read')?.testProfile?.modifiers).toEqual([{ effect: { kind: 'obstacle-modifier', delta: 1 }, when: { kind: 'circumstance', circumstanceId: 'reading-silently' } }]);
    for (const [id, ability] of [['religious-diatribe', 'will'], ['rhetoric', 'perception']]) {
      expect(catalog.skills.get(id)?.testProfile?.base).toEqual({ kind: 'target-ability-exponent', ability: { kind: 'stat', id: ability }, snapshot: 'current' });
    }
    for (const [id, target] of [['rhyme-of-the-gatherer', 'foraging'], ['rhyme-of-the-mariner', 'rigging'], ['rhyme-of-the-pathfinder', 'tracking']]) {
      expect(catalog.skills.get(id)?.relations).toEqual([{ kind: 'same-mechanics', target: { kind: 'skill', id: target } }]);
    }
    expect(catalog.skills.get('rhyme-of-the-mariner')?.skillType).toBe('Seafarer');
    expect(catalog.skills.get('rigging')?.skillType).toBe('Seafaring');
    expect(catalog.skills.get('reason-of-old-stone')?.availabilityRestrictions).toEqual([{ kind: 'stock-only', stockIds: ['dwarf'], scope: 'always' }]);
    expect(catalog.integrations.get('riddle-of-steel-antiphon')?.createdItemReference).toEqual({ kind: 'antiphon-union', target: 'created-item', skillId: 'antiphon-union-training' });
  });
  it('preserves later R tool alternatives, mechanics boundaries and legal-case FoRK contexts', () => {
    expect(catalog.skills.get('rope-chant')?.tools).toEqual({ kind: 'anyOf', requirements: [{ kind: 'traveling-gear' }, { kind: 'specific-item', item: 'elven-rope' }] });
    expect(catalog.skills.get('rope-chant')?.relations).toEqual([{ kind: 'mechanics-reuse-with-additions', target: { kind: 'skill', id: 'knots' } }]);
    expect(catalog.skills.get('round-of-harvest')?.forkSuggestions?.suggestions).toContainEqual({ target: { kind: 'unresolved-source-reference', sourceLabel: 'Weathersong' } });
    expect(catalog.skills.get('round-of-harvest')?.relations).toEqual([{ kind: 'same-mechanics', target: { kind: 'skill', id: 'farming' } }]);
    expect(catalog.skills.get('rude-carpentry')?.availabilityRestrictions).toEqual([{ kind: 'stock-only', stockIds: ['orc'], scope: 'character-burning' }]);
    expect(catalog.skills.get('rude-carpentry')?.relations).toEqual([]);
    const law = catalog.skills.get('rule-of-law')?.forkSuggestions?.suggestions ?? [];
    expect(law).toHaveLength(7);
    expect(law.slice(0, 4).map(value => value.context)).toEqual(Array(4).fill({ kind: 'circumstance', circumstanceId: 'researching-legal-case' }));
    expect(law.slice(4).map(value => value.context)).toEqual(Array(3).fill({ kind: 'circumstance', circumstanceId: 'presenting-legal-case' }));
    expect(catalog.integrations.get('rope-chant-antiphon')?.createdItemReference).toEqual({ kind: 'antiphon-union', target: 'created-item', skillId: 'antiphon-union-training' });
  });
  it('preserves Saddlery crafting metadata and Saint-wise independent topic identity', () => {
    expect(catalog.skills.get('saddlery')?.rootRule).toEqual({ kind: 'combined', abilities: [{ kind: 'stat', id: 'perception' }, { kind: 'stat', id: 'agility' }] });
    expect(catalog.skills.get('saddlery')?.skillType).toBe('Craftsman');
    expect(catalog.skills.get('saddlery')?.tools).toEqual({ kind: 'workshop' });
    expect(catalog.skills.get('saddlery')?.forkSuggestions?.suggestions).toEqual([{ target: { kind: 'skill', skillId: 'tanner' } }]);
    expect(catalog.skills.get('saint-wise')?.familyMembership).toEqual({ familyId: 'wises', topicId: 'saint' });
  });
  it('preserves reviewed S roots, labels, restrictions and unresolved Weaver guidance', () => {
    expect(catalog.skills.get('sculpture')?.rootRule).toEqual({ kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'agility' }] });
    expect(catalog.skills.get('seamanship')?.skillType).toBe('Seafaring');
    expect(catalog.skills.get('seduction')?.testProfile?.base).toEqual({ kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' });
    expect(catalog.skills.get('seduction')?.integrationTags).toEqual(['duel-of-wits']);
    expect(catalog.skills.get('servant-wise')?.skillType).toBe('Wise');
    expect(catalog.skills.get('servant-wise')?.availabilityRestrictions).toEqual([{ kind: 'stock-only', stockIds: ['orc'], scope: 'character-burning' }]);
    expect(catalog.skills.get('sewing')?.forkSuggestions?.suggestions).toEqual([
      { target: { kind: 'unresolved-source-reference', sourceLabel: 'Weaver', probableTargetSkillId: 'weaving' } },
      { target: { kind: 'skill', skillId: 'embroidery' } },
    ]);
    expect(catalog.skills.get('sewing')?.tools).toEqual({ kind: 'generic', expendable: true });
  });
  it('preserves Martial Arts identity and the law-song FoRK alternatives', () => {
    expect(catalog.skills.get('martial-arts')?.id).not.toBe(catalog.skills.get('boxing')?.id);
    expect(catalog.skills.get('martial-arts')?.relations).toEqual([{ kind: 'same-mechanics', target: { kind: 'skill', id: 'boxing' } }]);
    expect(catalog.skills.get('martial-arts')?.rootRule).toEqual({ kind: 'combined', abilities: [{ kind: 'stat', id: 'power' }, { kind: 'stat', id: 'agility' }] });
    expect(catalog.skills.get('lyric-of-law')?.forkSuggestions?.suggestions).toEqual([{ target: {
      kind: 'anyOf', targets: [{ kind: 'skill-family', familyId: 'history', relevance: 'appropriate' },
        { kind: 'skill-family', familyId: 'wises', relevance: 'appropriate' }, { kind: 'category', category: 'song', relevance: 'appropriate' }],
    } }]);
    expect(catalog.skills.get('lyric-of-law')?.availabilityRestrictions).toEqual([{ kind: 'stock-only', stockIds: ['elf'], scope: 'always' }]);
  });
  it('preserves the reviewed L roots, restrictions and scoped capability inclusion', () => {
    expect(catalog.skills.get('links')?.rootRule).toEqual({ kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'forte' }] });
    expect(catalog.skills.get('links')?.availabilityRestrictions).toEqual([{ kind: 'stock-only', stockIds: ['dwarf'], scope: 'character-burning' }]);
    expect(catalog.skills.get('lithography')?.printedMarkers).toEqual(['§']);
    expect(catalog.skills.get('lithography')?.availabilityRestrictions).toEqual([{ kind: 'stock-only', stockIds: ['dwarf'], scope: 'always' }]);
    expect(catalog.skills.get('locksmith')?.relations).toEqual([{ kind: 'includes-capability', target: { kind: 'skill', id: 'lock-pick' } }]);
    expect(catalog.skills.get('locksmith')?.tools).toEqual({ kind: 'workshop' });
    expect(catalog.skills.get('lock-pick')?.tools).toEqual({ kind: 'generic' });
  });
  it('preserves the separate J–K roots, restrictions, tools and subsystem references', () => {
    const jewelcraft = catalog.skills.get('jewelcraft');
    expect(jewelcraft?.rootRule).toEqual({ kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'agility' }] });
    expect(jewelcraft?.availabilityRestrictions).toEqual([{ kind: 'stock-only', stockIds: ['elf'], scope: 'always' }]);
    expect(jewelcraft?.printedMarkers).toEqual(['§']);
    expect(jewelcraft?.tools).toEqual({ kind: 'workshop' });
    expect(catalog.integrations.get('jewelcraft-antiphon')?.createdItemReference).toEqual({
      kind: 'antiphon-union', target: 'created-item', skillId: 'antiphon-union-training',
    });
    expect(catalog.skills.get('jeweler')?.rootRule).toEqual({ kind: 'combined', abilities: [{ kind: 'stat', id: 'perception' }, { kind: 'stat', id: 'agility' }] });
    expect(catalog.skills.get('khirurgy')?.availabilityRestrictions).toEqual([{ kind: 'stock-only', stockIds: ['dwarf'], scope: 'character-burning' }]);
    expect(catalog.skills.get('javelin')?.tools).toEqual({ kind: 'none', expendable: false });
    expect(catalog.skills.get('javelin')?.integrationTags).toEqual(['range-and-cover', 'fight']);
    expect(catalog.skills.get('knives')?.tools).toEqual({ kind: 'specific-item', item: 'something knife-like' });
    expect(catalog.skills.get('knives')?.integrationTags).toEqual(['fight']);
  });
  it('covers every reviewed entry in complete A–R and early S with the correct record kind/name/page', () => {
    const expectedSkills = reviewed.filter(entry => entry.kind !== 'family' && entry.kind !== 'choice');
    expect([...catalog.skills.keys()].sort()).toEqual(expectedSkills.map(entry => entry.id).sort());
    for (const entry of reviewed) {
      const record = entry.kind === 'family' ? catalog.families.get(entry.id) : entry.kind === 'choice' ? catalog.choices.get(entry.id) : catalog.skills.get(entry.id);
      expect(record?.sourceName).toBe(entry.sourceName);
      expect(record?.source).toContainEqual(expect.objectContaining({ pages: { printed: [entry.printedPage], pdf: [entry.pdfPage] } }));
      if (entry.kind !== 'choice' && entry.kind !== 'family') expect(catalog.skills.get(entry.id)?.coverage).toBe('complete');
    }
  });
  it('preserves the remaining H context/choice distinctions and full Inconspicuous identity', () => {
    expect(catalog.skills.get('hunting')?.tools).toEqual({ kind: 'anyOf', requirements: [{ kind: 'specific-item', item: 'bow' }, { kind: 'specific-item', item: 'javelin' }] });
    expect(catalog.skills.get('herbalism')?.forkSuggestions?.suggestions).toEqual([
      { target: { kind: 'anyOf', targets: [{ kind: 'skill', skillId: 'apothecary' }, { kind: 'skill', skillId: 'alchemy' }] }, context: { kind: 'activity', activity: 'potion-work' } },
      { target: { kind: 'anyOf', targets: [{ kind: 'skill', skillId: 'surgery' }, { kind: 'skill', skillId: 'field-dressing' }] }, context: { kind: 'activity', activity: 'wound-treatment' } },
    ]);
    expect(catalog.skills.get('hauling')?.relations).toEqual([{ kind: 'contextual-substitution', target: { kind: 'stat', id: 'power' }, context: { kind: 'activity', activity: 'hauling' } }]);
    expect(catalog.families.get('history')?.defaults).toMatchObject({ rootRule: { kind: 'single', ability: { kind: 'stat', id: 'perception' } }, skillType: 'Academic', tools: { kind: 'none', expendable: false } });
    expect(catalog.skills.has('history')).toBe(false);
    expect(catalog.skills.get('illuminations')?.skillType).toBe('Artist');
    expect(catalog.skills.get('inconspicuous')?.coverage).toBe('complete');
    expect(catalog.references.has('inconspicuous')).toBe(false);
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
