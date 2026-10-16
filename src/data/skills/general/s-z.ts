import { aptitudeTraining, combined, define, expendable, fork, forks, generic, guidance, none, only, sourceFork, stat, workshop } from './shared';

/** Reviewed S–Z records only; later entries remain identity references. */
export const sZSkills = [
  define('saddlery', 'Saddlery', 294, 'Make horse furniture from hides. Guidance: repairs Ob 1, riding saddle Ob 2, war saddle Ob 3, ornate saddle Ob 4, royal saddle Ob 5, howdah Ob 7.', {
    rootRule: combined('perception', 'agility'), skillType: 'Craftsman', tools: workshop, forkSuggestions: forks('tanner') }),
  define('saint-wise', 'Saint-wise', 294, 'Knowledge of saints.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'saint' } }),
  define('scavenging', 'Scavenging', 294, 'Search for a declared item type in a contextually suitable place, excluding specific or unique things; source categories guide obstacles.', {
    rootRule: stat('perception'), skillType: 'Peasant', tools: none,
    forkSuggestions: guidance(fork('foraging'), { target: { kind: 'skill-family', familyId: 'wises', relevance: 'appropriate' } }),
    procedures: [{ kind: 'item-search', request: { declaredBy: 'player', granularity: 'item-type',
      specificItemAllowed: false, uniqueItemAllowed: false, resolution: 'manual' },
      contextRequirement: { kind: 'suitable-location', purpose: 'scavenging', resolution: 'contextual',
        examplesPolicy: 'non-exhaustive', examples: ['midden', 'ruin', 'battlefield'] },
      obstacleGuidance: { kind: 'category-based', resolution: 'contextual', examplesPolicy: 'non-exhaustive', categories: [
        { id: 'detritus-or-junk', label: 'Detritus or junk', obstacle: 1, examples: ['rags', 'scraps'] },
        { id: 'common-household-goods', label: 'Common household goods', obstacle: 2, examples: ['clothing', 'food', 'cookware'] },
        { id: 'hard-to-find-items', label: 'Hard-to-find items', obstacle: 3, examples: ['medicine', 'weapons', 'tools'] },
        { id: 'valuable-items', label: 'Valuable items', obstacle: 4, examples: ['money', 'antiques'] },
        { id: 'rare-objects', label: 'Rare objects', obstacle: 5, examples: ['documents', 'books', 'specialized tools'] },
        { id: 'obscure-or-out-of-place-items', label: 'Obscure or out-of-place items', obstacle: 6, examples: ['oddities', 'head in a jar', 'crown'] },
      ] } }],
  }),
  define('sculpture', 'Sculpture', 294, 'Shape forms in clay or stone. Simple forms: clay Ob 1, soft stone Ob 2, hard stone Ob 3; complex forms use Ob 4/5/6 respectively.', {
    rootRule: combined('will', 'agility'), skillType: 'Artist', tools: generic, forkSuggestions: forks('mason', 'engraving') }),
  define('scutwork-wise', 'Scutwork-wise', 294, 'Knowledge of scutwork.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'scutwork' } }),
  define('seamanship', 'Seamanship', 294, 'Maintain shipboard life and equipment, short of sailing. Vessel guidance: rowboat/skiff Ob 1, longboat Ob 2, junk Ob 3, caravel Ob 4, carrack Ob 5, felucca Ob 6, treasure ship Ob 7.', {
    rootRule: stat('perception'), skillType: 'Seafaring', tools: none }),
  define('seduction', 'Seduction', 294, 'Use sexual desire or intention to obtain information or persuade action; intercourse is not required. Duel of Wits use remains external.', {
    rootRule: stat('will'), skillType: 'Social', tools: none, forkSuggestions: forks('persuasion', 'soothing-platitudes', 'poetry'), integrationTags: ['duel-of-wits'],
    testProfile: { kind: 'obstacle', base: { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' } } }),
  define('servant-wise', 'Servant-wise', 295, 'Knowledge of the Servants cult, its internal hierarchy, laws and customs.', {
    rootRule: stat('perception'), skillType: 'Wise', tools: none, availabilityRestrictions: only(['orc'], 'character-burning'),
    forkSuggestions: forks('great-and-black-wise'), familyMembership: { familyId: 'wises', topicId: 'servant' } }),
  define('sewing', 'Sewing', 295, 'Make and mend cloth garments and household textiles. Guidance: simple linens/sashes/scarves Ob 1, repair Ob 2, clothing Ob 3, fancy clothing Ob 4.', {
    rootRule: stat('agility'), skillType: 'Peasant', tools: expendable, forkSuggestions: guidance(sourceFork('Weaver', 'weaving'), fork('embroidery')) }),
  define('shield-training', 'Shield Training', 295, 'Training permits action-scoped shield defense and Block & Strike. A shield Strike uses separate acting ability choices; combat resolution stays external.', {
    rootRule: stat('agility'), skillType: 'Martial Training', tools: none, training: aptitudeTraining, printedMarkers: ['*'], integrationTags: ['fight'],
    capabilities: [{ kind: 'subsystem-capability', id: 'shield-use', integrationId: 'shield-training-use' }] }),
  define('ship-management', 'Ship Management', 295, 'Manage voyage supplies and cargo. Success avoids supply problems; failure causes a critical shortage with serious crew and morale consequences.', {
    rootRule: stat('perception'), skillType: 'Seafaring', tools: none, forkSuggestions: forks('accounting', 'logistics'),
    procedures: [{ kind: 'supply-management', success: { kind: 'no-supply-problem' },
      failure: { shortage: { kind: 'critical-supply-shortage', supplySelection: 'contextual', examplesPolicy: 'non-exhaustive',
        examples: ['food', 'water', 'medicine', 'lumber', 'ammunition'] }, consequences: [
        { kind: 'serious-complications', resolution: 'contextual' },
        { kind: 'crew-mortality', onset: 'begins', quantity: 'source-unspecified', timing: 'source-unspecified', cause: 'shortage-of-critical-supply' },
        { kind: 'morale-harm', magnitude: 'source-unspecified' },
      ] }, obstacleGuidance: { vessels: [
        { vessels: ['rowboat', 'skiff'], obstacle: 1 }, { vessels: ['longboat'], obstacle: 2 },
        { vessels: ['junk'], obstacle: 3 }, { vessels: ['caravel'], obstacle: 4 },
        { vessels: ['carrack'], obstacle: 5 }, { vessels: ['felucca'], obstacle: 6 }, { vessels: ['treasure-ship'], obstacle: 7 },
      ], journeyModifiers: [
        { journey: 'moderate', obstacleDelta: 1 }, { journey: 'long', obstacleDelta: 2 }, { journey: 'ocean-crossing', obstacleDelta: 3 },
      ] } }],
  }),
  define('ship-wise', 'Ship-wise', 295, 'Knowledge of ships.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'ship' } }),
  define('shipwright', 'Shipwright', 295, 'Design and construct seagoing vessels. Guidance: rowboat/skiff Ob 1, barge Ob 2, longboat Ob 3, cog/junk Ob 4, felucca/longship/galley Ob 5, carrack Ob 6, caravel Ob 8, treasure ship Ob 9.', {
    rootRule: stat('perception'), skillType: 'Craftsman', tools: workshop,
    forkSuggestions: guidance(sourceFork('Engineer', 'engineering'), sourceFork('Carpenter', 'carpentry'), fork('boatwright')) }),
  define('shortcut-wise', 'Shortcut-wise', 296, 'Knowledge of shortcuts.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'shortcut' } }),
];
