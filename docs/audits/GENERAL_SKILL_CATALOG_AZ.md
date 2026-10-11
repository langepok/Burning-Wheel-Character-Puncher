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

## Resolved Haggling purchase negotiation

Visually verified Haggling, book 276 / PDF 278. Resources integration stores a
closed purchase-negotiation descriptor with buyer/seller roles, versus-test nature,
price/purchase-term/contract subject and optional buyer adjustment of -1 to the
relevant negotiation obstacle. The source entry does not supply an extra condition
for that adjustment. No victory condition, seller consequence or purchase engine
is added. Gambling and Games of Chance do not inherit this descriptor.

The full Haggling definition retains Will root, Social type, no tools and the two
printed FoRKs. Validation covers the typed descriptor and Resources-only placement;
serialization preserves the declaration without calculating a price.

## Resolved created-structure resistance

Visually verified Hallmaster, book 276 / PDF 278, and Stone Artifice, 301/303.
Both allow optional +2 obstacle when building a structure for +1 obstacle on tests
to alter or destroy the created structure. A distinct StructureResistance descriptor
stores target, cost, affected actions and the tests-against-structure modifier.
Repeatability is explicitly unspecified for both. It does not imply a maximum,
stacking, a bonus to an equipment user or a Resources-value change.

Hallmaster is a full production definition linked to equipment integration. Stone
Artifice remains a partial representative until S, sharing the reviewed descriptor
without importing partial definitions into production. Validation/serialization
check the data; no HP, durability or destruction engine is implemented. D-025 is
extended to created-object/result metadata without changing the architecture boundary.

## Resolved I schema case: Inconspicuous situational test penalties

Visually verified book 278 / PDF 280. The user approved skill-level test metadata,
separate from Resources/Fight integrations. SkillTestProfile records versus tests
and validated opposing skill references. Inconspicuous is now a complete production
record with four independent obstacle modifiers: +1 garish OR inappropriate attire,
+1 above OR below appropriate social station, +1 regional-origin mismatch, and +2
race/stock mismatch with the crowd being blended into.

New typed SkillContext leaves describe actor/environment comparisons; target-origin
and target-stock would lose the mismatch semantics. The two OR conditions stay within
individual penalties, with no exclusion rule between the four modifiers. Integrity
checks validate references, modifier units/deltas and nested typed contexts.

Observation (286/288) and Stealthy (301/303) were visually reviewed and supplied as
partial representative excerpts, not out-of-order production definitions. Observation
has four candidate opposed skills; Stealthy opposes Observation. Its light/weather/
ground advantage guidance is recorded in the excerpt summary, without inventing
values or formalizing advantage conditions in this change. No opposed-test or
modifier evaluator is implemented. D-023/D-024 already establish the boundary.

## Resolved I schema case: scoped obstacle references

Visually verified Insect Husbandry (book 278 / PDF 280), Animal Husbandry
(255/257) and Bird Husbandry (259/261). The user approved a distinct semantic
obstacle-reference relation: owning skill identity, concrete skill source or
explicit anyOf alternatives, and a required structured activity context.

Insect Husbandry references Apothecary for tending wounds and illness. The two
previous A/B production records now preserve Field Dressing OR Apothecary for
the same activity instead of only an injury tag/summary. All three keep their
own roots, tools, types and special rules. References do not select the tested
skill, inherit target metadata or act as FoRKs/capability inclusion. Ordinary
husbandry is outside the medical context. No evaluator is added.

Integrity checks concrete source identities, distinct anyOf alternatives and
nested contexts. Independent expected data, target-metadata mutation and
serialization tests cover both source forms. The prior negative schema-gap test
is replaced by the approved positive contract. D-023/D-024 already cover the
semantic-relation boundary; no new decision is required.

## Resolved I schema case: target-derived obstacle and unquantified adjustments

Visually verified Interrogation, book 278 / PDF 280. The user approved a separate
obstacle branch of SkillTestProfile with a target-ability-exponent basis, Will
stat reference and current snapshot. Target traits and situational disadvantage
are independent manual adjustments, explicitly marked unquantified. Numeric delta
is forbidden, including zero or explicit undefined; absence is an audited fact,
not a default or missing transcription.

A target Belief preventing disclosure is a structured example inside situational
disadvantage. It is not a trigger applying automatically to every Belief or a
per-trait formula. Ability kind/id and snapshot, quantity/source markers, examples
and known numeric modifiers are validated without accessing character state or
performing GM arbitration. Generic attributes remain representable.

Interrogation is now a complete production record. Intimidation's target-Will
basis is a separate partial representative, with source references to both entry
pages (278-279/280-281), and no Interrogation adjustments. The existing versus
profiles and scoped obstacle-reference relations retain their meanings. No new
Decision is needed under D-023/D-024; metadata does not execute rules.

