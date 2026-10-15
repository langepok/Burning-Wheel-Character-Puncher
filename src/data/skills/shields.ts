import type { AbilityReference, ShieldUse } from './types';

const shape = (value: unknown, fields: readonly string[]) => !!value && typeof value === 'object' &&
  Object.keys(value).length === fields.length && fields.every(field => Object.prototype.hasOwnProperty.call(value, field));
function reject(): never { throw new Error('Invalid shield-use metadata'); }

/** Content validation only: no action execution, choice resolution or shield dice calculations. */
export function validateShieldUse(value: ShieldUse, validateFixedAbility: (ability: AbilityReference) => void): void {
  if (!shape(value, ['kind', 'trainedDefenseAccess', 'untrainedDefenseAccess', 'shieldStrike']) || value.kind !== 'shield-use' ||
      !Array.isArray(value.trainedDefenseAccess) || value.trainedDefenseAccess.length !== 3 ||
      !Array.isArray(value.untrainedDefenseAccess) || value.untrainedDefenseAccess.length !== 1) reject();
  const actions = ['block', 'counterstrike', 'block-and-strike'];
  value.trainedDefenseAccess.forEach((entry, i) => {
    if (!shape(entry, i === 2 ? ['action', 'access', 'shieldContribution'] : ['action', 'shieldContribution']) ||
        entry.action !== actions[i] || entry.shieldContribution !== (i === 0 ? 'defense-dice' : 'defensive-portion') ||
        (i === 2 && (!('access' in entry) || entry.access !== 'enabled'))) reject();
  });
  const untrained = value.untrainedDefenseAccess[0];
  if (!shape(untrained, ['action', 'shieldContribution']) || untrained.action !== 'block' || untrained.shieldContribution !== 'defense-dice') reject();
  const strike = value.shieldStrike;
  if (!shape(strike, ['action', 'implement', 'actor', 'actingAbility']) || strike.action !== 'strike' ||
      strike.implement !== 'shield' || strike.actor !== 'primary-actor' ||
      !shape(strike.actingAbility, ['kind', 'options']) || strike.actingAbility.kind !== 'one-of' ||
      !Array.isArray(strike.actingAbility.options) || strike.actingAbility.options.length < 2) reject();
  const ids = new Set<string>();
  for (const option of strike.actingAbility.options) {
    let key: string;
    if (option?.kind === 'context-resolved-skill') {
      if (!shape(option, ['kind', 'role', 'resolution']) || option.role !== 'appropriate-boxing-skill' || option.resolution !== 'manual') reject();
      key = `${option.kind}:${option.role}`;
    } else {
      if (!shape(option, ['kind', 'id']) || !['skill', 'stat', 'attribute'].includes(option.kind)) reject();
      validateFixedAbility(option);
      key = `${option.kind}:${option.id}`;
    }
    if (ids.has(key)) reject();
    ids.add(key);
  }
}
