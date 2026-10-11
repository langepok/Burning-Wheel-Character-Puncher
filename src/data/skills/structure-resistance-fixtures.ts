import type { SkillCatalogContent } from './types';
import { evidence } from './general/shared';
import { structureResistanceIntegrations } from './general/structure-resistance';

/** Reviewed Stone Artifice excerpt, not an out-of-order complete production record. */
export const structureResistanceFixtureContent: SkillCatalogContent = {
  skills: [{ id: 'stone-artifice', sourceName: 'Stone Artifice', coverage: 'partial',
    summary: 'Representative structure-resistance excerpt only.', source: [evidence('Stone Artifice', 301)] }],
  references: [], families: [], choices: [], forkBehaviors: [],
  integrations: structureResistanceIntegrations.filter(integration => integration.skillId === 'stone-artifice'),
};
