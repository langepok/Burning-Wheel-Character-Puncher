import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { ActingAbilityChoice, OpposingAbilities, ShieldUse, SkillCatalogContent } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const skill = catalog.skills.get('shield-training')!;
const integration = catalog.integrations.get('shield-training-use')!;
const use = integration.shieldUse!;
const register = (value: unknown, subsystem = 'fight') => createSkillCatalog({ ...generalSkillTranscriptionContent,
  integrations: generalSkillTranscriptionContent.integrations.map(record => record.id === integration.id ? { ...record, subsystem, shieldUse: value } : record),
} as SkillCatalogContent);
const ability = (options: unknown[]) => ({ ...use, shieldStrike: { ...use.shieldStrike, actingAbility: { kind: 'one-of', options } } });

describe('Shield Training action-scoped permissions and acting ability choice', () => {
  it('preserves Martial Training and Aptitude-only root without rolling the Training', () => {
    expect(skill.skillType).toBe('Martial Training');
    expect(skill.rootRule).toEqual({ kind: 'single', ability: { kind: 'stat', id: 'agility' } });
    expect(skill.training).toEqual({ kind: 'training', rootUsage: 'aptitude-only', learningMethods: ['practice', 'instruction'], exponent: 'none', advancement: 'none', openingCost: 2 });
    expect(skill.testProfile).toBeUndefined();
  });
  it('retains trained Block/Counterstrike contributions and grants Block & Strike access', () => {
    expectTypeOf<typeof use>().toExtend<ShieldUse>();
    expect(use.trainedDefenseAccess).toEqual([
      { action: 'block', shieldContribution: 'defense-dice' },
      { action: 'counterstrike', shieldContribution: 'defensive-portion' },
      { action: 'block-and-strike', access: 'enabled', shieldContribution: 'defensive-portion' },
    ]);
    expect(use).not.toHaveProperty('passiveDefense');
    expect(use).not.toHaveProperty('alwaysOn');
  });
  it('allows untrained shield contribution only to Block with no Block & Strike access', () => {
    expect(use.untrainedDefenseAccess).toEqual([{ action: 'block', shieldContribution: 'defense-dice' }]);
    expect(use.untrainedDefenseAccess.map(entry => entry.action)).not.toContain('block-and-strike');
  });
  it('keeps the actor\'s shield Strike ability distinct from permissions and opposing abilities', () => {
    expectTypeOf<typeof use.shieldStrike.actingAbility>().toExtend<ActingAbilityChoice>();
    expectTypeOf<ActingAbilityChoice>().not.toExtend<OpposingAbilities>();
    expect(use.shieldStrike).toEqual({ action: 'strike', implement: 'shield', actor: 'primary-actor', actingAbility: { kind: 'one-of', options: [
      { kind: 'skill', id: 'brawling' },
      { kind: 'context-resolved-skill', role: 'appropriate-boxing-skill', resolution: 'manual' },
      { kind: 'stat', id: 'agility' },
    ] } });
    expect(use.shieldStrike).not.toHaveProperty('opposingAbilities');
    expect(use.shieldStrike.actingAbility.options).not.toContainEqual({ kind: 'skill', id: 'shield-training' });
  });
  it('preserves contextual Boxing wording without aliasing, default or fake family', () => {
    const contextual = use.shieldStrike.actingAbility.options[1];
    expect(contextual).toEqual({ kind: 'context-resolved-skill', role: 'appropriate-boxing-skill', resolution: 'manual' });
    expect(contextual).not.toHaveProperty('id');
    expect(contextual).not.toHaveProperty('skillId');
    expect(contextual).not.toHaveProperty('fallback');
    expect(catalog.skills.get('boxing')?.id).not.toBe(catalog.skills.get('martial-arts')?.id);
    expect(catalog.families.has('boxing')).toBe(false);
  });
  it('serializes permissions and choices without resolving actions or choosing a skill', () => {
    expect(createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent))).integrations.get(integration.id)?.shieldUse).toEqual(use);
  });
  it.each([
    null, { ...use, kind: 'passive-shield-defense' }, { ...use, passiveDefense: true }, { ...use, alwaysOn: true },
    { ...use, trainedDefenseAccess: [] },
    { ...use, trainedDefenseAccess: [{ action: 'avoid', shieldContribution: 'defense-dice' }] },
    { ...use, trainedDefenseAccess: [use.trainedDefenseAccess[0], { action: 'counterstrike', shieldContribution: 'whole-pool' }, use.trainedDefenseAccess[2]] },
    { ...use, untrainedDefenseAccess: [...use.untrainedDefenseAccess, use.trainedDefenseAccess[2]] },
    { ...use, shieldStrike: { ...use.shieldStrike, actor: 'target' } },
    { ...use, shieldStrike: { ...use.shieldStrike, action: 'counterstrike' } },
    { ...use, shieldStrike: { ...use.shieldStrike, actingAbility: { kind: 'anyOf', operands: [] } } },
  ])('rejects malformed shield permissions or invented passive semantics %j', value => {
    expect(() => register(value)).toThrow('Invalid shield-use');
  });
  it.each([
    [{ kind: 'skill', id: 'missing-ability' }, { kind: 'stat', id: 'agility' }],
    [{ kind: 'skill', id: 'shield-training' }, { kind: 'stat', id: 'agility' }],
    [{ kind: 'stat', id: '' }, { kind: 'skill', id: 'brawling' }],
    [{ kind: 'weapon-profile', id: 'polearm-thrust' }, { kind: 'stat', id: 'agility' }],
    [{ kind: 'context-resolved-skill', role: 'appropriate-boxing-skill', resolution: 'manual', id: 'boxing' }, { kind: 'stat', id: 'agility' }],
    [{ kind: 'context-resolved-skill', role: 'appropriate-boxing-skill', resolution: 'automatic' }, { kind: 'stat', id: 'agility' }],
    [{ kind: 'context-resolved-skill', actorRole: 'opponent', resolution: 'manual' }, { kind: 'stat', id: 'agility' }],
  ].map(options => ({ options })))('rejects invalid, dangling or non-rollable acting ability options %j', ({ options }) => {
    expect(() => register(ability(options))).toThrow();
  });
  it('keeps shield-use metadata in Fight integration', () => {
    expect(() => register(use, 'magic')).toThrow('Invalid shield-use');
  });
});
