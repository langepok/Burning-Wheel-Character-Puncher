# CB-006 — City Dweller Setting catalog audit

Status: **visually verified source audit; production data not yet generated**

Issue: #6

Source: *Burning Wheel Gold Revised*, Human Lifepaths → City Dweller Setting, printed pp. 170–177 (PDF pages 172–179).

All eight rendered source pages were checked visually. OCR was used only as an aid.

Conventions follow the Peasant/Villager audit docs. In particular:

- `variantId` is one printed row in one setting;
- `familyId` is conceptual repeat identity, with exact same-name cross-setting rows treated as family candidates after verification;
- `M+P` means both stat pools; `M/P` means player choice;
- `Traits: —` means **zero trait points** and is distinct from `1 pt: —`;
- canonical aliases normalize `City`, `Village`, `Soldier`, `Sea`, `Court`, etc.;
- ordinary and General skill grants remain separate.

## Verified rows

| variantId | familyId | Lifepath | Years | Res | Stat | Canonical Leads | Skill pts | General pts | Trait pts | Requirement / special rule |
| --- | --- | --- | ---: | ---: | --- | --- | ---: | ---: | ---: | --- |
| `human.city-dweller.city-born` | `human.city-born` | City Born | 12 | 10 | — | Servitude, Noble Court, Noble, Outcast | 0 | 4 | 1 | Born lifepath |
| `human.city-dweller.runner` | `human.runner` | Runner | 3 | 7 | P | Villager, Professional Soldier | 3 | 0 | 1 | Same family candidate as Villager / Professional Soldier Runner |
| `human.city-dweller.urchin` | `human.urchin` | Urchin | 2 | 4 | — | Outcast, Servitude, Villager | 5 | 0 | 1 | If taken, must be second or third lifepath |
| `human.city-dweller.beggar` | `human.beggar` | Beggar | 5 | 4 | — | Outcast, Servitude, Villager | 7 | 0 | 1 | — |
| `human.city-dweller.courier` | `human.courier` | Courier | 4 | 8 | M | Villager, Professional Soldier | 4 | 0 | 1 | — |
| `human.city-dweller.laborer` | `human.laborer` | Laborer | 4 | 4 | P | Professional Soldier, Outcast, Servitude, Peasant | 2 | 0 | 2 | Same family candidate as Villager / Professional Soldier Laborer |
| `human.city-dweller.pilgrim` | `human.pilgrim` | Pilgrim | 2 | 3 | M | Religious, Servitude, Villager | 4 | 0 | 2 | Same printed name as Villager Pilgrim; grants differ |
| `human.city-dweller.groom` | `human.groom` | Groom | 4 | 5 | P | Peasant, Villager, Professional Soldier | 6 | 0 | 1 | Candidate `horse-related` tag |
| `human.city-dweller.duelist` | `human.duelist` | Duelist | 4 | 8 | P | Professional Soldier, Outcast, Servitude | 7 | 0 | 1 | Requires Squire **or** any Outcast lifepath **or** any Professional Soldier lifepath **or** any guard lifepath |
| `human.city-dweller.coin-clipper` | `human.coin-clipper` | Coin Clipper | 6 | 15 | M | Outcast, Noble Court | 5 | 0 | 1 | — |
| `human.city-dweller.pickpocket` | `human.pickpocket` | Pickpocket | 4 | 8 | P | Outcast, Villager, Servitude | 5 | 0 | 1 | — |
| `human.city-dweller.street-thug` | `human.street-thug` | Street Thug | 3 | 5 | P | Outcast, Servitude, Professional Soldier | 5 | 0 | 1 | — |
| `human.city-dweller.criminal` | `human.criminal` | Criminal | 5 | 10 | M/P | Outcast, Villager, Professional Soldier | 6 | 0 | 2 | — |
| `human.city-dweller.confidence-man` | `human.confidence-man` | Confidence Man | 4 | 12 | — | Outcast, Professional Soldier, Villager | 5 | 0 | 1 | — |
| `human.city-dweller.city-peddler` | `human.city-peddler` | City Peddler | 5 | 10 | — | Villager, Servitude, Peasant, Outcast | 7 | 0 | 1 | Do not merge with Peddler / Village Peddler without identity evidence |
| `human.city-dweller.sailor` | `human.sailor` | Sailor | 5 | 5 | P | Professional Soldier, Seafaring, Peasant, Servitude | 5 | 0 | 1 | Same family candidate as Villager / Professional Soldier Sailor |
| `human.city-dweller.student` | `human.student` | Student | 4 | 5 | M | Any except Noble | 11 | 0 | 3 | Same printed name also exists outside this setting |
| `human.city-dweller.ganymede` | `human.ganymede` | Ganymede | 5 | 15 | — | Outcast, Servitude, Noble Court | 5 | 0 | 2 | — |
| `human.city-dweller.dilettante` | `human.dilettante` | Dilettante | 3 | 8 | M | Villager, Noble Court, Outcast | 4 | 0 | 1 | — |
| `human.city-dweller.neophyte-sorcerer` | `human.neophyte-sorcerer` | Neophyte Sorcerer | 6 | 12 | M | Villager, Peasant, Outcast, Servitude | 6 | 0 | 1 | Strong candidate for `sorcerous` semantic metadata |
| `human.city-dweller.temple-acolyte` | `human.temple-acolyte` | Temple Acolyte | 5 | 10 | M | Peasant, Outcast, Servitude, Religious | 5 | 0 | 1 | Candidate `acolyte` semantic metadata; distinct family from plain Acolyte |
| `human.city-dweller.sculptor` | `human.sculptor` | Sculptor | 5 | 8 | M/P | Outcast, Peasant, Noble Court | 6 | 0 | 2 | — |
| `human.city-dweller.painter` | `human.painter` | Painter | 5 | 5 | M/P | Outcast, Peasant, Noble Court | 5 | 0 | 2 | — |
| `human.city-dweller.composer` | `human.composer` | Composer | 4 | 5 | M | Outcast, Peasant, Noble Court | 5 | 0 | 2 | — |
| `human.city-dweller.dramaturge` | `human.dramaturge` | Dramaturge | 4 | 5 | M | Outcast, Peasant, Noble Court | 5 | 0 | 1 | — |
| `human.city-dweller.performer` | `human.performer` | Performer | 3 | 5 | M | Villager, Outcast, Professional Soldier | 6 | 0 | 2 | — |
| `human.city-dweller.tinkerer` | `human.tinkerer` | Tinkerer | 7 | 8 | M | Villager, Peasant, Outcast | 5 | 0 | 2 | `2 pts: —` means two trait points with no listed mandatory trait |
| `human.city-dweller.coalman` | `human.coalman` | Coalman | 4 | 5 | — | Servitude, Peasant, Outcast, Professional Soldier | 4 | 0 | 2 | — |
| `human.city-dweller.seamstress` | `human.seamstress` | Seamstress | 5 | 10 | — | Villager, Peasant | 4 | 0 | 1 | — |
| `human.city-dweller.barkeep` | `human.barkeep` | Barkeep | 5 | 15 | — | Villager, Peasant | 4 | 0 | 1 | — |
| `human.city-dweller.shopkeeper` | `human.shopkeeper` | Shopkeeper | 6 | 16 | M | Villager, Peasant | 4 | 0 | **0** | Printed `Traits: —`; same family candidate as Villager Shopkeeper but row differs |
| `human.city-dweller.baker` | `human.baker` | Baker | 6 | 10 | — | Villager, Peasant | 5 | 0 | 1 | — |
| `human.city-dweller.alewife` | `human.alewife` | Alewife | 6 | 12 | P | Noble Court, Peasant, Villager | 5 | 0 | 1 | Character must be female |
| `human.city-dweller.conner` | `human.conner` | Conner | 6 | 12 | — | Noble Court, Peasant, Villager | 5 | 0 | 1 | — |
| `human.city-dweller.clerk` | `human.clerk` | Clerk | 4 | 9 | M | Villager, Outcast, Professional Soldier | 4 | 0 | 1 | Same family candidate as Villager Clerk; stat grant differs |
| `human.city-dweller.scribe` | `human.scribe` | Scribe | 7 | 10 | M | Villager, Peasant | 5 | 0 | 1 | Requires Student, Acolyte or Clerk |
| `human.city-dweller.accountant` | `human.accountant` | Accountant | 10 | 15 | M | Villager, Peasant | 4 | 0 | 1 | Requires Clerk, Young Lady or Student |
| `human.city-dweller.scholar` | `human.scholar` | Scholar | 10 | 15 | M | Villager, Outcast, Noble Court | 11 | 0 | 1 | Requires Scribe, Thinker, Archivist, Interpreter, Custodian, Bishop **or any sorcerous lifepath** |
| `human.city-dweller.moneylender` | `human.moneylender` | Moneylender | 8 | 20 | — | Villager, Peasant, Outcast | 4 | 0 | 1 | — |
| `human.city-dweller.tax-collector` | `human.tax-collector` | Tax Collector | 5 | 18 | M | Villager, Peasant, Outcast | 4 | 0 | 1 | May not be second lifepath; same family candidate as Villager Tax Collector, but grant differs |
| `human.city-dweller.taskmaster` | `human.taskmaster` | Taskmaster | 6 | 15 | M/P | Villager, Outcast, Professional Soldier | 5 | 0 | 1 | May not be second lifepath; same family candidate as Villager Taskmaster, but requirement differs by variant |
| `human.city-dweller.mercenary-captain` | `human.mercenary-captain` | Mercenary Captain | 5 | 15 | M/P | Professional Soldier, Seafaring, Outcast | 6 | 0 | 2 | Requires Sailor, Pirate or Knight |
| `human.city-dweller.city-guard` | `human.city-guard` | City Guard | 5 | 9 | P | Professional Soldier, Outcast | 5 | 0 | 1 | Strong `guard` semantic-tag candidate |
| `human.city-dweller.sergeant-at-arms` | `human.sergeant-at-arms` | Sergeant-at-Arms | 6 | 11 | P | Professional Soldier, Outcast | 6 | 0 | 1 | Requires any guard lifepath, Marine, First Mate, Foot Soldier, Freebooter, Squire, Man-at-Arms or Cavalryman |
| `human.city-dweller.guard-captain` | `human.guard-captain` | Guard Captain | 6 | 15 | M | Professional Soldier, Outcast, Noble Court | 6 | 0 | 1 | Requires Knight, Captain or any sergeant |
| `human.city-dweller.apprentice` | `human.apprentice` | Apprentice | 7 | 8 | P | Villager, Peasant, Professional Soldier, Seafaring | 6 | 0 | 2 | Same family candidate as Villager Apprentice; resource grant differs |
| `human.city-dweller.apprentice-artisan` | `human.apprentice-artisan` | Apprentice Artisan | 8 | 10 | P | Villager, Professional Soldier | 8 | 0 | 1 | Skill list contains structured `any smith skill` choice |
| `human.city-dweller.journeyman` | `human.journeyman` | Journeyman | 6 | 15 | M/P | Villager, Peasant, Professional Soldier, Seafaring | 7 | 0 | 1 | Requires Apprentice; same family candidate as Villager / Professional Soldier Journeyman |
| `human.city-dweller.engraver` | `human.engraver` | Engraver | 7 | 15 | P | Professional Soldier, Noble Court | 4 | 0 | 1 | Requires Journeyman |
| `human.city-dweller.saddler` | `human.saddler` | Saddler | 8 | 25 | M/P | Villager, Professional Soldier, Noble Court | 6 | 0 | 1 | Requires Journeyman; candidate `horse-related` tag |
| `human.city-dweller.armorer` | `human.armorer` | Armorer | 10 | 25 | — | Professional Soldier, Noble Court, Outcast | 7 | 0 | 1 | Requires Journeyman; same family candidate as Professional Soldier Armorer |
| `human.city-dweller.plumber` | `human.plumber` | Plumber | 7 | 20 | M | Noble Court, Outcast | 5 | 0 | 1 | Requires Journeyman |
| `human.city-dweller.locksmith` | `human.locksmith` | Locksmith | 8 | 13 | M | Peasant, Villager | 3 | 0 | 1 | Requires Journeyman |
| `human.city-dweller.jeweler` | `human.jeweler` | Jeweler | 9 | 20 | — | Villager, Peasant | 5 | 0 | 1 | Requires Journeyman |
| `human.city-dweller.gaol-warden` | `human.gaol-warden` | Gaol Warden | 4 | 15 | — | Outcast, Noble Court, Professional Soldier, Villager | 4 | 0 | 1 | Requires Born Noble, Merchant, Sergeant, Man-at-Arms or Judge |
| `human.city-dweller.advocate` | `human.advocate` | Advocate | 6 | 25 | M | Outcast, Noble Court, Villager | 6 | 0 | 1 | Requires Student or Young Lady |
| `human.city-dweller.doctor` | `human.doctor` | Doctor | 7 | 20 | M | Outcast, Noble Court, Villager | 6 | 0 | 2 | Requires Student or Young Lady |
| `human.city-dweller.physician` | `human.physician` | Physician | 5 | 15 | M | Noble Court, Professional Soldier, Peasant | 6 | 0 | 1 | Requires Midwife, Young Lady or Student |
| `human.city-dweller.hospital-warden` | `human.hospital-warden` | Hospital Warden | 4 | 15 | — | Outcast, Servitude, Religious | 5 | 0 | 2 | Requires any Noble, Noble Court or Religious lifepath (setting-membership alternatives) |
| `human.city-dweller.banker` | `human.banker` | Banker | 10 | 60 | — | Noble Court, Noble | 4 | 2 | 1 | Requires Merchant, Moneylender, Steward, Accountant or Chamberlain |
| `human.city-dweller.merchant` | `human.merchant` | Merchant | 6 | 30 | M | Villager, Peasant, Noble Court | 6 | 0 | **0** | Requires Master Craftsman, Master of Horses, Master of Hounds, Moneylender, Steward, Jeweler, Saddler, Armorer, Cobbler, Courtier or Chamberlain |
| `human.city-dweller.sorcerer` | `human.sorcerer` | Sorcerer | 6 | 32 | M+P | Villager, Outcast, Noble Court | 6 | 0 | 1 | Requires Neophyte Sorcerer, Arcane Devotee or Weather Witch; clear `sorcerous` candidate |
| `human.city-dweller.temple-priest` | `human.temple-priest` | Temple Priest | 5 | 20 | — | Any except Noble | 8 | 0 | 2 | Requires Religious Acolyte, Temple Acolyte or Military Order; clear `priest` candidate |
| `human.city-dweller.judge` | `human.judge` | Judge | 10 | 30 | M | Noble Court, Villager | 5 | 0 | 2 | Requires Town Official, Tax Collector, Bailiff or Justiciar |
| `human.city-dweller.municipal-minister` | `human.municipal-minister` | Municipal Minister | 9 | 30 | M | Villager, Noble Court, Outcast | 6 | 0 | **0** | Requires Town Official, Scholar, Priest, Bishop, Captain, Sea Captain, Artisan, Master Craftsman, Knight, Courtier or Master of Horses |
| `human.city-dweller.artisan` | `human.artisan` | Artisan | 10 | 45 | M | Professional Soldier, Noble Court | 9 | 0 | 1 | Requires Apprentice Artisan, Engineer or Master Craftsman |
| `human.city-dweller.master-craftsman` | `human.master-craftsman` | Master Craftsman | 10 | 45 | M+P | Villager, Noble Court, Professional Soldier | 6 | 3 | 2 | Requires Journeyman **and** one of Locksmith, Plumber, Engraver, Saddler, Blacksmith, Armorer, Atilliator, Cobbler, Bowyer or Taskmaster |
| `human.city-dweller.bishop` | `human.bishop` | Bishop | 12 | 60 | M | Noble Court, Religious | 5 | 0 | 1 | Requires Archpriest, Canon, Steward, Chamberlain **or** Your Grace trait |
| `human.city-dweller.magnate` | `human.magnate` | Magnate | 12 | 75 | M | Any | 6 | 1 | 2 | Requires Merchant or Master of Horses |
| `human.city-dweller.city-wife` | `human.city-wife` | City Wife | 6 | `5+` | M | Religious | 2 | 0 | 1 | Dynamic husband rule; see below |

