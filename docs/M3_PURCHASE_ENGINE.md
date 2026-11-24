# M3-A2 Resource Purchase Engine

## Acceptance contract (written before implementation)

Baseline: `cb748b87036e495a5d509dff810d6888cd1c1ff0`, 1928 tests.
The source is BWGR; D-027 and D-033–D-039 remain in force. This stage
implements headless rules and Sheet commands, not a Resource Burner UI.

| Area | Executable acceptance | M3-A1 vectors |
| --- | --- | --- |
| Budget | Family repeats use full/full/ceil-half thereafter; variant visits identify funding; Wife remains incomplete | repeatGrants; Wife |
| Quotes | Catalog prices, quality, parts, relationship discounts, ratings, target quality; unknown is never zero | purchases.json; spells.json; relationships |
| Ledger | Stable distinct IDs, exact historical debit, explicit per-pool allocations, atomic rejection/refund | repeated purchases; repricing/refund |
| Bundles | Arms items own additions; zero-debit gang container; explicit shield only; no NPC generation | bundles; parent deletion |
| Attributes | Explicit accounting flags, Resources /15, Circles Will/2 and one bonus; rounding never changes budget | resources; circles; soCloseDiagnostic |
| Changes | Preserve ledger when route/traits/stats/mode change; report missing/overspent sources | incompleteAndRejected |
| Outlaw | Access derived from current traits/conditions, spend permitted, no saved lock | all five outlawFunding scenarios |
| Recovery | Sheet snapshots support Undo/Redo/Reset; validate imported structure and preserve historical prices | import/history vector |
| Modes | Rules blocks illegal/unresolved operations; Free requires priced, explained overrides | fourth affiliation; unknown armor |
| Invalid input | Reject malformed IDs/configuration/funding/cycles/links without partial state | additional adversarial tests |

Unknown arithmetic (Wife-derived rps, partial Poor/Superior armor, half pieces,
standalone shields) remains unresolved. Contextual table reviews are recorded
separately from Free Creation overrides and never establish a new numeric rule.
Outlaw mixed/limited assets and disputed Circles accounting cannot silently
produce a certified derived ability. All 14 questions remain tracked in M3-A1.

## Initial checkpoint

Preparation complete: clean main verified; new branch `work/m3-a2-resource-engine`.
Read contracts, all fixture groups, Sheet commands/import and snapshot history;
verified original PDF pp. 84, 93–97, 200, 202–205. Acceptance tests precede handlers.
Implementation and validation pending.

Checkpoint 1: budget, quotes, atomic ledger/refunds, explicit included options,
derived abilities, Sheet/import/review integration implemented. 48 initial
engine tests and typecheck pass. First full run preserved all 1928 baseline
tests; a fixture setup error (synthetic 5-rp grant versus actual Born path grant)
was corrected without changing any expected value. Bundle, recovery, invalid
input and all Outlaw execution tests are the next gate; not yet audit-ready.

## Architecture and public boundary

- `rules/resources.ts`: pure `resourceBudget`, `quoteResource`, `fundingAccess`,
  `startingResourceAbilities`, `projectResources`. The registered catalog is
  injectable; React is absent. Quotation and commit use the same funding plan.
- `rules/resource-types.ts`: request, quote, diagnostic, pool and external fact
  contracts. `rules/resource-validation.ts` validates requests and saved graphs.
- `character/resources.ts`: `buyResources` (atomic batch), `refundResource`
  (atomic ownership cascade), `resetResources`, `describeResource`,
  `setResourceChoices`, `setResourceBudgetOverrides`.
- `Sheet` optionally stores purchases, rounding/gray choices and explained budget
  overrides. `deriveSheet` includes the resource projection and feeds diagnostics
  to the existing Review. No UI purchase controls or new state container exist.
- Existing `parseDraft` validates additions and discards cached derived fields;
  old drafts without resource fields remain supported. Existing Undo/Redo stores
  whole Sheets, and existing Reset creates a clean Sheet. Tests exercise App
  buttons and local autosave as well as the headless APIs.

A request supplies a stable ID, definition/configuration, optional physical
objects/links, table review notes, explicit funding and/or Free Creation override.
The caller creates IDs; the engine never uses a random number or timestamp.
Commands return `{sheet, error?}`; rejection returns the original Sheet identity.
The refund also returns `refundedRps` and the original funding allocations.

Batch order is explicit: parent before additions; all gang components before
its container. Group references may point forward inside that atomic batch.
The container pays zero; the three children own their charges and accounting.
Refunding any component refunds the whole gang. Armor inclusion creates a
linked zero-cost record; isolated component refund is rejected to preserve the
parent choice. Refund the armor parent to remove that selection atomically.
An Arms declaration's quality comes from its purchase; a declaration cannot spoof
a cheaper modification price. No numerical RAW limit on bundle contents is added.
Import transport limits (1 MB draft, 2000 acquisitions/declarations) are validation
bounds, not an equipment entitlement or game rule.

