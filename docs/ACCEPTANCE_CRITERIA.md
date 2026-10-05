# Acceptance Criteria

These criteria define the behavior contract for the current Character Burner v2 work. They are intentionally narrower than the full Burning Wheel Character Burner.

## Phase CB-0 — Repository and rules skeleton

- Repository contains agent instructions and durable project documentation.
- Rulebook PDF is not committed.
- No production rules implementation is accepted without corresponding tests.
- Rules, state and React UI are separated by module boundaries.
- Generic catalog/rules/state boundaries do not assume Human is the only stock or that the temporary four Human settings are the universe of content.

### Issue #2 — Technical bootstrap

- A minimal React shell identifies Character Burner v2 as under construction.
- `src/app`, `src/character`, `src/data`, `src/rules`, `src/ui` and `tests` exist.
- A framework-independent smoke test imports a domain module without React or UI.
- A fresh `npm ci`, `npm run typecheck`, `npm run test` and `npm run build` pass.
- The npm lockfile is committed; dependencies and generated build output are not.
- No game rules, lifepath catalog or character-selection UI are introduced.

## Phase CB-1 — Lifepath selection slice

### Starting state

Given a new human build with zero lifepaths selected:

- **Born Peasant** is available.
- **Village Born** is available.
- **City Born** is available.
- No non-Born lifepath is selectable as the first lifepath.
- No other Born option is exposed in this temporary slice unless the scope decision is revised.

> The Peasant + Villager + City starting restriction is a temporary product decision. The first-lifepath-must-be-Born rule is RAW.

### Supported first-slice settings

The initial playable data/rules slice includes:

- **Peasant Setting**;
- **Villager Setting**;
- **City Dweller Setting**;
- **Professional Soldier Subsetting**.

Professional Soldier is included as a reachable supported area through legal Leads/requirements; it is not exposed as an invented Born starting option.

### Born exclusivity

After any first lifepath is selected in rules-enforced mode:

- no Born lifepath is legal;
- no later selection, Lead or setting transition may make Born Peasant, Village Born, City Born or another Born lifepath legal again;
- a rules result for a rejected Born path exposes a stable reason such as `BORN_LIFEPATH_NOT_FIRST`.

> Born-only-once is an accepted **project interpretation** recorded in `docs/DECISIONS.md` D-011. Do not mislabel it as a separate literal sentence from RAW.

### Current-setting choices

After the Born path in rules-enforced mode:

- eligible lifepaths in the current setting are determined by the rules layer;
- requirements/restrictions are evaluated outside React;
- unavailable paths can expose a structured reason for the UI;
- the UI does not duplicate the legality calculation.

### Semantic category requirements

- broad categories such as `acolyte`, `guard`, `sergeant` and `horse-related` are explicit curated metadata, not substring matching;
- `Failed Acolyte` satisfies the current project's `acolyte` interpretation;
- `Guard Captain` satisfies the current project's `guard` interpretation;
- both supported Groom variants, Farrier, Saddler and Cavalryman are explicitly `horse-related` in the first slice;
- satisfying a semantic category is not followed by an extra generic biography-plausibility gate.

### Requirement timing

- requirements based only on already-known history (position, prior lifepath, occurrence count, current setting, etc.) are evaluated by domain rules at selection time;
- the engine has a separate whole-build validation concept rather than assuming every rule can be expressed as a local UI enable/disable check;
- rare final/starting-age requirements such as Human Elder are shown clearly in the lifepath description and checked during whole-build validation, without a dedicated pending-status UX, per D-012.

### Leads

When a supported lifepath permits a Lead to another supported setting:

- the engine can represent taking that Lead;
- the current setting changes according to the selected Lead;
- the transition adds one year to age exactly once;
- undoing that transition removes exactly that year;
- remaining in the current setting does not add a Lead year.

If a Lead points outside the temporary supported slice, the engine must represent that as unsupported product scope rather than pretending the Lead is illegal under RAW.

### Age

At all times:

`displayed age = sum(selected lifepath years) + sum(taken Lead years)`

Selecting/removing paths or Leads updates the value deterministically. A select → undo round trip returns the previous age exactly.

### Lifepath identity and display

Production records preserve separate concepts for:

- concrete setting-specific variant identity;
- audited cross-setting family identity;
- exact printed/source name;
- UI display label.

When the same printed lifepath name occurs in multiple settings/subsettings, the user-facing picker/history qualifies the duplicate with its setting context, for example `Peasant Conscript` vs `Villager Conscript`.

Qualification is presentation-only:

- it must not alter `variantId`, `familyId`, requirements, repeat counting or save identity;
- code must not recover domain identity by parsing the decorated label;
- unique names may remain unqualified when context is already clear.

### Selected lifepath display

The selected-history UI shows:

- ordered lifepaths;
- setting-qualified labels where duplicate names would otherwise be ambiguous;
- accumulated age prominently enough to be read without inspecting debug state;
- Lead transitions when they contribute age or setting change.

### Catalog extensibility

The first Human slice must enter the rules engine through generic stock/setting/catalog interfaces.

Acceptance boundary:

- no core legality/selection function requires a hard-coded list of the four temporary Human settings merely to discover catalog content;
- adding another audited stock/setting later should not require replacing the Human engine with a new parallel engine;
- stock-specific exceptions may add explicit predicate/special-rule capabilities, but ordinary discovery/identity/selection plumbing remains shared.

