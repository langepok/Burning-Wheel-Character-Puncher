# M3-A3 — Resource Burner UX plan

**Design checkpoint: 2026-11-24 (Europe/Moscow). Planning only.**

This document selects the UX and specifies the next implementation pass. It does
not implement a purchase UI, migrate a save, change RAW, or supersede an accepted
decision. English control labels below match the existing application's language.
The [continuation checkpoint](M3_RESOURCE_UX_CHECKPOINT.md) records research and
the exact repository state.

## 1. Verified foundation and implementation gate

| Evidence | Verified state for this design |
| --- | --- |
| Stable `origin/main` | `cb748b87036e495a5d509dff810d6888cd1c1ff0`; M3-A1 integrated |
| [M3-A2 PR #33](https://github.com/langepok/Burning-Wheel-Character-Puncher/pull/33) | Open **Draft**, not merged; head `a21de80c2ce0d7eccc3e092bbe22edb10a978b88` |
| Engine validation | Green CI on that draft is evidence about that commit, not integration or independent audit acceptance |
| Planning base | Separate `docs/m3-a3-resource-ux-plan` branch from stable main |
| Stable Resources UI | Placeholder; catalog/contracts exist, purchase controls do not |

**Gate G0:** before writing M3-A3 game/UI code, fetch main, establish that audited
M3-A2 is integrated, verify the integrated commit's CI, and reconcile the API table
in §9 with the final contracts. GitHub's `merge_commit_sha` on an open PR is not
proof of integration. Do not use PR #33 directly as the stable UI base or merge it
to satisfy this gate. The design can be completed while the gate is closed.

### Evidence used

- [Character Burner UX](CHARACTER_BURNER_UX.md), [Workbench](CHARACTER_WORKBENCH.md),
  [UX III checkpoint](UX_III_CHECKPOINT.md), [refinement review](UX_REFINEMENT_REVIEW.md),
  [UX roadmap](UX_ROADMAP.md), [decisions](DECISIONS.md).
- Stable `src/ui/SheetEditor.tsx`, `TraitEditor.tsx`, `App.tsx`, `app.css`,
  `src/character/workbench.ts`, resource definitions and acquisition contracts.
- [M3-A1 catalog and open questions](M3_RESOURCE_CATALOG.md).
- Provisional engine documentation at the inspected head:
  [M3_PURCHASE_ENGINE.md](https://github.com/langepok/Burning-Wheel-Character-Puncher/blob/a21de80c2ce0d7eccc3e092bbe22edb10a978b88/docs/M3_PURCHASE_ENGINE.md),
  plus its actual request/quote/projection/command/parser code. Engine-specific
  statements below describe that head and must pass G0.

**Live follow-up completed, 2026-11-24:** the stable application was inspected in
the cloud browser through the supported managed preview, at a 1363 × 936 CSS-pixel
viewport. Screenshots and targeted interactions covered Skills, Traits, their
catalogs, the Lifepath Map and the Resources placeholder, using an authorized test
character. The [checkpoint](M3_RESOURCE_UX_CHECKPOINT.md#live-visual-follow-up)
records the exercised cases and a reproducible preview procedure. This closes the
earlier access gap; it is not a formal usability study, a full accessibility or
responsive audit, or validation of the unimplemented Resource Burner. Its visual
and keyboard acceptance checks remain explicit implementation gates.

### Existing strengths to carry forward

| Existing solution | User problem it solves | Resource adaptation |
| --- | --- | --- |
| Skills: exponent, ± controls and source spend together | Attention does not shuttle across a wide row | Configuration, quote, projected balance and Buy live in one card |
| Skills: separate ordinary/general spending | A number alone hides where it came from | Expandable funding breakdown; actual paid source remains inspectable |
| Traits: Considering versus Owned | Browsing is not a purchase | Prepared configurations are independent of the paid ledger |
| Traits: multiple disclosures stay open | Comparing one choice does not erase another | Several editable preparations remain open simultaneously |
| Traits catalog: quick add without changing selection | Building a shortlist does not restart discovery | Prepare several entries in one catalog visit; keep search and scroll |
| Map: actual route versus possible connections, retained context | Exploration and committed history are different | Preview overlays never change actual budget; keep selection and focus on return |
| Workbench: whole-draft Undo/Redo and explicit import | Repairs should be reversible and portable | Purchase/composite/refund commands produce one coherent draft edit |

The live pass supports this direction: compact Skill cards put the exponent,
controls and paid points together; two Trait cards stayed expanded across tab
changes; catalog quick-add preserved the inspected trait without spending TP.
Map inspection and expanded-map return preserved the selected path and kept
exploration separate from the recorded route.

Two details should be improved deliberately for Resources. The existing Traits
catalog resets search on close/reopen; the retention required in §3 is therefore
a new Resource UX requirement, not an existing behavior to assume. The inspected
Skill catalog did not show the active point budget inside its dialog; Resources
must keep its actual budget and local quote visible while the catalog is open.
Focus restoration remains an acceptance requirement, not a defect established by
this targeted inspection.

## 2. Selected concept: a purchasing workbench

The player works with three distinct things: **catalog definitions**, **prepared
acquisitions**, and **owned acquisitions**. A preparation is a particular proposed
purchase, including its title, choices and contents. Two preparations may refer
to the same definition without being the same transaction.

The default Resources view is a work surface, not a catalog dump. An on-demand
catalog feeds independent preparation cards. Owned acquisitions remain visible
beside them. Actual rps, the active card's possible effect, and starting abilities
have visibly different labels. No preparation reserves points.

| Alternative considered | Strength | Reason for the selection |
| --- | --- | --- |
| One catalog and one inspector | Compact; familiar discovery pattern | Replacing the inspector makes a long relationship or Arms configuration hard to compare and retain |
| Shopping cart with one global checkout | Familiar total and batch action | Treats alternative suits as cumulative intent; encourages giant forms and ambiguous partial checkout |
| **Independent preparations + owned ledger** | Compare alternatives, finish at different times, keep fiction and mechanics together | Selected; slightly more explicit state, justified by very different purchase complexity |

UX choices made here (not new game rules):

1. No forced preparation for a simple, fully specified, legal fixed-price item.
   A clearly priced direct Buy is available. A Prepare action remains available.
2. Configurable acquisitions use preparation cards; several may stay expanded.
   Do not build an exclusive accordion or a mandatory wizard.
3. No global cart or general-purpose batch checkout in M3-A3. One preparation is
   one user decision; it may contain an atomic Arms or Gang batch internally.
4. Compare each alternative against the **same current sheet**. Do not add their
   quotes together or suggest they can all be afforded simultaneously.
5. Preserve authored preparations through autosave/export/import with the explicit
   migration in §10. Save calculations neither as truth nor as extra purchases.
6. Paid mechanics are historical. Narrative edits use their dedicated command;
   changing paid mechanics uses an explicit refund and new purchase.

The visual language stays with the current parchment background, restrained
green accents, serif headings and compact sans-serif controls. Use existing tokens
and scoped resource styles. Numbers use aligned/tabular numerals. State also has
text and icons; red/green color alone never carries meaning.

## 3. Screen organization

Resources remains a tab in the existing Sheet section. It does not replace the
map, history, character header or stat editor, and introduces no new global mode.

| Region | Contents and behavior |
| --- | --- |
| Local sticky summary | `Resource points`: earned, spent, remaining; `Starting Resources` and `Circles`; review count. Budget source disclosure and ability explanation open locally. Sticky only while inside Resources; never covers the map/header or focused controls |
| Workbench toolbar | `Explore resources`, preparation count, `Jump to owned`, review shortcut. Clear preparations and Reset resources are secondary actions, separately named |
| Preparation area | Compact cards with name/type, configuration summary, quote/status, `After this purchase` balance, Buy and disclosure. Expanded forms are category-specific. Empty state explains preparation costs nothing |
| Owned rail | Gear & property, People & groups, Spells, Cash; group counts and compact acquisition rows. Several details can be open. Grouping is navigation, never arithmetic |
| Inline review region | Reasons concerning current preparations, owned entries and calculations, with links back to the relevant card/control. No separate page required to repair a problem |

### Width and density

- At an available Resources width of **1200 px or more**, use roughly 2:1 columns:
  preparations left, owned rail right (at least 300 px). Preparation cards can use
  two columns when each has at least 340 px. Ordinary card content should not
  stretch beyond about 640 px merely because the monitor is wide.
- Complex Arms/Gang editors can span the preparation area. Comparing two complex
  editors may stack them; no fields become cramped to force a side-by-side view.
- Below that width, preparations precede owned groups in one column. A compact
  `Owned · n` anchor/count remains in the local summary. Do not add nested tabs
  that hide the actual balance or discard the active preparation.
- The existing shell has a 1000 px minimum width. M3-A3 must fit the current
  1000/1280/1440/1920/2560 px desktop cases without widening that minimum. Resource
  components should also reflow at 360–768 px in isolation, but that is **not** a
  claim that the whole Workbench has become mobile-ready. Removing the shell
  minimum and redesigning the map are separate work.
- At zoom/high text scale, collapse to a single resource column and wrap labels;
  no clipped prices/buttons. Avoid a new scroll container around the whole editor.
  Catalog results can scroll inside their dialog; long complex cards use page flow.

### Catalog

Use the existing accessible dialog pattern, sized to its viewport. Search and
category chips lead: All, Gear, Armor, Property, People & groups, Spells, Cash.
These are display facets over existing definitions, not new catalog categories.
The right-hand detail area at desktop widths shows selected definition, short
meaning, known price or variant range, prerequisites, accounting note and source.
At narrower widths, put details below the selected result and retain search state.

Each result has a title, brief discriminator, price state and availability reason.
Keep the total/remaining rps visible in the dialog. Quick **Prepare** appends a new
instance without moving the inspected result or closing the dialog; announce the
addition and show a compact preparation tray/count. **Configure** prepares and
closes into that card. Direct **Buy · n rps** is restricted to a fully specified
simple request whose fresh quote permits it. Do not price a complex card from its
cheapest variant and present that as the chosen price.

Search names and catalog text; expose category and optional `Available now` /
`Needs review` filters. Default results include locked and unresolved entries, with
reasons. “Available now” is a quote-backed state for fully specified requests;
unconfigured entries remain `Configure to check`, not falsely legal. Price sorting
labels ranges/unknowns and puts unknown prices after numeric prices; affordability
does not imply eligibility. Show an empty-filter recovery action. Preserve search,
filters, inspected entry and scroll across close/reopen during the session.

Hide included-only children from stand-alone Buy actions; offer `Configure armor`
or the relevant parent instead. The independently modeled Human shield remains
discoverable as an unknown-price entry. Never globally filter all shields/helmets
as free: definitions can have independent prices and stock rules later.

### Preparation and owned cards

The closed preparation still shows the selected quality/rating/part, price state,
budget effect and first blocking reason. The expanded card ends with a local action
row: quote, `Buy · n rps`, source and relevant diagnostics. Keep the row visible
within normal flow; a long editor can repeat it at the bottom using the same data.

Cards can be duplicated to compare variants. Duplication makes fresh transaction,
item and internal-link identities and clears acknowledgements/overrides for fresh
review; it never duplicates a paid debit. Up to two chosen cards may be pinned to
the top for comparison; this is a display convenience, not a purchase limit.
All other preparations remain present and editable. No separate comparison wizard.

Owned rows emphasize **Paid n rps**, not today's quote. Details expose configuration,
declared objects, item-specific additions, source pages, original funding and
current warnings. Trait-granted social benefits have a `Trait grant` source and
no invented price or Refund button. Search within owned entries and independent
group disclosures keep a large spell collection manageable. Returning from Review
opens and focuses the targeted acquisition without closing other cards.

## 4. Typical player journeys

### A. From lifepaths to a first simple purchase

After choosing paths, open Resources. The header shows earned rps with sources;
missing Will or an incomplete grant has an explanation, not a fabricated total.
Open the catalog, find Shoes, inspect its price/source, and Buy. For an already
visible simple result this takes one priced action; no extra confirmation dialog.
The owned row appears, the actual balance updates, and Undo is available. Catalog
search remains in place for the next purchase. Prepare instead if still deciding.

### B. Compare armor without spending

Prepare two armor options in one catalog visit. Expand both, choose their quality
and part, and see each current quote and individual `After this purchase` balance.
Changing one does not collapse or alter the other. Select an included shield on
one explicitly. Buy that configuration: only it moves to owned; the alternative
remains prepared and immediately requotes against the new balance. There is no
temporary budget reservation, automatic shield, or silent purchase of both options.

### C. Describe a reputation and a relationship

Prepare “Associates with the Rangers”: audience `People of Bree`, free scope and
description, and a structured dice tier. No organization record or polarity is
required. The UI does not calculate the reaction of Bree's residents. Record any
required table review and then buy. A separate relationship keeps its title and
NPC name distinct, with significance and structured discounts beside the quote.
Text edits never infer new discounts or change the historical charge.

### D. Build and revise Arms

Choose superior Arms, declare axe A, axe B and dagger C, and place Beak on A and
Weighted Pommel on B. See base 20 + 4 + 4 = 28 rps as returned by engine quotation
and atomic simulation. Confirm the composition review and buy once. The bundle
shows two distinct axes and their own additions. Refunding Beak returns its paid
4 and leaves the other objects/addition intact; refunding Arms previews the whole
cascade and returns every remaining charge once. No combat profiles or hand slots.

### E. Repair a changed character

Change a lifepath, Sorcery or Outlaw in the existing editors, then return. Purchases
remain recorded at their original prices. Resources requotes preparations and
reprojects owned warnings, sources and abilities. A missing source is not silently
reassigned. Restricted Outlaw assets are distinguished from spendable rps. The
player can restore the route, resolve a supported condition, or refund; the UI
never “fixes” the character by deleting purchases.

### F. Finish, leave and resume

Review paid purchases, unresolved notes, starting Resources/Circles and the manual
So Close! choice. There is no new “certified legal character” button. Export the
draft, including unpaid preparations and their text. Reload/import restores the
authored choices and historical ledger, then recomputes quotes/diagnostics. A
remaining preparation is not an unfinished required purchase; the player may
keep alternatives for later or explicitly discard them.

## 5. Category editors

Show only the fields relevant to that acquisition. Common card chrome, quote and
source presentation are shared; the input form is not universal.

| Kind | Editor and feedback | Boundary |
| --- | --- | --- |
| Simple gear, mounts, property | Brief meaning and price; optional descriptive text; requirements/accounting disclosures. Simple eligible entries allow direct Buy | Do not infer that every owned animal counts as property for starting abilities |
| Quality-bearing gear/missiles | Three labeled quality buttons with quoted price; selected value immediately updates local summary | No duplicated multiplier formula in UI; unsuitable/unknown variants explain themselves |
| Skill kit | Searchable skill chooser, purpose/description, current quote | Selection does not purchase/open the skill |
| Armor | Material/definition, explicit full suit or piece, quality, optional included components | Confirmed pieces only priced by engine; no new coverage map or half-price formula |
| Arms | Bundle quality, compact list of named physical objects, per-object additions, composition review | No per-ordinary-weapon surcharge, invented cap or unlimited-arsenal claim |
| Ammunition/additions | Choose existing/prepared target; show parent and target quality next to charge | No detached paid child or target inferred from an item name |
| Relationship | Editable title, NPC name, description; significance; one family choice; romance/forbidden/hateful flags; extra conditions | Mechanical flags are explicit, not parsed from prose. Hateful is this relationship's modifier, not reputation polarity |
| Affiliation | Title/description, structured dice/price tier, free scope/group context; optional organization link | Do not require an organization registry to describe a purchase |
| Reputation | Title/description, audience, scope, structured dice/price tier; optional organization link | No positive/negative selector, faction sentiment or automatic contextual dice |
| Gang/Crew | One group name/identity with linked Relationship, Affiliation and Reputation editors | Each child owns its charge; group container adds zero, not the displayed sum |
| Companion | Title, NPC identity and linked-character reference; read-only requirements/evidence checklist | Not an NPC generator; Rules purchase needs actual supplied character/campaign facts (§9) |
| Spells | Compact catalog rows with printed price, Sorcery prerequisite and source; short acquisition note | Buying does not teach casting, spend cash dice or expose a combat spell editor |
| Cash | One priced acquisition per starting die; owned view can summarize count and expand instances | No in-play spending interface; no direct exponent control |

Rating buttons pair dice and price (`1D · 7 rps`, for example) without equating dice
with the base Circles exponent. A relationship quote can display structured base,
modifiers and floor using catalog data plus the engine's final quote; do not
recompute the payable total in the renderer. Keep free narrative text next to its
mechanical choices, with different labels and no automatic text interpretation.

Property may show `Appropriate staff may be part of this property · BWGR p. 205`
and allow a household note where the configuration supports it. It must not create
NPC records, counts, relationships or a free Gang. Neither staff nor an included
shield should appear because a renderer materializes every advertised benefit.

## 6. Complex acquisitions and reversal

### Arms and target identity

An Arms preparation has rows for physical objects, each with a name and the minimal
weapon-kind information required by the acquisition engine. Free-form declaration
is permitted with review; do not pretend a complete audited weapon-profile chooser
already exists. Each row's Add modification action carries that item's ID. Duplicate
names are allowed; show a local instance discriminator such as “Axe · 2” when needed.
One physical object's later multiple use profiles must never become extra purchases.

The footer shows base charge, each paid addition and the total from a successful
engine simulation. Structural errors or incomplete required review prevent a
confirmed total/Buy; show known child quotes and the remaining issue. Removing a
prepared object also removes its uncommitted additions with a clear local undo.
Adding a paid modification later is supported through a new targeted request.
Editing a paid bundle's declared contents is not a currently supported command.

### Armor and included components

The piece selector uses the actual supported set. Keep unknown-quality parts and
half pieces discoverable with `Price unresolved`; preserve their source/question.
Do not apply a suit multiplier/proration to make up a price. Independently priced
ordinary pieces can be prepared separately to form the player's desired purchase
set, without claiming automated worn coverage or a complete armor constructor.

`Include shield · no additional rps` starts unchecked and is offered from that
definition's included options. No full-suit-only gate is introduced. A selected
component becomes a linked child created by the engine; UI must not submit the
same child again. Its owned row states `Included with …`; removing it requires
refunding/reconfiguring its parent under the present API. Other stocks' separate
shield/helmet acquisitions remain a future catalog capability, not implemented here.
Armor substitutions remain explicitly unsupported in Rules; the UI must not expose
an apparently functional coverage/substitution constructor.

### Gangs and Crews

Use a single wide preparation with three independently open subsections and a
shared group summary. Create stable group identity automatically; do not make the
player type database IDs. The affiliation and reputation references point to that
group; descriptions and dice remain their own. New child purchases are the default;
adopting already paid unrelated entries is not offered without a supported command.
Buy all children plus the container atomically, or change nothing. Refunding a child
currently refunds its entire Gang: expose that consequence before confirmation,
never label the action as a harmless single-child refund.

### Refund, describe, duplicate, discard

| Action | User-visible consequence | History behavior |
| --- | --- | --- |
| Discard preparation | Removes an unpaid choice; no rps change | Undoable; no purchase refund |
| Duplicate preparation/owned choice | New unpaid instance with fresh internal IDs; choices/text copied, reviews/overrides need fresh explicit action | One edit; never copy historical debit as a new charge |
| Edit owned description | Only supported narrative fields change; quote history/paid cost do not | One coalesced text edit; stale reviews become visible |
| Refund to preparation | Exact original charge returned; removed configuration retained as a new unpaid preparation | One combined draft edit; Undo restores both ledger and preparation state |
| Buy preparation | Fresh engine evaluation, then paid acquisition; corresponding preparation removed | One edit, including any automatic included child/composite children |
| Reset resources | Clears paid acquisitions, resource choices/budget overrides and preparations; shows scope first | One undoable edit; other character subsystems untouched |

For a simple refund, a priced action plus Undo is sufficient. For a multi-record
cascade, show the engine's removed records, refund total and funding origins in a
confirmation. Derive this preview by running `refundResource` on the current sheet
without committing. The adapter may compare returned IDs to render affected rows;
it must not implement its own ownership traversal or refund arithmetic.

Refund-to-preparation copies configuration and declarations, remaps IDs/links,
and clears stale review/override acceptance. Refunding only an addition keeps its
surviving target link. A missing target on later load is a repairable preparation
error, not grounds to attach it to a similarly named object. The historical refund
comes exclusively from the command, never from the reconstructed preparation.

Changing paid quality, rating, modifiers or armor inclusion uses these explicit
refund/rebuy actions; no silent net-price edit. A currently unsupported narrative
field such as `npcName` also requires this path until the engine exposes an audited
edit command. Renewing reviews in place is an identified API gap (§9), not a UI
permission to patch provenance. Canceling any dialog leaves the ledger untouched.

## 7. Budget, starting abilities, uncertainty and modes

### Actual money and possible effects

The summary's earned/spent/remaining values always describe the committed sheet.
Use `rps` consistently; label the ability **Starting Resources** to avoid confusing
it with remaining points. Cash dice and social bonus dice are separate values.

An active preparation shows `After this purchase` beside its Buy action. Obtain
this from engine simulation, not subtraction embedded in React. Optional preview
of Starting Resources/Circles is labeled as a preview; it never overwrites actual
values. Choosing another comparison card switches the preview, not the ledger.
The preview is recomputed when any dependent sheet, path, mode or external fact
changes. A failed simulation shows its error and no successful-state preview.

Funding details list each concrete lifepath occurrence, granted/spent/remaining
amount, and current access. Display its human-readable path/occurrence label;
retain the exact pool identity internally. The engine's automatic allocation is
the default. An advanced `Choose funding sources` disclosure can provide explicit
allocations from existing pools, with the engine validating the sum/availability.
It cannot create a source, transfer an old debit or silently choose new origins
for an existing purchase. Keep the allocation adjacent to that purchase's quote.

An incomplete Wife-derived budget displays a known component plus `additional
grant unresolved`, not a final “available” total or zero. Its known base is not
automatically spendable merely because a number is displayed; use the engine's
funding plan. Confirmed other pools can still support purchases. Missing origins,
negative remaining balances and exceptional grants stay visible during repair.

Outlaw's restrictions concern current asset access, **not prohibition on spending
the affected rps**. Show `Restricted access · Outlaw` with the source explanation.
Trait purchase/refund/Undo/import recomputes access, without editing historical
funding. Restricted/mixed-funded starting calculations remain provisional where
the engine reports that unresolved question; the UI cannot settle it.

### Starting abilities

Resources and Circles have compact value-and-explanation controls. Disclosure
shows engine-provided qualifying paid spend and the source/page of the calculation;
owned rows can indicate their accounting contribution. Accounting is never inferred
from the display group. A duplicate group summary must not count child charges again.
An unallocated Will displays an incomplete Circles result, not a certified B1.
Trait/social dice appear beneath the base Circles value, not added into it.

`Round up Resources (So Close!)` sits immediately by Starting Resources, off by
default. It is always a manual choice, persisted and undoable, even when the
separate RAW eligibility diagnostic is false or unknown. No automatic checking,
GM-approval gate, bonus rps or unrestricted exponent stepper. Show whether the
rounding is applied and the separate eligibility note (D-035).

The engine's gray-Resources option belongs in an ability-details disclosure,
with its own recorded GM-permission flag and explanation of exponent cost. It
must not reuse So Close!'s checkbox or imply five rps purchase gray shade. No new
shade-cycling control or invented permission system. Gray/rounding changes call
`setResourceChoices` and expose the resulting diagnostics.

### Four different kinds of difficulty

| Situation | Display and action |
| --- | --- |
| Known cost, permitted request | Exact quote and priced Buy; current funding plan inspectable |
| Incomplete configuration / known requirement failure | Field or requirement message next to the relevant control; Buy unavailable, preparation retained |
| Contextual judgment that engine permits recording | Explain the question and source; let the player record a nonempty table-review note; requote. Do not call it a global RAW resolution |
| Unknown arithmetic / unsupported mechanic / missing external evidence | Explicit `Price unresolved`, `Not supported here` or evidence requirement. A generic acknowledgement cannot unlock it in Rules |

Quote `status`, `cost.kind`, blocking diagnostics and `questionId` are separate
inputs. Never equate “review” with an unknown numeric price, or “0 rps” with
unknown/included/Free. Included rows name their parent; a Gang's zero own debit is
labeled as a container. Keep all 14 RAW questions tracked; purchase-local notes do
not close them or remove caveats from other purchases.

Do not hide the explanation inside a disabled button's tooltip. Use an inline
message and accessible details link; focus can reach the reason even when Buy is
disabled. For fresh command rejection, retain all text, focus an error summary and
link to the offending field/card. For a new diagnostic code, show its supplied
message as a fallback; do not discard an unfamiliar blocking issue.

### Free Creation

Rules/Free remains the existing global mode. Switching it does not buy/refund,
reprice history, clear preparations, or silently accept a review. Free uses the
same quote and displays the same problems. An intentional exceptional purchase
opens **Explicit override** beside the quote: actual rps charge and a required
reason, then a clearly labeled confirmation. The engine remains the authority on
structural validity. Free cannot create dangling links, double debits, malformed
funding or fake included components.

Show both catalog/unknown quote and actual override charge. Exceptional budget
grants use their own explained command in budget details, not an editable balance
label. Switching back to Rules retains historical Free purchases with warnings.
No automatic “legalize”, cost reset, review suppression or inferred negative
reputation flag. Imported invalid structure is a parser error, not a Free purchase.

## 8. Interaction quality and accessibility

- Labels distinguish `Prepare`, `Buy`, `Paid`, `Refund` and `Discard`. Button text
  includes the current debit/refund when known. Price/source/reason stay local to
  the decision; a color or a remote banner is insufficient.
- Search, rating/quality controls, disclosures, inclusion checkbox, Buy and Refund
  are keyboard-operable with real labels. Several expanded cards remain expanded
  across tab changes. Focus order follows reading order, including the owned rail.
- Catalog Escape closes only the top dialog and restores focus to its opener.
  A confirmation cannot trigger a map shortcut underneath. `Ctrl/Cmd+Z` inside
  text entry remains native text undo; outside editors it uses existing Workbench
  history. Preserve the current editable-target and dialog shortcut guards.
- Adding a preparation focuses it only for Configure, not for quick catalog adds.
  Buying leaves a stable success affordance/owned target; it must not send focus
  to the document body when the preparation is removed. Refund returns focus to
  the resulting preparation. Undo/Redo restores a sensible surviving focus target.
- Announce a completed purchase/refund and new remaining rps once in a polite live
  region. Do not announce every keystroke, all quotes, or a repeated full ledger.
- Every free-text field has a persistent label, reasonable wrapping and explicit
  validation. Use plain text rendering; imported descriptions are never HTML.
  Long names, repeated item names, empty results and large spell lists are fixtures.
- Modest hover/focus feedback is enough. Respect reduced motion. Nothing important
  relies on hover, dragging cards, gestures, color, or animation.
- Destructive multi-record/reset actions explain their exact scope before commit.
  Ordinary reversible purchases do not acquire a ritual confirmation step.

## 9. Connection to the Purchase Engine

This is a **provisional binding map for PR #33's inspected head**. The final merged
API wins at G0. No rules functions belong in the React components.

| UI responsibility | Existing/provisional authority | Adapter responsibility only |
| --- | --- | --- |
| Catalog, labels, source, supported configuration | `src/data/resources/*`, `ResourceDefinition` | Search, display facets and rendering metadata |
| Budget and pool detail | `resourceBudget(sheet, progress)` | Human-readable pool labels, disclosure state |
| A completed proposed request | `quoteResource(sheet, progress, request, context)` | Normalize form fields; render quote/diagnostics; no arithmetic |
| Whole preparation preview | `buyResources` on the current immutable sheet; `projectResources` on successful returned sheet | Build an ordered request batch and discard simulated result; never commit during render |
| Buy | `buyResources` again against the latest state | One draft commit on success, remove matching preparation, stable focus |
| Refund/cascade preview and confirmation | `refundResource` | Compare returned ledger IDs for display; retain a reconfigured unpaid copy |
| Social narrative edit | `describeResource` | Only its supported fields; expose invalidated reviews |
| Starting choices / exceptional grants | `setResourceChoices` / `setResourceBudgetOverrides` | Ordinary controls; explicit reason/permission fields where contracts require |
| Owned, funding access, abilities, issues | `projectResources` / existing `deriveSheet` resource integration | Group entries and navigate by purchase/question IDs |
| Autosave/export/import/history | `Draft`, `encodeDraft`, `parseDraft`, App commit/restore | Deliberate migration and workflow-state integration in §10 |

### Minimal component boundary

Use a `ResourceEditor` parallel to `TraitEditor`, with small shared catalog, budget,
quote, owned-list and preparation-card components. Category form components receive
typed values and callbacks; they do not know how to spend points. A small pure
preparation adapter turns complete forms into `ResourceRequest[]`, supplies/remaps
identities, and handles form completeness. Keep the adapter separate from rules
validation. No new generalized form DSL, rules engine, global store or organization
management subsystem is needed.

Hold catalog/expansion/focus state above conditional tab unmounting, as the existing
trait expansion pattern already does. Authored preparations live in the draft, not
inside a disposable dialog. Render state can be discarded on reload; authored
content cannot. Normalize only what the command contracts require; preserve prose.

The API takes current `sheet`, lifepath `progress`, build `mode` and the same external
`context` for quote, simulation and commit/projection. Do not use a prepared quote
as authorization. Execute again on click against current state, handle rejection
without partial UI state, and suppress duplicate submissions. Generate IDs once
per preparation/direct user action, not while rendering/requoting. Identical catalog
definitions remain distinct instances.

Batch order: Arms owner before additions; Gang paid components before container.
Only the engine inserts selected armor inclusion children. No UI implementation
of graph validity, source allocation, rounding, price formulas, social caps,
Outlaw logic or cascade traversal. Incomplete drafts can show individual known
quotes; only a successful whole-batch simulation can advertise a purchasable total.
The actual purchase still calls the command anew.

Resource diagnostics should also reach the existing overall Review/warning count
without double counting. Extend presentation with resource purchase/question links,
not by parsing English error strings. Existing generic messages remain readable.
Keep the parser and headless commands independently testable without React.

### Capability gaps: deliberate UX limits

| Inspected API limitation | M3-A3 decision |
| --- | --- |
| No paid mechanical-edit / item-declaration-edit command | Explicit refund-to-preparation and fresh buy; no object spreading into a saved purchase |
| `describeResource` accepts name/description/audience/scope, not every social field | Expose only those inline edits. Other fields use refund/rebuy until an audited command exists |
| Description/context changes invalidate contextual reviews; no in-place review-renewal command | Keep the warning and offer the supported refund/rebuy route. Do not clear diagnostics or write provenance manually. A better renewal command would be a separately scoped engine change |
| Companion/campaign/access facts are inputs, not a persisted linked-character provider | Show required evidence and linked identity; do not enable a Rules companion purchase on invented facts or a “looks complete” checkbox. A genuine provider needs a separately justified persistence/import contract; core UI can ship with this flow explicitly unavailable |
| No complete armor substitution validation/coverage | Offer confirmed purchases and unresolved explanations; no counterfeit constructor |
| No general grouped-quote operation | Dry-run existing pure batch command for complete atomic preparations; no new pricing evaluator |

An existing imported companion without reloaded external facts remains visible
with its historical charge and fresh evidence warning; absence of a provider does
not erase it. Free Creation can record an explicit exception if the engine permits,
but cannot present that entry as a fully validated linked NPC. Do not broaden M3-A3
to build campaign/character linking merely to remove this honest limitation.

## 10. Persistence, history and a justified migration

### Why a schema change is warranted, and its exact scope

A relationship draft may contain meaningful prose; Arms may contain several
individually named objects. Losing this work on reload while saying “Saved on this
device” is unacceptable. Session-only state with a warning was considered and
rejected. A separate localStorage sidecar was rejected because import/Undo and
different characters could attach preparations to the wrong ledger. Putting them
in `resourcePurchases` would falsely imply ownership and spending.

**Selected future change:** a version-2 Draft envelope with an optional top-level
`resourcePreparation` array, separate from `Sheet`. It holds the minimal typed
incomplete form values, stable IDs/internal references and authored review notes.
The envelope version is explicit because the current parser reconstructs known
fields and would otherwise silently drop preparation content. No change to existing
paid purchase fields, historical price, funding or source semantics is intended.
This migration is planned here, not executed by this documentation pass.

Store incomplete values as form data (including a temporarily unfinished numeric
input), not as a falsely valid `ResourceRequest`. Validate transport shape/size,
IDs and references independently from purchasability. Missing external targets or
changed eligibility leave a recoverable preparation with issues. Invalid structure
does not enter the paid ledger. Do not store calculated totals, availability,
projections, quote caches or inferred social reactions. Review notes may retain
the context identity they acknowledged; changed current facts must require renewed
acknowledgement, not reuse stale approval.

### Migration and recovery contract

1. Read existing v1 drafts with no resources, and M3-A2 v1 drafts with purchases,
   through their established validation. Produce v2 in memory with an empty
   preparation list. Preserve all names, mode, pins, route, stats, skill/trait
   purchases, original resource charges, included children, links and provenance.
2. Validate all v2 primary fields before replacing the active draft. Retain the
   current import size/transport defenses and apply bounded validation to the new
   workflow field. Such limits are implementation protection, not RAW item caps.
3. Use the current autosave key deliberately; version the content. Before the first
   migrated write, retain the original v1 serialized draft as a recovery backup.
   If parsing or backup/storage fails, preserve the old saved copy and report the
   problem with an Export backup route. Do not silently advertise successful save.
4. Export v2 with paid and unpaid data. No silent downgrade export that loses
   preparations. The present v1-only application rejects v2 rather than erasing
   fields; show an actionable unsupported-version message in the new parser too.
5. On import/reload, recompute all derived state and quotes using current facts.
   Restore descriptions/choices exactly, not historical validity as current truth.
   Import replacement remains one existing undoable draft action.

This is the only proposed save-format expansion for the core UI. Linked companion
facts need a separate design, not an undocumented payload in this field. At the
implementation gate, reconcile the selected workflow/migration direction already
recorded in [DECISIONS.md](DECISIONS.md#m3-a3-design-checkpoint--preparations-paid-acquisitions-and-portable-drafts)
with the final M3-A2 entries. It is deliberately an unnumbered design checkpoint
so it does not claim the decision IDs currently used by the unmerged engine work.
Do not overwrite D-030 or renumber/replace another stage's decisions.

### Undo/Redo and editing sessions

Keep the existing maximum-100 in-session snapshot model; Undo stacks themselves
are not exported. Resource edits do not change the rule that current name/mode/pins
are retained by restore. Preparations are included in snapshots so Buy, refund,
Reset and import can restore both sides of the transition atomically.

Coalesce text editing from focus to blur into one preparation/narrative history
entry, while autosaving the current authored content. Flush the active edit before
a global command, tab departure, export or import. Native input undo still works.
Discrete quality/rating/selection changes are explicit edits; do not put every
keystroke in the global stack or undo half a composite. Integrate this narrowly
with App's commit boundary; do not rewrite other editors' history behavior.

For a prepared purchase, Undo Buy restores the unpaid preparation and removes its
acquisition; direct catalog Buy has no prior preparation to restore. Redo restores
the same recorded transaction, not a newly quoted price. Subsequent mode/path
changes produce current diagnostics, not repricing. Undo refund restores original
funding and removes the refund-generated preparation. Adding/discarding/duplicating
preparations is undoable. Browsing filters and expansion are view state, not edits
that consume mechanical Undo entries. Existing global Reset gains only clearing
the new resource preparation data, with its existing identity/mode/pin/camera rules.

## 11. Acceptance criteria for the next pass

These are implementation gates, not claims that controls/tests already exist.

| ID | Observable acceptance |
| --- | --- |
| RUX-01 | G0 is satisfied with the actual merged engine and CI evidence before UI coding; differences from this provisional map are documented |
| RUX-02 | Catalog finds all applicable Human definitions (144 total, 67 spells); included children cannot be bought independently, unknown entries are explained, no other-stock expansion |
| RUX-03 | From a visible simple legal result, one priced action buys exactly once; preparation remains optional and no irrelevant form is forced |
| RUX-04 | Prepare two instances of one definition: unique IDs, no debit, both independently expanded, retained across tabs and catalog reopen |
| RUX-05 | Changing either preparation updates its own quote/preview; both compare against committed state. Buying one requotes the other without spending it |
| RUX-06 | Buy at a newly insufficient/changed budget fails atomically with all authored input retained; stale quotes and rapid repeated clicks cannot double-buy |
| RUX-07 | Budget shows original source occurrences and current access separately; missing/partial grants never masquerade as confirmed spendable funds |
| RUX-08 | All prices/accounting/eligibility/cascades come from the engine or catalog contracts; no equivalent calculation branch is added in React |
| RUX-09 | Superior Arms example owns three distinct objects, costs 28 with its two additions; refunding one 4-rp addition leaves the other intact |
| RUX-10 | Armor inclusion starts empty; both supported full-suit and individual-piece selections may explicitly include the shield. Unknown parts remain unknown, no invented full-suit gate |
| RUX-11 | Included child is linked/zero-cost exactly once; isolated child removal directs to the parent. Parent refund previews and returns each original charge once |
| RUX-12 | All social forms support editable title and prose; Reputation accepts audience/scope without organization ID or polarity. Changing prose never computes mechanics or reactions |
| RUX-13 | Dice/significance/family/other modifiers are explicit; limits and review reasons persist. Paid narrative changes preserve debit and expose stale reviews |
| RUX-14 | Gang has three charged children and a zero-debit parent; Buy is atomic. Refund of any child clearly previews whole-group removal |
| RUX-15 | Property staff stays descriptive; no NPC or social purchase is generated. Companion flow reports missing real evidence without fabricating it |
| RUX-16 | Spells use printed prices and engine Sorcery gate; losing a prerequisite preserves the paid acquisition and adds a current warning |
| RUX-17 | Actual starting abilities, social bonus dice, cash dice and per-card previews are distinct. Incomplete/unresolved ability arithmetic is labeled |
| RUX-18 | So Close! is off initially, manual/persistent/undoable, affects only the projected Resources exponent, and is not gated by its eligibility diagnostic |
| RUX-19 | Gray Resources uses the engine's permission/exponent semantics, not rps or a generalized shade stepper |
| RUX-20 | Rules blocks unknown/unsupported operations. Allowed table review, explicit Free override and structural error remain distinct; all 14 RAW questions stay open |
| RUX-21 | Switching mode or changing/refunding Outlaw changes evaluation without rewriting history, automatic repricing, deletion or permanent funding locks |
| RUX-22 | Buy/refund/describe/Reset/import and preparation edits obey §10 history semantics; name/mode/pins and unrelated subsystems retain their existing behavior |
| RUX-23 | Old v1 saves migrate losslessly; v2 round-trip preserves partial preparations, all paid data, nested links and choices. Corrupt/unsupported imports preserve the active/saved draft |
| RUX-24 | Catalog/search/expansion/focus survive ordinary navigation; keyboard, dialog Escape, native text undo and screen-reader announcements follow §8 |
| RUX-25 | Desktop widths and 200% text/zoom do not hide active prices/actions. Resource reflow does not claim or force a whole-app mobile redesign |
| RUX-26 | No equipment slots, hands, coverage simulation, combat effects, casting, cash consumption, NPC generation, automatic social opinions or new stock data |

## 12. Tests, implementation order and regression control

### Testing strategy

Reuse the independent M3-A1/M3-A2 fixtures after integration, including the 28-rp
Arms, 22-rp Gang, ordinary mixed armor, refund and Outlaw vectors. Test visible
workflows and persisted results rather than snapshotting every markup fragment.
Use accessible names and stable instance IDs for queries. Keep exact pricing tests
in the engine suite; UI tests verify it displays and invokes that engine correctly.

| Layer | Essential scenarios | Acceptance |
| --- | --- | --- |
| Migration/parser | v1 before resources; v1 engine ledger; v2 partially typed social/Arms draft; duplicate/dangling paid IDs; unsupported version; failed autosave backup; tampered cached derived fields | 22–23 |
| Preparation adapter | Stable identities across requotes; clone/remap; parent-before-addition/group-after-children ordering; no duplicate included child; missing target retained as unpaid error | 04–06, 09–14 |
| Component interactions | Search + several quick preparations without selection reset; independent disclosures; direct simple buy; quote status/reason near button; duplicate labels; no debit on typing | 02–08, 24 |
| Category integration | Relationship discounts as engine quotes; organization-free reputation; review notes; optional shield on suit/piece; targeted Arms additions; Gang atomicity; unknown armor; Sorcery gate | 09–16, 20 |
| Command/history integration | Buy/Undo/Redo; exact refund-to-preparation; cascade cancel/confirm; social text edit; Reset resources vs global Reset; restored target/source missing; double click and stale budget | 06, 11–14, 21–23 |
| Projection integration | Outlaw on/off/import/Undo and extra access condition; Wife partial budget; missing Will; same exact recorded prices after route removal; So Close!/gray; trait social bonuses separate | 07, 17–21 |
| Modes/recovery | Unknown price Rules rejection vs explicit Free charge/reason; structural errors still fail; Free→Rules retained warning; export/import all fields; stale reviews after facts/text changes | 12–13, 20–23 |
| Browser/manual | Realistic four-lifepath sheet, long names/prose, many spells; 1000–2560 px, narrow isolated component, 200% zoom; keyboard-only purchase/refund, modal focus return, native text undo, announcements | 03–05, 24–25 |
| Existing regressions | Born-first, branch scope/age, route leads/Undo, stat pools/shades, ordinary/general skill refunds, training skills, trait required/source/effect handling, map pins/camera and global import | 22, 26 |

For UI tests use a mixture of the real engine and controlled error cases; never
mock every quote to “available”. Run typecheck as well as runtime tests: saved
contract errors are not all detectable by Vitest. Visual review must use a running
app at the integrated base; static source review in this design pass is insufficient.

### Implementation sequence

1. **G0 — verify base.** Confirm engine integration, audit outcome and CI. Compare
   final commands/schema/diagnostics with §9, update this plan/checkpoint if needed.
   Keep source checkout clean and preserve existing previews/uncommitted work.
2. **G1 — acceptance and migration first.** Reconcile the recorded design checkpoint
   with integrated decisions. Add parser/history/adapter acceptance tests before
   implementation. Establish v1→v2 recovery and preparation persistence without
   UI purchase side effects. This is a separate reviewable change from layout.
3. **G2 — thin end-to-end slice.** Budget summary, catalog and one simple purchase,
   owned row, exact refund-to-preparation, Undo/Redo and export/import through real
   commands. Visually check against the current Skills/Traits density before
   multiplying card variants. No visual “complete” facade over mocked transactions.
4. **G3 — preparations and ordinary editors.** Independent cards, quality, social
   forms, property, spells, source/availability details, manual ability controls,
   Rules/Free feedback and linked Review navigation. Test route/trait changes now.
5. **G4 — composite editors.** Arms/item additions, armor inclusion, Gang; atomic
   preview/commit and cascade confirmation. Show companion/substitution limits
   explicitly. Do not expand the engine to disguise a capability gap.
6. **G5 — usability and regression gate.** Keyboard/focus/text undo, responsive
   density, long/duplicate data, partial save recovery, large lists. Run typecheck,
   the full test suite and production build, then verify GitHub CI on the exact
   published UI commit. Record remaining caveats and tested viewports. No merge
   follows automatically from green checks.

Save a checkpoint after each gate: base/HEAD, changed scope, actual tests run,
remaining failures/gaps and the next concrete step. Do not label planned tests as
executed or rely on a green Draft PR as the next pass's baseline.

### Regression risks and protections

| Risk | Prevention / failure evidence |
| --- | --- |
| React invents rules to make a form convenient | Only translate inputs and render engine output; code review searches for duplicate pricing, cap, funding and cascade logic |
| Payment happens while exploring | Preparation outside Sheet; render/quote paths never commit; assert zero ledger/budget change during every form edit |
| Lost prose or accidental different-character sidecar | Versioned single Draft, migration/round-trip/replacement tests, retained old autosave on failure |
| Undo restores only half of a composite or loses later text | One draft transition; coalesced edit boundary flushed before commands; full App integration tests |
| Catalog/node identity reused as instance identity | UUID per user-created instance; clone/remap tests and engine graph validation |
| Historical prices re-evaluated as charges | Owned display/refund uses recorded debit; path/catalog changes test preserves it exactly |
| UI review note becomes a rules override | Typed question/context handling, unknown-price and evidence-failure tests, explicit Free provenance |
| Declaring an asset invents use or accounting | Group labels never drive accounting; no body slots/profiles/opinion machinery; D-027/D-033–D-039 remain authoritative |
| Scope expands into whole-app redesign | Scoped `.resource-*` styling; existing map/stats/Skills/Traits snapshots and interaction smoke tests; preserve 1000 px shell policy |
| Incomplete engine or provider masquerades as ready UI | G0 plus visible capability limits; companion/context recheck after import; no hardcoded approval facts |
| Resource changes interfere with Sol/workflows | No automation configuration changes; inspect final changed-file list |

The implementation is complete only when these gates pass with the documented
limitations visible to the player. Inventory/Fight!, other stocks, complete armor
constructors, NPC generation, full social trait adjudication and resolving the
remaining RAW questions are not deliverables of this Resource Burner UI.
