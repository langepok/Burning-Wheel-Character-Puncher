import type { ItemSearch } from './types';

const shape = (value: unknown, fields: readonly string[]) => !!value && typeof value === 'object' &&
  Object.keys(value).length === fields.length && fields.every(field => Object.prototype.hasOwnProperty.call(value, field));
const text = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
const examples = (value: unknown) => Array.isArray(value) && value.every(text);
function reject(): never { throw new Error('Invalid item-search metadata'); }

/** Integrity only: never classifies requests, evaluates locations or creates items. */
export function validateItemSearch(value: ItemSearch): void {
  if (!shape(value, ['kind', 'request', 'contextRequirement', 'obstacleGuidance']) || value.kind !== 'item-search') reject();
  const { request, contextRequirement: location, obstacleGuidance: guidance } = value;
  if (!shape(request, ['declaredBy', 'granularity', 'specificItemAllowed', 'uniqueItemAllowed', 'resolution']) ||
      request.declaredBy !== 'player' || request.granularity !== 'item-type' || request.specificItemAllowed !== false ||
      request.uniqueItemAllowed !== false || request.resolution !== 'manual' ||
      !shape(location, ['kind', 'purpose', 'resolution', 'examplesPolicy', 'examples']) ||
      location.kind !== 'suitable-location' || location.purpose !== 'scavenging' || location.resolution !== 'contextual' ||
      location.examplesPolicy !== 'non-exhaustive' || !examples(location.examples)) reject();
  if (!shape(guidance, ['kind', 'resolution', 'examplesPolicy', 'categories']) || guidance.kind !== 'category-based' ||
      guidance.resolution !== 'contextual' || guidance.examplesPolicy !== 'non-exhaustive' ||
      !Array.isArray(guidance.categories) || !guidance.categories.length) reject();
  const ids = new Set<string>();
  for (const category of guidance.categories) {
    if (!shape(category, ['id', 'label', 'obstacle', 'examples']) || !text(category.id) || ids.has(category.id) ||
        !text(category.label) || !Number.isSafeInteger(category.obstacle) || category.obstacle <= 0 || !examples(category.examples)) reject();
    ids.add(category.id);
  }
}