**Count:** 70 verified City Dweller variants.

## City-specific requirement algebra confirmed

City Dweller exercises nearly every predicate type needed by the first engine slice:

- position range: Urchin = second or third;
- character property: Alewife = female;
- exact prior family alternatives;
- any prior lifepath from a setting: Duelist, Hospital Warden;
- semantic category: `any guard`, `any sergeant`, `any sorcerous`;
- trait alternative: Bishop can qualify through `Your Grace`;
- conjunction plus alternatives: Master Craftsman requires **Journeyman AND one of ...**;
- structured source metadata: Apprentice Artisan offers `any smith skill` in its skill list.

These should be represented as composable predicates (`allOf`, `anyOf`, setting membership, semantic tag, trait, position, etc.), not a proliferation of lifepath-name-specific booleans.

## Trait-point zero is now a required data state

City contains rows with printed `Traits: —`, notably:

- Shopkeeper;
- Merchant;
- Municipal Minister.

This is **not** the same as `Traits: 1 pt: —`, which means a trait-point grant with no named trait printed on the row.

The production schema therefore needs a numeric `traitPoints: 0` state independent of the listed-traits array.

## Semantic-tag fixtures

City provides direct consumers of semantic categories:

- Duelist and Sergeant-at-Arms consume `guard`;
- Guard Captain consumes `sergeant`;
- Scholar consumes `sorcerous`.

