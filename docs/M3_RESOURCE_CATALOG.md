# M3-A1 — Human Resource Catalog

## Acceptance criteria (before implementation)

- Audit BWGR printed pp. 83–84, 93–97, 202–205 and 207–223 directly;
  visually check spell prices, equipment tables and source ambiguities.
- Give each definition a stable explicit ID, stock scope, source and separate
  semantic/accounting categories. Cover every Human Resources entry, property
  alternative, social purchase, spell, cash and paid weapon addition.
- Preserve printed spell prices even when the general pricing guidance differs.
- Represent quality, fractions, included components, unknown prices and unavailable
  options distinctly. Never convert an unresolved cost into zero or a guess.
- Keep physical-item IDs separate from purchase IDs and future combat profiles.
  Model social composites, child charges and exact recorded refunds.
- Reuse existing source, stock, skill, fraction, mode and shade types. No UI,
  purchase/refund engine, draft migration, or changes to existing calculations.
- Document RAW, accepted decisions and open interpretations separately; preserve
  D-027 and D-033–D-036. Provide M3-A2 vectors and M3-A3 contracts.
- Check data against independently transcribed source fixtures and validate
  registration failures. Run typecheck, all tests and production build; draft PR only.

### Final contract refinement acceptance (2026-11-22, before edits)

- Armor advertises an optional included shield; the purchase explicitly selects
  included components. No automatic shield from a suit or a single piece; no new
  full-suit-only restriction. Independently priced shields/helmets remain possible.
- Relationships, companions, affiliations and reputations have editable names
  and descriptions. Reputation supports a free audience/scope without an
  organization ID or polarity. Dice, charges and relationship modifiers remain
  structured and are never inferred from that text.
- Saved funding retains source and charge only. Current access is a projection
  recalculated on trait changes, including adding/refunding Outlaw; it is not
  an irreversible property of the funding history. Specify future-engine cases.
- Property staff is a context-dependent descriptive benefit, not an NPC factory.
- Preserve 144 definitions, 67 spell prices, existing RAW constraints and all 14
  unresolved questions. Add targeted catalog/type-contract checks and run full
  tests, typecheck, build and CI on PR #32. No purchase engine or UI.

## Checkpoint and scope

Base: `main` at `c9ff741547e6ef3297a384e79ddf8f02e660f69c`; M2 PR #30 is
complete. Work branch: `work/m3-a1-resource-catalog`. A fresh clean clone was
used; existing checkouts, their previews and Sol's automation were untouched.
D-027 and D-033–D-036 remain in force. The explicit final-refinement decisions
are recorded as D-037–D-039: optional equipment/contextual staff, free social
descriptions and derived funding access. These are project contracts, not newly
inferred RAW. All 14 unresolved questions remain open.

This delivery is data, registration checks, compile-time transaction/projection
contracts and a future-engine specification. It does **not** wire resource
purchases into Sheet, draft persistence, Undo/Redo or the UI. Existing lifepath,
stat, skill and trait runtime files are unchanged. Tests of catalog declarations
are not a claim that purchase, refund or starting-ability operations work yet.

## Source audit

The user-provided 2018 BWGR scan has 604 PDF pages; PDF page = printed page + 2
throughout the audited ranges. `SourceReference` records both, plus the section.
The book, extracted text and rendered images are not committed.

| Printed pages | Checked scope |
| --- | --- |
| 83–84 | Stock-specific choices; resource grants and diminishing returns |
| 93–97 | Spending, relationships, social tiers/limits, gangs, companions, starting abilities |
| 164, 169, 177 | Country/Village/City Wife resource fractions |
| 200, 339 | Outlaw funding/access split; p. 200 also distinguishes Gifted casting permission |
| 202–205 | Every Human Resources heading, price tier and named Property alternative |
| 207–223 | All 67 Sorcery spells: names, printed prices and page spans |
| 479–480 | Mixing armor, half pieces, shield types; no invented pricing formula |
| 554–558 | Physical weapon vs profile distinction, modifications and ammunition types |
| 331–332 | Examples of trait-granted social benefits, as integration dependencies |

