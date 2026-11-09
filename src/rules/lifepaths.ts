import type {
  GameCatalog, LeadDefinition, LifepathDefinition, RequirementNode, SettingId,
} from '../data/catalog';

export interface LifepathProgress {
  readonly paths: readonly LifepathDefinition[];
  readonly settingId?: SettingId;
  readonly leadPending: boolean;
  readonly age: number;
  readonly gender?: 'female' | 'male';
}

export type LifepathIssue =
  | { readonly code: 'REQUIREMENT_UNMET' | 'REQUIREMENT_UNRESOLVED'; readonly requirement: RequirementNode }
  | { readonly code: 'UNKNOWN_LIFEPATH' | 'UNKNOWN_SETTING' | 'CONTENT_UNAVAILABLE' |
      'FIRST_LIFEPATH_MUST_BE_BORN' | 'BORN_LIFEPATH_NOT_FIRST' | 'WRONG_STOCK' |
      'LEAD_REQUIRED' | 'LEAD_NEEDS_LIFEPATH' | 'ALREADY_IN_SETTING' | 'LEAD_NOT_LISTED' };

type Evidence = 'met' | 'unmet' | 'unknown';
const evidence = (met: boolean): Evidence => met ? 'met' : 'unmet';

function requirementEvidence(
  requirement: RequirementNode,
  prior: readonly LifepathDefinition[],
  path: LifepathDefinition,
  gender: LifepathProgress['gender'],
  final?: LifepathProgress,
): Evidence {
  switch (requirement.kind) {
    case 'allOf':
    case 'anyOf': {
      const results = requirement.items.map(item => requirementEvidence(item, prior, path, gender, final));
      const decisive = requirement.kind === 'allOf' ? 'unmet' : 'met';
      if (results.includes(decisive)) return decisive;
      if (results.includes('unknown')) return 'unknown';
      return decisive === 'met' ? 'unmet' : 'met';
    }
    case 'position':
      return evidence(requirement.positions.includes(prior.length + 1) === (requirement.mode === 'only'));
    case 'maxOccurrences':
      return evidence(prior.filter(row => row.familyId === path.familyId).length < requirement.count);
    case 'priorFamily': return evidence(prior.some(row => row.familyId === requirement.familyId));
    case 'priorSetting': return evidence(prior.some(row => row.settingId === requirement.settingId));
    case 'priorSemanticTag': return evidence(prior.some(row => row.semanticTags.includes(requirement.tag)));
    case 'characterGender': return gender ? evidence(gender === requirement.gender) : 'unknown';
    case 'finalStartingAgeGreaterThan': return evidence(!final || final.age > requirement.age);
    case 'finalLifepathCountAtMost': return evidence((final?.paths.length ?? prior.length + 1) <= requirement.count);
    case 'priorLifepathSkillListContains':
      if (prior.some(row => row.skillListMetadata.knownEntries.some(entry =>
        entry.kind === 'skill' ? entry.skillId === requirement.skillId : entry.skillIds.includes(requirement.skillId),
      ))) return 'met';
      return prior.length ? 'unknown' : 'unmet';
  }
}

function requirementIssues(
  progress: LifepathProgress, path: LifepathDefinition, final?: LifepathProgress,
): LifepathIssue[] {
  return path.requirements.flatMap(requirement => {
    const result = requirementEvidence(requirement, progress.paths, path, progress.gender, final);
    if (result === 'met') return [];
    return [{ code: result === 'unknown' ? 'REQUIREMENT_UNRESOLVED' : 'REQUIREMENT_UNMET', requirement }];
  });
}

export function evaluateLifepath(
  progress: LifepathProgress, variantId: string, catalog: GameCatalog,
): readonly LifepathIssue[] {
  const path = catalog.lifepaths.get(variantId);
  if (!path) return [{ code: 'UNKNOWN_LIFEPATH' }];
  const issues = requirementIssues(progress, path);
  if (!progress.paths.length && !path.isBorn) issues.push({ code: 'FIRST_LIFEPATH_MUST_BE_BORN' });
  if (progress.paths.length && path.isBorn) issues.push({ code: 'BORN_LIFEPATH_NOT_FIRST' });
  if (progress.paths.length && progress.paths[0]!.stockId !== path.stockId) issues.push({ code: 'WRONG_STOCK' });
  if (progress.settingId && progress.settingId !== path.settingId) issues.push({ code: 'LEAD_REQUIRED' });
  return issues;
}

function permitsLead(leads: LeadDefinition, settingId: SettingId): boolean {
  switch (leads.kind) {
    case 'to': return leads.settingIds.includes(settingId);
    case 'any': return true;
    case 'anyExcept': return !leads.excludedSettingIds.includes(settingId);
  }
}

export function evaluateLead(
  progress: LifepathProgress, settingId: SettingId, catalog: GameCatalog,
): readonly LifepathIssue[] {
  const setting = catalog.settings.get(settingId);
  if (!setting) return [{ code: 'UNKNOWN_SETTING' }];
  const previous = progress.paths.at(-1);
  const issues: LifepathIssue[] = [];
  if (!previous || progress.leadPending) issues.push({ code: 'LEAD_NEEDS_LIFEPATH' });
  else if (!permitsLead(previous.leads, settingId)) issues.push({ code: 'LEAD_NOT_LISTED' });
  if (progress.settingId === settingId) issues.push({ code: 'ALREADY_IN_SETTING' });
  if (previous && previous.stockId !== setting.stockId) issues.push({ code: 'WRONG_STOCK' });
  if (setting.coverage === 'reference-only') issues.push({ code: 'CONTENT_UNAVAILABLE' });
  return issues;
}

/** Recheck whole-build constraints using each choice's original preceding paths. */
export function validateLifepathRequirements(progress: LifepathProgress) {
  return progress.paths.flatMap((path, index) =>
    requirementIssues({ ...progress, paths: progress.paths.slice(0, index) }, path, progress)
      .map(issue => ({ index, path, issue })),
  );
}
