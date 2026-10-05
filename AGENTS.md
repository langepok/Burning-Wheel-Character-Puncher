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

- `data/`: declarative game data such as lifepaths, settings, skill metadata and requirements;
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
- restrictions and requirements as they are introduced.

Prefer table-driven tests for lifepath data and boundary cases.

## UI discipline

The UI should explain rule outcomes rather than duplicate them.

When an option is disabled, prefer exposing a machine-readable reason code from the rules layer and mapping that to human-readable text in the UI.

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

Do not add a backend, database, authentication system or heavyweight state library without a demonstrated need and a recorded decision.
