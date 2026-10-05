# Character Burner v2 UX specification

**Status:** Accepted product/UX direction for the current redesign phase.

This document records product and UX decisions. It does **not** redefine Burning Wheel rules. Rules-as-written and project interpretations remain in the rules/decision documents; the UI must consume structured rules results rather than infer legality itself.

## Product frame

- The Character Burner is a **desktop-first** application for normal monitors. Mobile support is not a current target.
- The main lifepath-selection experience is an **interactive pan/zoom map**, not a long flat list or dropdown.
- The application remains a training tool: unavailable choices stay visible with explanations instead of simply disappearing.
- The top-level shell must reserve space for future modules such as **Character Burner**, **Equipment**, **Fight!**, and **Reference**, plus import/export/save/settings controls.

## Main screen structure

The intended desktop composition is:

1. global navigation/header;
2. current character context (name, stock, Rules/Free Creation mode, lifepath count, age, warning count);
3. left **History** panel;
4. central **Lifepath Map** canvas;
5. right **Lifepath Details** panel;
6. pinned lifepath tray;
7. stats row/panel;
8. lower tabs for **Skills / Traits / Resources / Derived / Warnings**.

The map receives most of the available space.

## Lifepath map

### Pan, zoom and navigation

The map supports:

- pan;
- zoom in/out;
- fit whole map;
- center current lifepath;
- fit the current character's history route.

Camera movement should be stable during ordinary edits; opening a details panel or spending a point must not unexpectedly recenter the graph.

### Stock-independent layout

The graph component must not encode a Human-specific geography.

Preferred model:

- a stock/content pack may provide **optional curated layout metadata**, especially setting/subsetting positions and limited layout hints;
- built-in stocks may therefore receive stable, hand-curated setting geography;
- lifepaths inside a setting should normally use automatic local layout rather than hundreds of hard-coded absolute coordinates;
- if a stock or future custom content pack provides no curated layout, the application uses a **generic automatic graph layout**;
- a future content editor may allow authors to refine and save a generated layout.

Stable geography is desirable for a given curated stock, but it is not a rule-engine assumption.

### Settings and nodes

Settings/subsettings are visually distinct regions containing lifepath nodes. Professional Soldier remains a subsetting represented through the same generic map model.

Duplicate printed lifepath names use the existing setting-qualified display labels (for example `Villager Apprentice`, `City Apprentice`, `Soldier Apprentice`) without changing canonical source names or identity.

### Node states

The map must be capable of distinguishing at least:

- **available** — legal to choose now;
- **current** — latest selected lifepath;
- **in history** — previously selected lifepath;
- **locked** — content exists but rules currently prohibit the choice;
- **out of scope** — a real referenced destination exists but its selectable content is not currently implemented;
- **manual resolution** — the lifepath is selectable, but some special rule is not automatically calculated.

States may combine where appropriate, for example available + manual-resolution.

### Leads versus requirements

Leads and prerequisite/requirement relationships must remain visually and semantically distinct. A prerequisite is not automatically a Lead and must not be drawn using the same relation style.

The graph should avoid drawing every connection permanently. By default, show the information needed for the current context and reveal additional connections on hover/selection.

## Hover and click behavior

### Hover

Hovering a lifepath shows a compact tooltip with useful summary information such as:

- source/display name and setting;
- years;
- core grants;
- Leads;
- current availability status and concise reason if locked.

Hover should also temporarily highlight the relevant outgoing destinations/relationships on the map.

### Click

Clicking a lifepath opens its full details in the right-side panel. Full details may include grants, Leads, requirements, rule explanations, source/reference metadata, and the relevant action button.

In Rules mode an illegal choice is blocked and explained. In Free Creation the same violation remains visible as a warning, but the user may choose `Add anyway`.

## Map detail density

The user can change how much information is rendered directly inside lifepath nodes.

Target modes:

- **Names** — lifepath name only;
- **Grants** — name plus compact grants such as `+1M +1P`, `7sp`, `1tp`, `6r`;
- **Extended** — Grants plus useful secondary summary information such as years, outgoing-setting count, or availability state.

Full requirements/details remain in tooltip/details rather than expanding every node into a large card.

A temporary keyboard modifier should allow the user to momentarily reveal the next-higher detail level without permanently changing the selected mode. Exact shortcut keys are intentionally deferred until hands-on prototype testing.

