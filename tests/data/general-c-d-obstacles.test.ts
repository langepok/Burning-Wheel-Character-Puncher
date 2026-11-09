import { describe, expect, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';

const catalog = createSkillCatalog(generalSkillTranscriptionContent);
// The printed order and gaps matter. Pages 263–269 / PDF 265–271.
const standard = [1, 2, 3, 4, 5];
const obstacleRows: ReadonlyArray<readonly [string, readonly number[]]> = [
  ['calligraphy', standard], ['carpentry', standard], ['cartography', [1, 2, 3, 4, 5, 6, 7]],
  ['cartwright', standard], ['carving', [1, 2, 3, 4]], ['chandler', standard],
  ['chronology-of-kings', [1, 2, 3, 4, 5, 6, 7]], ['church-law', standard], ['clan-history', [1, 2, 3, 4]],
  ['climbing', [1, 2, 3, 4, 5, 7]], ['cloth-dyeing', standard], ['cobbler', [1, 2, 3, 4]],
  ['composition', [1, 2, 3, 4]], ['conspicuous', standard], ['cooking', standard],
  ['cooper', [1, 2, 3, 4]], ['coppersmith', [1, 2, 3, 3]], ['dance', standard], ['demonology', standard],
  ['disguise', [1, 1, 2, 3, 4, 2, 3, 4, 5, 6, 7, 8, 9, 10]], ['ditch-digging', standard],
  ['doctrine', [1, 2, 3]], ['doctrine-of-nights-blood', standard], ['drum-maker', [1, 2, 3, 4]],
  ['dye-manufacture', [1, 2, 3]],
];
describe('General Skill List C–D printed obstacle guidance', () => {
  it.each(obstacleRows)('%s retains all printed obstacle rows', (id, expected) => {
    const summary = catalog.skills.get(id)?.summary ?? '';
    expect([...summary.matchAll(/\bOb (\d+)\b/g)].map(match => Number(match[1]))).toEqual(expected);
  });

  it('retains the range for printed counterfeit material, not a single obstacle', () => {
    expect(catalog.skills.get('counterfeiting')?.summary).toContain('printed material Ob 5–10 by complexity');
  });
  it('keeps the printed climbing examples attached to their obstacle tiers', () => {
    const summary = catalog.skills.get('climbing')?.summary;
    for (const row of ['rocky hill, tree or fence Ob 1', 'inclined rock wall or treacherous tree Ob 2',
      'straight rock wall Ob 3', 'sheer rock wall Ob 4', 'ice climb Ob 5',
      'bad conditions, overhangs or ice Ob 7']) expect(summary).toContain(row);
  });
  it('keeps Disguise stock groupings and continuation provenance without resolving slash notation', () => {
    const skill = catalog.skills.get('disguise');
    expect(skill?.summary).toContain('Dwarf/Roden/Troll Ob 5; Elf/Roden/Troll Ob 6; Orc/Elf Ob 7');
    expect(skill?.summary).toContain('Roden/Wolf Ob 8; other/Wolf Ob 9; any/Spider Ob 10');
    expect(skill?.source.map(source => source.kind === 'audit-packet' ? source.pages : undefined)).toEqual([
      { printed: [267], pdf: [269] }, { printed: [268], pdf: [270] },
    ]);
  });
  it('preserves Command’s two battlefield procedures without interpreting its linked test', () => {
    const restored = createSkillCatalog(JSON.parse(JSON.stringify(generalSkillTranscriptionContent)));
    expect(restored.skills.get('command')?.procedures).toEqual([
      { kind: 'battlefield-hesitation-relief', range: 'audible-voice', commanderMustNotHesitate: true,
        obstacle: 'amount-of-hesitation', effect: { kind: 'subtract-success-margin', appliesTo: 'all-hesitation-in-presence' } },
      { kind: 'field-maneuver-linked-test', subsystem: 'range-and-cover', opposition: 'highest-will-on-own-team',
        benefit: 'may-link-to-team-field-maneuvers' },
    ]);
  });
  it('preserves code creation successes and the two distinct deciphering skills', () => {
    expect(catalog.skills.get('cryptography')?.procedures).toEqual([{
      kind: 'code-deciphering', obstacle: 'code-creation-test-successes',
      decipherWith: { kind: 'anyOf', skillIds: ['research', 'cryptography'] },
    }]);
  });
  it('keeps Drinking’s recommended versus test separate from both Drunking uses', () => {
    expect(catalog.skills.get('drinking')?.procedures).toEqual([
      { kind: 'drinker-contest', aim: 'drink-without-showing-it', test: 'versus', recommendation: 'preferred' },
    ]);
    expect(catalog.skills.get('drunking')?.procedures).toEqual([
      { kind: 'drinker-contest', aim: 'fastest-intoxication', test: 'versus',
        speedBasis: 'more-successes-faster', reducesAlcoholRequired: false },
      { kind: 'appear-sober', test: 'versus', opponent: { kind: 'stat', id: 'perception' } },
    ]);
  });
});
