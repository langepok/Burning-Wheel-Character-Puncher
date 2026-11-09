import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import type { SkillCatalogContent, SkillProcedure, SupplyManagement } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
const skill = catalog.skills.get('ship-management')!;
const supply = skill?.procedures?.[0] as SupplyManagement;
const register = (procedure: unknown) => createSkillCatalog({ ...generalSkillTranscriptionContent,
  skills: generalSkillTranscriptionContent.skills.map(record => record.id === 'ship-management'
    ? { ...record, procedures: [procedure] } : record),
} as SkillCatalogContent);

describe('Ship Management supply outcomes (295/297)', () => {
  it('describes success and contextual critical shortage without inventory resolution', () => {
    expectTypeOf<SupplyManagement>().toExtend<SkillProcedure>();
    expect(supply.kind).toBe('supply-management');
    expect(supply.success).toEqual({ kind: 'no-supply-problem' });
    expect(supply.failure.shortage).toEqual({ kind: 'critical-supply-shortage', supplySelection: 'contextual',
      examplesPolicy: 'non-exhaustive', examples: ['food', 'water', 'medicine', 'lumber', 'ammunition'] });
    expect(() => register({ ...supply, failure: { ...supply.failure, shortage: {
      ...supply.failure.shortage, examples: ['another-source-supported-supply'],
    } } })).not.toThrow();
  });
  it('preserves three distinct consequences, including beginning mortality, without invented numbers', () => {
    expect(supply.failure.consequences).toEqual([
      { kind: 'serious-complications', resolution: 'contextual' },
      { kind: 'crew-mortality', onset: 'begins', quantity: 'source-unspecified', timing: 'source-unspecified', cause: 'shortage-of-critical-supply' },
      { kind: 'morale-harm', magnitude: 'source-unspecified' },
    ]);
    expect(skill.resourceInteractions).toEqual([]);
    expect(skill.testProfile?.outcomes).toBeUndefined();
  });
  it.each([
    { vessels: ['rowboat', 'skiff'], obstacle: 1 }, { vessels: ['longboat'], obstacle: 2 },
    { vessels: ['junk'], obstacle: 3 }, { vessels: ['caravel'], obstacle: 4 },
    { vessels: ['carrack'], obstacle: 5 }, { vessels: ['felucca'], obstacle: 6 },
    { vessels: ['treasure-ship'], obstacle: 7 },
  ])('preserves vessel guidance $vessels at Ob $obstacle', row => {
    expect(supply.obstacleGuidance.vessels).toContainEqual(row);
    expect(supply.obstacleGuidance.vessels).toHaveLength(7);
  });
  it('preserves independent journey modifiers without inferring a voyage formula', () => {
    expect(supply.obstacleGuidance.journeyModifiers).toEqual([
      { journey: 'moderate', obstacleDelta: 1 }, { journey: 'long', obstacleDelta: 2 },
      { journey: 'ocean-crossing', obstacleDelta: 3 },
    ]);
    expect(skill.rootRule).toEqual({ kind: 'single', ability: { kind: 'stat', id: 'perception' } });
    expect(skill.skillType).toBe('Seafaring');
    expect(skill.tools).toEqual({ kind: 'none', expendable: false });
    expect(skill.forkSuggestions?.suggestions).toEqual(['accounting', 'logistics'].map(skillId => ({ target: { kind: 'skill', skillId } })));
  });
  it('round-trips all outcome and obstacle metadata through catalog registration', () => {
    expect(createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent))).skills.get(skill.id)).toEqual(skill);
  });
  it.each([
    ['success', { kind: 'generate-supplies' }],
    ['failure', { shortage: { kind: 'critical-supply-shortage', supplySelection: 'random' }, consequences: [] }],
    ['obstacleGuidance', { vessels: [], journeyModifiers: [] }],
  ])('rejects malformed %s', (key, value) => {
    expect(() => register({ ...supply, [key]: value })).toThrow('Invalid');
  });
  it.each([
    { supplySelection: 'random' }, { examplesPolicy: 'whitelist' }, { supplyId: 'food' }, { examples: [''] },
  ])('rejects invented shortage selection or a closed supply catalog %j', fields => {
    expect(() => register({ ...supply, failure: { ...supply.failure, shortage: { ...supply.failure.shortage, ...fields } } })).toThrow('Invalid');
  });
  it.each([
    { onset: 'possible' }, { quantity: 1 }, { timing: 'one-day' }, { healthTest: true }, { wound: 'B10' },
  ])('rejects weakened mortality or invented downstream procedures %j', fields => {
    expect(() => register({ ...supply, failure: { ...supply.failure, consequences: supply.failure.consequences.map(
      consequence => consequence.kind === 'crew-mortality' ? { ...consequence, ...fields } : consequence) } })).toThrow('Invalid');
  });
  it.each([{ magnitude: 1 }, { delta: 1 }, { steelModifier: 1 }, { mutiny: true }])('rejects invented morale mechanics %j', fields => {
    expect(() => register({ ...supply, failure: { ...supply.failure, consequences: supply.failure.consequences.map(
      consequence => consequence.kind === 'morale-harm' ? { ...consequence, ...fields } : consequence) } })).toThrow('Invalid');
  });
  it.each(['inventory', 'resourcesTest', 'voyageClock', 'deathEvaluator', 'crewState'])('rejects downstream execution field %s', key => {
    expect(() => register({ ...supply, [key]: {} })).toThrow('Invalid');
  });
  it('rejects missing/duplicate consequences and malformed vessel/journey guidance', () => {
    for (const consequences of [[], supply.failure.consequences.slice(0, 2), [...supply.failure.consequences, supply.failure.consequences[0]]]) {
      expect(() => register({ ...supply, failure: { ...supply.failure, consequences } })).toThrow('Invalid');
    }
    for (const obstacleGuidance of [
      { ...supply.obstacleGuidance, vessels: [{ vessels: [''], obstacle: 1 }] },
      { ...supply.obstacleGuidance, vessels: [{ vessels: ['skiff'], obstacle: 0 }] },
      { ...supply.obstacleGuidance, vessels: [supply.obstacleGuidance.vessels[0], supply.obstacleGuidance.vessels[0]] },
      { ...supply.obstacleGuidance, journeyModifiers: [{ journey: '', obstacleDelta: 1 }] },
      { ...supply.obstacleGuidance, journeyModifiers: [{ journey: 'long', obstacleDelta: 1.5 }] },
    ]) expect(() => register({ ...supply, obstacleGuidance })).toThrow('Invalid');
  });
});
