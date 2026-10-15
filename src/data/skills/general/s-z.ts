import { combined, define, forks, none, stat, workshop } from './shared';

/** Reviewed S–Z records only; later entries remain identity references. */
export const sZSkills = [
  define('saddlery', 'Saddlery', 294, 'Make horse furniture from hides. Guidance: repairs Ob 1, riding saddle Ob 2, war saddle Ob 3, ornate saddle Ob 4, royal saddle Ob 5, howdah Ob 7.', {
    rootRule: combined('perception', 'agility'), skillType: 'Craftsman', tools: workshop, forkSuggestions: forks('tanner') }),
  define('saint-wise', 'Saint-wise', 294, 'Knowledge of saints.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'saint' } }),
];
