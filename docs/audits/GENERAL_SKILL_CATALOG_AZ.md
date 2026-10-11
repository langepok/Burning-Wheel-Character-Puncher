# General Skill Catalog A–Z — source review in progress

## Scope and source

Target: BWGR (2018), General Skill List, printed pp. 252–309,
PDF pp. 254–311. Starting commit: `ab10b9cd8fa9ceeced96b2a57b40fe1b179b2c0a`.
Branch: `skill-catalog-general-a-z`.

The user-provided PDF was read locally; extracted text and page images remain
outside the repository. This document contains project-authored summaries.
Issue #20, D-020–D-025 and foundation fixtures support, but do not replace, the PDF.
An independent manifest now contains 424 heading/topic candidates from the full
source index plus three named Doctrine variations from the entry body. Later
blocks still need entry-by-entry verification; 427 is a working manifest count,
not a final claim of source completeness. A–D has 126 reviewed complete skill
definitions and one separate choice expression. The full catalog is unfinished.

## Resolved source correction: Demonology / Empyrealia

Demonology (book p. 267 / PDF p. 269) names Ancient History, Obscure History,
Summoning and Doctrine as FoRK suggestions. Empyrealia (book p. 270 / PDF p. 272)
names Doctrine, Summoning and any ritual-type skill. The earlier ritual-category
attribution to Demonology was incorrect.

