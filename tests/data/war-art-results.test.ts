import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { WeaponImprovementOptions, SourceSpecificEquipmentQualities, CraftingShadeRequirement, SkillCatalogContent } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const improvements = { kind: 'weapon-improvement-options', target: 'physical-weapon', selection: 'independent-options', options: [
  { kind: 'weapon-improvement', improvement: 'versus-armor', delta: 1, craftingObstacle: { kind: 'current-weapon-va-plus-one' }, repeatability: 'once-per-physical-weapon' },
  { kind: 'weapon-improvement', improvement: 'balance-die', dice: 1, capabilityRef: { kind: 'external-equipment-capability', id: 'balance-dice' }, craftingObstacleAdjustment: 2, repeatability: 'once-per-physical-weapon' },
  { kind: 'weapon-improvement', improvement: 'weapon-power', delta: 1, craftingObstacle: { kind: 'current-weapon-power' }, repeatability: 'once-per-physical-weapon' },
] } as const;
const qualities = { kind: 'source-specific-equipment-qualities', sourceSkillId: 'war-art', combination: 'source-unspecified',
  reconciliation: { kind: 'unresolved-source-conflict', auditId: 'war-art-armor-quality-source-conflict', deferredTo: 'equipment-audit' }, options: [
    { quality: 'dwarven-made', sourceLabel: 'Dwarven-made', outputs: ['armor', 'shield'], craftingObstacleAdjustment: 1,
      effect: { kind: 'source-specific-reroll', face: 1, selection: 'one-rolled-one', recurrence: 'once' } },
    { quality: 'superior', sourceLabel: 'superior quality', outputs: ['armor'], craftingObstacleAdjustment: 3,
      effect: { kind: 'source-specific-reroll', face: 1, selection: 'all-rolled-ones', recurrence: 'every-applicable-roll' } },
  ] } as const;
const shade = { kind: 'crafting-shade-requirement', outputShade: 'gray', requiredCraftingAbilityShade: 'gray',
  ability: { kind: 'effective-crafting-skill', source: 'owning-skill', snapshot: 'at-test' },
  qualification: { kind: 'anyOf', paths: [ { kind: 'actual-skill-shade' },
    { kind: 'temporary-shade-shift', source: { kind: 'external-rule', subsystem: 'artha', id: 'temporary-epiphany' } },
  ] } } as const;
const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const id = 'war-art-results';
const register = (fields: object, subsystem = 'equipment') => createSkillCatalog({ ...generalSkillTranscriptionContent,
  integrations: generalSkillTranscriptionContent.integrations.map(record => record.id === id ? { ...record, subsystem, ...fields } : record),
} as SkillCatalogContent);
const improvement = (i: number, fields: object) => ({ weaponImprovements: { ...improvements,
  options: improvements.options.map((value, index) => index === i ? { ...value, ...fields } : value) } });
const quality = (i: number, fields: object) => ({ sourceSpecificQualities: { ...qualities,
  options: qualities.options.map((value, index) => index === i ? { ...value, ...fields } : value) } });

