import type { DeclaredIntentRequirement, DebilitatingTraitGrant, GmSelectedConsequence, ObstacleBasis } from './types';

const shape = (value: unknown, fields: readonly string[]) => !!value && typeof value === 'object' &&
  Object.keys(value).length === fields.length && fields.every(field => Object.prototype.hasOwnProperty.call(value, field));
function reject(): never { throw new Error('Invalid intent/trait outcome metadata'); }

/** Integrity only. Does not interpret intent, select traits or resolve consequences. */
export function validateDeclaredIntent(value: DeclaredIntentRequirement): void {
  if (!shape(value, ['kind', 'requiredBeforeTest', 'content', 'specificity']) || value.kind !== 'declared-intent' ||
      value.requiredBeforeTest !== true || value.content !== 'submit-or-reveal' || value.specificity !== 'exact') reject();
}
export function validateHighestTargetAbilities(value: Extract<ObstacleBasis, { kind: 'highest-of-target-abilities' }>): void {
  if (!shape(value, ['kind', 'abilities', 'snapshot']) || value.snapshot !== 'current' ||
      !Array.isArray(value.abilities) || value.abilities.length !== 2) reject();
  const ids = new Set<string>();
  for (const ability of value.abilities) {
    if (!shape(ability, ['kind', 'id']) || !['stat', 'attribute'].includes(ability.kind) ||
        typeof ability.id !== 'string' || !ability.id.trim() || ids.has(`${ability.kind}:${ability.id}`)) reject();
    ids.add(`${ability.kind}:${ability.id}`);
  }
}
export function validateDebilitatingTraitGrant(value: DebilitatingTraitGrant): void {
  const selection = value.traitSelection;
  if (!shape(value, ['kind', 'recipient', 'traitSelection', 'value']) || value.recipient !== 'target' ||
      !shape(selection, ['kind', 'quality', 'examplesPolicy', 'examples']) || selection.kind !== 'contextual' ||
      selection.quality !== 'debilitating' || selection.examplesPolicy !== 'non-exhaustive' ||
      !Array.isArray(selection.examples) || selection.examples.some(example => typeof example !== 'string' || !example.trim()) ||
      !shape(value.value, ['kind', 'source']) || value.value.kind !== 'test-obstacle' || value.value.source !== 'primary-test') reject();
}
export function validateGmConsequence(value: GmSelectedConsequence): void {
  if (!shape(value, ['kind', 'resolution', 'alternatives']) || value.resolution !== 'gm-choice' ||
      !Array.isArray(value.alternatives) || value.alternatives.length !== 3) reject();
  const [injury, death, trait] = value.alternatives;
  if (!shape(injury, ['kind', 'recipient', 'severity']) || injury.kind !== 'injury' || injury.recipient !== 'target' ||
      injury.severity !== 'source-unspecified' || !shape(death, ['kind', 'recipient']) ||
      death.kind !== 'death' || death.recipient !== 'target' ||
      !shape(trait, ['kind', 'recipient', 'traitSelection', 'value']) || trait.kind !== 'grant-trait' || trait.recipient !== 'target' ||
      !shape(trait.traitSelection, ['kind', 'quality', 'purpose']) || trait.traitSelection.kind !== 'contextual' ||
      trait.traitSelection.quality !== 'beneficial' || !Array.isArray(trait.traitSelection.purpose) ||
      trait.traitSelection.purpose.length !== 3 ||
      trait.traitSelection.purpose.some((purpose, i) => purpose !== ['resist-privation', 'resist-torture', 'resist-interrogation'][i]) ||
      !shape(trait.value, ['kind']) || trait.value.kind !== 'source-unspecified') reject();
}