Changing detail density should not cause the entire graph to reshuffle unpredictably.

## Character history on the graph

The selected lifepath history is rendered as a persistent, visually prominent **route through the graph**, not merely as checkmarks on nodes.

Lead transitions and their age contribution should be explainable in the history presentation. The left History panel remains the authoritative chronological list and can navigate the map to earlier selections.

## Pinned lifepaths

Users can pin lifepaths they are considering so they do not need to repeatedly pan across the map.

Behavior:

- a hover tooltip exposes a Pin action;
- pinned items appear in a compact pinned tray rather than becoming permanent floating windows over the map;
- hovering/clicking a pinned item highlights/navigates to its node and can open details;
- multiple lifepaths may be pinned simultaneously;
- pins are **not automatically removed when a lifepath is selected**;
- users remove individual pins or use `Clear pinned` explicitly;
- future enhancement: optional notes on pins such as `main plan` or `religious route`.

Pinned lifepaths are planning/UI metadata, not rules data.

## Lifepath search

Provide a small search field near the map controls for cases where the user knows the lifepath name but not its location.

Version 1 search is deliberately simple and predictable:

- case-insensitive;
- substring matching;
- searches canonical/source name, setting-qualified display label, and setting name/qualifier;
- duplicate names are shown with setting qualifiers;
- clicking/confirming a result centers/highlights its map node and opens details;
- keyboard navigation of results is desirable.

**No typo-tolerant/fuzzy search in v1.** If user testing later shows a real need, approximate matching can be added as a separate UI enhancement. Fuzzy UI search must never become rules inference.

## Reverse planning and route discovery

The product should eventually support reverse exploration such as:

- select/hover a target lifepath (for example Knight);
- show relevant incoming routes/prerequisites;
- optionally ask `How can my current character reach this lifepath?`.

A true route planner must be backed by the same rules engine that evaluates legality. It must not be implemented as naive graph reachability because Burning Wheel legality can depend on full history, settings, semantic tags, counts, age, position, traits and other state.

Before that rules engine exists, the UI may expose simpler incoming structural information, but it must not pretend to calculate RAW-valid complete routes.

Future route-planning UX may include route comparison, pinning a route, and reachability depth (`1 LP`, `2 LP`, etc.). These are future enhancements, not initial implementation requirements.

## Rules mode and Free Creation

Rules and Free Creation use the **same map and rules explanations**.

- Rules mode blocks illegal actions.
- Free Creation allows deliberate violations while retaining warnings/reasons from the normal evaluator.
- Switching modes must not rewrite canonical catalog data or make an illegal build rules-valid.
- Future route planning should default to RAW/legal routes even when the current build is in Free Creation unless the user explicitly asks to include sandbox violations.

## Special-rule implementation support

RAW legality and implementation depth are separate concerns. Rare/special mechanics may be represented without forcing a dedicated automated subsystem.

Use three product-support levels conceptually:

- **full** — the product automatically resolves the rule;
- **manual-resolution** — the lifepath/rule remains available in normal Rules mode, but the user must manually resolve a special calculation;
- **free-only** — reserved for exceptional content that cannot yet be represented safely in normal mode.

Current Wife-derived special rules (Country Wife, Village Wife, City Wife) should be treated as **manual-resolution** rather than requiring a husband-derived-grant calculator immediately.

The catalog should preserve the source rule/provenance even when calculation is manual. Manual adjustments must retain provenance so undo/reset can return exactly what was changed and warnings can identify unresolved work.

## Rollback/reset behavior

The UI does not support removing an arbitrary lifepath from the middle of history.

Expose:

- **Remove last lifepath**;
- **Remove all lifepaths** (with confirmation).

`Remove all lifepaths` is not the same as creating a new character. It should preserve unrelated UI/user context such as character identity, stock/mode choice, pins and map position where appropriate, while clearing lifepath-derived history, age, grants, allocations and related manual resolutions.

A general UI undo stack (`Ctrl+Z` or equivalent) is desirable, but exact shortcut assignment is deferred.

## Stats and skill shades

Shade and exponent are separate domain/UI values. Do not store or reason about them as one combined string such as `B4`.

Display pattern:

```text
Will   [B] 4
Sword  [B] 3
```

The shade indicator has three states:

- `B` — black;
- `G` — gray;
- `W` — white.

The letter is displayed inside a corresponding black/gray/white visual marker with sufficient contrast/accessibility.

