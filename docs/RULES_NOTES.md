# Verified Rules Notes

This document contains concise implementation-oriented paraphrases of rules verified against **Burning Wheel Gold Revised**. It is not a replacement for the rulebook.

## Lifepaths and settings

**RAW:** A character's first lifepath must be a **Born** lifepath. Choosing it establishes the character's starting setting. After that, lifepaths in the current setting may be chosen in any order unless a requirement or restriction says otherwise. See *Character Burner → Choose Lifepaths → Born / Born Setting* (book p. 85).

**Implementation consequence:** `isBorn` is not just another requirement. Once any lifepath is selected, every Born lifepath must evaluate illegal unless a future source explicitly establishes an exception.

**RAW:** Moving from one setting to another happens through **Leads**. Taking a Lead adds one year to starting age. A player may remain in the current setting instead. See *Leads: Moving to a New Setting* (book p. 86).

**Implementation consequence:** age must include both lifepath years and Lead years; setting transition history needs to be representable independently of UI navigation.

## Repeating lifepaths

**RAW:** Lifepaths may be repeated, but repeated selections are subject to the Law of Diminishing Returns. Second, third and fourth+ selections change what is earned and which listed skill/trait becomes required. See *Repeating Lifepaths: The Law of Diminishing Returns* (book pp. 86–87).

**Implementation consequence:** lifepath grants cannot be modeled as a single unconditional fixed payload if repeat support is implemented. The effective grant depends on how many times that path has already been taken.

## Age and stat pools

**RAW:** Starting age is the sum of lifepath Time plus one year for each Lead taken. See *Age* (book p. 87).

**RAW:** Starting mental and physical stat pools come from the stock's age chart, then lifepath stat bonuses are added. Mental points are spent on Will and Perception; physical points are spent on Agility, Speed, Power and Forte. See *Stats → Age Chart / Mental and Physical Pools / Divide* (book pp. 87–88).

## Lifepath skill lists

**RAW:** Lifepath skill points may be spent only on the master skill list produced by the character's chosen lifepaths. See *Skills → Skill Choices* (book pp. 88–89).

**RAW:** The first skill listed on each lifepath is required. If that skill is already present from an earlier path, the next skill becomes required, and so on. The required skill must be opened but does not have to be advanced. See *Required Skill* (book p. 89).

**Implementation consequence:** required-skill resolution depends on the ordered history of selected lifepaths and on already-open skills.

## Opening and advancing skills during character burning

**RAW:** A standard skill costs **1 skill point to open**. Its starting exponent is half its root stat, rounded down. If the skill has two roots, use half the average of the roots, rounded down. See *Opening Skills: Roots* (book p. 89).

**RAW:** Some special skills explicitly cost 2 points to open; the special cost is noted where applicable. Training skills cost 2 points to open and have no exponent rating. See *Opening Skills: Roots* and the following text (book pp. 89–90).

**RAW:** Advancing a skill during character burning costs **1 point per exponent increase**: one point adds one die. See *Advancing a Skill* (book p. 90).

**RAW:** General skill points can open or advance any skill not barred by restrictions. Lifepath skill points can only open/advance skills from the character's lifepath-derived skill list. A skill opened using general points cannot then be advanced using regular lifepath skill points. See *Spending General Skill Points* (book p. 90).

**Implementation consequence:** skill purchase history must track which pool paid for opening and advancement. A single undifferentiated `spentSkillPoints` number is insufficient for exact rollback.

## Root stats outside character burning

**RAW:** Every skill has a root stat or combination of stats. Outside character burning, learning a new skill uses Aptitude and Beginner's Luck; when the skill opens, it begins at half the root (or average roots), rounded down. See *Advancing Abilities → Learning New Skills* (book pp. 51–52).

**Implementation note:** These play-advancement rules should not be confused with character-burning point costs. The simulator may reuse root calculations, but the workflows are distinct.

## Known implementation-sensitive distinctions

- **Rule:** first lifepath must be Born.
- **Project decision:** the temporary v2 slice exposes only Born Peasant and City Born as starting choices.
- **Rule:** Leads add years and permit setting changes.
- **UX decision:** how Leads are visualized as a graph or transition UI.
- **Rule:** standard skill open = 1 point; exponent based on root.
- **UX decision:** use +1 / -1 controls and a large exponent display.

## Items still requiring audit before implementation

- complete Human lifepath dataset and all restrictions/requirements;
- precise representation of all Lead naming variants and subset/settings terminology;
- all special skill opening costs and restricted skills relevant to the temporary human slice;
- age-chart data for the supported stock(s);
- trait/resource rules needed by later Character Burner milestones;
- gray/white shade edge cases if exposed in v2.
