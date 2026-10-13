import { combined, define, forks, fork, guidance, generic, none, only, stat, workshop, magical, evidence, expendable, hatred } from './shared';

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
];
