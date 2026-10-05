import { semanticTags } from './types';
import type { CatalogContent, GameCatalog, RequirementNode, SourceReference } from './types';

function index<T>(records: readonly T[], idOf: (record: T) => string, label: string): Map<string, T> {
  const result = new Map<string, T>();
  for (const record of records) {
    const id = idOf(record);
    if (!id.trim() || result.has(id)) throw new Error(`Invalid or duplicate ${label} id: ${id}`);
    result.set(id, record);
  }
  return result;
}

/** Register ordinary content packs; no stock-specific discovery or control flow. */
export function createCatalog(...packs: readonly CatalogContent[]): GameCatalog {
  const catalog: GameCatalog = {
    stocks: index(packs.flatMap(pack => pack.stocks), row => row.id, 'stock'),
    settings: index(packs.flatMap(pack => pack.settings), row => row.id, 'setting'),
    families: index(packs.flatMap(pack => pack.families), row => row.id, 'family'),
    skills: index(packs.flatMap(pack => pack.skills), row => row.id, 'skill'),
    lifepaths: index(packs.flatMap(pack => pack.lifepaths), row => row.variantId, 'variant'),
  };
  const errors = validateCatalog(catalog);
  if (errors.length) throw new Error(`Invalid catalog:\n${errors.join('\n')}`);
  return catalog;
}

