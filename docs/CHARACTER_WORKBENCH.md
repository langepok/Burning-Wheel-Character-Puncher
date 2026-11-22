# Character Workbench — delivery and continuation

Historical initial delivery: built from Draft PR #25 (`c77bf24`), not main.
The work branch was isolated from
`m1-ux-visual-lifepath-map`; no runner branch was edited and no PR was merged.

## Working slice

- Existing 63 Human lifepaths, eligibility, Leads, accumulated ages, map route.
- Readable initial map, exact substring search, setting shortcuts, density,
  expansion, inspection and persistent pins.
- Six stat allocations; distinct mental/physical pools, age/repeat-adjusted
  grants, explicit M/P choices and approval-gated gray shades.
- All loaded lifepath skill lists, plus named Wise/History topics and Flute.
- Searchable general catalog with root filter, source pages and FoRK guidance.
  Adding a candidate spends no points. Ordinary is the initial selected pool;
  General spending is explicit, with provenance retained for every purchase.
- Skill opening, advancement, Training, default caps, restrictions/prerequisites,
  exact per-skill refunds, root-dependent recalculation and visible violations.
- Autosave, validated JSON import/export, reset and in-session Undo.

The implementation is separated into source data (`src/data/burning`), pure
projection (`src/rules/burning.ts`), commands/persistence
(`src/character/workbench.ts`) and UI. Existing catalog audits were not repeated
or rewritten.

## Verification

`npm test`: **71 files / 1695 tests passed** (baseline: 1680).
`npm run build`: passed, including TypeScript. Vite reports the 500 kB chunk
advisory: the catalog is bundled locally (~148 kB gzip total JS); code splitting
is a future optimization, not a failed build.

Browser walkthrough in the managed preview:
Born Peasant → Farmer → Miller; age 23; M7/P17;
Will B3, Perception B4, Agility/Speed/Power B4, Forte B5;
Farming/Miller B3, Cooking/Mending B2. Ordinary balance 7/13.
Sword rejected from Ordinary with an explanation, then opened at B2 using
General (2/3 remaining). Reload preserved identity, stats and purchases.
Catalog display and the full workbench were visually inspected and captured.

UI regressions additionally cover full reset/Undo, candidate add without spending,
General provenance, reload, existing Born restrictions and Lead routes. Rules
tests cover exact refunds, Training, mixed roots, approval/cost, overspending,
source removal, prerequisites and malformed imports.

## Honest boundaries

This is not a complete playable-character validator. M2 (merged PR #30) added
trait purchasing, required/common traits and audited effects, with remaining
manual/review cases documented in M2_TRAITS.md. Resources in the UI are still a
point budget, not the Resources exponent. M3-A1 now supplies an audited purchase
catalog and data contracts; shopping, social purchases and spell purchases are
not wired into the workbench. See [M3_RESOURCE_CATALOG.md](M3_RESOURCE_CATALOG.md).
Health, Steel, Circles, other derived values, Beliefs and Instincts still need
editors. Only the existing Human pilot is loaded, not all stocks/settings.

Appropriate Weapons and Wife-derived benefits need contextual choices; the UI
flags these. Optional-skill ownership on an earlier path can shift a later
required skill; it is flagged for review because per-path optional provenance
is not stored yet. Arbitrary custom topics/instruments are not authorable.
Shade choice for skills is made on opening; to change it, refund and reopen.

Desktop-first layout (minimum width 1000 px), English rules labels, one local
saved draft per browser. No cross-device sync or phone layout. Undo snapshots
do not survive reload; per-purchase refunds do. The historical UX specification
was used; the original graphical variant-B mockup could not be located in the
available sources, so visual fidelity to that image is not claimed.

## Run and continue

`npm ci`, `npm test`, `npm run dev`. Production: `npm run build`.
`docs/CHARACTER_BURNER_UX.md` remains the broader UX contract. D-030 records
persistence and reversal policy. PR #25 and M2 are complete. After review of the
M3-A1 catalog, the next slice is M3-A2: Resources purchase ledger and projections;
M3-A3 adds its UI. Preserve the existing preview and independent automation.

## UX refinement follow-up

See [UX_REFINEMENT_REVIEW.md](UX_REFINEMENT_REVIEW.md) for the user-video mapping,
updated 1701-test verification, browser evidence and remaining limits. D-031
records Redo, timeline separation and bounded-width skill-card decisions.

## Next work after UX III

1. Trait ownership milestone M2 is complete; retain its manual/review boundaries.
2. Review M3-A1 data, then implement the Resources ledger and its UI in M3-A2/A3.
3. Derived attributes and transparent Health/Steel questionnaires, then a complete
   sheet with final validation and Beliefs/Instincts.
4. Campaign settings as a separate layer: distinguish RAW defaults, campaign
   parameters and explicit house rules (e.g. four-lifepath limit or altered caps).
   Never silently relabel a GM override as RAW. No campaign editor in UX III.

See UX_III_CHECKPOINT.md for continuation and acceptance evidence.
