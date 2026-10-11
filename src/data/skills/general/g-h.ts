import { combined, define, forks, traveling } from './shared';

/** G–H in progress: pause at Games of Chance's unrepresented Resources settlement. */
export const gHSkills = [
  define('gambling', 'Gambling', 275, 'Set a wager or prize, then contest another gambler; the winner takes the prize. Cash wagers originate from a Resources test.', {
    rootRule: combined('will', 'perception'), skillType: 'Special', tools: traveling,
    forkSuggestions: forks('strategy-games'), integrationTags: ['resources'] }),
];
