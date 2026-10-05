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

## 2. Final-starting-age requirements — resolved as lightweight UX

There is a source tension worth documenting:

- Character Burner p. 85 says lifepath requirements must be met before the path is taken.
- Character Burner p. 87 calculates starting age after the lifepath sequence is finished.
- Human `Elder` (p. 166) requires the character to start the game over 50.
- Human `Thinker` (p. 198) says starting age **will be** 36 or older, which is explicitly forward-looking.

The project does not consider this niche case important enough to justify a special intermediate legality state in the UI.

Decision D-012:

- show the final/start-age condition clearly in the lifepath description;
- keep the selection UI simple;
- verify the condition during whole-build validation;
- do not add a dedicated `LEGAL_WITH_PENDING_REQUIREMENT` status solely for these rare cases.

This is a UX/implementation decision, not a claim that the wording ambiguity has disappeared from RAW.

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

## 4. Repeat-grant rounding — resolved by project interpretation

The Law of Diminishing Returns says some third/fourth-occurrence grants are halved, but the audited paragraph does not state how odd point totals are rounded.

Other Burning Wheel rules often specify rounding direction explicitly, so this is not labeled RAW.

Decision D-013:

- when a repeated-lifepath grant is halved and produces a fraction, **round up**;
- examples: 5 → 3, 7 → 4;
- encode this explicitly and test it rather than relying on incidental language/runtime behavior.

Rationale: repeatedly taking the same lifepath is already subject to diminishing returns; the project chooses the player-favorable reading where the book is silent.

## 5. Setting categories vs semantic categories in requirements

A second source pass clarifies that not every phrase of the form “any X lifepath” should become a free-form semantic tag.

### Setting-backed categories

Requirements such as **any Professional Soldier lifepath** can be represented directly as setting/subsetting membership:

```ts
{ kind: 'priorSetting', settingIds: ['human.professional-soldier'] }
```

Likewise, printed shorthand such as **any Soldier lifepath** should use the canonical `human.professional-soldier` setting id after alias normalization, rather than a separate `soldier` tag.

This avoids duplicating information already present in the catalog.

### Semantic categories that still require curated tags

The supported tables also contain genuinely semantic categories that are not simply setting membership:

- **any guard lifepath**;
- **any priest lifepath**;
- **any sorcerous lifepath**;
- **a prior lifepath having to do with horses**.

These require explicit audited metadata, for example:

```ts
tags: ['guard', 'priest', 'sorcerous', 'horse-related']
```

Do not derive these tags at runtime from lifepath names, skill lists or fuzzy text matching.

### Source examples

- City `Duelist` accepts Squire, any Outcast or Soldier lifepath, or any guard lifepath.
- City `Sergeant-at-Arms` accepts any guard lifepath among several named alternatives.
- `Chaplain` and a Professional Soldier priest-type path use **any priest lifepath** as a requirement option.
- Villager `Scholar` accepts several named paths or **any sorcerous lifepath**.
- Professional Soldier `Cavalryman` asks for a prior lifepath “having to do with horses” and gives examples such as Knight, Squire, Groom and Master of Horses.

### Audit boundary

The source does not provide, in these requirement lines, a complete machine-readable membership list for `guard`, `priest`, `sorcerous` or `horse-related`.

Therefore:

- the schema may support these tags now;
- tag membership must be manually audited and stored in data;
- a path must not qualify merely because its English name happens to contain `Guard`, `Priest`, `Horse`, etc.;
- adding/removing a tag is a data/rules change that should be covered by fixture validation tests.

## 6. Audit status after this pass

Resolved or sufficiently specified for implementation planning:

- Born-first RAW;
- Born-only-once project interpretation;
- current product scope;
- canonical setting aliases;
- Lead years and out-of-scope distinction;
- distinction between setting-backed and semantic category requirements;
- basic requirement algebra;
- final/start-age UX handling;
- repeat-grant rounding interpretation;
- Human starting stat pools for ages 01–100;
- standard skill opening/advancement rules and point-source provenance.

Still OPEN before dependent production behavior:

- manually audited membership for semantic tags such as `horse-related`, `guard`, `priest`, and `sorcerous`;
- dynamic wife-lifepath effects when Skills/Resources milestones are implemented;
- complete manual transcription/validation of all records in the four supported areas.
