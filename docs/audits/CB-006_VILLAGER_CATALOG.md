# CB-006 — Villager Setting catalog audit

Status: **visually verified source audit; production data not yet generated**

Issue: #6

Source: *Burning Wheel Gold Revised*, Human Lifepaths → Villager Setting, printed pp. 165–169 (PDF pages 167–171).

Rendered source pages were checked visually. OCR was used only as an aid.

Conventions are the same as `CB-006_PEASANT_CATALOG.md`: exact row identity (`variantId`) is separate from conceptual repeat identity (`familyId`), setting aliases are canonicalized, `M+P` means both pools, `M/P` means player choice, and ordinary/General skill grants remain separate.

## Verified rows

| variantId | familyId | Lifepath | Years | Res | Stat | Canonical Leads | Skill pts | General pts | Trait pts | Requirement / special rule |
| --- | --- | --- | ---: | ---: | --- | --- | ---: | ---: | ---: | --- |
| `human.villager.village-born` | `human.village-born` | Village Born | 10 | 4 | — | Peasant, Servitude, Seafaring, Religious | 0 | 3 | 2 | Born lifepath |
| `human.villager.kid` | `human.kid` | Kid | 4 | 3 | P | Any except Noble and Noble Court | 3 | 0 | 1 | Must be second lifepath; may only be taken once |
| `human.villager.idiot` | `human.idiot` | Idiot | 10 | 4 | — | Outcast, Peasant | 4 | 0 | 1 | — |
| `human.villager.pilgrim` | `human.pilgrim` | Pilgrim | 2 | 4 | — | Religious, Servitude, City Dweller | 5 | 0 | 2 | — |
| `human.villager.conscript` | `human.conscript` | Conscript | 1 | 5 | — | Servitude, Professional Soldier, Outcast | 2 | 0 | 1 | Shares family with Peasant Conscript; grants differ by variant |
| `human.villager.groom` | `human.groom` | Groom | 4 | 7 | — | Peasant, City Dweller, Professional Soldier | 4 | 0 | 1 | Candidate `horse-related` tag; tag membership must be curated explicitly |
| `human.villager.runner` | `human.runner` | Runner | 4 | 6 | P | City Dweller, Peasant, Professional Soldier | 3 | 0 | 1 | Same printed name also appears in other supported settings |
| `human.villager.village-peddler` | `human.village-peddler` | Village Peddler | 5 | 10 | M | Peasant, Servitude, City Dweller, Outcast | 7 | 0 | 2 | Do not merge with Peddler/City Peddler without evidence |
| `human.villager.shopkeeper` | `human.shopkeeper` | Shopkeeper | 6 | 15 | — | City Dweller, Peasant | 5 | 0 | 1 | — |
| `human.villager.clerk` | `human.clerk` | Clerk | 4 | 9 | — | City Dweller, Outcast, Professional Soldier | 4 | 0 | 1 | Same printed name appears in City Dweller |
| `human.villager.sailor` | `human.sailor` | Sailor | 5 | 5 | P | Professional Soldier, City Dweller, Peasant, Servitude, Seafaring | 6 | 0 | 1 | Same printed name appears in City Dweller and Professional Soldier; variant grants/lists must remain distinct |
| `human.villager.laborer` | `human.laborer` | Laborer | 4 | 4 | P | Professional Soldier, Outcast, Servitude, Peasant | 2 | 0 | 2 | Same printed name appears in City Dweller and Professional Soldier |
| `human.villager.miner` | `human.miner` | Miner | 3 | 7 | P | Professional Soldier, Outcast, Servitude, Peasant | 2 | 0 | 3 | Requires Laborer, Conscript, Farmer or Foot Soldier |
| `human.villager.taskmaster` | `human.taskmaster` | Taskmaster | 6 | 15 | — | City Dweller, Outcast, Professional Soldier | 5 | 0 | 1 | Requires Village Sergeant **or any Professional Soldier lifepath** |
| `human.villager.serving-girl` | `human.serving-girl` | Serving Girl | 3 | 5 | M | Any except Noble | 4 | 0 | 2 | `Any except Noble` is not the same predicate as excluding Noble Court too |
| `human.villager.hosteller` | `human.hosteller` | Hosteller | 6 | 15 | — | City Dweller, Peasant | 5 | 0 | 1 | May not be second lifepath |
| `human.villager.village-tough` | `human.village-tough` | Village Tough | 3 | 7 | P | Professional Soldier, City Dweller, Peasant, Servitude | 4 | 0 | 1 | — |
| `human.villager.village-sergeant` | `human.village-sergeant` | Village Sergeant | 5 | 9 | M/P | Professional Soldier, Servitude, Outcast | 6 | 0 | 1 | Requires Village Tough, Squire, Freebooter, Sergeant-at-Arms or Man-at-Arms |
| `human.villager.corrupt-sergeant` | `human.corrupt-sergeant` | Corrupt Sergeant | 5 | 12 | M/P | Professional Soldier, Servitude, Noble Court | 6 | 0 | 1 | Same prerequisite alternatives as Village Sergeant |
| `human.villager.tailor` | `human.tailor` | Tailor | 5 | 12 | — | City Dweller, Peasant | 5 | 0 | 1 | — |
| `human.villager.tax-collector` | `human.tax-collector` | Tax Collector | 5 | 15 | M | City Dweller, Peasant, Outcast | 4 | 0 | 1 | May not be second lifepath (printed under `Requires`, modeled as position restriction) |
| `human.villager.cobbler` | `human.cobbler` | Cobbler | 8 | 20 | — | City Dweller, Peasant, Professional Soldier | 4 | 0 | 1 | Requires Apprentice |
| `human.villager.farrier` | `human.farrier` | Farrier | 5 | 12 | — | Peasant, Professional Soldier, City Dweller | 4 | 0 | 1 | Requires Apprentice; candidate `horse-related` tag |
| `human.villager.butcher` | `human.butcher` | Butcher | 6 | 15 | — | City Dweller, Peasant, Outcast | 4 | 0 | 2 | — |
| `human.villager.barber` | `human.barber` | Barber | 7 | 16 | — | City Dweller, Peasant, Outcast | 5 | 0 | 1 | — |
| `human.villager.brewer` | `human.brewer` | Brewer | 8 | 15 | — | City Dweller, Peasant, Noble Court | 4 | 0 | 1 | — |
| `human.villager.acolyte` | `human.acolyte` | Acolyte | 7 | 10 | M | Peasant, Servitude, City Dweller, Religious | 6 | 0 | 2 | Important fixture for cross-setting `Acolyte` requirements |
| `human.villager.failed-acolyte` | `human.failed-acolyte` | Failed Acolyte | 6 | 8 | — | Outcast, Professional Soldier, Peasant | 4 | 0 | 2 | Do not assume it satisfies `any Acolyte LP` until semantic membership is explicitly audited |
| `human.villager.village-priest` | `human.village-priest` | Village Priest | 8 | 15 | M | Any except Noble and Noble Court | 5 | 0 | 2 | Requires Acolyte |
| `human.villager.venal-priest` | `human.venal-priest` | Venal Priest | 9 | 20 | M | Any except Noble and Noble Court | 6 | 0 | 2 | Requires Acolyte, Clerk, Student **or any Religious-setting lifepath** |
| `human.villager.apprentice` | `human.apprentice` | Apprentice | 7 | 7 | P | City Dweller, Peasant, Professional Soldier, Seafaring | 6 | 0 | 2 | Same printed name appears in other supported settings |
| `human.villager.journeyman` | `human.journeyman` | Journeyman | 6 | 15 | M/P | City Dweller, Peasant, Professional Soldier, Seafaring | 5 | 0 | 1 | Requires Apprentice; same printed name appears elsewhere |
| `human.villager.cloth-dyer` | `human.cloth-dyer` | Cloth Dyer | 5 | 20 | M | City Dweller, Peasant | 6 | 0 | 1 | Requires Apprentice |
| `human.villager.bowyer` | `human.bowyer` | Bowyer | 6 | 15 | — | Professional Soldier, Outcast, Peasant | 4 | 0 | 1 | Requires Apprentice, Huntsman, Forester or Archer |
| `human.villager.master-craftsman` | `human.master-craftsman` | Master Craftsman | 10 | 30 | M+P | City Dweller, Professional Soldier | 6 | 3 | 1 | Requires Journeyman; mixed ordinary + General grant |
| `human.villager.vintner` | `human.vintner` | Vintner | 10 | 40 | M | Noble Court, Peasant, Villager | 4 | 0 | 1 | May not be second lifepath; self-Lead to Villager is valid data, not a duplicate-setting error |
| `human.villager.apiarist` | `human.apiarist` | Apiarist | 8 | 20 | M | City Dweller, Peasant, Noble Court | 4 | 0 | 2 | — |
| `human.villager.mining-engineer` | `human.mining-engineer` | Mining Engineer | 8 | 15 | M | City Dweller, Noble Court, Professional Soldier | 5 | 0 | 1 | Requires Apprentice, Miner, Student or Journeyman |
| `human.villager.town-official` | `human.town-official` | Town Official | 5 | 25 | M | City Dweller, Outcast, Professional Soldier | 8 | 0 | 1 | Requires Clerk, Priest or Student |
| `human.villager.merchant` | `human.merchant` | Merchant | 7 | 30 | M | City Dweller, Outcast, Seafaring | 6 | 0 | 1 | Requires Accountant, Sea Captain, Shopkeeper, Smuggler, Fence, Vintner or Chamberlain |
| `human.villager.village-wife` | `human.village-wife` | Village Wife | 8 | `5+` | M+P | Religious, City Dweller, Servitude | 2 | 0 | 1 | Dynamic husband rule; includes husband's General points before halving; see below |

