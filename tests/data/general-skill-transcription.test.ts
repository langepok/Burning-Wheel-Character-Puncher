import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { ToolRequirement } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';
import { generalSkillManifest } from './general-skill-manifest';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const reviewed = generalSkillManifest;

describe('Reviewed General Skill List transcription blocks', () => {
  it('preserves the final manufacturing, knowledge and literacy records', () => {
    expect(catalog.skills.get('whitesmith')).toMatchObject({ rootRule: { kind: 'combined', abilities: [{ kind: 'stat', id: 'perception' }, { kind: 'stat', id: 'agility' }] }, skillType: 'Craftsman', tools: { kind: 'workshop' } });
    for (const row of ['hairpins Ob 1', 'spoons/cups Ob 2', 'silver bullets Ob 3', 'tea service Ob 4', 'silver swords Ob 4']) expect(catalog.skills.get('whitesmith')?.summary).toContain(row);
    expect(catalog.skills.get('wine-tasting')?.testProfile?.modifiers).toEqual([
      ...[[1, 'tasting-drinkable-wine'], [2, 'tasting-swill'], [1, 'tasting-old-wine'], [2, 'tasting-ancient-wine']].map(([delta, circumstanceId]) => ({ effect: { kind: 'obstacle-modifier', delta }, when: { kind: 'circumstance', circumstanceId } })),
    ]);
    for (const row of ['grape Ob 1', 'terroir Ob 2', 'vintage Ob 3', 'estate Ob 4']) expect(catalog.skills.get('wine-tasting')?.summary).toContain(row);
    expect(catalog.skills.get('woodcraft')).toMatchObject({ rootRule: { kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'agility' }] }, skillType: 'Craftsman', tools: { kind: 'none' }, printedMarkers: ['§'], availabilityRestrictions: [{ kind: 'stock-only', stockIds: ['elf'], scope: 'always' }] });
    for (const row of ['box/shelf Ob 1', 'cup/bowl/stool/ladder Ob 2', 'wall/table/chair/cabinets Ob 3', 'level floor Ob 4', 'staircase Ob 5']) expect(catalog.skills.get('woodcraft')?.summary).toContain(row);
    expect(catalog.skills.get('write')).toMatchObject({ rootRule: { kind: 'combined', abilities: [{ kind: 'stat', id: 'perception' }, { kind: 'stat', id: 'agility' }] }, skillType: 'Academic', tools: { kind: 'generic', expendable: true }, openingRequirements: [], capabilities: [{ kind: 'literacy', actions: ['write'] }] });
    expect(catalog.skills.get('write')?.summary).toContain('copyist');
    expect(catalog.skills.get('write')?.forkSuggestions?.suggestions).toEqual(['composition', 'calligraphy'].map(skillId => ({ target: { kind: 'skill', skillId } })));
    expect(catalog.skills.get('playwright')?.openingRequirements).toEqual([{ kind: 'known-skill', skillId: 'write' }]);
    for (const row of ['name Ob 1', 'copying letters Ob 2', 'composing a letter Ob 3']) expect(catalog.skills.get('write')?.summary).toContain(row);
    for (const topic of ['windage', 'wolf', 'wood']) expect(catalog.skills.get(`${topic}-wise`)).toMatchObject({ skillType: 'Special', familyMembership: { familyId: 'wises', topicId: topic } });
    for (const row of ['common knowledge Ob 1', 'interesting fact Ob 2', 'details Ob 3', 'uncommon knowledge Ob 4', 'rare goods Ob 5', 'bizarre/obscure Ob 7', 'specific details Ob 8']) expect(catalog.families.get('wises')?.summary).toContain(row);
    expect(catalog.families.get('wises')?.summary).not.toContain('Ob 6');
  });
  it('preserves Weaving guidance and Weaving Way own metadata, replacement and external cloak combination', () => {
    expect(catalog.skills.get('weaving')).toMatchObject({ rootRule: { kind: 'combined', abilities: [{ kind: 'stat', id: 'perception' }, { kind: 'stat', id: 'agility' }] },
      skillType: 'Peasant', tools: { kind: 'generic', expendable: true } });
    for (const row of ['linen/flax Ob 1', 'wool cloth Ob 2', 'cotton cloth Ob 3', 'silk cloth Ob 4']) expect(catalog.skills.get('weaving')?.summary).toContain(row);
    expect(catalog.skills.get('weaving')?.forkSuggestions?.suggestions).toEqual([{ target: { kind: 'skill', skillId: 'sewing' } }]);
    expect(catalog.skills.get('weaving-way')).toMatchObject({ rootRule: { kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'agility' }] },
      skillType: 'Peasant', tools: { kind: 'generic', expendable: true }, printedMarkers: ['§'],
      availabilityRestrictions: [{ kind: 'stock-only', stockIds: ['elf'], scope: 'always' }],
      relations: [{ kind: 'replacement', target: { kind: 'skill', id: 'weaving' }, context: { kind: 'circumstance', circumstanceId: 'elven-weaving' } }] });
    expect(catalog.integrations.get('weaving-way-antiphon')?.createdItemReference).toEqual({ kind: 'antiphon-union', target: 'created-item', skillId: 'antiphon-union-training' });
    expect(catalog.integrations.get('weaving-way-antiphon')?.summary).toContain('Threne of the Chameleon');
    expect(catalog.integrations.get('weaving-way-antiphon')?.equipmentResult).toBeUndefined();
    expect(catalog.skills.has('threne-of-the-chameleon')).toBe(false);
  });
  it.each([['web', 'Web-wise'], ['well', 'Well-wise'], ['whip', 'Whip-Wise'], ['whispered-secrets', 'Whispered Secrets-wise']])('preserves bare %s topic and printed spelling', (topic, sourceName) => {
    expect(catalog.skills.get(`${topic}-wise`)).toMatchObject({ sourceName, skillType: 'Special',
      rootRule: { kind: 'single', ability: { kind: 'stat', id: 'perception' } }, tools: { kind: 'none' },
      familyMembership: { familyId: 'wises', topicId: topic } });
    expect(catalog.skills.get(`${topic}-wise`)?.semanticCategories).toBeUndefined();
  });
  it('preserves War Engineer building guidance and external Materials reference without inferred stock/tool-output restrictions', () => {
    expect(catalog.skills.get('war-engineer')).toMatchObject({ rootRule: { kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'perception' }] },
      skillType: 'Artisan', tools: { kind: 'workshop' }, printedMarkers: ['§'], availabilityRestrictions: [] });
    for (const row of ['battering ram Ob 1', 'small war tower Ob 2', 'covered ram Ob 3', 'small stone thrower Ob 4', 'siege arbalest Ob 5', 'large trebuchet Ob 6'])
      expect(catalog.skills.get('war-engineer')?.summary).toContain(row);
    expect(catalog.integrations.get('war-engineer-materials')?.summary).toContain('Materials');
    expect(catalog.integrations.get('war-engineer-materials')?.createdEquipmentCapability).toBeUndefined();
  });
  it('preserves Wagon-wise as a bare Wise topic without inferred crafting capabilities', () => {
    expect(catalog.skills.get('wagon-wise')).toMatchObject({ coverage: 'complete', skillType: 'Special',
      rootRule: { kind: 'single', ability: { kind: 'stat', id: 'perception' } }, tools: { kind: 'none' },
      familyMembership: { familyId: 'wises', topicId: 'wagon' } });
  });
  it('preserves Waiting Tables guidance and direct Resources recovery without an invented context', () => {
    expect(catalog.skills.get('waiting-tables')).toMatchObject({ rootRule: { kind: 'single', ability: { kind: 'stat', id: 'will' } },
      skillType: 'Special', tools: { kind: 'none' }, resourceInteractions: [{ kind: 'recover-taxed-resources' }] });
    for (const row of ['sleepy cafe Ob 1', 'small bar Ob 2', 'busy restaurant Ob 3', 'royal table Ob 4', 'imperial table Ob 5'])
      expect(catalog.skills.get('waiting-tables')?.summary).toContain(row);
  });
  it.each(['village-secret', 'vine', 'vintage', 'visage'])('preserves %s-wise as an independent bare Wise topic', topic => {
    expect(catalog.skills.get(`${topic}-wise`)).toMatchObject({ coverage: 'complete', skillType: 'Special',
      rootRule: { kind: 'single', ability: { kind: 'stat', id: 'perception' } }, tools: { kind: 'none' },
      familyMembership: { familyId: 'wises', topicId: topic } });
  });
  it('preserves Vintner root, source wine guidance, workshop and FoRKs', () => {
    expect(catalog.skills.get('vintner')).toMatchObject({ rootRule: { kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'perception' }] },
      skillType: 'Peasant', tools: { kind: 'workshop' } });
    for (const row of ['swill Ob 1', 'drinkable Ob 2', 'good wine Ob 3', 'excellent wine Ob 4', 'legendary wine Ob 5'])
      expect(catalog.skills.get('vintner')?.summary).toContain(row);
    expect(catalog.skills.get('vintner')?.forkSuggestions?.suggestions).toEqual(['farming', 'brewer'].map(skillId => ({ target: { kind: 'skill', skillId } })));
  });
  it('preserves Ugly Truth guidance, Perception root and Duel of Wits reference', () => {
    expect(catalog.skills.get('ugly-truth')).toMatchObject({ skillType: 'Social', tools: { kind: 'none' },
      rootRule: { kind: 'single', ability: { kind: 'stat', id: 'perception' } }, integrationTags: ['duel-of-wits'] });
    for (const row of ['obvious worst outcome Ob 1', 'family Ob 2', 'friends Ob 3', 'complex politics Ob 4', 'nuanced/delicate situation Ob 5'])
      expect(catalog.skills.get('ugly-truth')?.summary).toContain(row);
    expect(catalog.skills.get('ugly-truth')?.forkSuggestions?.suggestions).toEqual(['falsehood', 'intimidation'].map(skillId => ({ target: { kind: 'skill', skillId } })));
  });
  it('preserves Vein-wise as a bare Wise topic without geological or stock restrictions', () => {
    expect(catalog.skills.get('vein-wise')).toMatchObject({ skillType: 'Special', tools: { kind: 'none' },
      rootRule: { kind: 'single', ability: { kind: 'stat', id: 'perception' } }, availabilityRestrictions: [],
      familyMembership: { familyId: 'wises', topicId: 'vein' } });
  });
  it('preserves Tracking, Trapper and Tree Cutting source roots, tools and guidance', () => {
    expect(catalog.skills.get('tracking')).toMatchObject({ rootRule: { kind: 'single', ability: { kind: 'stat', id: 'perception' } },
      skillType: 'Forester', tools: { kind: 'none' } });
    for (const row of ['fresh/soft ground Ob 1', 'common animal identification Ob 2', 'count on soft ground Ob 2',
      'fresh/hard ground Ob 3', 'creature weight Ob 4', 'soft ground after rain Ob 5', 'person by shoes Ob 6', 'hard ground after rain Ob 7'])
      expect(catalog.skills.get('tracking')?.summary).toContain(row);
    expect(catalog.skills.get('tracking')?.forkSuggestions?.suggestions).toEqual([{ target: { kind: 'skill', skillId: 'hunting' } }]);
    expect(catalog.skills.get('trapper')).toMatchObject({ rootRule: { kind: 'combined', abilities: [{ kind: 'stat', id: 'perception' }, { kind: 'stat', id: 'agility' }] },
      skillType: 'Forester', tools: { kind: 'generic', expendable: true } });
    for (const row of ['rabbits Ob 1', 'dogs/cats Ob 2', 'foxes/raccoons Ob 3', 'pit traps Ob 3', 'human snares Ob 4'])
      expect(catalog.skills.get('trapper')?.summary).toContain(row);
    expect(catalog.skills.get('tree-cutting')).toMatchObject({ rootRule: { kind: 'combined', abilities: [{ kind: 'stat', id: 'perception' }, { kind: 'stat', id: 'power' }] },
      skillType: 'Peasant', tools: { kind: 'generic' } });
    for (const row of ['deadwood Ob 1', 'small tree Ob 2', 'medium tree Ob 3', 'large tree Ob 4', 'stand Ob 5', 'copse Ob 6', 'forest Ob 10'])
      expect(catalog.skills.get('tree-cutting')?.summary).toContain(row);
  });
  it.each(['tragic-end', 'trails', 'treasure', 'tune'])('preserves %s-wise bare-topic identity', topic => {
    expect(catalog.skills.get(`${topic}-wise`)).toMatchObject({ rootRule: { kind: 'single', ability: { kind: 'stat', id: 'perception' } },
      skillType: 'Special', tools: { kind: 'none' }, familyMembership: { familyId: 'wises', topicId: topic } });
  });
  it('preserves Tree Pulling root, collective source tool label and exact guidance without consumption semantics', () => {
    expect(catalog.skills.get('tree-pulling')).toMatchObject({ rootRule: { kind: 'single', ability: { kind: 'attribute', id: 'hatred' } },
      skillType: 'Peasant', printedMarkers: ['§'], tools: { kind: 'specific-item', item: 'rope and goblins', expendable: true },
      availabilityRestrictions: [{ kind: 'stock-only', stockIds: ['orc'], scope: 'always' }] });
    for (const row of ['bush Ob 1', 'sapling Ob 2', 'young tree Ob 3', 'mature tree Ob 5', 'old redwood Ob 8', 'ancient magic tree Ob 10'])
      expect(catalog.skills.get('tree-pulling')?.summary).toContain(row);
  });
  it('does not invent a stock restriction for Troll Etiquette, Troll-wise or Tunnel-wise', () => {
    expect(catalog.skills.get('troll-etiquette')).toMatchObject({ skillType: 'Social', tools: { kind: 'none' }, availabilityRestrictions: [] });
    expect(catalog.skills.get('troll-wise')).toMatchObject({ skillType: 'Wise', tools: { kind: 'none' }, availabilityRestrictions: [] });
    expect(catalog.skills.get('tunnel-wise')).toMatchObject({ skillType: 'Special', tools: { kind: 'none' }, availabilityRestrictions: [] });
    expect(catalog.skills.get('troll-etiquette')?.forkSuggestions?.suggestions).toEqual(['troll-wise', 'intimidation'].map(skillId => ({ target: { kind: 'skill', skillId } })));
    expect(catalog.skills.get('troll-wise')?.forkSuggestions?.suggestions).toEqual([{ target: { kind: 'skill', skillId: 'troll-etiquette' } }]);
    expect(catalog.skills.get('tunnel-wise')?.forkSuggestions?.suggestions).toEqual(['excavation', 'mining'].map(skillId => ({ target: { kind: 'skill', skillId } })));
  });
  it('keeps Sword tool/weapon identity separate from its Fight reference', () => {
    expect(catalog.skills.get('sword')).toMatchObject({ skillType: 'Martial', tools: { kind: 'specific-item', item: 'sword' },
      rootRule: { kind: 'single', ability: { kind: 'stat', id: 'agility' } }, integrationTags: ['fight'] });
    expect(catalog.skills.get('sword')?.forkSuggestions?.suggestions).toEqual([
      { target: { kind: 'skill', skillId: 'boxing' } }, { target: { kind: 'skill', skillId: 'brawling' } },
      { target: { kind: 'category', category: 'melee-weapon', relevance: 'appropriate' } },
    ]);
  });
  it('preserves Symbology canonical spelling, nine guidance levels and explicit FoRK references', () => {
    expect(catalog.skills.get('symbology')).toMatchObject({ sourceName: 'Symbology', skillType: 'Academic',
      rootRule: { kind: 'single', ability: { kind: 'stat', id: 'perception' } }, tools: { kind: 'none' } });
    for (const row of ['common symbols Ob 1', 'common religious symbols Ob 2', 'common arcane symbols Ob 3',
      'obscure religious symbols Ob 4', 'foreign pictograms Ob 5', 'obscure arcane symbols Ob 6',
      'unknown religious symbols Ob 7', 'unknown arcane symbols Ob 8', 'truly alien symbology Ob 9']) {
      expect(catalog.skills.get('symbology')?.summary).toContain(row);
    }
    expect(catalog.skills.get('symbology')?.forkSuggestions?.suggestions).toEqual(
      ['ancient-history', 'obscure-history', 'doctrine', 'sorcery'].map(skillId => ({ target: { kind: 'skill', skillId } })));
  });
  it('scopes Tactics versus Observation to ambush and retains the separate Range and Cover use', () => {
    expect(catalog.skills.get('tactics')?.testProfile).toEqual({ kind: 'versus',
      opposingAbilities: [{ kind: 'skill', skillId: 'observation' }],
      context: { kind: 'circumstance', circumstanceId: 'setting-an-ambush' } });
    expect(catalog.skills.get('tactics')?.integrationTags).toEqual(['ambush', 'range-and-cover']);
    expect(catalog.integrations.get('tactics-field-maneuvers')?.context).toEqual({ kind: 'activity', activity: 'field-maneuver' });
  });
  it.each(['tall-grass', 'taskmaster', 'tavern-tales', 'terroir'])('keeps %s-wise as a bare Wise topic', topic => {
    expect(catalog.skills.get(`${topic}-wise`)).toMatchObject({ skillType: 'Special',
      rootRule: { kind: 'single', ability: { kind: 'stat', id: 'perception' } }, tools: { kind: 'none' },
      familyMembership: { familyId: 'wises', topicId: topic } });
  });
  it('preserves Tanner, Taxidermy and Theatrics source roots/types/tools and authored obstacle guidance', () => {
    expect(catalog.skills.get('tanner')).toMatchObject({ skillType: 'Craftsman', tools: { kind: 'workshop' },
      rootRule: { kind: 'combined', abilities: [{ kind: 'stat', id: 'agility' }, { kind: 'stat', id: 'forte' }] } });
    for (const row of ['belt Ob 1', 'cloak or boots Ob 2', 'satchel or gloves Ob 3', 'gambeson Ob 4', 'boiled reinforced leather armor Ob 5'])
      expect(catalog.skills.get('tanner')?.summary).toContain(row);
    expect(catalog.skills.get('taxidermy')).toMatchObject({ skillType: 'Medicinal', tools: { kind: 'generic' },
      rootRule: { kind: 'single', ability: { kind: 'stat', id: 'perception' } } });
    for (const row of ['rabbits/small game Ob 1', 'insects/fish Ob 2', 'fowl/large game Ob 3', 'aunt Ob 4',
      'exotic creatures Ob 4', 'monsters Ob 5', 'mythical/heroic beasts Ob 6', 'supernatural creatures Ob 7'])
      expect(catalog.skills.get('taxidermy')?.summary).toContain(row);
    expect(catalog.skills.get('theatrics')).toMatchObject({ skillType: 'Special', tools: { kind: 'generic' },
      rootRule: { kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'perception' }] } });
    for (const row of ['stage makeup Ob 1', 'simple masks Ob 2', 'androgynous gender disguise Ob 3'])
      expect(catalog.skills.get('theatrics')?.summary).toContain(row);
  });
  it('retains Threading Chant own tools/root and its source Sewing mechanics reference', () => {
    expect(catalog.skills.get('threading-chant')).toMatchObject({ skillType: 'Craftsman', tools: { kind: 'generic', expendable: true },
      rootRule: { kind: 'combined', abilities: [{ kind: 'stat', id: 'perception' }, { kind: 'stat', id: 'agility' }] },
      relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'sewing' } }],
      availabilityRestrictions: [{ kind: 'stock-only', stockIds: ['elf'], scope: 'always' }], printedMarkers: ['§'] });
  });
  it('keeps Throwing a Martial skill with a throwable object requirement and external combat uses', () => {
    expect(catalog.skills.get('throwing')).toMatchObject({ skillType: 'Martial', tools: { kind: 'specific-item', item: 'throwable-object' },
      rootRule: { kind: 'single', ability: { kind: 'stat', id: 'agility' } }, integrationTags: ['fight', 'range-and-cover'] });
    expect(catalog.skills.get('throwing')?.forkSuggestions?.suggestions).toEqual([{ target: { kind: 'skill', skillId: 'javelin' } }]);
  });
  it.each(['supplier', 'supply'])('preserves %s-wise as an independent bare Wise topic', topic => {
    expect(catalog.skills.get(`${topic}-wise`)).toMatchObject({ coverage: 'complete',
      rootRule: { kind: 'single', ability: { kind: 'stat', id: 'perception' } }, skillType: 'Special',
      tools: { kind: 'none', expendable: false }, familyMembership: { familyId: 'wises', topicId: topic } });
  });
  it('keeps Stentorious Singing canonical Advantage distinct from source target-group penalties', () => {
    const profile = catalog.skills.get('stentorious-singing')?.testProfile;
    expect(profile?.base).toEqual({ kind: 'target-ability-exponent', targetRole: 'listener', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' });
    expect(profile?.modifiers).toEqual([
      { effect: { kind: 'advantage', resolution: 'canonical' }, when: { kind: 'music-mood-suitability', relation: 'suitable' } },
      ...[[1, ['human', 'roden']], [2, ['orc', 'troll']], [3, ['elf', 'wolf']]].map(([delta, ids]) => ({
        effect: { kind: 'obstacle-modifier', delta }, when: { kind: 'anyOf', conditions: (ids as string[]).map(stockId => ({ kind: 'target-stock', stockId })) },
      })),
    ]);
    expect(catalog.skills.get('stentorious-singing')?.tools).toEqual({ kind: 'none', expendable: false });
  });
  it('keeps Stone Artifice resistance distinct from Stonecraft without inferring shared special rules', () => {
    expect(catalog.skills.get('stone-artifice')?.rootRule).toEqual({ kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'power' }] });
    expect(catalog.skills.get('stone-artifice')?.capabilities).toEqual([{ kind: 'subsystem-capability', id: 'structure-resistance', integrationId: 'stone-artifice-resistance' }]);
    expect(catalog.skills.get('stonecraft')?.rootRule).toEqual({ kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'agility' }] });
    expect(catalog.skills.get('stonecraft')?.capabilities).toEqual([]);
    expect(catalog.skills.get('stonecraft')?.relations).toEqual([]);
    expect(catalog.skills.get('stonecraft')?.summary).toContain('citadel Ob 10');
  });
  it('preserves later Strategy, Wise and Suasion source scopes', () => {
    expect(catalog.skills.get('strategy')?.testProfile).toEqual({ kind: 'versus', opposingAbilities: [{ kind: 'skill', skillId: 'strategy' }],
      context: { kind: 'circumstance', circumstanceId: 'versus-tests-between-commanders' } });
    expect(catalog.skills.get('strategy-games')?.tools).toEqual({ kind: 'specific-item', item: 'game' });
    expect(catalog.skills.get('strategy-games')?.testProfile).toEqual({ kind: 'versus', opposingAbilities: [{ kind: 'skill', skillId: 'strategy-games' }] });
    expect(catalog.skills.get('stuff-wise')).toMatchObject({ skillType: 'Wise',
      availabilityRestrictions: [{ kind: 'stock-only', stockIds: ['dwarf'], scope: 'character-burning' }] });
    for (const id of ['structural-weakness-wise', 'suicidal-bravery-wise']) expect(catalog.skills.get(id)?.skillType).toBe('Special');
    expect(catalog.skills.get('suasion')).toMatchObject({ openingRequirements: [], useRequirements: [], integrationTags: ['duel-of-wits'],
      relations: [{ kind: 'specialized-version', target: { kind: 'skill', id: 'persuasion' } }],
      testProfile: { kind: 'obstacle', base: { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' } } });
  });
  it('treats Stentorious Debate mouth wording as flavor without an enforceable tool or missing-tools penalty', () => {
    const skill = catalog.skills.get('stentorious-debate');
    expect(skill?.tools).toEqual({ kind: 'none', expendable: false });
    expect(skill?.summary).toContain('A big Dwarvy mouth');
    expect(skill?.summary).toContain('flavor');
    expect(skill?.openingRequirements).toEqual([]);
    expect(skill?.useRequirements).toEqual([]);
    expect(skill?.capabilities).toEqual([]);
    expect(skill?.relations).toEqual([]);
    expect(skill?.testProfile?.modifiers).toBeUndefined();
    expectTypeOf<Extract<ToolRequirement, { kind: 'anatomical-tool' }>>().toBeNever();
  });
  it('preserves Stentorious Debate source mechanics without importing the three compared skills', () => {
    expect(catalog.skills.get('stentorious-debate')).toMatchObject({
      rootRule: { kind: 'single', ability: { kind: 'stat', id: 'will' } }, skillType: 'Social', printedMarkers: ['§'],
      availabilityRestrictions: [{ kind: 'stock-only', stockIds: ['dwarf'], scope: 'always' }],
      forkSuggestions: { suggestions: [{ target: { kind: 'skill', skillId: 'oratory' } }] }, integrationTags: ['duel-of-wits'],
      testProfile: { kind: 'obstacle', base: { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' } },
    });
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)));
    expect(restored.skills.get('stentorious-debate')).toEqual(catalog.skills.get('stentorious-debate'));
  });
  it('preserves Sorcery use-only Gifted gating, source restrictions and following Wise defaults', () => {
    expect(catalog.skills.get('sorcery')).toMatchObject({ skillType: 'Sorcerous', rootRule: { kind: 'single', ability: { kind: 'stat', id: 'perception' } },
      openingRequirements: [], useRequirements: [{ kind: 'trait', id: 'gifted', use: 'spell-casting' }],
      availabilityRestrictions: [{ kind: 'stock-only', stockIds: ['human', 'roden'], scope: 'character-burning' }] });
    expect(catalog.skills.get('sorcery')?.forkSuggestions?.suggestions).toContainEqual({ target: { kind: 'unresolved-source-reference', sourceLabel: 'Astronomy' } });
    for (const topic of ['soot', 'sorcery', 'spiel']) expect(catalog.skills.get(`${topic}-wise`)).toMatchObject({
      skillType: 'Special', familyMembership: { familyId: 'wises', topicId: topic }, tools: { kind: 'none', expendable: false } });
    expect(catalog.skills.get('soothing-platitudes')?.testProfile?.base).toEqual({ kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' });
  });
  it('preserves source weapon/crafting distinctions without resolving Warcraft or inventing damage', () => {
    expect(catalog.skills.get('spear')?.summary).toContain('not a throwing skill');
    expect(catalog.skills.get('staff')?.tools).toEqual({ kind: 'specific-item', item: 'staff' });
    expect(catalog.skills.get('spearcraft')?.forkSuggestions?.suggestions).toContainEqual({ target: { kind: 'unresolved-source-reference', sourceLabel: 'Warcraft' } });
    expect(catalog.skills.get('spearcraft')?.rootRule).toEqual({ kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'agility' }] });
    expect(catalog.integrations.get('spearcraft-antiphon')?.createdItemReference).toEqual({ kind: 'antiphon-union', target: 'created-item', skillId: 'antiphon-union-training' });
    expect(catalog.integrations.get('starcraft-matrix')?.createdItemReference).toEqual({ kind: 'enchanting-matrix', target: 'created-item' });
    expect(catalog.skills.get('spider-husbandry')?.relations).toEqual([
      { kind: 'contextual-substitution', target: { kind: 'skill', id: 'instruction' }, context: { kind: 'subject', subject: 'spiders' } },
      { kind: 'contextual-substitution', target: { kind: 'skill', id: 'field-dressing' }, context: { kind: 'allOf', conditions: [
        { kind: 'subject', subject: 'spiders' }, { kind: 'activity', activity: 'wound-treatment' },
      ] } },
    ]);
  });
  it('preserves Stealthy Speed versus Observation and contextual canonical Advantage without fixed dice', () => {
    expect(catalog.skills.get('stealthy')?.rootRule).toEqual({ kind: 'single', ability: { kind: 'stat', id: 'speed' } });
    expect(catalog.skills.get('stealthy')?.testProfile).toEqual({ kind: 'versus', opposingAbilities: [{ kind: 'skill', skillId: 'observation' }],
      modifiers: [{ effect: { kind: 'advantage', resolution: 'canonical' }, when: { kind: 'anyOf', conditions: [
        { kind: 'circumstance', circumstanceId: 'light-conditions-favor-stealth' },
        { kind: 'circumstance', circumstanceId: 'weather-conditions-favor-stealth' },
        { kind: 'circumstance', circumstanceId: 'ground-conditions-favor-stealth' },
      ] } }] });
  });
  it('preserves later S Wise, Sleight of Hand and Slip of Currents identities and mechanics', () => {
    expect(catalog.skills.get('slave-deck-wise')?.familyMembership).toEqual({ familyId: 'wises', topicId: 'slave-deck' });
    expect(catalog.skills.get('sleight-of-hand')).toMatchObject({ rootRule: { kind: 'single', ability: { kind: 'stat', id: 'agility' } },
      skillType: 'Special', tools: { kind: 'none', expendable: false },
      testProfile: { kind: 'versus', opposingAbilities: [{ kind: 'skill', skillId: 'observation' }],
        context: { kind: 'circumstance', circumstanceId: 'picking-pockets-or-similar-legerdemain-on-victim' } } });
    expect(catalog.skills.get('slip-of-currents')).toMatchObject({ skillType: 'Seafarer', printedMarkers: ['§'],
      relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'navigation' } }] });
    expect(catalog.skills.get('slip-of-currents')?.forkSuggestions?.suggestions).toEqual([
      { target: { kind: 'unresolved-source-reference', sourceLabel: 'Rhyme of Rules' } },
      { target: { kind: 'skill', skillId: 'rhyme-of-the-mariner' } },
    ]);
  });
  it('preserves Smithcraft crafting capabilities, separate obstacle sources and external Antiphon use', () => {
    const craft = { kind: 'activity', activity: 'crafting' };
    for (const id of ['blacksmith', 'whitesmith', 'coppersmith']) {
      expect(catalog.skills.get('smithcraft')?.relations).toContainEqual({ kind: 'includes-capability', target: { kind: 'skill', id }, context: craft });
      expect(catalog.skills.get('smithcraft')?.relations).toContainEqual({ kind: 'obstacle-reference', targets: { kind: 'skill', skillId: id }, context: craft });
    }
    expect(catalog.skills.get('smithcraft')?.tools).toEqual({ kind: 'workshop' });
    expect(catalog.integrations.get('smithcraft-antiphon')?.createdItemReference).toEqual({ kind: 'antiphon-union', target: 'created-item', skillId: 'antiphon-union-training' });
    expect(catalog.integrations.get('smithcraft-antiphon')?.equipmentResult).toBeUndefined();
    expect(catalog.skills.get('soldiering')?.rootRule).toEqual({ kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'perception' }] });
  });
  it('preserves explicit song mechanics links without deriving a magical marker from their names', () => {
    for (const [id, target] of [['song-of-the-eldar', 'astrology'], ['song-of-feasting', 'cooking'],
      ['song-of-flocks-and-herds', 'animal-husbandry'], ['song-of-paths-and-ways', 'orienteering']]) {
      expect(catalog.skills.get(id)?.relations).toEqual([{ kind: 'same-mechanics', target: { kind: 'skill', id: target } }]);
    }
    expect(catalog.skills.get('song-of-the-eldar')).toMatchObject({ skillType: 'Academic', printedMarkers: [], rollBehavior: { kind: 'standard' } });
    expect(catalog.skills.get('song-of-feasting')?.tools).toEqual({ kind: 'generic', expendable: true });
    expect(catalog.skills.get('song-of-flocks-and-herds')?.tools).toEqual({ kind: 'none', expendable: false });
    expect(catalog.integrations.get('song-of-feasting-antiphon')?.summary).toContain('Lyric of Healing or Doom of Strength');
    expect(catalog.integrations.get('song-of-form-antiphon')?.summary).toContain('Alarm');
    expect(catalog.skills.get('song-of-paths-and-ways')?.forkSuggestions?.suggestions).toEqual([
      { target: { kind: 'unresolved-source-reference', sourceLabel: 'Weathersong' } },
      { target: { kind: 'unresolved-source-reference', sourceLabel: 'Rhyme of Rules' } },
    ]);
  });
  it('preserves Song of Lordship trait alternatives and independent Elven restriction', () => {
    expect(catalog.skills.get('song-of-lordship')?.relations).toEqual([{ kind: 'contextual-substitution',
      target: { kind: 'skill', id: 'etiquette' }, context: { kind: 'anyOf', conditions: [
        { kind: 'target-trait', traitId: 'etharchal' }, { kind: 'target-trait', traitId: 'fea' }, { kind: 'target-trait', traitId: 'aman' },
      ] } }]);
    expect(catalog.skills.get('song-of-lordship')?.availabilityRestrictions).toEqual([{ kind: 'stock-only', stockIds: ['elf'], scope: 'always' }]);
  });
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
  it('covers every canonical A–Z manifest entry with the correct record kind/name/page', () => {
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
    expect(catalog.integrations.get('white-metal-artifice-value')?.skillId).toBe('white-metal-artifice');
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
