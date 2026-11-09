import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { CreatedItemValueModifier, ResourceInteraction, SkillIntegration } from '../../src/data/skills';
import { itemValueFixtureContent } from '../../src/data/skills/item-value-fixtures';
import { skillFixtureContent } from '../../src/data/skills/fixtures';

const catalog = createSkillCatalog(itemValueFixtureContent);
const obstacleEffects = [
  { kind: 'automatic', modifier: { target: 'created-item', measure: 'resources-obstacle', delta: 1 } },
  { kind: 'optional-tradeoff', choiceTiming: 'before-roll',
    modifier: { target: 'created-item', measure: 'resources-obstacle', delta: 1 },
    cost: { kind: 'crafting-obstacle-modifier', delta: 2 } },
] as const;

describe('Created-item valuation integration boundary', () => {
  it.each(['gem-artifice', 'white-metal-artifice'])('%s retains the automatic obstacle bonus and separate optional tradeoff', id => {
    expect(catalog.integrations.get(`${id}-value`)).toMatchObject({ subsystem: 'equipment', createdItemValueEffects: obstacleEffects });
  });
  it('preserves Gemcraft dice without normalizing them to obstacle units', () => {
    expect(catalog.integrations.get('gemcraft-value')?.createdItemValueEffects).toEqual([
      { kind: 'automatic', modifier: { target: 'created-item', measure: 'resources-value-dice', delta: 1 } },
    ]);
    type Obstacle = Extract<CreatedItemValueModifier, { measure: 'resources-obstacle' }>;
    type Dice = Extract<CreatedItemValueModifier, { measure: 'resources-value-dice' }>;
    expectTypeOf<Obstacle>().not.toExtend<Dice>();
    expectTypeOf<Dice>().not.toExtend<Obstacle>();
    expectTypeOf<Obstacle>().not.toExtend<ResourceInteraction>();
  });
  it('serializes every tradeoff and keeps magic references separate', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(itemValueFixtureContent)) as typeof itemValueFixtureContent);
    expect([...restored.integrations]).toEqual([...catalog.integrations]);
    expect(restored.integrations.get('gem-artifice-matrix')?.createdItemReference).toEqual({ kind: 'enchanting-matrix', target: 'created-item' });
    expect(restored.integrations.get('gemcraft-antiphon')?.createdItemReference).toEqual({ kind: 'antiphon-union', target: 'created-item', skillId: 'antiphon-union-training' });
    expect(restored.integrations.get('gemcraft-value')?.createdItemReference).toBeUndefined();
  });
  it('leaves direct character Resources interactions unchanged', () => {
    const direct = createSkillCatalog(skillFixtureContent);
    expect(direct.skills.get('beggardry')?.resourceInteractions).toEqual([
      { kind: 'recover-taxed-resources' }, { kind: 'produce-cash' },
    ]);
    expectTypeOf<ResourceInteraction['kind']>().toEqualTypeOf<'recover-taxed-resources' | 'produce-cash'>();
  });
  it.each([
    [], [null], [{ kind: 'automatic', modifier: { target: 'character', measure: 'resources-obstacle', delta: 1 } }],
    [{ kind: 'automatic', modifier: { target: 'created-item', measure: 'resources', delta: 1 } }],
    [{ kind: 'automatic', modifier: { target: 'created-item', measure: 'resources-obstacle', delta: 0.5 } }],
    [{ ...obstacleEffects[1], choiceTiming: 'after-roll' }],
    [{ ...obstacleEffects[1], cost: { kind: 'crafting-obstacle-modifier', delta: -2 } }],
    [{ ...obstacleEffects[1], modifier: { target: 'created-item', measure: 'resources-value-dice', delta: 1 } }],
  ].map(effects => ({ effects })))('rejects malformed valuation/tradeoff data %j', ({ effects }) => {
    expect(() => createSkillCatalog({ ...itemValueFixtureContent, integrations: [{
      ...itemValueFixtureContent.integrations[0], createdItemValueEffects: effects,
    } as unknown as SkillIntegration] })).toThrow();
  });
  it('rejects valuation on a magic integration and dangling Antiphon references', () => {
    expect(() => createSkillCatalog({ ...itemValueFixtureContent, integrations: [{
      ...itemValueFixtureContent.integrations[0], subsystem: 'magic',
    } as unknown as SkillIntegration] })).toThrow('Invalid created-item value effects');
    expect(() => createSkillCatalog({ ...itemValueFixtureContent, references: [] })).toThrow('Unknown skill');
  });
});