describe('War Art source-specific equipment results', () => {
  it('preserves three independent improvements with distinct obstacle semantics and physical identity limits', () => {
    expectTypeOf<typeof improvements>().toExtend<WeaponImprovementOptions>();
    expect(catalog.integrations.get(id)?.weaponImprovements).toEqual(improvements);
    expect(improvements.options.map(value => value.repeatability)).toEqual(Array(3).fill('once-per-physical-weapon'));
    expect(improvements.options[2].craftingObstacle).toEqual({ kind: 'current-weapon-power' });
  });
  it('keeps balance-die capability external instead of an intrinsic skill bonus', () => {
    expect(improvements.options[1].capabilityRef).toEqual({ kind: 'external-equipment-capability', id: 'balance-dice' });
    expect(catalog.skills.get('war-art')?.testProfile).toBeUndefined();
  });
  it('retains War Art quality output scopes, reroll statements and unresolved combination/conflict', () => {
    expectTypeOf<typeof qualities>().toExtend<SourceSpecificEquipmentQualities>();
    expect(catalog.integrations.get(id)?.sourceSpecificQualities).toEqual(qualities);
    expect(qualities.options[0].outputs).toEqual(['armor', 'shield']);
    expect(qualities.options[1].outputs).toEqual(['armor']);
    expect(qualities.combination).toBe('source-unspecified');
    expect(qualities.reconciliation.kind).toBe('unresolved-source-conflict');
  });
  it('restricts gray devices to the effective crafting skill at test time, with two source qualification paths', () => {
    expectTypeOf<typeof shade>().toExtend<CraftingShadeRequirement>();
    expect(catalog.integrations.get(id)?.craftingShadeRequirement).toEqual(shade);
    expect(shade.ability).toEqual({ kind: 'effective-crafting-skill', source: 'owning-skill', snapshot: 'at-test' });
  });
  it('preserves root/type/tools/restriction/FoRK and all base crafting guidance', () => {
    const skill = catalog.skills.get('war-art');
    expect(skill).toMatchObject({ rootRule: { kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'agility' }] },
      skillType: 'Craftsman', tools: { kind: 'workshop' }, printedMarkers: ['§'],
      availabilityRestrictions: [{ kind: 'stock-only', stockIds: ['dwarf'], scope: 'always' }] });
    expect(skill?.forkSuggestions?.suggestions).toEqual([{ target: { kind: 'skill', skillId: 'black-metal-artifice' } }]);
    for (const row of ['knives Ob 1', 'hammer/axe/sword Ob 2', 'spear/polearm Ob 3', 'arbalest Ob 4',
      'crossbow/arbalest bolts Ob 2', 'pot helmet Ob 1', 'light mail Ob 2', 'heavy mail Ob 3', 'plated mail Ob 4']) expect(skill?.summary).toContain(row);
  });
  it('serializes without changing equipment, rerolling, evaluating costs/shade or spending Artha', () => {
    expect(createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent))).integrations.get(id)).toEqual(catalog.integrations.get(id));
  });
  it.each([
    { weaponImprovements: { ...improvements, selection: 'choose-exactly-one' } },
    { weaponImprovements: { ...improvements, target: 'weapon-use-profile' } },
    { weaponImprovements: { ...improvements, options: [improvements.options[0], improvements.options[0]] } },
    improvement(0, { repeatability: 'per-increment' }), improvement(1, { repeatability: 'unlimited' }),
    improvement(2, { craftingObstacle: { kind: 'current-weapon-power-plus-one' } }),
    improvement(0, { craftingObstacle: { kind: 'formula', expression: 'VA + 1' } }),
    improvement(0, { craftingObstacleAdjustment: 1 }), improvement(1, { craftingObstacleAdjustment: -2 }),
    improvement(1, { actingSkillBonus: 1 }), improvement(0, { delta: 0 }),
  ])('rejects malformed or invented improvement mechanics %j', fields => expect(() => register(fields)).toThrow('Invalid'));
  it.each([
    quality(0, { outputs: ['weapon'] }), quality(1, { outputs: ['armor', 'shield'] }),
    quality(0, { effect: { kind: 'generic-dwarven-quality' } }),
    quality(1, { effect: { ...qualities.options[1].effect, recurrence: 'once' } }),
    { sourceSpecificQualities: { ...qualities, combination: 'stack' } },
    { sourceSpecificQualities: { ...qualities, combination: 'exclusive' } },
    { sourceSpecificQualities: { ...qualities, sourceSkillId: 'missing-skill' } },
    { sourceSpecificQualities: { ...qualities, reconciliation: { ...qualities.reconciliation, kind: 'resolved' } } },
  ])('rejects quality normalization, guessed stacking or provenance loss %j', fields => expect(() => register(fields)).toThrow('Invalid'));
  it.each([
    { ...shade, ability: { ...shade.ability, source: 'any-owned-gray-skill' } },
    { ...shade, ability: { ...shade.ability, snapshot: 'permanent-only' } },
    { ...shade, qualification: { kind: 'allOf', paths: shade.qualification.paths } },
    { ...shade, outputShade: 'white' }, { ...shade, requiredCraftingAbilityShade: 'black' },
    { ...shade, arthaCost: 5 }, { ...shade, generatedDamage: 'G6' }, null,
  ])('rejects unrelated shade qualifications or invented execution semantics %j', value => expect(() => register({ craftingShadeRequirement: value })).toThrow('Invalid'));
  it('rejects each descriptor in an unrelated subsystem', () => {
    for (const fields of [{ weaponImprovements: improvements }, { sourceSpecificQualities: qualities }, { craftingShadeRequirement: shade }])
      expect(() => register(fields, 'resources')).toThrow('Invalid');
  });
});