## Rules and calculations

A lifepath source pool is `variantId#occurrence`. Family repetition determines
its grant, while the concrete variant visit remains the funding identity. Missing
route sources become diagnostics; their spending does not transfer to new pools.
Budgets and debits are separate projections. Only confirmed pool amounts are
available to ordinary new purchases. An incomplete Wife pool displays its known
base but is not automatically spent; it requires an explicit Free Creation
override. Other confirmed pools remain usable; unknown additions are never zero.
Explicit Free Creation grants/overspends remain explained and reviewable.

Supported prices: fixed, quality tiers (including missile formulas already
expanded in M3-A1), confirmed armor pieces, clamped relationship modifiers,
social ratings, target-quality modifications, included entries and zero-debit
composites. Printed spell prices are not replaced by the generic spell formula.
Skill requirements use owned openings. Herd checks the catalog's explicit skill
or listed lifepath alternatives. Companion evidence must establish complete
creation, limits, a paid reciprocal relationship and own gear; no NPC is created.

Accounting uses each definition's flags, never its UI category. Resources uses
actual qualifying paid rps / 15; Circles uses Will/2 (floor, minimum 1, same shade)
and a single bonus at 50 qualifying rps. Cash grants one starting die per purchase
but contributes to neither attribute. The gray choice requires recorded permission
and five exponent points. `roundUpResources` defaults false and changes only
rounding; `rawSoCloseEligible` separately checks shortfall and all-spent conditions.

Outlaw leaves historical allocations and paid prices untouched. Current access
uses explicit Human setting IDs and current traits/conditions. Restricted pools
remain spendable. Missing origins and additional unresolved conditions are not
blindly unlocked. Restricted qualifying purchases expose unresolved calculation
status; displayed numeric arithmetic is a preview, not an approved RAW result.
The explicit Noble/City/Religious mapping does not silently extrapolate to Noble
Court: that future subsetting's scope remains review under `outlaw-pools`.

## Executed M3-A1 vectors

| Fixture group | Executed evidence |
| --- | --- |
| `resources` (11) | Pure Resources arithmetic, manual rounding and approved gray |
| `soCloseDiagnostic` (6) | Separate RAW shortfall/all-spent diagnostic, including incomplete budget |
| `circles` (5) | Will, shade, minimum, single bonus, missing Will |
| `relationships` (5) | Four discount cases plus fixed companion price/requirements |
| `repeatGrants` (5) | Synthetic printed 5-rp source at visits 1–5; cross-setting family test also present |
| `bundles` (2) | Real buy/refund of 28-rp Arms and 22-rp gang, per-item modifications and accounting |
| `outlawFunding` (5) | Trait purchase/refund, purchase under trait, exact source refund, snapshots/import, other condition |
| `incompleteAndRejected` (9) | Every named case has execution/assertions: Wife incomplete; unknown parts rejected; disputed Circles unresolved; fourth social rejected; beak mismatch; companion limits; manual rounding; historical refund; parent cascade |
| `purchases.json` | All fixed and missile/armor rows quoted; mixed 41-rp armor purchase, ammunition and cash execution |
| `spells.json` (67) | Every printed spell price quoted; purchase requires Sorcery and preserves charge after skill loss |

`resource-engine.test.ts` checks arithmetic/quotes against independent expected
values. `resource-purchases.test.ts` exercises transactions and recovery;
`resource-outlaw.test.ts` consumes the five scenarios (fixture aliases map to
canonical source pool IDs, without changing expected amounts/access).
`resource-invalid.test.ts` rejects malformed commands/imports atomically.
`resource-history.test.ts` exercises the existing App Reset, trait Reset,
Undo/Redo and route removal. Contract/catalog tests from M3-A1 are unchanged.

Blocked vectors are tested as blocked/unresolved outcomes, **not** counted as
successful unsupported purchases or certified derived abilities. JSON descriptions
alone are not counted as tests. Fixture expected prices/amounts were not changed;
only the old specification-status annotations were updated.

## Unresolved RAW and supported limits

All 14 M3-A1 questions remain recorded. This engine does not close them globally:

| Question | Engine behavior |
| --- | --- |
| superior/poor armor parts; half pieces; standalone shield | Unknown price blocks Rules; explicit explained Free price possible |
| property threshold | Confirmed starred single purchase above 40 requires a listed exception; the 40 boundary, aggregate and unstarred ships remain contextual review |
| Arms composition | Reviewed descriptive bundle; no automatic arsenal or per-item surcharge |
| modification stacking | Individual applicability enforced; combination/repeat needs review |
| relationship combinations | Confirmed additive structured discounts; extra fictional conditions require review |
| companion limits | Confirmed ordinary campaign limits checked; missing/tiny limits/evidence block Rules |
| Wife grants | Known base retained, additional grant incomplete; no chosen rounding/order |
| Outlaw pools | Current access computed, mixed/restricted starting arithmetic flagged; Noble Court scope not inferred |
| spell discrepancies | Printed entry prices retained (existing policy), no generic replacement |
| property Circles classification | Workshop/Herd/Rent counted for Resources, uncertain for Circles |
| social trait interactions | Outlaw's 1D grant projected separately; other trait combinations remain manual with Review |

