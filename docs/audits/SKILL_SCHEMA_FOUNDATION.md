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
- Demonology can use any ritual-type skill as FoRK guidance. Composition accepts
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
