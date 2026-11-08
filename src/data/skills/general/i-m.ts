import type { SkillIntegration } from '../types';
import { define, expendable, generic, forks, guidance, fork, none, stat, evidence, combined, magical, only, workshop, item, melee, sourceFork, aptitudeTraining } from './shared';

/** Reviewed I–M production records; transcription remains in progress. */
export const iMSkills = [
  define('illuminations', 'Illuminations', 278, 'Embellish manuscripts. Obstacles: doodles Ob 1; flourishes Ob 2; illustrations Ob 3; color illustrations Ob 4; gold foil Ob 5.', {
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
  define('insect-husbandry', 'Insect Husbandry', 278, 'Raise and care for insects. Obstacles: ants Ob 1; bees Ob 2; silkworms Ob 3; exotic insects Ob 4. Use the separate Apothecary obstacle reference for wounds and illness.', {
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
  define('jargon', 'Jargon', 279, 'Use the specialized secret speech of masons, architects and engineers. Identify a speaker Ob 1; communicate plans or instructions Ob 2. Otherwise use a versus test against the eavesdropper’s skill.', {
    rootRule: stat('perception'), skillType: 'Social', tools: none,
    testProfile: { kind: 'versus', context: { kind: 'circumstance', circumstanceId: 'jargon-against-eavesdropping' },
      opposingAbilities: [
      { kind: 'context-resolved-skill', actorRole: 'eavesdropper', resolution: 'manual' },
    ] } }),
  define('javelin', 'Javelin', 279, 'Use short throwing spears under the thrown-weapon rules.', {
    rootRule: stat('agility'), skillType: 'Martial', tools: none, forkSuggestions: forks('throwing'), integrationTags: ['range-and-cover', 'fight'] }),
  define('jewelcraft', 'Jewelcraft', 279, 'Make jewelry and enchant it with Antiphon Union and spell songs. Examples: a crown with Paean of Deeds, a mask with Ballad of Rage or a tiara with Strain of Far Sight. Obstacles: brooch Ob 1; ring Ob 2; necklace Ob 3; tiara Ob 4; crown Ob 5.', {
    rootRule: combined('will', 'agility'), skillType: 'Craftsman', tools: workshop, ...magical,
    availabilityRestrictions: only(['elf']), forkSuggestions: forks('smithcraft', 'gemcraft'), integrationTags: ['magic', 'equipment'],
    capabilities: [{ kind: 'subsystem-capability', id: 'jewelcraft-antiphon', integrationId: 'jewelcraft-antiphon' }] }),
  define('jeweler', 'Jeweler', 279, 'Work metals and gems into jewelry. Obstacles: polish or clean metal Ob 1; weigh and count components Ob 1; baubles Ob 2; chain Ob 3; ring Ob 3; necklace Ob 3; bracelet Ob 3; locket Ob 4; carcanet Ob 5; coronet Ob 6; diadem Ob 6; crown Ob 7.', {
    rootRule: combined('perception', 'agility'), skillType: 'Craftsman', tools: workshop,
    forkSuggestions: forks('etching', 'whitesmith', 'lapidary') }),
  define('khirurgy', 'Khirurgy', 279, 'Dwarven medicine; treatment procedures use Anatomy of Injury.', {
    rootRule: combined('perception', 'agility'), skillType: 'Medicinal', tools: generic,
    availabilityRestrictions: only(['dwarf'], 'character-burning'), integrationTags: ['injury'],
    forkSuggestions: forks('herbalism', 'field-dressing', 'bloodletting', 'apothecary') }),
  define('kingdom-wise', 'Kingdom-wise', 279, 'Knowledge of kingdoms.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'kingdom' } }),
  define('knives', 'Knives', 279, 'Fight hand-to-hand with knives, not throwing. See Fight for obstacles.', {
    rootRule: stat('agility'), skillType: 'Martial', tools: item('something knife-like'), integrationTags: ['fight'],
    forkSuggestions: guidance(fork('brawling'), fork('boxing'), melee) }),
  define('knots', 'Knots', 280, 'Tie ropes for ships, cargo, nets and harnesses. Obstacles: secure cargo Ob 1; set up a sailboat Ob 2; set up a small ship Ob 3; set up a ship Ob 4; carrying harness Ob 1; net Ob 2. Securing a person uses the separate versus profile.', {
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
  define('lapidary', 'Lapidary', 280, 'Refine gems for sale or jewelry. Obstacles: polish gems Ob 1; facet zircon Ob 2; shape opals Ob 3; work jade Ob 3; facet sapphire Ob 4; facet rubies or emeralds Ob 5; facet diamonds Ob 6.', {
    rootRule: stat('perception'), skillType: 'Craftsman', tools: workshop, forkSuggestions: forks('jeweler') }),
  define('latrine-wise', 'Latrine-wise', 280, 'Knowledge of latrines.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'latrine' } }),
  define('lazy-bastard-wise', 'Lazy Bastard-wise', 280, 'Knowledge of lazy bastards.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'lazy-bastard' } }),

  define('leathercraft', 'Leathercraft', 280, 'Work leather and combine appropriate goods with Antiphon Union and spell songs. Obstacles: belt Ob 1; cloak or boots Ob 2; satchel or gloves Ob 3; gambeson Ob 4; boiled leather armor Ob 5.', {
    rootRule: combined('will', 'agility'), skillType: 'Craftsman', tools: workshop, ...magical,
    availabilityRestrictions: only(['elf']), forkSuggestions: forks('weaving-way'), integrationTags: ['magic', 'equipment'],
    capabilities: [{ kind: 'subsystem-capability', id: 'leathercraft-boots', integrationId: 'leathercraft-boots' },
      { kind: 'subsystem-capability', id: 'leathercraft-antiphon', integrationId: 'leathercraft-antiphon' }] }),
  define('ledger-wise', 'Ledger-wise', 280, 'Knowledge of ledgers.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'ledger' } }),
  define('leverage-wise', 'Leverage-wise', 280, 'Knowledge of leverage.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'leverage' } }),
  { ...define('links', 'Links', 280, 'Perform and decode military horn signals. Obstacles: start or stop Ob 1; danger Ob 2; marching orders Ob 3; battle commands Ob 4; complex communications Ob 5.', {
    rootRule: combined('will', 'forte'), skillType: 'Academic', tools: item('a big brass horn'),
    availabilityRestrictions: only(['dwarf'], 'character-burning'), forkSuggestions: forks('stentorious-singing'),
    integrationTags: ['battlefield-communication'] }), source: [evidence('Links', 280), evidence('Links continuation', 281)] },
  define('lithography', 'Lithography', 281, 'Carve runes or images into stone, including blocks for printing. Obstacles: simple characters Ob 1; words Ob 2; simple image or moon runes Ob 3; complex image Ob 4; lifelike image Ob 5.', {
    rootRule: combined('perception', 'agility'), skillType: 'Artisan', tools: workshop, ...magical,
    availabilityRestrictions: only(['dwarf']), forkSuggestions: forks('dwarven-rune-script', 'symbology', 'engraving', 'dye-manufacture') }),
  define('lock-pick', 'Lock Pick', 281, 'Disable mechanical locks. Obstacles: simple lock Ob 1; decent lock Ob 2; rusted simple lock Ob 3; rusted decent lock Ob 3; complex lock Ob 4; rusted complex lock Ob 5.', {
    rootRule: combined('perception', 'agility'), skillType: 'Special', tools: generic,
    forkSuggestions: forks('locksmith', 'sleight-of-hand') }),
  define('locksmith', 'Locksmith', 281, 'Build and disarm locks; includes Lock Pick. Obstacles: clean a lock Ob 1; cut keys Ob 2; build a simple lock Ob 3; build a decent lock Ob 4; build a complex lock Ob 5.', {
    rootRule: combined('perception', 'agility'), skillType: 'Craftsman', tools: workshop, forkSuggestions: forks('lock-pick'),
    relations: [{ kind: 'includes-capability', target: { kind: 'skill', id: 'lock-pick' } }] }),

  { ...define('logistics', 'Logistics', 281, 'Supply forces for one week. Obstacles: twelve dismounted thugs on a highway in rich farmland Ob 1; two dozen homogeneous dismounted troops Ob 2; one mounted lance with retinue, mounts and pack animals Ob 3; several homogeneous companies of 500–600 dismounted troops Ob 4; several mixed companies of 500–600 dismounted troops Ob 5; 100 lances Ob 6; battalion of 200–300 lances plus a large free company Ob 8; three-battalion host Ob 10. A lance includes a mounted fighter, squire or sword bearer, page, two archers or crossbowmen and a lightly armed servant.', {
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
  define('lyric-of-law', 'Lyric of Law', 282, 'Know and apply Elven law. Obstacles: Citadel law Ob 1; Protector’s law Ob 2; Etharchal law Ob 3; Wilder law Ob 4.', {
    rootRule: stat('perception'), skillType: 'Academic', tools: none, ...magical, availabilityRestrictions: only(['elf']), semanticCategories: ['song'],
    forkSuggestions: guidance({ target: { kind: 'anyOf', targets: [
      { kind: 'skill-family', familyId: 'history', relevance: 'appropriate' }, { kind: 'skill-family', familyId: 'wises', relevance: 'appropriate' },
      { kind: 'category', category: 'song', relevance: 'appropriate' },
    ] } }) }),
  define('mace', 'Mace', 282, 'Fight with a short metal-flanged club intended to crush armor. See Fight for obstacles.', {
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
  define('mason', 'Mason', 282, 'Choose and carve stone, mix mortar, set foundations and build. Obstacles: soft stone blocks or bricks Ob 1; gravestone or mortar Ob 2; marble, granite or basalt Ob 3; slate floor, simple wall or obelisk Ob 2; arch or reinforced wall Ob 3; small stone house or bridge Ob 4; large reinforced wall Ob 5; tower Ob 6; donjon Ob 7.', {
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
  define('mending', 'Mending', 283, 'Repair farm or household goods. Obstacles: fences or socks Ob 1; household repairs Ob 2; breakages on the road or at work Ob 3; badly broken goods Ob 4. Armor damage: light (1D) Ob 1; moderate (2D) Ob 2; bad (3D) Ob 4; shredded (4D) Ob 6; ruined (5D) Ob 8.', {
    rootRule: combined('perception', 'agility'), skillType: 'Peasant', tools: expendable,
    forkSuggestions: guidance({ target: { kind: 'skill-type', skillType: 'Craftsman', relevance: 'appropriate' } }), integrationTags: ['equipment'] }),
  define('mercenary-company-wise', 'Mercenary Company-wise', 283, 'Knowledge of mercenary companies.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'mercenary-company' } }),
  define('metal-wise', 'Metal-wise', 283, 'Knowledge of metals.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'metal' } }),
  define('midwifery', 'Midwifery', 283, 'Help mothers and children through childbirth. Obstacles: keep mother and child healthy Ob 2; uncomplicated birth Ob 3; Caesarean Ob 4; breech birth Ob 5; determine sex before birth Ob 6.', {
    rootRule: combined('will', 'perception'), skillType: 'Medicinal', tools: none, forkSuggestions: forks('herbalism') }),
  define('mill-wise', 'Mill-wise', 283, 'Knowledge of mills.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'mill' } }),
  define('miller', 'Miller', 284, 'Build, maintain and operate grain mills. The workshop is a mill. Obstacles: wind milling Ob 1; water milling Ob 2; manual milling Ob 3; build a manual mill with carpenters’ help Ob 4; build a water mill Ob 5; build a windmill Ob 6.', {
    rootRule: stat('perception'), skillType: 'Peasant', tools: workshop, forkSuggestions: forks('brewer') }),
  define('mimicry', 'Mimicry', 284, 'Imitate sounds and voices. Obstacles: squirrels Ob 1; birds Ob 2; cats, dogs or monkeys Ob 3; Human voices Ob 4.', {
    rootRule: stat('perception'), skillType: 'Forester', tools: none }),
  define('mining', 'Mining', 284, 'Prospect, sink shafts and set up mineral extraction. Obstacles: clay pit Ob 1; open pit for iron or salt Ob 2; shallow shaft for salt, lead, copper or quartz Ob 3; shaft for silver or iron Ob 5; clear rockfall or cave-in Ob 5; deep shaft for gold or gems Ob 9.', {
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

  define('munitions', 'Munitions', 284, 'Manufacture firearms, powder, shot and bombs. Obstacles: clean, load or repair a firearm Ob 1; small bomb (B4 Mark) Ob 2; arquebus, shot or medium bomb (B6 Mark for the bomb) Ob 3; pistol or powder Ob 4; large bomb (B8 Mark) Ob 5; very large bomb (B12 Mark) Ob 7. Zero successes making powder or explosives cause a cook-off or misfire; the maker takes the device’s Mark.', {
    rootRule: combined('perception', 'agility'), skillType: 'Artisan', tools: workshop,
    forkSuggestions: forks('alchemy'), availabilityRestrictions: only(['human'], 'character-burning'),
    integrationTags: ['equipment', 'injury'], adverseOutcomes: [{
      trigger: { kind: 'zero-successes' },
      when: { kind: 'crafting-subject', operation: 'manufacturing', anyOf: [{ category: 'powder' }, { category: 'explosive' }] },
      sourceOutcomeLabels: ['cook-off', 'misfire'],
      outcome: { kind: 'damage', recipient: 'maker', severity: {
        kind: 'created-item-damage-reference', result: 'mark', resolution: 'manual-contextual' } },
    }] }),
  define('music-composition', 'Music Composition', 285, 'Write notation and compose vocal or instrumental music. Obstacles: simple solo Ob 1; simple choral arrangement Ob 2; ensemble Ob 3; complex solo Ob 4; complex ensemble Ob 5.', {
    rootRule: combined('will', 'perception'), skillType: 'Musical', tools: expendable }),

  define('musical-instrument', 'Musical Instrument', 285, 'Perform music on a chosen instrument, such as drum, flute or lyre, to convey ideas or affect listeners; tests can serve as linked tests.', {
    rootRule: combined('will', 'agility'), skillType: 'Musical', tools: item('instrument'), semanticCategories: ['musical-instrument'],
    forkSuggestions: guidance(fork('sing'), fork('composition'), { target: { kind: 'category', category: 'musical-instrument', relevance: 'any' } }),
    testProfile: { kind: 'obstacle', base: { kind: 'target-ability-exponent', targetRole: 'listener', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' },
      modifiers: [{ effect: { kind: 'advantage', resolution: 'canonical' }, when: { kind: 'music-mood-suitability', relation: 'suitable' } }] } }),
  define('mystery-meat-wise', 'Mystery Meat-wise', 285, 'Knowledge of mystery meat.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'mystery-meat' } }),

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
