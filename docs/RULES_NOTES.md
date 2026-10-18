# Verified Rules Notes

This document contains concise implementation-oriented paraphrases of rules verified against **Burning Wheel Gold Revised**. It is not a replacement for the rulebook.

## Interpretation discipline

**Project decision:** when RAW leaves a small implication unstated but the surrounding rules, terminology and fictional meaning strongly constrain the intended result, the project may adopt the narrowest reasonable interpretation and label it explicitly as **project interpretation**.

This is not permission to invent convenience rules. If multiple materially different readings remain plausible, the issue stays **OPEN** until resolved. See `docs/DECISIONS.md` D-010.

The book itself sometimes instructs readers to use common sense in context-sensitive adjudication, but this project does not treat that as a blanket license to replace explicit rules with intuition.

## Lifepaths and settings

**RAW:** A character's first lifepath must be a **Born** lifepath. Choosing it establishes the character's starting setting. After that, lifepaths in the current setting may be chosen in any order unless a requirement or restriction says otherwise. See *Character Burner → Choose Lifepaths → Born / Born Setting* (book p. 85).

**Project interpretation:** A character has exactly one Born lifepath, at index 0. The source explicitly requires the first path to be Born and describes Born as birth/childhood, but the audited passage does not separately state a universal “Born paths may never be repeated later” sentence. The project therefore records Born-only-once as an explicit accepted interpretation rather than overstating the wording of RAW. See `docs/DECISIONS.md` D-011.

**Implementation consequence:** once any lifepath is selected, every Born lifepath evaluates illegal with a stable reason such as `BORN_LIFEPATH_NOT_FIRST`.

**RAW:** Moving from one setting to another happens through **Leads**. Taking a Lead adds one year to starting age. A player may remain in the current setting instead. Once in the destination setting, lifepaths there may be chosen subject to requirements/restrictions. See *Leads: Moving to a New Setting* (book p. 86).

**Implementation consequence:** age must include both lifepath years and Lead years; setting transition history needs to be representable independently of UI navigation.

**Data note:** Human tables use shortened/variant destination names such as `Village`/`Villager`, `City`/`City Dweller`, and `Soldier` for the Professional Soldier subsetting. Data import should normalize these to canonical setting ids rather than create duplicate settings.

**Data note:** Some Lead entries are predicates such as `Any` or `Any except ...`, so Leads cannot be represented only as a fixed array of destination strings.

## Current product scope

**Project decision:** the first playable Human slice exposes **Born Peasant**, **Village Born**, and **City Born** as initial choices.

**Project decision:** the supported first-slice lifepath areas are **Peasant**, **Villager**, **City Dweller**, and **Professional Soldier**. Professional Soldier is supported as a reachable subsetting; no Soldier Born path is invented.

**Project decision:** a RAW-legal Lead to an unimplemented destination is reported as out of product scope, not as illegal under Burning Wheel rules.

See `docs/DECISIONS.md` and `docs/audits/CB-001_FIRST_HUMAN_SLICE.md`.

## Repeating lifepaths

**RAW:** Lifepaths may be repeated, but repeated selections are subject to the Law of Diminishing Returns. Second, third and fourth+ selections change what is earned and which listed skill/trait becomes required. See *Repeating Lifepaths: The Law of Diminishing Returns* (book pp. 86–87).

**Implementation consequence:** lifepath grants cannot be modeled as a single unconditional fixed payload if repeat support is implemented. The effective grant depends on how many times that path has already been taken.

**Project interpretation:** when a repeated-lifepath grant is halved and produces a fraction, round **up**. The Law of Diminishing Returns does not specify the rounding direction in the audited paragraph, so this is explicitly a project interpretation rather than RAW. See `docs/DECISIONS.md` D-013.

Examples: 5 → 3, 7 → 4.

## Age and stat pools

**RAW:** Starting age is the sum of lifepath Time plus one year for each Lead taken. See *Age* (book p. 87).

**RAW:** Starting mental and physical stat pools come from the stock's age chart, then lifepath stat bonuses are added. Mental points are spent on Will and Perception; physical points are spent on Agility, Speed, Power and Forte. See *Stats → Age Chart / Mental and Physical Pools / Divide* (book pp. 87–88).

**Data note:** `+M/P` is a player choice of one pool while `+M, P` grants both. These cannot be flattened into the same fixed delta.

## Lifepath requirements and restrictions

**RAW:** A lifepath with a requirement may only be taken when that requirement is met. The general Character Burner guidance explicitly says requirements must be met before taking the path. See *Requirements* (book p. 85).

**RAW:** The Human tables contain explicit restrictions on position, repetition, age, total lifepath count, gender and other conditions.

