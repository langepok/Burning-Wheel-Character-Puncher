import type { SkillDefinition } from '../types';
import { combined, define, evidence, expendable, fork, forks, generic, guidance, hatred, item,
  magical, melee, none, only, sourceFork, stat, aptitudeTraining, traveling, workshop, writingTools } from './shared';

const per = stat('perception');
const will = stat('will');
const perAgi = combined('perception', 'agility');
const willPer = combined('will', 'perception');
const histories = { target: { kind: 'skill-family', familyId: 'history', relevance: 'any' } } as const;

/** Reviewed A–D entries; the aggregate catalog is unfinished until all blocks pass the oracle. */
export const aDSkills: readonly SkillDefinition[] = [
  define('accounting', 'Accounting', 253, 'Track income, expenses, stocks and taxes; primarily used to recover taxed Resources. Obstacles: simple single-income, single-residence taxes Ob 1; personal finances Ob 2; family income Ob 3; small business books Ob 4; estate books Ob 5; large business books Ob 6; town books Ob 7; city books Ob 8; province books Ob 9; nation books Ob 10.', {
    rootRule: per, skillType: 'Academic', tools: generic,
    forkSuggestions: guidance(fork('research'), sourceFork('Reading', 'read'), fork('administration'), fork('estate-management')),
    resourceInteractions: [{ kind: 'recover-taxed-resources' }], integrationTags: ['resources'],
  }),
  define('acting', 'Acting', 253, 'Imitate and recite for a performance. Obstacles: mummery Ob 1; morality play Ob 2; religious miracle Ob 3; religious mystery Ob 4; classics Ob 5.', { rootRule: per, skillType: 'Special', tools: none,
    forkSuggestions: forks('conspicuous', 'falsehood') }),
  { ...define('administration', 'Administration', 253, 'Run a business or organization; primarily used to recover taxed Resources. Obstacles: yourself Ob 1; shop Ob 2; confraternity Ob 3; small commune Ob 4; small guild Ob 5; small secret society Ob 6; large secret society Ob 7; small trading concern Ob 8; large guild Ob 9; giant trading concern Ob 10.', {
    rootRule: per, skillType: 'Special', tools: none, resourceInteractions: [{ kind: 'recover-taxed-resources' }], integrationTags: ['resources'] }),
    source: [evidence('Administration', 253), evidence('Administration (continued)', 254)],
  },
  define('ages-of-the-etharch', 'Ages of the Etharch', 254, 'Specialized History of the Etharchs. Obstacles: current age Ob 1; Third Age Ob 2; Second Age Ob 3; First Age Ob 4; Years of the Sun Ob 5; before the first Etharchs Ob 6.', {
    rootRule: willPer, skillType: 'Academic', tools: none, ...magical, availabilityRestrictions: only(['elf']),
    familyMembership: { familyId: 'history', topicId: 'ages-of-the-etharch' } }),
  define('alchemy', 'Alchemy', 254, 'Distill materials to identify their essences or mix arcane substances to produce a specific effect. Distillation obstacles: earth Ob 1; water or other liquid Ob 2; metal Ob 3; blood Ob 4.', {
    rootRule: per, skillType: 'Sorcerous', tools: expendable, availabilityRestrictions: only(['human']),
    forkSuggestions: forks('enchanting', 'herbalism', 'apothecary', 'munitions', 'poisons'), integrationTags: ['magic'] }),
  define('almanac', 'Almanac', 254, 'Knowledge of seasons, tides, weather and lunar phases. A character with the skill can always tell the time of year nearly to the day and can make accurate predictions about the season’s weather. Obstacles: general seasonal weather Ob 1; planting and harvest times Ob 2; reasonably accurate weather prediction Ob 3; festivals and holidays Ob 4.', { rootRule: per, skillType: 'Peasant', tools: none }),
  define('amercement', 'Amercement', 254, 'Assess judicial fines, usually offered in place of corporal punishment. Skill-test obstacles measure how accurate and just the assessment is under the law: low justice (fine only) Ob 2; middle justice (amputation, branding or fine) Ob 3; high justice (capital crimes) Ob 5.', {
    rootRule: per, skillType: 'School of Thought', tools: none, integrationTags: ['resources'],
    capabilities: [{ kind: 'subsystem-capability', id: 'judicial-fine-assessment', integrationId: 'amercement-judicial-fine-assessment' }] }),
  define('ancient-languages', 'Ancient Languages', 254, 'Know defunct languages appropriate to the setting. Uses Foreign Languages mechanics.', {
    rootRule: per, skillType: 'Academic', tools: none, relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'foreign-languages' } }] }),
  define('anatomy', 'Anatomy', 255, 'Study the human body’s structure and internal functions. Obstacles: dog anatomy Ob 1; superficial human anatomy Ob 2; major human organs Ob 3; circulatory system Ob 4; human dissection Ob 5.', {
    rootRule: per, skillType: 'Academic', tools: none, forkSuggestions: forks('surgery', 'field-dressing') }),
  define('animal-husbandry', 'Animal Husbandry', 255, 'Raise, care for and breed animals. Obstacles: chickens Ob 1; pigs or goats Ob 2; cows or horses Ob 3; exotic animals Ob 4. For tending wounds and illness use the separate obstacle reference.', {
    rootRule: will, skillType: 'Peasant', tools: generic, integrationTags: ['injury'],
    relations: [{ kind: 'obstacle-reference', targets: { kind: 'anyOf', targets: [
      { kind: 'skill', skillId: 'field-dressing' }, { kind: 'skill', skillId: 'apothecary' },
    ] }, context: { kind: 'activity', activity: 'tending-wounds-and-illness' } }] }),
  define('antiphon-union-training', 'Antiphon Union Training', 255, 'Imbue an item created through a skill song with a spell song.', {
    rootRule: will, skillType: 'Artisan', tools: none, training: aptitudeTraining, printedMarkers: ['*'], availabilityRestrictions: only(['elf']),
    integrationTags: ['magic'], capabilities: [{ kind: 'subsystem-capability', id: 'antiphon-base-item-creation', integrationId: 'antiphon-creation' }] }),
  define('apothecary', 'Apothecary', 255, 'Preparations for ailments and wound symptoms.', {
    rootRule: per, skillType: 'Medicinal', tools: expendable, forkSuggestions: forks('herbalism'), integrationTags: ['injury'] }),
  define('appraisal', 'Appraisal', 255, 'Estimate item value before a Resources purchase.', {
    rootRule: per, skillType: 'Special', tools: none, integrationTags: ['resources'], forkSuggestions: guidance({ target: {
      kind: 'anyOf', targets: [ { kind: 'skill-family', familyId: 'wises', relevance: 'appropriate' },
        { kind: 'skill-type', skillType: 'Academic', relevance: 'appropriate' },
        { kind: 'skill-type', skillType: 'Artisan', relevance: 'appropriate' },
        { kind: 'skill-type', skillType: 'Craftsman', relevance: 'appropriate' } ],
    } }) }),
  define('archcraft', 'Archcraft', 256, 'Elven architecture and engineering.', {
    rootRule: combined('will', 'agility'), skillType: 'Artisan', tools: workshop, ...magical, availabilityRestrictions: only(['elf']),
    forkSuggestions: forks('woodcraft', 'stonecraft'), relations: ['architect', 'engineering'].map(id => ({ kind: 'includes-capability', target: { kind: 'skill', id } })),
    integrationTags: ['magic', 'equipment'] }),
  define('architect', 'Architect', 256, 'Plans and navigation of complex structures.', {
    rootRule: per, skillType: 'Academic', tools: workshop, forkSuggestions: guidance(sourceFork('Engineer', 'engineering'), fork('mason'), sourceFork('Carpenter', 'carpentry')) }),
  define('armor-training', 'Armor Training', 256, 'Training mitigates armor and armor-fatigue penalties; Clumsy Weight remains.', {
    rootRule: combined('power', 'speed'), skillType: 'Martial Training', tools: none, training: aptitudeTraining, printedMarkers: ['*'], integrationTags: ['equipment'] }),
  define('armorer', 'Armorer', 256, 'Manufacture armor and shields.', { rootRule: perAgi, skillType: 'Craftsman', tools: workshop,
    forkSuggestions: forks('blacksmith', 'sewing', 'tanner'), integrationTags: ['equipment'] }),
  define('arson', 'Arson', 257, 'Set buildings ablaze with common materials.', {
    rootRule: perAgi, skillType: 'Special', tools: expendable, availabilityRestrictions: only(['human', 'roden'], 'character-burning') }),
  define('artillerist', 'Artillerist', 257, 'Design and operate war engines; black-powder use is an alternate campaign rule.', {
    rootRule: per, skillType: 'Military', tools: workshop, forkSuggestions: guidance(sourceFork('Engineer', 'engineering'), fork('architect')),
    integrationTags: ['equipment', 'military-campaign'] }),
  define('artillery-hand', 'Artillery Hand', 257, 'Assemble and crew direct-fire artillery; indirect fire uses Artillerist.', {
    rootRule: perAgi, skillType: 'Special', tools: generic, availabilityRestrictions: only(['dwarf'], 'character-burning'), forkSuggestions: forks('artillerist') }),
  define('astrology', 'Astrology', 257, 'Celestial interpretation with a special FoRK die or a safer linked test.', {
    rootRule: per, skillType: 'Academic', tools: generic, availabilityRestrictions: only(['human']),
    forkSuggestions: forks('doctrine', 'symbology'), specialForkBehaviorId: 'astrology-fork' }),
  define('atilliator', 'Atilliator', 258, 'Manufacture and maintain crossbows.', { rootRule: perAgi, skillType: 'Craftsman', tools: workshop,
    forkSuggestions: guidance(fork('bowyer'), fork('blacksmith'), sourceFork('Carpenter', 'carpentry')), integrationTags: ['equipment'] }),
  define('aura-reading', 'Aura Reading', 258, 'Interpret visible auras; does not itself grant aura perception.', {
    rootRule: willPer, skillType: 'Sorcerous', tools: none, useRequirements: [{ kind: 'capability', id: 'aura-perception', use: 'aura-perception' }], integrationTags: ['magic'] }),
  define('axe', 'Axe', 258, 'Blade and haft strikes with axes.', { rootRule: combined('power', 'agility'), skillType: 'Martial', tools: item('axe'),
    semanticCategories: ['melee-weapon'], forkSuggestions: guidance(fork('brawling'), fork('martial-arts'), melee), integrationTags: ['fight'] }),
  define('baking', 'Baking', 258, 'Bread, cakes and pastries.', { rootRule: perAgi, skillType: 'Peasant', tools: workshop, forkSuggestions: forks('cooking') }),
  define('ballad-of-history', 'Ballad of History', 259, 'Mnemonic Elven history songs.', { rootRule: per, skillType: 'Academic', tools: none,
    ...magical, availabilityRestrictions: only(['elf']), semanticCategories: ['song'], forkSuggestions: guidance({ target: {
      kind: 'anyOf', targets: [{ kind: 'skill-family', familyId: 'history', relevance: 'appropriate' },
        { kind: 'skill-family', familyId: 'wises', relevance: 'appropriate' }, { kind: 'category', category: 'song', relevance: 'appropriate' }],
    } }) }),
  define('bastions-of-hatred', 'Bastions of Hatred', 259, 'Orc fortresses combine architecture and engineering.', {
    rootRule: hatred, skillType: 'Artisan', tools: workshop, ...magical, availabilityRestrictions: only(['orc']),
    forkSuggestions: forks('siege-engineer'), relations: ['architect', 'engineering'].map(id => ({ kind: 'includes-capability', target: { kind: 'skill', id } })), integrationTags: ['equipment'] }),
  define('beer-appraisal', 'Beer Appraisal', 259, 'Discern ingredients and preparation of beer.', {
    rootRule: willPer, skillType: 'Craftsman', tools: none, availabilityRestrictions: only(['dwarf'], 'character-burning'), forkSuggestions: forks('grain-appraisal', 'nogger') }),
  define('beggardry', 'Beggardry', 259, 'Begging can produce 1D cash or replenish taxed Resources.', {
    rootRule: will, skillType: 'Social', tools: none, forkSuggestions: forks('persuasion', 'falsehood', 'soothing-platitudes'),
    resourceInteractions: [{ kind: 'recover-taxed-resources' }, { kind: 'produce-cash' }], integrationTags: ['resources'] }),
  define('bird-husbandry', 'Bird Husbandry', 259, 'Raise and tend birds, including wounds and illness.', {
    rootRule: will, skillType: 'Forester', tools: generic, integrationTags: ['injury'],
    relations: [{ kind: 'obstacle-reference', targets: { kind: 'anyOf', targets: [
      { kind: 'skill', skillId: 'field-dressing' }, { kind: 'skill', skillId: 'apothecary' },
    ] }, context: { kind: 'activity', activity: 'tending-wounds-and-illness' } }] }),
  define('black-legion-wise', 'Black Legion-wise', 260, 'Knowledge of the legions and their workings.', {
    rootRule: per, skillType: 'Wise', tools: generic, familyMembership: { familyId: 'wises', topicId: 'black-legion' }, forkSuggestions: forks('orc-wise') }),
  define('black-metal-artifice', 'Black Metal Artifice', 260, 'Dwarven metal tools, with an option to increase difficulty for enhanced tools.', {
    capabilities: [{ kind: 'subsystem-capability', id: 'black-metal-tool-use-bonus', integrationId: 'black-metal-artifice-use' }],
    rootRule: combined('will', 'agility'), skillType: 'Craftsman', tools: workshop, ...magical, availabilityRestrictions: only(['dwarf']),
    forkSuggestions: forks('white-metal-artifice', 'war-art'), integrationTags: ['equipment', 'magic'] }),
  define('blacksmith', 'Blacksmith', 260, 'Forge iron and steel; Resources recovery needs a suitable workplace.', {
    rootRule: combined('agility', 'power'), skillType: 'Craftsman', tools: workshop, forkSuggestions: forks('armorer', 'weaponsmith'),
    resourceInteractions: [{ kind: 'recover-taxed-resources', context: { kind: 'circumstance', circumstanceId: 'suitable-workplace' } }], integrationTags: ['equipment', 'resources'] }),
  define('bloodletting', 'Bloodletting', 260, 'Blood treatment and stopping bleeding.', { rootRule: per, skillType: 'Medicinal', tools: generic,
    forkSuggestions: forks('apothecary', 'surgery'), integrationTags: ['injury'] }),
  define('boatwright', 'Boatwright', 260, 'Build and repair small watercraft.', { rootRule: perAgi, skillType: 'Craftsman', tools: workshop,
    forkSuggestions: guidance(sourceFork('Carpenter', 'carpentry')), integrationTags: ['equipment'] }),
  define('bow', 'Bow', 261, 'Archery in Fight and Range and Cover.', { rootRule: stat('agility'), skillType: 'Martial', tools: item('bow'), integrationTags: ['fight', 'range-and-cover'] }),
  define('bowcraft', 'Bowcraft', 261, 'Elven bow making from living branches.', { rootRule: combined('will', 'agility'), skillType: 'Craftsman', tools: expendable,
    ...magical, availabilityRestrictions: only(['elf']), forkSuggestions: forks('woodcraft'), integrationTags: ['equipment'] }),
  define('bowyer', 'Bowyer', 261, 'Make bows, arrows and bowstrings.', { rootRule: perAgi, skillType: 'Craftsman', tools: expendable,
    forkSuggestions: guidance(sourceFork('Carpenter', 'carpentry'), fork('carving')), integrationTags: ['equipment'] }),
  define('boxing', 'Boxing (Martial Arts)', 261, 'Trained unarmed fighting; Martial Arts is a separate identity using these mechanics.', {
    rootRule: combined('power', 'agility'), skillType: 'Martial', tools: none, sourceAliases: ['Boxing'],
    forkSuggestions: guidance(fork('brawling'), melee), integrationTags: ['fight'] }),
  define('brawling', 'Brawling', 261, 'Untrained fighting, found weapons, and Power substitution for Lock and Push.', {
    rootRule: stat('power'), skillType: 'Martial', tools: none, forkSuggestions: guidance(fork('boxing'), melee), integrationTags: ['fight'],
    relations: [{ kind: 'contextual-substitution', target: { kind: 'stat', id: 'power' }, context: { kind: 'circumstance', circumstanceId: 'fight-lock-or-push' } }] }),
  define('brazen-horn-of-despair', 'Brazen Horn of Despair', 261, 'Orc war horns increase the opposing force\'s hesitation.', {
    rootRule: hatred, skillType: 'Musical', tools: item('brazen-horn'), ...magical, availabilityRestrictions: only(['orc']), integrationTags: ['military-campaign'] }),
  define('brewer', 'Brewer', 262, 'Grain fermentation and brewing.', { rootRule: per, skillType: 'Craftsman', tools: workshop, forkSuggestions: forks('miller') }),
  define('brutal-intimidation', 'Brutal Intimidation', 262, 'Orc intimidation rooted in Hatred.', { rootRule: hatred, skillType: 'Social', tools: none,
    ...magical, availabilityRestrictions: only(['orc']), relations: [{ kind: 'specialized-version', target: { kind: 'skill', id: 'intimidation' } }],
    forkSuggestions: guidance({ target: { kind: 'skill', skillId: 'torture' }, context: { kind: 'circumstance', circumstanceId: 'torture-applicable' } }, fork('interrogation')) }),
  define('bureaucracy', 'Bureaucracy', 262, 'Navigate government hierarchies and administrative procedures.', { rootRule: will, skillType: 'Special', tools: none,
    forkSuggestions: forks('research', 'etiquette', 'soothing-platitudes', 'falsehood') }),
  define('butchery', 'Butchery', 262, 'Prepare animal carcasses for food.', { rootRule: perAgi, skillType: 'Peasant', tools: generic }),
  define('call-of-the-wild', 'Call of the Wild', 262, 'Elven hunting skill song.', { rootRule: perAgi, skillType: 'Peasant', tools: generic,
    ...magical, availabilityRestrictions: only(['elf']), semanticCategories: ['song'], relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'hunting' } }],
    forkSuggestions: guidance(fork('song-of-paths-and-ways'), sourceFork('Rhyme of Rules')) }),
  define('calligraphy', 'Calligraphy', 263, 'Formal decorative handwriting.', { rootRule: perAgi, skillType: 'Academic', tools: generic, forkSuggestions: forks('write') }),
  define('carpentry', 'Carpentry', 263, 'Timber construction and taxed Resources recovery.', { rootRule: perAgi, skillType: 'Craftsman', tools: workshop,
    forkSuggestions: guidance(sourceFork('Engineer', 'engineering'), fork('carving')), resourceInteractions: [{ kind: 'recover-taxed-resources' }], integrationTags: ['resources'] }),
  define('cartography', 'Cartography', 263, 'Create and interpret maps.', { rootRule: perAgi, skillType: 'Academic', tools: expendable, forkSuggestions: guidance(fork('calligraphy'), sourceFork('Illumination', 'illuminations')) }),
  define('cartwright', 'Cartwright', 263, 'Construct wheeled vehicles.', { rootRule: perAgi, skillType: 'Craftsman', tools: workshop, forkSuggestions: forks('carpentry'), integrationTags: ['equipment'] }),
  define('carving', 'Carving', 263, 'Shape and decorate wood.', { rootRule: perAgi, skillType: 'Craftsman', tools: traveling, forkSuggestions: forks('carpentry', 'etching', 'engraving') }),
  define('chandler', 'Chandler', 263, 'Produce candles from wax and tallow.', { rootRule: perAgi, skillType: 'Craftsman', tools: expendable }),
  define('child-rearing', 'Child-Rearing', 264, 'Care and teaching for children.', { rootRule: will, skillType: 'Social', tools: none,
    relations: ['instruction', 'cooking', 'field-dressing'].map(id => ({ kind: 'contextual-substitution', target: { kind: 'skill', id }, context: { kind: 'subject', subject: 'children' } })) }),
  define('chronology-of-kings', 'Chronology of Kings', 264, 'The history of Dwarven kings and princes.', { rootRule: per, skillType: 'Academic', tools: none, forkSuggestions: forks('ancient-history', 'obscure-history') }),
  define('church-law', 'Church Law', 264, 'Ecclesiastical law and religious punishments.', { rootRule: per, skillType: 'School of Thought', tools: none }),
  define('clan-history', 'Clan History', 264, 'Dwarven clan deeds, oaths and grudges.', { rootRule: per, skillType: 'Academic', tools: none, availabilityRestrictions: only(['dwarf'], 'character-burning') }),
  define('climbing', 'Climbing', 264, 'Climb steep surfaces.', { rootRule: stat('speed'), skillType: 'Physical', tools: expendable, forkSuggestions: forks('knots', 'rigging') }),
  define('cloth-dyeing', 'Cloth Dyeing', 264, 'Color cloth with lasting dyes.', { rootRule: perAgi, skillType: 'Craftsman', tools: expendable, forkSuggestions: forks('herbalism', 'vintner') }),
  define('coarse-persuasion', 'Coarse Persuasion', 265, 'Dwarven social persuasion, including Persuasion use in Duel of Wits.', { rootRule: will, skillType: 'Social', tools: none,
    ...magical, availabilityRestrictions: only(['dwarf']), forkSuggestions: forks('intimidation', 'interrogation', 'ugly-truth'), integrationTags: ['duel-of-wits'],
    relations: [{ kind: 'contextual-substitution', target: { kind: 'skill', id: 'persuasion' }, context: { kind: 'circumstance', circumstanceId: 'duel-of-wits' } }] }),
  define('cobbler', 'Cobbler', 265, 'Make shoes and boots.', { rootRule: perAgi, skillType: 'Craftsman', tools: expendable }),
  define('code-of-citadels', 'Code of Citadels', 265, 'Etiquette for Citadel-born Elves.', { rootRule: willPer, skillType: 'Social', tools: none, ...magical,
    availabilityRestrictions: only(['elf']), forkSuggestions: forks('etiquette'), relations: [{ kind: 'contextual-substitution', target: { kind: 'skill', id: 'etiquette' },
      context: { kind: 'allOf', conditions: [{ kind: 'target-stock', stockId: 'elf' }, { kind: 'target-origin', originId: 'citadel-born' }] } }] }),
  define('command', 'Command', 265, 'Battlefield orders, hesitation relief and linked field maneuvers.', { rootRule: will, skillType: 'Social', tools: none,
    forkSuggestions: forks('oratory', 'conspicuous'), integrationTags: ['fight', 'range-and-cover'] }),
  define('composition', 'Composition', 265, 'Formal written composition.', { rootRule: willPer, skillType: 'Academic', tools: expendable,
    forkSuggestions: guidance(fork('calligraphy'), fork('write'), fork('research'), { target: { kind: 'applicable-to-content' } }) }),
  define('conspicuous', 'Conspicuous', 266, 'Attract attention in a crowd or scene.', { rootRule: will, skillType: 'Social', tools: none, forkSuggestions: forks('command', 'oratory') }),
  define('cooking', 'Cooking', 266, 'Prepare meals.', { rootRule: per, skillType: 'Peasant', tools: traveling, forkSuggestions: forks('herbalism', 'apothecary', 'baking') }),
  define('cooper', 'Cooper', 266, 'Make barrels.', { rootRule: perAgi, skillType: 'Peasant', tools: workshop, forkSuggestions: guidance(sourceFork('Carpenter', 'carpentry')) }),
  define('coppersmith', 'Coppersmith', 266, 'Copper craftwork.', { rootRule: perAgi, skillType: 'Craftsman', tools: workshop, forkSuggestions: forks('blacksmith', 'whitesmith') }),
  define('counterfeiting', 'Counterfeiting', 266, 'Falsify coinage and printed money.', { rootRule: perAgi, skillType: 'Craftsman', tools: expendable, forkSuggestions: forks('forgery', 'whitesmith', 'alchemy', 'etching') }),
  define('crossbow', 'Crossbow', 266, 'Crossbow use in Fight and Range and Cover.', { rootRule: stat('agility'), skillType: 'Martial', tools: item('crossbow'), integrationTags: ['fight', 'range-and-cover'] }),
  define('cryptography', 'Cryptography', 267, 'Create and decipher codes.', { rootRule: per, skillType: 'Academic', tools: none, forkSuggestions: forks('symbology', 'astrology', 'obscure-history') }),
  define('cudgel', 'Cudgel', 267, 'Fight with short clubs and long blunt implements.', { rootRule: stat('agility'), skillType: 'Martial', tools: item('big-stick'),
    semanticCategories: ['melee-weapon'], forkSuggestions: guidance(fork('brawling'), fork('martial-arts'), fork('boxing'), { target: { kind: 'category', category: 'melee-weapon', relevance: 'any' } }), integrationTags: ['fight'] }),
  define('dance', 'Dance', 267, 'Expressive movement in rhythm.', { rootRule: stat('speed'), skillType: 'Physical', tools: none, forkSuggestions: forks('acting', 'seduction') }),
  define('demonology', 'Demonology', 267, 'Knowledge of demons, separate from summoning.', { rootRule: per, skillType: 'Academic', tools: none, forkSuggestions: forks('ancient-history', 'obscure-history', 'summoning', 'doctrine') }),
  define('dignity-of-the-wilderlands', 'Dignity of the Wilderlands', 267, 'Etiquette for Wilder-born Elves.', { rootRule: willPer, skillType: 'Social', tools: none,
    ...magical, availabilityRestrictions: only(['elf']), semanticCategories: ['song'], forkSuggestions: forks('etiquette'), relations: [{ kind: 'contextual-substitution', target: { kind: 'skill', id: 'etiquette' },
      context: { kind: 'allOf', conditions: [{ kind: 'target-stock', stockId: 'elf' }, { kind: 'target-origin', originId: 'wilder-born' }] } }] }),
  define('disguise', 'Disguise', 267, 'Alter apparent gender, social class or ancestry.', { rootRule: perAgi, skillType: 'Special', tools: expendable, forkSuggestions: forks('acting', 'theatrics') }),
  define('ditch-digging', 'Ditch Digging', 268, 'Dig holes and earthworks.', { rootRule: stat('power'), skillType: 'Peasant', tools: generic }),
  define('doctrine', 'Doctrine', 268, 'Tenets of a particular religious faith.', { rootRule: per, skillType: 'School of Thought', tools: none, forkSuggestions: forks('philosophy') }),
  define('cult-doctrine', 'Cult Doctrine', 268, 'Doctrine variation for an independent or unapproved faith; acquired from an available lifepath grant or General points.', {
    rootRule: per, skillType: 'School of Thought', tools: none, forkSuggestions: forks('philosophy'), relations: [{ kind: 'specialized-version', target: { kind: 'skill', id: 'doctrine' } }] }),
  define('foreign-doctrine', 'Foreign Doctrine', 268, 'Doctrine variation for a religion from another culture; acquired from an available lifepath grant or General points.', {
    rootRule: per, skillType: 'School of Thought', tools: none, forkSuggestions: forks('philosophy'), relations: [{ kind: 'specialized-version', target: { kind: 'skill', id: 'doctrine' } }] }),
  define('heretical-doctrine', 'Heretical Doctrine', 268, 'Doctrine variation for an unaccepted religious offshoot; acquired from an available lifepath grant or General points.', {
    rootRule: per, skillType: 'School of Thought', tools: none, forkSuggestions: forks('philosophy'), relations: [{ kind: 'specialized-version', target: { kind: 'skill', id: 'doctrine' } }] }),
  define('doctrine-of-nights-blood', "Doctrine of Night's Blood", 268, 'The Servant\'s Cult and its laws.', { rootRule: willPer, skillType: 'School of Thought', tools: none,
    availabilityRestrictions: only(['orc'], 'character-burning'), forkSuggestions: forks('servant-wise') }),
  define('drinking', 'Drinking', 268, 'Become drunk without showing it.', { rootRule: stat('forte'), skillType: 'Special', tools: none }),
  define('driving', 'Driving', 268, 'Drive carts and carriages; substitutes for Riding in pursuit and travel.', { rootRule: combined('will', 'agility'), skillType: 'Peasant', tools: none,
    relations: [{ kind: 'contextual-substitution', target: { kind: 'skill', id: 'riding' }, context: { kind: 'anyOf', conditions: [
      { kind: 'activity', activity: 'pursuit' }, { kind: 'activity', activity: 'travel' }] } }], integrationTags: ['range-and-cover'] }),
  define('drum-maker', 'Drum Maker', 269, 'Make percussion instruments.', { rootRule: perAgi, skillType: 'Craftsman', tools: none, forkSuggestions: forks('carpentry') }),
  define('drunking', 'Drunking', 269, 'Dwarven conspicuous, rapid inebriation.', { rootRule: combined('will', 'forte'), skillType: 'Special', tools: none,
    ...magical, availabilityRestrictions: only(['dwarf']), forkSuggestions: forks('beer-wise') }),
  define('dwarven-rune-script', 'Dwarven Rune Script', 269, 'Dwarven reading and writing; only writing requires tools.', { rootRule: per, skillType: 'Academic', tools: writingTools,
    availabilityRestrictions: only(['dwarf'], 'character-burning'), forkSuggestions: guidance(histories, fork('chronology-of-kings')),
    capabilities: [{ kind: 'literacy', actions: ['read', 'write'], context: { kind: 'culture', cultureId: 'dwarven' } }] }),
  define('dye-manufacture', 'Dye Manufacture', 269, 'Find materials and manufacture dyes.', { rootRule: perAgi, skillType: 'Craftsman', tools: expendable }),
];

export const aDIntegrations = [{ id: 'antiphon-creation', skillId: 'antiphon-union-training', subsystem: 'magic',
  baseItemCreation: { stage: 'base-item-creation', requiredMethod: { kind: 'applicable-skill-song' },
    follows: 'selected-skill-own-rules-and-tools', obstacle: { kind: 'natural-obstacle-with-minimum', minimum: 5 },
    requiredQuality: 'highest-quality' },
  spellSongTransfer: { after: 'base-item-creation', follows: 'spell-song-own-rules', attempts: 1,
    effect: { target: 'created-item', activeWhen: 'item-used' } },
  summary: 'A skill song creates the base item by its own rules and tools, with at least Ob 5. Only highest-quality work holds the effect. Then sing the spell song under its own rules with one transfer attempt. The effect is active whenever the item is used.',
  source: [evidence('Antiphon Union Training', 255)],
}] as const;
