# General Skill Catalog A–Z — source review in progress

## Scope and source

Target: BWGR (2018), General Skill List, printed pp. 252–309,
PDF pp. 254–311. Starting commit: `ab10b9cd8fa9ceeced96b2a57b40fe1b179b2c0a`.
Branch: `skill-catalog-general-a-z`.

The user-provided PDF was read locally; extracted text and page images remain
outside the repository. This document contains project-authored summaries.
Issue #20, D-020–D-026 and foundation fixtures support, but do not replace, the PDF.
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

## Resolved K schema case: Knots mixed opponents / Double Obstacle Penalty

Visually verified book 280 / PDF 282; the user confirmed the Power-only penalty
and canonical semantics. OpposingAbilities preserves existing fixed/contextual
lists and adds explicit anyOf ability branches. Knots' securing-person context
selects Escape Artist skill OR Power stat, with double-obstacle-penalty only on
Power. The named modifier doubles the base obstacle/opponent successes before
other modifiers; it is not +2 or a final-obstacle multiplier. Execution is deferred.
Escape Artist is registered only as the identity/provenance named by Knots; there
is no invented complete General entry, root, type, alias or opening behavior.
Stat/attribute references retain the existing nonempty kind/id integrity boundary.

## Resolved L schema case: Leathercraft enchanted equipment benefit

Visually verified book 280 / PDF 282. EquipmentResult stores boots, allOf
Antiphon Union Training plus the external magic spell-song Song of Silence,
and one die specifically to the equipment user's Stealthy tests. Training is
validated as Training, never an ordinary exponent skill. The song is intentionally
outside the General catalog; no fake owned identity, default or alias is added.
Existing generic Antiphon integrations remain unchanged, while Leathercraft's
magic reference retains the Doom of Strength belt example without a numeric effect.
No cost, inherited tools, enchanting/equip/use evaluator or dice calculation.
D-025 now explicitly covers enchantment-acquired equipment results.

## Resolved L schema case: Logistics force/environment modifiers

Visually verified book 281-282 / PDF 283-284; all seven effects confirmed by the
user. ContextualTestModifier uses an effect/when pair: one dice-bonus and six
obstacle-modifier effects. Existing Inconspicuous values/conditions are preserved
in this common shape. The contextual profile describes effects on source-guided
tests without inventing a versus opponent or target-exponent obstacle basis.

Force leaves preserve majority-of-troops Hatred separately from presence of a
qualifying trait/mount. Non-Dwarven is a source-defined force classification,
not a target-stock or an inferred Dwarf percentage. Terrain/season/area leaves
compose with allOf/anyOf; prior-test-in-context includes the same countryside
and last Resources maintenance cycle, with a catalog-validated Logistics reference.
The trait alternative preserves Prince of the Blood, Aman, Fea and Dvergar;
war-mount source examples are destriers/coursers, without a horse-name parser.
No force, calendar, terrain, history, Resources-cycle or test evaluator.
This extends D-023/D-024 descriptive context metadata, not the general architecture.

## Resolved M schema case: Meditation rest / centering procedures

Visually verified book 283 / PDF 285; user-approved metadata stores two separate
procedures. DurationRestSubstitution records hour-based Ob 1 plus +1 per additional
hour, one hour of rest per meditation hour for wounds/Tax, and falling asleep at
some point on failure. No failure-time or credited-hours rule is invented.
LinkedPretest references canonical linked-test semantics for the ordinary case.
Only versus/detailed conflict uses an explicit opposed Meditation test against a
manual context-resolved opponent skill, with a win-conditioned +1D to its linked
target. No unconditional bonus, default opponent or formula string.

Activity facts separately retain vague surrounding awareness and Perception OR
Observation tests to detect Stealthy characters; Awareness is not an ability.
A separate magic integration preserves Sorcerer sustained-spell permission and
Tax retests under The Power Still Flows Through Him, as an external rule reference.
Rest and centering do not contain this Tax procedure. No duration/recovery/linked-
test/detailed-conflict/awareness/magic evaluator. D-023/D-024 remain sufficient.

