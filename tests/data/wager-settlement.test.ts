import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { SkillIntegration, WagerSettlement, WagerSettlementOutcome } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const settlement = catalog.integrations.get('games-of-chance-settlement')?.wagerSettlement as WagerSettlement;
const credit = { when: 'loser-resources-test-passed', recipient: 'winner',
  effect: { kind: 'resources-advancement-credit', obstacle: { kind: 'same-as-prize-obstacle' } } } as const;
const cash = { when: 'loser-resources-taxed', recipient: 'winner',
  effect: { kind: 'cash-from-taxed-dice', amount: { kind: 'taxed-dice-count', role: 'loser' } } } as const;

describe('Games of Chance wager settlement', () => {
  it('preserves explicit winner/loser roles and the shared prize-obstacle references', () => {
    expect(settlement.roles).toEqual({ winner: 'versus-test-winner', loser: 'versus-test-loser' });
    expect(settlement.prize).toEqual({ measure: 'resources-obstacle', setBefore: 'versus-skill-test' });
    expect(settlement.loserResourcesTest).toEqual({ roller: 'loser', after: 'versus-skill-test', obstacle: { kind: 'same-as-prize-obstacle' } });
    expect(settlement.outcomes).toEqual([credit, cash]);
  });
  it('keeps the effect/condition pairs distinct at the type boundary', () => {
    expectTypeOf<typeof credit>().toExtend<WagerSettlementOutcome>();
    expectTypeOf<typeof cash>().toExtend<WagerSettlementOutcome>();
    type WrongPair = { when: 'loser-resources-test-passed'; recipient: 'winner'; effect: typeof cash.effect };
    expectTypeOf<WrongPair>().not.toExtend<WagerSettlementOutcome>();
  });
  it('does not transfer the settlement rules to Gambling or direct ResourceInteraction', () => {
    expect([...catalog.integrations.values()].filter(entry => entry.skillId === 'gambling' && entry.wagerSettlement)).toEqual([]);
    expect(catalog.skills.get('gambling')?.capabilities).toEqual([]);
    expect(catalog.skills.get('games-of-chance')?.resourceInteractions).toEqual([]);
    expect(catalog.integrations.get('games-of-chance-settlement')?.subsystem).toBe('resources');
  });
  it('round-trips independent outcomes, including the reversed declaration order', () => {
    const pack = { ...generalSkillTranscriptionContent, integrations: generalSkillTranscriptionContent.integrations.map(entry =>
      entry.id === 'games-of-chance-settlement' ? { ...entry, wagerSettlement: { ...settlement, outcomes: [cash, credit] } } as SkillIntegration : entry) };
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(pack)) as typeof pack);
    expect(restored.integrations.get('games-of-chance-settlement')?.wagerSettlement?.outcomes).toEqual([cash, credit]);
    expect(settlement.outcomes).toEqual([credit, cash]);
  });
  it.each([
    { ...settlement, roles: { winner: 'versus-test-loser', loser: 'versus-test-winner' } },
    { ...settlement, prize: { measure: 'resources-value-dice', setBefore: 'versus-skill-test' } },
    { ...settlement, prize: { ...settlement.prize, setBefore: 'resources-test' } },
    { ...settlement, loserResourcesTest: { ...settlement.loserResourcesTest, roller: 'winner' } },
    { ...settlement, loserResourcesTest: { ...settlement.loserResourcesTest, obstacle: { kind: 'fixed', obstacle: 2 } } },
    { ...settlement, outcomes: [] }, { ...settlement, outcomes: [credit, credit] },
    { ...settlement, outcomes: [{ ...credit, recipient: 'loser' }, cash] },
    { ...settlement, outcomes: [{ ...credit, effect: cash.effect }, cash] },
    { ...settlement, outcomes: [credit, { ...cash, effect: credit.effect }] },
    { ...settlement, outcomes: [{ ...credit, effect: { ...credit.effect, obstacle: { kind: 'fixed', obstacle: 2 } } }, cash] },
    { ...settlement, outcomes: [credit, { ...cash, effect: { ...cash.effect, amount: { kind: 'fixed', dice: 1 } } }] },
    { ...settlement, outcomes: [credit, { ...cash, effect: { ...cash.effect, amount: { kind: 'taxed-dice-count', role: 'winner' } } }] },
  ])('rejects malformed settlement %j', value => {
    expect(() => register(value as unknown as WagerSettlement)).toThrow('Invalid wager settlement');
  });
  it.each(['equipment', 'magic', 'fight'] as const)('rejects a wager settlement placed in %s', subsystem => {
    expect(() => createSkillCatalog({ ...generalSkillTranscriptionContent, integrations: generalSkillTranscriptionContent.integrations.map(entry =>
      entry.id === 'games-of-chance-settlement' ? { ...entry, subsystem } as unknown as SkillIntegration : entry) })).toThrow('Invalid wager settlement');
  });
});

function register(wagerSettlement: WagerSettlement) {
  return createSkillCatalog({ ...generalSkillTranscriptionContent, integrations: generalSkillTranscriptionContent.integrations.map(entry =>
    entry.id === 'games-of-chance-settlement' ? { ...entry, wagerSettlement } as SkillIntegration : entry) });
}
