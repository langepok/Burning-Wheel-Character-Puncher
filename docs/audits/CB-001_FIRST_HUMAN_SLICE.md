# CB-001 — First Human Character Burner Slice Audit

Status: **Draft audit for Issue #1**

Purpose: define the rules and data constraints needed to implement the first Character Burner v2 lifepath slice without asking Codex to guess.

This document separates **RAW**, **project interpretation**, **product scope**, and **implementation recommendation**. Burning Wheel Gold Revised remains the rules source of truth.

## 1. Audited source ranges

Primary Character Burner rules:

- Character Burner → Choose Lifepaths / Born / Born Setting — p. 85
- Leads: Moving to a New Setting — p. 86
- Repeating Lifepaths: Law of Diminishing Returns — pp. 86–87
- Age / Stats — pp. 87–88
- Skills / Required Skill / Opening Skills / Advancing a Skill / General Skill Points — pp. 88–90

Human lifepath tables in the temporary product slice:

- Peasant Setting — pp. 165–166
- Villager Setting — pp. 167–171
- City Dweller Setting — pp. 172–179
- Professional Soldier Subsetting — pp. 189–191

The repository should not reproduce these tables verbatim. Data records must be manually checked against the source when imported because the OCR contains damaged names and formatting.

## 2. Product scope for the first playable slice

### Project decision

Initial Born choices exposed by the product:

- Born Peasant
- Village Born
- City Born

Supported lifepath areas:

- Peasant Setting
- Villager Setting
- City Dweller Setting
- Professional Soldier Subsetting

Professional Soldier is a reachable area. It does **not** gain an invented Born lifepath merely because it is supported by the product.

Leads to settings outside this slice still exist in RAW. The product must distinguish:

- `LEGAL_AND_SUPPORTED`
- `LEGAL_BUT_OUT_OF_SCOPE`
- `ILLEGAL_BY_RULE`

An out-of-scope destination must never be explained to the player as though Burning Wheel forbids it.

## 3. Lifepath sequence rules

### RAW — first lifepath

The first lifepath must be a Born lifepath, and that Born path establishes the starting setting. After the Born path, the character can choose lifepaths in that setting in any order subject to requirements/restrictions. Source: p. 85.

### Project interpretation — Born only once

The book explicitly says the **first** lifepath must be Born and describes Born as birth/childhood. It does not separately state, in the same passage, a literal global sentence saying “a Born lifepath may never be selected later.” The general repetition rule is broadly worded.

For this project, the accepted interpretation is:

> A character has exactly one Born lifepath, at index 0. All Born lifepaths are illegal after that.

This is a deliberate project interpretation and must not be mislabeled as a direct quotation of RAW.

Recommended rejection reason:

`BORN_LIFEPATH_NOT_FIRST`

## 4. Settings and Leads

### RAW

A character may remain in the current setting without paying a Lead year. A Lead listed on the last lifepath allows movement to another setting. Taking that Lead adds exactly one year to starting age. Once in the destination setting, lifepaths there may be selected subject to requirements/restrictions. Source: p. 86.

### Canonical setting identifiers

The printed tables use abbreviations and naming variants. The data layer should canonicalize them rather than treating them as distinct settings.

Minimum aliases relevant to this slice:

| Printed/table label | Canonical id |
| --- | --- |
| Peasant | `human.peasant` |
| Villager / Village | `human.villager` |
| City / City Dweller | `human.city-dweller` |
| Soldier | `human.professional-soldier` |

Out-of-scope destinations such as Servitude, Outcast, Seafaring, Religious, Noble and Court should still receive stable canonical ids even before their data tables are implemented.

### Lead representation cannot be only `string[]`

Some Leads are open predicates rather than fixed lists, for example “Any,” “Any except Noble,” or “Any except Noble and Court.” Therefore the schema should support at least:

```ts
type LeadRule =
  | { kind: 'to'; settingIds: SettingId[] }
  | { kind: 'any' }
  | { kind: 'anyExcept'; excludedSettingIds: SettingId[] }
```

A UI may present a Lead and lifepath choice together, but the domain must preserve the transition because it changes age and must be reversible.

### Recommended state history

Implementation recommendation, not RAW:

```ts
type BurnEvent =
  | { type: 'lifepath'; lifepathId: LifepathId }
  | {
      type: 'lead';
      sourceLifepathId: LifepathId;
      fromSettingId: SettingId;
      toSettingId: SettingId;
      years: 1;
    }
```