## Resolved Training root usage and Mounted Combat source options

D-026 separates aptitude-only root usage from practice/instruction learning
methods (Learning Training Skills, 51/53). Visual review of the complete General
range found exactly seven explicit footnotes:

| Entry | Book | PDF |
| --- | --- | --- |
| Antiphon Union Training | 255 | 257 |
| Armor Training | 256 | 258 |
| Formation Fighting | 274 | 276 |
| Mounted Combat Training | 284 | 286 |
| Shield Training | 295 | 297 |
| Skirmish Tactics | 297 | 299 |
| Two-Fisted Fighting Training | 306 | 308 |

All seven have explicit rootUsage aptitude-only; future unfootnoted Training does
not receive this by default. Later S/T records remain partial representatives,
not premature complete production transcriptions. The earlier broader root-purpose
claim and its attribution to Character Burner 88/90 were corrected.

Mounted Combat stores typed source-acquisition options with independent ownership.
Elven Outrider -> Mounted Combat: Bowman Training; Elven Lancer -> ordinary Mounted
Combat Training (137/139). The earlier Bowman lifepath mapping was erroneous and
is not encoded. The character example (130/132) lists both. Bowman remains an
identity-only source reference outside the General heading manifest, not an alias
or a fabricated complete General entry. Combat execution remains external.

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
J–K is now complete against the independent manifest. Added Knots, Lance,
Lapidary, Latrine-wise and Lazy Bastard-wise: 222 complete production definitions.
Lance retains its Agility/Power root and mounted-combat reference; Lapidary remains
Perception-rooted. Added Leathercraft, Ledger-wise, Leverage-wise, Links, Lithography, Lock Pick
and Locksmith: 229 complete production definitions. Links keeps the printed
Will/Forte root and character-burning Dwarf restriction, with continuation
provenance. Locksmith includes Lock Pick capability without inheriting its tools.
Added Logistics, Lost Treasures-wise, Lyric of Law, Mace, Maker's Mark-wise,
Man-wise, Martial Arts and Mason: 237 complete production definitions. L is
complete against the manifest. Martial Arts keeps its own identity and printed
root, with a same-mechanics Boxing relation and the referenced Boxing provenance;
it does not become an alias or duplicate a combat implementation. Lyric of Law
preserves the appropriate History/Wise/song FoRK alternative and Elven restriction.
Added Meditation, Mending, Mercenary Company-wise, Metal-wise, Midwifery,
Mill-wise, Miller, Mimicry, Mining and Monk-wise: 247 complete definitions.
Mending keeps appropriate Craftsman FoRK guidance and expendable tools; Miller's
workshop is a mill, not an invented generic-tools-plus-mill conjunction. Midwifery
retains its Will/Perception root and no-tools requirement. Added Mounted Combat Training, Mouth of Hell-wise and Mule-wise: 250 complete
definitions. At that checkpoint M paused at Munitions; it remained identity-only.

## Current verification

Checkpoint verification passed: npm ci, npm run typecheck, npm test (1066 tests
in 42 files), npm run build and git diff --check. Remaining S–Z entries, final counts
and the lifepath-reference join remain unfinished; no full A–Z PR is open.
Production transcription continues through Sing:
331 complete definitions: A–R complete, S reviewed through Sing; Skirmish Tactics and later entries pending.

## Resolved Munitions adverse-outcome gap

The user confirmed the minimal skill-level SkillAdverseOutcome. Its explicit
zero-successes trigger is distinct from ordinary failure. CraftingSubjectContext
stores manufacturing and an anyOf of powder/explosive categories. Cook-off/misfire
remain source outcome labels; the maker receives damage from the created item's
Mark reference with manual/contextual resolution. No numeric fallback is present.

Visually reviewed 284/286. Independent item-source facts are small bomb B4,
medium bomb B6, large bomb B8 and very large bomb B12. These are not copied into
adverse metadata, and no equipment catalog is introduced. Powder has an obstacle
but no separate numeric Mark here. It stays in scope with the unresolved/contextual
created-item reference. Tests cover exact trigger, both subjects, source labels,
recipient/reference, serialization, generic categories and malformed descriptors.
D-023/D-024 already cover skill facts separate from subsystem execution.

