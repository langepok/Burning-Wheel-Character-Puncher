# CB-006 — Professional Soldier Subsetting catalog audit

Status: **visually verified source audit; production data not yet generated**

Issue: #6

Source: *Burning Wheel Gold Revised*, Human Lifepaths → Professional Soldier Subsetting, printed pp. 187–189 (PDF pages 189–191).

All three rendered source pages were checked visually. OCR was used only as an aid.

Conventions follow the other CB-006 audit docs.

## Verified rows

| variantId | familyId | Lifepath | Years | Res | Stat | Canonical Leads | Skill pts | General pts | Trait pts | Requirement / special rule |
| --- | --- | --- | ---: | ---: | --- | --- | ---: | ---: | ---: | --- |
| `human.professional-soldier.runner` | `human.runner` | Runner | 3 | 5 | P | Villager, Peasant, Servitude, Outcast | 4 | 0 | 2 | Same family candidate as City/Villager Runner; row grants differ |
| `human.professional-soldier.apprentice` | `human.apprentice` | Apprentice | 4 | 6 | P | City Dweller, Peasant, Villager | 6 | 0 | 2 | Same family candidate as City/Villager Apprentice |
| `human.professional-soldier.musician` | `human.musician` | Musician | 3 | 5 | M | Villager, Peasant, Servitude | 4 | 0 | 1 | — |
| `human.professional-soldier.foot-soldier` | `human.foot-soldier` | Foot Soldier | 3 | 6 | P | Outcast, Villager, Servitude | 6 | 0 | 1 | Professional Soldier prerequisite fixture used elsewhere |
| `human.professional-soldier.archer` | `human.archer` | Archer | 3 | 5 | P | Outcast, Villager, Servitude | 5 | 0 | 1 | — |
| `human.professional-soldier.crossbowman` | `human.crossbowman` | Crossbowman | 4 | 8 | P | Outcast, Villager, Servitude | 6 | 0 | 1 | — |
| `human.professional-soldier.sailor` | `human.sailor` | Sailor | 5 | 5 | P | Seafaring, Outcast, Villager, Servitude | 6 | 0 | 1 | Same family candidate as City/Villager Sailor; skill list differs |
| `human.professional-soldier.herald` | `human.herald` | Herald | 3 | 7 | M | Villager, Servitude, Noble Court | 4 | 0 | 1 | — |
| `human.professional-soldier.bannerman` | `human.bannerman` | Bannerman | 3 | 7 | P | Villager, Servitude, Noble Court | 5 | 0 | 2 | — |
| `human.professional-soldier.scout` | `human.scout` | Scout | 3 | 4 | P | Peasant, Servitude, Outcast | 5 | 0 | 1 | — |
| `human.professional-soldier.sergeant` | `human.sergeant` | Sergeant | 5 | 8 | M/P | Villager, Servitude, Noble Court | 6 | 0 | 1 | Requires Squire, Village Tough, City Guard or Foot Soldier; clear `sergeant` tag candidate |
| `human.professional-soldier.veteran` | `human.veteran` | Veteran | 8 | 20 | — | Outcast, Noble Court | 5 | 0 | 2 | Requires Sergeant, Sergeant-at-Arms, Knight, Military Order or Freebooter |
| `human.professional-soldier.cavalryman` | `human.cavalryman` | Cavalryman | 4 | 9 | P | Villager, Servitude, Noble Court | 10 | 0 | 1 | Requires prior lifepath having to do with horses; examples include Knight, Squire, Groom, Master of Horses |
| `human.professional-soldier.journeyman` | `human.journeyman` | Journeyman | 5 | 15 | M/P | Villager, Peasant, Outcast | 5 | 0 | 1 | Requires Apprentice; same family candidate as City/Villager Journeyman |
| `human.professional-soldier.armorer` | `human.armorer` | Armorer | 8 | 20 | M | City Dweller, Villager, Outcast | 9 | 0 | 1 | Requires Journeyman; same family candidate as City Armorer |
| `human.professional-soldier.atilliator` | `human.atilliator` | Atilliator | 10 | 22 | P | Noble Court, City Dweller, Outcast | 6 | 0 | 1 | Requires Journeyman |
| `human.professional-soldier.chaplain` | `human.chaplain` | Chaplain | 5 | 15 | M/P | Outcast, City Dweller, Seafaring, Noble Court, Religious | 6 | 0 | 1 | Requires any priest lifepath **or** Military Order; clear `priest`-consumer fixture |
| `human.professional-soldier.engineer` | `human.engineer` | Engineer | 5 | 18 | M | City Dweller, Noble Court, Outcast | 6 | 0 | 1 | Requires Student, Engineer, Mining Engineer or Artillerist's Hand; preserve exact printed alternatives pending family-resolution audit |
| `human.professional-soldier.wizard-of-war` | `human.wizard-of-war` | Wizard of War | 4 | 20 | M | City Dweller, Noble Court, Outcast | 7 | 0 | 1 | Requires Neophyte Sorcerer, Arcane Devotee, Weather Witch, Rogue Wizard or Mad Summoner; `sorcerous` candidate |
| `human.professional-soldier.quartermaster` | `human.quartermaster` | Quartermaster | 5 | 17 | M | Villager, City Dweller, Noble Court | 6 | 0 | 1 | Requires Sergeant, Veteran, Steward, Ship's Captain, Captain of the Guard, Merchant, Man-at-Arms, Smuggler, Constable or Lord |
| `human.professional-soldier.captain` | `human.captain` | Captain | 6 | 35 | M+P | Any except Noble | 9 | 0 | 2 | Requires Captain of the Guard, Knight, Lord, Constable **or two Freebooter lifepaths** |