The 17 spell pages, Human price/description pages, social/ability pages, armor
customization and modification tables were inspected as images as well as text.
In particular, the text layer omits Wyrd Light's price; the image on p. 223
clearly prints **4 rps**. Wave begins on 221 but its price appears on 222.

Fixtures are separately transcribed source expectations, not exports of catalog
constants. See `tests/fixtures/resources/README.md`. Independence here means
separate source transcription and comparison, not a claim of a second reviewer.

## Coverage and catalog granularity

`src/data/resources/index.ts` exports 144 definitions:

| Semantic category | Definitions | Scope |
| --- | ---: | --- |
| Gear | 40 | Arms, seven missile choices, six armor types, nine ordinary gear/animal choices, Workshop, Herd, three modifications, ten ammunition heads, two shield acquisition representations |
| Property | 31 | Rent plus all 30 separately named alternatives on p. 205 |
| Relationships | 2 | Configurable ordinary relationship and fixed-price accompanying NPC |
| Affiliations | 1 | Three price/dice tiers |
| Reputations | 1 | Three price/dice tiers |
| Cash | 1 | Six rps for one expendable die |
| Composite | 1 | Gangs and Crews, paid through linked children |
| Spells | 67 | Complete pp. 207–223 purchase list |

These are **definitions**, not 144 independently priced single-item buttons.
Selected included shield and standard arrow/bolt heads are child components; standalone shield
has unknown cost; Gangs and Crews is an uncharged container. Quality, armor parts
and social ratings are configurations, not accidental duplicate definitions.
Different Property alternatives with the same price remain distinct IDs.

Arms is the acquisition of melee weaponry. Swords, axes, daggers and the other
appropriate hand weapons are declared contents, not individually priced copies
of the Arms entry. The complete combat profile table is deliberately not copied.
Pistols/arquebuses and their standard ammunition are covered by missile entries;
no special firearm-ammunition prices are invented. Found weapons and bombs in
the appendix do not establish additional starting purchases with known rps.

The catalog is scoped to Human purchasing data, including choices whose required
skill or lifepath is outside the loaded pilot. Presence in the catalog does not
waive requirements. It does not claim coverage of every other stock, magical
item, later-play acquisition or custom-content rule.

## Confirmed prices and formulas

### Gear and armor

| Acquisition | RAW price / rule | Source |
| --- | --- | --- |
| Arms | Poor 3; ordinary 5; superior 20 | 202 |
| Missiles | Ordinary throwing 3, hunting bow 5, great bow 10, crossbow 7, heavy crossbow 12, pistol 15, arquebus 20 | 202 |
| Missile quality | Poor = ceil(ordinary / 2); superior = ordinary × 3 | 202 |
| Armor full suits | Ordinary gambeson 3, reinforced leather 6, light mail 10, heavy mail 15, plated mail 20, full plated mail 50 | 202 |
| Armor quality | Poor suit = ceil(ordinary / 2); superior suit = ordinary × 4 | 203 |
| Ordinary full pieces | Helmet/breastplate = ceil(suit / 2); greaves/leggings = ceil(suit / 3) | 202–203 |
| Weapon modifications | 1 rp each per weapon; 4 each on a superior weapon | 202 |
| Special arrow/bolt heads | 1 rp per special type, with as many heads of that type as needed | 202, 557–558 |

The independent p. 203 example totals 41 rps: full-plated helmet 25, heavy-mail
breastplate 8, light-mail greaves 4, light-mail leggings 4. Poor/superior individual
parts and half-piece prices remain unknown. Do not combine multiplication and
rounding into an unverified general armor formula.

The p. 479 rule permits replacing purchased suit pieces with lighter pieces;
heavier pieces may be purchased separately. It states no resource refund for
trading down. Half sleeves/leggings have mechanical treatment on p. 480, not an
explicit rps discount. The constructor can record these changes later, with
source and identity preserved, without assuming every configuration is priced.

