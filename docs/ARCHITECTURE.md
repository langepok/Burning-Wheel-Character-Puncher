# Architecture

## Goal

Keep Burning Wheel rules deterministic, testable and independent from the presentation layer.

Target flow:

```text
Rule reference / verified game data
            ↓
       Declarative data
            ↓
     Domain rules engine
            ↓
   Character build state
            ↓
 Selectors / explanations
            ↓
          React UI
```

## Proposed source layout

```text
src/
  data/
    lifepaths/
    skills/
    traits/
    stocks/
  rules/
    lifepaths/
    skills/
    stats/
    traits/
    resources/
  character/
    model/
    commands/
    selectors/
  ui/
    components/
    screens/
  app/

tests/
  rules/
  character/
  data/
```

This is a target shape, not a requirement to create empty directories before code exists.

## Layer responsibilities

### `data/`

Declarative facts needed by the engine, for example:

- lifepath identity and display name;
- setting;
- years;
- Leads;
- skill/trait/resource/stat grants;
- requirements and restrictions;
- skill roots and special opening rules.

Game data must not call React or mutate character state.

### `rules/`

Pure or near-pure logic for questions such as:

```ts
canChooseLifepath(build, lifepath, catalog)
getAvailableLifepaths(build, catalog)
calculateAge(build)
calculateStatPools(build, catalog)
getSkillOpening(build, skill)
getSkillPointCost(action)
```

Rules should return structured results where useful:

```ts
type RuleResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: RuleReason };
```

Reason codes let the UI explain why an action is unavailable without embedding rules in presentation code.

### `character/`

Represents the in-progress burn and reversible user actions.

The character state should distinguish between derived values and committed choices. Derived values (such as total age) should be calculated from canonical selections rather than duplicated in several mutable fields unless profiling demonstrates a need.

Purchases should retain provenance. A skill action may need to know:

- whether the skill was opened or advanced;
- point source (lifepath skill pool, general skill pool, or another explicitly supported source);
- amount spent;
- previous/new exponent;
- any special cost rule applied.

This makes rollback exact.

### `ui/`

React is responsible for:

- rendering state;
- gathering user intent;
- invoking commands/rules;
- displaying legality explanations;
- accessibility and visual hierarchy.

React components must not contain authoritative conditions such as `if (lifepaths.length > 0) disableBorn` except as a direct rendering of a domain result.

## Lifepath model direction

A likely starting shape is:

```ts
interface Lifepath {
  id: LifepathId;
  name: string;
  stockId: StockId;
  settingId: SettingId;
  isBorn: boolean;
  years: number;
  leads: SettingId[];
  requirements: Requirement[];
  restrictions: Restriction[];
  resourcePoints: number;
  statBonuses: StatBonus[];
  skillGrants: SkillGrant[];
  traitGrants: TraitGrant[];
}
```

This schema is intentionally provisional. Do not lock it until the Character Burner rules/data audit confirms that it can represent real special cases without ad-hoc UI logic.

## Commands and rollback

Prefer explicit domain commands to direct mutation:

```ts
selectLifepath(...)
removeLastLifepath(...)
allocateStatPoint(...)
openSkill(...)
increaseSkill(...)
decreaseSkill(...)
```

A command should either:

1. return the next valid state plus an auditable delta/transaction, or
2. reject with a structured reason.

For point-bearing actions, exact inverse operations are preferred over reconstructing refunds from the current visual state.

## Invariants worth property-testing

- a legal apply + rollback round trip returns the original build state;
- total points never increase from repeated open/increase/decrease cycles;
- no Born lifepath is legal after a first lifepath exists;
- age equals lifepath years plus Lead years represented by the chosen path history;
- available options are a deterministic function of build + catalog;
- UI serialization does not alter domain meaning.

## Dependency policy

Start small. Add a dependency only when it removes meaningful complexity or risk.

Do not add a backend, database, auth, global state library or rules DSL during bootstrap without a concrete need and a recorded decision.
