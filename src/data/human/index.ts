import type { CatalogContent } from '../catalog';
import { humanFamilies, humanSettings, humanSkillReferences, humanStocks } from './definitions';
import { m1Lifepaths } from './m1-lifepaths';
import { peasantLifepaths } from './peasant';
import { villagerLifepaths } from './villager';

export { peasantLifepaths, villagerLifepaths };

export const humanContent: CatalogContent = {
  stocks: humanStocks,
  settings: humanSettings,
  families: humanFamilies,
  skills: humanSkillReferences,
  lifepaths: [...peasantLifepaths, ...villagerLifepaths, ...m1Lifepaths],
};
