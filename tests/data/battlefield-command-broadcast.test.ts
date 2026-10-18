import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { BattlefieldCommandBroadcast, SkillCatalogContent, SkillIntegration } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const expected = { kind: 'battlefield-command-broadcast',
  extends: { kind: 'skill', skillId: 'command', aspect: 'audibility-distance' },
  trigger: { kind: 'issues-command', actorRole: 'commander' },
  audience: { role: 'soldier', roleResolution: 'manual-contextual', quantifier: 'all-qualifying',
    relationshipToCommander: { kind: 'anyOf', entityKinds: ['trait', 'instinct', 'belief'], ownerRole: 'recipient',
      relation: 'about-character', characterRole: 'commander',
      resolution: { kind: 'manual-or-structured-reference', entityIdentity: 'stable-runtime-id',
        aboutCharacterIdentity: 'must-match-commander', otherwise: 'manual-contextual' } } },
  range: { kind: 'any-distance-within-battlefield', participants: ['commander', 'recipient'] },
  effect: { kind: 'can-hear-command' },
} as const;
const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const id = 'voice-communication';
const register = (battlefieldCommandBroadcast: unknown, subsystem = 'battlefield-communication') => createSkillCatalog({
  ...generalSkillTranscriptionContent, integrations: generalSkillTranscriptionContent.integrations.map(record => record.id === id
    ? { ...record, subsystem, battlefieldCommandBroadcast } : record),
} as SkillCatalogContent);
const audience = (fields: object) => ({ ...expected, audience: { ...expected.audience, ...fields } });
const relationship = (fields: object) => audience({ relationshipToCommander: { ...expected.audience.relationshipToCommander, ...fields } });

describe('Voice of Thunder Command reuse and battlefield audibility', () => {
  it('keeps complete skill metadata and source Command reuse separate from the added broadcast', () => {
    expectTypeOf<typeof expected>().toExtend<BattlefieldCommandBroadcast>();
    expect(catalog.skills.get('voice-of-thunder')).toMatchObject({ coverage: 'complete', skillType: 'Social',
      rootRule: { kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'forte' }] },
      tools: { kind: 'none', expendable: false }, printedMarkers: ['§'],
      availabilityRestrictions: [{ kind: 'stock-only', stockIds: ['elf'], scope: 'always' }],
      relations: [{ kind: 'mechanics-reuse-with-additions', target: { kind: 'skill', id: 'command' }, additionalCapabilityIds: ['battlefield-communication'] }] });
    expect(catalog.integrations.get(id)?.battlefieldCommandBroadcast).toEqual(expected);
  });
  it('connects the audibility exception to Command without modifying ordinary Command', () => {
    expect(expected.extends).toEqual({ kind: 'skill', skillId: 'command', aspect: 'audibility-distance' });
    expect(catalog.skills.get('command')?.capabilities).toEqual([]);
    expect(catalog.skills.get('command')?.relations).toEqual([]);
    expect(catalog.skills.get('command')?.integrationTags).not.toContain('battlefield-communication');
    expect(catalog.skills.get('voice-of-thunder')?.testProfile).toBeUndefined();
  });
  it('triggers on issuing a command and selects all qualifying soldiers, not all allies or a lifepath', () => {
    expect(expected.trigger).toEqual({ kind: 'issues-command', actorRole: 'commander' });
    expect(expected.audience.role).toBe('soldier');
    expect(expected.audience.roleResolution).toBe('manual-contextual');
    expect(expected.audience.quantifier).toBe('all-qualifying');
  });
  it('allows any of trait/Instinct/Belief about this commander through stable references or manual matching', () => {
    expect(expected.audience.relationshipToCommander).toEqual({ kind: 'anyOf', entityKinds: ['trait', 'instinct', 'belief'],
      ownerRole: 'recipient', relation: 'about-character', characterRole: 'commander',
      resolution: { kind: 'manual-or-structured-reference', entityIdentity: 'stable-runtime-id',
        aboutCharacterIdentity: 'must-match-commander', otherwise: 'manual-contextual' } });
  });
  it('only grants audibility and keeps both roles inside the battlefield distance exception', () => {
    expect(expected.range).toEqual({ kind: 'any-distance-within-battlefield', participants: ['commander', 'recipient'] });
    expect(expected.effect).toEqual({ kind: 'can-hear-command' });
  });
  it('round-trips without narrative, hearing, obedience or battlefield evaluation', () => {
    expect(createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent))).integrations.get(id)?.battlefieldCommandBroadcast).toEqual(expected);
  });
  it('restricts the descriptor to battlefield communication at type and data boundaries', () => {
    const valid = { id, skillId: 'voice-of-thunder', subsystem: 'battlefield-communication',
      summary: 'Source audibility exception.', source: [], battlefieldCommandBroadcast: expected } as const;
    expectTypeOf<typeof valid>().toExtend<SkillIntegration>();
    const invalid = { ...valid, subsystem: 'fight' } as const;
    expectTypeOf<typeof invalid>().not.toExtend<SkillIntegration>();
    expect(() => register(expected, 'fight')).toThrow('Invalid battlefield-command-broadcast');
  });
  it.each([
    { ...expected, extends: { ...expected.extends, skillId: 'missing-skill' } },
    { ...expected, extends: { ...expected.extends, aspect: 'automatic-success' } },
    { ...expected, trigger: { kind: 'command-test-succeeds', actorRole: 'commander' } },
    audience({ role: 'all-allies' }), audience({ settingId: 'professional-soldier' }),
    audience({ whitelist: ['Sword Singers', 'vassals'] }), audience({ roleResolution: 'weapon-holder' }),
    relationship({ kind: 'allOf' }), relationship({ entityKinds: ['belief'] }), relationship({ ownerRole: 'commander' }),
    relationship({ relation: 'mentions-a-commander' }), relationship({ characterRole: 'any-commander' }),
    relationship({ resolution: { ...expected.audience.relationshipToCommander.resolution, entityIdentity: 'display-name' } }),
    relationship({ resolution: { ...expected.audience.relationshipToCommander.resolution, aboutCharacterIdentity: 'any-character' } }),
    relationship({ resolution: { ...expected.audience.relationshipToCommander.resolution, otherwise: 'nlp-match' } }),
    { ...expected, range: { kind: 'global' } }, { ...expected, range: { kind: 'any-distance-within-battlefield', participants: ['recipient'] } },
    { ...expected, range: { ...expected.range, throughAllBarriers: true } },
    { ...expected, effect: { kind: 'automatic-obedience' } }, { ...expected, effect: { kind: 'can-hear-command', automaticSuccess: true } },
    { ...expected, linkedTestDice: 1 }, { ...expected, hesitationRemoved: true },
    { ...expected, audience: null }, null, {},
  ])('rejects malformed references or unsupported audience/range/outcome semantics %j', value => {
    expect(() => register(value)).toThrow();
  });
});
