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

Normal starting stats/skills use black shade unless RAW or later supported rules say otherwise. In Free Creation, clicking the shade control cycles:

`B → G → W → B`.

Stats and skills use the same shade-control interaction. Physical and mental stats remain visually distinguishable from each other.

Skill exponents remain prominent and keep the accepted `+1 / -1` adjustment controls. Point accounting and rollback continue to require exact provenance.

## UI state versus character/rules state

Presentation state must stay separate from rules/domain state. Examples of UI state include:

- camera position;
- zoom;
- selected detail density;
- open lower tab;
- map exploration mode;
- pinned lifepaths and future pin notes.

Some planning metadata such as pins may be saved with a character for convenience, but none of it participates in rules legality.

## Deferred/non-goals for the first map implementation

Do not require the first implementation to include:

- mobile layout;
- fuzzy/typo-tolerant search;
- complete route planning before the rules engine exists;
- reachability-depth heatmaps;
- pin notes;
- a full custom-stock layout editor;
- automatic resolution of every rare special rule;
- fixed final shortcut assignments before prototype testing.

These decisions keep the initial implementation ambitious where it materially improves character planning, while avoiding work whose value has not yet been demonstrated.
