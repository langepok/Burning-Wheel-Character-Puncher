# Acceptance Criteria

These criteria define the behavior contract for the current Character Burner v2 work. They are intentionally narrower than the full Burning Wheel Character Burner.

## Phase CB-0 — Repository and rules skeleton

- Repository contains agent instructions and durable project documentation.
- Rulebook PDF is not committed.
- No production rules implementation is accepted without corresponding tests.
- Rules, state and React UI are separated by module boundaries.

## Phase CB-1 — Lifepath selection slice

### Starting state

Given a new human build with zero lifepaths selected:

- **Born Peasant** is available.
- **City Born** is available.
- No non-Born lifepath is selectable as the first lifepath.
- No other Born option is exposed in this temporary slice unless the scope decision is revised.

> The Peasant + City restriction is a temporary product decision. The first-lifepath-must-be-Born rule is RAW.

### Born exclusivity

After any first lifepath is selected:

- no Born lifepath is legal;
- no later selection, Lead or setting transition may make Born Peasant, City Born, Village Born or another Born lifepath legal again;
- a rules result for a rejected Born path exposes a stable reason such as `BORN_LIFEPATH_NOT_FIRST`.

### Current-setting choices

After the Born path:

- eligible lifepaths in the current setting are determined by the rules layer;
- requirements/restrictions are evaluated outside React;
- unavailable paths can expose a structured reason for the UI;
- the UI does not duplicate the legality calculation.

### Leads

When a supported lifepath permits a Lead to another setting:

- the engine can represent taking that Lead;
- the current setting changes according to the selected Lead;
- the transition adds one year to age exactly once;
- undoing that transition removes exactly that year;
- remaining in the current setting does not add a Lead year.

### Age

At all times:

`displayed age = sum(selected lifepath years) + sum(taken Lead years)`

Selecting/removing paths or Leads updates the value deterministically. A select → undo round trip returns the previous age exactly.

### Selected lifepath display

The selected-history UI shows:

- ordered lifepaths;
- accumulated age prominently enough to be read without inspecting debug state;
- Lead transitions when they contribute age or setting change.

## Phase CB-2 — Stats

When implemented:

- mental and physical point pools are separate domain values;
- mental and physical stats are visually distinguishable;
- allocations cannot spend more points than their corresponding pool contains;
- decrement/refund returns exactly one point to the correct pool;
- reset restores the exact original pools;
- rules calculations are tested independently of React.

## Phase CB-3 — Skills

### Skill availability

- Lifepath skill points may only purchase skills allowed by the selected lifepaths.
- General skill points may purchase legal unrestricted skills according to RAW.
- Required lifepath skills are identified from ordered lifepath history.

### Opening a standard skill

For a standard one-root skill:

- opening cost is 1 appropriate skill point;
- exponent becomes `floor(root / 2)`.

For a standard two-root skill:

- opening exponent follows the verified two-root calculation from the rulebook;
- tests include odd/even root combinations so rounding is explicit.

Special/training skill costs are not silently treated as standard costs.

### Required skill

For each selected lifepath:

- the first listed skill is required unless already open from an earlier path;
- when it is already open, the next listed skill becomes required;
- required means it must be opened before the burn can be considered valid, not that it must be advanced.

### Advancement during character burning

- `+1` increases an opened standard skill exponent by exactly one when legal;
- character-burning advancement cost is exactly 1 permitted point per +1 exponent unless a verified special rule applies;
- `-1` reverses the most recent reversible increment and returns the exact point to the source that paid it;
- exponent display is visually prominent.

### Point-source provenance

Opening/advancement records the source of each spent point.

At minimum, tests cover:

1. open with lifepath skill point → undo → lifepath pool fully restored;
2. open with general point → undo → general pool fully restored;
3. open with general point and advance according to allowed source rules → rollback restores each source correctly;
4. repeated +1/-1 cycles do not create or destroy points;
5. full reset returns the build to the exact pre-skill-allocation state.

## Regression test matrix

Before a Character Burner PR is complete, relevant tests should cover:

| Area | Required regression |
| --- | --- |
| Born selection | Born legal only at index 0 |
| Temporary starts | Born Peasant and City Born both available initially |
| Born reappearance | Village Born/other Born never becomes legal later |
| Leads | Lead adds one year once and changes setting |
| Age | total matches lifepaths + Leads |
| Requirements | unmet requirement returns explicit rejection |
| Skill root | opening exponent matches root calculation |
| Skill cost | standard open and +1 costs are correct |
| Required skill | ordered fallback to next listed skill works |
| Refund | exact pool/source is restored |
| Reset | state and pools equal original snapshot |

## Definition of done for a feature

A Character Burner feature is done only when:

1. behavior is supported by RAW or an explicit documented project decision;
2. acceptance criteria are satisfied;
3. domain tests pass;
4. regression coverage exists for the bug/edge case being addressed;
5. unrelated behavior and layout are unchanged unless explicitly in scope;
6. durable new decisions are recorded in `docs/DECISIONS.md`;
7. unresolved rules ambiguities are listed rather than guessed through.
