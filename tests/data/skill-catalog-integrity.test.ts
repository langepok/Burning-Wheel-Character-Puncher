import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type {
  SkillAuditFixture, SkillCatalogContent, SkillDefinition, SkillMetadata,
  SkillRollContributor, TrainingBehavior,
} from '../../src/data/skills';
import { skillFixtureContent } from '../../src/data/skills/fixtures';

const testSkill: SkillAuditFixture = {
  id: 'synthetic', sourceName: 'Synthetic', coverage: 'partial', summary: 'Test data, not RAW.',
  source: [{ kind: 'task-brief', document: 'test', section: 'synthetic' }],
};
const empty: SkillCatalogContent = { skills: [], references: [], families: [], choices: [], forkBehaviors: [], integrations: [] };
const withMetadata = (metadata: Partial<SkillMetadata>): SkillCatalogContent => ({ ...empty, skills: [{ ...testSkill, ...metadata }] });

describe('typed skill registration integrity', () => {
  it.each(['skills', 'references', 'families', 'choices', 'forkBehaviors', 'integrations'] as const)(
    'rejects duplicate %s ids', collection => {
      const original = skillFixtureContent[collection];
      expect(() => createSkillCatalog({ ...skillFixtureContent, [collection]: [...original, original[0]] })).toThrow('Duplicate');
    },
  );
  it('rejects cross-kind identity collisions instead of turning a choice into a skill', () => {
    expect(() => createSkillCatalog({ ...skillFixtureContent, skills: [...skillFixtureContent.skills, { ...testSkill, id: 'appropriate-weapons' }] })).toThrow('Duplicate');
  });
  it('rejects empty ids and missing canonical/source metadata', () => {
    expect(() => createSkillCatalog({ ...empty, skills: [{ ...testSkill, id: '' }] })).toThrow('empty id');
    expect(() => createSkillCatalog({ ...empty, skills: [{ ...testSkill, source: [] }] })).toThrow('Missing source');
    expect(() => createSkillCatalog({ ...empty, skills: [{ ...testSkill, sourceName: '' }] })).toThrow('Missing source');
  });
  it.each([
    { openingRequirements: [{ kind: 'known-skill', skillId: 'missing' }] },
    { relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'missing' } }] },
    { forkSuggestions: { policy: 'guidance-not-whitelist', manualContextualContributors: true, suggestions: [{ target: { kind: 'skill', skillId: 'missing' } }] } },
  ] satisfies Partial<SkillMetadata>[])('rejects a dangling skill reference: %j', metadata => {
    expect(() => createSkillCatalog(withMetadata(metadata))).toThrow('Unknown skill reference: missing');
  });
  it('rejects dangling family, behavior and integration references', () => {
    expect(() => createSkillCatalog(withMetadata({ familyMembership: { familyId: 'missing', topicId: 'local' } }))).toThrow('Unknown family');
    expect(() => createSkillCatalog(withMetadata({ specialForkBehaviorId: 'missing' }))).toThrow('Unknown special FoRK');
    expect(() => createSkillCatalog(withMetadata({ capabilities: [{ kind: 'subsystem-capability', id: 'help', integrationId: 'missing' }] }))).toThrow('Unknown integration');
    expect(() => createSkillCatalog(withMetadata({ forkSuggestions: { policy: 'guidance-not-whitelist', manualContextualContributors: true, suggestions: [{ target: { kind: 'wise-family', familyId: 'missing', relevance: 'appropriate' } }] } }))).toThrow('Unknown Wise family');
  });
  it('does not resolve a probable target or require it to be loaded', () => {
    const content = withMetadata({ forkSuggestions: { policy: 'guidance-not-whitelist', manualContextualContributors: true,
      suggestions: [{ target: { kind: 'unresolved-source-reference', sourceLabel: 'Unresolved', probableTargetSkillId: 'not-loaded' } }] } });
    expect(createSkillCatalog(content).skills.get('synthetic')?.forkSuggestions).toEqual(content.skills[0].forkSuggestions);
  });
  it('validates family defaults as well as individual metadata', () => {
    expect(() => createSkillCatalog({ ...empty, families: [{ ...skillFixtureContent.families[0], defaults: { openingRequirements: [{ kind: 'known-skill', skillId: 'missing' }] } }] })).toThrow('Unknown skill reference');
  });
  it('rejects an integration attached to the wrong skill', () => {
    expect(() => createSkillCatalog({ ...skillFixtureContent, skills: [...skillFixtureContent.skills, { ...testSkill,
      capabilities: [{ kind: 'subsystem-capability', id: 'help', integrationId: 'skirmish-help' }],
    }] })).toThrow('Integration belongs to another skill');
    expect(() => createSkillCatalog({ ...empty, integrations: skillFixtureContent.integrations })).toThrow('Unknown skill reference');
  });
  it('rejects ambiguous stock-root branches and duplicate combined roots', () => {
    const root = { kind: 'single', ability: { kind: 'stat', id: 'will' } } as const;
    for (const stockIds of [[], ['same', 'same'], ['']]) {
      expect(() => createSkillCatalog(withMetadata({ rootRule: { kind: 'conditional', cases: [{ stockIds, root }], otherwise: root } }))).toThrow('stock cases');
    }
    expect(() => createSkillCatalog(withMetadata({ rootRule: { kind: 'conditional', cases: [], otherwise: root } }))).toThrow('stock cases');
    expect(() => createSkillCatalog(withMetadata({ rootRule: { kind: 'conditional', cases: [{ stockIds: ['same'], root }, { stockIds: ['same'], root }], otherwise: root } }))).toThrow('stock cases');
    expect(() => createSkillCatalog(withMetadata({ rootRule: { kind: 'combined', abilities: [root.ability, root.ability] } }))).toThrow('distinct');
  });
  it('keeps complete definitions distinct from explicitly partial audit fixtures', () => {
    expectTypeOf<SkillDefinition['rootRule']>().toEqualTypeOf<SkillMetadata['rootRule']>();
    expectTypeOf<SkillAuditFixture['rootRule']>().toEqualTypeOf<SkillMetadata['rootRule'] | undefined>();
    expectTypeOf<Extract<TrainingBehavior, { kind: 'training' }>['exponent']>().toEqualTypeOf<'none'>();
    expectTypeOf<Extract<TrainingBehavior, { kind: 'training' }>['advancement']>().toEqualTypeOf<'none'>();
    expectTypeOf<SkillRollContributor['sourceSkillId']>().toEqualTypeOf<string>();
    // Compile-time safeguards are included in npm run typecheck (tests are in tsconfig).
    // @ts-expect-error Training has no numeric exponent, including B0.
    const numericTraining: TrainingBehavior = { kind: 'training', rootPurpose: 'aptitude-and-practice', exponent: 0, advancement: 'none', openingCost: 2 };
    // @ts-expect-error Appropriate Weapons is a choice, not a SkillDefinition.
    const choiceAsSkill: SkillDefinition = skillFixtureContent.choices[0];
    expect(numericTraining).toBeDefined();
    expect(choiceAsSkill).toBeDefined();
  });
  it('keeps every published fixture and supporting record attributable', () => {
    for (const records of [skillFixtureContent.skills, skillFixtureContent.references, skillFixtureContent.families,
      skillFixtureContent.choices, skillFixtureContent.forkBehaviors, skillFixtureContent.integrations]) {
      for (const record of records) {
        expect(record.source.length, record.id).toBeGreaterThan(0);
        for (const evidence of record.source) {
          if (evidence.kind === 'audit-packet' && evidence.pages) {
            expect(evidence.pages.pdf).toEqual(evidence.pages.printed.map(page => page + 2));
          }
        }
      }
    }
  });
});