Strong first-slice tag candidates from visually audited rows include:

```text
guard: City Guard (at minimum)
sergeant: Village Sergeant, Corrupt Sergeant, Sergeant-at-Arms (candidate set; broader source audit still required)
priest: Village Priest, Venal Priest, Temple Priest (candidate set; broader source audit still required)
sorcerous: Neophyte Sorcerer, Sorcerer (at minimum; broader settings can add more)
horse-related: Groom, Farrier, Saddler (candidates, but Cavalryman's open category needs deliberate curation)
```

Do not turn this candidate list into fuzzy runtime matching. Final tag membership should be explicit fixture data and covered by tests.

## Same family, different variant behavior

City adds several strong reasons not to collapse same-name rows into one record. Examples include:

- Runner: City 3 years/7 Resources vs Villager 4 years/6 Resources;
- Pilgrim: City 2 years/3 Resources/+M vs Villager 2 years/4 Resources/no stat;
- Shopkeeper: City has +M and zero trait points; Villager has no stat and one trait point;
- Clerk: City has +M while Villager does not;
- Tax Collector: City has 18 Resources while Villager has 15;
- Apprentice: City has 8 Resources while Villager has 7;
- Master Craftsman: City and Villager differ in Resources and trait grants.

Repeat tracking can share `familyId`; row grants must always come from the selected `variantId`.

