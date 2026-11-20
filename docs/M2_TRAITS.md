# M2 acceptance and recovery

Base 1ee5827dfeaefcc27f535f6fbb62150f854c3214. Branch work/m2-trait-burner.

| Acceptance | Verification |
|---|---|
| Ordered obligations skip earlier acquisitions including earlier optional purchases. Second traversal starts at slot two. Later traversals grant no trait points. | Overlapping lists and repeated families, BWGR pp. 84, 89. |
| Offers never create ownership. Purchases retain exact charge, mode, source path and occurrence. | Buy, refund and rebuy. |
| Rules enforce budget, mandatory spending and restrictions. Free retains diagnostics. | Paired rules/free cases. Unknown costs cannot become zero. |
| Route edits preserve the ledger and flag unavailable sources. | Remove, import and repair a path. |
| Old drafts import empty. Reject unknown IDs, fabricated charges, duplicates and invalid source shapes. | Parser fixtures. |
| Undo/redo/reset, save and review include trait edits. | Exercise workbench and full regression suite. |
| Data lists source pages and verification boundaries. Unresolved creation dependencies remain visible. | Catalog integrity tests and manual effect inventory. |
| Skills, Stats and Map retain behavior. | Full tests, typecheck and production build. |

## Coverage and source audit

The index on BWGR pp. 584–589, the articles on pp. 310–355, stock chapters and the 63 Human pilot burning lists supply 700 distinct records. Every trait name used by those 63 lists resolves to an ID. The complete denominator for every unindexed trait in every stock chapter remains unverified.

| Evidence for identity and pricing | Records |
|---|---:|
| Index matched to article heading | 378 |
| Index transcription | 233 |
| Additional index cross-check | 82 |
| Article heading without index row | 2 |
| Lifepath list only | 5 |

554 records carry a printed price. Breeder adds one project-priced record. All 555 priced records allow catalog purchase subject to restrictions. The other 145 have no catalog price. Tough supports Dwarven common, listed lifepath and general acquisition. A listed lifepath supplies its own price under p. 89. The evidence labels describe checks on entry metadata. They do not certify a line-by-line review of the article effects.

The identified stock suites include seven Dwarven, six Elven and six Orc common traits. Playable lifepath history remains the Human pilot. The effect inventory lists 113 entries with manual creation dependencies, five marked automated, four unique play procedures and zero outstanding classifications. Another 578 are currently classified for play. Review surfaces outstanding effects on owned traits. See [effect inventory](M2_TRAIT_EFFECTS.md) for names, pages and work remaining.

## Recovery checkpoint

Initial local implementation e805713, 7abc5ed, 879ff65. The corresponding published foundation ends at f62c443af8fdd175bb54887e8aa660164b755f43 in Draft PR #30. The PR head contains the follow-up inventory, effect handling, editor and tests. Resolve the current checkpoint with git rev-parse HEAD after checking out work/m2-trait-burner. Compare the PR head before resuming. Run the TypeScript check, the entire Vitest suite and the Vite production build. The local Windows preview uses port 4196. Local Vite dependency installation has a sandbox-only workaround for Windows mapped-drive detection.

For the next catalog pass, start with the index-only rows. Verify unindexed stock chapter entries, record evidence per article, and audit manual dependencies against each newly implemented character subsystem. The hosted Workbench preview has a separate deployment history.

Prior checkpoint (6c10023): TypeScript passed, 1,719 tests passed in 73 files, and the production build succeeded.

Reconciliation acceptance: assert all six descriptive types and absence of effect warnings, distinct Pragmatic identity, Breeder project price and Orc suite exclusion, Tough stock/path/catalog charges and duplicate prevention, continued restrictions on other common traits and Black Lung. Exercise refunds and imports plus the existing full workbench regression suite.

Reconciliation checkpoint builds on published HEAD 6c10023. The PR description records the final commit SHA, full suite and CI outcome. Remaining audit scope is index-only metadata and unindexed stock entries. Issue #31 tracks custom traits separately.

Worklist acceptance: stage twenty distinct traits plus a duplicate, compare budget, obligations and effects, remove and round-trip candidates, reject malformed IDs and load legacy drafts. Exercise required selection, purchase, refund, route changes, Reset and Undo/Redo through the sheet. Confirm unavailable entries can be staged. Run all Workbench tests, typecheck, production build and CI.

### Worklist checkpoint

Based on PR #30 commit d0e0be1. Required entries open a single candidate or owned row. Review the production preview by opening Traits, choosing Explore Trait Catalog, adding candidates, closing the dialog and selecting a source in the expanded row. The p. 181 path and other non-pilot paths remain outside this interface. Catalog notes and manual dependencies retain their existing coverage. Candidate IDs persist in version 1 drafts and omitted lists restore empty. The catalog query, filters and expanded row are session UI state.

Local verification: 1,725 tests in 73 files, TypeScript and production build passed. The PR description records the published HEAD and CI run. The local worklist preview is on port 4198. To reproduce from the PR branch, run npm ci, npm run build and npx vite preview --host 127.0.0.1 --port 4198.

UX II acceptance: quick-add without purchase or selection change, numeric and reverse sorting with missing prices last, hybrid filtering, four simultaneous cards across purchase/refund, independent collapse, fulfilled requirement styling, readable sources, full regression suite and isolated production preview.

UX II preview uses port 4199 with its own production output. Preview with npm run build -- --outDir ../tmp/ux2-dist and npx vite preview --outDir ../tmp/ux2-dist --host 127.0.0.1 --port 4199 --strictPort. The PR description records the published commit and verification. Expanded cards persist across sheet tabs within the session. Affinity for… still requires manual skill selection.

### Trait controls and requirement cards

Acceptance for the annotated sheet:

- Reading the sheet, expanding a card or adding a lifepath never writes a candidate just to display a requirement. Show unpaid requirements first in Considering. Render one card per trait, with its type, requirement status and source visit. A purchase from another source remains owned and visibly needs repair.
- The complete card header toggles with a pointer or keyboard, including the type and status. Opening and closing it leaves other cards alone. Display purchase terms immediately after the effect and above the reference footer.
- Keep the catalog, remaining TP, outstanding requirements, review and a short cited rules reference together. Show both bulk actions in the same panel.
- Clear optional candidates in one undoable edit. Preserve paid traits, implicit requirements and the shortlist provenance of owned traits. Reset traits clears paid acquisitions, trait choices and the shortlist in one undoable edit. Recompute grants and requirements from the route. Exercise Cancel, Undo and Redo, source-specific charges, stock grants and legacy drafts.

UX verification used the five-lifepath saved character from the annotations. The new preview under `http://127.0.0.1:4199/traits-review/` shares the draft with the previous build at the root URL. To reproduce beside that build, run `npm run build -- --base=./ --outDir ../tmp/ux2-dist/traits-review` and serve `../tmp/ux2-dist` on port 4199. Local verification passed TypeScript, all 1,730 tests in 73 files and the production build. See PR #30 for the published commit and CI result.

Lifepath source labels show the occurrence when a path repeats. The recorded purchase mode is displayed for Free Creation. Follow-up for Skills: adapt the compact controls and independently expandable, full-width card headers.
