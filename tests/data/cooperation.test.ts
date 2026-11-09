import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { Cooperation, SkillIntegration } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';
import { skillFixtureContent } from '../../src/data/skills/fixtures';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const expected = { kind: 'cooperation',
  appliesTo: { kind: 'external-subsystem-roll', subsystem: 'range-and-cover', roll: 'maneuver' },
  participants: { roles: ['helper', 'recipient'],
    requirement: { kind: 'known-training', skillId: 'skirmish-tactics', appliesTo: 'each-participant' },
    relationship: { team: 'same' }, maxParticipants: 5 },
} as const;
const register = (cooperation: unknown, subsystem = 'range-and-cover') => createSkillCatalog({
  ...generalSkillTranscriptionContent, integrations: generalSkillTranscriptionContent.integrations.map(record =>
    record.id === 'skirmish-help' ? { ...record, cooperation, subsystem } as unknown as SkillIntegration : record),
});

describe('Skirmish Tactics typed cooperation permission', () => {
  it('preserves Training type, combined Aptitude-only root and independent learning methods', () => {
    expect(catalog.skills.get('skirmish-tactics')).toMatchObject({ skillType: 'Military Training',
      rootRule: { kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'perception' }] },
      training: { kind: 'training', rootUsage: 'aptitude-only', learningMethods: ['practice', 'instruction'], exponent: 'none' },
      tools: { kind: 'none', expendable: false }, printedMarkers: ['*'] });
  });
  it('limits cooperation to the external Range and Cover maneuver roll', () => {
    expectTypeOf<typeof expected>().toExtend<Cooperation>();
    expect(catalog.integrations.get('skirmish-help')).toMatchObject({ subsystem: 'range-and-cover', cooperation: expected });
    expect(catalog.skills.get('skirmish-tactics')?.integrationTags).toEqual(['range-and-cover']);
    expect(catalog.skills.get('skirmish-tactics')?.capabilities).toEqual([{ kind: 'subsystem-capability', id: 'skirmisher-help', integrationId: 'skirmish-help' }]);
  });
  it('requires the Training for both helper and recipient on the same team', () => {
    const participants = catalog.integrations.get('skirmish-help')?.cooperation?.participants;
    expect(participants).toEqual(expected.participants);
    expect(participants?.requirement.appliesTo).toBe('each-participant');
  });
  it('limits the whole cooperating group to five without inventing dice or maxHelpers', () => {
    expect(catalog.integrations.get('skirmish-help')?.cooperation).toEqual(expected);
    expect(catalog.skills.get('skirmish-tactics')?.testProfile).toBeUndefined();
  });
  it('round-trips production and the original partial fixture through validation', () => {
    for (const content of [generalSkillTranscriptionContent, skillFixtureContent]) {
      expect(createSkillCatalog(JSON.parse(JSON.stringify(content))).integrations.get('skirmish-help')?.cooperation).toEqual(expected);
    }
  });
  it.each([
    null, {}, { ...expected, kind: 'dice-bonus' },
    { ...expected, appliesTo: { ...expected.appliesTo, subsystem: 'fight' } },
    { ...expected, appliesTo: { ...expected.appliesTo, roll: 'all-tests' } },
    { ...expected, appliesTo: { kind: 'ability-test', skillId: 'speed' } },
    { ...expected, participants: { ...expected.participants, roles: ['helper'] } },
    { ...expected, participants: { ...expected.participants, requirement: { ...expected.participants.requirement, appliesTo: 'helper' } } },
    { ...expected, participants: { ...expected.participants, relationship: { team: 'allied' } } },
    { ...expected, participants: { ...expected.participants, maxParticipants: 0 } },
    { ...expected, participants: { ...expected.participants, maxParticipants: 1.5 } },
    { ...expected, participants: { ...expected.participants, maxHelpers: 5 } },
    { ...expected, dice: 1 }, { ...expected, helpingFormula: 'one-per-helper' }, { ...expected, evaluator: true },
  ])('rejects malformed cooperation or invented help mechanics %j', value => {
    expect(() => register(value)).toThrow('Invalid cooperation');
  });
  it.each(['', 'unknown-training', 'observation', 'steel'])('rejects invalid/non-Training reference %s', skillId => {
    expect(() => register({ ...expected, participants: { ...expected.participants,
      requirement: { ...expected.participants.requirement, skillId } } })).toThrow();
  });
  it.each(['fight', 'equipment', 'resources'])('rejects cooperation under %s', subsystem => {
    expect(() => register(expected, subsystem)).toThrow('Invalid cooperation');
  });
});