Workshop, Herd and Rent explicitly contribute to **Resources** as property
(204–205). Ordinary mounts, warhorses and companion animals have no such clause.
Their possible Circles reclassification is tracked separately below.

### Relationships, affiliations and reputations

Ordinary relationship base prices: minor 5, significant 10, powerful 15 (93).
Applicable discounts add, with a floor of 1: immediate family −2, other family
−1, romantic −2, forbidden −1, hateful/rival/extremely unfriendly −2 (94).
The book's minor cousin-and-hatred example costs 2. Represent family as one
choice, and the other modifiers as booleans, so the same discount cannot be
repeated. This is the data representation; fictional compatibility still needs
review. The recommendation of one or two important relationships is **not** a
purchase cap.

The accompanying bodyguard/squire/apprentice exception costs **10**, without
ordinary discounts (96). The NPC must be a full character: two fewer lifepaths
than the PC's campaign **limit**, a lower starting exponent cap (6→5 example),
their own gear and a reciprocal 10-rp relationship. Those reciprocal points are
spent from the NPC's budget, not again from the PC's. Missing or too-small
campaign limits need a diagnostic rather than an invented NPC stat block.

Affiliations: 1D/10, 2D/25, 3D/50. Reputations: 1D/7, 2D/25, 3D/45 (95).
Each has a maximum of three **purchased** entries, each tied to a specific,
different organization (96). Affiliation needs a specific one-sentence
description and an organization within the character's Circles (94). Reputation
needs its fiction and applicable local/regional/national scope. Same-group
affiliation plus reputation is valid, including the explicit Gang composition.
Neither directly adds its dice to the base Circles exponent.

Gangs and Crews require a relationship to the senior member (or second-in-command
when the PC leads), an affiliation with the group and a reputation within it.
The three child charges contribute independently. Property's incidental staff
does not grant these other paid purchases; a named important NPC or mechanically
represented group follows the appropriate relationship/composite rules.

### Spells

All **67** entries have fixed printed prices and require Sorcery to purchase
(207). Gifted governs casting; do not silently substitute a Gifted-only purchase
gate for the printed Sorcery requirement. Spell effects, facets, actions, learning
and casting are outside this stage.

The generic guidance on 205 is 2 rps per obstacle, or 4 for the marked variable
effect; ranges use the middle (the printed 1–10 example uses 5); stat-based costs
use a stat of 5 plus any base obstacle. It is guidance for pricing custom spells,
not permission to overwrite printed prices.

Examples preserved despite apparent disagreement: Bilious Smoke 24, Courage 16,
Dog's Ear 12, Emperor's Hand 12, Firewalker 10, Gray Cloak 8, Sarch's Glare 12,
Wall Walker 10, Witch Flight 6, Witch Key 12 and Wolf Snout 12. No erratum is
inferred. Names with apostrophes have explicit stable IDs, independent of labels.

## Model and integration contracts

`ResourceDefinition` is read-only declarative catalog data. It has stock scope,
source, semantic category, explicit accounting flags (or a referenced unresolved
Circles classification), pricing alternatives, configuration kind, restrictions,
grants and parent/target relationships. Shared `SourceReference`, `StockId`,
`SkillId` and `Fraction` types are reused. Registration is stock-independent;
it rejects duplicate IDs, invalid numeric prices, missing sources, unknown
question IDs, broken links, cyclic composition and double-counting containers.
It is a typed-content validator, **not** a decoder for arbitrary JSON imports.

Armor definitions now advertise `includedOptions` instead of `shieldIncluded`.
Configuration stores `selectedIncludedDefinitionIds`, initially empty. A suit or
individual piece with an empty selection grants no shield. The model retains
selection without declaring a new full-suit-only rule or resolving the composition
of every possible kit. Registration checks that each option exists and names its
parent in an `included` price; an option is not an unconditional dependency or
materialization instruction. Selected components later retain purchase/item links.
Independently priced stock-specific shields and helmets remain ordinary catalog
definitions; no other stocks or new prices were added.

