import { describe, expect, it } from 'vitest';
import { createBuildHistory } from '../../src/character';
import { applyLifepathCommand, projectLifepathHistory } from '../../src/character/lifepath-history';
import type { BuildMode, LifepathCommand, LifepathHistory } from '../../src/character/lifepath-history';
import { createCatalog } from '../../src/data/catalog';
import { humanContent } from '../../src/data/human';
import { evaluateLead, evaluateLifepath, validateLifepathRequirements } from '../../src/rules/lifepaths';

const catalog = createCatalog(humanContent);
const empty: LifepathHistory = createBuildHistory();
const soldier = 'human.professional-soldier';
const footSoldier = soldier + '.foot-soldier';
const villageBorn = 'human.villager.village-born';
const groom = 'human.villager.groom';
const peasantBorn = 'human.peasant.born-peasant';

const path = (id: string): LifepathCommand => ({ kind: 'lifepath', id });
const lead = (id: string): LifepathCommand => ({ kind: 'lead', id });
const apply = (history: LifepathHistory, command: LifepathCommand, mode: BuildMode = 'rules') =>
  applyLifepathCommand(history, command, mode, catalog);
const progress = (history: LifepathHistory) => projectLifepathHistory(history, catalog);
const build = (...commands: LifepathCommand[]) => commands.reduce((history, command) => apply(history, command), empty);

describe('M1 lifepath history and legality', () => {
  it.each([
    [villageBorn, groom, 14, 18],
    ['human.city-dweller.city-born', 'human.city-dweller.runner', 15, 19],
  ])('plays the %s route through Professional Soldier', (born, bridge, beforeLeadAge, finalAge) => {
    const beforeLead = build(path(born), path(bridge));
    expect(progress(beforeLead).age).toBe(beforeLeadAge);
    expect(apply(beforeLead, path(footSoldier))).toBe(beforeLead);
    expect(evaluateLead(progress(beforeLead), soldier, catalog)).toEqual([]);

    const afterLead = apply(beforeLead, lead(soldier));
    expect(progress(afterLead)).toMatchObject({ age: beforeLeadAge + 1, settingId: soldier, leadPending: true });
    expect(apply(afterLead, lead('human.villager'))).toBe(afterLead);

    const completed = apply(afterLead, path(footSoldier));
    expect(progress(completed)).toMatchObject({ age: finalAge, settingId: soldier, leadPending: false });
    expect(progress(completed).paths.map(row => row.variantId)).toEqual([born, bridge, footSoldier]);
    expect(apply(completed, { kind: 'undo' })).toEqual(afterLead);
    expect(apply(afterLead, { kind: 'undo' })).toEqual(beforeLead);
    expect(apply(completed, { kind: 'reset' })).toEqual(empty);
  });

  it('starts with exactly three Born options and keeps every Born illegal thereafter', () => {
    const legalStarts = [...catalog.lifepaths.keys()].filter(id => !evaluateLifepath(progress(empty), id, catalog).length);
    expect(legalStarts.sort()).toEqual(['human.city-dweller.city-born', peasantBorn, villageBorn]);
    const history = build(path(villageBorn), path(groom), lead(soldier), path(footSoldier));
    for (const id of legalStarts) {
      expect(evaluateLifepath(progress(history), id, catalog)).toContainEqual({ code: 'BORN_LIFEPATH_NOT_FIRST' });
      expect(apply(history, path(id))).toBe(history);
    }
  });

  it('reports listed but unloaded Leads as unavailable data', () => {
    const history = build(path(villageBorn));
    const id = 'human.seafaring';
    expect(evaluateLead(progress(history), id, catalog)).toEqual([{ code: 'CONTENT_UNAVAILABLE' }]);
    expect(apply(history, lead(id), 'rules')).toBe(history);
    expect(apply(history, lead(id), 'free')).toBe(history);
    expect(apply(history, path('missing'), 'free')).toBe(history);
  });

  it('checks structured Lead exclusions and uses the latest lifepath', () => {
    const history = build(path(villageBorn), path('human.villager.serving-girl'));
    expect(progress(history).paths.at(-1)?.sourceName).toBe('Serving Girl');
    expect(evaluateLead(progress(history), soldier, catalog)).toEqual([]);
    expect(evaluateLead(progress(history), 'human.noble', catalog)).toContainEqual({ code: 'LEAD_NOT_LISTED' });
  });

  it('retains the shared rule diagnostics for deliberate Free Creation overrides', () => {
    const illegal = path(footSoldier);
    const issues = evaluateLifepath(progress(empty), footSoldier, catalog);
    expect(issues).toEqual([{ code: 'FIRST_LIFEPATH_MUST_BE_BORN' }]);
    expect(apply(empty, illegal)).toBe(empty);
    const free = apply(empty, illegal, 'free');
    expect(free.entries).toEqual([{ ...illegal, overrides: issues }]);
    expect(progress(free)).toMatchObject({ age: 3, settingId: soldier });
    expect(apply(free, path(villageBorn))).toBe(free);
    const laterBorn = apply(free, path(villageBorn), 'free');
    expect(progress(laterBorn).age).toBe(13);
    expect(apply(laterBorn, { kind: 'undo' })).toEqual(free);
  });

  it('enforces immediate history requirements and permits audited alternative prerequisites', () => {
    const born = build(path(villageBorn));
    const miner = path('human.villager.miner');
    expect(apply(born, miner)).toBe(born);
    const soldierHistory = build(path(villageBorn), path(groom), lead(soldier), path(footSoldier), lead('human.villager'));
    expect(progress(apply(soldierHistory, miner)).paths.at(-1)?.sourceName).toBe('Miner');
    const kid = path('human.villager.kid');
    const withKid = apply(born, kid);
    expect(progress(withKid).paths.at(-1)?.sourceName).toBe('Kid');
    expect(apply(withKid, kid)).toBe(withKid);
  });

  it('does not infer missing Sorcery from partial lifepath lists', () => {
    const history = build(path(peasantBorn));
    const wizard = 'human.peasant.recluse-wizard';
    expect(evaluateLifepath(progress(history), wizard, catalog)).toEqual([
      { code: 'REQUIREMENT_UNRESOLVED', requirement: { kind: 'priorLifepathSkillListContains', skillId: 'sorcery' } },
    ]);
    expect(apply(history, path(wizard))).toBe(history);
  });

  it('checks the Elder final-age requirement against the current whole build', () => {
    const elder = 'human.peasant.elder';
    const born = build(path(peasantBorn));
    expect(evaluateLifepath(progress(born), elder, catalog)).toEqual([]);
    const withElder = apply(born, path(elder));
    expect(validateLifepathRequirements(progress(withElder))).toMatchObject([{ path: { variantId: elder } }]);
    const older = Array.from({ length: 10 }).reduce<LifepathHistory>(
      history => apply(history, path('human.peasant.farmer')), withElder,
    );
    expect(progress(older).age).toBeGreaterThan(50);
    expect(validateLifepathRequirements(progress(older))).toEqual([]);
  });
});
