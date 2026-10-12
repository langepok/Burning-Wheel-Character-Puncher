import type { CraftedConsumableEffect, ConsumableDuration, RootAbility, SkillType } from './types';

const skillTypes: readonly SkillType[] = ['Academic', 'Artisan', 'Craftsman', 'Martial', 'Martial Training', 'Physical',
  'Medicinal', 'Military', 'Military Training', 'Sorcerous', 'Special', 'Wise', 'Social', 'Peasant', 'Forester', 'Artist',
  'Musical', 'School of Thought', 'Seafaring', 'Seafarer'];
const only = (value: object, fields: readonly string[]) => Object.keys(value).every(key => fields.includes(key));
const text = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
const positive = (value: number) => Number.isSafeInteger(value) && value > 0;
function reject(): never { throw new Error('Invalid crafted consumable metadata'); }
function ability(value: RootAbility): void {
  if (!value || !['stat', 'attribute'].includes(value.kind) || !text(value.id) || !only(value, ['kind', 'id'])) reject();
}
function duration(value: ConsumableDuration): void {
  if (!value) reject();
  if (value.kind === 'current-scene' || value.kind === 'unspecified') {
    if (!only(value, ['kind'])) reject();
  } else if (value.kind === 'attribute-derived-duration') {
    if (value.unit !== 'hour' || !positive(value.base) || value.snapshot !== 'current' ||
        !only(value, ['kind', 'unit', 'base', 'subtract', 'snapshot']) || value.subtract?.kind !== 'attribute') reject();
    ability(value.subtract);
  } else reject();
}

/** Content integrity only: never consumes inventory, compares doses or computes time. */
export function validateCraftedConsumable(value: CraftedConsumableEffect): void {
  if (!value || value.recipientRole !== 'consumer' || value.target !== 'crafted-consumable' || value.caseSemantics !== 'independent-source-conditions' ||
      !only(value, ['recipientRole', 'target', 'caseSemantics', 'cases']) || !Array.isArray(value.cases) || !value.cases.length) reject();
  for (const branch of value.cases) {
    if (!branch || !only(branch, ['recipient', 'dose', 'repeat', 'restorativeBenefit', 'effects']) ||
        !branch.recipient || !['stock', 'not-stock'].includes(branch.recipient.kind) || !text(branch.recipient.stockId) ||
        !only(branch.recipient, ['kind', 'stockId']) || !['once-active-non-stacking', 'unspecified'].includes(branch.repeat) ||
        (branch.restorativeBenefit !== undefined && branch.restorativeBenefit !== 'none') ||
        !Array.isArray(branch.effects) || !branch.effects.length) reject();
    const dose = branch.dose;
    if (dose?.kind === 'full-draught' || dose?.kind === 'mouthful') {
      if (!only(dose, ['kind'])) reject();
    } else if (dose?.kind === 'consumed-quantity-threshold') {
      if (dose.unit !== 'stein' || dose.comparison !== 'at-least' || dose.snapshot !== 'current' ||
          !only(dose, ['kind', 'unit', 'comparison', 'recipientAbility', 'snapshot'])) reject();
      ability(dose.recipientAbility);
    } else reject();
    for (const effect of branch.effects) {
      if (effect?.kind === 'dice-bonus') {
        if (!positive(effect.dice) || effect.scope?.kind !== 'next-ability-test' || !only(effect, ['kind', 'dice', 'scope']) ||
            !only(effect.scope, ['kind', 'ability'])) reject();
        ability(effect.scope.ability);
      } else if (effect?.kind === 'obstacle-modifier') {
        if (!Number.isSafeInteger(effect.delta) || !effect.delta || effect.scope?.kind !== 'skill-type-tests' ||
            !skillTypes.includes(effect.scope.skillType) || !only(effect, ['kind', 'delta', 'scope', 'duration']) ||
            !only(effect.scope, ['kind', 'skillType'])) reject();
        duration(effect.duration);
      } else if (effect?.kind === 'intoxication') {
        if (effect.condition !== 'drunk' || effect.modifier?.kind !== 'obstacle-modifier' || !Number.isSafeInteger(effect.modifier.delta) ||
            !effect.modifier.delta || effect.modifier.scope?.kind !== 'all-tests' || !only(effect, ['kind', 'condition', 'modifier', 'duration']) ||
            !only(effect.modifier, ['kind', 'delta', 'scope']) || !only(effect.modifier.scope, ['kind'])) reject();
        duration(effect.duration);
      } else reject();
    }
  }
}
