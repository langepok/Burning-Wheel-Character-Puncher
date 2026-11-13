import type { GameCatalog } from '../data/catalog';
import { evaluateLead, evaluateLifepath, validateLifepathRequirements } from '../rules/lifepaths';
import type { LifepathIssue, LifepathProgress } from '../rules/lifepaths';
import { createBuildHistory } from './index';
import type { BuildHistory } from './index';

type Choice = { readonly kind: 'lifepath' | 'lead'; readonly id: string };
type Gender = { readonly kind: 'gender'; readonly value: LifepathProgress['gender'] };
type Entry = Gender | (Choice & { readonly overrides: readonly LifepathIssue[] });
export type LifepathHistory = BuildHistory<Entry>;
export type BuildMode = 'rules' | 'free';
export type LifepathCommand = Choice | Gender | { readonly kind: 'undo' | 'reset' };

export function projectLifepathHistory(history: LifepathHistory, catalog: GameCatalog): LifepathProgress {
  const paths: LifepathProgress['paths'][number][] = [];
  let settingId: LifepathProgress['settingId'];
  let gender: LifepathProgress['gender'];
  let leadPending = false;
  let age = 0;
  for (const entry of history.entries) {
    switch (entry.kind) {
      case 'gender': gender = entry.value; break;
      case 'lead':
        settingId = entry.id;
        leadPending = true;
        age++;
        break;
      case 'lifepath': {
        const path = catalog.lifepaths.get(entry.id);
        if (!path) throw new Error('History references an unknown lifepath: ' + entry.id);
        paths.push(path);
        settingId = path.settingId;
        leadPending = false;
        age += path.years;
        break;
      }
    }
  }
  return { paths, settingId, gender, leadPending, age };
}

export function canApplyChoice(mode: BuildMode, issues: readonly LifepathIssue[]): boolean {
  return issues.length === 0 || (mode === 'free' && !issues.some(issue =>
    issue.code === 'UNKNOWN_LIFEPATH' || issue.code === 'UNKNOWN_SETTING' ||
    issue.code === 'CONTENT_UNAVAILABLE' || issue.code === 'ALREADY_IN_SETTING',
  ));
}

export function applyLifepathCommand(
  history: LifepathHistory, command: LifepathCommand, mode: BuildMode, catalog: GameCatalog,
): LifepathHistory {
  switch (command.kind) {
    case 'reset': return createBuildHistory<Entry>();
    case 'undo': return { entries: history.entries.slice(0, -1) };
    case 'gender': {
      const next = { entries: [...history.entries, command] };
      if (mode === 'free') return next;
      const before = validateLifepathRequirements(projectLifepathHistory(history, catalog));
      const after = validateLifepathRequirements(projectLifepathHistory(next, catalog));
      return after.some(({ index, issue }) => !before.some(previous =>
        previous.index === index && previous.issue.code === issue.code &&
        'requirement' in previous.issue && 'requirement' in issue &&
        previous.issue.requirement === issue.requirement,
      )) ? history : next;
    }
    case 'lead':
    case 'lifepath': {
      const progress = projectLifepathHistory(history, catalog);
      const issues = command.kind === 'lead'
        ? evaluateLead(progress, command.id, catalog)
        : evaluateLifepath(progress, command.id, catalog);
      return canApplyChoice(mode, issues)
        ? { entries: [...history.entries, { ...command, overrides: issues }] }
        : history;
    }
  }
}
