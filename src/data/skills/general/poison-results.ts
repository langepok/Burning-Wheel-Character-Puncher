import type { SkillIntegration } from '../types';
import { evidence } from './shared';

export const poisonIntegrations: readonly SkillIntegration[] = [
  { id: 'poisons-crafted-product', skillId: 'poisons', subsystem: 'equipment',
    craftedPoison: { target: 'created-poison', potencies: [
      { kind: 'sickening', craftingObstacle: 2, effect: { kind: 'obstacle-penalty', delta: 1, scope: 'source-unspecified' } },
      { kind: 'debilitating', craftingObstacle: 3, effect: { kind: 'obstacle-penalty', delta: 2, scope: 'source-unspecified' } },
      { kind: 'deadly', craftingObstacle: 4, effect: { kind: 'fixed-wound', severity: { shade: 'black', exponent: 10 } } },
    ], deliveries: [
      { kind: 'ingestion', craftingObstacleDelta: 0 }, { kind: 'blade', craftingObstacleDelta: 1 },
      { kind: 'inhaled-vapor', craftingObstacleDelta: 2 }, { kind: 'contact', craftingObstacleDelta: 3 },
    ] }, summary: 'Crafted poison potency and intended delivery are independent; no exposure, resistance, duration or wound processing is evaluated.',
    source: [evidence('Poisons', 288), evidence('Poisons continuation', 289)] },
  { id: 'vile-poisoner-products', skillId: 'vile-poisoner', subsystem: 'equipment',
    craftedPoison: { target: 'created-poison', products: [
      { kind: 'crafted-poison', variant: 'stinging-nettling-contact', craftingObstacle: 2,
        exposure: { kind: 'skin-contact' }, outcomes: [
          { kind: 'condition', recipient: 'victim', condition: 'boils' },
          { kind: 'test-obstacle-penalty', recipient: 'victim', amount: 2, scopes: ['physical-tests', 'martial-tests', 'social-tests'], duration: { kind: 'scene', count: 1 } },
        ] },
      { kind: 'crafted-poison', variant: 'debilitating-ingested', craftingObstacle: 4,
        exposure: { kind: 'ingested' }, resistance: { actor: 'victim', ability: { kind: 'stat', id: 'forte' }, obstacle: 4 },
        onResistanceFailure: { magnitude: { kind: 'margin-of-failure', source: 'resistance-test' }, effects: [
          { kind: 'reduce-health', recipient: 'victim', duration: 'permanent' },
          { kind: 'reduce-health-maximum', recipient: 'victim', duration: 'permanent' },
        ] } },
      { kind: 'crafted-poison', variant: 'deadly-weapon', craftingObstacle: 5,
        application: { kind: 'weapon-coating', allowedTargets: ['blade', 'arrowhead'] },
        exposure: { kind: 'injected-by-hit', requiredHitResult: 'mark' },
        delayedOutcome: { delay: { kind: 'six-plus-target-forte', unit: 'exchange' },
          outcome: { kind: 'wound', recipient: 'victim', severity: { shade: 'black', exponent: 9 }, quantity: 1, relation: 'additional' } } },
    ] }, summary: 'Distinct crafted poison products retain source exposure/resistance and consequence references without evaluating them. The Mark condition is literal, not Mark-or-better; no dose, coating persistence or stacking policy is inferred.',
    source: [evidence('Vile Poisoner', 306)] },

];
