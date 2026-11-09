import type { SkillIntegration } from '../types';
import { evidence } from './shared';

export const equipmentUseIntegrations: readonly SkillIntegration[] = [
  { id: 'forge-artifice-use', skillId: 'forge-artifice', subsystem: 'equipment',
    equipmentUseEffect: {
      target: { kind: 'created-equipment', equipmentKindId: 'forge' },
      effect: { kind: 'advantage-dice', dice: 1, recipient: 'equipment-user', appliesTo: 'tests-using-equipment' },
      acquisition: { kind: 'crafting-obstacle-tradeoff', choice: 'optional', obstacleDelta: 2,
        repeatability: 'per-increment', requiresSuccessfulCreation: true },
    }, summary: 'Successful forge creation can embed use bonuses through per-increment crafting difficulty.',
    source: [evidence('Forge Artifice', 274)] },
  { id: 'black-metal-artifice-use', skillId: 'black-metal-artifice', subsystem: 'equipment',
    equipmentUseEffect: {
      target: { kind: 'created-equipment', equipmentKindId: 'tools' },
      effect: { kind: 'advantage-dice', dice: 1, recipient: 'equipment-user', appliesTo: 'tests-using-equipment' },
      acquisition: { kind: 'crafting-obstacle-tradeoff', choice: 'optional', obstacleDelta: 2,
        repeatability: 'unspecified', requiresSuccessfulCreation: true },
    }, summary: 'An optional crafting tradeoff improves the completed tools; repeatability is not stated.',
    source: [evidence('Black Metal Artifice', 260)] },
];
