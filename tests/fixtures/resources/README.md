# RAW fixture provenance

These expected values were transcribed directly from the user-supplied BWGR
2018 scan on 2026-11-22, before the implementation. They are not exported from
the resource catalog and tests must not generate expectations from that catalog.
The source PDF and rendered pages remain outside the repository.

`spells.json`: name, printed price, first printed page. All 17 pages (207–223)
were visually read in addition to OCR extraction. There are 67 entries. Wave
starts on 221 and its price is on 222. Wyrd Light's printed 4 on 223 is missing
from the PDF text layer. Preserve the printed prices, including Bilious Smoke
24, Courage 16, Dog's Ear 12, Emperor's Hand 12, Firewalker 10, Gray Cloak 8,
Sarch's Glare 12, Wall Walker 10, Witch Flight 6, Witch Key 12 and Wolf Snout 12.

Other fixture tables cite their printed pages. Quality and component vectors
derive from those pages' arithmetic, with unknown configurations explicitly
excluded. The p. 203 mixed-kit example independently checks 25 + 8 + 4 + 4 = 41.
M3-A2 projection vectors are specifications, not evidence of a working engine.

`purchases.json` armor columns: ID, poor suit, ordinary suit, superior suit,
ordinary helmet/breastplate, ordinary greaves/leggings. Missile columns: ID,
poor, ordinary, superior. Fixed rows are ID, rps, printed price page.
All 30 named Property alternatives on p. 205 are enumerated separately.
`m3-a2-vectors.json` is a future-engine acceptance fixture. No test currently
claims to execute these transactions or starting-ability calculations.