This makes age, current setting and rollback deterministic.

## 5. Age

### RAW

Starting age is:

`sum(lifepath Time) + 1 year for each Lead taken`

Source: p. 87.

### Implementation consequences

Age should be derived from history rather than maintained as an independently editable counter.

Required invariant:

`select / transition / undo` must be exactly reversible.

No Lead year is added merely for staying in the current setting.

## 6. Stat-pool inputs from lifepaths

### RAW

Base mental/physical stat pools are determined from the stock age chart. Lifepath stat modifiers are then added. Source: pp. 87–88.

Table notation relevant to data modeling includes:

- `+1 M` — one mental point
- `+1 P` — one physical point
- `+1 M/P` — one point allocated to either mental or physical
- `+1 M, P` — one point to both pools

### Data consequence

Do not flatten every stat grant into fixed `mentalDelta` / `physicalDelta`; `M/P` requires a player choice.

Suggested shape:

```ts
type StatGrant =
  | { kind: 'fixed'; mental: number; physical: number }
  | { kind: 'choose'; amount: number; choices: ('mental' | 'physical')[] }
```

Negative deltas exist elsewhere in Human lifepaths, so the numeric representation should permit negative values even if the first slice does not immediately exercise them.

Exact Human age-chart values are a Phase CB-2 data task and are not silently invented in this audit.

## 7. Repeating lifepaths

### RAW

Lifepaths can repeat, subject to diminishing returns. Source: pp. 86–87.

The second occurrence grants normal time/resources/stat/skill points, while changing which skill/trait becomes required. Third and fourth+ occurrences reduce or remove several grants while time continues to accrue.

### Implementation consequence

A lifepath record should describe its base grants. Effective grants are calculated from occurrence count by the rules layer.

Do not mutate or duplicate catalog records for “second Farmer,” “third Farmer,” etc.

### OPEN — halving and rounding

The audited paragraph says later repetitions receive half of certain point grants, but the extracted passage does not specify the rounding rule for odd values. Do not guess. Before implementing repeated-point grants, verify the applicable rounding convention in the source.

M1 lifepath legality may support repeated selections before M2/M3/M4 grant accounting is complete, but grant calculation tests must wait for this question to be resolved.

## 8. Requirements and restrictions are not one simple field

The four supported tables already contain several distinct predicate forms. The rules engine needs a composable requirement model.

### Observed predicate classes

1. **Position restrictions**
   - not second lifepath;
   - must be second;
   - must be second or third.

2. **One-time restriction**
   - may only be taken once.

3. **Prior specific lifepath: any-of**
   - examples use lists such as “A, B or C.”

4. **Prior setting/category membership**
   - any Soldier lifepath;
   - any guard lifepath;
   - any priest lifepath;
   - any sorcerous lifepath.

5. **Counted prior requirement**
   - e.g. two occurrences of a named lifepath.

6. **Prior lifepath data requirement**
   - e.g. a previous lifepath that contains a particular skill.

7. **Age/final-character requirement**
   - e.g. character must start the game above a threshold.

8. **Total lifepath-count restriction**
   - e.g. no more than a specified total number of lifepaths.

9. **Gender-related requirement/restriction**
   - appears in supported tables.

10. **Semantic/open category**
   - e.g. a prior lifepath “having to do with horses,” followed by examples.

### Recommended requirement algebra

```ts
type Requirement =
  | { kind: 'allOf'; items: Requirement[] }
  | { kind: 'anyOf'; items: Requirement[] }
  | { kind: 'priorLifepath'; lifepathIds: LifepathId[]; minCount?: number }
  | { kind: 'priorSetting'; settingIds: SettingId[]; minCount?: number }
  | { kind: 'priorTag'; tag: string; minCount?: number }
  | { kind: 'priorLifepathContainsSkill'; skillId: SkillId }
  | { kind: 'position'; allowed?: number[]; disallowed?: number[] }
  | { kind: 'maxOccurrences'; value: number }
  | { kind: 'startingAge'; minExclusive?: number; minInclusive?: number }
  | { kind: 'maxTotalLifepaths'; value: number }
  | { kind: 'gender'; value: 'female' | 'male' }
  | { kind: 'custom'; ruleId: string }
```

The `custom` escape hatch is acceptable only for audited special cases. It must not become the default way to encode ordinary requirements.

### Important distinction: path metadata vs purchased abilities

