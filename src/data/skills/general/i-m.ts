import { define, expendable, forks, none, stat } from './shared';

/** Reviewed I–M production records; transcription remains in progress. */
export const iMSkills = [
  define('illuminations', 'Illuminations', 278, 'Embellish manuscripts with illustrations.', {
    rootRule: stat('agility'), skillType: 'Artist', tools: expendable, forkSuggestions: forks('painting', 'calligraphy') }),
  define('imperfections-wise', 'Imperfections-wise', 278, 'Knowledge of imperfections.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'imperfections' } }),
  define('inconspicuous', 'Inconspicuous', 278, 'Blend into a crowd without attracting notice.', {
    rootRule: stat('will'), skillType: 'Social', tools: none, forkSuggestions: forks('acting'),
    testProfile: { kind: 'versus', opposingAbilities: [{ kind: 'skill', skillId: 'observation' }], modifiers: [
      { kind: 'obstacle', delta: 1, when: { kind: 'anyOf', conditions: [{ kind: 'attire', attire: 'garish' }, { kind: 'attire', attire: 'inappropriate' }] } },
      { kind: 'obstacle', delta: 1, when: { kind: 'anyOf', conditions: [{ kind: 'social-station-mismatch', position: 'above', relativeTo: 'appropriate-social-station' }, { kind: 'social-station-mismatch', position: 'below', relativeTo: 'appropriate-social-station' }] } },
      { kind: 'obstacle', delta: 1, when: { kind: 'regional-origin-mismatch', relativeTo: 'current-region' } },
      { kind: 'obstacle', delta: 2, when: { kind: 'stock-mismatch', relativeTo: 'target-crowd' } },
    ] } }),
  define('infection-wise', 'Infection-wise', 278, 'Knowledge of infections.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'infection' } }),
];
