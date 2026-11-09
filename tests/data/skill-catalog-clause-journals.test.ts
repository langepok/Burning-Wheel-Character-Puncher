import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createSkillCatalog } from '../../src/data/skills';
import { generalSkillTranscriptionContent } from '../../src/data/skills/general';
import { generalSkillManifest } from './general-skill-manifest';

const readAudit = (name: string) => readFileSync(new URL(`../../docs/audits/${name}.md`, import.meta.url), 'utf8');
const names = ['A_D', 'E_F', 'G_H', 'I_M', 'N_R', 'S_Z'].map(block => `GENERAL_SKILL_CLAUSE_REVIEW_${block}`);
const journals = names.map(readAudit);
const normalize = (text: string) => text.normalize('NFKC').toLowerCase().replaceAll('’', "'");
const labels = normalize(journals.flatMap(journal => journal.split(/\r?\n/).flatMap(line =>
  line.startsWith('|') ? [line.split('|')[1]] : line.startsWith('## ') ? [line.slice(3)] : [])).join('\n'));
const catalog = createSkillCatalog(generalSkillTranscriptionContent);

describe('H-01 journal inventory and provenance', () => {
  it('indexes all six block journals and explicitly names each manifest identity', () => {
    const index = readAudit('GENERAL_SKILL_CATALOG_AZ');
    for (const name of names) expect(index).toContain(`(${name}.md)`);
    const absent = generalSkillManifest.filter(entry => {
      const name = normalize(entry.sourceName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return !new RegExp(`(?<![\\p{L}-])${name}(?![\\p{L}-])`, 'u').test(labels);
    });
    expect(absent.map(entry => entry.id)).toEqual([]);
  });
  it('ties every production definition to its manifest book and PDF pages', () => {
    const definitions = generalSkillManifest.filter(entry => entry.kind !== 'family' && entry.kind !== 'choice');
    expect(definitions).toHaveLength(424);
    for (const entry of definitions) {
      expect(catalog.skills.get(entry.id)?.source, entry.id).toContainEqual(expect.objectContaining({
        kind: 'audit-packet', pages: { printed: [entry.printedPage], pdf: [entry.pdfPage] },
      }));
    }
  });
  it('does not silently publish an explicitly incomplete clause as complete', () => {
    for (const journal of journals) expect(journal).not.toMatch(/pending-structured-coverage|\|\s*\*{0,2}missing\b/i);
  });
});
