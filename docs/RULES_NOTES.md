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
- **RAW:** Training has no exponent and no normal advancement. Its printed root
  supports Aptitude/practice, independently of Skill Type. The packet cites
  *Character Burner*, book p. 88 / PDF p. 90. Antiphon Union Training is an
  Artisan example (book p. 255), while Skirmish Tactics is Military Training
  (book p. 297).
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

## Items still requiring audit before dependent implementation

- complete manually verified data transcription for all lifepaths in the four supported areas;
- curated semantic category membership for requirements such as horse-related/guard/priest/sorcerous;
- special wife-lifepath skill/resource effects for later milestones;
- gray/white shade edge cases if exposed in v2.