The user confirmed this correction and recorded it in
[Issue #20](https://github.com/langepok/Burning-Wheel-Character-Puncher/issues/20#issuecomment-6026263248).
The fixtures, hardening test and foundation documentation now reflect the
correction. Empyrealia supplies a real ritual-category representative; the two
identities remain separate. Suggestions remain guidance, not a whitelist.

## Resolved schema gap: conditional Script tools

Dwarven Rune Script (book p. 269 / PDF p. 271) and Elven Script (book p. 270 /
PDF p. 272) require generic expendable tools for writing only. Reading requires
no tools. The user approved a minimal conditional-tools extension.

ToolRequirement now supports a conditional node with a structured when context
and recursive then/otherwise branches. SkillContext distinguishes reading and
writing. Both fixtures encode writing -> generic expendable tools, otherwise
-> none. Existing tool leaves and allOf/anyOf compositions remain supported.

`tests/data/general-skill-source-gaps.test.ts` checks positive assignability,
fixture metadata, serialization, nesting and malformed context/branch rejection.
These are metadata/integrity tests, not a tool evaluator.

## Resolved schema gap: contextual Resources recovery

Visually verified Blacksmith, book p. 260 / PDF p. 262: it can replenish taxed
Resources if a suitable place to practice the trade is available.

The user confirmed the condition and approved an optional ResourceInteraction
context plus a general circumstance-id leaf. Blacksmith's partial source fixture
now carries suitable-workplace on recovery, independently of Workshop tools.
No specific workshop inventory, employment contract or recovery calculation is
inferred. Resource contexts are recursively validated, including family defaults.

Positive tests replace the previous negative schema reproducer: Blacksmith's
context survives serialization, changing tools does not change recovery, plain
recovery remains valid, and malformed circumstance/context nodes are rejected.

### Resources qualifier scan before the extension

Searched the complete extracted source range for Resources, taxed, recovery,
replenishment and cash, then checked the relevant recovery entries. The eight
explicit recovery entries are Accounting and Administration (book p. 253),
Beggardry (259), Blacksmith (260), Carpentry (263), Estate Management and
Extortion (271), and Waiting Tables (307). Only Blacksmith explicitly adds the
suitable-place qualifier to recovery. Carpentry also has Workshop tools without
that qualifier; the two facts must not be conflated. Beggardry additionally
produces cash.

Other Resources mentions describe different interactions: Amercement sets fines,
Appraisal supports valuation, Games of Chance describes stakes and tax/cash
outcomes, and Gem Artifice/Jewelcraft/White-Metal Artifice affect item value.
These are not silently converted into ordinary recovery. No additional recovery
qualifier was found that requires a different shape for the approved context.
The scan is not a claim to have transcribed those later skill definitions.

## Resolved stage reference: Antiphon Union Training

Visually verified book p. 255 / PDF p. 257. Its Tools line states that the
Training itself takes no tools but refers to the skill song. The surrounding
description requires an item created with a skill song, with Jewelcraft, Riddle
of Steel and Weaving Way given as examples, before the spell-song stage.

The user chose a structured magic-integration reference, not a ToolRequirement
extension. Antiphon's own tools are none. The magic integration records the
preceding base-item-creation stage, requires an applicable skill song, and says
creation follows that selected skill's own rules/tools. The printed song examples
are not an exhaustive list. The reference is not generic tool inheritance and
does not assert that creation tools are required during later enchantment.

The integration union permits this metadata on magic integrations only. Tests
check the stage/reference, serialization, malformed metadata rejection and
unchanged Antiphon tools when another song's tools change. No evaluator, copied
tools, automatic propagation or runtime prose parsing is added. This case no
longer blocks A–D transcription.

## Reviewed A–D block

The separate General transcription module contains 126 complete records:
83 ordinary skill identities, 40 named Wise topics (including the explicitly
overridden Black Legion-wise), and three named Doctrine variations. Appropriate
Weapons remains a choice. All 127 reviewed manifest rows match id, name, kind and
source pages; registration resolves the block's references and serialization
preserves nested metadata. Later blocks remain identity references, not fake
complete definitions or imported partial fixtures.

The Doctrine variations are Cult Doctrine, Foreign Doctrine and Heretical
Doctrine, explicitly named within Doctrine (book p. 268). They share the printed
Doctrine metadata and remain separately identified, without creating a Doctrine
family or requiring knowledge of the base skill first. Their stated acquisition
routes are an available lifepath grant or General skill points; this is not a new
spending evaluator.

The generic Wises entry actually prints Special (book p. 309 / PDF p. 311).
The earlier foundation default Wise was unsupported and is corrected in both
fixture and transcription family metadata. Named Black Legion-wise still prints
Wise and requires tools; no blanket normalization applies to named overrides.

### A–D source anomalies retained explicitly

- Ages of the Etharch is singular in the heading; preserve that printed name.
- Boss-wise is on book p. 261, despite the Skill Index's p. 260 reference.
- Caulking-wise appears on book p. 263 but is absent from the Skill Index.
- Reading, Engineer, Carpenter and Illumination source FoRK labels do not match
  the corresponding General headings exactly. They remain unresolved source
  references with probable targets as audit metadata, not resolved aliases.
- Rhyme of Rules refers outside the General list to a spell song; it is preserved
  as a source reference, not fabricated as a complete General skill.
- Chronology of Kings describes Dwarven history but does not print a stock
  restriction. Its availability is not inferred from that description.
- Brawling's Power substitution is scoped to Lock/Push; a curated circumstance
  id preserves the stated action scope without a Fight evaluator.
- Code of Citadels is not given a song category merely because it is Elven and
  magical. Explicit song descriptions support the categories on Call of the Wild,
  Ballad of History and Dignity of the Wilderlands.

## Resolved created-item valuation boundary

Gem Artifice and Gemcraft (book 275 / PDF 277) modify the crafted result, not
character Resources. Equipment integration stores created-item value effects:
Resources obstacle and Resources value dice are distinct typed measures.
Gem Artifice has automatic +1 obstacle and an optional pre-roll +2 crafting
obstacle cost for an additional +1 item obstacle. Gemcraft has automatic +1 die
of item Resources value. Neither effect is a cash grant or taxed recovery.
Magic matrix and Antiphon references remain separate magic integrations.

White Metal Artifice (book 308 / PDF 310) provides a representative regression
for the same ordinary-material obstacle/tradeoff shape. Its additional mithril
clause is not included in this partial fixture. Black Metal Artifice (260/262)
modifies tool-use dice; War Art (307/309) modifies weapon/armor properties and
quality. These are not item valuation measures and have not been normalized into
this descriptor. Forge Artifice (274/276) also grants tool-user advantage dice;
see the resolved use-bonus case below. No equipment or Resources evaluator is added.

## Resolved equipment-use bonus boundary

Visually verified Forge Artifice, book 274 / PDF 276, and Black Metal Artifice,
260/262. A separate EquipmentUseEffect in equipment integration records the
created equipment kind, +1 advantage die for its user, optional +2 crafting Ob
acquisition and successful creation condition. Forge has per-increment
repeatability; Black Metal has explicitly unspecified repeatability. Do not
interpret unspecified as single-use or repeatable. No maximum or stacking
calculation is invented. Single-tradeoff is representable for future audited cases.

Forge is now a complete production record linked to this integration. The existing
Black Metal record also links to its structured tools bonus; its other facts remain
unchanged. The value descriptor and all Gem/White Metal regression tests remain
unchanged. User approval extends D-025 rather than adding an unrelated Decision.

## Resolved Games of Chance wager settlement

Visually verified book 275 / PDF 277. The Resources integration now stores a
closed wager-settlement descriptor: winner/loser roles are assigned by the versus
skill test, and the prize Resources obstacle is set before it. The losing
participant's subsequent Resources test refers to that shared prize obstacle.
A passed test grants the winner an advancement credit of the same obstacle;
taxation grants the winner cash equal to the loser's taxed dice count.

These are two separately conditioned, typed outcomes, not an if/else or exclusive
branch. Reversing their declaration order preserves both facts. Validation checks
roles, obstacle/amount references, effect-condition pairs and Resources-only
placement. It does not execute tests, advancement or cash transactions.
ResourceInteraction remains unchanged. Gambling does not inherit these outcomes.
No new Decision is needed: D-023/D-024 already separate facts and integrations.

## Pending H schema case: Haggling purchase negotiation

Visually verified Haggling, book 276 / PDF 278. The buyer and seller make a versus
test; the buyer can lower the obstacle by one. This applies to purchase negotiation,
not a manufactured item's value and not Games of Chance prize settlement.

The current schema has no structured purchase-obstacle adjustment with buyer/seller
roles. CreatedItemValueEffect targets a crafted result and cannot be reused without
changing that meaning. WagerSettlement has fixed advancement/tax outcomes, not a
negotiated purchase. Plain recovery/cash metadata would also lose the source fact.
Haggling remains an identity-only reference, pending a minimal typed Resources
purchase-negotiation descriptor. No evaluator or additional success/failure policy
is inferred from the entry. Hallmaster and later H records are not transcribed yet.

## Planned oracle and integrity coverage

1. An independent manifest checks exact ids, source names, entry kinds and pages;
   missing, extra or duplicate production entries fail the comparison.
2. Complete production records satisfy required metadata and provenance;
   partial fixtures cannot substitute for them.
3. Check nested references, conditions, roots, integration ownership, families
   and special FoRK links. Preserve unresolved Alchemical explicitly.
4. Keep training, source spelling, identity, conditional roots, Astrology/Rune
   Casting, literacy, tools and family regressions.
5. Classify lifepath references as General, stock-specific/out-of-scope, choice
   or unresolved. This join remains unaudited.
6. Run block-level checks and final npm ci/typecheck/test/build plus diff-check.
   Passing foundation tests do not establish A–Z completeness.

## Reviewed E–F progress

Added 40 complete records before Forge Artifice: 23 ordinary skills and 17 named
Wise topics, bringing reviewed production definitions to 166. Earth-wise has an
explicit printed Wise type and its own summary (269/271); it does not inherit the
generic Special type. No stock restriction is inferred from its Dwarf description.
Elven Script preserves writing-only tools; Empyrealia keeps the ritual predicate.
Estate Management requires an estate independently of its plain Resources recovery.
Source FoRK labels Weaver, Carpenter, Illumination, Survivalist and Tanning remain
unresolved source references with probable canonical ids where applicable. They
are not runtime aliases. Foreign Languages continues onto book 274 / PDF 276.
At that checkpoint Gem/White Metal representatives were partial and outside production.

## Further transcription progress

A–G is complete against the independent manifest, with 186 reviewed production
definitions and the separate Appropriate Weapons choice. G adds 16 records:
7 ordinary skills and 9 named Wise topics. Gem Artifice and Gemcraft now have full
production definitions linked to their previously audited valuation/magic metadata.
The descriptor data is shared with the partial regression fixtures; production
never imports partial definitions. White Metal stays a partial representative until
its own block. Grain Appraisal preserves its printed Craftsman type and Dwarf-only
burning scope. Great Wolf Husbandry's Field Dressing capability is explicitly scoped
to Great Wolf wounds. Grain Song keeps Rhyme of Rules as an unresolved source
reference. It remains distinct from Miller; no identity normalization is performed.

## Current verification

This checkpoint passes npm ci, typecheck, all 391 tests across 15 files, build
and git diff --check. H and the remaining A–Z blocks, final counts and the
lifepath-reference join remain pending; no full A–Z PR is open. Production
transcription pauses at Haggling purchase negotiation.
