# Skill Catalog schema foundation

## Scope and evidence

Primary verified source packet:
[Issue #20 — Skill Catalog schema audit packet (A–Z findings)](https://github.com/langepok/Burning-Wheel-Character-Puncher/issues/20).
Printed and PDF page numbers are separate; the packet specifies PDF = printed + 2.
No rulebook text or PDF is stored here. Summaries below are project-authored.

The original user task also supplies representative examples not fully repeated
in the packet. Those facts have `task-brief` provenance pointing to the supplemental
section below. No missing book pages are fabricated. Where both sources contribute
to a record, both are retained.

This pack proves schema forms, not complete playable skill entries. Every skill
fixture has `coverage: partial`; absent metadata is untranscribed, never a claim
of no restrictions, no tools, standard rolls or a zero cost. Name-only references
exist solely to support audited links and identity regression checks. Full skill
transcription, eligibility, opening/advancement, roll building and subsystem
execution are deferred.

## Representative fixtures

| Form | Fixtures / concepts |
| --- | --- |
| Single, combined, attribute, conditional roots | Sword, Boxing (Martial Arts), Tree Pulling, Torture |
| Training independent of Skill Type | Antiphon Union Training, Armor Training, Shield Training, Skirmish Tactics, Two-Fisted Fighting Training |
| Marker versus roll behavior | Nogger, Tree Pulling, Torture, Rune Casting, Song of the Eldar |
| Concrete/type/category/context/Wise FoRK guidance | Brawling, Sword, Mending, Herbalism, Scavenging |
| Special contributor behavior | Astrology and Rune Casting reference one Astrology-style descriptor |
| Distinct relations and capabilities | Child-Rearing, Dwarven Rune Script, Locksmith, Ratiquette, Smithcraft, Voice of Thunder, Weaving Way, Rhyme of the Pathfinder, Great Wolf Husbandry, Spider Husbandry, Rope Chant, Hauling |
| Availability/opening/use boundaries | Arson, Reason of Old Stone, Playwright, Aura Reading, Sorcery |
| Independent tools/expendable metadata | Sword, Staff, Gambling, Architect, Mending, Astrology, Nogger, Stuff-wise |
| Repeated Resources interactions | Accounting, Administration, Beggardry, Estate Management, Extortion, Waiting Tables |
| External subsystem indexes | Tactics, Brawling, Sword, Skirmish Tactics, Voice of Thunder |
| Families / named overrides / choice | Wises, History, Stuff-wise, Appropriate Weapons |
| Source anomaly | Poisons → unresolved Alchemical; probable Alchemy is audit metadata only |

Supporting name references include the visually verified Music Composition,
Tracking, Symbology and Song of Flocks and Herds. Nogger and Stuff-wise are actual
partial fixtures. Tests preserve Knives versus Throwing, Spear versus Throwing,
Drinking versus Drunking, and Gambling versus Games of Chance. Boxing and Martial
Arts have separate identities. The Boxing record preserves its printed heading
`Boxing (Martial Arts)`; the Martial Arts record points to Boxing via a
`same-mechanics` relation. Shared mechanics do not merge owned skills.

## Supplemental task examples

These facts are supplied explicitly in the user's schema-foundation brief.
Their page numbers were not supplied; they do not acquire invented citations.

- Tree Pulling has Hatred as root and the printed `§` marker. Torture's
  non-Orc root is Will/Perception; the packet supplies the Orc Hatred case.
- Brawling suggests Boxing as a FoRK. Scavenging can suggest an appropriate Wise.
- Rhyme of the Pathfinder uses Tracking mechanics without becoming the same
  owned skill. Great Wolf Husbandry substitutes for Field Dressing for Great
  Wolves; Spider Husbandry substitutes for Instruction/Field Dressing for spiders.
- Rope Chant includes Knots mechanics and additional effects. The extra effects
  are not specified here, so `additionalCapabilityIds` is omitted rather than
  populated with invented rules or an assertion of no effects.
- Hauling may substitute for Power in the hauling context.
- Sword requires a sword, Staff a staff, Gambling traveling gear, Architect a
  workshop, and Mending generic expendable tools.

## PR #21 RAW review corrections

The user's BWGR review for this hardening pass supplies the following corrections
and additional examples. They are recorded with `task-brief` provenance to this
section; no new page numbers were supplied. The explicit Boxing/Martial Arts
correction supersedes the earlier single-identity reading of the audit packet:
the Boxing entry and Fight refer to two skills, and Martial Arts has its own
entry referring to Boxing. No combat implementation is duplicated.

- Canonical Skill Type labels include Social, Peasant, Forester, Artist, Musical,
  School of Thought, Seafaring and Seafarer. The latter two remain separate
  source labels, with no automatic normalization.
- Falconry requires generic tools **and** a falcon. Hunting takes a bow **or**
  javelin. Rope Chant takes traveling gear **or** Elven Rope. Tool leaves retain
  their own expendability; unknown expenditure is not filled with false.
- Empyrealia can use any ritual-type skill as FoRK guidance (book p. 270 / PDF
  p. 272). The earlier Demonology attribution was corrected against the PDF:
  Demonology instead names Ancient History, Obscure History, Summoning and
  Doctrine (book p. 267 / PDF p. 269). Composition accepts
  skills applicable to its content. Ballad of History accepts an appropriate
  history, Wise or song. Ritual/song are curated semantic categories rather
  than inferred substrings or invented printed Skill Type labels.
- Song of Lordship's Etiquette-like use is contextual to targets with Etharchal,
  Fea **or** Aman. Code of Citadels identifies a target who is both Elf and
  Citadel-born. These are target conditions, not actor stock restrictions.
- Driving's Riding substitution applies in pursuit **or** travel. Field-maneuver
  context can also be represented independently (the existing Skirmish Tactics
  integration already has audited maneuver scope).
- Ordinary Read and Write have general literacy capabilities; the Dwarven Rune
  Script capability retains its cultural context. Playwright still requires the
  specific Write skill; this pass does not substitute any literacy capability.
- A non-Training base opening-cost override may be represented with explicit
  source provenance. Standard opening is one point; specified special skills
  may cost two; Training costs two with no exponent. Marker/type labels do not
  establish costs. No new per-skill prices were supplied in this review, so the
  new cost representation is exercised with synthetic test content only.

These examples add partial fixtures, not a full A–Z transcription. Boolean
compositions are declarative metadata; no evaluator or general rules language
is introduced.

## Deliberately incomplete evidence

Issue #20 supplies selected fields rather than complete rows. In particular,
this PR does not invent missing obstacles, tool details, availability scopes,
opening rules or subsystem constraints. Rune Casting's special opening-cost note
is recorded in the packet but is not transcribed into this fixture. Generic
Training cost metadata does not imply that other skills cost one point.

The packet explicitly verifies that Song of the Eldar lacks a printed `§`.
Its mechanics relation does not synthesize a marker or unverified roll metadata.
Family defaults also remain partial; common Wise obstacle values are not given
in the packet and therefore are not invented.
The later PDF transcription corrects the family Skill Type default to Special,
as printed in Wises (book p. 309 / PDF p. 311). Named Wise-type overrides remain
distinct; membership in the family does not manufacture a Skill Type label.

Poisons → Alchemical is the already-known unresolved source anomaly, not a newly
resolved alias. Further production use must retain or explicitly resolve it.

## Verification boundary

`tests/data/skills.test.ts` checks the audited difficult cases, source identities,
serialization and a synthetic stock/attribute. `skill-catalog-integrity.test.ts`
checks duplicate/dangling ids, conditional-root ambiguity, integration ownership,
provenance and compile-time distinctions. The existing lifepath catalog and oracle
tests remain part of the full suite. Registration operates on typed content, not
arbitrary untrusted JSON; it neither calculates skill effects nor validates a
character's legality.

Training root usage is source-supported aptitude-only for the seven audited
footnotes, separate from practice/instruction learning methods (D-026).
Mounted Combat source options preserve distinct identities and independent
ownership; source-acquisition selection does not impose a character-wide XOR.
Elven Outrider resolves to Bowman, Lancer to ordinary Training (137/139).

Canonical contextual Advantage references general BW procedure and stores no fixed
dice amount. Musical Instrument (285/287) supplies its structured music/mood
suitability case. It is distinct from fixed dice bonuses, obstacle modifiers and
manual obstacle adjustments. General/context resolution remains outside data.

Skill-test outcomes can describe name bestowal/denial and reputation grants
without executing character/world-state changes. Fixed reputation dice and
explicitly unspecified dice are different shapes; neither is a test modifier.
Name Ritual (285/287) supplies success/failure and target-recipient regressions.

Crafted consumables can have recipient/dose-dependent effects of consumption,
with separate next-test/scene scopes, non-stacking, threshold and bounded derived
duration metadata. Nogger (285–286/287–288) motivates the D-025 extension. These
results remain equipment data, separate from crafting test outcomes or Resources.

ObstacleBasis distinguishes single-target live exponent from crowd live exponent
with most-common statistic. Oratory (286/288) supplies the crowd case. No tie
policy, average, extrema, rounding or aggregation evaluator is encoded.

Journey-navigation outcomes preserve intended arrival/no delay on success and
travelling-party lost state followed by two source-defined alternatives on failure.
No alternative selection, travel timing or location generation is encoded.
Orienteering (286/288) also supplies a separate fixed map die, not canonical
unquantified Advantage; existing name/reputation outcomes retain their recipients.

CraftedPoison keeps potency/base crafting obstacle/product effect independent of
intended delivery/crafting delta. Source-unspecified penalty scope is explicit;
fixed black wound exponent differs from created-device Mark and damage dice.
Poisons (288–289/290–291) supplies the audited cases; no exposure/wound engine or
generic formula facility is added (D-025).

CombatUseChoice stores per-use options sharing a physical weapon identity. Typed
ExternalCombatProfileReference points into Fight/Weapon Appendix by stable id and
source name, explicitly allowing unloaded profiles rather than General skill or
inventory references. Polearm (289/291; Appendix 554/556) supplies cutting/Axe
Strike and thrusting/Thrust. No numeric stats or runtime profile generation is
added; D-027 defines whole-item state vs use-profile boundaries.

SpellListCasting is magic integration: a typed external spell-list reference,
referenced-list obstacle source and separate-purchase-or-learning acquisition.
Skill ownership, list identity and individual spell ownership remain distinct.
Unloaded lists validate without a General skill lookup; no spell data, costs or
learning/casting engine are added. Rituals of Night (292/294) supplies the source
case; Rituals of Blood does not inherit its acquisition rule by analogy.

Rune Casting (293/295) adds a closed named fate-obstacle basis and FatePronouncement
magic metadata. Target Belief inspection/reference and caster commitment are
separate role bindings for future narrative entity identities/revisions. Meaning,
dire appropriateness and fulfillment stay manual; missing/changed commitment and
Deeds rewards stay typed. No Belief catalog, semantic parsing, narrative state or
Artha/fate execution is added. D-028 records this boundary.

ItemSearch is typed procedural skill metadata: player-declared item-type request,
explicit no-specific/no-unique constraints, contextual location requirement and
category obstacle guidance. All example locations/items are non-exhaustive.
Scavenging (294/296) supplies the source case; no NLP/taxonomy, world lookup, loot
generation, inventory or Resources evaluator follows from content validation.

ShieldUse belongs to Fight integration. Action-scoped trained/untrained shield
contributions and Block & Strike access are separate from shield Strike's
ActingAbilityChoice. Fixed options reuse AbilityReference; appropriate Boxing is
a manual context-resolved actor skill, not an opponent, alias, default or family.
Known Training definitions cannot be referenced as rolled abilities. Source: Shield
Training 295/297 and Armor and Shields 481/483, 483/485. No passive defense or
Fight resolution/pool/VA/damage engine is introduced.


### Supply-management outcomes

SupplyManagement extends SkillProcedure with distinct success/failure facts,
contextual critical supply shortage and non-exhaustive examples. Serious
complications, beginning crew mortality (quantity/timing source-unspecified), and
qualitative morale harm are independent source consequences, not executable
commands. Explicit vessel obstacle rows and journey modifiers preserve source
guidance without a voyage formula. Integrity validation checks the full nested
shape; no inventory, Resources, voyage, crew, mortality or morale evaluator is
introduced. Source: Ship Management, BWGR book 295 / PDF 297.


### Appraised-item price reduction

AppraisedItemPriceReduction is a Resources integration descriptor for the semantic
effect of identified flaws reducing the appraised item's price, with magnitude
explicitly source-unspecified. It is separate from direct character Resources
interactions, numeric created-item valuation and buyer/seller negotiation. Its
exact nested shape rejects invented numeric, transaction and execution fields.
Ordinary Appraisal does not inherit it. Source: Shrewd Appraisal, BWGR 296/298.
No economic/Resources evaluator or new durable architecture boundary is added.


### Created-equipment capabilities

CreatedEquipmentCapability belongs to equipment integration under D-025. Its
output is created-equipment with a source-authored equipmentKindId; its capability
is counts-as-tool for destroying structures. It describes the completed output,
not the owning skill's construction ToolRequirement. No operator, numeric use
bonus, damage or destruction procedure is implicit. Exact nested validation and
serialization preserve this separation and compatibility with structure resistance.
Source: Siege Engineer, BWGR 296/298. No evaluator or new durable boundary follows.


### Cooperation permission constraints

Cooperation is Range and Cover integration metadata with an explicit external
maneuver-roll reference, helper/recipient roles, Training requirement applying to
each participant, same-team relation and maxParticipants. The limit counts the
cooperating group, never five helpers plus a primary or helping dice. Both loaded
production and partial fixtures validate the nested shape and Training reference.
No helping, team, maneuver or Range and Cover execution is introduced. Source:
Skirmish Tactics, BWGR 297/299; its Aptitude-only root remains separate under D-026.


### Poison treatment procedures

PoisonTreatment belongs to Injury integration, separate from created-poison
manufacture. Three typed branches preserve injury-poison Herbalism wound guidance
and half/round-up, Ob-penalty magnitude and unquantified extra-success reduction,
and direct dice subtraction's named doubling plus explicit one-die restoration
per extra success. No generic arithmetic/margin language is introduced. Contextual
Herbalism reuse for ordinary injuries remains a distinct skill relation. Nested
shape/reference validation never executes arithmetic or chooses the rounding
interpretation. Source: Song of Soothing, BWGR 299/301 and user audit confirmation.


### Summoning magical-use scope

UseRequirement adds summoning-magic alongside spell-casting and aura-perception.
The umbrella covers call/bind/command spirits. Its Gifted trait requirement applies
only to that use, not academic possession, opening, advancement or FoRK references.
Availability remains separate. Integrity validation checks kind/id/use without
performing a trait/academic/magic evaluation. Sources: Summoning 303/305 and
Gifted 327/329. Detailed procedures remain in the external Codex integration.


### Injury-clock outcomes

AdvanceInjuryClock is a skill-test state-change intent for the treated wound's
blood-clock, with integer stages and explicit external-anatomy-of-injury
applicability. Surgery emits one stage on ordinary failure. It creates no clock
or severity ladder and resolves neither non-bleeding-wound applicability nor
stacking/replacement of general treatment effects. The external procedure remains
a separate Injury integration. Integrity checks reject invented downstream fields;
serialization does not execute clock progression. Source: Surgery 303/305.


### Named obstacle-penalty relief

ObstaclePenaltyRelief extends SkillProcedure for relief of an existing positive obstacle penalty, with an explicit successful test obstacle and shrug-off effect. Scope and duration are source-unspecified; the descriptor is neither a negative test modifier nor a reference to Injury's Shrug It Off procedure. Integrity checks validate positive integer obstacle/magnitude, exact field shapes and bounded semantic labels, rejecting executable/permanence/guessed-scope fields. Survival supplies Ob 5 and +1 Ob (303/305). No penalty registry, lookup, removal or duration execution exists.


### Declared intent and bounded target consequences

SkillTestProfile.declaredIntent records the source requirement for an exact pre-test submit-or-reveal intent. A declared-intent-fulfilled outcome references that same primary-test declaration; integrity checks reject a missing declaration or foreign test reference. Narrative interpretation remains manual under D-028.

The highest-of-target-abilities obstacle basis selects the higher current exponent of two distinct target RootAbility references, without calculation. A debilitating grant-trait effect uses contextual selection with non-exhaustive examples and a primary-test obstacle value reference. A gm-selected-consequence effect preserves exactly the source injury/death/beneficial-resistance-trait alternatives, keeping injury severity and beneficial trait value source-unspecified. These are bounded, typed state-change intents, not recursive expressions, trait identities or executors. Source: Torture 304–305 / 306–307. No new durable architectural decision is required.


### Two-weapon Fight use

SkillIntegration.twoWeaponUse is restricted to Fight and a Training owner. TwoWeaponUse separates eligible weapon-pair requirements, off-hand Strike exemption, simultaneous Strike split-pool permission and Block & Strike split-skill-dice permission. Each permission applies only with the owning Training and eligible pair. Both splits are player-chosen; the descriptor selects no weapon skills, profiles or numeric allocations. Block & Strike reuses the external action identity without granting Shield Training or shield effects. Strict shape validation rejects unreviewed constraints, effects and defaults. The source-shaped descriptor adds no inventory, Fight or damage evaluator. Source: Two-Fisted Fighting Training 306/308; D-026 and D-027 remain unchanged.