**Implementation consequence:** requirements are structured predicates, not display text. The first supported Human tables already require position checks, one-time limits, any-of prior paths, category/tag requirements, counted prior paths and prior-lifepath-metadata checks.

**Project UX/implementation decision:** rare restrictions phrased in terms of final/starting age, such as Human Elder, do not receive a dedicated intermediate legality status in the first implementation. Show the condition clearly in the lifepath description and verify it during whole-build validation. See `docs/DECISIONS.md` D-012.

**Implementation recommendation:** keep `canSelectNext()` and `validateBuild()` as separate concepts. Immediate historical legality belongs in the former; whole-build constraints belong in the latter.

## Lifepath skill lists

**RAW:** Lifepath skill points may be spent only on the master skill list produced by the character's chosen lifepaths. See *Skills → Skill Choices* (book pp. 88–89).

**RAW:** The first skill listed on each lifepath is required. If that skill is already present from an earlier path, the next skill becomes required, and so on. The required skill must be opened but does not have to be advanced. See *Required Skill* (book p. 89).

**Implementation consequence:** required-skill resolution depends on the ordered history of selected lifepaths and on already-open skills.

**Data note:** some lifepaths grant both ordinary skill points and General points. Store them as separate pools/grants.

## Opening and advancing skills during character burning

**RAW:** A standard skill costs **1 skill point to open**. Its starting exponent is half its root stat, rounded down. If the skill has two roots, use half the average of the roots, rounded down. See *Opening Skills: Roots* (book p. 89).

**RAW:** Some special skills explicitly cost 2 points to open; the special cost is noted where applicable. Training skills cost 2 points to open and have no exponent rating. See *Opening Skills: Roots* and the following text (book pp. 89–90).

**RAW:** Advancing a skill during character burning costs **1 point per exponent increase**: one point adds one die. See *Advancing a Skill* (book p. 90).

**RAW:** General skill points can open or advance any skill not barred by restrictions. Lifepath skill points can only open/advance skills from the character's lifepath-derived skill list. A skill opened using General points cannot then be advanced using regular lifepath skill points. See *Spending General Skill Points* (book p. 90).

**Implementation consequence:** skill purchase history must track which pool paid for opening and advancement. A single undifferentiated `spentSkillPoints` number is insufficient for exact rollback.

## Root stats outside character burning

**RAW:** Every skill has a root stat or combination of stats. Outside character burning, learning a new skill uses Aptitude and Beginner's Luck; when the skill opens, it begins at half the root (or average roots), rounded down. See *Advancing Abilities → Learning New Skills* (book pp. 51–52).

**Implementation note:** These play-advancement rules should not be confused with character-burning point costs. The simulator may reuse root calculations, but the workflows are distinct.

## Known implementation-sensitive distinctions

- **RAW:** first lifepath must be Born.
- **Project interpretation:** Born lifepaths are legal only at index 0 and never reappear later.
- **Product scope:** temporary starts are Born Peasant, Village Born and City Born; supported areas are Peasant, Villager, City Dweller and Professional Soldier.
- **RAW:** Leads add years and permit setting changes.
- **Product behavior:** RAW-legal but unimplemented Lead destinations are shown as out of scope, not illegal.
- **Project interpretation:** odd halved grants from repeated lifepaths round up.
- **UX decision:** final-age requirements are described on the lifepath and checked during whole-build validation without a special pending-status UX.
- **UX decision:** how Leads are visualized as a graph or transition UI.
- **RAW:** standard skill open = 1 point; exponent based on root.
- **UX decision:** use +1 / -1 controls and a large exponent display.

## Skill List schema audit — Issue #20

