import { combined, define, fork, forks, generic, guidance, magical, only, sourceFork, stat, traveling, none, workshop } from './shared';

/** G–H in progress; subsystem settlement metadata is authored independently. */
export const gHSkills = [
  define('gambling', 'Gambling', 275, 'Set a wager or prize, then contest another gambler; the winner takes the prize. Cash wagers originate from a Resources test.', {
    rootRule: combined('will', 'perception'), skillType: 'Special', tools: traveling,
    forkSuggestions: forks('strategy-games'), integrationTags: ['resources'] }),
  define('games-of-chance', 'Games of Chance', 275, 'Dwarven games of chance with prize-obstacle settlement; excludes games of skill.', {
    rootRule: stat('perception'), skillType: 'Special', tools: traveling, availabilityRestrictions: only(['dwarf'], 'character-burning'),
    forkSuggestions: forks('gambling'), integrationTags: ['resources'],
    capabilities: [{ kind: 'subsystem-capability', id: 'wager-settlement', integrationId: 'games-of-chance-settlement' }] }),
  define('gem-artifice', 'Gem Artifice', 275, 'Cut precious gems/stones for crafted value and enchanting matrices.', {
    rootRule: combined('will', 'agility'), skillType: 'Artisan', tools: workshop, ...magical, availabilityRestrictions: only(['dwarf']),
    forkSuggestions: forks('white-metal-artifice'), integrationTags: ['equipment', 'magic'], capabilities: [
      { kind: 'subsystem-capability', id: 'gem-value', integrationId: 'gem-artifice-value' },
      { kind: 'subsystem-capability', id: 'gem-matrix', integrationId: 'gem-artifice-matrix' },
    ] }),
  define('gemcraft', 'Gemcraft', 275, 'Cut and polish Elven gemstones with additional Resources value and Antiphon flexibility.', {
    rootRule: combined('will', 'agility'), skillType: 'Craftsman', tools: workshop, ...magical, availabilityRestrictions: only(['elf']),
    forkSuggestions: forks('jewelcraft', 'smithcraft'), integrationTags: ['equipment', 'magic'], capabilities: [
      { kind: 'subsystem-capability', id: 'gemcraft-value', integrationId: 'gemcraft-value' },
      { kind: 'subsystem-capability', id: 'gemcraft-antiphon', integrationId: 'gemcraft-antiphon' },
    ] }),
  define('grain-appraisal', 'Grain Appraisal', 276, 'Select grain suitable for Dwarven nog.', { rootRule: stat('perception'), skillType: 'Craftsman', tools: none,
    availabilityRestrictions: only(['dwarf'], 'character-burning'), forkSuggestions: forks('nogger') }),
  define('grain-song', 'Grain Song', 276, 'Elven grain milling, described as similar to Miller.', { rootRule: stat('perception'), skillType: 'Peasant', tools: workshop,
    ...magical, availabilityRestrictions: only(['elf']), forkSuggestions: guidance(fork('round-of-harvest'), sourceFork('Rhyme of Rules')) }),
  define('great-wolf-husbandry', 'Great Wolf Husbandry', 276, 'Raise Great Wolves; also counts as Field Dressing for their wounds.', {
    rootRule: stat('will'), skillType: 'Peasant', tools: generic, forkSuggestions: forks('animal-husbandry', 'wolf-wise'),
    relations: [{ kind: 'includes-capability', target: { kind: 'skill', id: 'field-dressing' }, context: { kind: 'allOf', conditions: [
      { kind: 'subject', subject: 'great-wolves' }, { kind: 'activity', activity: 'wound-treatment' },
    ] } }], integrationTags: ['injury'] }),
];
