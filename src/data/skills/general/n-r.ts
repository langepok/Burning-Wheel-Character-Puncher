import type { SkillIntegration } from '../types';
import { combined, define, forks, fork, guidance, sourceFork, generic, none, only, stat, workshop, magical, evidence, expendable, hatred } from './shared';

/** Reviewed N–R entries only; later records remain identity references. */
export const nRSkills = [
  define('name-ritual', 'Name Ritual', 285, 'An Orc naming ritual; success gives the target a name and reputation, while failure denies naming and gives infamy.', {
    rootRule: combined('will', 'perception'), skillType: 'Special', tools: none,
    availabilityRestrictions: only(['orc'], 'character-burning'), forkSuggestions: forks('orc-wise'),
    testProfile: { kind: 'obstacle', base: { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' },
      outcomes: [
        { trigger: { kind: 'success' }, effects: [
          { kind: 'name-bestowal', recipient: 'target' },
          { kind: 'reputation', recipient: 'target', reputationKind: 'ordinary', dice: { kind: 'fixed', value: 1 } },
        ] },
        { trigger: { kind: 'failure' }, effects: [
          { kind: 'name-bestowal-denied', recipient: 'target' },
          { kind: 'reputation', recipient: 'target', reputationKind: 'infamous', dice: { kind: 'unspecified' } },
        ] },
      ] } }),
  define('navigation', 'Navigation', 285, 'Guide ships using star, wind and current charts, including open-sea journeys.', {
    rootRule: stat('perception'), skillType: 'Seafaring', tools: generic, forkSuggestions: forks('astrology', 'orienteering', 'pilot') }),
  { ...define('nogger', 'Nogger', 285, 'Brew restorative Dwarven nog; effects of drinking the result belong to equipment integration.', {
    rootRule: combined('will', 'perception'), skillType: 'Craftsman', tools: workshop, ...magical,
    availabilityRestrictions: only(['dwarf']), forkSuggestions: forks('grain-appraisal'), integrationTags: ['equipment'],
    capabilities: [{ kind: 'subsystem-capability', id: 'nogger-consumption', integrationId: 'nogger-consumption' }] }),
    source: [evidence('Nogger', 285), evidence('Nogger continuation', 286)] },
  define('oath-wise', 'Oath-wise', 286, 'Knowledge of oaths.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'oath' } }),
  define('obligation-wise', 'Obligation-wise', 286, 'Knowledge of obligations.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'obligation' } }),
  define('obscure-text-wise', 'Obscure Text-wise', 286, 'Knowledge of obscure texts.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'obscure-text' } }),
  define('observation', 'Observation', 286, 'Detect hidden characters, traps or ghosts; this does not replace ordinary Perception tests, though specific spells/traits may permit Perception to act as Observation.', {
    rootRule: stat('perception'), skillType: 'Forester', tools: none,
    testProfile: { kind: 'versus', opposingAbilities: [
      { kind: 'skill', skillId: 'inconspicuous' }, { kind: 'skill', skillId: 'stealthy' },
      { kind: 'skill', skillId: 'sleight-of-hand' }, { kind: 'skill', skillId: 'trapper' },
    ] } }),
  define('oratory', 'Oratory', 286, 'Rouse a crowd through speeches; also used in Duel of Wits, whose rules remain external.', {
    rootRule: stat('will'), skillType: 'Social', tools: none, forkSuggestions: forks('command', 'persuasion', 'rhetoric'),
    integrationTags: ['duel-of-wits'], testProfile: { kind: 'obstacle', base: {
      kind: 'crowd-ability-exponent', ability: { kind: 'stat', id: 'will' }, statistic: 'most-common', snapshot: 'current' } } }),
  define('orc-wise', 'Orc-wise', 286, 'Knowledge of Orcs.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'orc' } }),
  define('ore-wise', 'Ore-wise', 286, 'Knowledge of ore.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'ore' } }),
  define('orienteering', 'Orienteering', 286, 'Navigate overland with or without maps. Compass guidance: familiar/day Ob 1, familiar/night Ob 2, unfamiliar Ob 3, unfamiliar/night Ob 4, familiar/storm Ob 5, storm/night Ob 6.', {
    rootRule: stat('perception'), skillType: 'Forester', tools: none, forkSuggestions: forks('navigation'),
    testProfile: { kind: 'contextual',
      modifiers: [{ effect: { kind: 'dice-bonus', dice: 1 }, when: { kind: 'circumstance', circumstanceId: 'using-map' } }],
      outcomes: [
        { trigger: { kind: 'success' }, effects: [{ kind: 'journey-navigation', recipient: 'primary-actor',
          result: 'intended-destination', delay: 'none' }] },
        { trigger: { kind: 'failure' }, effects: [{ kind: 'journey-navigation', recipient: 'travelling-party', state: 'lost',
          alternatives: [{ arrival: 'intended-destination', appointments: 'missed-if-applicable' }, { arrival: 'unintended-location' }] }] },
      ] } }),
  define('paean-of-deeds', 'Paean of Deeds', 287, 'An Elven song announcing confident arrival, using Conspicuous mechanics.', {
    rootRule: stat('will'), skillType: 'Social', tools: none, ...magical, availabilityRestrictions: only(['elf']),
    forkSuggestions: forks('silent-fury'), relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'conspicuous' } }] }),
  define('painting', 'Painting', 287, 'Paint images on surfaces. Guidance: simple monochrome Ob 1, caricature Ob 2, complex monochrome/simple polychrome Ob 3, likeness Ob 4, complex polychrome Ob 5; wet plaster adds 1 Ob.', {
    rootRule: combined('will', 'agility'), skillType: 'Artist', tools: expendable, forkSuggestions: forks('illuminations'),
    testProfile: { kind: 'contextual', modifiers: [{ effect: { kind: 'obstacle-modifier', delta: 1 },
      when: { kind: 'circumstance', circumstanceId: 'painting-on-wet-plaster' } }] } }),
  define('pattern-wise', 'Pattern-wise', 287, 'Knowledge of patterns.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'pattern' } }),
  define('personal-effects-wise', 'Personal Effects-wise', 287, 'Knowledge of personal effects.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'personal-effects' } }),
  define('persuasion', 'Persuasion', 287, 'Convince another to act on your behalf, often through agreements or a carefully framed suggestion.', {
    rootRule: stat('will'), skillType: 'Social', tools: none, forkSuggestions: forks('falsehood', 'haggling', 'soothing-platitudes', 'ugly-truth'),
    testProfile: { kind: 'obstacle', base: { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' } } }),
  define('philosophy', 'Philosophy', 287, 'Discuss wisdom and the divine. Guidance: sacred object Ob 2, school symbols Ob 3, social futility Ob 4, a summoned demon\'s original purpose Ob 5, divine mystery Ob 6, explaining angel counts to a child Ob 10.', {
    rootRule: combined('will', 'perception'), skillType: 'School of Thought', tools: none,
    forkSuggestions: guidance(fork('doctrine'), fork('rule-of-law'), { target: { kind: 'skill-family', familyId: 'history', relevance: 'any' } }) }),
  define('pilgrimage-wise', 'Pilgrimage-wise', 287, 'Knowledge of pilgrimages.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'pilgrimage' } }),
  define('pilot', 'Pilot', 288, 'Steer ships. Port guidance: large Ob 1, busy Ob 2, small/busy Ob 3; narrow/shallow channels Ob 4, dangerous waters Ob 5.', {
    rootRule: combined('perception', 'power'), skillType: 'Seafaring', tools: none, forkSuggestions: forks('navigation') }),
  define('playwright', 'Playwright', 288, 'Compose scripts for stage performance. Genre guidance: religion/farce Ob 1, history/drama Ob 2, tragedy Ob 3, comedy Ob 4.', {
    rootRule: combined('will', 'perception'), skillType: 'Academic', tools: expendable,
    openingRequirements: [{ kind: 'known-skill', skillId: 'write' }], forkSuggestions: forks('composition', 'obscure-history', 'philosophy') }),
  define('plumbing', 'Plumbing', 288, 'Design water conveyance. Guidance: well Ob 1, troughs/ducts Ob 2, pump Ob 3, plumbing Ob 4, hot/cold running water Ob 5.', {
    rootRule: stat('perception'), skillType: 'Artisan', tools: generic }),
  define('poetry', 'Poetry', 288, 'Express ideas in verse. Guidance: crude verse Ob 1, atmosphere Ob 2, sorrow/tragedy Ob 3, love Ob 4, life truths/mysteries Ob 5.', {
    rootRule: stat('will'), skillType: 'Musical', tools: none, forkSuggestions: forks('sing'),
    testProfile: { kind: 'contextual', modifiers: [{ effect: { kind: 'obstacle-modifier', delta: 1 },
      when: { kind: 'circumstance', circumstanceId: 'mimicking-another-poets-style' } }] } }),
  define('poison-wise', 'Poison-wise', 288, 'Knowledge of poisons.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'poison' } }),
  define('poisonous-platitudes', 'Poisonous Platitudes', 288, 'Orc flattery combining Persuasion and Soothing Platitudes; Duel of Wits execution remains external.', {
    rootRule: hatred, skillType: 'Social', tools: none, printedMarkers: ['§'], rollBehavior: { kind: 'open-ended', basis: 'attribute-root' },
    availabilityRestrictions: only(['orc']), forkSuggestions: forks('falsehood', 'persuasion'), integrationTags: ['duel-of-wits'],
    relations: ['persuasion', 'soothing-platitudes'].map(id => ({ kind: 'includes-capability', target: { kind: 'skill', id } })),
    testProfile: { kind: 'obstacle', base: { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' } } }),
  { ...define('poisons', 'Poisons', 288, 'Make harmful products from botanical, mineral and animal ingredients; product effects and delivery costs are equipment metadata.', {
    rootRule: stat('perception'), skillType: 'Special', tools: expendable,
    forkSuggestions: guidance(fork('herbalism'), fork('apothecary'), sourceFork('Alchemical', 'alchemy')),
    integrationTags: ['equipment', 'poisons'], capabilities: [{ kind: 'subsystem-capability', id: 'crafted-poison', integrationId: 'poisons-crafted-product' }] }),
    source: [evidence('Poisons', 288), evidence('Poisons continuation', 289)] },
  { ...define('polearm', 'Polearm', 289, 'One weapon with a cutting blade or thrusting beak/tip; uses have distinct external combat profiles.', {
    rootRule: combined('power', 'agility'), skillType: 'Martial', tools: { kind: 'anyOf', requirements: [
      { kind: 'specific-item', item: 'halberd' }, { kind: 'specific-item', item: 'glaive' }, { kind: 'specific-item', item: 'voulge' }] },
    forkSuggestions: forks('spear', 'axe'), integrationTags: ['fight', 'equipment'],
    combatUseChoice: { kind: 'combat-use-choice', weaponIdentity: 'shared-physical-item', selection: 'per-combat-use', options: [
      { id: 'cutting', combatProfileRef: { kind: 'external-combat-profile', subsystem: 'fight', catalog: 'weapon-appendix',
        id: 'polearm-axe-strike', sourceName: 'Polearm Axe Strike' } },
      { id: 'thrusting', combatProfileRef: { kind: 'external-combat-profile', subsystem: 'fight', catalog: 'weapon-appendix',
        id: 'polearm-thrust', sourceName: 'Polearm Thrust' } },
    ] } }), source: [evidence('Polearm', 289), evidence('Weapons Appendix: Polearm Axe Strike / Polearm Thrust', 554)] },
  define('potter', 'Potter', 289, 'Make fired-clay vessels. Guidance: simple cups/bowls Ob 1, amphorae/small figures Ob 2, tea set/lamp Ob 3, cookware/tiles Ob 4, large grain jars Ob 5.', {
    rootRule: combined('perception', 'agility'), skillType: 'Craftsman', tools: expendable }),
  define('prospecting', 'Prospecting', 289, 'Find mineral and metal deposits. Guidance: salt Ob 1, copper/lead Ob 2, iron Ob 3, silver Ob 4, gold Ob 5, gemstones Ob 6.', {
    rootRule: stat('perception'), skillType: 'Artisan', tools: none,
    forkSuggestions: guidance({ target: { kind: 'skill-family', familyId: 'wises', relevance: 'appropriate' } }, fork('mining'), fork('mason')) }),
  define('protector-wise', 'Protector-wise', 289, 'Knowledge of protectors.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'protector' } }),
  define('purple-song', 'Purple Song', 289, 'Make Elven wine, comparable to Tinkersmend; a century of ageing is routine. Wine quality guidance spans Ob 1–6.', {
    rootRule: combined('perception', 'agility'), skillType: 'Peasant', tools: workshop, ...magical, availabilityRestrictions: only(['elf']),
    forkSuggestions: guidance(fork('grain-song'), sourceFork('Rhyme of Rules')), integrationTags: ['magic'],
    capabilities: [{ kind: 'subsystem-capability', id: 'purple-song-antiphon', integrationId: 'purple-song-antiphon' }] }),
  define('ratiquette', 'Ratiquette', 289, 'Use instead of Etiquette with rats and their relatives. Rat hierarchy guidance: house Ob 1, ship Ob 2, granary Ob 3, king Ob 4, queen Ob 5, queen mother Ob 6.', {
    rootRule: stat('will'), skillType: 'Social', tools: none, forkSuggestions: forks('etiquette'),
    relations: [{ kind: 'contextual-substitution', target: { kind: 'skill', id: 'etiquette' }, context: { kind: 'subject', subject: 'rats-and-relatives' } }] }),
  define('read', 'Read', 290, 'Read independently of writing. Guidance: sign/note Ob 1, letter Ob 2, article/essay Ob 3, book Ob 4, contract Ob 5.', {
    rootRule: stat('perception'), skillType: 'Academic', tools: none, forkSuggestions: forks('research'), capabilities: [{ kind: 'literacy', actions: ['read'] }],
    testProfile: { kind: 'contextual', modifiers: [{ effect: { kind: 'obstacle-modifier', delta: 1 }, when: { kind: 'circumstance', circumstanceId: 'reading-silently' } }] } }),
  define('reason-of-old-stone', 'Reason of Old Stone', 290, 'Discern stone history. Guidance: type Ob 1, age Ob 2, time in place Ob 3, recent marked/unmarked events Ob 4/5, past marked/unmarked events Ob 6/7.', {
    rootRule: stat('will'), skillType: 'Sorcerous', tools: none, ...magical, availabilityRestrictions: only(['dwarf']) }),
  define('religious-diatribe', 'Religious Diatribe', 290, 'An angry religious specialization of Oratory, also used in Duel of Wits.', {
    rootRule: stat('will'), skillType: 'Social', tools: none, integrationTags: ['duel-of-wits'],
    relations: [{ kind: 'specialized-version', target: { kind: 'skill', id: 'oratory' } }],
    testProfile: { kind: 'obstacle', base: { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' } } }),
  define('reputation-wise', 'Reputation-wise', 290, 'Knowledge of reputations.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'reputation' } }),
  define('research', 'Research', 290, 'Gather and collate library information. Guidance: common knowledge Ob 1, interesting facts Ob 2, native-text synthesis Ob 3, native handwritten work Ob 4, obscure handwritten subject Ob 5, previously unknown subject Ob 6.', {
    rootRule: stat('perception'), skillType: 'Academic', tools: none,
    forkSuggestions: guidance({ target: { kind: 'skill-family', familyId: 'history', relevance: 'any' } }, fork('ancient-history'), fork('obscure-history')) }),
  define('rhetoric', 'Rhetoric', 290, 'Present ideas to win arguments; Duel of Wits execution remains external.', {
    rootRule: stat('perception'), skillType: 'Academic', tools: none, forkSuggestions: forks('oratory', 'soothing-platitudes', 'ugly-truth'), integrationTags: ['duel-of-wits'],
    testProfile: { kind: 'obstacle', base: { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'perception' }, snapshot: 'current' } } }),
  define('rhyme-of-the-gatherer', 'Rhyme of the Gatherer', 291, 'Elven foraging through knowledge of plants, herbs and roots.', {
    rootRule: stat('perception'), skillType: 'Peasant', tools: none, ...magical, availabilityRestrictions: only(['elf']),
    forkSuggestions: guidance(fork('round-of-harvest'), sourceFork('Rhyme of Rules')),
    relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'foraging' } }] }),
  define('rhyme-of-the-mariner', 'Rhyme of the Mariner', 291, 'Elven rigging songs addressing wind, cloth and rope.', {
    rootRule: combined('agility', 'speed'), skillType: 'Seafarer', tools: none, ...magical, availabilityRestrictions: only(['elf']), forkSuggestions: forks('rope-chant'),
    relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'rigging' } }] }),
  define('rhyme-of-the-pathfinder', 'Rhyme of the Pathfinder', 291, 'An Elven tracking song.', {
    rootRule: stat('perception'), skillType: 'Forester', tools: none, ...magical, availabilityRestrictions: only(['elf']),
    forkSuggestions: guidance(fork('song-of-paths-and-ways'), sourceFork('Rhyme of Rules')),
    relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'tracking' } }] }),
  define('rhythm-of-the-city-wise', 'Rhythm of the City-wise', 291, 'Knowledge of city rhythms.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'rhythm-of-the-city' } }),
  define('riddle-of-steel', 'Riddle of Steel', 291, 'Make Elven blades, axes and arrowheads; spearheads follow separate Spearbearer rites. Guidance: ordinary knife/bodkin Ob 1, ordinary sword/axe/hunting arrow Ob 2, Elven knife/leaf arrow Ob 3, superior sword/axe Ob 4, Elven polearm Ob 5.', {
    rootRule: combined('will', 'agility'), skillType: 'Craftsman', tools: workshop, ...magical, availabilityRestrictions: only(['elf']),
    forkSuggestions: forks('smithcraft'), integrationTags: ['magic'], capabilities: [{ kind: 'subsystem-capability', id: 'riddle-of-steel-antiphon', integrationId: 'riddle-of-steel-antiphon' }] }),
  define('ridiculous-request-wise', 'Ridiculous Request-wise', 291, 'Knowledge of ridiculous requests.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'ridiculous-request' } }),
  define('riding', 'Riding', 291, 'Maneuver a mount; obstacle guidance belongs to Riding and Mounted Combat.', {
    rootRule: stat('will'), skillType: 'Physical', tools: { kind: 'specific-item', item: 'horse or similar mount' }, integrationTags: ['mounted-combat'] }),
  define('rigging', 'Rigging', 291, 'Set sails and climb rigging. Guidance: sailboat/longboat Ob 1, single mast Ob 2, junk Ob 3, felucca Ob 4, carrack Ob 5, caravel Ob 6, large many-masted vessel Ob 7.', {
    rootRule: combined('agility', 'speed'), skillType: 'Seafaring', tools: none, forkSuggestions: forks('knots') }),
  define('ritual', 'Ritual', 292, 'Perform community religious rites. Guidance: baptism Ob 1, coming of age Ob 2, wedding Ob 3, funeral Ob 4, ground consecration Ob 5.', {
    rootRule: combined('will', 'perception'), skillType: 'Academic', tools: none }),
  define('rituals-of-blood', 'Rituals of Blood', 292, 'Cast the spells described in Rituals of Night and Blood in the Orc chapter; no magic execution is provided here.', {
    rootRule: stat('will'), skillType: 'Sorcerous', tools: { kind: 'specific-item', item: 'ritual knives' }, ...magical, availabilityRestrictions: only(['orc']),
    forkSuggestions: forks('doctrine-of-nights-blood'), integrationTags: ['magic'] }),

];

export const nRIntegrations: readonly SkillIntegration[] = [
  { id: 'purple-song-antiphon', skillId: 'purple-song', subsystem: 'magic',
    createdItemReference: { kind: 'antiphon-union', target: 'created-item', skillId: 'antiphon-union-training' },
    summary: 'Antiphon Union with Lyric of Healing or Doom of Strength can imbue Purple Song wine, producing Elven Mirrorwine; the entry gives no numeric effect.',
    source: [evidence('Purple Song', 289)] },
  { id: 'riddle-of-steel-antiphon', skillId: 'riddle-of-steel', subsystem: 'magic',
    createdItemReference: { kind: 'antiphon-union', target: 'created-item', skillId: 'antiphon-union-training' },
    summary: 'Antiphon Union and additional songs may imbue created weapons; no specific numerical enchantment effect is given here.',
    source: [evidence('Riddle of Steel', 291)] },
  { id: 'riding-external', skillId: 'riding', subsystem: 'mounted-combat',
    summary: 'Obstacle guidance is external in Riding and Mounted Combat.', source: [evidence('Riding', 291)] },
  { id: 'rituals-of-blood-external', skillId: 'rituals-of-blood', subsystem: 'magic',
    summary: 'Spell effects and obstacle guidance remain in the Orc chapter Rituals of Night and Blood section.', source: [evidence('Rituals of Blood', 292)] },

];