## Resolved Musical Instrument canonical Advantage

Visually reviewed book 285 / PDF 287. The obstacle uses the listener's current
Will; explicit listener-role metadata identifies the target. Suitable performed
music/current mood is a structured suitability relation. ContextualTestEffect now
has canonical Advantage with external resolution and no numeric dice/delta.
It remains separate from fixed dice, obstacle changes and manual obstacle
adjustments; integrity rejects invented amounts and malformed relations.

The printed FoRKs are Sing, Composition and additional instruments. Composition
is preserved as printed, not silently replaced by Music Composition. An explicitly
curated musical-instrument category preserves the open guidance; it does not
admit all Musical skills or infer membership from names. Drum/flute/lyre are
source examples in the summary, not a closed choice list or invented named skill
identities. The entry is not forced into Wises-style ownership/family semantics.
No instrument ownership, mood, linked-test or Advantage evaluator is introduced.
Mystery Meat-wise completes M against the independent manifest. There are now
254 complete definitions. At that checkpoint N paused at Name Ritual.

## Resolved Name Ritual test outcomes and N progress

Verified 285/287. SkillTestProfile now supports separate typed success/failure
outcomes with local actor roles, reusing primary-actor/target. Name Ritual directs
all effects to the target being named. Success gives a name and fixed 1D ordinary
reputation; failure denies naming and gives infamous reputation with explicitly
unspecified magnitude. No inference from other infamous examples, zero fallback,
audience, permanence or reputation merging is made. The vocabulary is skill-level
result metadata; no naming/reputation/Circles evaluator or world-state commands
are implemented. Reputation results remain distinct from test dice/Advantage.

Navigation is complete at 285/287: Perception, Seafaring, generic tools, Astrology,
Orienteering and Pilot FoRKs. It is not relabelled Seafarer. There are now 256
complete production definitions at that checkpoint; N paused at Nogger, then
partial only in the foundation fixtures and identity-only in production.

## Resolved Nogger consumable effects and N completion

Visually reviewed 285–286 / 287–288. The approved CraftedConsumableEffect is
an equipment integration for the crafted product, not a Nogger roll outcome.
The Dwarf full-draught package is once-active/non-stacking, with separate 1D
next-Health and +1 Ob scene-Social scopes. Another independent Dwarf case compares
consumed steins to current Forte, at least, giving drunkenness/+1 Ob all tests.
Its limited derived-duration descriptor stores base 10 minus current Health in
hours, without computation or a clamp. Forte remains a stat reference and Health
an attribute reference, rather than inventing a Forte attribute.

The non-Dwarf mouthful case gives drunkenness/+1 Ob all tests, explicitly no
restorative benefit and unspecified duration. It inherits neither the Dwarf
package nor duration. Threshold/non-Dwarf repeat semantics are unspecified,
not guessed from the once-active restorative package. Generic validation checks
ids/units/scopes/shapes and never compares quantities or executes effects.
D-025 is extended; no new durable decision or formula language is introduced.

N is complete against the manifest: Name Ritual, Navigation and Nogger. Added
Oath-wise, Obligation-wise, Obscure Text-wise and Observation: 261 complete
production definitions. Observation preserves its four opposed skills and the
separate warning against substituting it for ordinary Perception; no detection
or perception/trait engine is introduced. O pauses at Oratory.

## Resolved Oratory crowd obstacle basis

Visually reviewed 286/288. Crowd-ability-exponent references current Will and
most-common exponent statistic, distinct from the single-target basis. No tie
handling, average/extrema, rounding or crowd grouping is inferred; validation
rejects unsupported statistics and extra tie/weight fields. Oratory preserves
Command/Persuasion/Rhetoric FoRKs, Social type, Will root, no tools and separate
Duel of Wits integration tag. No crowd or conflict evaluator is introduced.
Orc-wise and Ore-wise complete the next named topics: 264 complete definitions.

