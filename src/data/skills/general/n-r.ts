import { combined, define, forks, generic, none, only, stat } from './shared';

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
];
