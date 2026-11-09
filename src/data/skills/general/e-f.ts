import { combined, define, evidence, expendable, fork, forks, generic, guidance, item, magical, none, only, sourceFork, stat, aptitudeTraining, workshop, writingTools } from './shared';

const per = stat('perception');
const perAgi = combined('perception', 'agility');
const circumstance = (circumstanceId: string) => ({ kind: 'circumstance', circumstanceId } as const);
const targetWill = { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' } as const;
/** Reviewed ordinary E–F entries; stock-specific effects remain separate integrations. */
export const eFSkills = [
  define('earth-wise', 'Earth-wise', 269, 'Identify the type, origin and approximate age of earth or stone.', { rootRule: per, skillType: 'Wise', tools: none,
    familyMembership: { familyId: 'wises', topicId: 'earth' } }),
  define('elven-script', 'Elven Script', 270, 'Read and write using the respective Read and Write obstacles. Only writing requires expendable tools.', {
    rootRule: per, skillType: 'Academic', tools: writingTools, availabilityRestrictions: only(['elf'], 'character-burning'),
    capabilities: [{ kind: 'literacy', actions: ['read', 'write'], context: { kind: 'culture', cultureId: 'elven' } }] }),
  define('embroidery', 'Embroidery', 270, 'Stitch cloth designs. Obstacles: simple embellishment Ob 1; fancy dress Ob 3; complex patterns Ob 4; ornate finery Ob 5.', { rootRule: perAgi, skillType: 'Craftsman', tools: expendable,
    forkSuggestions: guidance(fork('sewing'), sourceFork('Weaver', 'weaving')) }),
  define('empyrealia', 'Empyrealia', 270, 'Study the celestial halls, courts and hierarchies. Obstacles: distinguish spirit activity from magic or pranks Ob 1; identify spirit type Ob 2; identify summoning type Ob 3; identify spirit price Ob 4; identify spirit powers or abilities Ob 5.', { rootRule: per, skillType: 'Academic', tools: none,
    forkSuggestions: guidance(fork('doctrine'), fork('summoning'), { target: { kind: 'category', category: 'ritual', relevance: 'any' } }) }),
  define('enchanting', 'Enchanting', 270, 'Imbue objects with magical properties; procedures are in the Codex.', {
    rootRule: per, skillType: 'Sorcerous', tools: expendable, integrationTags: ['magic', 'equipment'] }),
  define('engineering', 'Engineering', 270, 'Design and construct complex structures, usually directing a team of tradespeople and laborers. Obstacles: load on a simple structural wall Ob 1; wall, obelisk or column Ob 2; stone arch Ob 3; stone bridge Ob 4; dome Ob 5; fortress gate Ob 6.', { rootRule: per, skillType: 'Artisan', tools: generic,
    forkSuggestions: guidance(fork('architect'), fork('mason'), sourceFork('Carpenter', 'carpentry')) }),
  define('engraving', 'Engraving', 270, 'Carve symbols and relief into stone. Obstacles: simple low relief Ob 1; complex low relief Ob 2; simple high relief Ob 3; mezzo relief Ob 4; complex high relief Ob 5.', { rootRule: stat('agility'), skillType: 'Artisan', tools: workshop,
    forkSuggestions: forks('etching', 'mason') }),
  define('estate-management', 'Estate Management', 271, 'Manage an estate and primarily recover taxed Resources. Obstacles: household Ob 1; manor Ob 2; fortress Ob 3; castle Ob 4.', {
    rootRule: per, skillType: 'Special', tools: item('estate'), resourceInteractions: [{ kind: 'recover-taxed-resources' }] }),
  define('etching', 'Etching', 271, 'Burn permanent designs into metal using acid, tar and wax. Obstacles: simple figure Ob 1; simple landscape Ob 2; multiple figures Ob 3; complex scene with background Ob 4; lifelike representation Ob 5.', { rootRule: stat('agility'), skillType: 'Craftsman', tools: workshop,
    forkSuggestions: guidance(fork('alchemy'), sourceFork('Illumination', 'illuminations'), fork('painting'), fork('sculpture')) }),
  define('etiquette', 'Etiquette', 271, 'Know the rituals required to make requests at court. Obstacles: minor lord Ob 1; baronial lord Ob 2; ducal lord Ob 3; king Ob 4; queen Ob 5; queen mother Ob 6.', { rootRule: combined('will', 'perception'), skillType: 'Social', tools: none,
    forkSuggestions: forks('soothing-platitudes', 'falsehood') }),
  define('excavation', 'Excavation', 271, 'Remove earth and rock. Obstacles: trench or pit Ob 1; small foundation Ob 2; shallow mine shaft or hurried tunnel Ob 3; moderate foundation Ob 4; mine shaft Ob 5; canal or moat Ob 6; large foundation or tunnel Ob 7; deep mine shaft Ob 8; massive foundation or tunnel Ob 8; clear rockfall or cave-in Ob 4; clear severe collapse Ob 7.', {
    rootRule: combined('perception', 'power'), skillType: 'Craftsman', tools: generic, ...magical,
    availabilityRestrictions: only(['dwarf']), forkSuggestions: forks('mining', 'prospecting', 'engineering') }),
  define('extortion', 'Extortion', 271, 'Coerce payments; may recover taxed Resources.', { rootRule: stat('will'), skillType: 'Social', tools: none,
    resourceInteractions: [{ kind: 'recover-taxed-resources' }], integrationTags: ['duel-of-wits'],
    testProfile: { kind: 'obstacle', context: { kind: 'outside-subsystem', subsystem: 'duel-of-wits' },
      base: targetWill, adjustments: [{ kind: 'manual', source: 'situational-disadvantage', quantity: 'unquantified' }] },
    forkSuggestions: forks('intimidation', 'interrogation', 'falsehood', 'ugly-truth') }),
  define('falconry', 'Falconry', 272, 'Train hunting hawks. Contests may be versus tests between two falconers. Other obstacles: capture small game Ob 1; spot or signal Ob 2; dispatch a message Ob 3.', { rootRule: combined('will', 'perception'), skillType: 'Forester',
    tools: { kind: 'allOf', requirements: [generic, item('falcon')] } }),
  define('falsehood', 'Falsehood', 272, 'Lie to a target. In Duel of Wits this skill can be used for Feint, Obfuscate and Incite.', { rootRule: stat('will'), skillType: 'Social', tools: none,
    forkSuggestions: forks('persuasion'), integrationTags: ['duel-of-wits'],
    testProfile: { kind: 'obstacle', base: targetWill, modifiers: [
      { when: { kind: 'anyOf', conditions: [circumstance('believable-lie'), circumstance('particularly-good-lie'),
        circumstance('lie-with-known-truth')] }, effect: { kind: 'dice-bonus', dice: 1 } },
      { when: { kind: 'anyOf', conditions: [circumstance('whopper'), circumstance('bad-lie')] },
        effect: { kind: 'obstacle-modifier', delta: 2 } },
    ] } }),
  define('farming', 'Farming', 272, 'Sow, plant and harvest. Obstacles: barley or millet Ob 1; wheat or oats Ob 2; flax or hemp Ob 3; hire samurai to protect crops from bandits Ob 7.', { rootRule: per, skillType: 'Peasant', tools: generic }),
  define('fence-building', 'Fence Building', 272, 'Build fences and walls and decide where boundaries should lie. Obstacles: divide farm fields Ob 1; pasturage Ob 2; mines or veins Ob 3; tax districts Ob 4.', {
    rootRule: per, skillType: 'Special', tools: expendable, availabilityRestrictions: only(['dwarf'], 'character-burning'),
    forkSuggestions: guidance(fork('chronology-of-kings'), fork('mason'), fork('accounting'), sourceFork('Carpenter', 'carpentry')) }),
  define('field-dressing', 'Field Dressing', 272, 'Basic battlefield wound treatment; procedures use Anatomy of Injury.', {
    rootRule: per, skillType: 'Medicinal', tools: { kind: 'traveling-gear', expendable: true },
    forkSuggestions: forks('herbalism', 'surgery'), integrationTags: ['injury'] }),
  define('firearms', 'Firearms', 272, 'Use pistols, arquebuses or muskets; available through Appropriate Weapons when germane to the game. Munitions makes the weapons and ammunition. See Fight and Range and Cover.', {
    rootRule: perAgi, skillType: 'Martial', tools: item('gun'), forkSuggestions: forks('crossbow'), integrationTags: ['fight', 'range-and-cover'] }),
  define('firebuilding', 'Firebuilding', 273, 'Light and maintain suitable fires. Obstacles: campfire Ob 1; bonfire Ob 2; smokeless fire Ob 3; concealed fire Ob 4. The entry gives +1 Ob for poor-quality wood and wet weather.', {
    rootRule: per, skillType: 'Forester', tools: { kind: 'traveling-gear', expendable: true }, forkSuggestions: guidance(sourceFork('Survivalist', 'survival'), fork('alchemy')) }),
  define('fishing', 'Fishing', 273, 'Understand and catch fish. Obstacles: feed oneself Ob 1; small group Ob 2; household Ob 3; village Ob 4; congregation Ob 5.', { rootRule: perAgi, skillType: 'Peasant', tools: generic }),
  define('fletcher', 'Fletcher', 273, 'Make arrows and bolts. Obstacles: bow ammunition Ob 1; crossbow ammunition Ob 2; artillery ammunition Ob 3.', { rootRule: perAgi, skillType: 'Craftsman', tools: expendable,
    forkSuggestions: guidance(fork('carving'), sourceFork('Tanning', 'tanner')) }),
  define('folklore', 'Folklore', 273, 'Know a culture’s superstitions, tales and legends. See the Codex for obstacles.', { rootRule: per, skillType: 'Special', tools: none,
    forkSuggestions: forks('symbology', 'ancient-history', 'obscure-history') }),
  define('foraging', 'Foraging', 273, 'Gather roots, fruit and greens, usually over a day. Obstacles: starvation rations Ob 1; feed oneself in the wild Ob 2; near civilization, population or army Ob 3; wasteland Ob 4; winter Ob 5.', { rootRule: per, skillType: 'Forester', tools: none,
    forkSuggestions: forks('hunting', 'herbalism') }),
  { ...define('foreign-languages', 'Foreign Languages', 273, 'Communicate in a language other than one’s own. Obstacles: close dialect Ob 1; obscure or thick dialect Ob 2; simple or related language Ob 2; difficult language Ob 3; complex language Ob 4; mystical or esoteric language Ob 5. Survival and conversational speech have no penalty. Suggested failures include mistakes in numbers or directions, understanding without being understood, or relying on isolated words and gestures.', {
    rootRule: per, skillType: 'Social', tools: none,
    testProfile: { kind: 'contextual', modifiers: [
      { when: circumstance('communicating-with-gestures-or-visual-references'), effect: { kind: 'dice-bonus', dice: 1 } },
      { when: circumstance('expressing-philosophical-or-abstract-concepts'), effect: { kind: 'obstacle-modifier', delta: 2 } },
      { when: circumstance('expressing-formal-or-ritual-concepts'), effect: { kind: 'obstacle-modifier', delta: 1 } },
      { when: circumstance('speaking-a-dead-language'), effect: { kind: 'obstacle-modifier', delta: 1 } },
    ] } }),
    source: [evidence('Foreign Languages', 273), evidence('Foreign Languages (continued)', 274)] },
  define('forge-artifice', 'Forge Artifice', 274, 'Create Dwarven forges; optional runes grant a separate equipment-use benefit. Obstacles: bellows and pumps Ob 1; small kiln Ob 2; large kiln Ob 3; one-smith forge Ob 4; two-smith forge Ob 5; five-smith forge Ob 6.', {
    rootRule: combined('will', 'perception'), skillType: 'Artisan', tools: workshop, ...magical,
    availabilityRestrictions: only(['dwarf']), integrationTags: ['equipment'],
    capabilities: [{ kind: 'subsystem-capability', id: 'forge-use-bonus', integrationId: 'forge-artifice-use' }] }),
  define('forgery', 'Forgery', 274, 'Copy documents, handwriting, signatures and seals. Obstacles: mimic document style Ob 1; mimic handwriting Ob 2; forge signature Ob 3; forge stamp or seal Ob 4; perfect document Ob 5; perfect signature Ob 6; perfect handwriting Ob 7; perfect stamp or seal Ob 8.', {
    rootRule: perAgi, skillType: 'Special', tools: expendable,
    forkSuggestions: forks('calligraphy', 'read', 'write', 'illuminations', 'whitesmith') }),
  define('formation-fighting', 'Formation Fighting', 274, 'In formation, participants may help each other on Steel-based Range and Cover maneuvers. In Fight, fighting shoulder to shoulder with allies reduces the outnumbered penalty by one.', {
    rootRule: stat('will'), skillType: 'Military Training', tools: none, training: aptitudeTraining, printedMarkers: ['*'],
    integrationTags: ['fight', 'range-and-cover'],
    procedures: [{ kind: 'formation-fighting-benefits', maneuverHelp: { subsystem: 'range-and-cover',
      participants: 'in-formation', maneuverBasis: 'steel', permission: 'help-each-other' },
    outnumberedRelief: { subsystem: 'fight', when: 'shoulder-to-shoulder-with-allies', reduceBy: 1 } }] }),
  define('fortifications', 'Fortifications', 274, 'Build defensible positions. Fences or barricades Ob 1 increase cover by one; walls Ob 2 grant +1D position; palisades Ob 3 grant +1D position and increase cover (amount unspecified); dugouts or trenches Ob 4 grant +2D position and increase cover by one.', {
    rootRule: per, skillType: 'Military', tools: generic, integrationTags: ['range-and-cover'],
    forkSuggestions: guidance(sourceFork('Engineer', 'engineering'), fork('mason'), fork('architect')),
    procedures: [{ kind: 'field-fortifications', options: [
      { structure: 'fence-or-barricade', buildingObstacle: 1, coverIncrease: 1 },
      { structure: 'wall', buildingObstacle: 2, positionDice: 1 },
      { structure: 'palisade', buildingObstacle: 3, positionDice: 1, coverIncrease: 'source-unspecified' },
      { structure: 'dugout-or-trench', buildingObstacle: 4, positionDice: 2, coverIncrease: 1 },
    ] }] }),
];
