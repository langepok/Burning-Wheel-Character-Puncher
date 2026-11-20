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

554 records carry a numeric printed price. 553 are enabled for catalog purchase subject to their restrictions. Tough has a printed price of 2 (p. 351) and appears in the Dwarven common suite (p. 119). Its general purchase remains pending reconciliation with p. 310. The 146 absent prices remain null. A listed lifepath supplies its own price under p. 89. The evidence labels describe checks on entry metadata. They do not certify a line-by-line review of the article effects.

The identified stock suites include seven Dwarven, six Elven and seven Orc common traits. Playable lifepath history remains the Human pilot. The effect inventory lists 113 entries with manual creation dependencies, five marked automated, four unique play procedures and six outstanding classifications. Another 572 are currently classified for play. Review surfaces outstanding effects on owned traits. See [effect inventory](M2_TRAIT_EFFECTS.md) for names, pages and work remaining.

## Recovery checkpoint

Initial local implementation e805713, 7abc5ed, 879ff65. The corresponding published foundation ends at f62c443af8fdd175bb54887e8aa660164b755f43 in Draft PR #30. The PR head contains the follow-up inventory, effect handling, editor and tests. Resolve the current checkpoint with git rev-parse HEAD after checking out work/m2-trait-burner. Compare the PR head before resuming. Run the TypeScript check, the entire Vitest suite and the Vite production build. The local Windows preview uses port 4196. Local Vite dependency installation has a sandbox-only workaround for Windows mapped-drive detection.

For the next catalog pass, start with the six entries at the end of the effect inventory and the index-only rows. Verify unindexed stock chapter entries, record evidence per article, and audit manual dependencies against each newly implemented character subsystem. The hosted Workbench preview has a separate deployment history.

Checkpoint verification: TypeScript passed, 1,719 tests passed in 73 files, and the production build succeeded.
