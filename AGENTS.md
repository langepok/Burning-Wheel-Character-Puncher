# AGENTS.md

This file applies to the entire repository unless a more specific nested `AGENTS.md` overrides it.

## Mission

Build a web-based training simulator for Burning Wheel Gold Revised, beginning with a rules-accurate Character Burner and later expanding to equipment and conflict training.

## Source-of-truth order

When sources disagree, use this order and stop if the conflict is unresolved:

1. **Burning Wheel Gold Revised source material** available through the associated ChatGPT Project.
2. **Explicit durable decisions** in `docs/DECISIONS.md`.
3. **Verified rules paraphrases** in `docs/RULES_NOTES.md`.
4. **Acceptance criteria** in `docs/ACCEPTANCE_CRITERIA.md` and the active issue/PR.
5. Existing implementation behavior.

Do not invent a rule to make implementation easier. If the rulebook is ambiguous or unavailable, document the ambiguity and ask for a decision rather than guessing.

## Rules vs interpretation vs UX

Every non-trivial behavior should be classifiable as one of:

- **RAW** — directly supported by the rulebook;
- **Interpretation** — a chosen reading where RAW leaves ambiguity;
- **Project/UX decision** — presentation, workflow or temporary scope not dictated by RAW.

Do not present a UX decision as a Burning Wheel rule.

## Architecture constraints

Keep these layers separate:

- `data/`: declarative game data such as stocks, settings, lifepaths, skill metadata and requirements;
- `rules/`: pure rules evaluation and calculations;
- `character/` or `state/`: character state, commands/transactions and rollback;
- `ui/`: React presentation and interaction;
- `tests/`: behavior and regression coverage.

Rules code must not depend on React. UI components must not encode eligibility rules themselves.

Prefer functions of the form:

```ts
canChooseLifepath(character, lifepath, catalog)
applyLifepath(character, lifepath, catalog)
calculateAge(character)
openSkill(character, skill, pointSource)
```

rather than component-local conditionals.

## Data-driven design

Do not hard-code individual lifepath behavior in UI components when the behavior can be represented as data or a generic rule.

Requirements, restrictions, Leads, years, skill points, trait points, stat bonuses and similar properties should be declarative wherever practical.

The temporary human slice covers Peasant, Villager, City Dweller and Professional Soldier data/rules, but the schema and rules engine must not assume those are the only settings that can ever exist.

## Content modularity

Human is the first implemented content, not the architecture itself.

Generic catalog/rules/state code must not require special knowledge of `human`, Peasant, Villager, City Dweller or Professional Soldier merely to enumerate/select content. Stocks, settings/subsettings and lifepaths need stable ids and must enter the engine through catalog/registry abstractions.

When later Dwarf, Orc or other stocks are added, prefer adding validated content plus narrowly scoped rule capabilities over creating parallel stock-specific engines or rewriting existing Human code.

Do not build a speculative plugin runtime or general-purpose rules language yet. Preserve extension points without front-loading infrastructure that current audited rules do not require.

Long-term, built-in and user-authored content should be able to pass through the same validation/catalog pipeline. Prefer serializable/versionable declarative data structures where practical.

## Lifepath identity and display

Keep these concepts separate:

- concrete `variantId` for a setting-specific row;
- conceptual `familyId` where audited repeat identity crosses settings;
- exact printed/source name;
- human-readable UI label.

If a printed lifepath name appears in more than one setting/subsetting, qualify the UI label by setting (for example `Peasant Conscript` vs `Villager Conscript`). Do not change the canonical printed name in source data merely to achieve UI clarity.

Rules, requirements, save data and repeat accounting must use ids/families and must never infer identity by parsing a decorated display label.

## Regression safety

Before a substantial implementation change:

1. write or update explicit acceptance criteria;
2. add tests for the behavior being changed;
3. preserve unrelated working behavior;
4. run the full relevant test suite before considering the task complete.

Every bug fix in character creation should add a regression test reproducing the bug when practical.

Do not solve a failing test by weakening the assertion unless the documented expected behavior changed.

## Current Character Burner invariants

Until explicitly revised:

- The first lifepath must be a Born lifepath.
- Born lifepaths are never legal after the first selection.
- The temporary implementation exposes **Born Peasant**, **Village Born** and **City Born** as initial branches.
- The supported first-slice lifepath area includes **Peasant**, **Villager**, **City Dweller** and **Professional Soldier**.
- Professional Soldier is a reachable supported subsetting, not an invented Born option.
- Selecting or navigating later lifepaths must never cause any Born lifepath to become eligible again.
- Duplicate lifepath names are setting-qualified in presentation while preserving canonical source names and ids.
- Selected lifepaths show accumulated age.
- Mental and physical stat pools are visually distinguishable.
- Skill opening uses the correct root stat(s) and opening exponent.
- Standard skill opening and exponent advancement use the correct character-burning point costs.
- Required lifepath skills are enforced.
- Skill controls use clear `+1` / `-1` interaction and a prominent current exponent.
- Undo/reset returns exactly the points actually spent, from the correct point pool/source.

See `docs/RULES_NOTES.md` for RAW support and `docs/ACCEPTANCE_CRITERIA.md` for testable behavior.

## Reversible state

For character-burning purchases, prefer explicit transactions/deltas over recomputing refunds from the current visible value.

A rollback must be the exact inverse of the committed action. Track enough provenance to know which pool paid for an opening or advancement (for example lifepath skill points vs general skill points).

## Testing expectations

At minimum, rules work should have unit tests for:

- legal and illegal lifepath selection;
- Born-only-first behavior;
- Leads and age accumulation;
- point-pool accounting;
- skill root/opening calculation;
- skill opening/advancement costs;
- exact rollback/refunds;
- restrictions and requirements as they are introduced;
- variant/family identity where same-name paths exist across settings;
- stock/setting registration boundaries as additional content is introduced.

Prefer table-driven tests for lifepath data and boundary cases.

## UI discipline

The UI should explain rule outcomes rather than duplicate them.

When an option is disabled, prefer exposing a machine-readable reason code from the rules layer and mapping that to human-readable text in the UI.

Display-label helpers/selectors may decorate duplicate names for clarity, but UI strings are never authoritative domain identity.

Do not make unrelated layout or styling changes in a rules bug-fix PR.

## Documentation

Record durable architecture, workflow or UX decisions in `docs/DECISIONS.md`.

When adding verified rule behavior, update `docs/RULES_NOTES.md` with a concise paraphrase and a section/page reference. Avoid long quotations from copyrighted source material.

## Copyright and repository hygiene

Do not commit the Burning Wheel rulebook PDF or large verbatim excerpts from it.

Do not commit secrets, tokens, generated build output, dependency directories or local environment files.

## Current intended stack

Unless a decision changes it:

- TypeScript
- React
- Vite
- Vitest

Do not add a backend, database, authentication system, heavyweight state library, plugin runtime or rules DSL without a demonstrated need and a recorded decision.