The verified [schema audit packet](https://github.com/langepok/Burning-Wheel-Character-Puncher/issues/20)
supplies the following additional paraphrases. These are metadata foundations,
not implemented skill/roll/subsystem evaluators.

- **RAW:** FoRK lists are situational guidance, not exhaustive allowed lists.
  A related owned skill contributes one die, or two at exponent 7+. Stats and
  attributes do not FoRK. See *Fields of Related Knowledge*, book pp. 36–37
  (PDF pp. 38–39).
- **RAW:** Training costs two points to open, has no exponent and no normal
  advancement (book 88 / PDF 90). The seven explicit General footnotes limit the
  root to Aptitude only: Antiphon Union (255), Armor (256), Formation Fighting
  (274), Mounted Combat (284), Shield (295), Skirmish Tactics (297), Two-Fisted
  Fighting (306); PDF pages are two greater. Learning tests are earned through
  practice or instruction (book 51 / PDF 53), independently of root usage. See D-026.
- **RAW:** Mounted Combat: Bowman Training is a separate source option from
  Mounted Combat Training. Elven Outrider grants Bowman and Elven Lancer grants
  ordinary Training (137/139). The character example owns both (130/132).
  The appropriate character/setting choice (284/286) concerns an acquisition,
  not global exclusive ownership; effects remain external mounted-combat rules.
- **RAW:** The printed `§` identifies magical open-ended skills, but other rules
  can also make tests open-ended. Nogger is a Craftsman skill with this marker
  (book p. 285); Orc Torture uses Hatred and is open-ended (book p. 304).
- **RAW:** Astrology's FoRK can apply to skills except Martial/Physical types.
  Sixes reroll normally; on a one, reroll the die and subtract one success if
  that second roll fails. A linked test avoids this special FoRK die. Rune
  Casting uses the same style of FoRK. See book pp. 257 and 293.
- **RAW:** Histories and Wise topics are separately owned skills, despite their
  family presentation (book pp. 277 and 309). Appropriate Weapons is a choice
  heading, not an owned skill (book p. 256).
- **RAW:** Availability scope, prerequisites to opening and conditions on use
  are distinct. Playwright requires Write to open (book p. 288); Sorcery's
  Gifted interaction concerns spell use and does not establish an opening
  prerequisite in this audit (book p. 299).
- **RAW:** Resources recovery recurs across Accounting, Administration,
  Beggardry, Estate Management, Extortion and Waiting Tables (book pp. 253,
  259, 271, 307). Beggardry can also produce cash. These are typed interactions,
  not a Resources engine.
- **Unresolved source reference:** Poisons prints `Alchemical` (book p. 288).
  Alchemy (book p. 254) is only a probable target; it is not silently substituted.

See [`audits/SKILL_SCHEMA_FOUNDATION.md`](audits/SKILL_SCHEMA_FOUNDATION.md) for
fixture scope, incomplete evidence and supplemental task-example provenance.

## PR #21 subsequent BWGR review

The user's subsequent RAW verification corrects Boxing/Martial Arts to two
separate skill identities sharing mechanics: the Boxing entry and Fight refer
to both skills, and the Martial Arts entry refers back to Boxing. The Boxing
heading remains canonical source text, not an instruction to merge identities.

Additional source examples establish composed tool requirements, broader
contextual FoRK guidance, target trait/stock/origin conditions and general
Read/Write literacy. Their concise paraphrases and source-entry names are in
the [review record](audits/SKILL_SCHEMA_FOUNDATION.md#pr-21-raw-review-corrections).
The review supplied no additional page numbers; none are fabricated here.
Playwright's Write prerequisite is unchanged. The standard/special/Training
opening-cost rules above support a sourced base-cost override representation,
not cost inference from magical markers or an implemented spending engine.

## General Skill List PDF corrections

- **RAW:** The general Wises entry prints Skill Type Special (book p. 309 /
  PDF p. 311). Named exceptions, including Black Legion-wise (book p. 260),
  explicitly print Wise. Family membership does not normalize the printed type.

- **RAW:** Demonology suggests Ancient History, Obscure History, Summoning and
  Doctrine (book p. 267 / PDF p. 269). The ritual-type FoRK suggestion belongs
  to Empyrealia (book p. 270 / PDF p. 272), alongside Doctrine and Summoning.
  These remain distinct identities and non-exhaustive FoRK guidance.
- **RAW:** Dwarven Rune Script and Elven Script require generic expendable tools
  for writing only; reading has no tool requirement (book pp. 269–270 /
  PDF pp. 271–272). This concerns tools, not eligibility to use the skill.

## Antiphon creation-stage cross-reference

- **RAW, confirmed source reading:** Antiphon Union Training has no direct tool
  requirement. The Tools qualification refers to the skill-song stage that
  creates the base item; that creation follows the selected song's own rules
  and tools (book p. 255 / PDF p. 257). It does not automatically require those
  creation tools during the later spell-song enchantment stage.

## Contextual Resources metadata

- **RAW:** Blacksmith can replenish taxed Resources if a suitable place to
  practice the trade is available (book p. 260 / PDF p. 262). This circumstance
  is encoded on recovery independently of the Workshop tool requirement.
- **RAW:** Carpentry can replenish taxed Resources and requires Workshop tools
  (book p. 263 / PDF p. 265); its recovery description does not contain the
  Blacksmith workplace qualifier. Do not propagate that condition from Tools.

## Items still requiring audit before dependent implementation

- complete manually verified data transcription for all lifepaths in the four supported areas;
- curated semantic category membership for requirements such as horse-related/guard/priest/sorcerous;
- special wife-lifepath skill/resource effects for later milestones;
- gray/white shade edge cases if exposed in v2.

### Created-item valuation (BWGR 275, 308 / PDF 277, 310)

Gem Artifice increases a manufactured gem/stone's Resources obstacle by one;
a pre-roll optional +2 crafting obstacle adds another one. Gemcraft adds one die
of Resources value to a cut gemstone. White Metal Artifice has the same ordinary
item obstacle/tradeoff shape. These modify created items, not character Resources.
Gem Artifice's enchanting matrix and Gemcraft's Antiphon connection are separate
magic references. The partial White Metal representative omits the mithril clause.

### Equipment-use bonuses (BWGR 260, 274 / PDF 262, 276)

Forge Artifice can embed one advantage die for each +2 crafting obstacle chosen;
the final obstacle must be met. The bonus belongs to use of the created forge.
Black Metal Artifice can add +2 crafting obstacle for +1 die on skill tests using
the created tools. Its entry does not establish per-increment repeatability;
metadata preserves that as unspecified. Neither effect is a Resources value bonus.

### Games of Chance settlement (BWGR 275 / PDF 277)

Set the prize Resources obstacle before the versus skill test. The loser then
tests Resources at that obstacle. Passing gives the winner a Resources advancement
credit at the same obstacle; taxation gives the winner cash equal to the loser's
taxed dice. Store these separately conditioned consequences without imposing
exclusivity. Gambling's wager/prize contest does not acquire this settlement rule.

### Haggling negotiation (BWGR 276 / PDF 278)

Haggling negotiates price, purchase terms and contracts through a buyer/seller
versus test. The buyer may lower the relevant obstacle by one. The General entry
adds no separate outcome condition, seller consequence or price-calculation rule.
Preserve this as Resources integration metadata, separate from gambling settlement
and crafted-item valuation, without executing a purchase.

### Structure resistance (BWGR 276, 301 / PDF 278, 303)

Hallmaster and Stone Artifice allow an optional +2 obstacle during construction
for +1 obstacle on any test to alter or destroy the resulting structure. Neither
entry specifies per-increment repetition. Store repeatability as unspecified and
the penalty as a property of tests against the structure, not user bonus dice,
Resources value or hit points. No destruction calculation is implemented.

## Skill-level opposed-test metadata

Inconspicuous (book 278 / PDF 280) opposes Observation. Four separate obstacle
penalties are preserved: garish or inappropriate attire (+1), inappropriate
above/below social station (+1), regional-origin mismatch (+1), and race/stock
mismatch with the crowd (+2). Typed comparisons retain actor/environment mismatch;
this metadata does not evaluate them or decide stacking.

Observation (286/288) can oppose Inconspicuous, Stealthy, Sleight of Hand or Trapper.
Stealthy (301/303) opposes Observation, with advantage guidance for light, weather
and ground. Representative excerpts preserve opposition without inventing fixed
advantage dice or claiming complete transcription of either later record.

## Husbandry obstacle guidance (BWGR 255, 259, 278 / PDF 257, 261, 280)

Animal Husbandry and Bird Husbandry use Field Dressing OR Apothecary obstacles
when tending wounds and illness. Insect Husbandry uses Apothecary obstacles for
that activity. Their ordinary husbandry remains their own skill use. This is
scoped obstacle guidance, not whole-skill substitution or inheritance of tools,
roots, Skill Type, FoRKs, capabilities or special rules.

Instruction (278/280) refers to Learning from Another for obstacle guidance.
Its catalog record preserves that section reference in a concise authored summary;
the external chapter's teaching procedure is not transcribed or executed here.

## Target-derived skill obstacles (BWGR 278 / PDF 280)

Interrogation uses the current Will exponent of the target as its obstacle, with
trait and situational adjustments whose values are not quantified in the entry.
A target Belief preventing disclosure is a source example of situational
disadvantage, not a universal obstacle increase per Belief. The catalog stores
manual/unquantified sources separately from numeric modifiers and executes none.

Intimidation uses the victim's Will for the initial threat test (278-279/280-281).
Its representative basis excerpt does not inherit Interrogation adjustments.
The basis-only excerpt stays partial. The production record separately stores
the approved success/Steel/hesitation metadata described below.

## Intimidation follow-up (BWGR 278-279 / PDF 280-281)

Outside Duel of Wits, Intimidation tests against target Will. If it succeeds, the
target makes a Steel test; extra successes from the primary Intimidation test add
to the hesitation obstacle. Store Steel as an attribute ability reference and the
extra successes as a structured primary-test value reference, not a numeric delta.
Scope this primary procedure and follow-up outside Duel of Wits while retaining
the skill's separate Duel of Wits usage index. Metadata does not run any tests.


## Jargon contextual opposition (BWGR 279 / PDF 281)

Jargon identifies speakers and communicates plans/instructions; its versus case
opposes the skill used by a participant trying to eavesdrop. The entry supplies no
fixed opposing identity. Preserve a skill-only eavesdropper reference with manual
context resolution, without selecting Observation, Perception or Jargon as default.
This is source-supported contextual selection, not missing transcription data.


## Knots opposition and Double Obstacle Penalty (BWGR 280 / PDF 282)

For securing a person, Knots opposes Escape Artist or Power. Per the confirmed
source reading, only Power suffers Double Obstacle Penalty. Store skill/stat
alternatives with the named penalty on the Power branch. The canonical mechanic
doubles base obstacle/opponent successes before other modifiers; modifiers are
not doubled. This is descriptive metadata, not a final-obstacle multiplier or +2.
Escape Artist has only identity/provenance from the Knots reference, not an
invented full skill definition. No test or obstacle calculation is executed.


## Leathercraft enchantment results (BWGR 280 / PDF 282)

Leathercraft with Antiphon Union and Song of Silence can produce Elven boots
granting one die to Stealthy. Store both components and the specific skill benefit
without a crafting-obstacle cost or tool inheritance. Antiphon Union is Training;
Song of Silence is an external magic source reference, not a General skill record.
The Doom of Strength belt example has no numeric effect in this entry; retain
only its source-backed magic summary. Metadata does not enchant or equip items.


## Logistics contextual effects (BWGR 281-282 / PDF 283-284)

A force with a majority of troops having Hatred grants +1D. Separately, +1 Ob
applies to a non-Dwarven force in mountains/underground; war mounts in heavily
wooded countryside; and presence of anyone with Prince of the Blood, Aman, Fea
or Dvergar. War-mount source examples are destriers/coursers. +2 Ob applies to
enemy scorched-earth countryside; the same countryside with a prior Logistics
test within the last Resources maintenance cycle; and winter with war mounts,
riding mounts or pack animals. Store all seven independently, preserving the
printed composition/quantifiers rather than substituting a target stock or
inventing thresholds. These are skill-test facts, not an army/supply evaluator.


## Meditation procedures (BWGR 283 / PDF 285)

Meditation substitutes for sleep: each hour counts as rest for wound/Tax recovery.
The first hour is Ob 1, with +1 Ob per additional hour; failure means falling asleep
at some point, without a stated time or credited-hours rule. Separately, centering
is a linked pre-test. For versus/detailed conflict, Meditation opposes the opponent's
contextual skill; winning grants +1D to the linked target test. The ordinary case
references linked-test semantics without inventing an opposed procedure.
Vague awareness remains separate, as do Perception/Observation tests to detect
Stealthy characters. A Sorcerer may sustain spells while meditating and retests Tax
under The Power Still Flows Through Him. No ability named Awareness or recovery,
Tax, duration, centering or conflict evaluator is introduced.

**RAW — Munitions adverse crafting outcome** (book 284 / PDF 286): zero
successes when manufacturing powder or explosives cause cook-off/misfire; the
maker takes the Mark result of the device being built. This is not every failed
test. Skill metadata preserves the source-defined item reference without looking
up damage or assigning a Mark to powder. Bomb Marks belong to item source facts,
not a constant embedded in the consequence. No injury/detonation engine follows.

**RAW — Musical Instrument contextual Advantage** (book 285 / PDF 287):
base obstacle is the listener's Will. Performed music suitable to the current
mood grants canonical Advantage; this entry specifies no fixed dice amount.
The typed effect delegates general Advantage semantics to external rules/context,
separate from fixed dice, obstacle modifiers and manual obstacle adjustments.
The suitability leaf preserves the relation without a mood taxonomy or evaluator.

**RAW — Name Ritual test outcomes** (book 285 / PDF 287): obstacle is target
Will. Success bestows a name and 1D ordinary reputation on the character being
named. Failure denies naming and gives an infamous reputation with explicitly
unspecified magnitude. It is not inferred from other reputation examples or
represented as zero. Reputation is a character/world-state outcome, not bonus
dice on the ritual. No audience, reputation scope, permanent naming restriction,
merging or Circles procedure is supplied by this entry or added to metadata.

**RAW — Nogger crafted-consumable effects** (book 285–286 / PDF 287–288):
a Dwarf's full draught gives 1D to the next Health test and +1 Ob to Social skill
tests for the scene, once active without stacking from further drinking. Consumed
steins at least current Forte cause drunkenness (+1 Ob all tests) for 10 minus
Health hours. Other creatures become drunk on a mouthful, receive no restorative
benefit and have no separately specified duration in this sentence. Do not inherit
the Dwarf duration or invent a clamp. Equipment integration stores these independent
consumption cases; no effects are applied at the Nogger crafting test. See D-025.

**RAW — Oratory crowd obstacle** (book 286 / PDF 288): the obstacle is the
most common current Will exponent in the crowd, not one target's Will. The entry
specifies neither averaging/extrema nor tie resolution. Metadata references this
source-defined aggregation without performing it. Duel of Wits use is a separate
subsystem fact; Command, Persuasion and Rhetoric remain the printed FoRKs.

**RAW — Orienteering journey results** (book 286 / PDF 288): success finds the
intended way without delay. Failure makes the traveller and companions lost;
they either reach the intended destination but miss relevant appointments, or
reach an unintended location. No method for selecting an alternative, travel
duration or distance is stated. A map supplies one advantage die to the test:
fixed 1D, distinct from Musical Instrument's unquantified canonical Advantage.
Maps are optional; Tools remains none.

**RAW — P before Poisons** (book 287–288 / PDF 289–290): Paean of Deeds uses
Conspicuous mechanics. Persuasion uses the intended victim's Will. Playwright
retains Write as an opening requirement. Poetry adds 1 Ob when imitating another
poet's style. Poisonous Platitudes combines Persuasion/Soothing Platitudes, uses
Hatred with open-ended rolls, targets victim Will and separately refers to Duel
of Wits. None of these metadata facts executes subsystem rules.

**RAW — Poisons potency and delivery** (book 288–289 / PDF 290–291): sickening
requires crafting Ob 2 and gives +1 Ob; debilitating Ob 3/+2 Ob; deadly Ob 4/B10
wound. The entry gives no penalty test scope, duration, resistance, onset or
recovery. Ingestion is baseline; blade, inhaled vapor and contact add 1/2/3 to
crafting Ob respectively, not to product effect. Store independent dimensions
without exposure/wound execution. Alchemical remains the printed unresolved FoRK,
not silently Alchemy. See D-025.

**RAW — Polearm combat profiles** (book 289 / PDF 291; Weapons Appendix book
554 / PDF 556): one weapon can cut with the blade or thrust with beak/blade tip;
these uses differ in damage and weapon length. Appendix names Polearm Axe Strike
and Polearm Thrust. Skill metadata points to these external profiles and contains
no copied numeric stats. D-027 separates physical item identity from use profiles;
it does not create inventory items, grant weapon modifications or run Fight.

**RAW — remaining P and reviewed early R** (book 289–292 / PDF 291–294):
Purple Song and Riddle of Steel retain Antiphon references without invented wine
or weapon enchantment bonuses. Ratiquette substitutes for Etiquette only with
rats/relatives. Read is distinct from Write and adds 1 Ob for silent reading.
Religious Diatribe uses interlocutor Will; Rhetoric uses victim Perception.
Rhyme of the Gatherer/Mariner/Pathfinder explicitly act as Foraging/Rigging/Tracking;
printed Seafarer and Seafaring remain distinct. Rituals of Blood references the
Orc magic chapter, without implementing spells or their effects.

**RAW — Rituals of Night spell-list casting** (book 292 / PDF 294): this
Sorcerous skill governs casting from its external spell list, whose entries own
the spell obstacles. Individual spells must be purchased or learned separately;
owning the skill does not grant them. Typed magic integration preserves this
requirement without prices, learning procedure or spell records/state. Rituals
of Blood keeps its existing Orc-chapter reference; its audited entry does not
state this acquisition sentence and does not inherit it by analogy.

**RAW — later R before Rune Casting** (book 292–293 / PDF 294–295): Rope Chant
reuses Knots with additional rope creation/repair/untangling guidance and permits
Traveling Gear or Elven Rope. Round of Harvest follows Farming rules. Rule of Law
separates researching-case FoRKs from presenting-case FoRKs. Rude Carpentry's
Orc restriction applies to character burning. Weathersong is retained as printed
unresolved FoRK guidance, without inventing a General Skill identity.

**RAW — Rune Casting fate** (book 293 / PDF 295): pronouncement uses the lower
of two named obstacles: ten minus the target's highest Circles/reputation/affiliation
dice total, or ten minus their most expensive non-common trait point value. This
is source-shaped metadata, not an arithmetic expression language or evaluator.

After success, caster player may inspect target Beliefs and pronounce a suitably
dire fate tied manually to one target Belief. The caster must change their own
character's Belief to match it; missing that commitment or changing it later
invalidates the fate. Target and caster Beliefs are different narrative entities.
The target retains choice; meaning and fulfillment, including fatal fulfillment,
are manual/table judgments. A fulfilled scene awards the fated player one Deeds;
fatal fulfillment gives their next character in this campaign one starting Deeds.
Standard Belief artha rules remain external. Rewards are independent conditional
facts, not automatic execution or an exclusivity rule. Astrology special-FoRK
semantics are preserved. D-028 defines the free-form narrative/structured-reference
boundary without implementing Belief identity/revision state or text matching.

**RAW — Scavenging item-search** (book 294 / PDF 296): a player declares an
item type, excluding a specific or unique thing, in a contextually suitable place.
Midden/ruin/battlefield are illustrative locations. Structured obstacle guidance
keeps junk Ob 1, household goods Ob 2, hard-to-find items Ob 3, valuables Ob 4,
rare objects Ob 5, obscure/out-of-place items Ob 6, with non-exhaustive examples.
Neither request specificity nor location suitability is classified automatically.
This is request legality/source guidance, not inventory lookup, item generation,
Resources valuation or a success-to-equipment grant. D-028's manual/structured
boundary applies; no new durable Decision is needed.

**RAW — later S before Shield Training** (book 294–295 / PDF 296–297): Seduction
uses target Will and separately refers to Duel of Wits; intercourse is not required.
Servant-wise prints Wise (not Special) and restricts Orcs only in character burning.
Sewing retains printed Weaver as unresolved with the existing probable Weaving
audit hint; it is not a silently resolved FoRK.

**RAW — Shield Training action-scoped use** (book 295 / PDF 297; Armor and
Shields book 481/483 / PDF 483/485): trained use adds shield dice to Block and the
defensive portion of Counterstrike, and grants Block & Strike with shield
contribution to its defensive portion. Untrained use augments only Block and
does not grant Block & Strike. This is not passive/always-on defense.

When Striking with the shield itself, choose Brawling, a contextually appropriate
Boxing skill, or Agility. This actor's ability choice is separate from action
access, opposing abilities and the Training root. Shield Training remains
Martial Training with Agility root for Aptitude only (D-026), not a rolled skill.
Boxing selection remains manual, with no fixed/default id or new family; Boxing
and Martial Arts stay distinct (D-024). Block resolution, pool division, VA, shield
failure, positioning and other Fight details remain external rules.


### Ship Management: voyage supply outcomes (BWGR book 295 / PDF 297)

Success avoids supply trouble. Failure causes a shortage of critically needed
supplies, serious complications, the beginning of crew mortality, and qualitative
morale harm. The listed supplies are illustrative; selection is contextual. The
entry gives neither casualty quantities/timing nor numeric morale mechanics.
Vessel base Ob: rowboat/skiff 1, longboat 2, junk 3, caravel 4, carrack 5, felucca 6,
treasure ship 7. Journey modifiers: moderate +1, long +2, ocean crossing +3 Ob.
These are catalog facts; inventory, crew, voyage and consequence execution remain
outside the skill catalog.


### Shrewd Appraisal: identified flaws reduce price (BWGR book 296 / PDF 298)

Shrewd Appraisal identifies flaws in the appraised item and thereby reduces its
price. The entry establishes no reduction amount, Resources obstacle change,
percentage, currency/value dice, bargaining procedure, minimum price or stacking
behavior. Preserve the economic effect with source-unspecified magnitude.
Common/expensive/rare/unique goods use Ob 2/3/4/5. Ordinary Appraisal instead
supports accurate pricing before a Resources test; do not grant it this distinct
price-reduction effect by analogy. Execution remains outside the catalog.


### Siege Engineer: construction input vs equipment output (BWGR 296 / PDF 298)

Siege Engineer requires tools for its building tests. Completed war machines are
separate outputs that count as tools for destroying structures. The entry does
not name an operating ability, bonus, damage or destruction procedure. Building
guidance runs from Ob 1 for a simple ram/scaling ladder through Ob 5 for a massive
metal-capped covered ram; these are construction obstacles only. Equipment output
capability and construction tools remain independent under D-025.

### Following S entries (BWGR 296–297 / PDF 298–299)

Signaling uses a signal lantern or flags. Silent Fury explicitly uses Intimidation
mechanics with its own identity. Silver Trumpet uses an Elven silver trumpet. Sing
uses listener Will and canonical Advantage when the music suits the mood; the
entry specifies no fixed advantage dice. Linked-test use does not import
Meditation's special opposed procedure. These records add no subsystem execution.


### Skirmish Tactics cooperation (BWGR 297 / PDF 299)

Trained fighters may help other fighters with the same Training, on the same
team, on Range and Cover maneuver rolls. The source limits mutually helping
skirmishers to five: store a cooperating-group participant limit, not five helpers
plus a primary. No contribution dice or helping calculation is specified here.
Training's combined Will/Perception root is explicitly Aptitude-only; practice and
instruction remain learning methods. Cooperation metadata grants no broader Fight
or generic-test permission and executes no subsystem rules.

### Subsequent S source distinctions (BWGR 297–299 / PDF 299–301)

Sleight of Hand uses Observation opposition for victim-directed legerdemain.
Smithcraft includes three metalworking capabilities and their obstacle guidance.
Song of the Eldar is explicitly unmarked despite its Astrology mechanics relation.
Elven spell-song crafting combinations remain external magic references with
concise summaries, without invented spell/equipment effects. Song of Lordship
retains the curated Etharchal/Fea/Aman target-trait context.


### Song of Soothing (BWGR 299 / PDF 301)

General injury treatment follows Herbalism in its own context. Poison-specific
procedures are separate: injury poison uses Herbalism's wound obstacle and success
halves poison die penalties, rounding up; Ob-penalty poison uses its current
penalty as Ob and extra successes reduce it with no printed conversion rate;
direct dice-subtraction poison uses twice the subtracted dice as Ob and restores
one die per success over Ob. Do not transfer that 1:1 rate to Ob penalties.
The half/round-up operation is recorded without choosing remaining-vs-removed
arithmetic; re-audit before implementing an evaluator. No timing, resistance,
recovery or penalty mutation is established by this metadata.

### Subsequent S through Stealthy (BWGR 299–301 / PDF 301–303)

Sorcery gates spell-casting use with Gifted while understanding formulae and
opening remain separate; source restriction to Human/Roden is character-burning
only. Printed Astronomy and Warcraft FoRKs remain unresolved source labels.
Spider Husbandry substitutes for Instruction and Field Dressing in spider contexts.
Starcraft crystals are Enchanting vessels. Stealthy uses Speed versus Observation;
light/weather/ground conditions may provide canonical Advantage with contextual
judgment, not a fixed dice amount or automatically stacked contributions.


### Stentorious Debate humorous Tools line (BWGR 301 / PDF 303)

**RAW:** the printed Tools line names A big Dwarvy mouth.
**Interpretation, explicitly confirmed by the user:** this is flavor, with no
enforceable tool requirement. Store tools none and preserve the joke in summary.
It creates no anatomy/trait/item/size/manual check or missing-tools penalty.
Will, Social, Dwarves only, victim Will obstacle, Oratory FoRK and Duel of Wits
use remain source-backed; its conceptual comparison to three other skills does
not import their mechanics. No new ToolRequirement kind or durable Decision.

### Subsequent S through Suicidal Bravery-wise (BWGR 301–303 / PDF 303–305)

Stentorious Singing separates canonical mood Advantage from numeric listener-group
Ob penalties. Stone Artifice reuses audited structure resistance; Stonecraft does
not inherit it merely because source tables resemble one another. Strategy has
commander-versus use and fixed guidance; Strategy Games opposes itself. Stuff-wise
prints Wise and restricts Dwarves in character burning. Suasion specializes
Persuasion without an invented priest eligibility gate.


### Summoning and Gifted use scope (BWGR 303/305; Gifted 327/329)

Gifted permits magical manipulation; without it Sorcery, Summoning and Enchanting
remain academic pursuits. Summoning's use-only summoning-magic requirement covers
calling forth, binding and commanding spirits. It is neither spell-casting nor a
prerequisite for possessing/opening/advancing the skill. Human-only character-
burning availability stays separate. Do not disable academic/FoRK relationships
by copying the magical-use gate to them. The Codex Summoning chapter remains the
external source for procedures/obstacles; no spirit or academic-use evaluator.


### Surgery failed-test Blood Clock effect (BWGR 303 / PDF 305)

**RAW:** Surgery can repair limbs, stop bleeding, remove bodily aberrations and
treat wounds of all types. Failed tests advance the wound's Blood Clock by one
stage; treatment obstacles/mechanics refer to Anatomy of Injury. Store an ordinary
failure outcome targeting the treated wound's clock, not direct severity increase.
**Unresolved interaction:** Superficial/Light wounds do not bleed; the catalog does
not create clocks for them, change their categories or decide that failure has no
effect. Applicability remains external to Anatomy of Injury. Neither replacement
nor stacking with all generic failed-treatment effects is established here.
No timer, severity ladder, bleeding, death or wound-treatment evaluator is added.