Black shade is the ordinary/default presentation. In **Rules mode**, shade controls must still be capable of exposing rules-legal shade shifting during character burning when the catalog/rules layer says it is available and any required approval has been acknowledged. Do not hard-code Rules mode as permanently black, and do not expose white shade merely because the UI can display it unless the rules layer actually permits it.

In **Free Creation**, clicking the shade control cycles:

`B → G → W → B`.

Stats and skills use the same visual language for shade, though exact editing permissions may differ by rules context. Physical and mental stats remain visually distinguishable from each other.

Skill exponents remain prominent and keep the accepted `+1 / -1` adjustment controls. Point accounting and rollback continue to require exact provenance.

## Skills panel

The Skills tab should remain compact and focused on the character rather than becoming a permanently visible dump of the complete Burning Wheel skill list.

### Skill point pools are also controls

Display the current ordinary and General skill-point pools prominently near the top of the Skills panel. The pool indicators are also clickable controls for choosing the current source of skill-point spending.

Conceptually:

```text
[ Ordinary  8 / 14 ]    [ General  3 / 4 ]
       ACTIVE
```

Behavior:

- **Ordinary** is the default active pool;
- clicking `General` makes General points the active spending source;
- clicking `Ordinary` switches back;
- the product does not silently spend General points merely because an ordinary purchase is unavailable;
- if an attempted action cannot legally use the active pool, explain why and offer the user a clear way to switch pools;
- rules constraints on which pool may open or advance a particular skill remain the responsibility of the rules layer.

This default reflects the expected player workflow: ordinary points are normally spent on lifepath-accessible skills, while General points are commonly conserved for skills outside the character's lifepath access. This is a UX default, not a new rule restriction.

### Skill row interaction

A normal exponent-bearing skill uses the simple interaction already accepted for the Character Burner:

```text
Sword   [B] 4    [−] [+]
```

The controls should do the least surprising thing:

- `+` opens an unopened selected skill when legal, or advances an already opened skill;
- `−` removes the most recent purchased advancement;
- once the skill is back at its opening exponent, the next `−` **closes the skill** and refunds its opening cost;
- no separate `Close skill` button or confirmation is required for this normal editing flow;
- each refund must use purchase provenance so the exact ordinary/General point originally spent is returned.

The implementation must not infer refunds only from the current exponent. Internally, opening and each advancement must retain enough provenance to reverse the exact transaction.

Do **not** introduce a special color language merely to indicate `opened but never advanced` in the first implementation. That information may be shown in expanded details (for example `Opened at B2; no advances purchased`) without adding another persistent color semantic to an already information-dense interface.

### Required skills during editing

Required skills should be visually identifiable, but they are not forcibly pinned open by the UI.

A user may close a required skill while editing. Doing so leaves the character in an incomplete/invalid intermediate state and produces a clear unresolved requirement warning. Final validation in Rules mode must catch the missing required skill.

This keeps editing reversible and avoids making the interface fight the user while still teaching the requirement.

## Adding skills manually

The complete skill catalog should **not** be rendered inline beneath the character's current skills. Instead, expose a clear control such as:

```text
[ + Add skill ]
```

This opens a dedicated searchable skill-catalog dialog/panel.

### Add Skill dialog

The dialog should provide:

- a search field;
- useful filters such as **root stat/root combination** and, where helpful, canonical Skill Type;
- a compact result list;
- access to a skill's concise description and structured metadata before adding it;
- an `Add` action.

Clicking `Add` does **not** open/purchase the skill. It adds that skill to the character's working Skills list as a candidate. The user then uses the ordinary `+` control on the character sheet to open it and spend the appropriate point.

Therefore:

`add to working list ≠ open/purchase skill`.

A manually added but unopened skill may look conceptually like:

```text
Foreign Languages    —    [+] [×]
```

The `×` removes the manually added candidate from the working list.

Skills that appear because the character's lifepaths grant access to them are **not** removable with this `×`; their availability is derived from character history. They may be unopened, opened, advanced, or closed, but the UI must not pretend that the lifepath stopped granting access to them.

For an already opened manually added skill, `−` handles advancement rollback and closing as normal, while `×` remains the separate action meaning `remove this manually selected skill from my working list` once the product permits that state safely.

### Viewing skill details from the catalog

A user should not have to add a skill merely to learn what it does.

The Add Skill dialog should expose a details view containing the structured information that is useful during selection, such as:

