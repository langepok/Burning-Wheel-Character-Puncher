import { combined, define, forks, generic, none, only, stat, workshop, magical, evidence } from './shared';

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
];