Property's `staffIncluded` flag is replaced by
`propertyBenefits: { staff: 'as-appropriate' }`. This is a descriptive entitlement
under p. 205, not a staff count, NPC identity, generator or free social purchase.

`ResourceCost` distinguishes fixed zero/positive price, unknown price, unavailable
purchase and inclusion in a parent. An unresolved price cannot enter an automatic
Rules quote; Free Creation needs an explicit paid cost and override provenance.
An unavailable option is not a hidden zero-cost option. Fixed prices retain
`printed` vs `derived` basis. Higher pricing forms describe quality, armor,
relationships, rating tiers, target quality and sums of child purchases.

`src/character/resource-contracts.ts` provides compile-time boundary contracts:

- **ResourcePurchase:** instance ID, definition ID, typed configuration,
  immutable `originalPaidRps`, original funding pools, source/revision and mode,
  explicit overrides, group/parent/item references and declared item identities.
- **ResourceItemDeclaration:** physical ID, name, kind, quality, source and
  optional external profile references. Multiple profiles may point to one item
  (D-027); no hands, body slots, combat statistics or equipment runtime.
- **ResourceProjection:** known/incomplete budget and balance, paid totals,
  qualifying expenses, starting abilities, physical declarations, separate social
  bonuses, current `fundingAccess` and actionable diagnostics. Never treat a
  missing Wife grant as zero.
- **ResourceBurningChoices:** manual `roundUpResources` defaulting to false;
  gray Resources choice and its separate RAW permission requirement. D-035 removes
  a special approval workflow only for the rounding checkbox.

Relationships and companions have editable titles (`name`) and free descriptions
as well as their separate NPC name/identity. Specialized `affiliation` and
`reputation` configurations share name/description/scope and an optional
`organizationId`. Reputation additionally describes its audience freely; neither
purchase nor projected bonus requires a registered organization. Dice rating,
original charge and relationship modifiers remain structured values. There is no
reputation polarity field, sentiment calculation or automatic context modifier.
A reputation such as “Associates with the Rangers” may be received differently
by different inhabitants of Bree without changing its recorded dice or cost.
Existing social-limit metadata remains; descriptive context may require review,
not mandatory registry IDs or inference of mechanics by parsing prose.

`ResourceFundingAllocation` holds only pool ID, paid rps and source. Historical
funding no longer stores `access`. `ResourceFundingAccess` is a projection entry
keyed by pool ID with current available/restricted/unresolved status and reasons.
Adding/refunding Outlaw, Undo/Redo or importing a draft must recalculate these
entries from active traits and conditions. A resource refund restores the original
sum and origin, then applies current conditions; it cannot restore a stale lock.
Outlaw's access restriction is not an inability to spend its rps. Other conditions
are reevaluated too; dropping Outlaw does not blindly unlock every pool.
Five future-engine scenarios are specified in `m3-a2-vectors.json.outlawFunding`.
The treatment of restricted assets in starting attributes and mixed funding is
still unresolved. No access evaluator or history operation is implemented here.

Multiple instances of the same definition are allowed. For example, a superior
Arms purchase may declare axe A, axe B and dagger C. A 4-rp Beak charge targets
axe A, while a 4-rp Weighted Pommel charge targets axe B; total 28. Refunding the
Beak restores its original 4, leaving the other items intact. The parent relationship
must be validated against the target item's owner; item and purchase IDs are not
interchangeable. Modifications must use the actual target quality.

Gangs have zero own debit and linked paid children. A displayed group total is
derived; never store that sum as an additional charge. Parent removal must either
cascade atomically or be rejected pending child removal. Shared item links cannot
become dangling, and each original charge is refunded exactly once.

Future import validates unique transaction/item IDs, graph references, allowed
configuration, integer costs, funding sum = paid cost and catalog revision/source.
It recomputes diagnostics but never reprices an existing transaction merely
because a path or catalog changed. Rules and Free Creation share evaluation;
Free Creation retains explicit violations. Draft schema/version migration,
history integration and parsers are M3-A2 work; current version-1 saves are untouched.

## Starting calculation contract (p. 97)

