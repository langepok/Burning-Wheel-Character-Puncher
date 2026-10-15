import { readFileSync } from 'node:fs';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { FatePronouncement, ObstacleBasis, SkillCatalogContent } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const skill = catalog.skills.get('rune-casting')!;
const integration = catalog.integrations.get('rune-casting-fate')!;
const fate = integration.fatePronouncement!;
const base = skill.testProfile!.base!;
const withFate = (value: unknown, subsystem = 'magic') => createSkillCatalog({ ...generalSkillTranscriptionContent,
  integrations: generalSkillTranscriptionContent.integrations.map(record => record.id === integration.id
    ? { ...record, subsystem, fatePronouncement: value } : record),
} as SkillCatalogContent);
const withBase = (value: unknown) => createSkillCatalog({ ...generalSkillTranscriptionContent,
  skills: generalSkillTranscriptionContent.skills.map(record => record.id === skill.id
    ? { ...record, testProfile: { kind: 'obstacle', base: value } } : record),
} as SkillCatalogContent);

describe('Rune Casting named fate basis and structured narrative relationships', () => {
  it('keeps exactly two source-shaped ten-minus candidates and selects the lower obstacle', () => {
    expectTypeOf<typeof base>().toExtend<ObstacleBasis>();
    expect(base).toEqual({ kind: 'rune-casting-fate-obstacle', targetRole: 'target', candidates: [
      { kind: 'ten-minus-highest-social-standing-total', components: ['circles', 'reputation', 'affiliation'] },
      { kind: 'ten-minus-most-expensive-non-common-trait' },
    ], choose: 'lower-obstacle' });
    expect(base).not.toHaveProperty('formula');
    expect(skill.rootRule).toEqual({ kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'perception' }] });
  });
  it('permits caster player to inspect target Beliefs and pronounce only after success', () => {
    expectTypeOf<typeof fate>().toExtend<FatePronouncement>();
    expect(fate.trigger).toEqual({ kind: 'test-success' });
    expect(skill.testProfile?.context).toEqual({ kind: 'circumstance', circumstanceId: 'pronouncing-fate' });
    expect(integration.context).toEqual(skill.testProfile?.context);
    expect(fate.pronouncement).toEqual({ actorRole: 'caster-player', permission: 'may-pronounce-target-fate' });
    expect(fate.targetBeliefInspection).toEqual({ entityKind: 'belief', ownerRole: 'target', readerRole: 'caster-player', permission: 'may-inspect' });
  });
  it('links one target Belief manually and keeps suitably-dire examples open', () => {
    expect(fate.targetBeliefReference).toEqual({ entityKind: 'belief', ownerRole: 'target', selection: 'manual' });
    expect(fate.targetBeliefLink).toEqual({ cardinality: 'one', resolution: 'manual' });
    expect(fate.suitablyDire).toEqual({ resolution: 'manual', examplesPolicy: 'non-exhaustive', examples: ['rise-to-power', 'tragic-death', 'pyrrhic-victory'] });
    const differentExample = { ...fate, suitablyDire: { ...fate.suitablyDire, examples: ['another-table-adjudicated-example'] } };
    expect(() => withFate(differentExample)).not.toThrow();
  });
  it('separates caster commitment from target reference without runtime Belief ids or text', () => {
    expect(fate.casterCommitment).toEqual({ entityKind: 'belief', ownerRole: 'caster', action: 'change', mustMatchPronouncedFate: { resolution: 'manual' } });
    expect(fate.targetBeliefReference.ownerRole).not.toBe(fate.casterCommitment.ownerRole);
    expect(fate.targetBeliefReference).not.toHaveProperty('text');
    expect(fate.casterCommitment).not.toHaveProperty('text');
  });
  it('preserves missing commitment and later commitment change as distinct invalidators', () => {
    expect(fate.validity).toEqual({ requiresCasterCommitmentBelief: true,
      invalidatedBy: ['missing-caster-belief-commitment', 'caster-commitment-belief-changed'] });
  });
  it('preserves agency and manual judgments, including fatal fulfillment', () => {
    expect(fate.targetAgency).toEqual({ resolution: 'player-choice', fateDoesNotCompelBehavior: true });
    expect(fate.fulfillmentDetermination).toBe('manual');
    expect(fate.fatalFulfillmentDetermination).toBe('manual');
  });
  it('gives one Deeds to the fated player and one starting Deeds to their next campaign character on fatal fulfillment', () => {
    expect(fate.fulfillmentRewards).toEqual([
      { trigger: { kind: 'manual-fate-fulfilled' }, recipient: 'fated-character-player', reward: { kind: 'artha', arthaType: 'deeds', amount: 1 } },
      { trigger: { kind: 'manual-fatal-fate-fulfillment' }, recipient: 'fated-character-player-next-campaign-character', reward: { kind: 'starting-artha', arthaType: 'deeds', amount: 1 } },
    ]);
  });
  it('retains shared Astrology special dice and contributor semantics', () => {
    expect(skill.specialForkBehaviorId).toBe('astrology-fork');
    expect(catalog.skills.get('astrology')?.specialForkBehaviorId).toBe(skill.specialForkBehaviorId);
    expect(catalog.forkBehaviors.get('astrology-fork')?.die.one).toEqual({ action: 'reroll', onFailure: { subtractSuccesses: 1 } });
    expect(skill.tools).toEqual({ kind: 'specific-item', item: 'rune-stones' });
    expect(skill.availabilityRestrictions).toEqual([{ kind: 'stock-only', stockIds: ['dwarf'], scope: 'always' }]);
  });
  it('serializes source semantics without performing narrative or arithmetic evaluation', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)));
    expect(restored.integrations.get(integration.id)?.fatePronouncement).toEqual(fate);
    expect(restored.skills.get(skill.id)?.testProfile?.base).toEqual(base);
  });
  it.each([
    null, { ...base, choose: 'higher-obstacle' }, { ...base, targetRole: 'caster' },
    { ...base, candidates: [] }, { ...base, candidates: [{ kind: 'ten-minus-most-expensive-non-common-trait' }] },
    { ...base, candidates: [{ kind: 'ten-minus-highest-social-standing-total', components: ['circles'] }, { kind: 'ten-minus-most-expensive-non-common-trait' }] },
    { ...base, candidates: [{ kind: 'ten-minus-highest-social-standing-total', components: ['circles', 'reputation', 'affiliation'] }, { kind: 'ten-minus-most-expensive-trait' }] },
    { ...base, formula: 'min(10-a,10-b)' }, { ...base, clamp: 1 },
  ])('rejects malformed fate obstacle or formula additions %j', value => {
    expect(() => withBase(value)).toThrow('Invalid');
  });
  it.each([
    null, { ...fate, trigger: { kind: 'test-failure' } },
    { ...fate, targetBeliefReference: { ...fate.targetBeliefReference, ownerRole: 'caster' } },
    { ...fate, targetBeliefLink: { cardinality: 'all', resolution: 'manual' } },
    { ...fate, targetBeliefLink: { cardinality: 'one', resolution: 'text-match' } },
    { ...fate, casterCommitment: { ...fate.casterCommitment, ownerRole: 'target' } },
    { ...fate, suitablyDire: { ...fate.suitablyDire, resolution: 'classifier' } },
    { ...fate, suitablyDire: { ...fate.suitablyDire, examplesPolicy: 'whitelist' } },
    { ...fate, validity: { ...fate.validity, requiresCasterCommitmentBelief: false } },
    { ...fate, validity: { ...fate.validity, invalidatedBy: ['target-belief-changed'] } },
    { ...fate, fulfillmentDetermination: 'automatic' }, { ...fate, fatalFulfillmentDetermination: 'automatic' },
    { ...fate, targetAgency: { resolution: 'forced-action', fateDoesNotCompelBehavior: false } },
    { ...fate, fulfillmentRewards: [] },
    { ...fate, fulfillmentRewards: [{ ...fate.fulfillmentRewards[0], recipient: 'caster' }, fate.fulfillmentRewards[1]] },
    { ...fate, fulfillmentRewards: [{ ...fate.fulfillmentRewards[0], reward: { kind: 'artha', arthaType: 'fate', amount: 1 } }, fate.fulfillmentRewards[1]] },
    { ...fate, fulfillmentRewards: [fate.fulfillmentRewards[0], { ...fate.fulfillmentRewards[1], reward: { kind: 'artha', arthaType: 'deeds', amount: 1 } }] },
    { ...fate, beliefCatalog: [] }, { ...fate, textMatcher: 'semantic' },
    { ...fate, casterCommitment: { ...fate.casterCommitment, text: 'predefined Belief' } },
  ])('rejects malformed narrative relationships, rewards or invented execution %j', value => {
    expect(() => withFate(value)).toThrow('Invalid fate pronouncement');
  });
  it('keeps fate metadata within magic integration', () => {
    expect(() => withFate(fate, 'equipment')).toThrow('Invalid fate pronouncement');
  });
  it('records D-028 narrative/runtime identity boundary without building the runtime', () => {
    const decision = readFileSync('docs/DECISIONS.md', 'utf8').split('## D-028')[1]?.split('## Open decisions')[0];
    for (const text of ['free-form', 'structured', 'Beliefs', 'Instincts', 'not catalog', 'ownership', 'revision', 'manual', 'Rune Casting']) expect(decision).toContain(text);
  });
});