/** Referential/content integrity only: this does not accept or reject character choices. */
export function validateCatalog(catalog: GameCatalog): string[] {
  const errors: string[] = [];
  const check = (condition: boolean, message: string) => { if (!condition) errors.push(message); };
  const integer = (value: number, label: string, minimum = 0) =>
    check(Number.isSafeInteger(value) && value >= minimum, `Invalid ${label}: ${value}`);
  const signedInteger = (value: number, label: string) =>
    check(Number.isSafeInteger(value), `Invalid ${label}: ${value}`);
  const nonempty = (value: string, label: string) => check(value.trim().length > 0, `Empty ${label}`);
  const unique = (values: readonly unknown[], label: string) =>
    check(new Set(values).size === values.length, `Duplicate ${label}`);
  const source = (value: SourceReference, label: string) => {
    nonempty(value.document, `${label} source document`);
    nonempty(value.section, `${label} source section`);
    check(value.printedPages.length > 0 && value.pdfPages.length > 0, `Missing ${label} source pages`);
    [...value.printedPages, ...value.pdfPages].forEach(page => integer(page, `${label} source page`, 1));
  };
  const settingRef = (id: string, stockId: string, label: string) =>
    check(catalog.settings.get(id)?.stockId === stockId, `Invalid ${label} setting reference: ${id}`);
  const familyRef = (id: string, stockId: string, label: string) =>
    check(catalog.families.get(id)?.stockId === stockId, `Invalid ${label} family reference: ${id}`);
  const skillRef = (id: string, label: string) =>
    check(catalog.skills.has(id), `Invalid ${label} skill reference: ${id}`);
  const tag = (value: string, label: string) =>
    check((semanticTags as readonly string[]).includes(value), `Unknown ${label} semantic tag: ${value}`);

  const requirement = (node: RequirementNode, stockId: string, label: string): void => {
    switch (node.kind) {
      case 'allOf': case 'anyOf':
        check(node.items.length > 0, `Empty ${label} ${node.kind}`);
        node.items.forEach(item => requirement(item, stockId, label));
        break;
      case 'position':
        check(node.mode === 'only' || node.mode === 'except', `Invalid ${label} position mode`);
        check(node.positions.length > 0, `Empty ${label} positions`);
        unique(node.positions, `${label} positions`);
        node.positions.forEach(position => integer(position, `${label} position`, 1));
        break;
      case 'maxOccurrences': case 'finalLifepathCountAtMost':
        integer(node.count, `${label} ${node.kind}`, 1);
        break;
      case 'priorFamily': familyRef(node.familyId, stockId, label); break;
      case 'priorSetting': settingRef(node.settingId, stockId, label); break;
      case 'priorSemanticTag': tag(node.tag, label); break;
      case 'characterGender':
        check(node.gender === 'female' || node.gender === 'male', `Invalid ${label} gender`);
        break;
      case 'finalStartingAgeGreaterThan': integer(node.age, `${label} final age`); break;
      case 'priorLifepathSkillListContains': skillRef(node.skillId, label); break;
      default: errors.push(`Unknown ${label} requirement kind`);
    }
  };

  for (const stock of catalog.stocks.values()) nonempty(stock.sourceName, `${stock.id} name`);
  for (const setting of catalog.settings.values()) {
    check(catalog.stocks.has(setting.stockId), `Invalid ${setting.id} stock reference: ${setting.stockId}`);
    nonempty(setting.sourceName, `${setting.id} name`);
    nonempty(setting.uiQualifier, `${setting.id} qualifier`);
    check(setting.coverage === 'loaded' || setting.coverage === 'reference-only', `Invalid ${setting.id} setting coverage`);
    check(setting.kind === 'setting' || setting.kind === 'subsetting' ||
      (setting.coverage === 'reference-only' && setting.kind === undefined), `Invalid ${setting.id} setting kind`);
    unique(setting.aliases, `${setting.id} aliases`);
    for (const alias of new Set([setting.id, setting.sourceName, ...setting.aliases])) {
      nonempty(alias, `${setting.id} alias`);
      check(![...catalog.settings.values()].some(other => other.id !== setting.id &&
        other.stockId === setting.stockId && [other.id, other.sourceName, ...other.aliases].includes(alias)),
      `Ambiguous ${setting.stockId} setting alias: ${alias}`);
    }
  }
  for (const family of catalog.families.values()) {
    check(catalog.stocks.has(family.stockId), `Invalid ${family.id} stock reference: ${family.stockId}`);
    nonempty(family.sourceName, `${family.id} name`);
    source(family.source, family.id);
    const loaded = [...catalog.lifepaths.values()].some(row => row.familyId === family.id);
    check(family.coverage === (loaded ? 'loaded' : 'reference-only'), `Invalid ${family.id} family coverage`);
  }
  for (const skill of catalog.skills.values()) nonempty(skill.sourceName, `${skill.id} name`);
  for (const row of catalog.lifepaths.values()) {
    const label = row.variantId;
    check(catalog.stocks.has(row.stockId), `Invalid ${label} stock reference: ${row.stockId}`);
    settingRef(row.settingId, row.stockId, label);
    familyRef(row.familyId, row.stockId, label);
    nonempty(row.sourceName, `${label} name`);
    check(typeof row.isBorn === 'boolean', `Invalid ${label} Born flag`);
    integer(row.years, `${label} years`);
    integer(row.skillPointGrant.ordinary, `${label} ordinary skill points`);
    integer(row.skillPointGrant.general, `${label} General skill points`);
    integer(row.traitPointGrant, `${label} trait points`);
    source(row.source, label);
    switch (row.statGrant.kind) {
      case 'none': break;
      case 'mental': case 'physical': case 'chooseMentalOrPhysical':
        signedInteger(row.statGrant.amount, `${label} stat grant`); break;
      case 'mentalAndPhysical':
        signedInteger(row.statGrant.mental, `${label} mental grant`);
        signedInteger(row.statGrant.physical, `${label} physical grant`); break;
      default: errors.push(`Unknown ${label} stat grant kind`);
    }
    switch (row.leads.kind) {
      case 'any': break;
      case 'to':
        unique(row.leads.settingIds, `${label} Lead destinations`);
        row.leads.settingIds.forEach(id => settingRef(id, row.stockId, label)); break;
      case 'anyExcept':
        check(row.leads.excludedSettingIds.length > 0, `Empty ${label} Lead exclusions`);
        unique(row.leads.excludedSettingIds, `${label} Lead exclusions`);
        row.leads.excludedSettingIds.forEach(id => settingRef(id, row.stockId, label)); break;
      default: errors.push(`Unknown ${label} Lead kind`);
    }
    row.requirements.forEach(node => requirement(node, row.stockId, label));
    unique(row.semanticTags, `${label} semantic tags`);
    row.semanticTags.forEach(value => tag(value, label));
    if (row.semanticTags.length) nonempty(row.semanticTagSource ?? '', `${label} semantic tag source`);
    check(row.skillListMetadata.completeness === 'partial', `Invalid ${label} skill metadata completeness`);
    for (const entry of row.skillListMetadata.knownEntries) {
      switch (entry.kind) {
        case 'skill': skillRef(entry.skillId, label); break;
        case 'oneOf':
          check(entry.skillIds.length > 1, `Invalid ${label} skill choice`);
          unique(entry.skillIds, `${label} skill choices`);
          entry.skillIds.forEach(id => skillRef(id, label)); break;
        default: errors.push(`Unknown ${label} skill-list entry kind`);
      }
    }
    unique(row.specialRules.map(rule => rule.id), `${label} special rules`);
    for (const rule of row.specialRules) {
      nonempty(rule.id, `${label} special rule id`);
      check(rule.kind === 'wifeDerivedGrant', `Unknown ${label} special rule kind`);
      settingRef(rule.husbandSettingId, row.stockId, label);
      check(['ordinary-only', 'ordinary-and-general', 'unspecified'].includes(rule.skillPointScope),
        `Invalid ${label} inherited skill-point scope`);
      check(rule.skillFraction === 0.5 && rule.skillRounding === 'down' && rule.resourceFraction === 0.5,
        `Invalid ${label} Wife-derived grant`);
      source(rule.source, `${label} special rule`);
    }
    switch (row.resourceGrant.kind) {
      case 'fixed':
        integer(row.resourceGrant.amount, `${label} resources`);
        check(row.specialRules.length === 0, `Unlinked ${label} Wife-derived rule`);
        break;
      case 'wifeDerived':
        integer(row.resourceGrant.base, `${label} base resources`);
        check(row.specialRules.length === 1 && row.specialRules[0]!.id === row.resourceGrant.specialRuleId,
          `Invalid ${label} resource special-rule reference`);
        break;
      default: errors.push(`Unknown ${label} resource grant kind`);
    }
  }
  return errors;
}
