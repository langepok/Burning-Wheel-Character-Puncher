import type { SkillIntegration } from '../types';
import { evidence } from './shared';

export const resourceIntegrations: readonly SkillIntegration[] = [
  { id: 'games-of-chance-settlement', skillId: 'games-of-chance', subsystem: 'resources',
    wagerSettlement: {
      kind: 'wager-settlement', roles: { winner: 'versus-test-winner', loser: 'versus-test-loser' },
      prize: { measure: 'resources-obstacle', setBefore: 'versus-skill-test' },
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
