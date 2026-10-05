import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { peasantLifepaths, villagerLifepaths } from '../../src/data/human';
import type { LifepathDefinition, StatGrant } from '../../src/data/catalog';

// Independent oracle: the reviewed tables, not a generated snapshot of production data.
function auditedRows(file: string) {
  return readFileSync(new URL(`../../docs/audits/${file}`, import.meta.url), 'utf8')
    .split(/\r?\n/).filter(line => line.startsWith('| `human.'))
    .map(line => line.split('|').slice(1, -1).map(cell => cell.trim().replaceAll('`', '')));
}

const settingNames: Record<string, string> = {
  'human.peasant': 'Peasant', 'human.villager': 'Villager',
  'human.city-dweller': 'City Dweller', 'human.professional-soldier': 'Professional Soldier',
  'human.servitude-captive': 'Servitude', 'human.outcast': 'Outcast',
  'human.seafaring': 'Seafaring', 'human.religious': 'Religious',
  'human.noble': 'Noble', 'human.noble-court': 'Noble Court',
};

function statNotation(grant: StatGrant): string {
  switch (grant.kind) {
    case 'none': return '—';
    case 'mental': expect(grant.amount).toBe(1); return 'M';
    case 'physical': expect(grant.amount).toBe(1); return 'P';
    case 'chooseMentalOrPhysical': expect(grant.amount).toBe(1); return 'M/P';
    case 'mentalAndPhysical':
      expect([grant.mental, grant.physical]).toEqual([1, 1]); return 'M+P';
  }
}

function leadNotation(row: LifepathDefinition): string {
  switch (row.leads.kind) {
    case 'any': return 'Any';
    case 'to': return row.leads.settingIds.map(id => settingNames[id]).join(', ');
    case 'anyExcept': return `Any except ${row.leads.excludedSettingIds.map(id => settingNames[id]).join(' and ')}`;
  }
}

for (const [file, rows, count, settingId] of [
  ['CB-006_PEASANT_CATALOG.md', peasantLifepaths, 19, 'human.peasant'],
  ['CB-006_VILLAGER_CATALOG.md', villagerLifepaths, 41, 'human.villager'],
] as const) {
  describe(file, () => {
    const audited = auditedRows(file);
    it('contains exactly the audited identities, without extra rows', () => {
      expect(audited).toHaveLength(count);
      expect(rows.map(row => row.variantId)).toEqual(audited.map(row => row[0]));
      expect(new Set(rows.map(row => row.variantId)).size).toBe(count);
    });

    it.each(audited)('preserves audited values for %s',
      (variantId, familyId, name, years, resources, stat, leads, ordinary, general, traits) => {
        const row = rows.find(candidate => candidate.variantId === variantId)!;
        expect(row).toMatchObject({ variantId, familyId, sourceName: name, stockId: 'human', settingId });
        expect(row.isBorn).toBe(['human.peasant.born-peasant', 'human.villager.village-born'].includes(variantId!));
        expect(row.years).toBe(Number(years));
        expect(row.skillPointGrant).toEqual({ ordinary: Number(ordinary), general: Number(general) });
        expect(row.traitPointGrant).toBe(Number(traits));
        expect(statNotation(row.statGrant)).toBe(stat);
        expect(leadNotation(row)).toBe(leads);
        if (resources === '5+') {
          expect(row.resourceGrant).toMatchObject({ kind: 'wifeDerived', base: 5 });
        } else {
          expect(row.resourceGrant).toEqual({ kind: 'fixed', amount: Number(resources) });
        }
        expect(row.source.document).toBe(`docs/audits/${file}`);
        expect(row.source.printedPages).toEqual(settingId === 'human.peasant' ? [163, 164] : [165, 166, 167, 168, 169]);
        expect(row.source.pdfPages).toEqual(row.source.printedPages.map(page => page + 2));
      });
  });
}
