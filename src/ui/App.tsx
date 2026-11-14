import { useState } from 'react';
import { createBuildHistory } from '../character';
import { applyLifepathCommand, canApplyChoice, projectLifepathHistory } from '../character/lifepath-history';
import type { BuildMode, LifepathCommand, LifepathHistory } from '../character/lifepath-history';
import { createCatalog, getLifepathDisplayLabel } from '../data/catalog';
import type { RequirementNode } from '../data/catalog';
import { humanContent } from '../data/human';
import { evaluateLead, evaluateLifepath, validateLifepathRequirements } from '../rules/lifepaths';
import type { LifepathIssue, LifepathProgress } from '../rules/lifepaths';

const catalog = createCatalog(humanContent);
const settings = [...catalog.settings.values()];
const paths = [...catalog.lifepaths.values()];
const settingName = (id: string) => catalog.settings.get(id)?.sourceName ?? id;

function describeRequirement(node: RequirementNode): string {
  switch (node.kind) {
    case 'allOf':
    case 'anyOf': return '(' + node.items.map(describeRequirement).join(node.kind === 'allOf' ? ' and ' : ' or ') + ')';
    case 'position': return (node.mode === 'only' ? 'Only at position ' : 'Except at position ') + node.positions.join(', ');
    case 'maxOccurrences': return 'At most ' + node.count + ' selections of this lifepath family';
    case 'priorFamily': return 'Earlier ' + (catalog.families.get(node.familyId)?.sourceName ?? node.familyId);
    case 'priorSetting': return 'Earlier lifepath in ' + settingName(node.settingId);
    case 'priorSemanticTag': return 'Earlier ' + node.tag + ' lifepath';
    case 'characterGender': return 'Character gender: ' + node.gender;
    case 'finalLifepathCountAtMost': return 'At most ' + node.count + ' lifepaths in the completed build';
    case 'finalStartingAgeGreaterThan': return 'Final starting age over ' + node.age;
    case 'priorLifepathSkillListContains': return 'Earlier lifepath listing ' + (catalog.skills.get(node.skillId)?.sourceName ?? node.skillId);
  }
}

function describeIssue(issue: LifepathIssue): string {
  switch (issue.code) {
    case 'REQUIREMENT_UNMET': return 'Unmet requirement: ' + describeRequirement(issue.requirement);
    case 'REQUIREMENT_UNRESOLVED': return 'Insufficient information: ' + describeRequirement(issue.requirement);
    case 'UNKNOWN_LIFEPATH': return 'Unknown lifepath.';
    case 'UNKNOWN_SETTING': return 'Unknown setting.';
    case 'CONTENT_UNAVAILABLE': return 'Lifepath data for this setting is outside the pilot.';
    case 'FIRST_LIFEPATH_MUST_BE_BORN': return 'Choose a Born lifepath first.';
    case 'BORN_LIFEPATH_NOT_FIRST': return 'Born lifepaths are only available as the first choice.';
    case 'WRONG_STOCK': return 'This choice is from a different stock.';
    case 'LEAD_REQUIRED': return 'Take a Lead to this setting first.';
    case 'LEAD_NEEDS_LIFEPATH': return 'Choose a lifepath before taking a Lead.';
    case 'ALREADY_IN_SETTING': return 'Already in this setting.';
    case 'LEAD_NOT_LISTED': return 'The last lifepath does not list this Lead.';
  }
}

