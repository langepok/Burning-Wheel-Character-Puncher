import type { RuneCastingFateObstacle, SkillIntegration } from '../types';
import { evidence } from './shared';

export const runeCastingFateObstacle: RuneCastingFateObstacle = {
  kind: 'rune-casting-fate-obstacle', targetRole: 'target', candidates: [
    { kind: 'ten-minus-highest-social-standing-total', components: ['circles', 'reputation', 'affiliation'] },
    { kind: 'ten-minus-most-expensive-non-common-trait' },
  ], choose: 'lower-obstacle',
};

export const fateIntegrations: readonly SkillIntegration[] = [
  { id: 'rune-casting-fate', skillId: 'rune-casting', subsystem: 'magic',
    context: { kind: 'circumstance', circumstanceId: 'pronouncing-fate' },
    fatePronouncement: { kind: 'fate-pronouncement', trigger: { kind: 'test-success' },
      pronouncement: { actorRole: 'caster-player', permission: 'may-pronounce-target-fate' },
      targetBeliefInspection: { entityKind: 'belief', ownerRole: 'target', readerRole: 'caster-player', permission: 'may-inspect' },
      targetBeliefReference: { entityKind: 'belief', ownerRole: 'target', selection: 'manual' },
      targetBeliefLink: { cardinality: 'one', resolution: 'manual' },
      suitablyDire: { resolution: 'manual', examplesPolicy: 'non-exhaustive', examples: ['rise-to-power', 'tragic-death', 'pyrrhic-victory'] },
      casterCommitment: { entityKind: 'belief', ownerRole: 'caster', action: 'change', mustMatchPronouncedFate: { resolution: 'manual' } },
      validity: { requiresCasterCommitmentBelief: true,
        invalidatedBy: ['missing-caster-belief-commitment', 'caster-commitment-belief-changed'] },
      targetAgency: { resolution: 'player-choice', fateDoesNotCompelBehavior: true },
      fulfillmentDetermination: 'manual', fatalFulfillmentDetermination: 'manual',
      fulfillmentRewards: [
        { trigger: { kind: 'manual-fate-fulfilled' }, recipient: 'fated-character-player', reward: { kind: 'artha', arthaType: 'deeds', amount: 1 } },
        { trigger: { kind: 'manual-fatal-fate-fulfillment' }, recipient: 'fated-character-player-next-campaign-character', reward: { kind: 'starting-artha', arthaType: 'deeds', amount: 1 } },
      ],
    }, summary: 'Pronouncement, Belief meaning and fulfillment are table-adjudicated. Standard Belief artha remains external; no fate, narrative, character or reward execution occurs here.',
    source: [evidence('Rune Casting', 293)] },
];
