import type { BattlefieldCommandBroadcast } from './types';

const shape = (value: unknown, fields: readonly string[]) => !!value && typeof value === 'object' &&
  Object.keys(value).length === fields.length && fields.every(field => Object.prototype.hasOwnProperty.call(value, field));
function reject(): never { throw new Error('Invalid battlefield-command-broadcast metadata'); }

/** Catalog integrity only: does not bind characters, interpret narrative, or evaluate hearing/commands. */
export function validateBattlefieldCommandBroadcast(value: BattlefieldCommandBroadcast, requireSkill: (id: string) => void): void {
  if (!shape(value, ['kind', 'extends', 'trigger', 'audience', 'range', 'effect']) || value.kind !== 'battlefield-command-broadcast' ||
      !shape(value.extends, ['kind', 'skillId', 'aspect']) || value.extends.kind !== 'skill' ||
      value.extends.aspect !== 'audibility-distance' || typeof value.extends.skillId !== 'string' || !value.extends.skillId.trim() ||
      !shape(value.trigger, ['kind', 'actorRole']) || value.trigger.kind !== 'issues-command' || value.trigger.actorRole !== 'commander') reject();
  requireSkill(value.extends.skillId);
  const audience = value.audience;
  if (!shape(audience, ['role', 'roleResolution', 'quantifier', 'relationshipToCommander']) || audience.role !== 'soldier' ||
      audience.roleResolution !== 'manual-contextual' || audience.quantifier !== 'all-qualifying') reject();
  const relation = audience.relationshipToCommander;
  if (!shape(relation, ['kind', 'entityKinds', 'ownerRole', 'relation', 'characterRole', 'resolution']) ||
      relation.kind !== 'anyOf' || !Array.isArray(relation.entityKinds) || relation.entityKinds.length !== 3 ||
      relation.entityKinds.some((kind, i) => kind !== ['trait', 'instinct', 'belief'][i]) || relation.ownerRole !== 'recipient' ||
      relation.relation !== 'about-character' || relation.characterRole !== 'commander') reject();
  const resolution = relation.resolution;
  if (!shape(resolution, ['kind', 'entityIdentity', 'aboutCharacterIdentity', 'otherwise']) ||
      resolution.kind !== 'manual-or-structured-reference' || resolution.entityIdentity !== 'stable-runtime-id' ||
      resolution.aboutCharacterIdentity !== 'must-match-commander' || resolution.otherwise !== 'manual-contextual' ||
      !shape(value.range, ['kind', 'participants']) || value.range.kind !== 'any-distance-within-battlefield' ||
      !Array.isArray(value.range.participants) || value.range.participants.length !== 2 ||
      value.range.participants[0] !== 'commander' || value.range.participants[1] !== 'recipient' ||
      !shape(value.effect, ['kind']) || value.effect.kind !== 'can-hear-command') reject();
}
