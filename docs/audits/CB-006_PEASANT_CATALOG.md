# CB-006 — Peasant Setting catalog audit

Status: **visually verified source audit; production data not yet generated**

Issue: #6

Source: *Burning Wheel Gold Revised*, Human Lifepaths → Peasant Setting, printed pp. 163–164 (PDF pages 165–166).

This document records the first completed chunk of the 151-row first-slice catalog audit. The rendered source pages were checked visually; OCR was used only as an aid and is not treated as authoritative.

## Conventions used here

- `variantId` identifies one printed table row in one setting.
- `familyId` is the conceptual identity used by repeated-lifepath logic. For now, an exact repeated printed name may share a family across settings; non-identical names are **not** merged merely because they look similar.
- Canonical setting ids normalize table shorthands such as `Soldier` → Professional Soldier, `City` → City Dweller and `Court` → Noble Court.
- `stat: M+P` means the row grants both; it is distinct from an `M/P` player choice.
- Ordinary skill points and General skill points are kept separate.
- Full skill/trait lists are deliberately not reproduced here. Only grant totals and information needed by current legality/special-rule modeling are recorded.

## Verified rows

| variantId | familyId | Lifepath | Years | Res | Stat | Canonical Leads | Skill pts | General pts | Trait pts | Requirement / special rule |
| --- | --- | --- | ---: | ---: | --- | --- | ---: | ---: | ---: | --- |
| `human.peasant.born-peasant` | `human.born-peasant` | Born Peasant | 8 | 3 | — | Servitude, Professional Soldier, Seafaring, Religious | 0 | 3 | 2 | Born lifepath |
| `human.peasant.farmer` | `human.farmer` | Farmer | 8 | 5 | P | Villager, Professional Soldier, Servitude | 8 | 0 | 1 | — |
| `human.peasant.head-of-household` | `human.head-of-household` | Head of Household | 15 | 20 | M | Villager, Professional Soldier | 8 | 0 | 2 | May not be second lifepath |
| `human.peasant.midwife` | `human.midwife` | Midwife | 10 | 15 | M | Villager, Outcast | 7 | 0 | 2 | Prior female-gender-specific lifepath **or** Farmer **or** Itinerant Priest |
| `human.peasant.lazy-stayabout` | `human.lazy-stayabout` | Lazy Stayabout | 7 | 3 | — | Outcast, Servitude, Professional Soldier | 3 | 0 | 1 | — |
| `human.peasant.conscript` | `human.conscript` | Conscript | 1 | 4 | — | Servitude, Professional Soldier, Outcast | 2 | 0 | 1 | — |
| `human.peasant.peasant-pilgrim` | `human.peasant-pilgrim` | Peasant Pilgrim | 3 | 4 | — | Outcast, Servitude, Villager | 3 | 1 | 2 | — |
| `human.peasant.miller` | `human.miller` | Miller | 7 | 15 | — | Villager | 5 | 0 | 1 | — |
| `human.peasant.fisherman` | `human.fisherman` | Fisherman | 6 | 5 | P | Villager, Outcast, Seafaring | 6 | 0 | 2 | — |
| `human.peasant.shepherd` | `human.shepherd` | Shepherd | 4 | 4 | P | Villager, Outcast | 5 | 0 | 1 | — |
| `human.peasant.woodcutter` | `human.woodcutter` | Woodcutter | 5 | 5 | P | Villager, Outcast | 5 | 0 | 1 | — |
| `human.peasant.hunter` | `human.hunter` | Hunter | 5 | 6 | M+P | Villager, Outcast, Professional Soldier | 7 | 0 | 1 | Skill list contains a structured `Javelin or Bow` choice |
| `human.peasant.trapper` | `human.trapper` | Trapper | 5 | 8 | M+P | Villager, Outcast, Professional Soldier | 6 | 0 | 1 | — |
| `human.peasant.peddler` | `human.peddler` | Peddler | 5 | 10 | M | Villager, Servitude, City Dweller, Outcast | 7 | 0 | 2 | Do not merge with `Village Peddler` / `City Peddler` without explicit identity evidence |
| `human.peasant.elder` | `human.elder` | Elder | 15 | 5 | M | Villager, Outcast | 6 | 0 | 1 | Final/start-of-play age must be over 50; see D-012 |
| `human.peasant.augur` | `human.augur` | Augur | 5 | 10 | M | Servitude, Outcast | 4 | 0 | 2 | Midwife **or** Country Wife **or** (`female` **and** final total lifepaths ≤ 3) |
| `human.peasant.itinerant-priest` | `human.itinerant-priest` | Itinerant Priest | 6 | 8 | M | Villager, Outcast, City Dweller, Religious | 7 | 0 | 2 | Any prior Acolyte lifepath from any setting |
| `human.peasant.recluse-wizard` | `human.recluse-wizard` | Recluse Wizard | 15 | 28 | M | Outcast, Villager, City Dweller, Noble Court | 7 | 0 | 2 | Prior lifepath whose skill list contains Sorcery |
| `human.peasant.country-wife` | `human.country-wife` | Country Wife | 10 | `5+` | M+P | Religious | 2 | 0 | 1 | Dynamic husband rule; see below |

