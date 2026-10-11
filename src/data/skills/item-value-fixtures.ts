import type { SkillAuditFixture, SkillCatalogContent } from './types';
import { evidence } from './general/shared';
import { itemValueIntegrations } from './general/item-value';
export { itemValueIntegrations } from './general/item-value';

/** Reviewed valuation excerpts only; these are not complete A–Z definitions. */
const fixture = (id: string, sourceName: string, page: number): SkillAuditFixture => ({
  id, sourceName, coverage: 'partial', summary: 'Reviewed created-item valuation metadata only.',
  source: [evidence(sourceName, page)],
});
export const itemValueFixtureContent: SkillCatalogContent = {
  skills: [fixture('gem-artifice', 'Gem Artifice', 275), fixture('gemcraft', 'Gemcraft', 275),
    fixture('white-metal-artifice', 'White Metal Artifice', 308)],
  references: [{ id: 'antiphon-union-training', sourceName: 'Antiphon Union Training', source: [evidence('Antiphon Union Training', 255)] }],
  families: [], choices: [], forkBehaviors: [], integrations: itemValueIntegrations,
};
