import type { SkillIntegration } from '../types';
import { aptitudeTraining, combined, define, evidence, expendable, fork, forks, generic, guidance, item, magical, melee, none, only, sourceFork, stat, workshop } from './shared';

/** Reviewed S–Z records only; later entries remain identity references. */
export const sZSkills = [
  define('saddlery', 'Saddlery', 294, 'Make horse furniture from hides. Guidance: repairs Ob 1, riding saddle Ob 2, war saddle Ob 3, ornate saddle Ob 4, royal saddle Ob 5, howdah Ob 7.', {
    rootRule: combined('perception', 'agility'), skillType: 'Craftsman', tools: workshop, forkSuggestions: forks('tanner') }),
  define('saint-wise', 'Saint-wise', 294, 'Knowledge of saints.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'saint' } }),
  define('scavenging', 'Scavenging', 294, 'Search for a declared item type in a contextually suitable place, excluding specific or unique things; source categories guide obstacles.', {
    rootRule: stat('perception'), skillType: 'Peasant', tools: none,
    forkSuggestions: guidance(fork('foraging'), { target: { kind: 'skill-family', familyId: 'wises', relevance: 'appropriate' } }),
    procedures: [{ kind: 'item-search', request: { declaredBy: 'player', granularity: 'item-type',
      specificItemAllowed: false, uniqueItemAllowed: false, resolution: 'manual' },
      contextRequirement: { kind: 'suitable-location', purpose: 'scavenging', resolution: 'contextual',
        examplesPolicy: 'non-exhaustive', examples: ['midden', 'ruin', 'battlefield'] },
      obstacleGuidance: { kind: 'category-based', resolution: 'contextual', examplesPolicy: 'non-exhaustive', categories: [
        { id: 'detritus-or-junk', label: 'Detritus or junk', obstacle: 1, examples: ['rags', 'scraps'] },
        { id: 'common-household-goods', label: 'Common household goods', obstacle: 2, examples: ['clothing', 'food', 'cookware'] },
        { id: 'hard-to-find-items', label: 'Hard-to-find items', obstacle: 3, examples: ['medicine', 'weapons', 'tools'] },
        { id: 'valuable-items', label: 'Valuable items', obstacle: 4, examples: ['money', 'antiques'] },
        { id: 'rare-objects', label: 'Rare objects', obstacle: 5, examples: ['documents', 'books', 'specialized tools'] },
        { id: 'obscure-or-out-of-place-items', label: 'Obscure or out-of-place items', obstacle: 6, examples: ['oddities', 'head in a jar', 'crown'] },
      ] } }],
  }),
  define('sculpture', 'Sculpture', 294, 'Shape forms in clay or stone. Simple forms: clay Ob 1, soft stone Ob 2, hard stone Ob 3; complex forms use Ob 4/5/6 respectively.', {
    rootRule: combined('will', 'agility'), skillType: 'Artist', tools: generic, forkSuggestions: forks('mason', 'engraving') }),
  define('scutwork-wise', 'Scutwork-wise', 294, 'Knowledge of scutwork.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'scutwork' } }),
  define('seamanship', 'Seamanship', 294, 'Maintain shipboard life and equipment, short of sailing. Vessel guidance: rowboat/skiff Ob 1, longboat Ob 2, junk Ob 3, caravel Ob 4, carrack Ob 5, felucca Ob 6, treasure ship Ob 7.', {
    rootRule: stat('perception'), skillType: 'Seafaring', tools: none }),
  define('seduction', 'Seduction', 294, 'Use sexual desire or intention to obtain information or persuade action; intercourse is not required. Duel of Wits use remains external.', {
    rootRule: stat('will'), skillType: 'Social', tools: none, forkSuggestions: forks('persuasion', 'soothing-platitudes', 'poetry'), integrationTags: ['duel-of-wits'],
    testProfile: { kind: 'obstacle', base: { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' } } }),
  define('servant-wise', 'Servant-wise', 295, 'Knowledge of the Servants cult, its internal hierarchy, laws and customs.', {
    rootRule: stat('perception'), skillType: 'Wise', tools: none, availabilityRestrictions: only(['orc'], 'character-burning'),
    forkSuggestions: forks('great-and-black-wise'), familyMembership: { familyId: 'wises', topicId: 'servant' } }),
  define('sewing', 'Sewing', 295, 'Make and mend cloth garments and household textiles. Guidance: simple linens/sashes/scarves Ob 1, repair Ob 2, clothing Ob 3, fancy clothing Ob 4.', {
    rootRule: stat('agility'), skillType: 'Peasant', tools: expendable, forkSuggestions: guidance(sourceFork('Weaver', 'weaving'), fork('embroidery')) }),
  define('shield-training', 'Shield Training', 295, 'Training permits action-scoped shield defense and Block & Strike. A shield Strike uses separate acting ability choices; combat resolution stays external.', {
    rootRule: stat('agility'), skillType: 'Martial Training', tools: none, training: aptitudeTraining, printedMarkers: ['*'], integrationTags: ['fight'],
    capabilities: [{ kind: 'subsystem-capability', id: 'shield-use', integrationId: 'shield-training-use' }] }),
  define('ship-management', 'Ship Management', 295, 'Manage voyage supplies and cargo. Success avoids supply problems; failure causes a critical shortage with serious crew and morale consequences.', {
    rootRule: stat('perception'), skillType: 'Seafaring', tools: none, forkSuggestions: forks('accounting', 'logistics'),
    procedures: [{ kind: 'supply-management', success: { kind: 'no-supply-problem' },
      failure: { shortage: { kind: 'critical-supply-shortage', supplySelection: 'contextual', examplesPolicy: 'non-exhaustive',
        examples: ['food', 'water', 'medicine', 'lumber', 'ammunition'] }, consequences: [
        { kind: 'serious-complications', resolution: 'contextual' },
        { kind: 'crew-mortality', onset: 'begins', quantity: 'source-unspecified', timing: 'source-unspecified', cause: 'shortage-of-critical-supply' },
        { kind: 'morale-harm', magnitude: 'source-unspecified' },
      ] }, obstacleGuidance: { vessels: [
        { vessels: ['rowboat', 'skiff'], obstacle: 1 }, { vessels: ['longboat'], obstacle: 2 },
        { vessels: ['junk'], obstacle: 3 }, { vessels: ['caravel'], obstacle: 4 },
        { vessels: ['carrack'], obstacle: 5 }, { vessels: ['felucca'], obstacle: 6 }, { vessels: ['treasure-ship'], obstacle: 7 },
      ], journeyModifiers: [
        { journey: 'moderate', obstacleDelta: 1 }, { journey: 'long', obstacleDelta: 2 }, { journey: 'ocean-crossing', obstacleDelta: 3 },
      ] } }],
  }),
  define('ship-wise', 'Ship-wise', 295, 'Knowledge of ships.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'ship' } }),
  define('shipwright', 'Shipwright', 295, 'Design and construct seagoing vessels. Guidance: rowboat/skiff Ob 1, barge Ob 2, longboat Ob 3, cog/junk Ob 4, felucca/longship/galley Ob 5, carrack Ob 6, caravel Ob 8, treasure ship Ob 9.', {
    rootRule: stat('perception'), skillType: 'Craftsman', tools: workshop,
    forkSuggestions: guidance(sourceFork('Engineer', 'engineering'), sourceFork('Carpenter', 'carpentry'), fork('boatwright')) }),
  define('shortcut-wise', 'Shortcut-wise', 296, 'Knowledge of shortcuts.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'shortcut' } }),
  define('shrewd-appraisal', 'Shrewd Appraisal', 296, 'Identify item flaws to reduce its price by a source-unspecified amount. Guidance: Common goods Ob 2, Expensive goods Ob 3, Rare goods Ob 4, Unique goods Ob 5.', {
    rootRule: stat('perception'), skillType: 'Social', tools: none, ...magical, availabilityRestrictions: only(['dwarf']),
    forkSuggestions: guidance({ target: { kind: 'skill-family', familyId: 'wises', relevance: 'appropriate' } }, fork('haggling')),
    integrationTags: ['resources'], capabilities: [{ kind: 'subsystem-capability', id: 'appraised-item-price-reduction', integrationId: 'shrewd-appraisal-price-reduction' }] }),
  define('siege-engineer', 'Siege Engineer', 296, 'Build war machines that serve as tools for destroying structures. Building guidance: Simple ram or scaling ladder Ob 1, Metal-capped ram Ob 2, Covered ram or siege tower Ob 3, Massive traction trebuchet Ob 4, Massive metal-capped covered ram Ob 5.', {
    rootRule: stat('perception'), skillType: 'Artisan', tools: generic, forkSuggestions: forks('blacksmith', 'munitions', 'rude-carpentry'),
    availabilityRestrictions: only(['orc'], 'character-burning'), integrationTags: ['equipment'],
    capabilities: [{ kind: 'subsystem-capability', id: 'created-equipment-capability', integrationId: 'siege-engineer-output' }] }),
  define('signaling', 'Signaling', 296, 'Relay predetermined codes over distance with a specially designed signaling lantern or signal flags. Guidance: simple commands Ob 1, questions Ob 2, complicated orders Ob 3.', {
    rootRule: stat('perception'), skillType: 'Seafaring', tools: { kind: 'anyOf', requirements: [item('signaling-lantern'), item('signal-flags')] },
    forkSuggestions: forks('cryptography') }),
  define('silent-fury', 'Silent Fury', 296, 'An Elven captain intimidates with a glare, following Intimidation mechanics.', {
    rootRule: stat('will'), skillType: 'Social', tools: none, ...magical, availabilityRestrictions: only(['elf']),
    forkSuggestions: forks('paean-of-deeds'), relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'intimidation' } }],
    testProfile: { kind: 'obstacle', base: { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' } } }),
  define('silver-trumpet', 'Silver Trumpet', 296, 'Herald Elven dignitaries with silver trumpet calls. Guidance: morning Ob 1, danger/warning Ob 2, funerary Ob 3, arrival of Fea Ob 4, Song of the Aman Ob 5.', {
    rootRule: stat('will'), skillType: 'Musical', tools: item('elven-silver-trumpet'), availabilityRestrictions: only(['elf'], 'character-burning') }),
  define('sing', 'Sing', 297, 'Communicate and celebrate through voice and verse; soothe, invigorate or inform, convey ideas, or provide linked tests.', {
    rootRule: stat('will'), skillType: 'Musical', tools: none, forkSuggestions: forks('poetry'),
    testProfile: { kind: 'obstacle', base: { kind: 'target-ability-exponent', targetRole: 'listener', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' },
      modifiers: [{ effect: { kind: 'advantage', resolution: 'canonical' }, when: { kind: 'music-mood-suitability', relation: 'suitable' } }] } }),
  define('skirmish-tactics', 'Skirmish Tactics', 297, 'Cooperate in dispersed formations: same-team trained fighters may help each other on Range and Cover maneuver rolls, in a group of up to five skirmishers.', {
    rootRule: combined('will', 'perception'), skillType: 'Military Training', tools: none, training: aptitudeTraining, printedMarkers: ['*'],
    integrationTags: ['range-and-cover'], capabilities: [{ kind: 'subsystem-capability', id: 'skirmisher-help', integrationId: 'skirmish-help' }] }),
  define('slave-deck-wise', 'Slave Deck-wise', 297, 'Knowledge of slave decks.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'slave-deck' } }),
  define('sleight-of-hand', 'Sleight of Hand', 297, 'Perform small-object tricks or surreptitiously place/remove objects on a person. Guidance: simple card tricks Ob 1, parlor tricks Ob 2; victim-directed legerdemain uses a versus test.', {
    rootRule: stat('agility'), skillType: 'Special', tools: none,
    testProfile: { kind: 'versus', opposingAbilities: [{ kind: 'skill', skillId: 'observation' }],
      context: { kind: 'circumstance', circumstanceId: 'picking-pockets-or-similar-legerdemain-on-victim' } } }),
  define('slip-of-currents', 'Slip of Currents', 297, 'Elven sea navigation using Navigation mechanics.', {
    rootRule: stat('perception'), skillType: 'Seafarer', tools: none, ...magical, availabilityRestrictions: only(['elf']),
    forkSuggestions: guidance(sourceFork('Rhyme of Rules'), fork('rhyme-of-the-mariner')),
    relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'navigation' } }] }),
  { ...define('smithcraft', 'Smithcraft', 297, 'Fabricate metalwork using Blacksmith, Whitesmith or Coppersmith capabilities and their obstacle guidance. Antiphon enchantments remain external.', {
    rootRule: combined('will', 'agility'), skillType: 'Craftsman', tools: workshop, ...magical, availabilityRestrictions: only(['elf']),
    forkSuggestions: forks('gemcraft', 'jewelcraft', 'riddle-of-steel'),
    relations: ['blacksmith', 'whitesmith', 'coppersmith'].flatMap(id => [
      { kind: 'includes-capability' as const, target: { kind: 'skill' as const, id }, context: { kind: 'activity' as const, activity: 'crafting' as const } },
      { kind: 'obstacle-reference' as const, targets: { kind: 'skill' as const, skillId: id }, context: { kind: 'activity' as const, activity: 'crafting' as const } },
    ]), integrationTags: ['magic', 'equipment'], capabilities: [{ kind: 'subsystem-capability', id: 'smithcraft-antiphon', integrationId: 'smithcraft-antiphon' }] }),
    source: [evidence('Smithcraft', 297), evidence('Smithcraft continuation', 298)] },
  define('soldiering', 'Soldiering', 298, 'Manage routine soldiering duties. Guidance: marching Ob 1, latrines/foxholes Ob 2, forage/shelter Ob 3, procedure Ob 4, payment Ob 5.', {
    rootRule: combined('will', 'perception'), skillType: 'Military', tools: generic }),
  define('song-of-the-eldar', 'Song of the Eldar', 298, 'Study stellar cycles using Astrology mechanics; the source heading has no magical marker.', {
    rootRule: stat('perception'), skillType: 'Academic', tools: none, availabilityRestrictions: only(['elf']),
    forkSuggestions: guidance(sourceFork('Rhyme of Rules'), fork('slip-of-currents')),
    relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'astrology' } }] }),
  define('song-of-feasting', 'Song of Feasting', 298, 'Elven cooking through song. Antiphon Union with Lyric of Healing or Doom of Strength creates Elven Bread; spell and bread effects remain external.', {
    rootRule: combined('perception', 'agility'), skillType: 'Peasant', tools: expendable, ...magical, availabilityRestrictions: only(['elf']),
    forkSuggestions: guidance(sourceFork('Rhyme of Rules')), relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'cooking' } }],
    integrationTags: ['magic'], capabilities: [{ kind: 'subsystem-capability', id: 'song-of-feasting-antiphon', integrationId: 'song-of-feasting-antiphon' }] }),
  define('song-of-flocks-and-herds', 'Song of Flocks and Herds', 298, 'Elven animal husbandry through song, using Animal Husbandry mechanics.', {
    rootRule: stat('will'), skillType: 'Peasant', tools: none, ...magical, availabilityRestrictions: only(['elf']),
    forkSuggestions: guidance(sourceFork('Rhyme of Rules')), relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'animal-husbandry' } }] }),
  define('song-of-form', 'Song of Form', 298, 'Shape stone through song. Guidance: simple shape Ob 1, crude mimicry Ob 2, anatomical approximation Ob 3, expressionistic depiction Ob 5. Statue enchantments remain external.', {
    rootRule: stat('will'), skillType: 'Artist', tools: generic, ...magical, availabilityRestrictions: only(['elf']),
    forkSuggestions: forks('stonecraft', 'gemcraft'), integrationTags: ['magic'],
    capabilities: [{ kind: 'subsystem-capability', id: 'song-of-form-antiphon', integrationId: 'song-of-form-antiphon' }] }),
  define('song-of-lordship', 'Song of Lordship', 299, 'Elven rulership etiquette among characters with the Etharchal, Fea or Aman traits.', {
    rootRule: stat('will'), skillType: 'Social', tools: none, ...magical, availabilityRestrictions: only(['elf']), forkSuggestions: forks('code-of-citadels', 'etiquette'),
    relations: [{ kind: 'contextual-substitution', target: { kind: 'skill', id: 'etiquette' }, context: { kind: 'anyOf', conditions: [
      { kind: 'target-trait', traitId: 'etharchal' }, { kind: 'target-trait', traitId: 'fea' }, { kind: 'target-trait', traitId: 'aman' },
    ] } }] }),
  define('song-of-paths-and-ways', 'Song of Paths and Ways', 299, 'Elven Orienteering through song.', {
    rootRule: stat('perception'), skillType: 'Forester', tools: none, ...magical, availabilityRestrictions: only(['elf']),
    forkSuggestions: guidance(sourceFork('Weathersong'), sourceFork('Rhyme of Rules')),
    relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'orienteering' } }] }),
  define('song-of-soothing', 'Song of Soothing', 299, 'Treat injuries using Herbalism mechanics; poison treatment follows three separate source procedures without automatic penalty calculation.', {
    rootRule: combined('will', 'perception'), skillType: 'Medicinal', tools: generic, ...magical, availabilityRestrictions: only(['elf']),
    relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'herbalism' }, context: { kind: 'activity', activity: 'wound-treatment' } }],
    integrationTags: ['injury'], capabilities: [{ kind: 'subsystem-capability', id: 'poison-treatment', integrationId: 'song-of-soothing-treatment' }] }),
  define('soot-wise', 'Soot-wise', 299, 'Knowledge of soot.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'soot' } }),
  define('soothing-platitudes', 'Soothing Platitudes', 299, 'Placate anger through flattering but insubstantial speech.', {
    rootRule: stat('will'), skillType: 'Social', tools: none, forkSuggestions: forks('persuasion', 'falsehood'),
    testProfile: { kind: 'obstacle', base: { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' } } }),
  define('sorcery', 'Sorcery', 299, 'Understand written or spoken magical formulae; Gifted permits translating them into cast spells. Spell creation and Sorcery rules remain external.', {
    rootRule: stat('perception'), skillType: 'Sorcerous', tools: none, ...magical,
    availabilityRestrictions: only(['human', 'roden'], 'character-burning'), useRequirements: [{ kind: 'trait', id: 'gifted', use: 'spell-casting' }],
    forkSuggestions: guidance(fork('astrology'), sourceFork('Astronomy'), fork('alchemy'), fork('aura-reading'), fork('empyrealia'), fork('demonology')), integrationTags: ['magic'] }),
  define('sorcery-wise', 'Sorcery-wise', 299, 'Knowledge of sorcery.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'sorcery' } }),
  define('spear', 'Spear', 300, 'Fight with spears, lances or pikes by slashing, thrusting or smashing; this is not a throwing skill. Resolution uses Fight.', {
    rootRule: stat('agility'), skillType: 'Martial', tools: none, semanticCategories: ['melee-weapon'],
    forkSuggestions: guidance(fork('martial-arts'), fork('boxing'), melee), integrationTags: ['fight'] }),
  define('spearcraft', 'Spearcraft', 300, 'Make and repair spears; Antiphon Union can enchant them. Guidance: ordinary reshaft Ob 1, ordinary spear Ob 2, javelins/Elven reshaft Ob 3, superior javelins Ob 4, Elven spear Ob 5.', {
    rootRule: combined('will', 'agility'), skillType: 'Craftsman', tools: generic, ...magical, availabilityRestrictions: only(['elf']),
    forkSuggestions: guidance(fork('riddle-of-steel'), fork('smithcraft'), fork('woodcraft'), sourceFork('Warcraft')), integrationTags: ['magic'],
    capabilities: [{ kind: 'subsystem-capability', id: 'spearcraft-antiphon', integrationId: 'spearcraft-antiphon' }] }),
  define('spider-husbandry', 'Spider Husbandry', 300, 'Raise and train spiders, substituting for Instruction or Field Dressing in their respective spider contexts. Training guidance: ordinary spiders Ob 1, Great Orb Weaver Ob 2, Great Master of the Hunt Ob 3, Sea Lord Ob 4, Great Undernest spider Ob 5; wound guidance remains in Anatomy of Injury.', {
    rootRule: stat('will'), skillType: 'Peasant', tools: expendable, availabilityRestrictions: only(['orc'], 'character-burning'),
    forkSuggestions: forks('animal-husbandry'), integrationTags: ['injury'], relations: [
      { kind: 'contextual-substitution', target: { kind: 'skill', id: 'instruction' }, context: { kind: 'subject', subject: 'spiders' } },
      { kind: 'contextual-substitution', target: { kind: 'skill', id: 'field-dressing' }, context: { kind: 'allOf', conditions: [
        { kind: 'subject', subject: 'spiders' }, { kind: 'activity', activity: 'wound-treatment' },
      ] } },
    ] }),
  define('spiel-wise', 'Spiel-wise', 300, 'Knowledge of spiel.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'spiel' } }),
  define('staff', 'Staff', 300, 'Use a staff as a walking aid or a weapon.', {
    rootRule: stat('agility'), skillType: 'Martial', tools: item('staff'), semanticCategories: ['melee-weapon'], integrationTags: ['fight'],
    forkSuggestions: guidance(fork('brawling'), fork('boxing'), { target: { kind: 'category', category: 'melee-weapon', relevance: 'any' } }) }),
  define('starcraft', 'Starcraft', 300, 'Craft crystalline orbs suitable as Enchanting vessels. Guidance: marble Ob 1, prism Ob 2, ball Ob 3, lens Ob 4, Silmaril Ob 5; Mornsong is an external enchanting example.', {
    rootRule: combined('will', 'agility'), skillType: 'Artisan', tools: workshop, ...magical, availabilityRestrictions: only(['elf']),
    forkSuggestions: forks('gemcraft', 'jewelcraft'), integrationTags: ['magic'],
    capabilities: [{ kind: 'subsystem-capability', id: 'starcraft-matrix', integrationId: 'starcraft-matrix' }] }),
  define('stealthy', 'Stealthy', 301, 'Move undetected using camouflage and surroundings; light, weather and ground can provide canonical Advantage, resolved contextually.', {
    rootRule: stat('speed'), skillType: 'Forester', tools: none,
    testProfile: { kind: 'versus', opposingAbilities: [{ kind: 'skill', skillId: 'observation' }],
      modifiers: [{ effect: { kind: 'advantage', resolution: 'canonical' }, when: { kind: 'anyOf', conditions: [
        { kind: 'circumstance', circumstanceId: 'light-conditions-favor-stealth' },
        { kind: 'circumstance', circumstanceId: 'weather-conditions-favor-stealth' },
        { kind: 'circumstance', circumstanceId: 'ground-conditions-favor-stealth' },
      ] } }] } }),
];

export const sZIntegrations: readonly SkillIntegration[] = [
  { id: 'spearcraft-antiphon', skillId: 'spearcraft', subsystem: 'magic',
    createdItemReference: { kind: 'antiphon-union', target: 'created-item', skillId: 'antiphon-union-training' },
    summary: 'Antiphon Union can enchant created spears; no spear enchantment mechanics are specified here.', source: [evidence('Spearcraft', 300)] },
  { id: 'starcraft-matrix', skillId: 'starcraft', subsystem: 'magic',
    createdItemReference: { kind: 'enchanting-matrix', target: 'created-item' },
    summary: 'All Starcraft crystals are suitable Enchanting vessels; Mornsong is an external light-bearing example, not an inline spell definition.', source: [evidence('Starcraft', 300)] },
  { id: 'song-of-soothing-treatment', skillId: 'song-of-soothing', subsystem: 'injury',
    poisonTreatment: { kind: 'poison-treatment', branches: [
      { poisonEffectKind: 'injury', obstacle: { kind: 'procedure-reference', skillId: 'herbalism', procedure: 'wound-treatment', input: 'caused-wound' },
        onSuccess: { kind: 'halve-die-penalty', target: 'poison-caused-die-penalties', rounding: 'up' } },
      { poisonEffectKind: 'obstacle-penalty', obstacle: { kind: 'current-penalty', penaltyKind: 'obstacle' },
        onExtraSuccesses: { kind: 'reduce-obstacle-penalty', basis: 'successes-over-obstacle', rate: 'source-unspecified' } },
      { poisonEffectKind: 'direct-dice-subtraction', obstacle: { kind: 'double-current-dice-subtraction' },
        onExtraSuccesses: { kind: 'restore-dice', dicePerSuccessOverObstacle: 1 } },
    ] }, summary: 'Deadly Venom is an injury-poison example. Three treatment cases remain distinct; half/round-up is preserved without settling more detailed arithmetic semantics.',
    source: [evidence('Song of Soothing', 299)] },
  { id: 'smithcraft-antiphon', skillId: 'smithcraft', subsystem: 'magic',
    createdItemReference: { kind: 'antiphon-union', target: 'created-item', skillId: 'antiphon-union-training' },
    summary: 'With Antiphon Union: Gift of Speed on horseshoes; Lay of the Horse on a whistle; Air of Gates on a headband; Voice of Ages on a clasp. Effects belong to the external spell-song subsystem.',
    source: [evidence('Smithcraft', 297), evidence('Smithcraft continuation', 298)] },
  { id: 'song-of-feasting-antiphon', skillId: 'song-of-feasting', subsystem: 'magic',
    createdItemReference: { kind: 'antiphon-union', target: 'created-item', skillId: 'antiphon-union-training' },
    summary: 'Antiphon Union with Lyric of Healing or Doom of Strength produces Elven Bread; no bread mechanics are specified by this entry.',
    source: [evidence('Song of Feasting', 298)] },
  { id: 'song-of-form-antiphon', skillId: 'song-of-form', subsystem: 'magic',
    createdItemReference: { kind: 'antiphon-union', target: 'created-item', skillId: 'antiphon-union-training' },
    summary: 'Antiphon Union plus Alarm creates a warding statue; Discerner and Voice of Ages create a statue that speaks of deceit; Voice of Ages and Strain of Farsight create one that sees and speaks of distant lands. Spell execution remains external.',
    source: [evidence('Song of Form', 298)] },
  { id: 'skirmish-help', skillId: 'skirmish-tactics', subsystem: 'range-and-cover', cooperation: { kind: 'cooperation',
      appliesTo: { kind: 'external-subsystem-roll', subsystem: 'range-and-cover', roll: 'maneuver' },
      participants: { roles: ['helper', 'recipient'],
        requirement: { kind: 'known-training', skillId: 'skirmish-tactics', appliesTo: 'each-participant' },
        relationship: { team: 'same' }, maxParticipants: 5 } },
    summary: 'Same-team participants each need the Training; at most five skirmishers cooperate on maneuver rolls, without a specified dice contribution.',
    source: [evidence('Skirmish Tactics', 297)] },
  { id: 'siege-engineer-output', skillId: 'siege-engineer', subsystem: 'equipment',
    createdEquipmentCapability: { kind: 'created-equipment-capability',
      output: { kind: 'created-equipment', equipmentKindId: 'war-machine' },
      capability: { kind: 'counts-as-tool', purpose: 'destroying-structures' } },
    summary: 'Completed war machines serve as tools for destroying structures; construction tools and downstream operation remain separate.',
    source: [evidence('Siege Engineer', 296)] },
];
