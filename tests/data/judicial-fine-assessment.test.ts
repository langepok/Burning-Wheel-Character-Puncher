import { describe, expect, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import { generalSkillTranscriptionContent as content } from '../../src/data/skills/general';

const integrationId = 'amercement-judicial-fine-assessment';
const expected = { kind: 'judicial-fine-assessment',
  output: { kind: 'resources-obstacle', purpose: 'judicial-fine' },
  determination: 'source-unspecified' } as const;

describe('Amercement judicial fine assessment (book 254 / PDF 256)', () => {
  it('preserves distinct test obstacles and a Resources output with no numeric value', () => {
    const catalog = createSkillCatalog(content);
    expect(catalog.skills.get('amercement')).toMatchObject({
      rootRule: { kind: 'single', ability: { kind: 'stat', id: 'perception' } },
      skillType: 'School of Thought', tools: { kind: 'none' }, resourceInteractions: [],
      capabilities: [{ kind: 'subsystem-capability', id: 'judicial-fine-assessment', integrationId }],
    });
    const summary = catalog.skills.get('amercement')?.summary;
    expect(summary).toContain('Skill-test obstacles');
    for (const row of ['low justice (fine only) Ob 2', 'middle justice (amputation, branding or fine) Ob 3',
      'high justice (capital crimes) Ob 5']) expect(summary).toContain(row);
    expect(catalog.integrations.get(integrationId)).toMatchObject({
      subsystem: 'resources', skillId: 'amercement', judicialFineAssessment: expected,
    });
    expect(catalog.integrations.get(integrationId)?.judicialFineAssessment).toEqual(expected);
  });
  it('round-trips source-unspecified determination without adding a payment or test procedure', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(content)) as typeof content);
    expect(restored.integrations.get(integrationId)?.judicialFineAssessment).toEqual(expected);
  });
  it.each([
    { judicialFineAssessment: { ...expected, determination: 'margin-of-success' } },
    { judicialFineAssessment: { ...expected, output: { ...expected.output, value: 2 } } },
    { judicialFineAssessment: { ...expected, payment: 'automatic' } },
    { subsystem: 'equipment', judicialFineAssessment: expected },
  ])('rejects invented mechanics or an incorrect subsystem: %j', override => {
    const pack = { ...content, integrations: content.integrations.map(integration =>
      integration.id === integrationId ? { ...integration, ...override } : integration) };
    expect(() => createSkillCatalog(pack as typeof content)).toThrow('Invalid judicial fine assessment');
  });
});
