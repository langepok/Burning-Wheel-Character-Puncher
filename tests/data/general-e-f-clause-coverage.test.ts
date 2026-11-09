import { describe, expect, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import { generalSkillTranscriptionContent as content } from '../../src/data/skills/general';

const catalog = createSkillCatalog(content);
const standard = [1, 2, 3, 4, 5];
const rows: ReadonlyArray<readonly [string, readonly number[]]> = [
  ['embroidery', [1, 3, 4, 5]], ['empyrealia', standard], ['engineering', [1, 2, 3, 4, 5, 6]],
  ['engraving', standard], ['estate-management', [1, 2, 3, 4]], ['etching', standard], ['etiquette', [1, 2, 3, 4, 5, 6]],
  ['excavation', [1, 2, 3, 4, 5, 6, 7, 8, 8, 4, 7]], ['falconry', [1, 2, 3]], ['farming', [1, 2, 3, 7]],
  ['fence-building', [1, 2, 3, 4]], ['fishing', standard], ['fletcher', [1, 2, 3]], ['foraging', standard],
  ['foreign-languages', [1, 2, 2, 3, 4, 5]], ['forge-artifice', [1, 2, 3, 4, 5, 6]],
  ['forgery', [1, 2, 3, 4, 5, 6, 7, 8]],
];
describe('General Skill List E–F clause review', () => {
  it.each(rows)('%s retains the printed obstacle sequence', (id, obstacles) => {
    expect([...(catalog.skills.get(id)?.summary ?? '').matchAll(/\bOb (\d+)\b/g)].map(match => Number(match[1])))
      .toEqual(obstacles);
  });
  it('preserves Farming Ob 7 despite the humorous example', () => {
    expect(catalog.skills.get('farming')?.summary).toContain('hire samurai to protect crops from bandits Ob 7');
  });
  it('keeps Falsehood Will and separately scoped dice and obstacle modifiers', () => {
    const profile = catalog.skills.get('falsehood')?.testProfile;
    expect(profile).toMatchObject({ kind: 'obstacle', base: { kind: 'target-ability-exponent',
      ability: { kind: 'stat', id: 'will' }, snapshot: 'current' } });
    expect(profile?.modifiers?.map(modifier => modifier.effect)).toEqual([
      { kind: 'dice-bonus', dice: 1 }, { kind: 'obstacle-modifier', delta: 2 },
    ]);
    expect(profile?.modifiers?.map(modifier => modifier.when)).toMatchObject([
      { kind: 'anyOf', conditions: [{ circumstanceId: 'believable-lie' }, { circumstanceId: 'particularly-good-lie' },
        { circumstanceId: 'lie-with-known-truth' }] },
      { kind: 'anyOf', conditions: [{ circumstanceId: 'whopper' }, { circumstanceId: 'bad-lie' }] },
    ]);
  });
  it('retains the outside-Duel-of-Wits Extortion obstacle and unquantified adjustment', () => {
    expect(catalog.skills.get('extortion')?.testProfile).toEqual({ kind: 'obstacle',
      context: { kind: 'outside-subsystem', subsystem: 'duel-of-wits' },
      base: { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' },
      adjustments: [{ kind: 'manual', source: 'situational-disadvantage', quantity: 'unquantified' }],
    });
  });
  it('preserves Foreign Languages continuation, gesture bonus and distinct speech penalties', () => {
    const skill = catalog.skills.get('foreign-languages');
    expect(skill?.source.map(source => source.kind === 'audit-packet' ? source.pages : undefined)).toEqual([
      { printed: [273], pdf: [275] }, { printed: [274], pdf: [276] },
    ]);
    expect(skill?.testProfile?.modifiers?.map(modifier => modifier.effect)).toEqual([
      { kind: 'dice-bonus', dice: 1 }, { kind: 'obstacle-modifier', delta: 2 },
      { kind: 'obstacle-modifier', delta: 1 }, { kind: 'obstacle-modifier', delta: 1 },
    ]);
  });
  it('preserves formation help and penalty relief as separate rules', () => {
    expect(catalog.skills.get('formation-fighting')?.procedures).toEqual([
      { kind: 'formation-fighting-benefits', maneuverHelp: { subsystem: 'range-and-cover',
        participants: 'in-formation', maneuverBasis: 'steel', permission: 'help-each-other' },
      outnumberedRelief: { subsystem: 'fight', when: 'shoulder-to-shoulder-with-allies', reduceBy: 1 } },
    ]);
  });
  it('does not infer a palisade cover magnitude from the other fortifications', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(content)));
    expect(restored.skills.get('fortifications')?.procedures).toEqual([{ kind: 'field-fortifications', options: [
      { structure: 'fence-or-barricade', buildingObstacle: 1, coverIncrease: 1 },
      { structure: 'wall', buildingObstacle: 2, positionDice: 1 },
      { structure: 'palisade', buildingObstacle: 3, positionDice: 1, coverIncrease: 'source-unspecified' },
      { structure: 'dugout-or-trench', buildingObstacle: 4, positionDice: 2, coverIncrease: 1 },
    ] }]);
  });
});