## Resolved Orienteering journey outcomes and O completion

Visually reviewed 286/288. Success reaches the intended destination without
delay. Failure establishes lost for actor plus companions as travelling-party,
then two alternatives: intended arrival with appointments missed if applicable,
or unintended arrival. No numeric delay, distance, destination generation or
alternative selection is inferred. Validation rejects invented fields and keeps
these effects distinct from naming/reputation and test modifiers.

Correction to the earlier pending audit: the entry specifies one advantage die
from maps, not unquantified canonical Advantage. It is fixed 1D under the existing
using-map circumstance, independently of optional maps/Tools none. All O entries
are complete: 265 definitions at this checkpoint. No journey evaluator added.

## Reviewed P before Poisons

Visually reviewed 287–288/289–290. Added Paean of Deeds, Painting, Pattern-wise,
Personal Effects-wise, Persuasion, Philosophy, Pilgrimage-wise, Pilot, Playwright,
Plumbing, Poetry, Poison-wise and Poisonous Platitudes: 278 complete definitions.
Paean preserves its Conspicuous mechanics relation; Philosophy preserves open
History family FoRK guidance. Playwright retains the existing known-Write
requirement, without reinterpreting literacy capability as sufficient. Painting
and Poetry retain independent contextual +1 Ob modifiers. Poisonous Platitudes
has both capability relations, current target Will, Hatred root/open-ended rolls,
Orc restriction and separate Duel of Wits reference. No new subsystem execution.

## Resolved Poisons crafted-product effects

Visually reviewed 288–289/290–291. CraftedPoison stores independent potency and
intended delivery dimensions, not twelve pre-expanded combinations. Potencies
preserve sickening Ob 2/+1 Ob, debilitating Ob 3/+2 Ob, deadly Ob 4/B10 wound.
Penalty scope is explicitly source-unspecified: no all-tests, duration, resistance,
onset or recovery inferred. Wound shade/exponent is distinct from Munitions'
created-device Mark reference. Ingestion is baseline delta zero; blade/vapor/contact
add 1/2/3 crafting Ob without altering potency/effect. Tests alone check totals.

The equipment integration is also indexed for poisons; tools are expendable,
root Perception, type Special, and FoRKs Herbalism/Apothecary/printed Alchemical.
Alchemical remains unresolved; probable Alchemy is preserved as the existing
audit hint, not a resolved FoRK or runtime/default fallback.
Validation checks serializable dimensions, effect units and malformed fields, not
exposure or wounds. D-025 extended; 279 complete definitions through Poisons.

## Resolved Polearm physical identity / combat profiles

Visually reviewed 289/291 and Weapons Appendix 554/556. The skill exposes cutting
and thrusting per-combat-use choices sharing one physical weapon. Cutting points
to external Polearm Axe Strike, thrusting to external Polearm Thrust. Distinct
stable profile ids are not skills or inventory items; unloaded external references
validate without a Weapon Appendix production catalog. No numeric weapon stats,
quality-dependent profile selection, equipment modifications or Fight evaluator
are added. D-027 records the physical-item/profile boundary and whole-item state.
Tests cover exact choices, reference shape, serialization, generic synthetic ids
and rejection of duplicated identities, copied stats or inventory acquisition.

## P completion and reviewed R before Rituals of Night

Potter, Prospecting, Protector-wise and Purple Song complete P (284 definitions).
Prospecting keeps open appropriate Wises guidance. Purple Song retains Workshop,
Elven restriction, magical rolls and the existing Antiphon created-item reference;
Lyric of Healing/Doom of Strength/Mirrorwine remain concise source-backed external
examples with no invented numeric effects. No Tinkersmend rules are inherited from
the source comparison. Printed Rhyme of Rules remains unresolved as previously
audited, not silently normalized.

