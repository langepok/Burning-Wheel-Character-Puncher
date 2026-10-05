# CB-013 — First-slice semantic lifepath categories

Status: **resolved for the current first-slice catalog**

Issue: #13

This note covers RAW requirements whose wording refers to a broad fictional category rather than an exact lifepath id or a setting-membership test.

The goal is to prevent two opposite errors:

1. fuzzy runtime inference such as `name.includes('Guard')`;
2. over-restricting a broad RAW category because a particular career transition feels unusual.

Per D-010 and D-017, semantic membership is curated explicitly. Once a path is accepted as belonging to the category, the simulator does not add another generic biography-plausibility gate.

The lists below are **first-slice content metadata**, not claims that these categories are globally complete across all Human lifepaths.

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

`Guard Captain` is considered part of the broad guard category. Guard-adjacent occupations are not automatically included merely because their fiction involves custody/security; for example, `Gaol Warden` remains untagged.

## `horse-related`

Cavalryman RAW requires a prior lifepath “having to do with horses” and gives examples including Knight, Squire, Groom and Master of Horses. This is deliberately broader than an exact list.

Accepted first-slice members:

- Villager `Groom` — directly aligned with a RAW example;
- City Dweller `Groom` — directly aligned with a RAW example;
- Villager `Farrier` — accepted ordinary-language/category interpretation;
- City Dweller `Saddler` — accepted ordinary-language/category interpretation;
- Professional Soldier `Cavalryman` — accepted ordinary-language/category interpretation.

The category is intentionally inclusive for genuinely horse-focused lifepaths. The simulator does not reject a history merely because the resulting transition is unusual. If category membership permits it, the player may explain the history in the fiction.

When future settings are added, source examples such as Knight, Squire and Master of Horses should be tagged explicitly during their own audit. Do not implement heuristics based on the word `Horse`, Riding skill presence, or similar proxies.

## `priest`

Accepted first-slice members:

- Peasant `Itinerant Priest` — source-obvious;
- Villager `Village Priest` — source-obvious;
- Villager `Venal Priest` — source-obvious;
- City Dweller `Temple Priest` — source-obvious;
- Professional Soldier `Chaplain` — accepted project interpretation.

The source separately uses both “any priest lifepath” and “any Religious-setting lifepath”, so these remain distinct predicates. `Chaplain` is included because it is itself a priestly office/role; this is a semantic interpretation, not a claim that the book explicitly enumerates Chaplain inside a global priest list.

## `sorcerous`

Accepted first-slice members:

- Peasant `Augur` — accepted project interpretation;
- Peasant `Recluse Wizard` — accepted project interpretation;
- City Dweller `Neophyte Sorcerer` — source-obvious;
- City Dweller `Sorcerer` — source-obvious;
- Professional Soldier `Wizard of War` — accepted project interpretation.

The category is intentionally semantic and broader than literal name matching. `Augur` is included because the path is explicitly magical/divinatory and grants Sorcery; `Recluse Wizard` and `Wizard of War` are plainly sorcerous careers despite using different titles.

Do **not** collapse this tag into “contains Sorcery in its skill list.” The source can separately express a requirement as “a previous lifepath that contains the Sorcery skill” (for Recluse Wizard), so `sorcerous` and `skill-list-contains-sorcery` remain distinct predicates.

Likewise, the presence of Astrology, Enchanting or another occult-adjacent skill alone does not automatically create `sorcerous` membership.

## `female-gender-specific`

The Midwife prerequisite explicitly refers to “any female gender-specific lifepath” and gives `Lady` as an example outside the current slice.

Accepted first-slice members:

- Peasant `Midwife` — accepted semantic interpretation;
- Peasant `Country Wife` — source/role-obvious;
- Villager `Serving Girl` — accepted semantic interpretation;
- Villager `Village Wife` — source/role-obvious;
- City Dweller `Alewife` — source explicitly restricts the character to female;
- City Dweller `City Wife` — source/role-obvious.

This tag represents lifepaths whose role/title is specifically female in the fiction of the source, not occupations that are merely stereotypically or historically female-coded. Therefore paths such as `Seamstress` are **not** included solely on cultural association.

When future settings are added, female-specific paths such as `Lady`/`Young Lady` should be audited explicitly rather than inferred from arbitrary naming heuristics.

## Implementation requirements

Production data should expose explicit semantic tags or equivalent curated metadata.

Rules may ask:

```ts
hasPriorLifepathWithTag(build, 'horse-related')
hasPriorLifepathWithTag(build, 'guard')
hasPriorLifepathWithTag(build, 'priest')
```

but must not infer membership dynamically from source/display names or skill strings.

Tests should include at least:

- Failed Acolyte satisfies `acolyte`;
- Guard Captain satisfies `guard`;
- Groom/Farrier/Saddler/Cavalryman satisfy `horse-related` according to the curated first-slice set;
- Chaplain satisfies `priest`;
- Augur/Recluse Wizard/Neophyte Sorcerer/Sorcerer/Wizard of War satisfy `sorcerous`;
- Midwife/Country Wife/Serving Girl/Village Wife/Alewife/City Wife satisfy `female-gender-specific`;
- Gaol Warden does not gain `guard` merely through fictional adjacency;
- Seamstress does not gain `female-gender-specific` merely through cultural association;
- unrelated Riding-bearing paths do not become `horse-related` through skill inference;
- a path containing Sorcery does not become `sorcerous` automatically unless it is explicitly curated.

## Result

Issue #13 is resolved for Peasant, Villager, City Dweller and Professional Soldier. Future catalog expansions must extend the semantic-tag audit alongside their content rather than treating this first-slice list as globally complete.
