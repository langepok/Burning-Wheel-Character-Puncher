# Roadmap

This roadmap is ordered by dependency and regression risk, not by visual completeness.

## M0 — Rules and repository foundation

- Establish repository conventions and agent instructions.
- Keep the rulebook out of Git.
- Record durable decisions.
- Audit the Character Burner rules relevant to the first slice.
- Define explicit acceptance criteria and regression cases.

**Exit condition:** the next implementation task can be given to Codex without requiring it to invent rules or architecture.

## M1 — Lifepath engine

Scope:

- human temporary starting Born choices: Born Peasant, Village Born and City Born;
- supported first-slice lifepath areas: Peasant, Villager, City Dweller and Professional Soldier;
- Born-only-first invariant;
- current setting and available lifepaths;
- requirements/restrictions for included lifepaths;
- Leads and setting transitions;
- age accumulation;
- reversible selection history;
- setting-qualified UI labels for duplicate lifepath names;
- semantic category predicates from curated tags;
- the first **Free Creation** enforcement-mode slice: rules may still evaluate/explain an illegal lifepath action, but sandbox mode may allow it instead of blocking it.

Implementation order:

1. schema and fixture data;
2. pure lifepath legality rules;
3. age/Lead calculations;
4. regression tests;
5. rules-vs-free enforcement policy at the character command boundary;
6. minimal UI showing the flow, explanations and mode selection.

**Exit condition:** a player can select a legal short lifepath history across the supported settings, see why alternatives are unavailable, distinguish duplicate-name variants, undo without changing derived results incorrectly, and deliberately switch to Free Creation when they want to ignore lifepath restrictions.

## M2 — Stats

Scope:

- age-derived starting pools for supported human ages;
- lifepath stat bonuses;
- mental vs physical pools;
- allocation and exact refunds;
- visual distinction between mental and physical stats;
- extend Free Creation so stat limits/budgets can be bypassed deliberately without changing normal-mode calculations.

**Exit condition:** stat allocation is rules-correct and reversible in normal mode, while sandbox overrides are explicit and isolated from RAW validity.

## M3 — Skills

Scope:

- skill metadata and roots;
- master skill list from selected lifepaths;
- required skills;
- general vs lifepath point pools;
- standard/special opening costs;
- opening exponent calculation;
- +1 / -1 character-burning advancement;
- exact provenance and rollback;
- extend Free Creation so any loaded skill can be selected/adjusted without the normal eligibility or point-budget gates.

**Exit condition:** known refund bugs from the old prototype are impossible under regression tests, and free-mode skill overrides do not weaken normal-mode tests.

## M4 — Traits and resources

Scope:

- required and optional lifepath traits;
- trait point accounting;
- resource points;
- gear/relationships/affiliations/reputations as required by Character Burner completion;
- extend Free Creation to corresponding eligibility/budget restrictions as those editors are implemented.

Audit rules before implementing each subsystem.

## M5 — Complete Character Burner data and additional stocks

- Full audited Human lifepath data.
- Expand beyond the temporary Peasant/Villager/City/Professional Soldier slice.
- Data validation and coverage checks.
- Add additional stocks only after Human flow is stable.
- Use at least one additional stock (for example Dwarf or Orc when audited) as an architectural validation that new stock/settings can be registered without redesigning the generic engine/UI.
- Save/load format with versioning if useful; preserve whether a build uses normal or Free Creation mode.

**Exit condition:** Character Burner is useful as a standalone training tool and adding another audited stock is primarily a content/rules-extension task, not a rewrite of Human-specific application code.

## M6 — Equipment

- Character Burner equipment purchasing.
- Rules explanations and legality.
- Data-driven equipment catalog.

Do not begin until Character Burner state/persistence is stable enough to consume equipment cleanly.

## M7 — Core test trainer

Before Fight!, implement a focused trainer for basic Burning Wheel tests if needed:

- Intent and Task;
- obstacle and dice pool;
- versus tests;
- help/FoRK/advantage interactions where relevant;
- advancement bookkeeping where useful pedagogically.

This can become shared infrastructure for later conflict modules.

## M8 — Fight! training simulator

- Rules audit and explicit state machine.
- Script/action selection.
- interaction matrix and timing;
- weapons/armor/injury integration;
- transparent AI opponent;
- explanation of why each resolution occurred.

AI must choose within the same rules engine as the player. It must not bypass legality or resolution rules.

## Later candidates

- Range and Cover
- Duel of Wits
- broader additional-stock coverage
- scenario/tutorial authoring
- replayable combat examples
- difficulty-adjustable AI and teaching hints

These remain out of scope until the preceding foundations are stable.

## Final long-term milestone — Content packs and in-app authoring

This is intentionally the last major roadmap goal, not a near-term requirement.

Desired capabilities:

- create/edit custom stocks;
- create/edit settings and subsettings;
- create/edit lifepaths and their structured grants/requirements/Leads;
- validate custom content with the same catalog validation pipeline as built-in content;
- import/export versioned content packs;
- load built-in and user-authored content through the same registry/rules engine;
- clearly distinguish official audited BWGR content from user-authored/custom content;
- use Free Creation with built-in or custom content through the same enforcement-policy layer.

The architecture should avoid blocking this future, but no current milestone should be delayed by building a speculative editor or plugin system early.
