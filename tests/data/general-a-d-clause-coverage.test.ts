import { describe, expect, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);

// Checked against the printed General Skill List, book 253–254 / PDF 255–256.
// Each row retains its own subject and obstacle; the numbers alone are insufficient.
const guidance: ReadonlyArray<readonly [string, readonly (readonly [string, number])[]]> = [
  ['accounting', [
    ['single-income, single-residence taxes', 1], ['personal finances', 2], ['family income', 3],
    ['small business books', 4], ['estate books', 5], ['large business books', 6], ['town books', 7],
    ['city books', 8], ['province books', 9], ['nation books', 10],
  ]],
  ['acting', [['mummery', 1], ['morality play', 2], ['religious miracle', 3], ['religious mystery', 4], ['classics', 5]]],
  ['administration', [
    ['yourself', 1], ['shop', 2], ['confraternity', 3], ['small commune', 4], ['small guild', 5],
    ['small secret society', 6], ['large secret society', 7], ['small trading concern', 8],
    ['large guild', 9], ['giant trading concern', 10],
  ]],
  ['ages-of-the-etharch', [
    ['current age', 1], ['Third Age', 2], ['Second Age', 3], ['First Age', 4], ['Years of the Sun', 5],
    ['before the first Etharchs', 6],
  ]],
  ['alchemy', [['earth', 1], ['water or other liquid', 2], ['metal', 3], ['blood', 4]]],
  ['almanac', [
    ['general seasonal weather', 1], ['planting and harvest times', 2],
    ['reasonably accurate weather prediction', 3], ['festivals and holidays', 4],
  ]],
  ['anatomy', [['dog anatomy', 1], ['superficial human anatomy', 2], ['major human organs', 3],
    ['circulatory system', 4], ['human dissection', 5]]],
  ['animal-husbandry', [['chickens', 1], ['pigs or goats', 2], ['cows or horses', 3], ['exotic animals', 4]]],
  ['archcraft', [['simple arch', 1], ['small gate', 2], ['large gate', 3], ['chamber', 4], ['domed hall', 5]]],
  ['architect', [['cottage plans', 1], ['longhouse', 2], ['two-story structure', 4], ['tower', 5],
    ['complex designs such as temples', 6], ['non-Euclidean designs of the Outer Gods', 10]]],
  ['armorer', [['gambeson, skull cap or leather hood', 1], ['reinforced leather, light helmet or pot helm', 2],
    ['light mail or spangenhelm', 3], ['heavy mail, open-faced bascinet or barbute', 4],
    ['plated mail, sallet or closed bascinet', 5], ['full plate or great helm', 6],
    ['target shield', 1], ['buckler', 2], ['great shield', 3], ['kite shield', 4]]],
  ['arson', [['thatched cottage', 1], ['munitions dump or powder room', 2], ['house', 3], ['manor', 4],
    ['fortress', 5], ['prison', 6], ['catacombs', 7], ['castle', 8]]],
  ['artillerist', [['scavenge shot', 1], ['carve stone shot', 2], ['small traction trebuchet', 2],
    ['large traction trebuchet', 3], ['small catapult', 4], ['counterweight trebuchet or siege crossbow', 5],
    ['large catapult', 6], ['range a siege crossbow', 2], ['range a small catapult or traction trebuchet', 3],
    ['range a counterweight trebuchet', 3], ['range a catapult', 4]]],
  ['astrology', [['name stars and constellations', 1], ['construct a horoscope', 2], ['auspices for an enterprise', 3],
    ['ask the stars a question', 4], ['interpret celestial phenomena or omens', 5]]],
  ['atilliator', [['crossbow', 2], ['heavy crossbow', 3], ['hand crossbow', 4], ['siege crossbow', 5]]],
  ['aura-reading', [['subject alive/dead or plane of origin', 1], ['aura trait', 1], ['mood', 2], ['character trait', 3],
    ['die or call-on trait', 4], ['intent', 4], ['Instinct', 6], ['Belief', 7], ['past', 8], ['future', 9],
    ['magical or mundane object', 1], ['school of magic', 2], ['facet of a spell or enchantment', 3], ['name a spell being cast', 6]]],
  ['baking', [['peasant bread', 1], ['flat cakes or nice bread', 2], ['cream-filled buns', 3], ['advanced pastry', 4]]],
  ['ballad-of-history', [['current age', 1], ['Third Age', 2], ['Second Age', 3], ['First Age', 4],
    ['Years of the Sun', 5], ['Creation and before time', 6]]],
  ['bastions-of-hatred', [['trench', 1], ['battlefield fortifications', 2], ['palisade wall', 3], ['small tower', 4],
    ['convert Human structures', 1], ['convert Dwarven structures', 2], ['defile Elven structures', 3]]],
  ['beer-appraisal', [['Dwarven brew', 1], ['Human swill', 2], ['rat wine', 3], ['Elven brew', 4], ['Orcish brew', 5]]],
  ['bird-husbandry', [['chickens', 1], ['pigeons', 2], ['raptors', 3], ['exotic birds', 4], ['dinosaurs', 5]]],
  ['black-metal-artifice', [['horseshoes', 1], ['Mason, Stone Art, Cooking, Blacksmith or Black Metal Art tools', 2],
    ['Armorer, Weaponsmith or War Art tools', 3], ['Khirurgeon tools', 4]]],
  ['blacksmith', [['nails', 1], ['horseshoes, knives, stirrups or arrowheads', 2], ['spear tips or plow', 3],
    ['simple tools', 3], ['swords', 4], ['complex tools', 5]]],
  ['boatwright', [['repair or retar', 1], ['dugout, skiff or raft', 2], ['rowboat or small barge', 3],
    ['large barge or longboat', 4], ['small sailing vessel', 5]]],
];