**Count:** 41 verified Villager variants.

## Lead predicate distinctions confirmed by Villager

The table uses at least three different non-list Lead forms that must remain distinct:

```text
Any except Noble and Court   // Kid
Any except Noble             // Serving Girl
Any except Noble and Noble Court // Village Priest / Venal Priest
```

`Court` is normalized to Noble Court for canonical ids, so the first and third predicates are semantically equivalent after alias normalization. The second is not: it excludes the Noble Setting but does not textually exclude Noble Court.

This should be represented as a structured exclusion predicate rather than flattened into display text.

## Setting-backed requirement vs semantic tag

Taskmaster's requirement says `Village Sergeant or any Soldier lifepath`. `Soldier` here maps to the **Professional Soldier Subsetting**, so the second branch should be represented as prior setting membership, not a free-form `soldier` tag.

Likewise Venal Priest's `any Religious setting lifepath` is prior setting/subsetting membership.

These cases are useful counterexamples to genuinely semantic categories such as `any guard lifepath` or `horse-related`.

## Cross-setting family fixtures

Villager supplies several high-value repeat-identity fixtures because the same printed lifepath name appears in other first-slice settings while the printed row data differ.

At minimum the catalog should preserve separate variants while sharing an audited family identity for exact same-name cases such as:

- Conscript;
- Runner;
- Clerk;
- Sailor;
- Laborer;
- Apprentice;
- Journeyman;
- Master Craftsman;
- Merchant.

