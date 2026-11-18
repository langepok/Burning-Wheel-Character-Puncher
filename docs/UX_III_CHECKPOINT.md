# UX Refinement III — completion record, 2026-11-18

Branch: work/ux-refinement-iii, stacked on PR27 work/workbench-ux-review.
Base GitHub e4c1ae9f7835079b347de6f005c8153999dbc523; equivalent deployed source
37e30cb6667b26491ae01da56a609c9cc1dad770, tree 86f9ac44ba649bee9cc1947ec9111b92434d07ed.
First durable checkpoint: GitHub 04b14b1719f5cf7c42da2739e0e37b96ebe6ab86
(local bea8827cb525721faeea556d6e8a7072966e53f2). Current HEAD is this document's
containing branch commit; use git log rather than an inevitably stale self-SHA.
No parent branch, main or runner modified; no merge authorized or performed.

## Acceptance evidence

- Expanded map fills viewport, inspector and controls retained; camera and
  selection survive Escape/close; background scroll locked and controls inert.
- Stable four-column setting cards, catalog M/P grants and General points shown.
- Hover temporarily overrides persistent selected Leads; blank click clears;
  physical drag retains selection and leaves browser text selection empty.
- Actual browser wheel .9→.81 kept scrollY=0; pan moved camera; Escape retained
  exact camera transform. Non-map wheel cancellation remains covered by test.
- Route edges are chronology, not requirements. Adjacent-row detour previously
  retraced a gutter, creating a spur; now routes directly. Same-row nonadjacent
  edges avoid intervening cards. Declared Leads use outer rails and row gaps.
- Village Tough→Corrupt Sergeant retains the original prior-family requirement;
  no catalog/RAW restriction removed. Manual reproduction shows one green route.
- History shows repeat-adjusted contribution, age and separate Lead entry;
  disclosure labels skill/trait lists as options. Gender remains invisible.
- Lead+Village Tough confirmation added 1+3 years; Ctrl+Z removed both steps;
  Ctrl+Y restored both. Modal blocked Ctrl+Z; unit test verifies Escape closes
  modal while leaving expanded workspace open.
- General context warning preserves existing opening restrictions and refunds;
  no skill-card redesign. Bonus-pool choice is highlighted and browser-tested.
- Browser reload restored demo draft, purchases and choices. Existing import/
  export/parser regressions retained. No schema change.
- Desktop browser 1363×936 and real iframe document 2560×1080 tested in both
  modes. Wide expanded workspace 2544×1064; no horizontal content overflow.
  Wide view is a scaled browser iframe, not physical ultrawide hardware.

Validation: 72 test files / 1708 tests passed; typecheck and production build
passed. Vite retains >500kB chunk advisory (~151kB gzip JS). Seven new tests cover
map state, shortcuts, modal priority, atomic transition, contribution accounting,
geometry, stat grants and General warning. Screenshots accompany delivery.

## Limits / next step

63-path Human pilot, English desktop interface; dense routes can share gutters.
Declared Lead rails can overlap each other; they are not prerequisite arrows.
No touch/trackpad hardware verification. Undo/Redo stack is session-only.
Existing manual cases: Appropriate Weapons, Wife benefits, earlier optional-skill
provenance. Traits purchasing, Resources shopping, derived attributes and final
certification remain intentionally out of scope. No new RAW ambiguity found.
Next implementation: trait ownership and required-trait accounting, see roadmap
in CHARACTER_WORKBENCH.md. Do not repeat prior video/catalog audits.

Publication: existing Site appgprj_6afa2b9c3234819193fa9da464e9445a, preserve access.
Recover from this branch or Site source, never main. Source and GitHub commits
may differ in parent metadata; compare trees to establish exact equivalence.