Visually reviewed 289–292/291–294. Ratiquette, Read, Reason of Old Stone, Religious
Diatribe, Reputation-wise, Research, Rhetoric, the three Rhyme skills, Rhythm of the
City-wise, Riddle of Steel, Ridiculous Request-wise, Riding, Rigging, Ritual and
Rituals of Blood bring production to 301 complete definitions. Source roots, types,
tools and restrictions stay explicit. Read does not imply Write; silence is a
contextual +1 Ob. Rhetoric's target Perception is distinct from Diatribe's target
Will and Oratory's crowd basis. Rhyme of the Mariner remains Seafarer, Rigging
Seafaring. Antiphon, Riding chapter and Orc magic references stay subsystem facts.

## Resolved Rituals of Night separately acquired spells

Visually reviewed 292/294. SpellListCasting references external Rituals of Night,
with obstacleSource referenced-spell-list and separate-purchase-or-learning
acquisition. Skill id and spell-list id have separate typed namespaces even when
the source labels coincide; individual spell acquisition/state remains later work.
No spells, costs, learning procedures, automatic grants or casting engine are
encoded. Unloaded lists are valid external references, never fake General skills.
Validation rejects invented ownership/cost fields and malformed references.
Rituals of Blood retains only its audited external Orc magic reference, without
copying this explicit acquisition rule. No new Decision is needed (D-023/D-024).

## Reviewed later R before Rune Casting

Rituals-wise, Road-wise, Rope Chant, Round of Harvest, Royal Secret-wise, Rude
Carpentry, Rule of Law and Rumor-wise bring production to 310 complete definitions
with Rituals of Night. Visually reviewed 292–293/294–295. Rope Chant retains its
Knots-with-additions relation, repair/weaving/untangling guidance and source tool
alternatives; Antiphon/Rhyme of Rules/Song of Merriment remain a source-backed
created-item reference and concise magic summary, without invented item bonuses.
Round of Harvest explicitly reuses Farming. Rude Carpentry does not inherit
Carpentry mechanics from a comparison; its stock restriction is character-burning.
Rule of Law keeps seven FoRK suggestions scoped to research or presentation.

The printed Weathersong suggestion is absent from the General manifest and uses
the existing unresolved-source-reference representation. No General Skill id or
probable target is invented; external target classification remains unresolved.
Printed Rhyme of Rules keeps its existing unresolved treatment.

## Resolved Rune Casting fate procedure and R completion

Visually reviewed 293/295. Named rune-casting-fate-obstacle stores exactly two
ten-minus source candidates and lower-obstacle selection, with no generic arithmetic
AST, clamp or value lookup. The target social-standing components are Circles,
reputation and affiliation; the other candidate is the most expensive non-common
trait point value. The basis and success-triggered integration are scoped to
pronouncing fate, not writing moon runes (Ob 1) or carving casting stones (Ob 2).

FatePronouncement permits caster-player inspection and a manually selected target
Belief link. Suitably-dire examples are non-exhaustive. A separate caster-owned
commitment Belief must manually match the fate; missing it or later changing it
are explicit invalidators. Player agency and both fulfillment determinations remain
manual. Independent typed rewards preserve one Deeds for the fated player and
one starting Deeds for their next campaign character on fatal fulfillment.

Special Astrology-style FoRK remains shared; no generic fixed-die replacement.
D-028 records that Beliefs are free-form future runtime entities, not catalog
entries. Metadata roles can bind later to entity ids/revisions without parsing
text. No Belief/Artha/fate/death/campaign runtime is introduced. Validation only
checks content structure; it does not make narrative or arithmetic decisions.
R is complete: 311 definitions. The independent manifest oracle now covers all
A–R rather than a growing list of individual reviewed ids.

## First S entries and resolved Scavenging search request

Visually reviewed 294/296. Saddlery and Saint-wise brought production to 313
complete definitions. Scavenging now stores ItemSearch procedural metadata. The
player declares an item-type request, explicitly excluding specific/unique things.
Suitability is contextual; midden, ruin and battlefield are examples, not allowed
location ids. Category guidance preserves six obstacles and every audited example:
junk 1, common household goods 2, hard-to-find items 3, valuables 4, rare objects 5,
obscure/out-of-place items 6. Example items are not exhaustive category memberships.

