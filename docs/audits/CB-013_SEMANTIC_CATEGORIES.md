# CB-013 — First-slice semantic lifepath categories

Status: **partially resolved; explicit project interpretations recorded**

Issue: #13

This note covers RAW requirements whose wording refers to a broad fictional category rather than an exact lifepath id or a setting membership test.

The goal is to prevent two opposite errors:

1. fuzzy runtime inference such as `name.includes('Guard')`;
2. over-restricting a broad RAW category because a particular career transition feels unusual.

Per D-010 and D-017, semantic membership is curated explicitly. Once a path is accepted as belonging to the category, the simulator does not add another generic biography-plausibility gate.

## `acolyte`

Accepted first-slice members:

| Lifepath | Basis |
| --- | --- |
| Villager `Acolyte` | source-obvious category member |
| Villager `Failed Acolyte` | accepted project interpretation |
| City Dweller `Temple Acolyte` | source-obvious category member |

`Failed Acolyte` is intentionally included despite the failed status: it is still an Acolyte lifepath for broad `any Acolyte LP` requirements in this project interpretation.

## `sergeant`

Accepted first-slice members:

- Villager `Village Sergeant`;
- Villager `Corrupt Sergeant`;
- City Dweller `Sergeant-at-Arms`;
- Professional Soldier `Sergeant`.

These are explicit curated members; rules code should query the tag rather than parse names.

## `guard`

Accepted first-slice members:

- City Dweller `City Guard`;
- City Dweller `Guard Captain` — accepted project interpretation.

`Guard Captain` is considered part of the broad guard category. Guard-adjacent occupations are not automatically included merely because their fiction involves custody/security; for example, `Gaol Warden` remains untagged unless separately justified.

## `horse-related`

Cavalryman RAW requires a prior lifepath “having to do with horses” and gives examples including Knight, Squire, Groom and Master of Horses. This is deliberately broader than an exact list.

Accepted first-slice members:

- Villager `Groom` — directly aligned with a RAW example;
- City Dweller `Groom` — directly aligned with a RAW example;
- Villager `Farrier` — accepted ordinary-language/category interpretation;
- City Dweller `Saddler` — accepted ordinary-language/category interpretation;
- Professional Soldier `Cavalryman` — accepted ordinary-language/category interpretation.

The category is intentionally inclusive for genuinely horse-focused lifepaths. The simulator does not reject a history merely because the resulting transition is unusual (for example a Groom later entering a martial horse-focused career). If RAW/category membership permits it, the player may explain the history in the fiction.

When future settings are added, source examples such as Knight, Squire and Master of Horses should be tagged explicitly during their own audit. Do not implement heuristics based on the word `Horse`, Riding skill presence, or similar proxies.

## `priest`

High-confidence first-slice members:

- Peasant `Itinerant Priest`;
- Villager `Village Priest`;
- Villager `Venal Priest`;
- City Dweller `Temple Priest`.

OPEN:

- whether Professional Soldier `Chaplain` itself should satisfy another consumer of `any priest lifepath`.

This is not equivalent to “any Religious-setting lifepath.” The source uses those as distinct kinds of prerequisite elsewhere.

## `sorcerous`

High-confidence candidates:

- City Dweller `Neophyte Sorcerer`;
- City Dweller `Sorcerer`;
- Professional Soldier `Wizard of War`.

OPEN:

- Peasant `Augur`;
- Peasant `Recluse Wizard`;
- any other magic-adjacent first-slice lifepath.

Do not collapse `sorcerous` into “contains Sorcery in its skill list” unless the source supports that equivalence. Peasant `Recluse Wizard` demonstrates that the rulebook can separately express a prerequisite as “a previous lifepath that contains the Sorcery skill,” so those predicates must remain distinct.

## `female-gender-specific`

The source uses a broad category for Midwife and gives `Lady` as an example outside the current slice.

OPEN first-slice membership includes questions around:

- Country Wife;
- Village Wife;
- City Wife;
- Serving Girl;
- Alewife;
- Midwife itself;
- other explicitly female-coded paths.

This category needs a deliberate follow-up rather than name inference.

## Implementation requirements

Production data should expose explicit semantic tags or equivalent curated metadata.

Rules may ask:

```ts
hasPriorLifepathWithTag(build, 'horse-related')
hasPriorLifepathWithTag(build, 'guard')
```

but must not infer membership dynamically from source/display names or skill strings.

Tests should include at least:

- Failed Acolyte satisfies `acolyte`;
- Guard Captain satisfies `guard`;
- Groom/Farrier/Saddler/Cavalryman satisfy `horse-related` according to the curated first-slice set;
- Gaol Warden does not gain `guard` merely through substring/fictional adjacency;
- unrelated Riding-bearing paths do not become `horse-related` through skill inference.

## Remaining work

Issue #13 remains open until `priest`, `sorcerous` and `female-gender-specific` first-slice membership is resolved or explicitly deferred with safe production behavior.