export function App() {
  const [history, setHistory] = useState<LifepathHistory>(() => createBuildHistory());
  const [mode, setMode] = useState<BuildMode>('rules');
  const [browsedSetting, setBrowsedSetting] = useState('');
  const progress = projectLifepathHistory(history, catalog);
  const displayedSetting = browsedSetting || progress.settingId;
  const displayedPaths = paths.filter(path =>
    (displayedSetting ? path.settingId === displayedSetting : path.isBorn) &&
    (mode === 'free' || progress.paths.length === 0 || !path.isBorn),
  );
  const finalIssues = validateLifepathRequirements(progress);

  function apply(command: LifepathCommand) {
    setHistory(previous => applyLifepathCommand(previous, command, mode, catalog));
    if (command.kind !== 'gender') setBrowsedSetting('');
  }

  return (
    <main>
      <h1>Burning Wheel Character Puncher</h1>
      <p>Character Burner v2 · Lifepath pilot</p>
      <label>
        Build mode{' '}
        <select value={mode} onChange={event => setMode(event.target.value as BuildMode)}>
          <option value="rules">Rules</option>
          <option value="free">Free Creation</option>
        </select>
      </label>
      {' '}
      <label>
        Character gender{' '}
        <select value={progress.gender ?? ''} onChange={event => apply({
          kind: 'gender', value: (event.target.value || undefined) as LifepathProgress['gender'],
        })}>
          <option value="">Unspecified</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
      </label>

      <section aria-labelledby="history">
        <h2 id="history">Build history</h2>
        <p aria-live="polite">Age: {progress.age} years · Current setting: {progress.settingId ? settingName(progress.settingId) : 'None'}</p>
        <ol>
          {history.entries.map((entry, index) => (
            <li key={index}>
              {entry.kind === 'gender' ? 'Gender: ' + (entry.value ?? 'Unspecified')
                : entry.kind === 'lead' ? 'Lead to ' + settingName(entry.id) + ' (+1 year)'
                : getLifepathDisplayLabel(catalog.lifepaths.get(entry.id)!, catalog)}
              {entry.kind !== 'gender' && entry.overrides.length > 0 &&
                <span> · Free Creation override: {entry.overrides.map(describeIssue).join(' ')}</span>}
            </li>
          ))}
        </ol>
        <button type="button" disabled={!history.entries.length} onClick={() => apply({ kind: 'undo' })}>Undo</button>
        {' '}
        <button type="button" disabled={!history.entries.length} onClick={() => apply({ kind: 'reset' })}>Reset</button>
        {progress.leadPending && <p>Choose a lifepath in the destination to complete the transition.</p>}
        {finalIssues.length > 0 && (
          <ul aria-label="Current build requirements">
            {finalIssues.map(({ index, path, issue }, item) => (
              <li key={item}>{index + 1}. {path.sourceName}: {describeIssue(issue)}</li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="choices">
        <h2 id="choices">{displayedSetting ? settingName(displayedSetting) : 'Born lifepaths'}</h2>
        <label>
          Browse setting{' '}
          <select value={displayedSetting ?? ''} onChange={event => setBrowsedSetting(event.target.value)}>
            <option value="" disabled={!!progress.settingId}>Born lifepaths</option>
            {settings.map(setting => (
              <option key={setting.id} value={setting.id}>{setting.sourceName}</option>
            ))}
          </select>
        </label>
        {displayedSetting && catalog.settings.get(displayedSetting)?.coverage === 'partial' &&
          <p>Only the audited pilot lifepaths are available in this setting.</p>}
        {displayedPaths.length === 0 && <p>Lifepath data for this setting is outside the pilot.</p>}
        <ul>
          {displayedPaths.map(path => {
            const issues = evaluateLifepath(progress, path.variantId, catalog);
            return (
              <li key={path.variantId}>
                <button type="button" disabled={!canApplyChoice(mode, issues)}
                  onClick={() => apply({ kind: 'lifepath', id: path.variantId })}>
                  {getLifepathDisplayLabel(path, catalog)} ({path.years} years)
                </button>
                {issues.length > 0 && <span> · {issues.map(describeIssue).join(' ')}</span>}
                {path.requirements.length > 0 && issues.length === 0 &&
                  <span> · {path.requirements.map(describeRequirement).join('; ')}</span>}
              </li>
            );
          })}
        </ul>
      </section>

      {progress.paths.length > 0 && (
        <section aria-labelledby="leads">
          <h2 id="leads">Leads</h2>
          <ul>
            {settings.filter(setting => setting.id !== progress.settingId).map(setting => {
              const issues = evaluateLead(progress, setting.id, catalog);
              return (
                <li key={setting.id}>
                  <button type="button" disabled={!canApplyChoice(mode, issues)}
                    onClick={() => apply({ kind: 'lead', id: setting.id })}>
                    Lead to {setting.sourceName} (+1 year)
                  </button>
                  {issues.length > 0 && <span> · {issues.map(describeIssue).join(' ')}</span>}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