Typed validation checks metadata shapes and serializes them without classifying
request prose, evaluating locations, finding items, generating loot, valuing
Resources or creating Equipment records. Skill metadata retains Perception,
Peasant, Tools none and Foraging/appropriate Wise FoRK guidance. No new Decision;
D-028 applies to structured constraints and manual semantic adjudication.

## Reviewed S through Sewing

Sculpture, Scutwork-wise, Seamanship, Seduction, Servant-wise and Sewing bring
production to 320 complete definitions with Scavenging. Visually reviewed
294–295/296–297. Servant-wise preserves printed Wise and the Orc character-burning
restriction. Seduction uses current target Will with separate Duel of Wits use.
Sewing preserves printed Weaver with its previously accepted probable Weaving
audit hint as unresolved guidance, not a resolved skill reference.

## Resolved Shield Training action-scoped Fight metadata

Visually reviewed 295/297 and Armor and Shields 481/483 plus Shields in Brief
483/485. Trained use is action-scoped, not passive/always-on defense. Shield dice
contribute to Block, the defensive portion of Counterstrike, and the defensive
portion of enabled Block & Strike. Untrained shield contribution is limited to
Block and does not enable Block & Strike. These lists describe shield-related
access/contributions, not general availability of other Fight actions.

A separate shield Strike descriptor uses the actor's Brawling, manually selected
appropriate Boxing skill, or Agility stat. ActingAbilityChoice reuses fixed
AbilityReference forms and preserves contextual Boxing without a fixed/default id,
alias or fake universal family. It is distinct from opposing-ability alternatives
and weapon profiles. Training itself has no exponent and cannot be a rolled
acting ability. Shield Training preserves Agility Aptitude-only semantics and
separate learning methods under D-026. Boxing/Martial Arts identities remain intact.

Content validation rejects malformed references, known Training-as-roll, invented
passive properties and unsupported action entries. The fixture/source root audit
remains covered. No Block/Counterstrike/Block & Strike resolution, pool division,
shield VA/damage, positioning or other combat evaluator is added. No new durable
Decision is required by this extension. Production reaches 321 definitions.

## Resolved Ship Management supply outcomes

Visually reviewed book 295 / PDF 297. SupplyManagement is a source-shaped
SkillProcedure: success has no supply problem; failure establishes a critical
supply shortage, serious complications, beginning crew mortality and qualitative
morale harm. Supply selection is contextual; food, water, medicine, lumber and
ammunition remain non-exhaustive examples, not supply ids or a closed catalog.
Mortality is not weakened to possible death: its onset is begins, while casualty
quantity and timing remain source-unspecified. No Health/wound procedure or
numeric morale modifier is invented. Tuple order describes source facts, not
scheduled execution. The seven vessel base obstacles and the three journey
modifiers are explicit rows, without a voyage formula or selection evaluator.

Integrity validation rejects malformed outcomes, invented selection policies,
casualty counts/timers, morale mechanics and downstream execution fields.
No inventory, Resources, voyage, mortality or morale evaluator is added. This
extends existing typed procedural metadata; no new durable Decision is needed.

## Reviewed S through Shortcut-wise

Ship Management, Ship-wise, Shipwright and Shortcut-wise bring production to 325
complete definitions. Shipwright preserves its source obstacle guidance, including
the jump from carrack Ob 6 to caravel Ob 8. Printed Engineer and Carpenter FoRKs
remain unresolved source labels with probable Engineering/Carpentry audit hints,
not silently resolved references. Ship-wise and Shortcut-wise use the previously
audited bare-Wise defaults. Visually reviewed 295–296/297–298.

## Resolved Shrewd Appraisal price-reduction metadata

Visually reviewed book 296 / PDF 298. AppraisedItemPriceReduction belongs to the
Resources integration boundary: it targets the appraised item, uses identified
flaws as its basis, and leaves magnitude source-unspecified. The successful
appraisal's semantic price effect is distinct from ordinary Appraisal's accurate
pricing before Resources tests. Neither identity is an alias or upgrade of the
other. Haggling remains a separate versus-negotiation descriptor.

