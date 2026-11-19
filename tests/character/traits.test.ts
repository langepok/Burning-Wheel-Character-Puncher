import { expect, it } from 'vitest';
import { createSheet } from '../../src/character/workbench';
import { purchaseTrait, refundTrait } from '../../src/character/traits';
import { traitState } from '../../src/rules/traits';
import { createCatalog } from '../../src/data/catalog';
import { humanContent } from '../../src/data/human';
import { applyLifepathCommand, projectLifepathHistory, type LifepathHistory } from '../../src/character/lifepath-history';

const catalog = createCatalog(humanContent);
const route = (...names: string[]) => projectLifepathHistory(names.reduce<LifepathHistory>(
  (history, name) => applyLifepathCommand(history, {kind:'lifepath',id:'human.peasant.' + name}, 'free', catalog),
  {entries: []}), catalog);
const source = {kind:'lifepath', path:'human.peasant.farmer', occurrence:1} as const;
it('keeps access distinct from ownership and refunds the original charge after losing the path', () => {
  const progress = route('born-peasant', 'farmer');
  const empty = createSheet();
  expect(traitState(empty, progress).missing.map(x=>x.id)).toContain('hoarding');
  const bought = purchaseTrait(empty, progress, 'hoarding', source, 'rules');
  expect(bought.error).toBeUndefined();
  expect(traitState(bought.sheet, progress).missing).toHaveLength(0);
  expect(traitState(bought.sheet, route('born-peasant')).issues.join(' ')).toMatch(/source/i);
  expect(refundTrait(bought.sheet, 'hoarding')).toEqual(empty);
});
