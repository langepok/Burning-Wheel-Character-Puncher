# M3-A3 UX planning — continuation checkpoint

Updated **2026-11-24 (Europe/Moscow)**. The design pass is complete.
No UI, game rules, catalog, engine, save format or automation was implemented or
changed. Use [M3_RESOURCE_UX_PLAN.md](M3_RESOURCE_UX_PLAN.md) as the implementation
instruction; the selected durable direction is also in [DECISIONS.md](DECISIONS.md#m3-a3-design-checkpoint--preparations-paid-acquisitions-and-portable-drafts).

## Verified repository state

| Item | Observed state, rechecked at end of design |
| --- | --- |
| Stable `origin/main` | `cb748b87036e495a5d509dff810d6888cd1c1ff0` |
| M3-A1 | PR #32 integrated; 144 definitions, including 67 spells |
| M3-A2 | [PR #33](https://github.com/langepok/Burning-Wheel-Character-Puncher/pull/33) OPEN, DRAFT, `merged: false`, `merged_at: null` |
| Inspected draft engine | `a21de80c2ce0d7eccc3e092bbe22edb10a978b88` on `work/m3-a2-resource-engine` |
| Engine evidence | Green [CI run 45243715645](https://github.com/langepok/Burning-Wheel-Character-Puncher/actions/runs/45243715645); 2158 tests / 80 files reported by that engine checkpoint, not rerun for this documentation pass |
| Documentation branch | `docs/m3-a3-resource-ux-plan`, based on stable main, not on the engine draft |

An open PR's `merge_commit_sha` is a preview merge, not evidence of integration.
The engine's green CI is not evidence that its independent audit has been accepted.
Do not implement M3-A3 until G0 in the plan is satisfied. Do not merge PR #33 as a
side effect of resuming this design. No new PR or merge is part of this pass.

## Selected design — do not restart layout discovery

- Keep Resources within the existing Workbench Sheet tabs.
- An on-demand catalog supports repeated quick Prepare and direct priced Buy for
  simple fully specified legal entries. Search/selection survive additions.
- Independent unpaid preparation cards keep multiple configurations and prose
  visible. Compare each against current committed state; preparations reserve
  nothing. No global shopping cart/checkout.
- Owned acquisitions form a separate grouped rail beside preparation on wide
  screens, or below it on narrower layouts. Original paid charge/source remain
  visible. Expanded cards do not close one another.
- Sticky local budget/ability summary, local quote/action rows, explicit unknown
  costs, accessible reasons and source references. Actual/preview/starting ability
  are different labels. Social bonus dice do not become base Circles.
- Category-specific editors: simple purchases, quality, armor, Arms and targeted
  additions, social forms, Gang, spells. No universal giant form or equipment doll.
- Refund to preparation preserves authored configuration with new IDs; actual
  refund/cascade comes from the engine. Buy/refund plus preparation transition is
  one undoable draft edit. Paid mechanical edits use explicit refund/rebuy.
- Persist authored preparations in a justified v2 Draft envelope, outside Sheet.
  Exact migration/recovery/history contract is plan §10. This is a future change;
  no existing save was migrated here. An unnumbered DECISIONS design checkpoint
  avoids collision with decision IDs in unmerged M3-A2.
- Full UI behavior and transport defenses remain separate from RAW. All 14
  unresolved questions stay tracked. No automated sentiment, staff/NPC generation,
  inventory slots, coverage, Fight!, other stocks or complete equipment constructor.

## Research already completed

### Stable main

Read repository instructions, `CHARACTER_BURNER_UX.md`, `CHARACTER_WORKBENCH.md`,
`UX_III_CHECKPOINT.md`, `UX_REFINEMENT_REVIEW.md`, `UX_ROADMAP.md`, M3-A1 catalog and
relevant decisions (especially D-027, history/identity decisions, D-033–D-039).
Inspected actual `SheetEditor.tsx`, `TraitEditor.tsx`, `App.tsx`, `app.css`,
`character/workbench.ts`, `character/resource-contracts.ts`, and resource data types.

Useful existing integration facts:

- Resources is a placeholder in `SheetEditor`, alongside working Skills/Traits.
- Trait expanded-card state is lifted so it survives tab switches; catalog quick
  additions preserve inspected entry. Reuse the interaction, not all the styling.
- App owns the Draft and maximum-100 in-session snapshot stacks. `updateSheet`
  commits only a changed Sheet identity. Import/export/autosave use
  `character/workbench.ts`; current storage key is `bw-workbench-v1`.
- Current restore preserves name/mode/pins. Reset preserves existing independent
  identity/view choices. Global key handling ignores editable elements/open dialogs.
- Current parser explicitly accepts version 1 and reconstructs allowed primary
  fields; adding unpaid fields without a deliberate transport change loses them.
- Existing shell is desktop-first with a 1000 px minimum width. Resource component
  reflow is not a commitment to redesign the map/whole shell for phones.

### Provisional engine (read-only dependency research)

Read `docs/M3_PURCHASE_ENGINE.md`, `rules/resource-types.ts`, `rules/resources.ts`,
`rules/resource-validation.ts`, `character/resources.ts`, acquisition contracts
and draft parsing at the head above. The plan's §9 maps controls to actual APIs:

- `resourceBudget`, `quoteResource`, `projectResources` are pure evaluation.
- `buyResources` takes an ordered atomic batch; failure returns original Sheet.
- `refundResource` supplies actual original total/funding and resulting graph.
- `describeResource`, `setResourceChoices`, `setResourceBudgetOverrides`,
  `resetResources` are existing command boundaries.
- Parent precedes additions; Gang children precede container. Engine, not UI,
  inserts explicitly selected shield children.
- Quote/commit/projection must use current path, sheet, mode and the same actual
  external facts. Requote on changes; never treat preview as commit authorization.

Do not invent around these gaps:

1. No in-place paid mechanical or Arms declaration edit.
2. Narrative command accepts name/description/audience/scope; not every social
   field. Description/context changes can invalidate reviews; no standalone
   renew-review command exists. Keep warning or use supported refund/rebuy.
3. Refunding a selected included shield alone is rejected; refund armor parent.
4. Refunding any Gang child removes its group. Explain the whole cascade first.
5. Companion/campaign/access context has no persisted linked-character provider.
   Do not infer completeness or fabricate evidence. Existing imported records
   remain visible with fresh diagnostics when evidence is absent.
6. No complete Rules armor substitution/half-piece constructor.
7. Outlaw permits spending but changes access; missing origins/other restrictions
   do not disappear when the trait is refunded.

## Live visual follow-up

**Completed 2026-11-24 (Europe/Moscow).** The earlier access gap is closed. A direct
exec-launched Vite preview was not reachable from the cloud browser. The supported
managed preview command made the stable-main documentation worktree accessible;
this did not require a late user approval or a browser-policy bypass. No site was
published and no application source, dependency manifest or preview configuration
was changed.

Inspected the running Workbench through screenshots and UI interactions at
**1363 × 936 CSS pixels**, with the explicitly disposable test character **Mara of
the Mill**: five lifepaths, age 32, Rules mode. Its route is Born Peasant → Farmer →
Miller → Lead to Villager (+1 year) → Village Tough → Corrupt Sergeant.

| Exercised case | Observed result | Consequence for the Resource plan |
| --- | --- | --- |
| Skills layout and Farming details | Three compact cards across; prominent exponent beside ± controls, paid pool/source and expanded purchase history nearby | Keep configuration, quote and action together; disclose the ledger locally |
| Farming advance and keyboard Undo | B3 → B4; Ordinary points left 17 → 16 and spent 6 → 7. Ctrl+Z outside text restored B3, 17 left and 6 spent | Use existing draft history for coherent purchase/refund transitions |
| Skill catalog search | Searching Sword found the owned entry, its source and disabled Added state; active point budget was not shown inside the dialog | Resource catalog must retain an actual budget summary alongside its local quote |
| Independent Trait disclosures | Hoarding and Lord’s Favorite were open together and remained open after Resources → Traits navigation | Lift disclosure state above conditional tab content; do not use an exclusive accordion |
| Required Trait purchase | Buying Hoarding from Farmer cost 1 TP: 6 → 5 left, 0 → 1 spent, requirements 0/4 → 1/4; Owned showed Farmer source and Refund 1 TP | Distinguish a requirement/candidate from a paid acquisition and preserve visible provenance |
| Repeated catalog quick-add | Added A Little Crazy and Adorable while A Bit Deaf remained inspected. Catalog stayed open; TP stayed at 5 left / 1 spent | Quick Prepare should not spend points, steal selection or interrupt discovery |
| Catalog reopening | Search text Adorable reset to empty on reopening Traits catalog | Retaining Resource search/filter/selection/scroll across close/reopen is an explicit improvement, not inherited behavior |
| Lifepath exploration and return | Inspected Miller without changing the five-path route; expanded map retained Miller and its disabled Add reason; Escape returned with Miller still selected. Selecting Corrupt Sergeant in history opened its inspector and brought that node into view | Preserve navigation context and show reasons without turning inspection into a purchase |
| Map visual hierarchy | Route, dashed taken Lead, inspected path outline, current node, history ages and pinned paths remained distinguishable | Keep committed state distinct from tentative choices; give direct navigation back to their context |
| Resources boundary | Existing tab displayed 42 earned rps and category placeholders, not a working purchase UI or the Starting Resources attribute | This inspection validates reference interactions only; new Resource behavior still needs implementation tests |

The test character was intentionally modified: Hoarding was purchased and two
optional candidates were added. Farming's temporary advance was undone. The map
checks did not change lifepaths, age or stats. This was not an import/export or
full reload-recovery test, and no new claim of save round-trip coverage is made.

The concept and existing decisions remain unchanged. Only the evidence and the
distinction between inherited behavior and required improvements were clarified.
Focus restoration was not established as a current defect. Full keyboard-only,
screen-reader, zoom and multi-width checks, and all Resource UI acceptance cases,
remain G2/G5 work; a desktop inspection is not a formal usability study.

### Reproduce preview access without repeating discovery

Use the installed managed preview workflow in this environment:

```sh
sites-preview status
sites-preview start /workspace/scratch/a2d695adbef0/burning-wheel-ux-plan
```

Open the **exact URL returned by the command** in the cloud browser. For this
inspection it was `http://127.0.0.1:4173/`; do not assume that port in a new session.
Use the actual checkout path if the workspace changes. The preview command owns
the server; do not start a second Vite process or change network/security settings.
After the inspection, stop the owned preview with `sites-preview stop` and remove
only temporary local dependency links created for that run. An environment restart
can stop the preview; check status and start it again using the same supported
command. No broad UX research needs to be repeated.

## Deliverables and validation

- `docs/M3_RESOURCE_UX_PLAN.md`: chosen concept, comparison of layouts, screen
  organization, journeys, editors, reversal/errors/modes, API/persistence contracts,
  **26 acceptance criteria**, test matrix, six implementation gates and risks.
- `docs/DECISIONS.md`: appended design checkpoint; previous decisions unchanged.
- This file: state, research findings, limitations and next actions.

Documentation validation passed: whitespace (`git diff --check`), relative
Markdown targets, balanced code fences, continuous RUX-01–26, unchanged previous
DECISIONS content, and exactly three documentation files changed against stable
main. No typecheck/runtime suite/build is represented as newly executed: no
runtime source, dependency or test changed. Full checks and exact-HEAD GitHub CI
are mandatory for the subsequent implementation, not substituted by this review.

The visual follow-up changes only this checkpoint and the plan. It preserves all
26 acceptance criteria and the recorded design decision; its validation consists
of the targeted live checks above plus documentation consistency checks.

Research was saved in incremental local commits before final publication. The
published branch's HEAD is the durable delivery identifier (reported outside this
file to avoid a self-referential commit hash).

## Resume procedure

1. Fetch `origin/main` and `origin/docs/m3-a3-resource-ux-plan`; preserve local work
   before any branch switch. Read this file and the plan; broad UX research is done.
2. Check PR #33 and the actual main content/audit/CI. If still unmerged or not
   verified, keep G0 closed and report that specific dependency; do not implement
   UI against the draft. Account for squash/rebase integration when comparing heads.
3. On a verified integrated base, reconcile §9 APIs and decisions. Carry these three
   documentation files forward without overwriting later DECISIONS additions.
4. Start G1: migration/history/adapter acceptance tests, then the thin end-to-end
   purchase/refund/persistence slice. Follow G2–G5; do not build every visual card
   before validating a real command path.
5. Save a checkpoint after each gate with exact HEAD, tests actually run, observed
   visual checks, remaining issues and next step. Preserve Sol's automation.

## Implementation kickoff — 2026-11-24

Working branch: `work/m3-a3-resource-burner`, based on main
`920272b2161d8a5d91c9a508525fcead3b703d29`. PR #33 is confirmed merged
at that commit, with audited head `c27a50b04d250e5fbd006642c2781ae56387d7c5`.
The only file difference between the audited head and main is
`docs/UX_DEVELOPMENT_PROCESS.md`; engine, UI, tests, package files and CI workflow
are identical. The exact merge commit has no check runs: workflow is PR-only.
CI 45326743457 passed on the identical executable tree before merge. This is
equivalent-code evidence, not a claim of a CI run on the merge SHA.

Read and preserve [UX_DEVELOPMENT_PROCESS.md](UX_DEVELOPMENT_PROCESS.md).
The plan/checkpoint were restored from accepted documentation head
`1e34a10ae54986ec625617d1684ce4af61572139`; only the unnumbered M3-A3 design
section was appended to main's DECISIONS, preserving D-040–D-042 and the final
engine audit refinement. Do not cherry-pick the old DECISIONS file wholesale.

API reconciliation: review fingerprints now include relevant purchase composition;
new atomic batches stamp final composition, while existing purchases are never
restamped. Preparations must obtain fresh assessments after edits; refund/rebuy
is still the supported repair route. `declaredItemKinds` limits structured
declarations; use catalog capabilities rather than inventing a weapon classifier.

Next: G1 tests and implementation for v1 → v2 draft migration, bounded incomplete
preparations, safe recovery backup, command adapters, whole-draft history and
refund-to-preparation. Then G2 simple purchase/refund UI before complex forms.
No M3-A3 runtime code has been changed at this kickoff checkpoint.

Kickoff base verification passed locally: typecheck, 2166 tests / 81 files,
production build and diff check. Existing Vite large-chunk warning only.

## First working slice — 2026-11-24

Implementation is in progress on PR #34 (`work/m3-a3-resource-burner`). This
checkpoint supersedes the kickoff's statement that no runtime code exists. It is
**not completion of G1–G5 or all acceptance criteria**.

Implemented:
- `resource-preparations.ts`: unpaid draft records, bounded transport validation,
  atomic buy/removal and refund-to-preparation using engine results. Refunded
  records get fresh IDs; linked IDs are remapped, included children are recreated
  by the engine, original paid provenance is not turned into a new authorization.
- Draft reader accepts v1/v2; reader and exporter produce v2. Preparations are
  outside Sheet. App backs up the original v1 bytes to
  `bw-workbench-v1-before-v2` before the first migrated autosave. Storage failure
  pauses writes. Existing saved key stays `bw-workbench-v1`.
- Resource catalog, search/category filter, simple direct Buy, independent
  preparations, paid-acquisition rail, engine budget/starting abilities/funding
  details, manual So Close!, initial quality/armor/social fields and diagnostics.
- Resource component stays mounted in its own hidden tabpanel so search/owned
  disclosures survive tabs. It is not nested inside the active Traits panel.
- App coalesces Resource text edits within one focused input session; changes
  still autosave. Global Reset also clears preparations; existing undo snapshots
  contain both paid and unpaid data.

Executed browser case on the authorized Mara test character (five lifepaths,
42 rps): find Clothes; Prepare leaves 42; enter `Тёплый дорожный плащ`; buy leaves
41 and shows Paid 1 rp/source; Return restores 42 and the exact description.
Browser revealed focus loss; follow-up code restores the catalog opener and
purchase/refund destination, with DOM test assertions. Visual density was reviewed
at the existing desktop viewport only, not all planned widths.

Managed preview: `sites-preview start /workspace/scratch/a2d695adbef0/burning-wheel`;
open its returned URL (this run `http://127.0.0.1:4173/`). Retain this first working
preview for the user's requested review; it is session-local, not production.

Remaining work, in priority order:
1. Complete G1 defenses/tests: complex refund ID/link cases, collisions, native
   text history, import/export/reload of partial complex forms, storage recovery.
   `inputs` currently preserves unfinished values but blocks Buy until reconciled.
   Requests deliberately persist no funding/reviews/override authorizations yet;
   authored assessment notes and freshness need their own next adapter step.
2. Complete category forms: Relationship modifiers, Arms physical declarations
   and targeted additions, atomic Gang composition, skill picker, reviewed social
   scopes/property, explicit Free Creation price/reason and budget controls, gray
   Resources permission controls. Current Gang card explicitly says not connected;
   companion evidence remains unavailable as planned. No fake confirmation bypass.
3. Before treating multi-record refunds as finished UX, add cascade preview and
   confirmation. Engine refund is atomic already; current control directly applies
   it. Add whole-preparation dry-run totals/after-purchase balances, duplicate/pin,
   paid narrative editing and grouped owned entries.
4. Improve catalog density/inspector and empty results; resource source labels
   currently expose IDs. Tighten accessible announcements and focus after direct
   buys/Undo, check stale/racing actions and preparation transport limits in UI.
5. Full acceptance matrix, browser journeys across categories and planned widths,
   final full regression/typecheck/build and exact-HEAD CI. Keep PR Draft.

The first-slice tests cover v1 migration, incomplete input round-trip, atomic
simple buy/refund and corruption rejection, exact v1 backup/failure protection,
and App purchase/refund/Undo/Redo. The previous round-trip test now explicitly
expects the accepted v2 migration rather than v1 output. Existing Traits regression
caught hidden Resources being nested in the Traits panel; that was fixed without
weakening its assertion. No engine/catalog/RAW/automation source was changed.

First-slice validation after focus fix: all **2174 tests / 83 files**, typecheck,
production build and diff check passed locally. Vite large-chunk advisory remains.
Exact published head and CI result are reported in PR #34.

## Complex editor checkpoint — 2026-11-24 (in progress)

Unpublished implementation now adds engine dry-run bundle quotes, four-record Gang
preparations, declared Arms objects/targeted additions, skill selection, relationship
modifiers, explicit per-request Free Creation charges, gray Resources choices,
explained funding grants and paid social narrative edits. Cascade returns require
confirmation. Duplicate alternatives remap internal identities. Assessment notes
persist separately from their scoped certification; returned notes are retained but
must be certified again. Unrelated Clothes purchases do not invalidate assessment.

Targeted tests: 14 passed across the preparation, complex preparation and App DOM
suites; typecheck passed. Full regression/build/browser/CI are still pending for this
slice. Existing published PR #34 remains at 741198a9f86b5ba8e7f763c99d981fe9271d3448.
Next: complex editor DOM scenarios, catalog density/empty state/source labels,
reset/resources diagnostics, responsive browser review and final acceptance matrix.
No engine, RAW catalog, other subsystem or automation files changed.

## Integrated complex UI delivery — 2026-11-24

This supersedes the first-slice remaining-work list above. G0 remains verified:
main was fetched again and is still 920272b2161d8a5d91c9a508525fcead3b703d29.

Implemented in this continuation:
- Engine dry-run totals/remaining/Starting Resources for independent preparations;
  explicit Free Creation per-request charge/reason and separate explained grants.
- Arms physical declarations and targeted additions; complete atomic Gang; skill
  picker; relationship modifiers; social audience/scope; optional armor inclusion.
- Scoped assessment certification, fresh IDs for duplication/returns, preservation
  of returned notes without renewal, pruning annotations when a component is removed.
- Cascade confirmation with engine-provided original refund; paid social narrative
  edits; gray Resources/permission controls; resource-only Reset with confirmation.
- Compact searchable catalog disclosures, empty-result message, live action notices,
  human-readable historical funding labels, cash and social-dice summaries.

New targeted tests: six adapter scenarios and five complex DOM scenarios. Combined
with earlier tests, **2185 tests / 85 files**, typecheck, production build passed.
The existing large-chunk Vite advisory remains; no dependency or workflow change.

Live browser observations on Mara (42 earned rps):
1. Superior Arms plus one Beak: assessed, bought for 24, refunded as a two-record
   cascade. Reload restored 42 rps and named axe/notes; new assessment was required.
2. Gambeson helmet: shield initially unchecked, explicitly checked, bought for 2;
   included shield appeared once at 0. No full-suit restriction introduced.
3. Reputation “Водится со следопытами”: free audience “Жители Бри”, scope and table
   assessment, bought for 7 without organization/polarity fields.
4. Standalone shield remained Price unresolved; explicit Free Creation price 3
   and reason allowed purchase. Returning to Rules preserved the original charge
   and reason with warnings. Test character now has 30 rps left / 12 spent.
5. At the observed 1348 px viewport, DOM scroll width equals viewport width; paid
   rail, preparations, sticky budget and actions are visible. Browser zoom keyboard
   attempts did not change the observed CSS viewport, so they are NOT 200% evidence.

Review limits, not new RAW decisions: full 1000/1280/1440/200% and screen-reader
matrix is not certified. Dedicated comparison pinning and category grouping of
owned cards remain optional polish; current alternatives are independently
expandable/duplicable beside a chronological paid ledger. Catalog search/category
persist, but scroll/disclosures reset on close. Native text-undo still needs a
browser-specific check. Existing unsupported companion evidence and armor
substitution/unknown-price cases remain engine diagnostics; all 14 RAW questions
remain open. No Inventory/Fight/NPC generator or other-stock expansion was added.

Resume from this section and the current PR #34 head; do not repeat base research.
The working managed preview remains http://127.0.0.1:4173/ for this session. Exact
published HEAD and CI evidence belong in the PR body (avoiding self-reference here).