No Resources obstacle delta, percentage, cash/value dice, currency amount,
minimum price or stacking semantics are inferred. The effect's exact nested
shape is validated and serializable; unsupported fields and other subsystem
placements are rejected. No pricing, Resources, transaction, bargaining, item
valuation or flaw-generation evaluator is introduced. No new Decision is needed.

Production now has 326 complete definitions, through Shrewd Appraisal. Its
Perception root, Social type, no tools, Dwarves-only restriction, appropriate Wise
and Haggling FoRKs, and magical marker/open-ended behavior are preserved. Source
obstacle guidance remains in the concise authored summary, like other ordinary
fixed tables: common goods Ob 2, expensive Ob 3, rare Ob 4, unique Ob 5. These
source categories do not establish a production item-price taxonomy.

## Resolved Siege Engineer created-equipment tool role

Visually reviewed book 296 / PDF 298. CreatedEquipmentCapability extends D-025
with an output-owned counts-as-tool capability for destroying structures. Output
uses the existing created-equipment kind and a source-authored equipmentKindId;
it does not create an inventory entry or bind an operating ability. Siege Engineer
retains its own generic Tools requirement independently of the completed war machine.

The complete entry preserves Perception, Artisan, Blacksmith/Munitions/Rude Carpentry
FoRKs and Orc-only in character burning. Source building guidance remains concise
summary data: simple ram/scaling ladder Ob 1; metal-capped ram Ob 2; covered
ram/siege tower Ob 3; massive traction trebuchet Ob 4; massive metal-capped covered
ram Ob 5. These are not operating, destruction, resistance or Resources obstacles.
No numeric bonus, damage, IMS/VA, crew/ammunition requirement, attack procedure or
operating ability is inferred. Exact nested integrity validation rejects invented
fields and wrong subsystem placement. Serialization, independence of construction
tools and compatibility with Hallmaster/Stone Artifice resistance are tested.
No equipment or destruction evaluator is added; no new Decision is needed.

## Reviewed S through Sing

Siege Engineer, Signaling, Silent Fury, Silver Trumpet and Sing bring production
to 331 complete definitions. Visually reviewed book 296–297 / PDF 298–299.
Signaling retains source lantern/flags tool alternatives and Cryptography FoRK.
Silent Fury remains a distinct magical Social skill with an explicit mechanics
relation to Intimidation, Will obstacle and Elves-only restriction; mechanics are
not duplicated into an evaluator. Silver Trumpet uses its named instrument and
Elven character-burning restriction. Sing uses listener Will and the existing
canonical Advantage/mood-suitability representation, never invented +1D. Its
ordinary linked-test and communication uses remain concise source summaries,
as with Musical Instrument; Meditation's special opposed procedure is not copied.

## Pending Skirmish Tactics structured cooperation metadata

Visually reviewed book 297 / PDF 299. This Will/Perception-rooted Military Training
has no tools and an explicit Aptitude-only root footnote under D-026. It permits
fighters with the Training to help another trained fighter on the same team with
maneuver rolls in Range and Cover. The entry limits mutually helping skirmishers
to five. No help-die amount or additional subsystem procedure is specified here.

The existing partial fixture stores a skirmisher-help integration id and field-
maneuver context, but same-team identity, participants' shared Training requirement
and the up-to-five source limit survive only in summary prose. Current integrations
have no typed cooperation descriptor for these constraints. A skill modifier,
FoRK or Training exponent would change the source mechanics.

Propose minimal Range and Cover cooperation metadata: maneuver help, same-team
participants, shared Training reference, and a source-shaped limit of up to five
mutually helping skirmishers. Do not infer five helpers plus a recipient, a dice
bonus, stacking rules, group-state machinery or a Range and Cover/help evaluator.
Skirmish Tactics remains a partial fixture/production identity reference; the
complete production entry and later S records await approval of this extension.