The safest initial identity rule remains: exact same printed lifepath names may be linked to one family after row-by-row verification; similar but non-identical names (Peddler / Village Peddler / City Peddler) remain separate unless evidence says otherwise.

## Village Wife special rule

Village Wife has `5+` Resources and derives additional values from a husband's lifepath selected from the **Villager Setting**.

The printed note explicitly says:

- half of the husband's skill points, **including General points**, rounded down;
- half of the husband's Resources.

Recommended special-rule representation:

```ts
{
  kind: 'wifeDerivedGrant',
  husbandSettingId: 'human.villager',
  includeHusbandGeneralSkillPoints: true,
  skillFraction: 0.5,
  skillRounding: 'down',
  resourceFraction: 0.5,
}
```

This is a useful difference from a generic derived-grant helper: the inclusion of General points is explicit here and should not be inferred globally for all Wife rows without checking their own notes.

## Semantic metadata notes

Villager provides clear candidates but not a complete global membership definition:

- `Village Sergeant` and `Corrupt Sergeant` are natural candidates for `sergeant` metadata, but any global `sergeant` category must still be audited against all settings that use such a requirement.
- `Village Priest` and `Venal Priest` are natural `priest` candidates; do not confuse this semantic category with an exact prerequisite named `Priest`.
- `Groom` and `Farrier` are natural `horse-related` candidates, but Cavalryman's broader requirement explicitly uses an open fictional category and examples, so membership needs deliberate curation.
- `Acolyte` is an obvious member of cross-setting Acolyte identity/category. `Failed Acolyte` remains unresolved for `any Acolyte LP`; do not include it merely because the name contains the word.

## Data-quality assertions derived from this audit

The Villager production fixture should fail validation if any of the following occurs:

1. row count is not 41;
2. `Village Born` ordinary skill points are nonzero instead of 3 General points;
3. Kid is legal outside position 2 or can be repeated;
4. Peasant/Villager Conscript rows overwrite one another;
5. Village Sergeant / Corrupt Sergeant `M/P` is flattened to `M+P`;
6. Master Craftsman's 3 General points are merged into its ordinary skill pool;
7. Village Wife's `5+` is flattened to 5;
8. Village Wife does not include husband's General points in its explicitly derived skill pool;
9. Taskmaster's `any Soldier lifepath` is implemented as fuzzy name/tag matching instead of Professional Soldier setting membership;
10. Serving Girl's `Any except Noble` is accidentally treated as `Any except Noble and Noble Court`;
11. self-Lead `Vintner → Villager` is discarded as malformed;
12. `Failed Acolyte` is automatically classified as satisfying `any Acolyte LP` solely by substring matching.

## Next catalog chunk

Continue Issue #6 with **City Dweller** (70 variants), then Professional Soldier (21 variants). City is the largest and most requirement-dense table, so it should be audited in page-sized chunks rather than as one unreviewed transcription dump.
