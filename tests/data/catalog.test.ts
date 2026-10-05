import { describe, expect, it } from 'vitest';
import { createCatalog, getLifepathDisplayLabel } from '../../src/data/catalog';
import { humanContent, peasantLifepaths, villagerLifepaths } from '../../src/data/human';

describe('catalog foundation', () => {
  it('registers all audited rows through the generic catalog', () => {
    const catalog = createCatalog(humanContent);
    expect(peasantLifepaths).toHaveLength(19);
    expect(villagerLifepaths).toHaveLength(41);
    expect(catalog.lifepaths.size).toBe(60);
  });

  it('qualifies Conscript without changing either variant or its shared family', () => {
    const catalog = createCatalog(humanContent);
    const peasant = catalog.lifepaths.get('human.peasant.conscript')!;
    const villager = catalog.lifepaths.get('human.villager.conscript')!;
    const before = JSON.stringify([peasant, villager]);
    expect(getLifepathDisplayLabel(peasant, catalog)).toBe('Peasant Conscript');
    expect(getLifepathDisplayLabel(villager, catalog)).toBe('Villager Conscript');
    expect(peasant.familyId).toBe('human.conscript');
    expect(villager.familyId).toBe(peasant.familyId);
    expect(peasant.resourceGrant).toEqual({ kind: 'fixed', amount: 4 });
    expect(villager.resourceGrant).toEqual({ kind: 'fixed', amount: 5 });
    expect(JSON.stringify([peasant, villager])).toBe(before);
    expect(getLifepathDisplayLabel(catalog.lifepaths.get('human.peasant.farmer')!, catalog)).toBe('Farmer');
  });
});
