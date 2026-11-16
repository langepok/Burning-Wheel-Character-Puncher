# UX refinement — 2026-11-17

Continues Draft #26 on #25. No parent branch, main or local runner was changed.
This pass preserves the existing engine/catalog and does not implement the
remaining Traits/Resources subsystems.

## User-test feedback addressed

| Time / annotation | Result |
| --- | --- |
| 00:31–01:36; 06:00–06:20 | Larger workspace; drag from cards without text selection or post-drag inspection; wheel zoom cancels page scroll only inside the map. |
| 01:45–02:02; 06:28–07:06 | Route lines run through row gutters above nodes with a light halo; repeats show step numbers and loops. Added Current lifepath; kept Fit history and stable camera on edits. |
| 03:36–05:21 | Current-setting banner/ring and pending-Lead explanation. Available, Lead needed, Birth only and Requires labels supplement colour; evaluator details remain accessible. |
| 07:15–07:32 | Visible Card details selector, resource points in Grants/Extended. Fit all marks overview; setting shortcuts restore readable size. |
| 02:12–02:50; annotation 1 | Gender no longer appears as a lifepath; remains undoable. Added Redo. |
| 02:58–03:26 | Centered Reset dialog with initial Cancel focus, Tab loop, Escape and focus restoration. Separate Remove last route action. |
| 07:54–09:52 | Existing roots, opening math and caps preserved; missing roots offer Allocate roots navigation. |
| 10:01–12:17 | Obvious selected pool and Use General action; Training has Learn/Refund, ownership state and cost beside controls. |
| 12:17–12:31 | Fixed independent shade/exponent slots and tabular numerals. |
| 13:15–13:58 | Per-skill pool totals, opening source, expandable ledger, spending summary and Only General spending filter. |
| 14:09–16:19 | Bounded-width skill cards in columns eliminate full-screen separation of skill names and buttons. |
| 18:18–19:27 | Pin path / Pinned text and tray directly beside the map. |
| 16:19–17:35; 20:12–20:44 | Inspector exposes loaded skill/trait lists and resource grants; incomplete editors remain labelled. |
| Annotations 4 and 6 | Age tooltip with age-table and adjusted stat pools; Leads collapsed behind Change setting. |

## RAW check

The 10:50–11:10 video shows Ordinary/General selection, not an Armor Training
subtype. No subtype rule was added. BWGR printed p. 90, Spending General Skill
Points, confirms that General-opened skills cannot advance with regular
lifepath points. The existing restriction and exact purchase refunds remain.
Training still costs two and has no exponent. No new RAW interpretation.

Printed page numbers are authoritative; the attached copy used for this review
has this paragraph on PDF page 90 as well. The older blanket PDF-offset note
in RULES_NOTES is not portable across copies.

## Validation

- `npm test`: 71 files / 1701 tests passed, including six new UI regressions.
- `npm run typecheck` and `npm run build`: passed. Vite retains its nonblocking
  >500 kB chunk advisory; catalog bundled locally, about 150 kB gzipped JS.
- Browser mouse: wheel inside map changed scale .95→.855 with page scrollY=0;
  dragging a card shifted camera by 70/65 px without selection or inspection;
  scrolling outside subsequently moved the page to scrollY=936.
- Browser: gender change did not add timeline steps; Undo/Redo round-tripped it;
  reset dialog was centered, focused Cancel and cancelled on Escape.
- Browser: Armor Training → Use General → Learn spent exactly 2 General;
  Refund restored both. The draft retained the existing age 23, stats and skills.
- Wide browser document: 2560×1080 iframe (2545px content after scrollbar),
  displayed at 50% for review. Skills form three 592px cards; no overflow.
  Training purchase/refund was exercised in that viewport. This is not a claim
  of testing on a physical ultrawide monitor.

## Remaining limitations

Existing 63-path Human pilot only. Traits/effects, Resources purchases, derived
attributes and final validation remain incomplete. Appropriate Weapons,
Wife-derived benefits and earlier optional-skill provenance still need manual
review as described in CHARACTER_WORKBENCH.md. No new RAW blocker was found.

Fit all is an overview of a tall catalog; dense histories can still overlap
route segments, and declared Leads may cross intervening regions. Desktop-first
minimum 1000px, English labels, one local draft, no cross-device sync. Undo/Redo
stacks do not survive reload; purchase provenance does. Touch/trackpad and
physical ultrawide hardware were not tested.
