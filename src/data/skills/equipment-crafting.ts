import type { CreatedEquipmentQuality, CraftingShadeRequirement, SourceSpecificEquipmentQualities, WeaponImprovementOptions } from './types';

const shape = (value: unknown, fields: readonly string[]) => !!value && typeof value === 'object' &&
  Object.keys(value).length === fields.length && fields.every(field => Object.prototype.hasOwnProperty.call(value, field));
const positive = (value: number) => Number.isSafeInteger(value) && value > 0;
const text = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
function reject(): never { throw new Error('Invalid equipment crafting metadata'); }

/** Integrity only: never looks up weapon properties, applies improvements or evaluates costs. */
export function validateWeaponImprovements(value: WeaponImprovementOptions): void {
  if (!shape(value, ['kind', 'target', 'selection', 'options']) || value.kind !== 'weapon-improvement-options' ||
      value.target !== 'physical-weapon' || value.selection !== 'independent-options' || !Array.isArray(value.options) || !value.options.length) reject();
  const seen = new Set<string>();
  for (const option of value.options) {
    if (!option || option.kind !== 'weapon-improvement' || option.repeatability !== 'once-per-physical-weapon' || seen.has(option.improvement)) reject();
    seen.add(option.improvement);
    if (option.improvement === 'balance-die') {
      if (!shape(option, ['kind', 'improvement', 'dice', 'capabilityRef', 'craftingObstacleAdjustment', 'repeatability']) ||
          !positive(option.dice) || !positive(option.craftingObstacleAdjustment) ||
          !shape(option.capabilityRef, ['kind', 'id']) || option.capabilityRef.kind !== 'external-equipment-capability' || option.capabilityRef.id !== 'balance-dice') reject();
    } else if (option.improvement === 'versus-armor' || option.improvement === 'weapon-power') {
      if (!shape(option, ['kind', 'improvement', 'delta', 'craftingObstacle', 'repeatability']) || !positive(option.delta) ||
          !shape(option.craftingObstacle, ['kind']) || option.craftingObstacle.kind !==
          (option.improvement === 'versus-armor' ? 'current-weapon-va-plus-one' : 'current-weapon-power')) reject();
    } else reject();
  }
}
/** Preserves the entry-specific unresolved discrepancy, without selecting global quality rules. */
export function validateSourceSpecificQualities(value: SourceSpecificEquipmentQualities, owningSkillId: string): void {
  if (!shape(value, ['kind', 'sourceSkillId', 'combination', 'reconciliation', 'options']) ||
      value.kind !== 'source-specific-equipment-qualities' || value.sourceSkillId !== owningSkillId ||
      value.combination !== 'source-unspecified' || !shape(value.reconciliation, ['kind', 'auditId', 'deferredTo']) ||
      value.reconciliation.kind !== 'unresolved-source-conflict' || !text(value.reconciliation.auditId) ||
      value.reconciliation.deferredTo !== 'equipment-audit' || !Array.isArray(value.options) || !value.options.length) reject();
  const seen = new Set<string>();
  for (const option of value.options) {
    if (!shape(option, ['quality', 'sourceLabel', 'outputs', 'craftingObstacleAdjustment', 'effect']) ||
        !text(option.sourceLabel) || !positive(option.craftingObstacleAdjustment) || seen.has(option.quality) ||
        !Array.isArray(option.outputs) || !shape(option.effect, ['kind', 'face', 'selection', 'recurrence']) ||
        option.effect.kind !== 'source-specific-reroll' || option.effect.face !== 1) reject();
    seen.add(option.quality);
    if (option.quality === 'dwarven-made') {
      if (option.outputs.length !== 2 || option.outputs[0] !== 'armor' || option.outputs[1] !== 'shield' ||
          option.effect.selection !== 'one-rolled-one' || option.effect.recurrence !== 'once') reject();
    } else if (option.quality === 'superior') {
      if (option.outputs.length !== 1 || option.outputs[0] !== 'armor' ||
          option.effect.selection !== 'all-rolled-ones' || option.effect.recurrence !== 'every-applicable-roll') reject();
    } else reject();
  }
}
/** No Artha activation, shade comparison, temporary-effect clock or equipment stat generation. */
export function validateCraftingShadeRequirement(value: CraftingShadeRequirement): void {
  if (!shape(value, ['kind', 'outputShade', 'requiredCraftingAbilityShade', 'ability', 'qualification']) ||
      value.kind !== 'crafting-shade-requirement' || value.outputShade !== 'gray' || value.requiredCraftingAbilityShade !== 'gray' ||
      !shape(value.ability, ['kind', 'source', 'snapshot']) || value.ability.kind !== 'effective-crafting-skill' ||
      value.ability.source !== 'owning-skill' || value.ability.snapshot !== 'at-test' ||
      !shape(value.qualification, ['kind', 'paths']) || value.qualification.kind !== 'anyOf' ||
      !Array.isArray(value.qualification.paths) || value.qualification.paths.length !== 2) reject();
  const [actual, temporary] = value.qualification.paths;
  if (!shape(actual, ['kind']) || actual.kind !== 'actual-skill-shade' || !shape(temporary, ['kind', 'source']) ||
      temporary.kind !== 'temporary-shade-shift' || !shape(temporary.source, ['kind', 'subsystem', 'id']) ||
      temporary.source.kind !== 'external-rule' || temporary.source.subsystem !== 'artha' || temporary.source.id !== 'temporary-epiphany') reject();
}

/** Ordinary external quality categories, never War Art's source-specific reroll statements. */
export function validateCreatedEquipmentQuality(value: CreatedEquipmentQuality): void {
  if (!shape(value, ['kind', 'outputKind', 'superior', 'poor']) || value.kind !== 'created-equipment-quality' || value.outputKind !== 'weapon') reject();
  const { superior, poor } = value;
  if (!shape(superior, ['qualityRef', 'craftingObstacleAdjustment', 'trigger']) || !positive(superior.craftingObstacleAdjustment) ||
      superior.trigger !== 'successful-manufacturing-test' || !shape(superior.qualityRef, ['kind', 'id']) ||
      superior.qualityRef.kind !== 'external-equipment-quality' || superior.qualityRef.id !== 'superior-quality-weapon' ||
      !shape(poor, ['qualityRef', 'trigger', 'genericFailureInteraction']) || poor.trigger !== 'failed-manufacturing-test' ||
      poor.genericFailureInteraction !== 'unresolved' || !shape(poor.qualityRef, ['kind', 'id']) ||
      poor.qualityRef.kind !== 'external-equipment-quality' || poor.qualityRef.id !== 'poor-quality-weapon') reject();
}
