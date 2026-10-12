import type { SkillIntegration } from '../types';
import { define, expendable, generic, forks, guidance, fork, none, stat, evidence, combined, magical, only, workshop, item, melee, sourceFork, aptitudeTraining } from './shared';

/** Reviewed I–M production records; transcription remains in progress. */
export const iMSkills = [
  define('illuminations', 'Illuminations', 278, 'Embellish manuscripts with illustrations.', {
    rootRule: stat('agility'), skillType: 'Artist', tools: expendable, forkSuggestions: forks('painting', 'calligraphy') }),
  define('imperfections-wise', 'Imperfections-wise', 278, 'Knowledge of imperfections.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'imperfections' } }),
  define('inconspicuous', 'Inconspicuous', 278, 'Blend into a crowd without attracting notice.', {
    rootRule: stat('will'), skillType: 'Social', tools: none, forkSuggestions: forks('acting'),
    testProfile: { kind: 'versus', opposingAbilities: [{ kind: 'skill', skillId: 'observation' }], modifiers: [
      { effect: { kind: 'obstacle-modifier', delta: 1 }, when: { kind: 'anyOf', conditions: [{ kind: 'attire', attire: 'garish' }, { kind: 'attire', attire: 'inappropriate' }] } },
      { effect: { kind: 'obstacle-modifier', delta: 1 }, when: { kind: 'anyOf', conditions: [{ kind: 'social-station-mismatch', position: 'above', relativeTo: 'appropriate-social-station' }, { kind: 'social-station-mismatch', position: 'below', relativeTo: 'appropriate-social-station' }] } },
      { effect: { kind: 'obstacle-modifier', delta: 1 }, when: { kind: 'regional-origin-mismatch', relativeTo: 'current-region' } },
      { effect: { kind: 'obstacle-modifier', delta: 2 }, when: { kind: 'stock-mismatch', relativeTo: 'target-crowd' } },
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

  { ...define('logistics', 'Logistics', 281, 'Supply an army on campaign, with source-defined force and environmental test modifiers.', {
    rootRule: stat('perception'), skillType: 'Military', tools: item('supplies for an army'), integrationTags: ['military-campaign'],
    testProfile: { kind: 'contextual', modifiers: [
      { effect: { kind: 'dice-bonus', dice: 1 }, when: { kind: 'force-attribute', quantifier: 'majority-of-troops', attributeId: 'hatred' } },
      { effect: { kind: 'obstacle-modifier', delta: 1 }, when: { kind: 'allOf', conditions: [
        { kind: 'force-classification', classification: 'non-dwarven' },
        { kind: 'anyOf', conditions: [{ kind: 'terrain', terrain: 'mountains' }, { kind: 'terrain', terrain: 'underground' }] },
      ] } },
      { effect: { kind: 'obstacle-modifier', delta: 1 }, when: { kind: 'allOf', conditions: [
        { kind: 'terrain', terrain: 'heavily-wooded-countryside' }, { kind: 'force-contains-mount', mountKind: 'war-mount' },
      ] } },
      { effect: { kind: 'obstacle-modifier', delta: 1 }, when: { kind: 'anyOf', conditions: [
        { kind: 'force-contains-trait', traitId: 'prince-of-the-blood' }, { kind: 'force-contains-trait', traitId: 'aman' },
        { kind: 'force-contains-trait', traitId: 'fea' }, { kind: 'force-contains-trait', traitId: 'dvergar' },
      ] } },
      { effect: { kind: 'obstacle-modifier', delta: 2 }, when: { kind: 'area-condition', condition: 'enemy-scorched-earth' } },
      { effect: { kind: 'obstacle-modifier', delta: 2 }, when: { kind: 'prior-test-in-context', skillId: 'logistics',
        area: 'same-countryside', within: 'last-resources-maintenance-cycle' } },
      { effect: { kind: 'obstacle-modifier', delta: 2 }, when: { kind: 'allOf', conditions: [
        { kind: 'season', season: 'winter' }, { kind: 'anyOf', conditions: [
          { kind: 'force-contains-mount', mountKind: 'war-mount' }, { kind: 'force-contains-mount', mountKind: 'riding-mount' },
          { kind: 'force-contains-mount', mountKind: 'pack-animal' },
        ] },
      ] } },
    ] } }), source: [evidence('Logistics', 281), evidence('Logistics continuation', 282)] },
  define('lost-treasures-wise', 'Lost Treasures-wise', 282, 'Knowledge of lost treasures.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'lost-treasures' } }),
  define('lyric-of-law', 'Lyric of Law', 282, 'Elven law preserved and applied through song.', {
    rootRule: stat('perception'), skillType: 'Academic', tools: none, ...magical, availabilityRestrictions: only(['elf']), semanticCategories: ['song'],
    forkSuggestions: guidance({ target: { kind: 'anyOf', targets: [
      { kind: 'skill-family', familyId: 'history', relevance: 'appropriate' }, { kind: 'skill-family', familyId: 'wises', relevance: 'appropriate' },
      { kind: 'category', category: 'song', relevance: 'appropriate' },
    ] } }) }),
  define('mace', 'Mace', 282, 'Fight with a short metal-flanged club.', {
    rootRule: combined('power', 'agility'), skillType: 'Martial', tools: item('mace'), semanticCategories: ['melee-weapon'],
    forkSuggestions: forks('cudgel', 'brawling'), integrationTags: ['fight'] }),
  define('makers-mark-wise', "Maker's Mark-wise", 282, 'Knowledge of maker marks.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'makers-mark' } }),
  define('man-wise', 'Man-wise', 282, 'Knowledge of men.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'man' } }),
  { ...define('martial-arts', 'Martial Arts', 282, 'Specialist unarmed fighting using Boxing mechanics, with a separate skill identity.', {
    rootRule: combined('power', 'agility'), skillType: 'Martial', tools: none, forkSuggestions: guidance(fork('brawling'), melee), integrationTags: ['fight'],
    relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'boxing' } }] }),
    source: [evidence('Martial Arts', 282), evidence('Referenced Boxing mechanics', 261)] },
  define('mason', 'Mason', 282, 'Shape stone, mix mortar, set foundations and build structures.', {
    rootRule: combined('perception', 'agility'), skillType: 'Artisan', tools: workshop,
    forkSuggestions: guidance(sourceFork('Engineer', 'engineering'), fork('architect')) }),

  define('meditation', 'Meditation', 283, 'Rest through meditation or center before another skill test; awareness and spell sustaining remain separate facts.', {
    rootRule: stat('will'), skillType: 'School of Thought', tools: none,
    procedures: [
      { kind: 'duration-rest-substitution', substitutesFor: 'sleep-rest',
        obstacle: { kind: 'duration-based-obstacle', unit: 'hour', firstUnitObstacle: 1, additionalUnitObstacleDelta: 1 },
        effect: { kind: 'rest-equivalence', durationUnit: 'hour', restPerUnit: 1, appliesTo: ['wound-recovery', 'tax-recovery'] },
        onFailure: { kind: 'falls-asleep', timing: 'at-some-point' } },
      { kind: 'linked-pretest', target: 'subsequent-skill-test', semantics: { kind: 'canonical-rule', rule: 'linked-test' },
        specialResolution: {
          when: { kind: 'anyOf', conditions: [{ kind: 'test-context', context: 'versus-test' }, { kind: 'test-context', context: 'detailed-conflict' }] },
          test: { kind: 'versus', actingAbility: { kind: 'skill', id: 'meditation' },
            opposingAbility: { kind: 'context-resolved-skill', actorRole: 'opponent', resolution: 'manual' } },
          onWin: { kind: 'dice-bonus', dice: 1, appliesTo: 'linked-target-test' },
        } },
    ],
    activityFacts: [ { kind: 'vague-surroundings-awareness' },
      { kind: 'permitted-test', abilities: { kind: 'anyOf', operands: [{ kind: 'stat', id: 'perception' }, { kind: 'skill', id: 'observation' }] },
        purpose: { kind: 'detect-skill-use', skillId: 'stealthy' } } ],
    integrationTags: ['magic'], capabilities: [{ kind: 'subsystem-capability', id: 'meditation-sustaining', integrationId: 'meditation-sustaining' }] }),
  define('mending', 'Mending', 283, 'Repair farm and household goods or damaged armor using source obstacle guidance.', {
    rootRule: combined('perception', 'agility'), skillType: 'Peasant', tools: expendable,
    forkSuggestions: guidance({ target: { kind: 'skill-type', skillType: 'Craftsman', relevance: 'appropriate' } }), integrationTags: ['equipment'] }),
  define('mercenary-company-wise', 'Mercenary Company-wise', 283, 'Knowledge of mercenary companies.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'mercenary-company' } }),
  define('metal-wise', 'Metal-wise', 283, 'Knowledge of metals.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'metal' } }),
  define('midwifery', 'Midwifery', 283, 'Help mothers and children through childbirth.', {
    rootRule: combined('will', 'perception'), skillType: 'Medicinal', tools: none, forkSuggestions: forks('herbalism') }),
  define('mill-wise', 'Mill-wise', 283, 'Knowledge of mills.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'mill' } }),
  define('miller', 'Miller', 284, 'Build, maintain and operate grain mills; the workshop is a mill.', {
    rootRule: stat('perception'), skillType: 'Peasant', tools: workshop, forkSuggestions: forks('brewer') }),
  define('mimicry', 'Mimicry', 284, 'Imitate animal sounds and voices.', {
    rootRule: stat('perception'), skillType: 'Forester', tools: none }),
  define('mining', 'Mining', 284, 'Excavate earth and extract ores or minerals, including ore prospecting.', {
    rootRule: stat('perception'), skillType: 'Craftsman', tools: generic,
    forkSuggestions: guidance(sourceFork('Engineer', 'engineering'), fork('architect')) }),
  define('monk-wise', 'Monk-wise', 284, 'Knowledge of monks.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'monk' } }),

  define('mounted-combat-training', 'Mounted Combat Training', 284, 'Training for effective mounted combat; a source acquisition may choose the Bowman archetype when appropriate.', {
    rootRule: combined('will', 'power'), skillType: 'Martial Training', tools: none,
    training: aptitudeTraining, printedMarkers: ['*'], integrationTags: ['mounted-combat'],
    trainingSourceChoice: {
      kind: 'training-source-options', selectionScope: 'source-acquisition', ownership: 'independent',
      appropriateness: 'character-and-setting', options: [
        { id: 'mounted-combat-training', sourceLabel: 'Mounted Combat Training', archetype: 'lancer',
          source: [evidence('Mounted Combat Training', 284), evidence('Elven Lancer character: both Training identities', 130)],
          sourceMappings: [{ kind: 'lifepath', stockId: 'elf', sourceName: 'Lancer', source: [evidence('Elven Lancer lifepath', 137)] }] },
        { id: 'mounted-combat-bowman-training', sourceLabel: 'Mounted Combat: Bowman Training', archetype: 'bowman',
          source: [evidence('Mounted Combat Training: Bowman source choice', 284), evidence('Elven Lancer character: both Training identities', 130)],
          sourceMappings: [{ kind: 'lifepath', stockId: 'elf', sourceName: 'Outrider', source: [evidence('Elven Outrider lifepath', 137)] }] },
      ],
    } }),
  define('mouth-of-hell-wise', 'Mouth of Hell-wise', 284, 'Knowledge of the Mouth of Hell.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'mouth-of-hell' } }),
  define('mule-wise', 'Mule-wise', 284, 'Knowledge of mules.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'mule' } }),

];

export const iMIntegrations: readonly SkillIntegration[] = [
  { id: 'mounted-combat-external', skillId: 'mounted-combat-training', subsystem: 'mounted-combat',
    summary: 'See Riding and Mounted Combat for combat consequences; source options do not implement them.', source: [evidence('Mounted Combat Training', 284)] },
  { id: 'meditation-sustaining', skillId: 'meditation', subsystem: 'magic',
    sustainedSpellReference: { actorRole: 'sorcerer', while: 'using-owning-skill', permission: 'maintain-sustained-spells',
      requiredRetest: { kind: 'tax', rules: { kind: 'external-subsystem-rule', subsystem: 'magic', sourceName: 'The Power Still Flows Through Him' } } },
    summary: 'A Sorcerer may sustain spells while meditating, with Tax retests under the referenced magic rule.', source: [evidence('Meditation', 283)] },

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
