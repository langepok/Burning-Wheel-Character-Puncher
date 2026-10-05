import type { GameCatalog, LeadDefinition, LifepathDefinition, SettingId, StockId } from './types';

export function getLifepathDisplayLabel(lifepath: LifepathDefinition, catalog: GameCatalog): string {
  const duplicate = [...catalog.lifepaths.values()].some(other =>
    other.sourceName === lifepath.sourceName && other.settingId !== lifepath.settingId,
  );
  if (!duplicate) return lifepath.sourceName;
  const setting = catalog.settings.get(lifepath.settingId);
  if (!setting) throw new Error(`Unknown setting: ${lifepath.settingId}`);
  return `${setting.uiQualifier} ${lifepath.sourceName}`;
}

/** Aliases are supplied by content, never inferred from a stock or lifepath name. */
export function normalizeSettingId(label: string, stockId: StockId, catalog: GameCatalog): SettingId {
  const matches = [...catalog.settings.values()].filter(setting =>
    setting.stockId === stockId &&
    [setting.id, setting.sourceName, ...setting.aliases].includes(label.trim()),
  );
  if (matches.length !== 1) throw new Error(`Unknown or ambiguous setting: ${stockId}/${label}`);
  return matches[0]!.id;
}

/** Small audit-import helper, not a rules language or a Lead legality evaluator. */
export function parseLeadDefinition(text: string, stockId: StockId, catalog: GameCatalog): LeadDefinition {
  const value = text.trim();
  if (value === 'Any') return { kind: 'any' };
  const exclusions = value.startsWith('Any except ');
  const labels = (exclusions ? value.slice('Any except '.length) : value).split(/,|;|\s+and\s+/);
  const ids = labels.map(label => normalizeSettingId(label, stockId, catalog));
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate Lead destinations: ${text}`);
  return exclusions ? { kind: 'anyExcept', excludedSettingIds: ids } : { kind: 'to', settingIds: ids };
}