Let R be paid rps on qualifying property, reputations and affiliations; let C be
paid rps on qualifying property and relationships. Children are counted once;
granted trait dice have no fictional paid price. Gear, cash and spells contribute
to neither; relationships contribute only to C; affiliation/reputation only to R.

- Raw Resources exponent = floor(R / 15).
- D-035 checked: ceil(R / 15); unchecked: floor(R / 15). Zero stays zero and an
  exact multiple does not gain a point. Budget and item prices never change.
- RAW So Close! eligibility is a separate diagnostic: all rps spent and shortfall
  to the next exponent is 1 or 2. The checkbox is manual, not gated or auto-selected.
- Gray Resources spends five **exponent points** with GM permission, not five
  rps. A future engine must diagnose insufficient exponent; it must not go negative.
- Base Circles = max(1, floor(Will / 2)), with Will's shade; add one if C ≥ 50.
  Spending 100 does not add two. An unallocated Will is incomplete input, not a
  certified Circles 1. Lifepaths determine base scope; social bonuses stay separate.

Unresolved property-accounting or Outlaw interactions make projection provisional
and must retain a diagnostic. `tests/fixtures/resources/m3-a2-vectors.json`
provides machine-readable expected cases for the future engine; M3-A1 does not
pretend to execute them. They cover thresholds, exact multiples, manual rounding,
gray shade, the Will minimum, family discounts, companion exceptions, composites,
repeat grants and refund/identity scenarios.

Resource budget comes from existing repeat-adjusted lifepath grants. On p. 84
the first and second occurrence pay full resources; third and fourth half.
Existing project D-013 applies upward rounding and continues the diminished
grant on later repeats. Reuse `resourceContribution`, do not fork that logic.
Family identity spans settings per the existing catalog. Country/Village Wife
add half and City Wife a quarter of the husband's resources; those grants and
rounding/order are not implemented by treating the existing base-5 placeholder
as a final total. Preserve `WifeDerivedGrant` and mark incomplete inputs.

## Unresolved questions and recommended treatment

All IDs below are represented in `resourceQuestions`; recommendations are **not
newly adopted RAW or automatic eligibility rules**.

| Question | Observation and alternatives | Recommendation for review |
| --- | --- | --- |
| `superior-armor-parts` | 203 says four times a full suit; prorating a superior piece vs paying a full superior suit is not explicit | Keep partial price unknown |
| `poor-armor-parts` | Order of quality/part rounding is unstated; 96 says a one-point gambeson while the example pays two | Use confirmed full suits; resolve parts and the example separately |
| `armor-half-pieces` | 479–480 allows customization but gives no rps discount, including half greaves/sleeves | Record configuration without a guessed half-price formula |
| `property-threshold` | 205 stars 40 but prose says >40; aggregate vs per-acquisition, unstarred ships and property-like gear may differ | Preserve stars/exception names and require review before enforcement; do not infer a hard ≥40 cap |
| `arms-composition` | 202 gives idiom and examples, not a numeric maximum | Reviewed appropriate bundle, no per-weapon surcharge and no unlimited arsenal |
| `weapon-modification-stacking` | 555 allows Beak on polearm/axe/spear, pommels on any weapon; repeated/multiple modifications are unspecified | Preserve individual compatibility; review stacking and already built-in profiles |
| `relationship-combinations` | 94 demonstrates additive family/hatred; does not enumerate every fictional combination | One family value and boolean modifiers, floor 1; contextual review for contradictory fiction |
| `companion-limits` | 96 requires two fewer LPs and lower cap; unusably low/unspecified campaign limits are unaddressed | Require full NPC, reciprocal cost and valid campaign parameters |
| `wife-grants` | 164/169/177 resource fractions lack rounding and repeat-order guidance | Preserve unresolved grants; D-013 alone does not settle this different fraction |
| `outlaw-pools` | 200/339 permits spending certain resources but restricts access until trait removal | Preserve pool provenance; derive current access per D-039; audit restricted/mixed-funded assets and starting attributes in A2 |
| `spell-price-discrepancies` | Printed prices differ from 205's generic guidance | Printed spell price controls; no silent erratum |
| `shield-standalone` | 203 grants an included kit shield, not a separate price | Included child only; standalone cost unknown |
| `property-circles-inclusion` | 204–205 reclassifies Workshop/Herd/Rent specifically when factoring Resources; 97 Circles excludes gear | Resources is confirmed; include/exclude for Circles only after explicit interpretation |
| `social-trait-interactions` | Purchase cap is three; traits can grant additional social benefits and conditional bonuses | Keep granted and paid sources separate; audit interactions before final certification |

