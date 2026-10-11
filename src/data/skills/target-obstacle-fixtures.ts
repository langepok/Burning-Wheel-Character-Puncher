import type { SkillCatalogContent } from './types';
import { evidence } from './general/shared';

/** Reviewed Intimidation basis only; its Steel/hesitation procedure is not modeled here. */
export const targetObstacleFixtureContent: SkillCatalogContent = {
  skills: [{ id: 'intimidation', sourceName: 'Intimidation', coverage: 'partial',
    summary: 'The initial threat test uses target Will; no Interrogation adjustments are inherited.',
    source: [evidence('Intimidation', 278), evidence('Intimidation continuation', 279)],
    testProfile: { kind: 'obstacle', base: { kind: 'target-ability-exponent',
      ability: { kind: 'stat', id: 'will' }, snapshot: 'current' } } }],
  references: [], families: [], choices: [], forkBehaviors: [], integrations: [],
};
