import type { SkillIntegration } from '../types';
import { define, expendable, generic, forks, guidance, fork, none, stat, evidence, combined, magical, only, workshop, item, melee } from './shared';

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
  define('insect-husbandry', 'Insect Husbandry', 278, 'Raise and care for insects, with scoped medical obstacle guidance.', {
    rootRule: stat('will'), skillType: 'Forester', tools: generic, integrationTags: ['injury'],
    relations: [{ kind: 'obstacle-reference', targets: { kind: 'skill', skillId: 'apothecary' },
      context: { kind: 'activity', activity: 'tending-wounds-and-illness' } }] }),
  define('instruction', 'Instruction', 278, 'Teach another character; obstacle guidance is in Learning from Another.', {
    rootRule: stat('will'), skillType: 'Social', tools: none, forkSuggestions: forks('command', 'persuasion') }),
  define('interrogation', 'Interrogation', 278, 'Obtain sought information from an unwilling subject.', {
    rootRule: stat('will'), skillType: 'Social', tools: none,
    forkSuggestions: guidance(fork('intimidation'), fork('torture'), { target: { kind: 'anyOf', targets: [
      { kind: 'skill', skillId: 'ugly-truth' }, { kind: 'skill', skillId: 'soothing-platitudes' },
    ] } }),
    testProfile: { kind: 'obstacle', base: { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' },
      adjustments: [
        { kind: 'manual', source: 'target-traits', quantity: 'unquantified' },
        { kind: 'manual', source: 'situational-disadvantage', quantity: 'unquantified', examples: [
          { kind: 'target-belief', constraint: 'prevents-disclosure-of-sought-information' },
        ] },
      ] } }),
  { ...define('intimidation', 'Intimidation', 278, 'Threaten a target; outside Duel of Wits, success prompts a Steel test.', {
    rootRule: stat('will'), skillType: 'Social', tools: none, forkSuggestions: forks('ugly-truth'), integrationTags: ['duel-of-wits'],
    testProfile: { kind: 'obstacle', context: { kind: 'outside-subsystem', subsystem: 'duel-of-wits' },
      base: { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' }, adjustments: [],
      followUps: [{ trigger: { kind: 'test-success', source: 'primary-test' },
        context: { kind: 'outside-subsystem', subsystem: 'duel-of-wits' },
        test: { actor: 'target', ability: { kind: 'attribute', id: 'steel' } },
        modifiers: [{ kind: 'dynamic-value', target: 'hesitation-obstacle', operation: 'add',
          value: { kind: 'extra-successes', source: 'primary-test' } }],
      }] } }), source: [evidence('Intimidation', 278), evidence('Intimidation continuation', 279)] },
  define('intrigue-wise', 'Intrigue-wise', 279, 'Knowledge of intrigue.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'intrigue' } }),
  define('jargon', 'Jargon', 279, 'Use specialist secret speech to identify speakers or communicate plans and instructions.', {
    rootRule: stat('perception'), skillType: 'Social', tools: none,
    testProfile: { kind: 'versus', opposingAbilities: [
      { kind: 'context-resolved-skill', actorRole: 'eavesdropper', resolution: 'manual' },
    ] } }),
  define('javelin', 'Javelin', 279, 'Use short throwing spears under the thrown-weapon rules.', {
    rootRule: stat('agility'), skillType: 'Martial', tools: none, forkSuggestions: forks('throwing'), integrationTags: ['range-and-cover', 'fight'] }),
  define('jewelcraft', 'Jewelcraft', 279, 'Craft Elven jewelry that can be enchanted through Antiphon Union and appropriate spell songs.', {
    rootRule: combined('will', 'agility'), skillType: 'Craftsman', tools: workshop, ...magical,
    availabilityRestrictions: only(['elf']), forkSuggestions: forks('smithcraft', 'gemcraft'), integrationTags: ['magic', 'equipment'],
    capabilities: [{ kind: 'subsystem-capability', id: 'jewelcraft-antiphon', integrationId: 'jewelcraft-antiphon' }] }),
  define('jeweler', 'Jeweler', 279, 'Work metals and precious gems into jewelry.', {
    rootRule: combined('perception', 'agility'), skillType: 'Craftsman', tools: workshop,
    forkSuggestions: forks('etching', 'whitesmith', 'lapidary') }),
  define('khirurgy', 'Khirurgy', 279, 'Dwarven medicine; treatment procedures use Anatomy of Injury.', {
    rootRule: combined('perception', 'agility'), skillType: 'Medicinal', tools: generic,
    availabilityRestrictions: only(['dwarf'], 'character-burning'), integrationTags: ['injury'],
    forkSuggestions: forks('herbalism', 'field-dressing', 'bloodletting', 'apothecary') }),
  define('kingdom-wise', 'Kingdom-wise', 279, 'Knowledge of kingdoms.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'kingdom' } }),
  define('knives', 'Knives', 279, 'Fight with knives at close quarters; this is not a throwing skill.', {
    rootRule: stat('agility'), skillType: 'Martial', tools: item('something knife-like'), integrationTags: ['fight'],
    forkSuggestions: guidance(fork('brawling'), fork('boxing'), melee) }),
  define('knots', 'Knots', 280, 'Tie ropes for ships, cargo, nets and securing a person.', {
    rootRule: combined('perception', 'agility'), skillType: 'Seafaring',
    tools: { kind: 'traveling-gear', expendable: true }, forkSuggestions: forks('rigging'),
    testProfile: { kind: 'versus', context: { kind: 'activity', activity: 'securing-a-person' },
      opposingAbilities: { kind: 'anyOf', operands: [
        { ability: { kind: 'skill', skillId: 'escape-artist' } },
        { ability: { kind: 'stat', id: 'power' }, modifiers: [{ kind: 'double-obstacle-penalty' }] },
      ] } } }),
  define('lance', 'Lance', 280, 'Use a couched lance from horseback under Fight and mounted-combat rules.', {
    rootRule: combined('agility', 'power'), skillType: 'Martial', tools: item('a really big, pointy stick'),
    forkSuggestions: forks('spear'), integrationTags: ['fight', 'mounted-combat'] }),
  define('lapidary', 'Lapidary', 280, 'Refine gems for sale or jewelry.', {
    rootRule: stat('perception'), skillType: 'Craftsman', tools: workshop, forkSuggestions: forks('jeweler') }),
  define('latrine-wise', 'Latrine-wise', 280, 'Knowledge of latrines.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'latrine' } }),
  define('lazy-bastard-wise', 'Lazy Bastard-wise', 280, 'Knowledge of lazy bastards.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'lazy-bastard' } }),

  define('leathercraft', 'Leathercraft', 280, 'Craft Elven leather goods; specified Antiphon/spell-song combinations can enchant boots or belts.', {
    rootRule: combined('will', 'agility'), skillType: 'Craftsman', tools: workshop, ...magical,
    availabilityRestrictions: only(['elf']), forkSuggestions: forks('weaving-way'), integrationTags: ['magic', 'equipment'],
    capabilities: [{ kind: 'subsystem-capability', id: 'leathercraft-boots', integrationId: 'leathercraft-boots' },
      { kind: 'subsystem-capability', id: 'leathercraft-antiphon', integrationId: 'leathercraft-antiphon' }] }),
  define('ledger-wise', 'Ledger-wise', 280, 'Knowledge of ledgers.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'ledger' } }),
  define('leverage-wise', 'Leverage-wise', 280, 'Knowledge of leverage.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'leverage' } }),
  { ...define('links', 'Links', 280, 'Perform and decode Dwarven military horn signals.', {
    rootRule: combined('will', 'forte'), skillType: 'Academic', tools: item('a big brass horn'),
    availabilityRestrictions: only(['dwarf'], 'character-burning'), forkSuggestions: forks('stentorious-singing'),
    integrationTags: ['battlefield-communication'] }), source: [evidence('Links', 280), evidence('Links continuation', 281)] },
  define('lithography', 'Lithography', 281, 'Inscribe runes and images into stone or print from carved blocks.', {
    rootRule: combined('perception', 'agility'), skillType: 'Artisan', tools: workshop, ...magical,
    availabilityRestrictions: only(['dwarf']), forkSuggestions: forks('dwarven-rune-script', 'symbology', 'engraving', 'dye-manufacture') }),
  define('lock-pick', 'Lock Pick', 281, 'Disable and disarm mechanical locks.', {
    rootRule: combined('perception', 'agility'), skillType: 'Special', tools: generic,
    forkSuggestions: forks('locksmith', 'sleight-of-hand') }),
  define('locksmith', 'Locksmith', 281, 'Build, maintain and disarm locks, including Lock Pick capabilities.', {
    rootRule: combined('perception', 'agility'), skillType: 'Craftsman', tools: workshop, forkSuggestions: forks('lock-pick'),
    relations: [{ kind: 'includes-capability', target: { kind: 'skill', id: 'lock-pick' } }] }),

];

export const iMIntegrations: readonly SkillIntegration[] = [
  { id: 'leathercraft-boots', skillId: 'leathercraft', subsystem: 'equipment',
    equipmentResult: {
      target: { kind: 'created-equipment', equipmentKindId: 'boots' },
      acquisition: { kind: 'enchantment-combination', requires: { kind: 'allOf', operands: [
        { kind: 'training', skillId: 'antiphon-union-training' },
        { kind: 'spell-song', subsystem: 'magic', sourceName: 'Song of Silence' },
      ] } },
      effect: { kind: 'skill-test-dice-bonus', recipient: 'equipment-user', skillId: 'stealthy', dice: 1 },
    }, summary: 'Elven boots enchanted through this combination grant one die specifically to Stealthy.', source: [evidence('Leathercraft', 280)] },
  { id: 'leathercraft-antiphon', skillId: 'leathercraft', subsystem: 'magic',
    createdItemReference: { kind: 'antiphon-union', target: 'created-item', skillId: 'antiphon-union-training' },
    summary: 'Antiphon Union with Song of Silence can enchant boots; with Doom of Strength it can create a belt of terrible fortitude. The entry gives no numeric belt effect.',
    source: [evidence('Leathercraft', 280)] },

  { id: 'jewelcraft-antiphon', skillId: 'jewelcraft', subsystem: 'magic',
    createdItemReference: { kind: 'antiphon-union', target: 'created-item', skillId: 'antiphon-union-training' },
    summary: 'Created jewelry may be enchanted with Antiphon Union and appropriate spell songs, including Paean of Deeds, Ballad of Rage and Strain of Far Sight.',
    source: [evidence('Jewelcraft', 279)] },
];
