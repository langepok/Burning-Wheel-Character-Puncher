import type { Cooperation } from './types';

const shape = (value: unknown, fields: readonly string[]) => !!value && typeof value === 'object' &&
  Object.keys(value).length === fields.length && fields.every(field => Object.prototype.hasOwnProperty.call(value, field));
function reject(): never { throw new Error('Invalid cooperation metadata'); }

/** Content integrity, not team/ownership evaluation or helping-dice aggregation. */
export function validateCooperation(value: Cooperation, requireTraining: (id: string) => void): void {
  if (!shape(value, ['kind', 'appliesTo', 'participants']) || value.kind !== 'cooperation' ||
      !shape(value.appliesTo, ['kind', 'subsystem', 'roll']) || value.appliesTo.kind !== 'external-subsystem-roll' ||
      value.appliesTo.subsystem !== 'range-and-cover' || value.appliesTo.roll !== 'maneuver' ||
      !shape(value.participants, ['roles', 'requirement', 'relationship', 'maxParticipants'])) reject();
  const participants = value.participants;
  if (!Array.isArray(participants.roles) || participants.roles.length !== 2 || participants.roles[0] !== 'helper' || participants.roles[1] !== 'recipient' ||
      !shape(participants.requirement, ['kind', 'skillId', 'appliesTo']) || participants.requirement.kind !== 'known-training' ||
      typeof participants.requirement.skillId !== 'string' || !participants.requirement.skillId.trim() ||
      participants.requirement.appliesTo !== 'each-participant' || !shape(participants.relationship, ['team']) ||
      participants.relationship.team !== 'same' || !Number.isSafeInteger(participants.maxParticipants) || participants.maxParticipants <= 0) reject();
  requireTraining(participants.requirement.skillId);
}