A requirement such as “a previous lifepath that contains Sorcery” refers to the previous lifepath's listed content, not necessarily to whether the player later spent points to open Sorcery. Requirement evaluation therefore needs access to lifepath catalog metadata as well as character purchase state.

## 9. Selection-time legality vs final-build validity

The supported tables include restrictions that can depend on the **final** build, not only the past at the moment a path is clicked.

Examples include a lifepath that requires the character to **start the game** above an age threshold, and a path that is only permitted when the character has no more than a certain total number of lifepaths.

### Implementation recommendation

Do not force every rule into `canSelectNext()`.

Use two levels:

```ts
canSelectNext(build, candidate): RuleResult
validateBuild(build): ValidationResult[]
```

- `canSelectNext` handles facts knowable from current history and candidate position.
- `validateBuild` handles global/final constraints that later selections can invalidate.

### OPEN — timing of final-age requirements

The source wording for final starting-age requirements does not, in the audited text, fully resolve whether the UI should block early selection or allow it provisionally and require validity at burn completion.

Do not guess. For v2, the safest teaching behavior is to mark such a path as **conditionally valid / pending final validation** until this is explicitly decided.

## 10. Skills during character burning

### RAW — point pools and skill list

General skill points are separated from ordinary lifepath skill points. Ordinary lifepath skill points may be spent only on skills made available by selected lifepaths. Source: pp. 88–90.

A lifepath can grant both ordinary skill points and General points. Therefore the data model needs separate grants; a single `skillPoints` integer is insufficient.

Suggested shape:

```ts
skillPointGrant: {
  lifepath: number;
  general: number;
}
```

### RAW — required skill

The first skill listed on a lifepath is required. If already open from an earlier path, the next listed skill becomes required, and so on. Required means it must be opened; it need not be advanced. Source: p. 89.

### RAW — opening standard skills

A standard skill costs 1 point to open. Starting exponent is half the root rounded down; for two roots use half the average of the roots, rounded down. Source: p. 89.

### RAW — training and special skills

Training skills cost 2 points to open and have no exponent. Other explicitly special skills may also use special opening costs. Source: pp. 89–90 and individual entries.

### RAW — character-burning advancement

One point increases an opened skill by one exponent during character burning. Source: p. 90.

### RAW — General vs lifepath point provenance

General points may open/advance unrestricted skills. Ordinary lifepath points are limited to the lifepath-derived list. A skill opened with General points may not then be advanced with ordinary lifepath points. Source: p. 90.

### Implementation consequence

Every open/increment transaction must record its payment source. Refund cannot be calculated only from current exponent.

## 11. Special data shapes already present in the supported tables

The first slice is intentionally broad enough to expose real Character Burner complexity.

### Dynamic wife lifepaths

Country Wife, Village Wife and City Wife include rules that derive additional skill/resource options from a husband's chosen lifepath. These are not representable as a fixed numeric grant alone.

Do not flatten `5+` resource notation to `5` and discard the special rule.

For M1, the lifepath may exist in the catalog and participate in selection. Its dynamic skill/resource effect can remain a named deferred special rule until M3/M4.

Suggested representation:

```ts
specialRules: ['country-wife-husband-benefits']
```

with audited handlers added when the relevant subsystem is implemented.

### Multiple skill-point pools on one lifepath

Some supported lifepaths grant ordinary skill points plus General points in the same row. Store them separately.

### Open-ended semantic requirements

Requirements such as “horse-related lifepath” should be represented by an audited tag (for example `horse-related`) assigned to qualifying lifepaths, not by fuzzy string matching at runtime.

## 12. Minimum fixture set for implementation tests

The product data target is **all lifepaths in the four supported areas**. The list below is only the minimum test-fixture set needed to exercise distinct rule forms.

