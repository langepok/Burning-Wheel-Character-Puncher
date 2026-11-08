import type { SkillIntegration } from '../types';
import { evidence } from './shared';

export const resourceIntegrations: readonly SkillIntegration[] = [
  { id: 'amercement-judicial-fine-assessment', skillId: 'amercement', subsystem: 'resources',
    judicialFineAssessment: { kind: 'judicial-fine-assessment',
      output: { kind: 'resources-obstacle', purpose: 'judicial-fine' }, determination: 'source-unspecified' },
    summary: 'Sets the Resources obstacle of a judicial fine. The entry does not specify how to determine the amount.',
    source: [evidence('Amercement', 254)] },
  { id: 'shrewd-appraisal-price-reduction', skillId: 'shrewd-appraisal', subsystem: 'resources',
    priceReduction: { kind: 'appraised-item-price-reduction', target: 'appraised-item',
      basis: { kind: 'identified-flaws' }, magnitude: 'source-unspecified' },
    summary: 'Successful appraisal identifies flaws and reduces the item price; no numeric or transaction procedure is specified.',
    source: [evidence('Shrewd Appraisal', 296)] },
  { id: 'haggling-negotiation', skillId: 'haggling', subsystem: 'resources',
    purchaseNegotiation: {
      kind: 'purchase-negotiation', roles: ['buyer', 'seller'], test: { kind: 'versus' },
      subject: 'price-purchase-terms-and-contracts',
      buyerObstacleAdjustment: { kind: 'obstacle-modifier', target: 'relevant-negotiation-obstacle', choice: 'optional', delta: -1 },
    }, summary: 'Buyer and seller negotiate; the buyer may lower the relevant obstacle. No extra outcome condition is specified here.',
    source: [evidence('Haggling', 276)] },
  { id: 'games-of-chance-settlement', skillId: 'games-of-chance', subsystem: 'resources',
    wagerSettlement: {
      kind: 'wager-settlement', roles: { winner: 'versus-test-winner', loser: 'versus-test-loser' },
      prize: { measure: 'resources-obstacle', setBefore: 'versus-skill-test', recipient: 'winner' },
      loserResourcesTest: { roller: 'loser', after: 'versus-skill-test', obstacle: { kind: 'same-as-prize-obstacle' } },
      outcomes: [
        { when: 'loser-resources-test-passed', recipient: 'winner',
          effect: { kind: 'resources-advancement-credit', obstacle: { kind: 'same-as-prize-obstacle' } } },
        { when: 'loser-resources-taxed', recipient: 'winner',
          effect: { kind: 'cash-from-taxed-dice', amount: { kind: 'taxed-dice-count', role: 'loser' } } },
      ],
    }, summary: 'The losing participant tests the prize obstacle; passed-test credit and taxed-dice cash are independent conditional facts.',
    source: [evidence('Games of Chance', 275)] },
];