The p. 205 eligibility names include reference-only lifepaths outside the pilot.
Resolve to explicit catalog families when integrating; never match decorated UI
labels. In particular the book prints **Master of Horses** for Herd and
**Master of Horse** in the Property exception list. Treat these as source labels
requiring explicit alias resolution, not two automatically different careers.

## M3-A2 acceptance and M3-A3 handoff

M3-A2 should first resolve which flagged configurations it will support. It can
ship known prices while retaining review-only entries; it need not invent missing
RAW. The core criteria are:

1. Pure quote/validate/commit/refund operations; exact original paid-rp restoration
   and reusable funding provenance. Tests precede implementation.
2. Typed configuration/eligibility validation: Sorcery, herd prerequisites, social
   descriptions/caps, companion links, parent identity and addition compatibility.
3. Unknown price is blocked in Rules; reviewed/free override preserves reason and
   actual charge. Unavailable, incomplete budget and included are distinct.
4. Independent vectors above plus whole-transaction tests: repeated purchases,
   path edits, missing sources, Rules/Free transition, no duplicate spend, child
   removal and exact Undo/Redo/Reset/import persistence.
5. Use p. 97 accounting and D-035 without mixing rps/exponents or bonus dice/base
   Circles. Preserve unresolved accounting diagnostics and trait-grant provenance.
6. Audit active Human trait interactions (especially Outlaw and conditional social
   benefits), Wife grant resolution and known family aliases before certification.
7. Full existing regression suite, typecheck and build; no unrelated burner changes.

M3-A3 consumes definitions, quotes, projections and reason codes. Show gear/property,
relationships/social assets and spells as meaningful groups. A display category
must not decide arithmetic. Staging a candidate spends nothing. Relationship
inputs supply title, NPC name, description, significance, family, romance, conflict and
conditions; companion flow requires a linked full character. Organization identity
is optional for independent affiliations/reputations; reputation audience/scope
are explicit free text. Surface original charge, parent item and source.
Show review/unknown costs honestly and keep `Round up Resources` off by default.
Do not build a GM-approval flow for that checkbox.

Inventory will consume item declarations; the Weapon Constructor will attach
modifications to physical IDs and expose profiles; Armor Constructor will add
audited piece/substitution metadata. Fight! owns coverage, damage, hands and use
profiles. Sorcery owns effects and casting. None of these is required to enumerate
the acquisition catalog or preserve its original transactions.

## Verification

Initial source tests were written before catalog implementation and failed on the
missing module. The original source/data suite added **170 tests** (baseline
1739), with **74 files / 1909 tests** passing at the initial checkpoint.

Final contract refinement adds **19 checks** in
`tests/character/resource-contracts.test.ts`. Before implementation, catalog
assertions failed on the automatic grant flags and missing option validation;
typecheck failed on the missing refined contracts. After implementation,
**75 files / 1928 tests pass**, as do typecheck and production build. The
compile-time checks require typecheck: Vitest alone does not enforce types.
Five Outlaw vectors specify future behavior and are not counted as executed
engine tests. Existing 170 catalog tests, price fixtures, all 144 IDs and the
67-spell transcription remain intact. No Lifepaths/Stats/Skills/Traits runtime,
UI, dependency, automation or saved draft format was changed.
Production build passed, with the existing Vite >500 kB chunk advisory (671.14 kB
main JS, 177.54 kB gzip). No UI or bundle integration was added. Remote CI is
recorded separately in the Draft PR checkpoint; local success is not called CI.