| Fixture | Source | Why it belongs in tests |
| --- | --- | --- |
| Born Peasant | p. 165 | Born start, General points, immediate Leads |
| Farmer | p. 165 | fixed +P grant, Lead into Villager/Soldier |
| Head of Household | p. 165 | “not second” restriction |
| Midwife | p. 165 | any-of prior requirement including category-like condition |
| Elder | p. 166 | final starting-age requirement |
| Augur | p. 166 | prior requirement plus max-total-lifepaths condition |
| Recluse Wizard | p. 166 | prior lifepath contains-skill requirement |
| Village Born | p. 167 | second supported Born branch |
| Kid | p. 167 | must be second, once-only, broad Lead predicate |
| Miner | p. 168 | ordinary any-of prior requirement |
| Village Tough | p. 169 | feeds later Soldier/Villager prerequisites |
| Village Sergeant | p. 169 | any-of prior requirement, M/P choice |
| Apprentice | p. 170 | prerequisite chain anchor |
| Journeyman | p. 170 | prerequisite chain continuation |
| City Born | p. 172 | third supported Born branch |
| Urchin | p. 172 | second-or-third position restriction, Soldier/Villager Leads |
| Duelist | p. 172 | mixed specific-path/category requirement |
| Student | p. 173 | broad skill list / prerequisite anchor |
| City Guard | p. 175 | guard category and Soldier Lead |
| Sergeant-at-Arms | p. 176 | guard/soldier prerequisite fan-in |
| Foot Soldier | p. 189 | core Professional Soldier path |
| Sergeant | p. 190 | cross-setting prerequisite from Village Tough/City Guard/Foot Soldier |
| Cavalryman | p. 190 | semantic horse-related prerequisite |
| Engineer | p. 190 | cross-setting prerequisite chain |
| Captain | p. 191 | OR + counted prior requirement |

## 13. Test matrix for M1

### Starting state

- new Human burn exposes Born Peasant, Village Born and City Born;
- non-Born candidate at index 0 → `FIRST_LIFEPATH_MUST_BE_BORN`;
- unsupported Human Born path can be represented as product-out-of-scope rather than RAW-illegal if surfaced by a broader catalog later.

### Born exclusivity

For each supported Born path:

- select it at index 0 → legal;
- inspect all later states and transitions → every Born candidate rejected with `BORN_LIFEPATH_NOT_FIRST`.

### Current setting

- after Born Peasant with no Lead, Peasant paths are evaluated in current setting;
- after Village Born with no Lead, Villager paths are evaluated in current setting;
- after City Born with no Lead, City Dweller paths are evaluated in current setting.

### Leads

- Born Peasant → Soldier Lead → Professional Soldier current setting, +1 year;
- Farmer → Villager Lead → Villager current setting, +1 year;
- a supported path with an out-of-scope Lead returns `LEGAL_BUT_OUT_OF_SCOPE` for that destination;
- staying in setting adds 0 Lead years;
- undo Lead subtracts exactly one year and restores previous setting.

### Requirements/restrictions

- Head of Household rejected at position 2;
- Kid allowed only at position 2 and only once;
- City Urchin allowed only at positions 2 or 3;
- Miner rejected without one of its audited prerequisites;
- Sergeant becomes eligible from an audited qualifying prior path;
- Cavalryman checks a curated semantic tag rather than string matching;
- Captain counted prerequisite handles the “two occurrences” branch.

### Final validation

- a final-age requirement can remain pending until burn completion if the project adopts provisional validation;
- max-total-lifepath restrictions are revalidated after later additions;
- final invalidity never silently mutates or deletes the player’s history.

### Age and rollback

- age = selected path years + Lead years;
- each event contributes exactly once;
- select → undo returns byte-for-byte equivalent domain state where practical;
- repeated undo/redo cannot create or destroy years.

## 14. Data-import validation

Before declaring the four setting tables complete, add automated catalog checks:

1. unique stable lifepath ids;
2. valid canonical setting ids;
3. every Lead destination resolves to a known canonical setting id even if out of product scope;
4. every specific prior-lifepath reference resolves;
5. every skill/trait reference resolves once those catalogs exist;
6. Born records are explicitly flagged;
7. position/count restrictions are structured, not preserved only as prose;
8. special rules are named and discoverable;
9. raw page reference is stored for auditability;
10. OCR text is never treated as authoritative without source verification.

## 15. Remaining open questions

These are explicitly **not** guessed:

1. exact rounding convention for halved grants under repeated lifepaths when the value is odd;
2. UI/validation timing for requirements expressed in terms of final starting age;
3. complete curated membership of semantic categories such as `horse-related`, `guard`, `priest` and `sorcerous` across the supported catalog;
4. exact special-rule implementation for Country Wife, Village Wife and City Wife, deferred until Skills/Resources milestones;
5. exact Human age-chart values, deferred to CB-2;
6. gray/white shade edge cases, deferred until the feature is intentionally exposed.

None of these open items blocks repository bootstrap. Items 1–3 must be resolved before code that depends on them is declared rules-complete.
