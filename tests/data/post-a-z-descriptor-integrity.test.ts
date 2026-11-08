import { describe, expect, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import { generalSkillTranscriptionContent as content } from '../../src/data/skills/general';

function patchIntegration(id: string, patch: Record<string, unknown>) {
  const integrations = content.integrations.map(integration => integration.id === id ? { ...integration, ...patch } : integration);
  return () => createSkillCatalog({ ...content, integrations } as typeof content);
}
function patchProcedures(id: string, procedures: readonly unknown[]) {
  const skills = content.skills.map(skill => skill.id === id ? { ...skill, procedures } : skill);
  return () => createSkillCatalog({ ...content, skills } as typeof content);
}

describe('H-01 procedure integrity', () => {
  const catalog = createSkillCatalog(content);

  it('round-trips the new procedures and their subsystem ownership', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(content)));
    for (const id of ['antiphon-creation', 'apothecary-medicines', 'armor-training-penalties', 'boxing-unarmed-access',
      'brawling-unarmed-access', 'brazen-horn-hesitation', 'artillerist-procedure', 'aura-reading-spirit',
      'amercement-judicial-fine-assessment']) {
      const record = catalog.integrations.get(id);
      expect(record, id).toBeDefined();
      expect(restored.integrations.get(id), id).toEqual(record);
    }
    for (const id of ['command', 'cryptography', 'drinking', 'drunking', 'formation-fighting', 'fortifications']) {
      expect(catalog.skills.get(id)?.procedures, id).toBeDefined();
      expect(restored.skills.get(id)?.procedures, id).toEqual(catalog.skills.get(id)?.procedures);
    }
  });

  it('rejects an invalid Antiphon obstacle floor', () => {
    const creation = catalog.integrations.get('antiphon-creation')?.baseItemCreation;
    expect(patchIntegration('antiphon-creation', { baseItemCreation: { ...creation,
      obstacle: { kind: 'natural-obstacle-with-minimum', minimum: 0 } } }))
      .toThrow('Invalid magic base-item-creation reference');
  });
  it('rejects invented fixed-duration horn hesitation', () => {
    const rule = catalog.integrations.get('brazen-horn-hesitation')?.opposingForceHesitation;
    expect(patchIntegration('brazen-horn-hesitation', { opposingForceHesitation: {
      ...rule, effect: { ...rule?.effect, duration: 'one-scene' },
    } })).toThrow('Invalid opposing-force hesitation');
  });
  it('rejects using Power as the implied acting ability for Brawling found weapons', () => {
    const access = catalog.integrations.get('brawling-unarmed-access')?.unarmedCombatAccess;
    expect(patchIntegration('brawling-unarmed-access', { unarmedCombatAccess: {
      ...access, foundWeapons: { countsAs: 'melee-weapon', actingAbility: 'power' },
    } })).toThrow('Invalid unarmed combat access');
  });
  it('rejects Training as a deciphering ability without treating it as dangling', () => {
    expect(patchProcedures('cryptography', [{ kind: 'code-deciphering',
      obstacle: 'code-creation-test-successes', decipherWith: { kind: 'anyOf', skillIds: ['research', 'armor-training'] },
    }])).toThrow('Training has no exponent');
  });
  it('rejects applying Formation Fighting maneuver help to all abilities', () => {
    const formation = catalog.skills.get('formation-fighting')?.procedures?.[0];
    if (formation?.kind !== 'formation-fighting-benefits') throw new Error('Missing Formation Fighting procedure');
    expect(patchProcedures('formation-fighting', [{ ...formation,
      maneuverHelp: { ...formation.maneuverHelp, maneuverBasis: 'all' },
    }])).toThrow('Invalid formation fighting benefits');
  });
  it('rejects a duplicate structure row and invented cover unit', () => {
    const row = { structure: 'palisade', buildingObstacle: 3, coverIncrease: 'source-unspecified' };
    expect(patchProcedures('fortifications', [{ kind: 'field-fortifications', options: [row, row] }]))
      .toThrow('Invalid field fortifications');
    expect(patchProcedures('fortifications', [{ kind: 'field-fortifications',
      options: [row, { structure: 'wall', buildingObstacle: 2, coverIncrease: 'dice' }],
    }])).toThrow('Invalid field fortifications');
  });
});