## Resolved I schema case: success / Steel / hesitation follow-up

Visually verified book 278-279 / PDF 280-281. The user approved typed follow-up
test metadata: primary-test success trigger, outside-Duel-of-Wits context, target
actor and Steel attribute reference. A dynamic modifier adds a structured extra-
successes reference from the primary Intimidation test to the hesitation obstacle.
No numeric delta or formula is stored in this modifier; fixed numeric modifiers
and manual/unquantified adjustments remain separate types.

Generic primary-actor/target roles were introduced because the catalog had no
existing skill-test role model. AbilityReference is reused; known skill references
resolve through the catalog, while stat/attribute references retain the existing
extensible kind/id validation boundary. The primary obstacle profile is also
scoped outside Duel of Wits, without restricting the skill's separately indexed
Duel of Wits usage. No Interrogation adjustments are copied into Intimidation.

Intimidation is now a full production record with both source-page references.
The prior basis-only fixture remains an isolated partial excerpt, never a production
substitute. Serialization and negative tests cover context, trigger, roles, abilities,
result sources and modifier shape. No Steel/hesitation/Fight/Duel-of-Wits evaluator,
success-counting runtime or automatic follow-up execution is implemented. D-023/
D-024 already establish the descriptive-data boundary; no new decision is needed.

## Resolved J schema case: Jargon context-supplied opposing skill

Visually verified book 279 / PDF 281. The user approved an opposing reference
whose kind constrains it to a skill used by the eavesdropping participant.
Its role is eavesdropper and resolution is manual/contextual. No concrete id,
default or fallback is stored. This is deliberate source-supported contextual
selection, not missing transcription or an unresolved printed skill name.
Fixed skill references still resolve through the catalog. The contextual shape
rejects additional selector/default/id fields and does not implement adjudication.

## Pending K schema case: Knots mixed opponent / double obstacle penalty

Visually verified book 280 / PDF 282. For securing a person, the entry gives
Knots versus Escape Artist or Power at double obstacle penalty. The current
versus profile cannot express a skill/stat alternative, and fixed additive
modifiers cannot preserve a doubled obstacle. Do not substitute a fixed +2,
turn Power into a skill, or silently apply the penalty to both alternatives.
Knots remains an identity-only reference pending a minimal metadata decision.
The source case needs typed alternative opposing abilities and a structured
obstacle multiplier scoped to the appropriate opposing test/branch, together
with the securing-a-person context. No calculation or opposed-test evaluator
is proposed. The current type-level gap test proves Power cannot be an opponent.

## Formalization policy through General A–Z completion

Per the user's planning clarification, maintain the present metadata formalization
level throughout the General catalog. Distinct structured RAW procedures receive
small typed subsystem descriptors, without evaluators. Stop at unrepresented source
cases rather than replacing mechanics with prose or expanding a generic DSL.
After A–Z completion, conduct a separate retrospective and define a narrower
scope policy for later Equipment, Resources and Fight work. That later review does
not weaken current General transcription expectations.

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

## H completion and I progress

H is complete against the independent manifest: 8 ordinary skills, 7 Wise topics
and the History family, whose default metadata now preserves the printed root,
Academic type, tools and FoRK guidance. History remains a family with separate
ownership per topic; it is not a single owned skill. The generic other-History
FoRK suggestion is subject to the base FoRK rule of using another skill, not
permission to FoRK a skill into itself.

Hunting keeps the bow/javelin alternative tools; Herbalism keeps the source's two
contextual FoRK alternatives. Hauling substitutes for Power only in hauling.
Hymn of Scales and Fins reuses Fishing mechanics while retaining its own identity.
Its spell-song FoRKs remain unresolved source references where outside General.
I is now complete against the independent manifest: 9 records, including the
approved Intimidation procedure and Intrigue-wise. There are 210 complete production
definitions. The History family and Appropriate Weapons choice stay separate;
J-M and later blocks, final counts and the lifepath-reference join remain pending.

## J–K progress

Added Jargon, Javelin, Jewelcraft, Jeweler, Khirurgy, Kingdom-wise and Knives:
217 complete production definitions. Jewelcraft keeps its own identity, Elven
restriction, magical marker and Antiphon integration. Khirurgy's Dwarf-only
restriction applies in character burning; no always-only scope is inferred.
Javelin uses thrown-weapon subsystem references; Knives remains close-quarters.
J is complete against the independent manifest; K pauses at Knots.

## Current verification

Checkpoint verification passed: npm ci, npm run typecheck, npm test (546 tests
in 22 files), npm run build and git diff --check. K-M and later blocks, final counts
and the lifepath-reference join remain unfinished; no full A–Z PR is open.
Production transcription pauses at Knots mixed opposing abilities and doubled obstacle metadata.
