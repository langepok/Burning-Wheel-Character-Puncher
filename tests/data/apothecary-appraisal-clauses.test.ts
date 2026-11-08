import { describe, expect, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import { generalSkillTranscriptionContent as content } from '../../src/data/skills/general';

const catalog = createSkillCatalog(content);
const treatments = {
  painRelief: { testObstacle: 3, effect: { kind: 'relieve-pain-obstacle-penalty', magnitude: 1 } },
  localNumbing: { testObstacle: 4, effect: { kind: 'reduce-wound-die-penalty', dice: 1 },
    sideEffect: { kind: 'obstacle-penalty', scope: 'all-tests', delta: 1 },
    duration: { unit: 'hours', amount: 4 } },
};

describe('Apothecary and Appraisal (book 255–256 / PDF 257–258)', () => {
  it('preserves the two different Apothecary preparations and their individual effects', () => {
    const integration = catalog.integrations.get('apothecary-medicines');
    expect(integration?.medicinalPreparations).toEqual(treatments);
    expect(catalog.skills.get('apothecary')?.summary).toContain('relieve itching Ob 2; cure warts Ob 3');
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(content)));
    expect(restored.integrations.get('apothecary-medicines')?.medicinalPreparations).toEqual(treatments);
  });
  it('rejects assigning the numbing duration to the pain preparation', () => {
    expect(() => createSkillCatalog({ ...content, integrations: content.integrations.map(integration =>
      integration.id === 'apothecary-medicines' ? { ...integration, medicinalPreparations: { ...treatments,
        painRelief: { ...treatments.painRelief, duration: { unit: 'hours', amount: 4 } } } } as unknown as typeof integration : integration),
    })).toThrow('Invalid medicinal preparations');
  });
  it('keeps the continuation, all appraisal obstacles and the magical-item test modifier', () => {
    const skill = catalog.skills.get('appraisal');
    expect(skill?.source.map(source => source.kind === 'audit-packet' ? source.pages : undefined)).toEqual([
      { printed: [255], pdf: [257] }, { printed: [256], pdf: [258] },
    ]);
    for (const row of ['coins or precious metals Ob 1', 'gems Ob 2', 'tapestries Ob 3', 'armaments Ob 3',
      'antiquities Ob 4', 'art Ob 5', 'ephemera (such as wine, drugs or candles) Ob 6']) expect(skill?.summary).toContain(row);
    expect(skill?.testProfile).toEqual({ kind: 'contextual', modifiers: [{
      when: { kind: 'circumstance', circumstanceId: 'appraising-magical-item' },
      effect: { kind: 'obstacle-modifier', delta: 1 },
    }] });
    expect(skill?.resourceInteractions).toEqual([]);
  });
});
