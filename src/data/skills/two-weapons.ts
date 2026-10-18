import type { TwoWeaponUse } from './types';

const shape = (value: unknown, fields: readonly string[]) => !!value && typeof value === 'object' &&
  Object.keys(value).length === fields.length && fields.every(field => Object.prototype.hasOwnProperty.call(value, field));
function reject(): never { throw new Error('Invalid two-weapon-use metadata'); }

/** Content integrity only: no weapon comparison, action execution or dice splitting. */
export function validateTwoWeaponUse(value: TwoWeaponUse): void {
  if (!shape(value, ['kind', 'equipmentRequirements', 'permissions']) || value.kind !== 'two-weapon-use') reject();
  const pair = value.equipmentRequirements;
  if (!shape(pair, ['weaponCount', 'eachWeapon', 'offHand']) || pair.weaponCount !== 2 ||
      !shape(pair.eachWeapon, ['handedness', 'maxWeaponLength']) || pair.eachWeapon.handedness !== 'one-handed' ||
      pair.eachWeapon.maxWeaponLength !== 'long' || !shape(pair.offHand, ['relativeWeight']) ||
      !shape(pair.offHand.relativeWeight, ['relation', 'compareTo']) || pair.offHand.relativeWeight.relation !== 'less-than-or-equal' ||
      pair.offHand.relativeWeight.compareTo !== 'other-weapon') reject();
  const permissions = value.permissions;
  if (!shape(permissions, ['offHandStrike', 'simultaneousStrike', 'blockAndStrike'])) reject();
  const offhand = permissions.offHandStrike;
  if (!shape(offhand, ['action', 'penalty']) || offhand.action !== 'strike' || offhand.penalty !== 'negated') reject();
  const strike = permissions.simultaneousStrike;
  if (!shape(strike, ['action', 'enabled', 'timing', 'diceAllocation']) || strike.action !== 'strike' || strike.enabled !== true ||
      strike.timing !== 'simultaneous' || !shape(strike.diceAllocation, ['kind', 'targets', 'allocation']) ||
      strike.diceAllocation.kind !== 'split-pool' || strike.diceAllocation.targets !== 'two-weapons' ||
      strike.diceAllocation.allocation !== 'player-chosen') reject();
  const combined = permissions.blockAndStrike;
  if (!shape(combined, ['action', 'enabled', 'accessBasis', 'diceAllocation']) || combined.action !== 'block-and-strike' ||
      combined.enabled !== true || combined.accessBasis !== 'owning-training-and-eligible-pair' ||
      !shape(combined.diceAllocation, ['kind', 'between', 'allocation']) || combined.diceAllocation.kind !== 'split-skill-dice' ||
      !Array.isArray(combined.diceAllocation.between) || combined.diceAllocation.between.length !== 2 ||
      combined.diceAllocation.between[0] !== 'attack' || combined.diceAllocation.between[1] !== 'defense' ||
      combined.diceAllocation.allocation !== 'player-chosen') reject();
}
