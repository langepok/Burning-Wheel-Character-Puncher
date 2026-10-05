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

- human temporary Peasant + City starting slice;
- Born-only-first invariant;
- current setting and available lifepaths;
- requirements/restrictions for included lifepaths;
- Leads and setting transitions;
- age accumulation;
- reversible selection history.

Implementation order:

1. schema and fixture data;
2. pure lifepath legality rules;
3. age/Lead calculations;
4. regression tests;
5. minimal UI showing the flow and explanations.

**Exit condition:** a player can select a legal short lifepath history, see why alternatives are unavailable, and undo without changing derived results incorrectly.

## M2 — Stats

Scope:

- age-derived starting pools for supported human ages;
- lifepath stat bonuses;
- mental vs physical pools;
- allocation and exact refunds;
- visual distinction between mental and physical stats.

**Exit condition:** stat allocation is rules-correct, reversible and independently tested.

## M3 — Skills

Scope:

- skill metadata and roots;
- master skill list from selected lifepaths;
- required skills;
- general vs lifepath point pools;
- standard/special opening costs;
- opening exponent calculation;
- +1 / -1 character-burning advancement;
- exact provenance and rollback.

**Exit condition:** known refund bugs from the old prototype are impossible under regression tests.

## M4 — Traits and resources

Scope:

- required and optional lifepath traits;
- trait point accounting;
- resource points;
- gear/relationships/affiliations/reputations as required by Character Burner completion.

Audit rules before implementing each subsystem.

## M5 — Complete Character Burner data

- Full audited Human lifepath data.
- Expand beyond temporary Peasant/City starts.
- Data validation and coverage checks.
- Additional stocks only after Human flow is stable.
- Save/load format with versioning if useful.

**Exit condition:** Character Burner is useful as a standalone training tool and not merely a prototype.

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
- additional character stocks
- scenario/tutorial authoring
- replayable combat examples
- difficulty-adjustable AI and teaching hints

These remain out of scope until the preceding foundations are stable.
