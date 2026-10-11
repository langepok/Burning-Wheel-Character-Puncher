import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { MagicBaseItemCreation, ResourceInteraction, SkillContext, SkillIntegration, ToolRequirement } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';
import { skillFixtureContent } from '../../src/data/skills/fixtures';

const catalog = createSkillCatalog(skillFixtureContent);
const writingTools = { kind: 'conditional', when: { kind: 'activity', activity: 'writing' },
  then: { kind: 'generic', expendable: true }, otherwise: { kind: 'none', expendable: false } } as const;
const registerTools = (tools: ToolRequirement) => createSkillCatalog({ ...skillFixtureContent,
  skills: skillFixtureContent.skills.map(skill => skill.id === 'dwarven-rune-script' ? { ...skill, tools } : skill),
});

describe('General Skill List source corrections', () => {
  it('keeps Antiphon tools separate from its structured preceding creation-stage reference', () => {
    const creation = { stage: 'base-item-creation', requiredMethod: { kind: 'applicable-skill-song' },
      follows: 'selected-skill-own-rules-and-tools' } as const;
    expectTypeOf<typeof creation>().toExtend<MagicBaseItemCreation>();
    expect(catalog.skills.get('antiphon-union-training')?.tools).toEqual({ kind: 'none', expendable: false });
    expect(catalog.integrations.get('antiphon-creation')).toMatchObject({ subsystem: 'magic', baseItemCreation: creation });
    expect(catalog.skills.get('antiphon-union-training')?.training?.kind).toBe('training');
    expectTypeOf<typeof creation>().not.toExtend<ToolRequirement>();
  });
  it('serializes magic references without propagating another skill song\'s tools', () => {
    const pack = { ...skillFixtureContent,
      skills: skillFixtureContent.skills.map(skill => skill.id === 'weaving-way'
        ? { ...skill, tools: { kind: 'workshop' } as const } : skill),
    };
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(pack)) as typeof pack);
    expect(restored.integrations.get('antiphon-creation')).toEqual(catalog.integrations.get('antiphon-creation'));
    expect(restored.skills.get('weaving-way')?.tools).toEqual({ kind: 'workshop' });
    expect(restored.skills.get('antiphon-union-training')?.tools).toEqual({ kind: 'none', expendable: false });
    expect(restored.skills.get('antiphon-union-training')).toEqual(catalog.skills.get('antiphon-union-training'));
  });
  it.each([
    { stage: 'enchantment', requiredMethod: { kind: 'applicable-skill-song' }, follows: 'selected-skill-own-rules-and-tools' },
    { stage: 'base-item-creation', requiredMethod: { kind: 'runtime-prose' }, follows: 'selected-skill-own-rules-and-tools' },
    { stage: 'base-item-creation', requiredMethod: { kind: 'applicable-skill-song' }, follows: 'inherit-tools' },
  ])('rejects malformed magic creation metadata %j', baseItemCreation => {
    expect(() => createSkillCatalog({ ...skillFixtureContent, integrations: skillFixtureContent.integrations.map(integration =>
      integration.id === 'antiphon-creation' ? { ...integration, baseItemCreation } as unknown as SkillIntegration : integration),
    })).toThrow('Invalid magic base-item-creation reference');
  });
  it('keeps Blacksmith recovery conditional independently of its Workshop tools', () => {
    const recovery = { kind: 'recover-taxed-resources',
      context: { kind: 'circumstance', circumstanceId: 'suitable-workplace' } } as const;
    expectTypeOf<typeof recovery>().toExtend<ResourceInteraction>();
    expect(catalog.skills.get('blacksmith')?.resourceInteractions).toEqual([recovery]);
    expect(catalog.skills.get('blacksmith')?.tools).toEqual({ kind: 'workshop' });
    const changedTools = createSkillCatalog({ ...skillFixtureContent,
      skills: skillFixtureContent.skills.map(skill => skill.id === 'blacksmith'
        ? { ...skill, tools: { kind: 'none', expendable: false } as const } : skill),
    });
    expect(changedTools.skills.get('blacksmith')?.resourceInteractions).toEqual([recovery]);
  });
  it.each(['beggardry', 'carpentry', 'accounting', 'administration'])('%s recovery does not inherit a workplace condition', id => {
    expect(catalog.skills.get(id)?.resourceInteractions).toContainEqual({ kind: 'recover-taxed-resources' });
    expect(catalog.skills.get(id)?.resourceInteractions?.every(value => value.context === undefined)).toBe(true);
  });
  it('round-trips nested Resource contexts through integrity validation', () => {
    const resourceInteractions: readonly ResourceInteraction[] = [{ kind: 'recover-taxed-resources',
      context: { kind: 'allOf', conditions: [
        { kind: 'circumstance', circumstanceId: 'suitable-workplace' },
        { kind: 'anyOf', conditions: [
          { kind: 'activity', activity: 'crafting' }, { kind: 'stock', stockId: 'synthetic-stock' },
        ] },
      ] },
    }];
    const restored = JSON.parse(JSON.stringify({ ...skillFixtureContent,
      skills: skillFixtureContent.skills.map(skill => skill.id === 'blacksmith'
        ? { ...skill, resourceInteractions } : skill),
    })) as typeof skillFixtureContent;
    expect(createSkillCatalog(restored).skills.get('blacksmith')?.resourceInteractions).toEqual(resourceInteractions);
  });
  it.each([
    { kind: 'circumstance', circumstanceId: '' }, { kind: 'circumstance', circumstanceId: '  ' },
    { kind: 'circumstance' }, { kind: 'circumstance', circumstanceId: 1 },
    { kind: 'anyOf', conditions: [{ kind: 'circumstance', circumstanceId: 'suitable-workplace' }] },
  ])('rejects malformed Resource circumstance/context %j', context => {
    expect(() => createSkillCatalog({ ...skillFixtureContent,
      skills: skillFixtureContent.skills.map(skill => skill.id === 'blacksmith' ? { ...skill,
        resourceInteractions: [{ kind: 'recover-taxed-resources', context: context as unknown as SkillContext }],
      } : skill),
    })).toThrow();
  });
  it('keeps Demonology separate from Empyrealia and preserves their printed FoRKs', () => {
    expect(catalog.skills.get('demonology')?.forkSuggestions?.suggestions).toEqual(
      ['ancient-history', 'obscure-history', 'summoning', 'doctrine'].map(skillId => ({ target: { kind: 'skill', skillId } })),
    );
    expect(catalog.skills.get('empyrealia')?.forkSuggestions?.suggestions).toEqual([
      { target: { kind: 'skill', skillId: 'doctrine' } }, { target: { kind: 'skill', skillId: 'summoning' } },
      { target: { kind: 'category', category: 'ritual', relevance: 'any' } },
    ]);
    expect(catalog.skills.get('demonology')?.id).not.toBe(catalog.skills.get('empyrealia')?.id);
  });
  it.each(['dwarven-rune-script', 'elven-script'])('%s requires expendable tools for writing only', id => {
    expect(catalog.skills.get(id)?.tools).toEqual(writingTools);
    expectTypeOf<typeof writingTools>().toExtend<ToolRequirement>();
    expectTypeOf<typeof writingTools.when>().toExtend<SkillContext>();
    const reading: SkillContext = { kind: 'activity', activity: 'reading' };
    expect(reading).not.toEqual(writingTools.when);
  });
  it('round-trips conditional tools nested within allOf/anyOf and vice versa', () => {
    const tools: ToolRequirement = { kind: 'allOf', requirements: [writingTools, {
      kind: 'conditional', when: { kind: 'activity', activity: 'reading' },
      then: { kind: 'anyOf', requirements: [{ kind: 'generic' }, { kind: 'workshop' }] },
      otherwise: writingTools,
    }] };
    const restored = JSON.parse(JSON.stringify(tools)) as ToolRequirement;
    expect(registerTools(restored).skills.get('dwarven-rune-script')?.tools).toEqual(tools);
  });
  it.each([
    { kind: 'activity', activity: '' }, { kind: 'activity' }, { kind: 'activity', activity: 'parse this prose' },
    { kind: 'unknown', value: 'writing' }, { kind: 'allOf', conditions: [] },
  ])('rejects malformed conditional context %j', when => {
    expect(() => registerTools({ ...writingTools, when } as unknown as ToolRequirement)).toThrow();
  });
  it.each(['then', 'otherwise'] as const)('validates the conditional %s branch recursively', branch => {
    expect(() => registerTools({ ...writingTools, [branch]: { kind: 'allOf', requirements: [] } } as unknown as ToolRequirement)).toThrow('at least two operands');
  });
});

/** Leathercraft, book 280 / PDF 282: enchantment-conditioned equipment bonus. */
describe('Pending Leathercraft result effect', () => {
  it('cannot use a crafting-obstacle tradeoff for the Song of Silence enchantment', () => {
    const effect = { kind: 'enchantment', skillId: 'song-of-silence', dice: 1, skillTest: 'stealthy' } as const;
    expectTypeOf<typeof effect>().not.toExtend<NonNullable<Extract<SkillIntegration, { subsystem: 'equipment' }>['equipmentUseEffect']>>();
    const production = createSkillCatalog(generalSkillTranscriptionContent);
    expect(production.skills.has('leathercraft')).toBe(false);
    expect(production.references.get('leathercraft')?.sourceName).toBe('Leathercraft');
  });
});
