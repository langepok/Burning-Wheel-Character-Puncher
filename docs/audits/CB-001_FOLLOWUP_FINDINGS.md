# CB-001 — Follow-up Findings

Status: **Audit supplement**

This file records source checks performed after the initial `CB-001_FIRST_HUMAN_SLICE.md` draft. Items should be folded into the main audit when the corresponding interpretation is resolved.

## 1. Interpretation discipline is now explicit

Project decisions D-010 and D-011 establish the following discipline:

- distinguish RAW from project interpretation;
- use the narrowest reasonable interpretation when a small implication is not literally restated but context strongly constrains the answer;
- do not use “common sense” to override explicit rules or choose arbitrarily between materially different readings;
- if multiple consequential readings remain plausible, keep the question OPEN.

Born-only-once is the first accepted example: RAW requires the first lifepath to be Born and describes it as birth/childhood; the project explicitly interprets that as exactly one Born lifepath at index 0.

The rulebook does use “use common sense” in some context-sensitive adjudication, but those occurrences are local instructions rather than a universal replacement for written rules. The repository therefore treats common-sense reasoning as an interpretation discipline, not as RAW text that licenses arbitrary simplification.

## 2. Final-starting-age requirements — stronger source evidence

There is a real tension that should be resolved deliberately.

### General requirement rule

Character Burner p. 85 says lifepath requirements must be met before the path is taken.

### Starting age is calculated after lifepath selection

Character Burner p. 87 instructs players to total lifepath Time and Lead years **after they are finished choosing lifepaths** to obtain starting age.

### Human Elder

Peasant Setting, p. 166:

- `Elder` has a requirement that the character **start the game over 50 years old**.

This wording describes start-of-play state rather than merely the age accumulated before clicking Elder.

### Human Thinker (outside current playable scope, useful as interpretation evidence)

Outcast Subsetting, p. 198:

- `Thinker` is restricted so it can only be taken if the character's **starting age will be 36 years or older**.

The phrase “will be” is explicitly forward-looking and is strong evidence that at least some age restrictions are intended to reason about the completed burn, not just current partial history.

### Current audit conclusion

The strongest implementation reading is:

1. keep immediate historical requirements in `canSelectNext()`;
2. allow rules that explicitly reference **starting/final age** to exist as pending whole-build constraints;
3. expose the pending requirement to the player rather than silently treating the path as fully valid;
4. enforce it in `validateBuild()` before the burn is considered complete.

This is not yet promoted to a durable project decision because the general p. 85 wording (“meet requirements before taking the path”) creates enough tension that the project should explicitly accept the interpretation first.

Proposed reason/status model:

```ts
type RuleStatus =
  | 'LEGAL'
  | 'LEGAL_WITH_PENDING_REQUIREMENT'
  | 'LEGAL_BUT_OUT_OF_SCOPE'
  | 'ILLEGAL_BY_RULE';
```

Example pending reason:

`FINAL_STARTING_AGE_NOT_YET_SATISFIED`

## 3. Human starting stat pools — verified

The Human starting-age table appears on p. 199 of the PDF source.

| Starting age | Mental pool | Physical pool |
| --- | ---: | ---: |
| 01–10 | 5 | 10 |
| 11–14 | 6 | 13 |
| 15–16 | 6 | 16 |
| 17–25 | 7 | 16 |
| 26–29 | 7 | 15 |
| 30–35 | 7 | 14 |
| 36–40 | 7 | 13 |
| 41–55 | 7 | 12 |
| 56–65 | 7 | 11 |
| 66–79 | 7 | 10 |
| 80–100 | 6 | 9 |

Implementation notes:

- derive the age band from final starting age;
- then apply lifepath stat grants as described by Character Burner pp. 87–88;
- `+M/P` remains a player choice, while `+M, P` grants both;
- do not infer behavior for ages outside the printed table without a verified rule or explicit interpretation.

This resolves the earlier “Human age-chart data” audit item for the printed 01–100 ranges, but does not yet implement Phase CB-2.

## 4. Repeat-grant rounding remains OPEN

The Law of Diminishing Returns says some third/fourth-occurrence grants are halved, but the audited paragraph does not state how odd point totals are rounded.

This gap should **not** be filled merely by a generic rounding assumption. Burning Wheel explicitly states rounding direction when it matters in many other places. Within the same Human lifepath chapter, wife lifepaths explicitly say when half skill points are rounded down, while other fractional costs elsewhere explicitly round up.

Therefore:

- do not encode `floor(points / 2)` or `ceil(points / 2)` for repeated lifepath grants yet;
- keep the repeated-grant calculation blocked on a verified source or an explicit project interpretation;
- repeating a lifepath may still be represented in history, but M1 tests should avoid asserting odd-value repeated grants until resolved.

## 5. Audit status after this pass

Resolved or sufficiently specified for implementation planning:

- Born-first RAW;
- Born-only-once project interpretation;
- current product scope;
- canonical setting aliases;
- Lead years and out-of-scope distinction;
- basic requirement algebra;
- Human starting stat pools for ages 01–100;
- standard skill opening/advancement rules and point-source provenance.

Still OPEN before dependent production behavior:

- final/start-of-play requirement timing (Elder/Thinker-style wording) — interpretation proposed above;
- odd-value rounding for repeated-lifepath half grants;
- manually audited semantic membership for tags such as `horse-related`, `guard`, `priest`, and `sorcerous`;
- dynamic wife-lifepath effects when Skills/Resources milestones are implemented;
- complete manual transcription/validation of all records in the four supported areas.
