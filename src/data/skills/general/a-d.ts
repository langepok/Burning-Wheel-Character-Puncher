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
  define('apothecary', 'Apothecary', 255, 'Prepare medicines to prevent or treat ailments, ease infection or illness symptoms, or ease wound penalties. Other preparations: relieve itching Ob 2; cure warts Ob 3.', {
    rootRule: per, skillType: 'Medicinal', tools: expendable, forkSuggestions: forks('herbalism'), integrationTags: ['injury'],
    capabilities: [{ kind: 'subsystem-capability', id: 'medicinal-preparations', integrationId: 'apothecary-medicines' }] }),
  { ...define('appraisal', 'Appraisal', 255, 'Judge an item’s value; can be used before a Resources test to establish an accurate price. Appraisal obstacles: coins or precious metals Ob 1; gems Ob 2; tapestries Ob 3; armaments Ob 3; antiquities Ob 4; art Ob 5; ephemera (such as wine, drugs or candles) Ob 6.', {
    testProfile: { kind: 'contextual', modifiers: [{
      when: { kind: 'circumstance', circumstanceId: 'appraising-magical-item' },
      effect: { kind: 'obstacle-modifier', delta: 1 },
    }] },
    rootRule: per, skillType: 'Special', tools: none, integrationTags: ['resources'], forkSuggestions: guidance({ target: {
      kind: 'anyOf', targets: [ { kind: 'skill-family', familyId: 'wises', relevance: 'appropriate' },
        { kind: 'skill-type', skillType: 'Academic', relevance: 'appropriate' },
        { kind: 'skill-type', skillType: 'Artisan', relevance: 'appropriate' },
        { kind: 'skill-type', skillType: 'Craftsman', relevance: 'appropriate' } ],
    } }) }), source: [evidence('Appraisal', 255), evidence('Appraisal (continued)', 256)] },
  define('archcraft', 'Archcraft', 256, 'Design and build Elven halls with architecture and engineering. Antiphon Union and spell songs enable enchanted dwellings. Examples include buildings woven around trees with Song of Arbors, gates that warn of intruders with Alarm, and an atrium that predicts weather with Weathersong. Obstacles: simple arch Ob 1; small gate Ob 2; large gate Ob 3; chamber Ob 4; domed hall Ob 5.', {
    rootRule: combined('will', 'agility'), skillType: 'Artisan', tools: workshop, ...magical, availabilityRestrictions: only(['elf']),
    forkSuggestions: forks('woodcraft', 'stonecraft'), relations: ['architect', 'engineering'].map(id => ({ kind: 'includes-capability', target: { kind: 'skill', id } })),
    integrationTags: ['magic', 'equipment'], capabilities: [{ kind: 'subsystem-capability', id: 'archcraft-antiphon', integrationId: 'archcraft-antiphon' }] }),
  define('architect', 'Architect', 256, 'Draw accurate plans for a proposed structure, attempt plans for an existing structure, or navigate using existing plans. Obstacles: cottage plans Ob 1; longhouse Ob 2; two-story structure Ob 4; tower Ob 5; complex designs such as temples Ob 6; non-Euclidean designs of the Outer Gods Ob 10.', {
    rootRule: per, skillType: 'Academic', tools: workshop, forkSuggestions: guidance(sourceFork('Engineer', 'engineering'), fork('mason'), sourceFork('Carpenter', 'carpentry')) }),
  define('armor-training', 'Armor Training', 256, 'Training mitigates armor and armor-fatigue penalties; Clumsy Weight remains.', {
    rootRule: combined('power', 'speed'), skillType: 'Martial Training', tools: none, training: aptitudeTraining, printedMarkers: ['*'], integrationTags: ['equipment'],
    capabilities: [{ kind: 'subsystem-capability', id: 'armor-training-penalties', integrationId: 'armor-training-penalties' }] }),
  { ...define('armorer', 'Armorer', 256, 'Manufacture armor and shields. Armor obstacles: gambeson, skull cap or leather hood Ob 1; reinforced leather, light helmet or pot helm Ob 2; light mail or spangenhelm Ob 3; heavy mail, open-faced bascinet or barbute Ob 4; plated mail, sallet or closed bascinet Ob 5; full plate or great helm Ob 6. Shield obstacles: target shield Ob 1; buckler Ob 2; great shield Ob 3; kite shield Ob 4.', { rootRule: perAgi, skillType: 'Craftsman', tools: workshop,
    forkSuggestions: forks('blacksmith', 'sewing', 'tanner'), integrationTags: ['equipment'] }),
    source: [evidence('Armorer', 256), evidence('Armorer (continued)', 257)] },
  define('arson', 'Arson', 257, 'Use common household items to quickly set buildings ablaze. Obstacles: thatched cottage Ob 1; munitions dump or powder room Ob 2; house Ob 3; manor Ob 4; fortress Ob 5; prison Ob 6; catacombs Ob 7; castle Ob 8.', {
    rootRule: perAgi, skillType: 'Special', tools: expendable, availabilityRestrictions: only(['human', 'roden'], 'character-burning') }),
  define('artillerist', 'Artillerist', 257, 'Design war engines and lob indirect fire. Shot obstacles: scavenge shot Ob 1; carve stone shot Ob 2. Construction: small traction trebuchet Ob 2; large traction trebuchet Ob 3; small catapult Ob 4; counterweight trebuchet or siege crossbow Ob 5; large catapult Ob 6. Ranging: range a siege crossbow Ob 2; range a small catapult or traction trebuchet Ob 3; range a counterweight trebuchet Ob 3; range a catapult Ob 4.', {
    rootRule: per, skillType: 'Military', tools: workshop, forkSuggestions: guidance(sourceFork('Engineer', 'engineering'), fork('architect')),
    integrationTags: ['equipment', 'military-campaign'],
    capabilities: [{ kind: 'subsystem-capability', id: 'artillery-procedure', integrationId: 'artillerist-procedure' }] }),
  define('artillery-hand', 'Artillery Hand', 257, 'Assemble and dismantle artillery and fire direct-fire machines such as siege crossbows and ballistae. Effective operation of indirect-fire artillery requires Artillerist.', {
    rootRule: perAgi, skillType: 'Special', tools: generic, availabilityRestrictions: only(['dwarf'], 'character-burning'), forkSuggestions: forks('artillerist') }),
  { ...define('astrology', 'Astrology', 257, 'Interpret the celestial sphere. May be a linked test toward any endeavor or gambit without the special FoRK die. Obstacles: name stars and constellations Ob 1; construct a horoscope Ob 2; auspices for an enterprise Ob 3; ask the stars a question Ob 4; interpret celestial phenomena or omens Ob 5.', {
    rootRule: per, skillType: 'Academic', tools: generic, availabilityRestrictions: only(['human']),
    forkSuggestions: forks('doctrine', 'symbology'), specialForkBehaviorId: 'astrology-fork' }),
    source: [evidence('Astrology', 257), evidence('Astrology (continued)', 258)] },
  define('atilliator', 'Atilliator', 258, 'Manufacture and maintain crossbows. Obstacles: crossbow Ob 2; heavy crossbow Ob 3; hand crossbow Ob 4; siege crossbow Ob 5.', { rootRule: perAgi, skillType: 'Craftsman', tools: workshop,
    forkSuggestions: guidance(fork('bowyer'), fork('blacksmith'), sourceFork('Carpenter', 'carpentry')), integrationTags: ['equipment'] }),
  define('aura-reading', 'Aura Reading', 258, 'Interpret visible auras; obtain aura perception separately through a trait, prayer or spell. Obstacles: subject alive/dead or plane of origin Ob 1; aura trait Ob 1; mood Ob 2; character trait Ob 3; die or call-on trait Ob 4; intent Ob 4; Instinct Ob 6; Belief Ob 7; past Ob 8; future Ob 9; magical or mundane object Ob 1; school of magic Ob 2; facet of a spell or enchantment Ob 3; name a spell being cast Ob 6.', {
    rootRule: willPer, skillType: 'Sorcerous', tools: none, useRequirements: [{ kind: 'capability', id: 'aura-perception', use: 'aura-perception' }], integrationTags: ['magic'],
    capabilities: [{ kind: 'subsystem-capability', id: 'spirit-aura-obstacle', integrationId: 'aura-reading-spirit' }] }),
  define('axe', 'Axe', 258, 'Strike with the blade or haft of one- or two-handed axes.', { rootRule: combined('power', 'agility'), skillType: 'Martial', tools: item('axe'),
    semanticCategories: ['melee-weapon'], forkSuggestions: guidance(fork('brawling'), fork('martial-arts'), melee), integrationTags: ['fight'] }),
  define('baking', 'Baking', 258, 'Bake bread, cakes and pastries. Obstacles: peasant bread Ob 1; flat cakes or nice bread Ob 2; cream-filled buns Ob 3; advanced pastry Ob 4.', { rootRule: perAgi, skillType: 'Peasant', tools: workshop, forkSuggestions: forks('cooking') }),
  define('ballad-of-history', 'Ballad of History', 259, 'Mnemonic songs teach Elves their history and that of other peoples. Obstacles: current age Ob 1; Third Age Ob 2; Second Age Ob 3; First Age Ob 4; Years of the Sun Ob 5; Creation and before time Ob 6.', { rootRule: per, skillType: 'Academic', tools: none,
    ...magical, availabilityRestrictions: only(['elf']), semanticCategories: ['song'], forkSuggestions: guidance({ target: {
      kind: 'anyOf', targets: [{ kind: 'skill-family', familyId: 'history', relevance: 'appropriate' },
        { kind: 'skill-family', familyId: 'wises', relevance: 'appropriate' }, { kind: 'category', category: 'song', relevance: 'appropriate' }],
    } }) }),
  define('bastions-of-hatred', 'Bastions of Hatred', 259, 'Combine architecture and engineering to build Orc fortresses or adapt and corrupt existing caves and towers. Obstacles: trench Ob 1; battlefield fortifications Ob 2; palisade wall Ob 3; small tower Ob 4. Existing structures: convert Human structures Ob 1; convert Dwarven structures Ob 2; defile Elven structures Ob 3.', {
    rootRule: hatred, skillType: 'Artisan', tools: workshop, ...magical, availabilityRestrictions: only(['orc']),
    forkSuggestions: forks('siege-engineer'), relations: ['architect', 'engineering'].map(id => ({ kind: 'includes-capability', target: { kind: 'skill', id } })), integrationTags: ['equipment'] }),
  define('beer-appraisal', 'Beer Appraisal', 259, 'Taste to identify grain, brewing method and duration, time spent in the cask and the barrel wood. Obstacles: Dwarven brew Ob 1; Human swill Ob 2; rat wine Ob 3; Elven brew Ob 4; Orcish brew Ob 5.', {
    rootRule: willPer, skillType: 'Craftsman', tools: none, availabilityRestrictions: only(['dwarf'], 'character-burning'), forkSuggestions: forks('grain-appraisal', 'nogger') }),
  define('beggardry', 'Beggardry', 259, 'Begging can produce 1D cash or replenish taxed Resources. Typical obstacle is the victim’s Will; a convincing beggar receives Advantage dice.', {
    rootRule: will, skillType: 'Social', tools: none, forkSuggestions: forks('persuasion', 'falsehood', 'soothing-platitudes'),
    resourceInteractions: [{ kind: 'recover-taxed-resources' }, { kind: 'produce-cash', cashDice: 1 }], integrationTags: ['resources'],
    testProfile: { kind: 'obstacle', context: { kind: 'circumstance', circumstanceId: 'typical-begging-test' },
      base: { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' },
      adjustments: [], modifiers: [{ when: { kind: 'circumstance', circumstanceId: 'convincing-beggar' },
        effect: { kind: 'advantage', resolution: 'canonical' } }] } }),
  define('bird-husbandry', 'Bird Husbandry', 259, 'Raise and care for birds. Obstacles: chickens Ob 1; pigeons Ob 2; raptors Ob 3; exotic birds Ob 4; dinosaurs Ob 5. Wounds and illness use the separate obstacle reference.', {
    rootRule: will, skillType: 'Forester', tools: generic, integrationTags: ['injury'],
    relations: [{ kind: 'obstacle-reference', targets: { kind: 'anyOf', targets: [
      { kind: 'skill', skillId: 'field-dressing' }, { kind: 'skill', skillId: 'apothecary' },
    ] }, context: { kind: 'activity', activity: 'tending-wounds-and-illness' } }] }),
  define('black-legion-wise', 'Black Legion-wise', 260, 'Know the power structure and inner workings of the Orc’s own clan legion and other legions in the region.', {
    rootRule: per, skillType: 'Wise', tools: generic, familyMembership: { familyId: 'wises', topicId: 'black-legion' }, forkSuggestions: forks('orc-wise') }),
  define('black-metal-artifice', 'Black Metal Artifice', 260, 'Produce mundane and household metalwork and toolkits. Obstacles: horseshoes Ob 1; Mason, Stone Art, Cooking, Blacksmith or Black Metal Art tools Ob 2; Armorer, Weaponsmith or War Art tools Ob 3; Khirurgeon tools Ob 4. The optional crafted-tool bonus is a separate integration.', {
    capabilities: [{ kind: 'subsystem-capability', id: 'black-metal-tool-use-bonus', integrationId: 'black-metal-artifice-use' }],
    rootRule: combined('will', 'agility'), skillType: 'Craftsman', tools: workshop, ...magical, availabilityRestrictions: only(['dwarf']),
    forkSuggestions: forks('white-metal-artifice', 'war-art'), integrationTags: ['equipment', 'magic'] }),
  define('blacksmith', 'Blacksmith', 260, 'Forge iron or steel tools, implements and weapons; Resources recovery needs a suitable workplace. Obstacles: nails Ob 1; horseshoes, knives, stirrups or arrowheads Ob 2; spear tips or plow Ob 3; simple tools Ob 3 (Cooking or Blacksmith); swords Ob 4; complex tools Ob 5 (Surgery or Astrology).', {
    rootRule: combined('agility', 'power'), skillType: 'Craftsman', tools: workshop, forkSuggestions: forks('armorer', 'weaponsmith'),
    resourceInteractions: [{ kind: 'recover-taxed-resources', context: { kind: 'circumstance', circumstanceId: 'suitable-workplace' } }], integrationTags: ['equipment', 'resources'] }),
  define('bloodletting', 'Bloodletting', 260, 'Drain blood as a treatment for illness; also stop bleeding. Obstacles are in the Anatomy of Injury chapter.', { rootRule: per, skillType: 'Medicinal', tools: generic,
    forkSuggestions: forks('apothecary', 'surgery'), integrationTags: ['injury'] }),
  define('boatwright', 'Boatwright', 260, 'Build small watercraft, including canoes and tarred longboats. Obstacles: repair or retar Ob 1; dugout, skiff or raft Ob 2; rowboat or small barge Ob 3; large barge or longboat Ob 4; small sailing vessel Ob 5.', { rootRule: perAgi, skillType: 'Craftsman', tools: workshop,
    forkSuggestions: guidance(sourceFork('Carpenter', 'carpentry')), integrationTags: ['equipment'] }),
  define('bow', 'Bow', 261, 'Use a bow in battle; see Fight and Range and Cover for hitting targets.', { rootRule: stat('agility'), skillType: 'Martial', tools: item('bow'), integrationTags: ['fight', 'range-and-cover'] }),
  define('bowcraft', 'Bowcraft', 261, 'Craft Elven bows and arrows. Obstacles: arrows and flights Ob 1; hunting bow Ob 2; great bow Ob 3; horse bow Ob 4; Elven bow Ob 6.', { rootRule: combined('will', 'agility'), skillType: 'Craftsman', tools: expendable,
    ...magical, availabilityRestrictions: only(['elf']), forkSuggestions: forks('woodcraft'), integrationTags: ['equipment'] }),
  define('bowyer', 'Bowyer', 261, 'Make bows and arrows from suitable wood and bowstrings from gut. Obstacles: arrows Ob 1; hunting bow Ob 2; longbow or great bow Ob 3.', { rootRule: perAgi, skillType: 'Craftsman', tools: expendable,
    forkSuggestions: guidance(sourceFork('Carpenter', 'carpentry'), fork('carving')), integrationTags: ['equipment'] }),
  define('boxing', 'Boxing (Martial Arts)', 261, 'Trained unarmed fighting. Martial Arts remains a separate identity using these mechanics. See Fight and Weapons for obstacles.', {
    rootRule: combined('power', 'agility'), skillType: 'Martial', tools: none, sourceAliases: ['Boxing'],
    forkSuggestions: guidance(fork('brawling'), melee), integrationTags: ['fight'],
    capabilities: [{ kind: 'subsystem-capability', id: 'unarmed-combat-access', integrationId: 'boxing-unarmed-access' }],
    relations: [{ kind: 'contextual-substitution', target: { kind: 'stat', id: 'power' }, context: { kind: 'circumstance', circumstanceId: 'fight-lock-or-push' } }] }),
  define('brawling', 'Brawling', 261, 'Undisciplined unarmed fighting, including found weapons such as clubs, brooms, lamps, rocks and shards of glass. See Fight and Weapons for obstacles.', {
    rootRule: stat('power'), skillType: 'Martial', tools: none, forkSuggestions: guidance(fork('boxing'), melee), integrationTags: ['fight'],
    capabilities: [{ kind: 'subsystem-capability', id: 'unarmed-combat-access', integrationId: 'brawling-unarmed-access' }],
    relations: [{ kind: 'contextual-substitution', target: { kind: 'stat', id: 'power' }, context: { kind: 'circumstance', circumstanceId: 'fight-lock-or-push' } }] }),
  define('brazen-horn-of-despair', 'Brazen Horn of Despair', 261, 'Sound war horns before joining battle; exceeding the opposing force’s mean Will adds the margin to its hesitation for the conflict.', {
    rootRule: hatred, skillType: 'Musical', tools: item('brazen-horn'), ...magical, availabilityRestrictions: only(['orc']), integrationTags: ['military-campaign'],
    capabilities: [{ kind: 'subsystem-capability', id: 'opposing-force-hesitation', integrationId: 'brazen-horn-hesitation' }] }),
  define('brewer', 'Brewer', 262, 'Mill grain to ferment into alcohol; requires a mill or ground grain, and a vat if no brewery is available. Obstacles: peasant brew Ob 1; priest’s brew Ob 2; merchant’s brew Ob 3; nobles’ brew Ob 4. Home quantities incur no extra obstacle.', {
    rootRule: per, skillType: 'Craftsman', tools: workshop, forkSuggestions: forks('miller'),
    testProfile: { kind: 'contextual', modifiers: [
      { when: { kind: 'circumstance', circumstanceId: 'brew-for-small-hostel' }, effect: { kind: 'obstacle-modifier', delta: 1 } },
      { when: { kind: 'circumstance', circumstanceId: 'brew-for-tavern-or-pub' }, effect: { kind: 'obstacle-modifier', delta: 2 } },
      { when: { kind: 'circumstance', circumstanceId: 'brew-for-brewery' }, effect: { kind: 'obstacle-modifier', delta: 3 } },
    ] } }),
  define('brutal-intimidation', 'Brutal Intimidation', 262, 'Orc intimidation rooted in Hatred.', { rootRule: hatred, skillType: 'Social', tools: none,
    ...magical, availabilityRestrictions: only(['orc']), relations: [{ kind: 'specialized-version', target: { kind: 'skill', id: 'intimidation' } }],
    forkSuggestions: guidance({ target: { kind: 'skill', skillId: 'torture' }, context: { kind: 'circumstance', circumstanceId: 'torture-applicable' } }, fork('interrogation')) }),
  define('bureaucracy', 'Bureaucracy', 262, 'Navigate or influence government hierarchies. Obstacles: locate a bureau or office Ob 1; file forms Ob 3; form a committee Ob 4; find a coherent policy Ob 5; locate a mid-level bureaucrat Ob 6; get useful information promptly Ob 7; find Lord Julius Ob 8.', { rootRule: will, skillType: 'Special', tools: none,
    forkSuggestions: forks('research', 'etiquette', 'soothing-platitudes', 'falsehood') }),
  define('butchery', 'Butchery', 262, 'Kill and dress animals into edible portions. Obstacles: fowl or small game Ob 1; pig, lamb or goat Ob 2; cow, deer or horse Ob 3; exotic animal Ob 4; monster Ob 5.', { rootRule: perAgi, skillType: 'Peasant', tools: generic }),
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

export const aDIntegrations = [{ id: 'boxing-unarmed-access', skillId: 'boxing', subsystem: 'fight',
  unarmedCombatAccess: { actions: ['attack', 'defense', 'basic'], specialActions: 'permitted' },
  summary: 'Trained unarmed fighting permits all four action categories.', source: [evidence('Boxing (Martial Arts)', 261)],
}, { id: 'brawling-unarmed-access', skillId: 'brawling', subsystem: 'fight',
  unarmedCombatAccess: { actions: ['attack', 'defense', 'basic'], specialActions: 'excluded',
    foundWeapons: { countsAs: 'melee-weapon', actingAbility: 'owning-skill' } },
  summary: 'Brawling excludes special actions; found melee weapons use Brawling.', source: [evidence('Brawling', 261)],
}, { id: 'brazen-horn-hesitation', skillId: 'brazen-horn-of-despair', subsystem: 'military-campaign',
  opposingForceHesitation: { threshold: { kind: 'opposing-force-mean-will' }, trigger: 'exceeds-threshold',
    effect: { kind: 'add-margin-to-opposing-hesitation', duration: 'conflict' } },
  summary: 'Excess over opposing mean Will adds to opposing hesitation for the conflict.', source: [evidence('Brazen Horn of Despair', 261)],
}, { id: 'artillerist-procedure', skillId: 'artillerist', subsystem: 'military-campaign',
  artilleryProcedure: {
    constructionCrew: { laborers: 'teams', minimumCarpenters: 1 },
    blackPowderAlternative: { when: 'campaign-uses-black-powder-weapons',
      covers: ['cannons', 'bombards', 'shot'], activities: ['manufacture', 'operation'],
      bombsAndPowderSkillId: 'munitions' },
  },
  summary: 'Construction requires teams of laborers and at least one carpenter; the black-powder rule is a campaign option.',
  source: [evidence('Artillerist', 257)],
}, { id: 'aura-reading-spirit', skillId: 'aura-reading', subsystem: 'magic',
  spiritAuraObstacle: { kind: 'detect-spirit-presence-and-nature', base: 10, subtract: 'spirit-strength' },
  summary: 'Detect a spirit’s presence and nature at Ob 10 minus its Strength.',
  source: [evidence('Aura Reading', 258)],
}, { id: 'archcraft-antiphon', skillId: 'archcraft', subsystem: 'magic',
  createdItemReference: { kind: 'antiphon-union', target: 'created-item', skillId: 'antiphon-union-training' },
  summary: 'Archcraft creates the dwelling; Antiphon Union and an applicable spell song enable enchantment.',
  source: [evidence('Archcraft', 256)],
}, { id: 'armor-training-penalties', skillId: 'armor-training', subsystem: 'equipment',
  armorTraining: {
    untrained: { appliesTo: 'all-tests', lightMail: 1, heavyMailOrHeavier: 2 },
    trained: { armorObstaclePenalties: 'removed', armorFatiguePenalties: 'mitigated', clumsyWeight: 'still-applies' },
  },
  summary: 'Training removes the untrained armor obstacle penalties and mitigates fatigue for all armor; Clumsy Weight still applies.',
  source: [evidence('Armor Training', 256)],
}, { id: 'apothecary-medicines', skillId: 'apothecary', subsystem: 'injury',
  medicinalPreparations: {
    painRelief: { testObstacle: 3, effect: { kind: 'relieve-pain-obstacle-penalty', magnitude: 1 } },
    localNumbing: { testObstacle: 4, effect: { kind: 'reduce-wound-die-penalty', dice: 1 },
      sideEffect: { kind: 'obstacle-penalty', scope: 'all-tests', delta: 1 },
      duration: { unit: 'hours', amount: 4 } },
  },
  summary: 'Pain relief and local numbing are separate medicines; the numbing tradeoff and duration do not carry over.',
  source: [evidence('Apothecary', 255)],
}, { id: 'antiphon-creation', skillId: 'antiphon-union-training', subsystem: 'magic',
  baseItemCreation: { stage: 'base-item-creation', requiredMethod: { kind: 'applicable-skill-song' },
    follows: 'selected-skill-own-rules-and-tools', obstacle: { kind: 'natural-obstacle-with-minimum', minimum: 5 },
    requiredQuality: 'highest-quality' },
  spellSongTransfer: { after: 'base-item-creation', follows: 'spell-song-own-rules', attempts: 1,
    effect: { target: 'created-item', activeWhen: 'item-used' } },
  summary: 'A skill song creates the base item by its own rules and tools, with at least Ob 5. Only highest-quality work holds the effect. Then sing the spell song under its own rules with one transfer attempt. The effect is active whenever the item is used.',
  source: [evidence('Antiphon Union Training', 255)],
}] as const;
