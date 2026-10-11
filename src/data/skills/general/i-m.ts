import { define, expendable, forks, none, stat } from './shared';

/** I–M in progress; Inconspicuous's situational test procedure is pending schema review. */
export const iMSkills = [
  define('illuminations', 'Illuminations', 278, 'Embellish manuscripts with illustrations.', {
    rootRule: stat('agility'), skillType: 'Artist', tools: expendable, forkSuggestions: forks('painting', 'calligraphy') }),
  define('imperfections-wise', 'Imperfections-wise', 278, 'Knowledge of imperfections.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'imperfections' } }),
];