- name;
- root(s);
- Skill Type;
- tools/tool requirement;
- character-burning restrictions;
- FoRK suggestions;
- special opening/advancement or roll behavior where relevant;
- concise public description;
- source page/section reference.

The details view may be an expandable card or a side pane inside the catalog dialog. Exact presentation is deferred to prototype testing.

## Skill catalog content model and descriptions

The product should build the **complete skill catalog as a data layer before the final Skills UI is wired to it**. Character Burner UI, future roll builders and later combat training should all consume the same catalog rather than maintaining separate skill records.

The public repository/application should use:

- structured mechanical fields;
- concise project-written summaries;
- page/section references back to BWGR.

Do not require long verbatim rulebook descriptions in the public data set.

The architecture should allow an optional **full-text content pack** to supply licensed or otherwise permitted extended descriptions later without forking the application or rules engine. The public/core application and a future full-text pack must use the same stable skill IDs.

Mechanically significant information must never exist only inside prose descriptions. Roots, restrictions, special opening rules, Training status, open-ended behavior, FoRK metadata and other executable mechanics remain structured data whether or not a full-text pack is installed.

The rules engine must not depend on the presence of full descriptions.

## Roll builder and FoRK selection

Future testing/combat UI should use a reusable **roll builder** rather than immediately rolling an opaque final dice number.

Pressing a skill/action `Roll` control should open a compact roll menu/dialog that explains how the pool is assembled and lets the user choose applicable optional contributors.

Conceptually:

```text
ROLL — BRAWLING

Base
Brawling B4                         4D

Suggested FoRKs
☐ Boxing B3                       +1D
☐ Knives B4                       +1D

Other owned skills
[ + Add contextual FoRK ]

Advantages / disadvantages
...

Artha
...

TOTAL                              6D

[ ROLL ]
```

### Suggested versus contextual FoRKs

The Skill List's printed `FoRKs:` entries are represented as **suggestions**, not a complete automatic whitelist.

The roll builder should therefore distinguish:

- **Suggested FoRKs** — directly represented by structured source FoRK metadata or another clearly defined catalog rule;
- **Other owned skills / contextual FoRKs** — skills the player proposes because they fit the current fictional situation.

The UI may mark contextual additions as manual/situational rather than claiming the rules engine proved them applicable. The GM/table remains the arbiter where RAW requires contextual judgment.

The catalog's FoRK model must support both direct skill references and broader source concepts such as `appropriate weapon skill` or `any appropriate craftsman skill`; the UI must not rely on parsing English description strings at roll time.

### Preserve roll contributors

Do not flatten every modifier immediately into one anonymous integer.

The roll builder should preserve the source and behavior of contributors such as:

- base ability dice;
- FoRK dice;
- help;
- stance/position/weapon advantages;
- wounds or obstacle modifiers;
- Artha;
- special dice with distinct roll behavior.

This is important both for training/explanations and because some FoRKs or other dice can have special behavior. The UI should be able to explain why the final pool has the size it does and, when relevant, which dice behave differently.

Exact roll-builder scope is deferred until the core skill catalog and generic test/roll rules are audited, but the data/UI architecture must not make this contributor-based model difficult later.

## UI state versus character/rules state

Presentation state must stay separate from rules/domain state. Examples of UI state include:

- camera position;
- zoom;
- selected detail density;
- open lower tab;
- map exploration mode;
- pinned lifepaths and future pin notes;
- currently active skill-point pool;
- Add Skill dialog filters/search state.

Some planning metadata such as pins or manually added skill candidates may be saved with a character for convenience, but none of it by itself changes rules legality or grants a purchased ability.

## Deferred/non-goals for the first map/skills implementation

Do not require the first implementation to include:

- mobile layout;
- fuzzy/typo-tolerant lifepath search;
- complete route planning before the rules engine exists;
- reachability-depth heatmaps;
- pin notes;
- a full custom-stock layout editor;
- automatic resolution of every rare special rule;
- fixed final shortcut assignments before prototype testing;
- long verbatim skill descriptions in the public repository;
- a licensed/full-text skill content pack;
- automatic adjudication of every contextual FoRK;
- the final combat roll-builder before the underlying test/combat rules are audited.

These decisions keep the initial implementation ambitious where it materially improves character planning and training, while avoiding work whose value or rules basis has not yet been demonstrated.
