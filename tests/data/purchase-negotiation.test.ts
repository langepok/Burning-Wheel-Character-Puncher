import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { PurchaseNegotiation, SkillIntegration } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const expected = {
  kind: 'purchase-negotiation', roles: ['buyer', 'seller'], test: { kind: 'versus' },
  subject: 'price-purchase-terms-and-contracts',
  buyerObstacleAdjustment: { kind: 'obstacle-modifier', target: 'relevant-negotiation-obstacle', choice: 'optional', delta: -1 },
} as const;

describe('Haggling purchase negotiation metadata', () => {
  it('preserves roles, versus test, subject and optional buyer -1 obstacle', () => {
    expectTypeOf<typeof expected>().toExtend<PurchaseNegotiation>();
    expect(catalog.integrations.get('haggling-negotiation')).toMatchObject({ subsystem: 'resources', purchaseNegotiation: expected });
    expect(catalog.skills.get('haggling')?.capabilities).toEqual([{ kind: 'subsystem-capability', id: 'purchase-negotiation', integrationId: 'haggling-negotiation' }]);
  });
  it('does not introduce a victory condition or a seller consequence', () => {
    expect(catalog.integrations.get('haggling-negotiation')?.purchaseNegotiation).toEqual(expected);
    expect(catalog.integrations.get('haggling-negotiation')?.wagerSettlement).toBeUndefined();
  });
  it.each(['gambling', 'games-of-chance'])('%s does not inherit Haggling semantics', id => {
    expect([...catalog.integrations.values()].filter(entry => entry.skillId === id && entry.purchaseNegotiation)).toEqual([]);
  });
  it('round-trips the complete descriptor through serialization and integrity validation', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)) as typeof generalSkillTranscriptionContent);
    expect(restored.integrations.get('haggling-negotiation')?.purchaseNegotiation).toEqual(expected);
  });
  it.each([
    { ...expected, kind: 'wager-settlement' }, { ...expected, roles: ['buyer', 'winner'] },
    { ...expected, roles: ['buyer', 'seller', 'loser'] },
    { ...expected, test: { kind: 'independent' } }, { ...expected, subject: 'crafting' },
    { ...expected, buyerObstacleAdjustment: { ...expected.buyerObstacleAdjustment, kind: 'dice-modifier' } },
    { ...expected, buyerObstacleAdjustment: { ...expected.buyerObstacleAdjustment, target: 'created-item' } },
    { ...expected, buyerObstacleAdjustment: { ...expected.buyerObstacleAdjustment, choice: 'automatic' } },
    { ...expected, buyerObstacleAdjustment: { ...expected.buyerObstacleAdjustment, delta: 0 } },
    { ...expected, buyerObstacleAdjustment: { ...expected.buyerObstacleAdjustment, delta: -0.5 } },
    { ...expected, buyerObstacleAdjustment: null },
  ])('rejects malformed purchase negotiation %j', value => {
    expect(() => register(value as unknown as PurchaseNegotiation)).toThrow('Invalid purchase negotiation');
  });
  it.each(['equipment', 'magic', 'fight'] as const)('rejects purchase negotiation in %s', subsystem => {
    expect(() => createSkillCatalog({ ...generalSkillTranscriptionContent, integrations: generalSkillTranscriptionContent.integrations.map(entry =>
      entry.id === 'haggling-negotiation' ? { ...entry, subsystem } as unknown as SkillIntegration : entry) })).toThrow('Invalid purchase negotiation');
  });
});

function register(purchaseNegotiation: PurchaseNegotiation) {
  return createSkillCatalog({ ...generalSkillTranscriptionContent, integrations: generalSkillTranscriptionContent.integrations.map(entry =>
    entry.id === 'haggling-negotiation' ? { ...entry, purchaseNegotiation } as SkillIntegration : entry) });
}
