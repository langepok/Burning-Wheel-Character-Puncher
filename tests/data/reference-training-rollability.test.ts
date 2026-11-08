import { describe, expect, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import { generalSkillTranscriptionContent as content } from '../../src/data/skills/general';
import type { SkillRecord } from '../../src/data/skills';

const bowman = 'mounted-combat-bowman-training';
function withSkill(id: string, change: (skill: SkillRecord) => unknown) {
  return { ...content, skills: content.skills.map(skill => skill.id === id ? change(skill) as SkillRecord : skill) };
}
const mutations = [
  ['follow-up test', (id: string) => withSkill('intimidation', skill => ({
    ...skill, testProfile: { ...skill.testProfile, followUps: skill.testProfile?.followUps?.map(followUp =>
      ({ ...followUp, test: { ...followUp.test, ability: { kind: 'skill', id } } })) },
  }))],
  ['opposing skill', (id: string) => withSkill('inconspicuous', skill => ({
    ...skill, testProfile: { ...skill.testProfile, opposingAbilities: [{ kind: 'skill', skillId: id }] },
  }))],
  ['Cryptography deciphering', (id: string) => withSkill('cryptography', skill => ({
    ...skill, procedures: [{ kind: 'code-deciphering', obstacle: 'code-creation-test-successes',
      decipherWith: { kind: 'anyOf', skillIds: [id, 'cryptography'] } }],
  }))],
  ['Meditation acting skill', (id: string) => withSkill('meditation', skill => ({
    ...skill, procedures: skill.procedures?.map(procedure => procedure.kind === 'linked-pretest' ? {
      ...procedure, specialResolution: { ...procedure.specialResolution,
        test: { ...procedure.specialResolution.test, actingAbility: { kind: 'skill', id } } },
    } : procedure),
  }))],
  ['Shield Strike ability', (id: string) => ({
    ...content, integrations: content.integrations.map(integration => {
      const use = integration.shieldUse;
      if (!use) return integration;
      return { ...integration, shieldUse: { ...use, shieldStrike: { ...use.shieldStrike,
        actingAbility: { kind: 'one-of' as const, options: [{ kind: 'skill' as const, id },
          use.shieldStrike.actingAbility.options[1], ...use.shieldStrike.actingAbility.options.slice(2)] as const },
      } } };
    }),
  })],
] as const;

describe('Reference-only Training rollability', () => {
  it.each(mutations)('rejects Bowman and accepts an ordinary skill for %s', (_position, mutate) => {
    expect(() => createSkillCatalog(mutate(bowman))).toThrow('Training has no exponent');
    expect(() => createSkillCatalog(mutate('research'))).not.toThrow();
  });

  it('allows Bowman as a prerequisite and retains the separate Training permission', () => {
    const catalog = createSkillCatalog(withSkill('intimidation', skill => ({
      ...skill, openingRequirements: [{ kind: 'known-skill', skillId: bowman }],
    })));
    expect(catalog.skills.get('intimidation')?.openingRequirements).toEqual([{ kind: 'known-skill', skillId: bowman }]);
    expect(catalog.skills.get('mounted-combat-training')?.trainingSourceChoice?.options.map(option => option.id)).toContain(bowman);
    expect(catalog.integrations.get('shield-training-use')?.shieldUse?.trainedDefenseAccess).toContainEqual(
      expect.objectContaining({ action: 'block-and-strike', access: 'enabled' }),
    );
    expect(catalog.skills.has(bowman)).toBe(false);
  });

  it.each(['ancient-history', 'obscure-history', 'escape-artist'])('does not blanket-ban reference-only %s', id => {
    const mutateOpponent = mutations[1][1];
    expect(() => createSkillCatalog(mutateOpponent(id))).not.toThrow();
  });
});