describe('General Skill List clause review: Abbey-wise through Boatwright', () => {
  it.each(guidance)('preserves each printed obstacle subject and number for %s', (id, rows) => {
    const summary = catalog.skills.get(id)?.summary;
    for (const [subject, obstacle] of rows) {
      expect(summary).toMatch(new RegExp(`\\b${subject} Ob ${obstacle}\\b`));
    }
  });

  it('records the Administration continuation separately from its heading', () => {
    expect(catalog.skills.get('administration')?.source.map(source =>
      source.kind === 'audit-packet' ? source.pages : undefined)).toEqual([
      { printed: [253], pdf: [255] }, { printed: [254], pdf: [256] },
    ]);
  });

  it('preserves the two distinct capabilities described by Almanac', () => {
    const summary = catalog.skills.get('almanac')?.summary;
    expect(summary).toContain('always tell the time of year nearly to the day');
    expect(summary).toContain('accurate predictions about the season’s weather');
  });

  it('links Archcraft enchantment to Antiphon rather than treating the examples as requirements', () => {
    expect(catalog.integrations.get('archcraft-antiphon')?.createdItemReference).toEqual({
      kind: 'antiphon-union', target: 'created-item', skillId: 'antiphon-union-training',
    });
    expect(catalog.skills.get('archcraft')?.summary).toContain('Examples include');
  });

  it('retains all three Appropriate Weapons selection considerations without creating a skill', () => {
    expect(catalog.choices.get('appropriate-weapons')?.selection).toMatchObject({
      kind: 'real-weapon-skills', contextRequired: true,
      considerations: ['lifepaths', 'character-concept', 'game-setting'],
      cardinality: 'any-and-all-appropriate',
    });
    expect(catalog.skills.has('appropriate-weapons')).toBe(false);
  });

  it('keeps Armor Training mitigation separate from Clumsy Weight', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)));
    expect(restored.integrations.get('armor-training-penalties')?.armorTraining).toEqual({
      untrained: { appliesTo: 'all-tests', lightMail: 1, heavyMailOrHeavier: 2 },
      trained: { armorObstaclePenalties: 'removed', armorFatiguePenalties: 'mitigated', clumsyWeight: 'still-applies' },
    });
  });
  it('rejects assigning Armor Training penalties to a non-equipment subsystem', () => {
    const content = generalSkillTranscriptionContent;
    const integrations = content.integrations.map(integration => integration.id === 'armor-training-penalties'
      ? { ...integration, subsystem: 'magic' } : integration);
    expect(() => createSkillCatalog({ ...content, integrations } as typeof content))
      .toThrow('Invalid armor Training penalties');
  });
  it('separates Artillerist construction crew from the optional black-powder campaign rule', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)));
    expect(restored.integrations.get('artillerist-procedure')?.artilleryProcedure).toEqual({
      constructionCrew: { laborers: 'teams', minimumCarpenters: 1 },
      blackPowderAlternative: { when: 'campaign-uses-black-powder-weapons',
        covers: ['cannons', 'bombards', 'shot'], activities: ['manufacture', 'operation'],
        bombsAndPowderSkillId: 'munitions' },
    });
  });
  it('preserves the spirit-specific Aura Reading obstacle and separate aura perception requirement', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)));
    expect(restored.integrations.get('aura-reading-spirit')?.spiritAuraObstacle).toEqual({
      kind: 'detect-spirit-presence-and-nature', base: 10, subtract: 'spirit-strength',
    });
    expect(catalog.skills.get('aura-reading')?.useRequirements).toEqual([
      { kind: 'capability', id: 'aura-perception', use: 'aura-perception' },
    ]);
  });
  it.each([
    ['artillerist-procedure', { artilleryProcedure: { constructionCrew: { laborers: 'teams', minimumCarpenters: 0 } } },
      'Invalid artillery procedure'],
    ['aura-reading-spirit', { spiritAuraObstacle: { kind: 'detect-spirit-presence-and-nature', base: 10, subtract: 'will' } },
      'Invalid spirit aura obstacle'],
  ])('rejects unsupported source metadata for %s', (id, override, error) => {
    const content = generalSkillTranscriptionContent;
    const integrations = content.integrations.map(integration => integration.id === id
      ? { ...integration, ...override } : integration);
    expect(() => createSkillCatalog({ ...content, integrations } as typeof content)).toThrow(error);
  });
  it('preserves Beggardry’s cash dice, typical Will obstacle and unquantified Advantage', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)));
    const skill = restored.skills.get('beggardry');
    expect(skill?.resourceInteractions).toEqual([{ kind: 'recover-taxed-resources' },
      { kind: 'produce-cash', cashDice: 1 }]);
    expect(skill?.summary).toContain('Typical obstacle is the victim’s Will');
    expect(skill?.testProfile).toEqual({ kind: 'obstacle',
      context: { kind: 'circumstance', circumstanceId: 'typical-begging-test' },
      base: { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' },
      adjustments: [], modifiers: [{
        when: { kind: 'circumstance', circumstanceId: 'convincing-beggar' },
        effect: { kind: 'advantage', resolution: 'canonical' },
      }],
    });
  });
  it('does not allow cash dice on a recovery interaction', () => {
    const content = generalSkillTranscriptionContent;
    const skills = content.skills.map(skill => skill.id === 'beggardry'
      ? { ...skill, resourceInteractions: [{ kind: 'recover-taxed-resources', cashDice: 1 }] } : skill);
    expect(() => createSkillCatalog({ ...content, skills } as typeof content))
      .toThrow('Invalid cash dice on Resources interaction');
  });
});