No new global RAW interpretation was needed. The Noble Court scope observation
is recorded within the existing Outlaw question and does not affect loaded pilot
paths. Full social trait stacking, linked companion creation, armor substitution
validation/effects (only preserved through explicit Free Creation), equipment constructors, magic/cash consumption and Fight remain
outside this PR. Rulebook/source data, all 144 IDs/prices and other stock catalogs
were not retranscribed. Sol automation/workflows are unchanged.

## M3-A3 connection

Use the existing `updateSheet`/snapshot commit path with successful commands.
Read quote status, cost, funding plan and diagnostics before enabling confirmation;
revalidate by executing the command against the latest Sheet. Pass current campaign,
companion and external access facts to both quote and projection. These facts are
not cached results and must be supplied again after loading when relevant.
Render `calculationStatus`/diagnostics alongside arithmetic previews. Display social
bonus dice separately from base Circles. Inspect catalog property benefits without
generating NPCs. New purchase UI need not duplicate rules or reinterpret RAW.


## Validation and continuation checkpoint

Local typecheck, **2158 tests in 80 files** and production build pass. This is
**230 new tests** above the unchanged 1928-test baseline. `git diff --check`
passes. Existing Vite large-chunk advisory remains (JS approximately 722 kB,
195 kB gzip); no bundling/dependency redesign is part of this rules change.
No catalog rows, old fixtures' expected values, UI layouts, workflows or Sol
configuration changed. The small integration diff is confined to Sheet projection
and draft import; Lifepaths/Stats/Skills/Traits algorithms are unchanged.

Implementation, RAW boundary review and local validation are complete. Publish
this branch as a Draft PR and verify GitHub CI against its exact published HEAD.
Independent audit is the next gate before M3-A3 or integration. Do not merge or
begin purchase UI work as part of this checkpoint. The PR description records
published HEAD, tree and CI evidence to avoid a self-referential commit hash here.

## Final audit refinement — 2026-11-24

Acceptance cases for PR #33:

- Clothes cannot declare a weapon, shield or armor, through quote, Rules/Free
  commands or import. Free Creation cannot bypass structural identity.
- Definitions expose optional `declaredItemKinds`; absent capability means only
  descriptive `other` declarations where the configuration supports them. Arms
  and missiles permit weapons/other contents, armor permits armor/other contents,
  and shield definitions permit shields. Names remain free text; this is not a
  Weapon Constructor, quantity limit or automatic determination of kit contents.
- A non-weapon cannot carry `weaponKind`. Armor declarations, like quality bundles,
  cannot contradict the purchased quality; omitted quality is filled at commit.
  An armor parent cannot declare an included shield directly: selection still
  produces its separate linked zero-cost record, exactly once.
- Review context includes the purchase configuration/declarations, its linked
  parent (only the selected physical item for a targeted addition), same-target
  modifications, and explicit Gang group members. Existing route/trait/skill/Will
  and supplied external facts remain dependencies. Ledger/object key ordering
  alone does not invalidate an assessment.
- Adding/removing/editing a relevant modification invalidates earlier combination
  assessments without rewriting their notes or charges. Buying Clothes, changing
  the other axe's declaration, or modifying that other axe does not. Returning to
  the identical assessed composition makes its original review applicable again.
- New records in an atomic batch receive the final batch context; submitted reviews
  explicitly assess that complete batch. Existing records are never restamped.
  Callers must present the complete submitted combination for assessment. Draft v1
  remains readable; legacy unscoped review strings are retained but cannot certify
  composition and require renewed assessment (currently refund/rebuy).

`tests/character/resource-refinement.test.ts` reproduces the two audit defects;
its first run had five failures before fixes. It also covers descriptive freedom,
linked shield/quality consistency, unrelated purchases/targets, ordering, exact
composition restoration, scoped save round-trip and legacy review diagnostics.
These are contract/persistence policies, not resolutions of the 14 open RAW
questions. No new review UI or engine-independent pricing is introduced. The
accepted M3-A3 plan remains on `docs/m3-a3-resource-ux-plan`; its implementation
still requires audited engine integration in main.

Local refinement validation: typecheck, all **2166 tests / 81 files**, production
build and `git diff --check` passed. Eight regression cases were added; the
existing Vite large-chunk advisory remains. Exact published HEAD and GitHub CI
result are recorded in PR #33 after publication.
