import type { SkillIntegration } from '../types';
import { evidence } from './shared';

export const structureResistanceIntegrations: readonly SkillIntegration[] = [
  { id: 'hallmaster-resistance', skillId: 'hallmaster', subsystem: 'equipment',
    structureResistance: {
      kind: 'structure-resistance', target: 'created-structure',
      acquisition: { kind: 'crafting-obstacle-tradeoff', choice: 'optional', obstacleDelta: 2, repeatability: 'unspecified' },
      effect: { kind: 'obstacle-modifier', delta: 1, target: 'tests-against-created-structure', appliesTo: ['alter', 'destroy'] },
    }, summary: 'An optional construction tradeoff makes the resulting structure harder to alter or destroy.',
    source: [evidence('Hallmaster', 276)] },
  { id: 'stone-artifice-resistance', skillId: 'stone-artifice', subsystem: 'equipment',
    structureResistance: {
      kind: 'structure-resistance', target: 'created-structure',
      acquisition: { kind: 'crafting-obstacle-tradeoff', choice: 'optional', obstacleDelta: 2, repeatability: 'unspecified' },
      effect: { kind: 'obstacle-modifier', delta: 1, target: 'tests-against-created-structure', appliesTo: ['alter', 'destroy'] },
    }, summary: 'A construction obstacle tradeoff increases resistance of the structure; no repeatability is inferred.',
    source: [evidence('Stone Artifice', 301)] },
];
