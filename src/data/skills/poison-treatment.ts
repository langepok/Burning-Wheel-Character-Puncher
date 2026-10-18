import type { PoisonTreatment } from './types';

const shape = (value: unknown, fields: readonly string[]) => !!value && typeof value === 'object' &&
  Object.keys(value).length === fields.length && fields.every(field => Object.prototype.hasOwnProperty.call(value, field));
function reject(): never { throw new Error('Invalid poison treatment metadata'); }

/** Integrity only: never resolves the rounding interpretation or mutates penalties. */
export function validatePoisonTreatment(value: PoisonTreatment, requireSkill: (id: string) => void): void {
  if (!shape(value, ['kind', 'branches']) || value.kind !== 'poison-treatment' || !Array.isArray(value.branches) || value.branches.length !== 3) reject();
  const [injury, obstacle, dice] = value.branches;
  if (!shape(injury, ['poisonEffectKind', 'obstacle', 'onSuccess']) || injury.poisonEffectKind !== 'injury' ||
      !shape(injury.obstacle, ['kind', 'skillId', 'procedure', 'input']) || injury.obstacle.kind !== 'procedure-reference' ||
      typeof injury.obstacle.skillId !== 'string' || !injury.obstacle.skillId.trim() ||
      injury.obstacle.procedure !== 'wound-treatment' || injury.obstacle.input !== 'caused-wound' ||
      !shape(injury.onSuccess, ['kind', 'target', 'rounding']) || injury.onSuccess.kind !== 'halve-die-penalty' ||
      injury.onSuccess.target !== 'poison-caused-die-penalties' || injury.onSuccess.rounding !== 'up') reject();
  requireSkill(injury.obstacle.skillId);
  if (!shape(obstacle, ['poisonEffectKind', 'obstacle', 'onExtraSuccesses']) || obstacle.poisonEffectKind !== 'obstacle-penalty' ||
      !shape(obstacle.obstacle, ['kind', 'penaltyKind']) || obstacle.obstacle.kind !== 'current-penalty' || obstacle.obstacle.penaltyKind !== 'obstacle' ||
      !shape(obstacle.onExtraSuccesses, ['kind', 'basis', 'rate']) || obstacle.onExtraSuccesses.kind !== 'reduce-obstacle-penalty' ||
      obstacle.onExtraSuccesses.basis !== 'successes-over-obstacle' || obstacle.onExtraSuccesses.rate !== 'source-unspecified') reject();
  if (!shape(dice, ['poisonEffectKind', 'obstacle', 'onExtraSuccesses']) || dice.poisonEffectKind !== 'direct-dice-subtraction' ||
      !shape(dice.obstacle, ['kind']) || dice.obstacle.kind !== 'double-current-dice-subtraction' ||
      !shape(dice.onExtraSuccesses, ['kind', 'dicePerSuccessOverObstacle']) || dice.onExtraSuccesses.kind !== 'restore-dice' ||
      dice.onExtraSuccesses.dicePerSuccessOverObstacle !== 1) reject();
}