## City Wife special rule

City Wife has `5+` Resources. The husband is selected from the **City Dweller Setting**.

The printed note specifies:

- half of the husband's skill points, rounded down;
- **one quarter** of the husband's Resources.

Unlike Village Wife's note, the City Wife text does not explicitly add the phrase `including General points`. Do not silently generalize that phrase across Wife variants; the exact treatment of mixed husband point pools should be resolved from the Wife rule/source before production implementation.

Recommended source-faithful special-rule shell:

```ts
{
  kind: 'wifeDerivedGrant',
  husbandSettingId: 'human.city-dweller',
  skillFraction: 0.5,
  skillRounding: 'down',
  resourceFraction: 0.25,
}
```

## Data-quality assertions derived from this audit

The City production fixture should fail validation if any of the following occurs:

1. row count is not 70;
2. City Born's 4 points are ordinary instead of General;
3. Urchin is legal outside lifepath positions 2–3;
4. any `M/P` row is flattened to `M+P` or vice versa;
5. Shopkeeper, Merchant or Municipal Minister receive a trait point despite printed `Traits: —`;
6. Duelist's Outcast/Professional Soldier branches are modeled as semantic tags instead of setting membership;
7. `guard`, `sergeant` or `sorcerous` are inferred by substring matching;
8. Master Craftsman's `Journeyman AND one-of(...)` requirement loses its conjunction;
9. Bishop's Your Grace trait alternative is omitted;
10. Apprentice Artisan's `any smith skill` becomes a fake literal skill id;
11. City Wife's resource fraction is implemented as one half instead of one quarter;
12. similar but differently named Peddler rows are automatically merged into one family;
13. same-name family variants overwrite one another's setting-specific grants;
14. `Traits: —` and `1 pt: —` are represented identically.

## Next catalog chunk

The only remaining first-slice table is **Professional Soldier** (21 variants, PDF pages 189–191). After that pass, all 151 printed row variants will have a visually checked structural audit and Issue #6 can move from source verification into production-data encoding/integrity tests.
