import type { SkillCatalogContent } from './types';
import { evidence } from './general/shared';

/** Opposed-test excerpts only; full O/S transcription remains in source order.
 * Stealthy's light/weather/ground advantage guidance is not assigned invented dice. */
export const testProfileFixtureContent: SkillCatalogContent = {
  skills: [
    { id: 'observation', sourceName: 'Observation', coverage: 'partial',
      summary: 'Opposed-test excerpt for detecting hidden subjects.', source: [evidence('Observation', 286)],
      testProfile: { kind: 'versus', opposingAbilities: [
        { kind: 'skill', skillId: 'inconspicuous' }, { kind: 'skill', skillId: 'stealthy' },
        { kind: 'skill', skillId: 'sleight-of-hand' }, { kind: 'skill', skillId: 'trapper' },
      ] } },
    { id: 'stealthy', sourceName: 'Stealthy', coverage: 'partial',
      summary: 'Opposes Observation; light, weather and ground may provide advantage, without a fixed value here.',
      source: [evidence('Stealthy', 301)],
      testProfile: { kind: 'versus', opposingAbilities: [{ kind: 'skill', skillId: 'observation' }] } },
  ],
  references: [
    { id: 'inconspicuous', sourceName: 'Inconspicuous', source: [evidence('Inconspicuous', 278)] },
    { id: 'sleight-of-hand', sourceName: 'Sleight of Hand', source: [evidence('Sleight of Hand', 297)] },
    { id: 'trapper', sourceName: 'Trapper', source: [evidence('Trapper', 305)] },
  ],
  families: [], choices: [], forkBehaviors: [], integrations: [],
};
