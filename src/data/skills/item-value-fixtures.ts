import type { SkillAuditFixture, SkillCatalogContent, SkillIntegration } from './types';
import { evidence } from './general/shared';

/** Reviewed valuation excerpts only; these are not complete A–Z definitions. */
const fixture = (id: string, sourceName: string, page: number): SkillAuditFixture => ({
  id, sourceName, coverage: 'partial', summary: 'Reviewed created-item valuation metadata only.',
  source: [evidence(sourceName, page)],
});
export const itemValueIntegrations: readonly SkillIntegration[] = [
  { id: 'gem-artifice-value', skillId: 'gem-artifice', subsystem: 'equipment',
    createdItemValueEffects: [
      { kind: 'automatic', modifier: { target: 'created-item', measure: 'resources-obstacle', delta: 1 } },
      { kind: 'optional-tradeoff', choiceTiming: 'before-roll',
        modifier: { target: 'created-item', measure: 'resources-obstacle', delta: 1 },
        cost: { kind: 'crafting-obstacle-modifier', delta: 2 } },
    ], summary: 'Manufactured gems/stones gain value; a separate optional crafting cost adds further value.',
    source: [evidence('Gem Artifice', 275)] },
  { id: 'gemcraft-value', skillId: 'gemcraft', subsystem: 'equipment',
    createdItemValueEffects: [
      { kind: 'automatic', modifier: { target: 'created-item', measure: 'resources-value-dice', delta: 1 } },
    ], summary: 'A cut gemstone gains one die of Resources value.', source: [evidence('Gemcraft', 275)] },
  { id: 'white-metal-artifice-value', skillId: 'white-metal-artifice', subsystem: 'equipment',
    createdItemValueEffects: [
      { kind: 'automatic', modifier: { target: 'created-item', measure: 'resources-obstacle', delta: 1 } },
      { kind: 'optional-tradeoff', choiceTiming: 'before-roll',
        modifier: { target: 'created-item', measure: 'resources-obstacle', delta: 1 },
        cost: { kind: 'crafting-obstacle-modifier', delta: 2 } },
    ], summary: 'Representative ordinary-material valuation only; the mithril clause is not transcribed here.',
    source: [evidence('White Metal Artifice', 308)] },
  { id: 'gem-artifice-matrix', skillId: 'gem-artifice', subsystem: 'magic',
    createdItemReference: { kind: 'enchanting-matrix', target: 'created-item' },
    summary: 'A cut gem may serve as an enchanting matrix, independently of valuation.', source: [evidence('Gem Artifice', 275)] },
  { id: 'gemcraft-antiphon', skillId: 'gemcraft', subsystem: 'magic',
    createdItemReference: { kind: 'antiphon-union', target: 'created-item', skillId: 'antiphon-union-training' },
    summary: 'Gemcraft retains the Antiphon Union integration described for Smithcraft.', source: [evidence('Gemcraft', 275)] },
];
export const itemValueFixtureContent: SkillCatalogContent = {
  skills: [fixture('gem-artifice', 'Gem Artifice', 275), fixture('gemcraft', 'Gemcraft', 275),
    fixture('white-metal-artifice', 'White Metal Artifice', 308)],
  references: [{ id: 'antiphon-union-training', sourceName: 'Antiphon Union Training', source: [evidence('Antiphon Union Training', 255)] }],
  families: [], choices: [], forkBehaviors: [], integrations: itemValueIntegrations,
};