### Free Creation mode — lifepath foundation

The product has an explicit rules-enforced mode and an explicit Free Creation/sandbox mode.

In Free Creation mode:

- the same rules evaluator can still report that an action violates RAW/project rules;
- violations do not block the user from applying a lifepath action;
- multiple Born lifepaths are allowed, including Born lifepaths after index 0;
- current-setting/Lead access and lifepath requirements/restrictions may be ignored deliberately;
- repeat restrictions may be ignored deliberately;
- the resulting build is not silently reported as rules-valid;
- switching to Free Creation does not mutate canonical lifepath data;
- build/save state records the active mode.

The implementation must not create a second sandbox rules engine or scatter authoritative `freeMode` rule logic through React.

## Phase CB-2 — Stats

When implemented:

- mental and physical point pools are separate domain values;
- mental and physical stats are visually distinguishable;
- allocations cannot spend more points than their corresponding pool contains in rules-enforced mode;
- decrement/refund returns exactly one point to the correct pool;
- reset restores the exact original pools;
- rules calculations are tested independently of React;
- Free Creation can deliberately bypass normal stat-pool/limit enforcement without changing what the normal rules evaluator reports.

## Phase CB-3 — Skills

### Skill availability

In rules-enforced mode:

- Lifepath skill points may only purchase skills allowed by the selected lifepaths.
- General skill points may purchase legal unrestricted skills according to RAW.
- Required lifepath skills are identified from ordered lifepath history.

In Free Creation mode, any skill available in the loaded catalog may be selected without those normal eligibility gates. Truly user-authored unknown skills belong to the later custom-content milestone.

### Opening a standard skill

For a standard one-root skill in rules-enforced mode:

- opening cost is 1 appropriate skill point;
- exponent becomes `floor(root / 2)`.

For a standard two-root skill:

- opening exponent follows the verified two-root calculation from the rulebook;
- tests include odd/even root combinations so rounding is explicit.

Special/training skill costs are not silently treated as standard costs.

Free Creation may allow direct overrides once the skill editor supports them, but that must not alter the normal opening calculation or make the override appear RAW-legal.

### Required skill

For each selected lifepath in rules-enforced mode:

- the first listed skill is required unless already open from an earlier path;
- when it is already open, the next listed skill becomes required;
- required means it must be opened before the burn can be considered valid, not that it must be advanced.

### Advancement during character burning

- `+1` increases an opened standard skill exponent by exactly one when legal;
- character-burning advancement cost is exactly 1 permitted point per +1 exponent unless a verified special rule applies;
- `-1` reverses the most recent reversible increment and returns the exact point to the source that paid it;
- exponent display is visually prominent.

### Point-source provenance

Opening/advancement records the source of each spent point in rules-enforced mode.

At minimum, tests cover:

1. open with lifepath skill point → undo → lifepath pool fully restored;
2. open with general point → undo → general pool fully restored;
3. open with general point and advance according to allowed source rules → rollback restores each source correctly;
4. repeated +1/-1 cycles do not create or destroy points;
5. full reset returns the build to the exact pre-skill-allocation state;
6. a Free Creation override does not weaken or bypass these normal-mode invariants when mode is `rules`.

## Regression test matrix

Before a Character Burner PR is complete, relevant tests should cover:

| Area | Required regression |
| --- | --- |
| Born selection | first lifepath must be Born in rules mode |
| Born exclusivity | accepted interpretation: Born legal only at index 0 in rules mode |
| Free Born override | Free Creation can deliberately add later/multiple Born paths while evaluator still reports the violation |
| Temporary starts | Born Peasant, Village Born and City Born all available initially |
| Born reappearance | No Born path becomes rules-legal later |
| Supported scope | Peasant, Villager, City Dweller and Professional Soldier transitions behave according to audited data |
| Unsupported Leads | out-of-scope destination is distinguished from RAW illegality |
| Leads | Lead adds one year once and changes setting |
| Age | total matches lifepaths + Leads |
| Requirements | unmet immediate requirement returns explicit rejection/evaluation in rules mode |
| Semantic tags | Failed Acolyte/Guard Captain/horse-related fixtures use explicit metadata, not name parsing |
| Free requirement override | Free Creation may apply an unmet-requirement path without making it rules-valid |
| Final-age requirement | condition is visible and whole-build validation catches an invalid final age |
| Duplicate display | duplicate source names render setting-qualified labels without changing domain identity |
| Catalog modularity | generic engine/catalog discovery does not depend on a hard-coded Human setting list |
| Skill root | opening exponent matches root calculation |
| Skill cost | standard open and +1 costs are correct |
| Required skill | ordered fallback to next listed skill works |
| Refund | exact pool/source is restored |
| Reset | state and pools equal original snapshot |
| Mode persistence | save/state representation cannot silently turn a Free Creation build into a rules-enforced valid build |

## Definition of done for a feature

A Character Burner feature is done only when:

1. behavior is supported by RAW or an explicit documented project decision/interpretation;
2. acceptance criteria are satisfied;
3. domain tests pass;
4. regression coverage exists for the bug/edge case being addressed;
5. unrelated behavior and layout are unchanged unless explicitly in scope;
6. durable new decisions are recorded in `docs/DECISIONS.md`;
7. unresolved rules ambiguities are listed rather than guessed through.
