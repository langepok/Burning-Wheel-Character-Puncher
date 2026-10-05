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

The first implementation is Human-only, but the architecture is not. Human is the first content pack exercised by the generic catalog/rules/state boundaries.

## Proposed source layout

```text
src/
  data/
    catalog/
    lifepaths/
    settings/
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

- stock identity;
- setting/subsetting identity and UI qualifier;
- lifepath variant/family identity and exact source name;
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

## Rule evaluation vs enforcement policy

Rules knowledge and action blocking are separate concerns.

The domain rules layer should continue to answer whether an action is RAW/project-legal and why. A separate character-command/enforcement policy decides whether a violation blocks the action.

Representative direction:

```ts
type BuildMode = 'rules' | 'free';

type RuleEvaluation = {
  legal: boolean;
  reasons: readonly RuleReason[];
};

applyCharacterAction(build, action, catalog, mode)
```

In `rules` mode, illegal actions are rejected.

In `free` mode, the same evaluation can be retained as warnings/explanations while the action is allowed. This is the foundation of D-018 Free Creation mode.

Important consequences:

- do not fork a separate sandbox rules engine;
- do not change canonical lifepath/skill data to make sandbox choices appear legal;
- do not scatter `if (freeMode)` checks through React components;
- commands/state should know the active enforcement mode, while reusable rules functions remain mode-independent where practical;
- saved builds should preserve their mode;
- whole-build validation may still report rules violations for a free-mode build without preventing the build from existing.

As new subsystems arrive, the same policy boundary extends to point budgets, skill/trait availability, stat limits and similar Character Burner constraints.

## Content/catalog boundary

The catalog is a first-class domain input. Generic engine code should receive a catalog/registry rather than importing Human data directly.

A representative direction is:

```ts
interface StockDefinition {
  id: StockId;
  displayName: string;
}

interface SettingDefinition {
  id: SettingId;
  stockId: StockId;
  sourceName: string;
  uiQualifier: string;
  kind: 'setting' | 'subsetting';
}

interface LifepathDefinition {
  variantId: LifepathVariantId;
  familyId: LifepathFamilyId;
  stockId: StockId;
  settingId: SettingId;
  sourceName: string;
  isBorn: boolean;
  // audited grants / Leads / requirements / source metadata
}

interface GameCatalog {
  stocks: ReadonlyMap<StockId, StockDefinition>;
  settings: ReadonlyMap<SettingId, SettingDefinition>;
  lifepaths: ReadonlyMap<LifepathVariantId, LifepathDefinition>;
}
```

Exact TypeScript types may change as #9–#11 implement the audited data. The architectural constraint is stable: `human`, `peasant`, `villager`, etc. are data ids, not assumptions embedded into generic engine control flow.

### Extending to new stocks/settings

Adding Dwarf, Orc or other supported stock content should mainly involve:

1. registering stock/setting/content definitions;
2. adding audited lifepath/skill/trait data;
3. adding explicit predicate/special-rule capabilities only where RAW genuinely requires them;
4. adding tests proving the new content works through the same generic engine.

Do not create parallel "Human engine", "Dwarf engine", etc. unless source rules eventually demonstrate truly irreducible stock-specific workflows. Prefer shared rule primitives plus explicit stock/content metadata.

The near-term project does **not** need a dynamic plugin runtime or a general-purpose scripting language. Avoid both extremes: do not hard-code Human assumptions, but also do not build speculative infrastructure that current rules do not require.

## Semantic category tags

Some RAW requirements use fictional categories rather than exact ids or setting membership (`guard`, `acolyte`, `priest`, `horse-related`, etc.). These are modeled as curated semantic metadata on lifepaths.

Rules may query a semantic tag, but runtime code must not manufacture membership from display strings or substring matching.

Per D-017, category membership itself is the gate. The engine must not add a second generic biography-plausibility test after a path satisfies the required category.

## Lifepath identity and display labels

Lifepath identity, printed name and UI label are separate concepts.

- `variantId` identifies one concrete row in one setting/subsetting.
- `familyId` identifies the conceptual lifepath for cross-setting repeat behavior when audited as the same path.
- `sourceName` preserves the exact printed row name.
- the UI may derive a qualified label for clarity.

For duplicate printed names across settings, presentation should add the setting qualifier:

```text
Peasant Conscript
Villager Conscript
Villager Apprentice
City Apprentice
Soldier Runner
```

A helper/selector such as this is preferable to baking decorated labels into rules data:

```ts
getLifepathDisplayLabel(lifepath, catalog)
```

If `sourceName` is unique in the relevant catalog/UI context, it can be shown unchanged. If it collides across settings/subsettings, prefix it with the setting's concise `uiQualifier`.

Rules, save data, repeat counting and requirements must use ids/families, never parse the human-readable label.

## Lifepath model direction

A likely starting shape is:

```ts
interface Lifepath {
  variantId: LifepathVariantId;
  familyId: LifepathFamilyId;
  sourceName: string;
  stockId: StockId;
  settingId: SettingId;
  isBorn: boolean;
  years: number;
  leads: LeadDefinition[];
  requirements: RequirementNode[];
  restrictions: RestrictionNode[];
  resourceGrant: ResourceGrant;
  statGrant: StatGrant;
  skillPointGrant: SkillPointGrant;
  traitPointGrant: number;
  semanticTags?: SemanticLifepathTag[];
}
```

This schema is intentionally provisional. Do not lock it until #9 implements the real audited records and tests show it can represent special cases without ad-hoc UI logic.

## Future custom content

Long-term in-app authoring should reuse the same content representation and validation path as built-in data.

That means today's records should be serializable/versionable where practical, with stable ids and structured predicates rather than arbitrary code closures. This is a direction, not a requirement to build a rules DSL or editor now.

A future flow may look like:

```text
Built-in or user-authored content pack
              ↓
      schema/content validation
              ↓
           catalog registry
              ↓
      same rules engine and UI
```

The editor/import/export layer is intentionally deferred until the base game simulator is mature.

Free Creation mode initially operates on whatever content is loaded into this catalog. Once user-authored content exists, the same mode should work with it without a separate sandbox content path.

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

A command in rules-enforced mode should either:

1. return the next valid state plus an auditable delta/transaction, or
2. reject with a structured reason.

In Free Creation mode, the command may apply a rules-illegal action while preserving the evaluation/warning metadata needed by the teaching UI.

For point-bearing actions, exact inverse operations are preferred over reconstructing refunds from the current visual state.

## Invariants worth property-testing

- a legal apply + rollback round trip returns the original build state;
- total points never increase from repeated open/increase/decrease cycles in rules-enforced mode;
- no Born lifepath is legal after a first lifepath exists in rules-enforced mode;
- Free Creation may apply an otherwise-illegal Born/restriction action without changing the underlying rule evaluation;
- age equals lifepath years plus Lead years represented by the chosen path history;
- available options are a deterministic function of build + catalog + enforcement mode/policy;
- UI serialization does not alter domain meaning;
- adding a stock/setting catalog does not require changing generic Human-independent rules merely to make its records discoverable;
- display-label qualification never changes variant/family identity.

## Dependency policy

Start small. Add a dependency only when it removes meaningful complexity or risk.

Do not add a backend, database, auth, global state library, plugin runtime or rules DSL during bootstrap without a concrete need and a recorded decision.
