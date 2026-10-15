import type { FatePronouncement, RuneCastingFateObstacle } from './types';

const shape = (value: unknown, fields: readonly string[]) => !!value && typeof value === 'object' &&
  Object.keys(value).length === fields.length && fields.every(field => Object.prototype.hasOwnProperty.call(value, field));
const list = (value: unknown, expected: readonly string[]) => Array.isArray(value) &&
  value.length === expected.length && expected.every((item, i) => value[i] === item);
function invalidBasis(): never { throw new Error('Invalid Rune Casting fate obstacle'); }
function invalidFate(): never { throw new Error('Invalid fate pronouncement metadata'); }

/** Integrity only: does not read social standing/traits, subtract values or choose an obstacle. */
export function validateRuneCastingFateObstacle(value: RuneCastingFateObstacle): void {
  if (!shape(value, ['kind', 'targetRole', 'candidates', 'choose']) || value.kind !== 'rune-casting-fate-obstacle' ||
      value.targetRole !== 'target' || value.choose !== 'lower-obstacle' ||
      !Array.isArray(value.candidates) || value.candidates.length !== 2) invalidBasis();
  const [social, trait] = value.candidates;
  if (!shape(social, ['kind', 'components']) || social.kind !== 'ten-minus-highest-social-standing-total' ||
      !list(social.components, ['circles', 'reputation', 'affiliation']) ||
      !shape(trait, ['kind']) || trait.kind !== 'ten-minus-most-expensive-non-common-trait') invalidBasis();
}

/** Integrity only: no narrative matching, Belief mutations, fate state or artha execution. */
export function validateFatePronouncement(value: FatePronouncement): void {
  if (!shape(value, ['kind', 'trigger', 'pronouncement', 'targetBeliefInspection', 'targetBeliefReference',
      'targetBeliefLink', 'suitablyDire', 'casterCommitment', 'validity', 'targetAgency',
      'fulfillmentDetermination', 'fatalFulfillmentDetermination', 'fulfillmentRewards']) || value.kind !== 'fate-pronouncement' ||
      !shape(value.trigger, ['kind']) || value.trigger.kind !== 'test-success') invalidFate();
  const { pronouncement, targetBeliefInspection: inspection, targetBeliefReference: target,
    targetBeliefLink: link, suitablyDire: dire, casterCommitment: commitment, validity, targetAgency: agency } = value;
  if (!shape(pronouncement, ['actorRole', 'permission']) || pronouncement.actorRole !== 'caster-player' ||
      pronouncement.permission !== 'may-pronounce-target-fate' ||
      !shape(inspection, ['entityKind', 'ownerRole', 'readerRole', 'permission']) || inspection.entityKind !== 'belief' ||
      inspection.ownerRole !== 'target' || inspection.readerRole !== 'caster-player' || inspection.permission !== 'may-inspect' ||
      !shape(target, ['entityKind', 'ownerRole', 'selection']) || target.entityKind !== 'belief' ||
      target.ownerRole !== 'target' || target.selection !== 'manual' ||
      !shape(link, ['cardinality', 'resolution']) || link.cardinality !== 'one' || link.resolution !== 'manual') invalidFate();
  if (!shape(dire, ['resolution', 'examplesPolicy', 'examples']) || dire.resolution !== 'manual' ||
      dire.examplesPolicy !== 'non-exhaustive' || !Array.isArray(dire.examples) ||
      dire.examples.some(example => typeof example !== 'string' || !example.trim()) ||
      !shape(commitment, ['entityKind', 'ownerRole', 'action', 'mustMatchPronouncedFate']) ||
      commitment.entityKind !== 'belief' || commitment.ownerRole !== 'caster' || commitment.action !== 'change' ||
      !shape(commitment.mustMatchPronouncedFate, ['resolution']) || commitment.mustMatchPronouncedFate.resolution !== 'manual' ||
      !shape(validity, ['requiresCasterCommitmentBelief', 'invalidatedBy']) || validity.requiresCasterCommitmentBelief !== true ||
      !list(validity.invalidatedBy, ['missing-caster-belief-commitment', 'caster-commitment-belief-changed'])) invalidFate();
  if (!shape(agency, ['resolution', 'fateDoesNotCompelBehavior']) || agency.resolution !== 'player-choice' ||
      agency.fateDoesNotCompelBehavior !== true || value.fulfillmentDetermination !== 'manual' ||
      value.fatalFulfillmentDetermination !== 'manual' || !Array.isArray(value.fulfillmentRewards) ||
      value.fulfillmentRewards.length !== 2) invalidFate();
  const requirements = [
    ['manual-fate-fulfilled', 'fated-character-player', 'artha'],
    ['manual-fatal-fate-fulfillment', 'fated-character-player-next-campaign-character', 'starting-artha'],
  ] as const;
  value.fulfillmentRewards.forEach((entry, i) => {
    const [trigger, recipient, kind] = requirements[i];
    if (!shape(entry, ['trigger', 'recipient', 'reward']) || !shape(entry.trigger, ['kind']) || entry.trigger.kind !== trigger ||
        entry.recipient !== recipient || !shape(entry.reward, ['kind', 'arthaType', 'amount']) || entry.reward.kind !== kind ||
        entry.reward.arthaType !== 'deeds' || entry.reward.amount !== 1) invalidFate();
  });
}
