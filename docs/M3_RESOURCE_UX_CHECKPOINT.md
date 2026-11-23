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

## Visual inspection limitation

A temporary preview was started from stable-main documentation worktree on port
4217. Local Playwright could not find a usable Chromium executable. Cloud browser
connection to the local preview failed; error-page observation was subsequently
blocked by browser policy. No workaround was attempted after that block.

**No live visual inspection was completed.** The plan uses source and recorded UX
iterations; it does not claim screenshots, usability validation or a working new
UI. The temporary server was stopped and the temporary node_modules symlink
removed. Existing checkouts/previews were not repurposed. Use a functioning preview
at implementation G2/G5 for actual density, keyboard and responsive validation.

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
