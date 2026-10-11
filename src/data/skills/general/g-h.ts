import { combined, define, expendable, fork, forks, generic, guidance, item, magical, only, sourceFork, stat, traveling, none, workshop } from './shared';

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
  define('haggling', 'Haggling', 276, 'Negotiate prices, purchase terms and contracts.', { rootRule: stat('will'), skillType: 'Social', tools: none,
    forkSuggestions: forks('persuasion', 'soothing-platitudes'), integrationTags: ['resources'],
    capabilities: [{ kind: 'subsystem-capability', id: 'purchase-negotiation', integrationId: 'haggling-negotiation' }] }),
  define('hallmaster', 'Hallmaster', 276, 'Build Dwarven halls and optionally reinforce their resistance to alteration or destruction.', {
    rootRule: combined('will', 'perception'), skillType: 'Artisan', tools: workshop, ...magical, availabilityRestrictions: only(['dwarf']),
    forkSuggestions: forks('war-engineer', 'stone-artifice'), integrationTags: ['equipment'],
    capabilities: [{ kind: 'subsystem-capability', id: 'structure-resistance', integrationId: 'hallmaster-resistance' }] }),
  define('hammer', 'Hammer', 276, 'Use heavy blunt crushing weapons with beaks or spikes.', { rootRule: stat('agility'), skillType: 'Martial', tools: item('hammer'),
    forkSuggestions: forks('mace', 'cudgel', 'axe'), semanticCategories: ['melee-weapon'], integrationTags: ['fight'] }),
  define('hauling', 'Hauling', 277, 'Carry heavy loads using the skill in place of Power.', { rootRule: combined('will', 'power'), skillType: 'Peasant', tools: none,
    relations: [{ kind: 'contextual-substitution', target: { kind: 'stat', id: 'power' }, context: { kind: 'activity', activity: 'hauling' } }] }),
  define('heraldry', 'Heraldry', 277, 'Recognize heraldic coats of arms and families.', { rootRule: stat('perception'), skillType: 'Special', tools: none,
    forkSuggestions: forks('etiquette') }),
  define('herbalism', 'Herbalism', 277, 'Use herbs to prevent or treat ailments and wounds.', { rootRule: stat('perception'), skillType: 'Medicinal', tools: expendable,
    forkSuggestions: guidance(
      { target: { kind: 'anyOf', targets: [{ kind: 'skill', skillId: 'apothecary' }, { kind: 'skill', skillId: 'alchemy' }] }, context: { kind: 'activity', activity: 'potion-work' } },
      { target: { kind: 'anyOf', targets: [{ kind: 'skill', skillId: 'surgery' }, { kind: 'skill', skillId: 'field-dressing' }] }, context: { kind: 'activity', activity: 'wound-treatment' } },
    ), integrationTags: ['injury'] }),
  define('hunting', 'Hunting', 277, 'Capture or kill wild prey for food.', { rootRule: combined('perception', 'agility'), skillType: 'Forester',
    tools: { kind: 'anyOf', requirements: [item('bow'), item('javelin')] }, forkSuggestions: forks('tracking', 'trapper') }),
  define('hymn-of-scales-and-fins', 'Hymn of Scales and Fins', 278, 'Elven fishing through song; functions like Fishing.', {
    rootRule: combined('perception', 'agility'), skillType: 'Peasant', tools: generic, ...magical, availabilityRestrictions: only(['elf']),
    forkSuggestions: guidance(sourceFork('Slip of Currents'), sourceFork('Rhyme of Rules')),
    relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'fishing' } }] }),
];
