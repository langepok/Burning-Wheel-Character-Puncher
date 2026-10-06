import { describe, expect, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { SkillAuditFixture, SkillCatalogContent, SkillMetadata, SkillType } from '../../src/data/skills';
import { skillFixtureContent } from '../../src/data/skills/fixtures';

const catalog = createSkillCatalog(skillFixtureContent);
function skill(id: string) {
  const record = catalog.skills.get(id);
  if (!record) throw new Error(`Missing fixture: ${id}`);
  return record;
}
const synthetic: SkillAuditFixture = { id: 'synthetic', sourceName: 'Synthetic', summary: 'Schema test only.', coverage: 'partial',
  source: [{ kind: 'task-brief', document: 'test', section: 'synthetic' }] };
function content(metadata: Partial<SkillMetadata>): SkillCatalogContent {
  return { skills: [{ ...synthetic, ...metadata }], references: [], families: [], choices: [], integrations: [], forkBehaviors: [] };
}

describe('PR #21 schema hardening', () => {
  it('keeps Boxing and Martial Arts separately ownable while reusing mechanics', () => {
    expect(skill('boxing').sourceName).toBe('Boxing (Martial Arts)');
    expect(skill('martial-arts').sourceName).toBe('Martial Arts');
    expect(skill('martial-arts').relations).toEqual([{ kind: 'same-mechanics', target: { kind: 'skill', id: 'boxing' } }]);
    expect(skill('boxing').sourceAliases ?? []).not.toContain('Martial Arts');
    expect(new Set([skill('boxing').id, skill('martial-arts').id]).size).toBe(2);
  });

  it.each(['Social', 'Peasant', 'Forester', 'Artist', 'Musical', 'School of Thought', 'Seafaring', 'Seafarer'] satisfies SkillType[])(
    'registers canonical Skill Type %s without normalizing it', skillType => {
      expect(createSkillCatalog(content({ skillType })).skills.get('synthetic')?.skillType).toBe(skillType);
    },
  );

  it.each([
    ['falconry', { kind: 'allOf', requirements: [{ kind: 'generic' }, { kind: 'specific-item', item: 'falcon' }] }],
    ['hunting', { kind: 'anyOf', requirements: [{ kind: 'specific-item', item: 'bow' }, { kind: 'specific-item', item: 'javelin' }] }],
    ['rope-chant', { kind: 'anyOf', requirements: [{ kind: 'traveling-gear' }, { kind: 'specific-item', item: 'elven-rope' }] }],
  ])('%s preserves tool logic', (id, expected) => {
    expect(skill(id as string).tools).toEqual(expected);
  });

  it('keeps expenditure on individual leaves through nested tool alternatives', () => {
    const tools: SkillMetadata['tools'] = { kind: 'allOf', requirements: [
      { kind: 'generic', expendable: true }, { kind: 'anyOf', requirements: [
        { kind: 'specific-item', item: 'synthetic-a', expendable: false }, { kind: 'workshop' },
      ] },
    ] };
    expect(createSkillCatalog(content({ tools })).skills.get('synthetic')?.tools).toEqual(tools);
    expect(JSON.parse(JSON.stringify(tools))).toEqual(tools);
  });

  it('represents ritual, content applicability, and history/Wise/song FoRK predicates', () => {
    expect(skill('demonology').forkSuggestions?.suggestions).toEqual([{ target: { kind: 'category', category: 'ritual', relevance: 'any' } }]);
    expect(skill('composition').forkSuggestions?.suggestions).toEqual([{ target: { kind: 'applicable-to-content' } }]);
    expect(skill('ballad-of-history').forkSuggestions?.suggestions).toEqual([{ target: { kind: 'anyOf', targets: [
      { kind: 'skill-family', familyId: 'history', relevance: 'appropriate' },
      { kind: 'skill-family', familyId: 'wises', relevance: 'appropriate' },
      { kind: 'category', category: 'song', relevance: 'appropriate' },
    ] } }]);
    for (const id of ['demonology', 'composition', 'ballad-of-history']) {
      expect(skill(id).forkSuggestions).toMatchObject({ policy: 'guidance-not-whitelist', manualContextualContributors: true });
    }
  });

  it('preserves OR between Song of Lordship target traits', () => {
    expect(skill('song-of-lordship').relations).toEqual([{ kind: 'contextual-substitution', target: { kind: 'skill', id: 'etiquette' },
      context: { kind: 'anyOf', conditions: ['etharchal', 'fea', 'aman'].map(traitId => ({ kind: 'target-trait', traitId })) },
    }]);
  });

  it('preserves AND between target stock and origin for Code of Citadels', () => {
    expect(skill('code-of-citadels').useContext).toEqual({ kind: 'allOf', conditions: [
      { kind: 'target-stock', stockId: 'elf' }, { kind: 'target-origin', originId: 'citadel-born' },
    ] });
  });

  it('keeps Driving substitution conditional on pursuit or travel', () => {
    expect(skill('driving').relations).toEqual([{ kind: 'contextual-substitution', target: { kind: 'skill', id: 'riding' },
      context: { kind: 'anyOf', conditions: [{ kind: 'activity', activity: 'pursuit' }, { kind: 'activity', activity: 'travel' }] },
    }]);
    const useContext: SkillMetadata['useContext'] = { kind: 'activity', activity: 'field-maneuver' };
    expect(createSkillCatalog(content({ useContext })).skills.get('synthetic')?.useContext).toEqual(useContext);
    expect(catalog.integrations.get('skirmish-help')?.context).toEqual(useContext);
  });

  it('supports general literacy without widening Dwarven literacy or Playwright requirements', () => {
    expect(skill('read').capabilities).toEqual([{ kind: 'literacy', actions: ['read'] }]);
    expect(skill('write').capabilities).toEqual([{ kind: 'literacy', actions: ['write'] }]);
    expect(skill('dwarven-rune-script').capabilities).toEqual([{ kind: 'literacy', actions: ['read', 'write'], context: { kind: 'culture', cultureId: 'dwarven' } }]);
    expect(skill('playwright').openingRequirements).toEqual([{ kind: 'known-skill', skillId: 'write' }]);
  });

  it('represents a sourced non-Training opening override without guessing unaudited costs', () => {
    const baseOpeningCostOverride: SkillMetadata['baseOpeningCostOverride'] = { kind: 'fixed', points: 2, source: synthetic.source };
    const registered = createSkillCatalog(content({ baseOpeningCostOverride,
      training: { kind: 'exponent', rootPurpose: 'opening', advancement: 'standard' },
    }));
    expect(registered.skills.get('synthetic')?.baseOpeningCostOverride).toEqual(baseOpeningCostOverride);
    for (const id of ['nogger', 'ballad-of-history', 'song-of-lordship']) {
      expect(skill(id).baseOpeningCostOverride).toBeUndefined();
    }
    expect(skill('armor-training').training).toMatchObject({ openingCost: 2, exponent: 'none' });
  });

  it('round-trips new fixtures without parsing prose or losing condition operators', () => {
    const restored = JSON.parse(JSON.stringify(skillFixtureContent)) as SkillCatalogContent;
    expect(createSkillCatalog(restored).skills).toEqual(catalog.skills);
  });

  it('preserves nested target conditions and curated categories for synthetic content', () => {
    const useContext: SkillMetadata['useContext'] = { kind: 'allOf', conditions: [
      { kind: 'target-culture', cultureId: 'synthetic-culture' },
      { kind: 'anyOf', conditions: [{ kind: 'target-trait', traitId: 'synthetic-a' }, { kind: 'target-trait', traitId: 'synthetic-b' }] },
    ] };
    const registered = createSkillCatalog(content({ useContext, semanticCategories: ['ritual'],
      forkSuggestions: { policy: 'guidance-not-whitelist', manualContextualContributors: true, suggestions: [{ target: {
        kind: 'allOf', targets: [{ kind: 'category', category: 'ritual', relevance: 'any' }, { kind: 'applicable-to-content' }],
      } }] },
    }));
    expect(registered.skills.get('synthetic')?.useContext).toEqual(useContext);
    expect(registered.skills.get('synthetic')?.semanticCategories).toEqual(['ritual']);
  });

  it.each([
    { tools: { kind: 'anyOf', requirements: [] } },
    { useContext: { kind: 'allOf', conditions: [] } },
    { forkSuggestions: { policy: 'guidance-not-whitelist', manualContextualContributors: true,
      suggestions: [{ target: { kind: 'allOf', targets: [] } }] } },
  ])('rejects empty boolean expressions rather than treating them as permissive: %j', invalid => {
    // Simulates malformed imported data to exercise runtime integrity guards.
    expect(() => createSkillCatalog(content(invalid as Partial<SkillMetadata>))).toThrow('at least two operands');
  });

  it('checks nested FoRK references rather than only top-level suggestions', () => {
    const nested = (target: { kind: 'skill'; skillId: string } | { kind: 'skill-family'; familyId: string; relevance: 'appropriate' }): Partial<SkillMetadata> => ({
      forkSuggestions: { policy: 'guidance-not-whitelist', manualContextualContributors: true, suggestions: [{ target: {
        kind: 'anyOf', targets: [{ kind: 'applicable-to-content' }, { kind: 'allOf', targets: [
          { kind: 'category', category: 'song', relevance: 'appropriate' }, target,
        ] }],
      } }] },
    });
    expect(() => createSkillCatalog(content(nested({ kind: 'skill', skillId: 'missing' })))).toThrow('Unknown skill reference');
    expect(() => createSkillCatalog(content(nested({ kind: 'skill-family', familyId: 'missing', relevance: 'appropriate' })))).toThrow('Unknown skill family');
  });

  it('checks nested tool and target identifiers', () => {
    expect(() => createSkillCatalog(content({ tools: { kind: 'allOf', requirements: [
      { kind: 'generic' }, { kind: 'anyOf', requirements: [{ kind: 'workshop' }, { kind: 'specific-item', item: '' }] },
    ] } }))).toThrow('Tool item');
    expect(() => createSkillCatalog(content({ useContext: { kind: 'anyOf', conditions: [
      { kind: 'activity', activity: 'travel' }, { kind: 'target-trait', traitId: '' },
    ] } }))).toThrow('Context ids');
  });

  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid base opening points %s', points => {
    expect(() => createSkillCatalog(content({ baseOpeningCostOverride: { kind: 'fixed', points, source: synthetic.source } }))).toThrow('positive integer');
  });

  it('requires override provenance and preserves the independent Training cost', () => {
    expect(() => createSkillCatalog(content({ baseOpeningCostOverride: { kind: 'fixed', points: 2, source: [] } }))).toThrow('provenance');
    expect(() => createSkillCatalog(content({
      baseOpeningCostOverride: { kind: 'fixed', points: 1, source: synthetic.source },
      training: { kind: 'training', rootPurpose: 'aptitude-and-practice', exponent: 'none', advancement: 'none', openingCost: 2 },
    }))).toThrow('cannot replace Training cost');
  });
});