**Count:** 19 verified Peasant variants.

## Structured predicates required by this setting

Peasant alone already requires the schema to express:

```ts
// illustrative shapes, not final TypeScript
notPosition(2)
priorFamilyAnyOf([...])
priorSemanticTag('female-gender-specific')
characterGender('female')
finalLifepathCountAtMost(3)
finalStartingAgeGreaterThan(50)
priorSemanticTag('acolyte')
priorLifepathSkillListContains('sorcery')
```

The Augur condition is an important precedence fixture. It must parse as:

```text
Midwife
OR Country Wife
OR (female AND no more than three lifepaths total)
```

not as `(Midwife OR Country Wife OR female) AND <= 3`.

## Country Wife special rule

Country Wife is not representable with a scalar `resources = 5` and a fixed skill grant alone.

The printed row has `5+` Resources and a note that lets the player choose a husband's lifepath from the **Peasant Setting**. The wife may choose from that husband's skill list, receives half of his skill points **rounded down**, and receives half of his resource points.

Recommended data shape:

```ts
specialRules: [
  {
    kind: 'wifeDerivedGrant',
    husbandSettingId: 'human.peasant',
    skillFraction: 0.5,
    skillRounding: 'down',
    resourceFraction: 0.5,
  },
]
```

This is intentionally separate from D-013. D-013 governs the project's interpretation of odd halves under repeated-lifepath diminishing returns; Country Wife explicitly specifies round-down for the wife's derived skill points.

Open for later subsystem work: the exact UI for choosing the husband's path and which point types are inherited must be implemented from the wife rule, not guessed from the `5+` notation.

## Cross-setting identity evidence: Conscript

The Peasant row `Conscript` and the Villager row `Conscript` are visibly distinct table rows with different grants:

- Peasant Conscript: 1 year, 4 Resources, 2 skill points;
- Villager Conscript: 1 year, 5 Resources, 2 skill points.

They therefore require distinct `variantId`s. Because they have the exact same printed lifepath name, they are the first strong fixture for a shared conceptual `familyId = human.conscript` under the rule that diminishing returns can follow the same lifepath across a setting change.

This fixture should be used by catalog/engine tests rather than flattening the two records into one object.

## Semantic metadata status

Verified directly from Peasant requirements:

- `acolyte` is a semantic cross-setting requirement category used by Itinerant Priest.
- `female-gender-specific` is a semantic category used by Midwife.
- `prior skill-list contains Sorcery` is metadata/predicate based and should **not** be approximated by a `sorcerous` name match.

Still requires a broader catalog pass before production tagging is considered complete:

- exact membership of `female-gender-specific`;
- exact membership of `acolyte`;
- whether similarly named but non-identical paths should ever share a family id (for example Peddler / Village Peddler / City Peddler). Default is **do not merge without evidence**.

## Data-quality assertions derived from this audit

The Peasant production fixture should fail validation if any of the following occurs:

1. row count is not 19;
2. `Born Peasant` does not carry 3 General skill points separately from ordinary points;
3. `Peasant Pilgrim` does not carry 3 ordinary + 1 General skill point;
4. Hunter/Trapper `M+P` is mistaken for `M/P`;
5. Country Wife Resources are flattened from `5+` to numeric `5`;
6. Country Wife's explicit skill-half rounding is changed from down to the D-013 repeat rounding rule;
7. Peasant Conscript and Villager Conscript share a variant id or overwrite each other's grants;
8. `City` / `Soldier` / `Court` shorthands create duplicate setting records instead of canonical ids;
9. Augur's boolean requirement precedence is changed;
10. Recluse Wizard eligibility is inferred from the candidate/prior path name rather than prior skill-list metadata.

## Next catalog chunk

Continue Issue #6 with the **Villager Setting** (41 variants). That pass should also resolve the second Conscript variant and establish more family-id fixtures such as shared craft/professional names across settings.
