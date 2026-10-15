import { readFileSync } from 'node:fs';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { CombatUseChoice, SkillCatalogContent } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const skill = catalog.skills.get('polearm')!;
const choice = skill.combatUseChoice!;
const register = (value: unknown) => createSkillCatalog({ ...generalSkillTranscriptionContent,
  skills: generalSkillTranscriptionContent.skills.map(record => record.id === skill.id ? { ...record, combatUseChoice: value } : record),
} as SkillCatalogContent);
const profile = (id: string, sourceName: string) => ({ kind: 'external-combat-profile', subsystem: 'fight', catalog: 'weapon-appendix', id, sourceName });

describe('Polearm profiles share a physical weapon identity', () => {
  it('exposes exactly cutting and thrusting for one physical weapon, selected per combat use', () => {
    expectTypeOf<typeof choice>().toExtend<CombatUseChoice>();
    expect(choice).toEqual({ kind: 'combat-use-choice', weaponIdentity: 'shared-physical-item', selection: 'per-combat-use', options: [
      { id: 'cutting', combatProfileRef: profile('polearm-axe-strike', 'Polearm Axe Strike') },
      { id: 'thrusting', combatProfileRef: profile('polearm-thrust', 'Polearm Thrust') },
    ] });
    expect(new Set(choice.options.map(option => option.combatProfileRef.id)).size).toBe(2);
    expect(catalog.skills.has('polearm-axe-strike')).toBe(false);
    expect(catalog.skills.has('polearm-thrust')).toBe(false);
    choice.options.forEach(option => expect(option).not.toHaveProperty('inventoryItemId'));
  });
  it('keeps numeric weapon stats outside SkillDefinition and unloaded profiles valid', () => {
    for (const option of choice.options) {
      for (const key of ['Pow', 'Add', 'WS', 'VA', 'WL', 'damage', 'weaponLength']) {
        expect(skill).not.toHaveProperty(key);
        expect(option.combatProfileRef).not.toHaveProperty(key);
      }
    }
    expect(skill.integrationTags).toEqual(['fight', 'equipment']);
    expect(skill.rootRule).toEqual({ kind: 'combined', abilities: [{ kind: 'stat', id: 'power' }, { kind: 'stat', id: 'agility' }] });
    expect(skill.tools).toEqual({ kind: 'anyOf', requirements: ['halberd', 'glaive', 'voulge'].map(item => ({ kind: 'specific-item', item })) });
    expect(() => register(choice)).not.toThrow();
  });
  it('round-trips explicit external references without resolving them as skills or inventory', () => {
    expect(createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent))).skills.get('polearm')?.combatUseChoice).toEqual(choice);
  });
  it('does not hard-code external profile identities in the generic catalog boundary', () => {
    const generic = { ...choice, options: choice.options.map((option, i) => ({ ...option,
      combatProfileRef: { ...option.combatProfileRef, id: `synthetic-profile-${i}`, sourceName: `Synthetic profile ${i}` } })) };
    expect(register(generic).skills.get('polearm')?.combatUseChoice).toEqual(generic);
  });
  it.each([
    null, { ...choice, kind: 'inventory-choice' }, { ...choice, weaponIdentity: 'separate-items' },
    { ...choice, selection: 'character-acquisition' }, { ...choice, options: [] },
    { ...choice, options: [choice.options[0]] }, { ...choice, options: [choice.options[0], choice.options[0]] },
    { ...choice, options: [{ ...choice.options[0], id: '' }, choice.options[1]] },
    { ...choice, options: [{ ...choice.options[0], combatProfileRef: 'polearm-axe-strike' }, choice.options[1]] },
    { ...choice, options: [{ ...choice.options[0], combatProfileRef: { ...choice.options[0].combatProfileRef, subsystem: 'resources' } }, choice.options[1]] },
    { ...choice, options: [{ ...choice.options[0], combatProfileRef: { ...choice.options[0].combatProfileRef, id: '' } }, choice.options[1]] },
    { ...choice, options: [{ ...choice.options[0], combatProfileRef: { ...choice.options[0].combatProfileRef, sourceName: '' } }, choice.options[1]] },
    { ...choice, options: [{ ...choice.options[0], inventoryItemId: 'weapon-1' }, choice.options[1]] },
    { ...choice, options: [{ ...choice.options[0], combatProfileRef: { ...choice.options[0].combatProfileRef, Pow: 3 } }, choice.options[1]] },
  ])('rejects malformed choices, references and copied stats %j', value => {
    expect(() => register(value)).toThrow('Invalid combat-use choice');
  });
  it('records D-027 separating possession/loss/repair/quality/enchantment from profiles', () => {
    const decision = readFileSync('docs/DECISIONS.md', 'utf8').split('## D-027')[1]?.split('## Open decisions')[0];
    expect(decision).toContain('Physical equipment identity is separate from combat-use profiles');
    for (const word of ['possession', 'loss', 'repair', 'quality', 'enchantment', 'Polearm', 'UI']) expect(decision).toContain(word);
  });
});
