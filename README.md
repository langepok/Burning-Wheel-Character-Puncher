# Burning Wheel Character Puncher

A web-based training and character-building simulator for **Burning Wheel Gold Revised**.

The project is currently focused on rebuilding the **Character Burner** cleanly from scratch. Equipment and conflict-training modules (including Fight!) come later.

## Current phase

**Character Burner v2 — clean-room rebuild**

The previous single-file HTML prototype is treated only as a historical UX reference. Its implementation is not being migrated.

The first implementation target is deliberately narrow:

- human characters only;
- temporary starting Born choices: **Born Peasant**, **Village Born**, **City Born**;
- supported first-slice lifepath areas: **Peasant**, **Villager**, **City Dweller**, **Professional Soldier**;
- lifepath selection and legality;
- accumulated age and Leads;
- then stats, skills, traits and resources in separate milestones.

Professional Soldier is included as a reachable supported area, not as an invented Born option.

## Project principles

1. **Rules accuracy first.** Burning Wheel Gold Revised is the rules source of truth.
2. **No silent simplification.** Any intentional simplification must be documented as a project decision.
3. **Data, rules and UI stay separate.** React components do not decide rules legality.
4. **Regression safety.** Rule fixes require tests so previous behavior does not break again.
5. **Reversible character-building state.** Reset and rollback must return exactly what was spent.
6. **Rulebook text is not stored in this repository.** The repository contains concise paraphrases, references and implementation data only.

## Intended stack

- TypeScript
- React
- Vite
- Vitest

The stack is a project decision rather than a Burning Wheel rule and can be revised deliberately if needed.

## Repository guide

- [`AGENTS.md`](AGENTS.md) — instructions for Codex and other coding agents
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — durable project decisions
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — target separation of data, rules, state and UI
- [`docs/RULES_NOTES.md`](docs/RULES_NOTES.md) — verified rules notes with book references
- [`docs/ACCEPTANCE_CRITERIA.md`](docs/ACCEPTANCE_CRITERIA.md) — current behavior contract and regression cases
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — development sequence

## Rules source

The copyrighted Burning Wheel Gold Revised PDF is kept in the ChatGPT Project used for research and review and is intentionally **not committed here**.

When code, documentation and the rulebook disagree, stop and resolve the discrepancy before changing behavior.

## Development workflow

### Local development

Use Node.js 22.12+ on the 22.x line, 24.x, or 26+ and npm.

```sh
npm ci
npm run dev
```

Before opening a pull request, run:

```sh
npm run typecheck
npm run test
npm run build
```

Tests run once in Node without a browser. The bootstrap includes only a project
shell and an empty build-history container; game data and rules follow in later
issues. Application startup lives in `src/app`, presentation in `src/ui`, and
framework-independent code in `src/character`, `src/rules` and `src/data`.

### Feature changes

For substantial changes:

1. establish or update acceptance criteria;
2. verify relevant rules against the source material;
3. implement rules logic independently of UI;
4. add or update regression tests;
5. integrate the UI only after rule behavior is stable;
6. record durable design decisions in `docs/DECISIONS.md`.