**Count:** 21 verified Professional Soldier variants.

## No Born path in Professional Soldier

The printed Professional Soldier table begins with Runner and contains no Born lifepath. This confirms the current product decision not to invent a `Soldier Born` option.

Professional Soldier is reached through Leads from other settings/subsettings.

## Horse-related requirement is genuinely semantic

Cavalryman is the strongest first-slice evidence that some prerequisites cannot be reduced to exact ids or setting membership. Its requirement is framed as a **prior lifepath having to do with horses**, followed by examples rather than an exhaustive list.

The production model therefore needs explicit curated semantic metadata such as:

```ts
tags: ['horse-related']
```

Runtime string matching (`name.includes('Horse')`, checking for Riding, etc.) would silently invent membership and is not acceptable.

The examples provide high-confidence members such as Knight, Squire, Groom and Master of Horses, but the final membership set should be curated deliberately across the Human catalog.

## Counted-prior-path requirement

Captain requires one of several named prior paths **or two Freebooter lifepaths**.

This confirms that the requirement algebra needs counted occurrences, for example:

```ts
anyOf([
  priorFamily('captain-of-the-guard'),
  priorFamily('knight'),
  priorFamily('lord'),
  priorFamily('constable'),
  priorFamilyCountAtLeast('freebooter', 2),
])
```

The exact id/family mapping for `Captain of the Guard` remains a data-resolution matter; do not silently substitute City `Guard Captain` merely because the phrases are similar.

## Cross-setting repeat fixtures completed by Professional Soldier

This table completes several same-name families inside the current first-slice scope:

- Runner — Villager / City Dweller / Professional Soldier;
- Apprentice — Villager / City Dweller / Professional Soldier;
- Sailor — Villager / City Dweller / Professional Soldier;
- Journeyman — Villager / City Dweller / Professional Soldier;
- Armorer — City Dweller / Professional Soldier.

Each family contains setting-specific row data. `familyId` is for repeat/requirement identity; `variantId` remains the source of the selected row's grants, Leads and local metadata.

## Semantic-tag consumers/candidates

Professional Soldier contributes:

- `Sergeant` as a clear `sergeant` candidate;
- Chaplain as a consumer of `priest`;
- Cavalryman as a consumer of `horse-related`;
- Wizard of War as a strong `sorcerous` candidate.

Together with City/Villager rows, the first-slice schema now has concrete use cases for every semantic category identified during CB-001 except the broader global membership sets, which still need deliberate fixture curation rather than fuzzy matching.

## Data-quality assertions derived from this audit

The Professional Soldier production fixture should fail validation if any of the following occurs:

1. row count is not 21;
2. a Soldier Born row is invented;
3. same-name Runner/Apprentice/Sailor/Journeyman/Armorer variants overwrite rows from other settings;
4. Sergeant/Journeyman/Chaplain `M/P` is flattened to `M+P`;
5. Captain's `M+P` is flattened to `M/P`;
6. Cavalryman's horse-related prerequisite is implemented by runtime text/skill guessing;
7. Captain loses the `two Freebooter lifepaths` counted alternative;
8. `Captain of the Guard` is silently replaced with `Guard Captain` without an audited identity decision;
9. Chaplain's `any priest lifepath` is confused with Religious-setting membership;
10. Engineer's unusual printed prerequisite alternatives are “corrected” without source support.

## First-slice structural audit complete

With this file, all four temporary first-slice areas have been visually checked at the structural row level:

- Peasant: 19;
- Villager: 41;
- City Dweller: 70;
- Professional Soldier: 21.

**Total: 151 / 151 printed row variants structurally audited.**

The next phase of Issue #6 is no longer source discovery. It is production-data encoding plus catalog-integrity tests, with any unresolved family/tag membership kept explicit rather than guessed.
