import { combined, define, expendable, fork, forks, generic, guidance, item, magical, none, only, sourceFork, stat, training, workshop, writingTools } from './shared';

const per = stat('perception');
const perAgi = combined('perception', 'agility');
/** Reviewed ordinary E–F entries; stock-specific effects remain separate integrations. */
export const eFSkills = [
  define('earth-wise', 'Earth-wise', 269, 'Identify types, origins and ages of earth.', { rootRule: per, skillType: 'Wise', tools: none,
    familyMembership: { familyId: 'wises', topicId: 'earth' } }),
  define('elven-script', 'Elven Script', 270, 'Elven reading and writing; tools are required only for writing.', {
    rootRule: per, skillType: 'Academic', tools: writingTools, availabilityRestrictions: only(['elf'], 'character-burning'),
    capabilities: [{ kind: 'literacy', actions: ['read', 'write'], context: { kind: 'culture', cultureId: 'elven' } }] }),
  define('embroidery', 'Embroidery', 270, 'Stitch designs into cloth.', { rootRule: perAgi, skillType: 'Craftsman', tools: expendable,
    forkSuggestions: guidance(fork('sewing'), sourceFork('Weaver', 'weaving')) }),
  define('empyrealia', 'Empyrealia', 270, 'Study celestial spirits and their hierarchies.', { rootRule: per, skillType: 'Academic', tools: none,
    forkSuggestions: guidance(fork('doctrine'), fork('summoning'), { target: { kind: 'category', category: 'ritual', relevance: 'any' } }) }),
  define('enchanting', 'Enchanting', 270, 'Imbue objects with magical properties; procedures are in the Codex.', {
    rootRule: per, skillType: 'Sorcerous', tools: expendable, integrationTags: ['magic', 'equipment'] }),
  define('engineering', 'Engineering', 270, 'Design complex buildings, bridges and structures.', { rootRule: per, skillType: 'Artisan', tools: generic,
    forkSuggestions: guidance(fork('architect'), fork('mason'), sourceFork('Carpenter', 'carpentry')) }),
  define('engraving', 'Engraving', 270, 'Carve symbols and reliefs into stone.', { rootRule: stat('agility'), skillType: 'Artisan', tools: workshop,
    forkSuggestions: forks('etching', 'mason') }),
  define('estate-management', 'Estate Management', 271, 'Manage an estate to recover taxed Resources.', {
    rootRule: per, skillType: 'Special', tools: item('estate'), resourceInteractions: [{ kind: 'recover-taxed-resources' }] }),
  define('etching', 'Etching', 271, 'Etch designs into metal.', { rootRule: stat('agility'), skillType: 'Craftsman', tools: workshop,
    forkSuggestions: guidance(fork('alchemy'), sourceFork('Illumination', 'illuminations'), fork('painting'), fork('sculpture')) }),
  define('etiquette', 'Etiquette', 271, 'Observe courtly social rituals.', { rootRule: combined('will', 'perception'), skillType: 'Social', tools: none,
    forkSuggestions: forks('soothing-platitudes', 'falsehood') }),
  define('excavation', 'Excavation', 271, 'Dwarven excavation and removal of earth and rock.', {
    rootRule: combined('perception', 'power'), skillType: 'Craftsman', tools: generic, ...magical,
    availabilityRestrictions: only(['dwarf']), forkSuggestions: forks('mining', 'prospecting', 'engineering') }),
  define('extortion', 'Extortion', 271, 'Coerce payments; may recover taxed Resources.', { rootRule: stat('will'), skillType: 'Social', tools: none,
    resourceInteractions: [{ kind: 'recover-taxed-resources' }], integrationTags: ['duel-of-wits'],
    forkSuggestions: forks('intimidation', 'interrogation', 'falsehood', 'ugly-truth') }),
  define('falconry', 'Falconry', 272, 'Train and hunt with hawks.', { rootRule: combined('will', 'perception'), skillType: 'Forester',
    tools: { kind: 'allOf', requirements: [generic, item('falcon')] } }),
  define('falsehood', 'Falsehood', 272, 'Deceive through lies.', { rootRule: stat('will'), skillType: 'Social', tools: none,
    forkSuggestions: forks('persuasion'), integrationTags: ['duel-of-wits'] }),
  define('farming', 'Farming', 272, 'Plant and harvest crops.', { rootRule: per, skillType: 'Peasant', tools: generic }),
  define('fence-building', 'Fence Building', 272, 'Build boundaries and understand their placement.', {
    rootRule: per, skillType: 'Special', tools: expendable, availabilityRestrictions: only(['dwarf'], 'character-burning'),
    forkSuggestions: guidance(fork('chronology-of-kings'), fork('mason'), fork('accounting'), sourceFork('Carpenter', 'carpentry')) }),
  define('field-dressing', 'Field Dressing', 272, 'Basic battlefield wound treatment; procedures use Anatomy of Injury.', {
    rootRule: per, skillType: 'Medicinal', tools: { kind: 'traveling-gear', expendable: true },
    forkSuggestions: forks('herbalism', 'surgery'), integrationTags: ['injury'] }),
  define('firearms', 'Firearms', 272, 'Use firearms; ammunition manufacture uses Munitions.', {
    rootRule: perAgi, skillType: 'Martial', tools: item('gun'), forkSuggestions: forks('crossbow'), integrationTags: ['fight', 'range-and-cover'] }),
  define('firebuilding', 'Firebuilding', 273, 'Light and maintain fires in difficult conditions.', {
    rootRule: per, skillType: 'Forester', tools: { kind: 'traveling-gear', expendable: true }, forkSuggestions: guidance(sourceFork('Survivalist', 'survival'), fork('alchemy')) }),
  define('fishing', 'Fishing', 273, 'Find and catch fish.', { rootRule: perAgi, skillType: 'Peasant', tools: generic }),
  define('fletcher', 'Fletcher', 273, 'Make arrows and bolts.', { rootRule: perAgi, skillType: 'Craftsman', tools: expendable,
    forkSuggestions: guidance(fork('carving'), sourceFork('Tanning', 'tanner')) }),
  define('folklore', 'Folklore', 273, 'Knowledge of cultural folk beliefs and legends.', { rootRule: per, skillType: 'Special', tools: none,
    forkSuggestions: forks('symbology', 'ancient-history', 'obscure-history') }),
  define('foraging', 'Foraging', 273, 'Gather edible plants from the land.', { rootRule: per, skillType: 'Forester', tools: none,
    forkSuggestions: forks('hunting', 'herbalism') }),
  define('foreign-languages', 'Foreign Languages', 273, 'Communicate in languages other than the native tongue.', {
    rootRule: per, skillType: 'Social', tools: none }),
  define('forge-artifice', 'Forge Artifice', 274, 'Create Dwarven forges with embedded equipment-use benefits.', {
    rootRule: combined('will', 'perception'), skillType: 'Artisan', tools: workshop, ...magical,
    availabilityRestrictions: only(['dwarf']), integrationTags: ['equipment'],
    capabilities: [{ kind: 'subsystem-capability', id: 'forge-use-bonus', integrationId: 'forge-artifice-use' }] }),
  define('forgery', 'Forgery', 274, 'Copy documents, signatures and seals.', {
    rootRule: perAgi, skillType: 'Special', tools: expendable,
    forkSuggestions: forks('calligraphy', 'read', 'write', 'illuminations', 'whitesmith') }),
  define('formation-fighting', 'Formation Fighting', 274, 'Fight alongside allies in formation; maneuver assistance and outnumbered penalties use the combat subsystems.', {
    rootRule: stat('will'), skillType: 'Military Training', tools: none, training, printedMarkers: ['*'],
    integrationTags: ['fight', 'range-and-cover'] }),
  define('fortifications', 'Fortifications', 274, 'Construct defensible positions for combat.', {
    rootRule: per, skillType: 'Military', tools: generic, integrationTags: ['range-and-cover'],
    forkSuggestions: guidance(sourceFork('Engineer', 'engineering'), fork('mason'), fork('architect')) }),
];
