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
];
