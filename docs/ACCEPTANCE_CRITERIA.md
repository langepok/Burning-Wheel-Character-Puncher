# Acceptance Criteria

These criteria define the behavior contract for the current Character Burner v2 work. They are intentionally narrower than the full Burning Wheel Character Burner.

## Phase CB-0 — Repository and rules skeleton

- Repository contains agent instructions and durable project documentation.
- Rulebook PDF is not committed.
- No production rules implementation is accepted without corresponding tests.
- Rules, state and React UI are separated by module boundaries.
- Generic catalog/rules/state boundaries do not assume Human is the only stock or that the temporary four Human settings are the universe of content.

### Issue #2 — Technical bootstrap

- A minimal React shell identifies Character Burner v2 as under construction.
- `src/app`, `src/character`, `src/data`, `src/rules`, `src/ui` and `tests` exist.
- A framework-independent smoke test imports a domain module without React or UI.
- A fresh `npm ci`, `npm run typecheck`, `npm run test` and `npm run build` pass.
- The npm lockfile is committed; dependencies and generated build output are not.
- No game rules, lifepath catalog or character-selection UI are introduced.

## Phase CB-1 — Lifepath selection slice

### Issue #9 — Catalog foundation

- Register exactly 19 Peasant and 41 Villager variants through stock-independent catalog interfaces.
- Preserve audited source names, variant/family identities, grants, Leads, requirement trees and source references.
- Validate duplicate ids and dangling stock, setting, family and skill-metadata references; named prerequisites outside this slice remain reference-only definitions, not invented lifepaths.
- Qualify duplicate source names using setting metadata without mutating identity or inferring semantic tags.
- Encode exactly the Peasant/Villager semantic memberships in CB-013.
- Preserve M+P versus M/P, ordinary versus General points, numeric zero trait grants, and Wife-derived resource/skill payloads.
- Derived resource fractions use exact serializable numerator/denominator values; registration supports both 1/2 and 1/4 without setting-specific branches or an inferred resource-rounding policy.
- Skill and resource fractions share that exact representation and validation; Country/Village Wife retain half skills rounded down and their distinct inherited skill-point scopes.
- Country Wife's inherited skill-point scope is explicitly `unspecified`, never ordinary-only/false; Village Wife's is `ordinary-and-general`, per Issue #9's resolution.
- Data tests compare all 60 rows to the audited tables and exercise invalid references, special payloads, requirement precedence, and synthetic non-Human registration.
- No selection rules, grant calculations or UI are added in this issue.

### Starting state

Given a new human build with zero lifepaths selected:

- **Born Peasant** is available.
- **Village Born** is available.
- **City Born** is available.
- No non-Born lifepath is selectable as the first lifepath.
- No other Born option is exposed in this temporary slice unless the scope decision is revised.

> The Peasant + Villager + City starting restriction is a temporary product decision. The first-lifepath-must-be-Born rule is RAW.

### Supported first-slice settings

The initial playable data/rules slice includes:

- **Peasant Setting**;
- **Villager Setting**;
- **City Dweller Setting**;
- **Professional Soldier Subsetting**.

Professional Soldier is included as a reachable supported area through legal Leads/requirements; it is not exposed as an invented Born starting option.

### Born exclusivity

After any first lifepath is selected in rules-enforced mode:

- no Born lifepath is legal;
- no later selection, Lead or setting transition may make Born Peasant, Village Born, City Born or another Born lifepath legal again;
- a rules result for a rejected Born path exposes a stable reason such as `BORN_LIFEPATH_NOT_FIRST`.

> Born-only-once is an accepted **project interpretation** recorded in `docs/DECISIONS.md` D-011. Do not mislabel it as a separate literal sentence from RAW.

### Current-setting choices

After the Born path in rules-enforced mode:

- eligible lifepaths in the current setting are determined by the rules layer;
- requirements/restrictions are evaluated outside React;
- unavailable paths can expose a structured reason for the UI;
- the UI does not duplicate the legality calculation.

### Semantic category requirements

- broad categories such as `acolyte`, `guard`, `sergeant` and `horse-related` are explicit curated metadata, not substring matching;
- `Failed Acolyte` satisfies the current project's `acolyte` interpretation;
- `Guard Captain` satisfies the current project's `guard` interpretation;
- both supported Groom variants, Farrier, Saddler and Cavalryman are explicitly `horse-related` in the first slice;
- satisfying a semantic category is not followed by an extra generic biography-plausibility gate.

### Requirement timing

- requirements based only on already-known history (position, prior lifepath, occurrence count, current setting, etc.) are evaluated by domain rules at selection time;
- the engine has a separate whole-build validation concept rather than assuming every rule can be expressed as a local UI enable/disable check;
- rare final/starting-age requirements such as Human Elder are shown clearly in the lifepath description and checked during whole-build validation, without a dedicated pending-status UX, per D-012.

### Leads

When a supported lifepath permits a Lead to another supported setting:

- the engine can represent taking that Lead;
- the current setting changes according to the selected Lead;
- the transition adds one year to age exactly once;
- undoing that transition removes exactly that year;
- remaining in the current setting does not add a Lead year.

If a Lead points outside the temporary supported slice, the engine must represent that as unsupported product scope rather than pretending the Lead is illegal under RAW.

### Age

At all times:

`displayed age = sum(selected lifepath years) + sum(taken Lead years)`

Selecting/removing paths or Leads updates the value deterministically. A select → undo round trip returns the previous age exactly.

### Lifepath identity and display

Production records preserve separate concepts for:

- concrete setting-specific variant identity;
- audited cross-setting family identity;
- exact printed/source name;
- UI display label.

When the same printed lifepath name occurs in multiple settings/subsettings, the user-facing picker/history qualifies the duplicate with its setting context, for example `Peasant Conscript` vs `Villager Conscript`.

Qualification is presentation-only:

- it must not alter `variantId`, `familyId`, requirements, repeat counting or save identity;
- code must not recover domain identity by parsing the decorated label;
- unique names may remain unqualified when context is already clear.

### Selected lifepath display

The selected-history UI shows:

- ordered lifepaths;
- setting-qualified labels where duplicate names would otherwise be ambiguous;
- accumulated age prominently enough to be read without inspecting debug state;
- Lead transitions when they contribute age or setting change.

### Catalog extensibility

The first Human slice must enter the rules engine through generic stock/setting/catalog interfaces.

Acceptance boundary:

- no core legality/selection function requires a hard-coded list of the four temporary Human settings merely to discover catalog content;
- adding another audited stock/setting later should not require replacing the Human engine with a new parallel engine;
- stock-specific exceptions may add explicit predicate/special-rule capabilities, but ordinary discovery/identity/selection plumbing remains shared.

### Free Creation mode — lifepath foundation

The product has an explicit rules-enforced mode and an explicit Free Creation/sandbox mode.

In Free Creation mode:

- the same rules evaluator can still report that an action violates RAW/project rules;
- violations do not block the user from applying a lifepath action;
- multiple Born lifepaths are allowed, including Born lifepaths after index 0;
- current-setting/Lead access and lifepath requirements/restrictions may be ignored deliberately;
- repeat restrictions may be ignored deliberately;
- the resulting build is not silently reported as rules-valid;
- switching to Free Creation does not mutate canonical lifepath data;
- build/save state records the active mode.

The implementation must not create a second sandbox rules engine or scatter authoritative `freeMode` rule logic through React.

## Phase CB-2 — Stats

When implemented:

- mental and physical point pools are separate domain values;
- mental and physical stats are visually distinguishable;
- allocations cannot spend more points than their corresponding pool contains in rules-enforced mode;
- decrement/refund returns exactly one point to the correct pool;
- reset restores the exact original pools;
- rules calculations are tested independently of React;
- Free Creation can deliberately bypass normal stat-pool/limit enforcement without changing what the normal rules evaluator reports.

## Phase CB-3 — Skills

### Skill Catalog schema foundation — Issue #20

- Define stock-independent skill metadata separately from rule evaluators, character state, UI and subsystem integrations.
- Represent single, combined, attribute and conditional roots; Training has no exponent, no normal advancement and explicit source-supported root usage independent of Skill Type.
- Separate printed markers from unconditional/conditional open-ended behavior.
- FoRK suggestions are guidance with manual contextual additions, and retain typed skill/category/type/Wise/context references. Astrology-style contributor behavior preserves provenance and is shared with Rune Casting.
- Distinguish availability scope, opening requirements and use requirements; never infer Gifted as Sorcery's opening requirement.
- Distinguish mechanics reuse, contextual substitution, capability inclusion, specialization and replacement, including stat/attribute targets.
- Represent independent tool/expendable metadata, repeated Resources interactions, families and weapon-choice expressions without subsystem execution.
- Wise/History topics have separate owned identities; Appropriate Weapons is not a SkillDefinition.
- Keep partial audit fixtures explicitly partial. Untranscribed fields do not mean unrestricted, no tools, or no special behavior. All supplied facts retain packet/task-brief provenance and supplied page references.
- Preserve canonical names, distinct skill identities and unresolved Poisons → Alchemical; probable Alchemy is never promoted to a resolved reference.
- Add representative positive, negative, serialization and type-level tests; retain the entire existing lifepath regression suite.
- Run `npm ci`, `npm run typecheck`, `npm test`, and `npm run build`. No full A–Z transcription or UI/roll/combat/Resources/Injury/magic engine.

### PR #21 schema hardening

- Boxing and Martial Arts have distinct ids; a mechanics relation permits reuse without aliasing identity.
- Preserve source Skill Type labels, including Social, Peasant, Forester, Artist, Musical, School of Thought, Seafaring and Seafarer.
- Tools compose with allOf/anyOf; Falconry, Hunting and Rope Chant preserve the supplied conjunctions/alternatives.
- FoRK guidance supports ritual categories, applicability to content, and history/Wise/song alternatives without prose parsing or a whitelist.
- Context conditions compose target traits, target stock/origin and activities; preserve Song of Lordship, Code of Citadels and Driving conditions.
- Read/Write support general literacy; Dwarven literacy retains its context and Playwright still requires Write.
- Non-Training base opening-cost overrides carry provenance; missing cost remains untranscribed. Never infer costs from markers/types or add Gray-opening metadata.
- New composition nodes receive integrity and serialization regressions; all prior tests and required npm checks pass.

### General Skill List A–Z transcription — source gate

- Antiphon Union Training has no direct tools. Its magic integration preserves
  a base-item-creation reference to an applicable skill song and that song's own
  rules/tools. The reference serializes and validates independently; it never
  copies or propagates tools into Antiphon or its later enchantment stage.

- Resource interactions may carry structured contexts independently of tools.
  Blacksmith recovery requires the suitable-workplace circumstance, while its
  Workshop tools remain separate. Do not infer this condition for other skills.
  Contexts serialize and register; missing, empty or non-string circumstance
  ids are rejected. Recovery without a context remains representable.

- Demonology retains its four named FoRK suggestions and no ritual-category
  suggestion; Empyrealia supplies the real ritual-category representative.
- Dwarven Rune Script and Elven Script require generic expendable tools when
  writing, otherwise none. Reading/writing are structured activities. Conditional
  tools round-trip and compose with allOf/anyOf; malformed conditions and nested
  branches are rejected without introducing a tool evaluator.

- Verify every canonical entry against BWGR (2018), book pp. 252–309 / PDF pp. 254–311; audit fixtures are supporting evidence only.
- Build an independent id/name/kind/page manifest and compare it with complete production definitions, named topics, families and choices, not just a total count.
- Production content must contain no partial fixtures or fabricated defaults; retain explicit unresolved source references.
- Audit the lifepath-reference join separately for General skills, stock-specific references, choices and genuine unresolved references.
- Preserve source conditions on tools and other metadata; a choice between tools is not a conditional requirement based on the activity.
- Add oracle coverage before production blocks A–D, E–H, I–M, N–R and S–Z; run targeted integrity checks after each block and the full required checks before a PR.
- Stop on source conflicts or schema blockers rather than marking incomplete transcription production-ready. Current preflight findings are in `docs/audits/GENERAL_SKILL_CATALOG_AZ.md`.

### Skill availability (rules evaluation)

In rules-enforced mode:

- Lifepath skill points may only purchase skills allowed by the selected lifepaths.
- General skill points may purchase legal unrestricted skills according to RAW.
- Required lifepath skills are identified from ordered lifepath history.

In Free Creation mode, any skill available in the loaded catalog may be selected without those normal eligibility gates. Truly user-authored unknown skills belong to the later custom-content milestone.

### Opening a standard skill

For a standard one-root skill in rules-enforced mode:

- opening cost is 1 appropriate skill point;
- exponent becomes `floor(root / 2)`.

For a standard two-root skill:

- opening exponent follows the verified two-root calculation from the rulebook;
- tests include odd/even root combinations so rounding is explicit.

Special/training skill costs are not silently treated as standard costs.

Free Creation may allow direct overrides once the skill editor supports them, but that must not alter the normal opening calculation or make the override appear RAW-legal.

### Required skill

For each selected lifepath in rules-enforced mode:

- the first listed skill is required unless already open from an earlier path;
- when it is already open, the next listed skill becomes required;
- required means it must be opened before the burn can be considered valid, not that it must be advanced.

### Advancement during character burning

- `+1` increases an opened standard skill exponent by exactly one when legal;
- character-burning advancement cost is exactly 1 permitted point per +1 exponent unless a verified special rule applies;
- `-1` reverses the most recent reversible increment and returns the exact point to the source that paid it;
- exponent display is visually prominent.

### Point-source provenance

Opening/advancement records the source of each spent point in rules-enforced mode.

At minimum, tests cover:

1. open with lifepath skill point → undo → lifepath pool fully restored;
2. open with general point → undo → general pool fully restored;
3. open with general point and advance according to allowed source rules → rollback restores each source correctly;
4. repeated +1/-1 cycles do not create or destroy points;
5. full reset returns the build to the exact pre-skill-allocation state;
6. a Free Creation override does not weaken or bypass these normal-mode invariants when mode is `rules`.

## Regression test matrix

Before a Character Burner PR is complete, relevant tests should cover:

| Area | Required regression |
| --- | --- |
| Born selection | first lifepath must be Born in rules mode |
| Born exclusivity | accepted interpretation: Born legal only at index 0 in rules mode |
| Free Born override | Free Creation can deliberately add later/multiple Born paths while evaluator still reports the violation |
| Temporary starts | Born Peasant, Village Born and City Born all available initially |
| Born reappearance | No Born path becomes rules-legal later |
| Supported scope | Peasant, Villager, City Dweller and Professional Soldier transitions behave according to audited data |
| Unsupported Leads | out-of-scope destination is distinguished from RAW illegality |
| Leads | Lead adds one year once and changes setting |
| Age | total matches lifepaths + Leads |
| Requirements | unmet immediate requirement returns explicit rejection/evaluation in rules mode |
| Semantic tags | Failed Acolyte/Guard Captain/horse-related fixtures use explicit metadata, not name parsing |
| Free requirement override | Free Creation may apply an unmet-requirement path without making it rules-valid |
| Final-age requirement | condition is visible and whole-build validation catches an invalid final age |
| Duplicate display | duplicate source names render setting-qualified labels without changing domain identity |
| Catalog modularity | generic engine/catalog discovery does not depend on a hard-coded Human setting list |
| Skill root | opening exponent matches root calculation |
| Skill cost | standard open and +1 costs are correct |
| Required skill | ordered fallback to next listed skill works |
| Refund | exact pool/source is restored |
| Reset | state and pools equal original snapshot |
| Mode persistence | save/state representation cannot silently turn a Free Creation build into a rules-enforced valid build |

## Definition of done for a feature

A Character Burner feature is done only when:

1. behavior is supported by RAW or an explicit documented project decision/interpretation;
2. acceptance criteria are satisfied;
3. domain tests pass;
4. regression coverage exists for the bug/edge case being addressed;
5. unrelated behavior and layout are unchanged unless explicitly in scope;
6. durable new decisions are recorded in `docs/DECISIONS.md`;
7. unresolved rules ambiguities are listed rather than guessed through.

## Created-item valuation metadata (D-025)

- Gem Artifice stores automatic +1 created-item Resources obstacle and optional
  before-roll +2 crafting Ob for a further +1 item Resources obstacle.
- Gemcraft stores +1 Resources-value die; obstacle and dice remain distinct types.
- White Metal Artifice has a partial regression for the same ordinary-material shape.
- Tradeoffs round-trip through registration; malformed units, targets, costs and
  timing are rejected. Magic references remain separate from valuation.
- Direct ResourceInteraction retains only character recovery/cash semantics.
  No evaluator, price calculation or spending engine is introduced.

## Created-equipment use bonus metadata (D-025 extension)

- Forge Artifice stores the created forge as target, +1 advantage die to its user,
  and +2 crafting obstacle per increment, requiring successful final creation.
- Black Metal Artifice stores a created tool-use +1 die tradeoff costing +2 Ob;
  repeatability remains explicitly unspecified, rather than inferred from Forge.
- Single-tradeoff, per-increment and unspecified repeatability are representable.
  No maximum or stacking calculation is invented.
- Use bonuses are distinct from item valuation, ResourceInteraction and intrinsic
  skill bonuses. The descriptor belongs only to equipment integrations.
- Serialization/registration preserve the data and reject malformed targets,
  dice, costs, repeatability and creation conditions. Existing valuation tests pass.

## Wager settlement metadata

- Games of Chance has explicit winner/loser roles assigned by a versus skill test.
  The prize Resources obstacle is set before that test; the loser's subsequent
  Resources test and the winner's advancement credit reference that shared value.
- Passed-test advancement credit and taxed-dice cash have separate typed conditions
  and effects. The cash amount explicitly references the loser's taxed dice.
- Outcome order does not imply exclusivity or execution. No evaluator is added.
- Gambling has no Games of Chance settlement descriptor or outcomes.
- Serialization preserves the descriptor; integrity validation rejects mismatched
  roles, references, conditions, effects and placement outside Resources integration.

## Purchase negotiation metadata

- Haggling preserves buyer/seller roles, versus-test nature and negotiation of
  price/purchase terms, including its source reference to contracts.
- The buyer may adjust the relevant negotiation obstacle by -1. No win condition,
  seller outcome, purchase flow or automatic price calculation is added.
- Gambling and Games of Chance do not inherit this descriptor.
- The typed descriptor round-trips through registration and rejects malformed
  roles, subjects, test kind, obstacle adjustment or non-Resources placement.
- Keep the current formalization level until General A–Z is finished. Review a
  narrower scope policy separately afterward; stop at further unrepresented RAW.

## Created-structure resistance metadata

- Hallmaster and the Stone Artifice representative store a created-structure
  target, optional +2 building/crafting obstacle and +1 obstacle on tests against
  that structure for alteration or destruction.
- Repeatability is explicitly unspecified for both; do not infer stacking or a max.
- StructureResistance is distinct from EquipmentUseEffect, valuation and direct
  ResourceInteraction. It belongs only to equipment integration metadata.
- Serialization preserves it; integrity validation checks target, cost, modifier,
  alter/destroy action set and repeatability. No durability/destruction evaluator.

## Approved skill-level opposed-test metadata

- SkillTestProfile describes versus tests and one or more validated opposing skill references, without execution.
- Inconspicuous preserves four independent obstacle modifiers (+1/+1/+1/+2), with typed attire/social-station/regional-origin/crowd-stock mismatch contexts.
- Garish OR inappropriate attire and above OR below appropriate station are compositions within individual modifiers; modifiers are not mutually exclusive.
- Observation and Stealthy excerpts demonstrate multiple/single opponents without importing incomplete records into production or inventing Stealthy advantage values.
- Serialization preserves references and conditions; malformed profiles, modifiers and typed contexts fail integrity validation.
- No opposed-test/modifier evaluator, Resources or Fight procedure is introduced.

## Scoped obstacle-guidance references

- A distinct obstacle-reference relation describes only obstacle guidance, with
  ownership by the source skill, a concrete skill target or anyOf skill sources,
  and a required structured context.
- Insect Husbandry references Apothecary for tending wounds and illness; Animal
  Husbandry and Bird Husbandry reference Field Dressing OR Apothecary in that
  same context. Ordinary husbandry remains their own skill use.
- No whole-mechanics reuse, substitution, FoRK, capability inclusion, tested-skill
  selection or root/type/tools/special-rule inheritance follows from this relation.
- Targets and nested contexts survive serialization/integrity validation; malformed
  targets/compositions/contexts and dangling skill references are rejected.
- Changes to a target's metadata do not change source metadata; no evaluator is added.

## Target-derived obstacle and manual adjustments

- SkillTestProfile supports a target-ability-exponent basis with a stat/attribute
  reference and current snapshot, separate from versus-opponent profiles.
- Interrogation records current target Will, target-traits and situational
  disadvantage as separate manual, explicitly unquantified adjustments.
- Disclosure-preventing target Beliefs are structured examples inside situational
  disadvantage, not a universal per-Belief obstacle rule.
- Manual adjustments have no numeric delta; even explicit zero/undefined delta
  is rejected. Their unquantified marker distinguishes RAW absence from missing data.
- An Intimidation excerpt reuses the Will basis without Interrogation adjustments;
  it does not claim full transcription of any additional Steel/hesitation procedure.
- Ability-reference shape, snapshot, sources, quantity markers and examples are
  validated; metadata round-trips without executing formulas or GM arbitration.

## Success-conditioned follow-up tests

- SkillTestProfile stores typed followUps without automatic execution. Generic
  primary-actor/target roles and existing AbilityReference are reused across tests.
- Intimidation's primary target-Will obstacle and success-conditioned target Steel
  follow-up are explicitly scoped outside Duel of Wits; the skill itself remains
  indexed as usable in Duel of Wits rather than restricted out of it.
- Steel is an attribute reference, not a catalog skill identity. Skill ability
  references resolve through the catalog; stat/attribute ids use the existing
  extensible kind/id integrity boundary.
- The hesitation-obstacle modifier adds an extra-successes reference from the
  primary test; no numeric delta, computed amount or formula replaces that reference.
- Dynamic, fixed and manual/unquantified modifiers remain distinct typed forms.
- Contexts, triggers, actors, abilities and values round-trip through validation;
  malformed/dangling skill references and invalid result sources are rejected.
- No Steel, hesitation, Fight, Duel of Wits, success-counting or follow-up engine.

## Context-resolved opposing skills

- Jargon has a versus profile whose opposing skill belongs to the eavesdropper.
- The typed reference explicitly resolves manually from context, without a concrete
  skillId, default or fallback. This is source-supported selection, not missing data.
- Context-resolved references remain distinct from fixed skills, target stats,
  unresolved source-name references and unrestricted ability selectors.
- References serialize and validate; invalid roles/kinds/resolutions and invented
  ids/defaults are rejected. Existing fixed profiles remain unchanged.
- No contextual selection, GM adjudication or opposed-test evaluator is implemented.

## Mixed opposing alternatives and Double Obstacle Penalty

- Knots' securing-person versus profile offers Escape Artist skill OR Power stat.
- Only the Power branch carries the named double-obstacle-penalty modifier.
- This canonical semantic modifier doubles the base obstacle/opponent successes
  before other modifiers; it is neither a fixed +2 nor a final-obstacle multiplier.
- Alternatives and branch modifiers serialize and validate, without a calculation
  engine. Existing fixed/contextual opposing profiles remain unchanged.
- Invalid references, empty/duplicate alternatives and numeric/formula additions
  to the named modifier are rejected. Stat ids retain the existing kind/id boundary.

## Enchantment-acquired equipment results

- Leathercraft boots require both Antiphon Union Training and Song of Silence,
  and give one die specifically to Stealthy tests by the equipment user.
- Training resolves as Training; the spell song is an external magic source-name
  reference, not a fake General skill identity or unresolved source typo.
- Acquisition has no crafting obstacle cost, tool inheritance or evaluator.
- EquipmentResult is distinct from crafting-tradeoff EquipmentUseEffect, valuation
  and structure resistance. References and effects serialize and validate.
- The Doom of Strength belt remains a source-backed magic summary without an
  invented numeric effect. Existing Antiphon integrations keep their meaning.

## Logistics contextual test metadata

- Logistics stores one contextual +1D bonus for a majority of troops with Hatred,
  separately from six obstacle modifiers (+1/+1/+1/+2/+2/+2).
- Common modifier shapes distinguish dice-bonus from obstacle-modifier effects;
  existing Inconspicuous obstacle values and conditions remain unchanged.
- Typed force conditions preserve majority versus presence, source-defined
  non-Dwarven classification without a threshold, and mount/trait alternatives.
- The repeated-test condition preserves the same area and the last Resources
  maintenance cycle. Terrain, season and scorched-earth conditions compose normally.
- No army, calendar, terrain, Resources-cycle, history or test evaluator is added.
- Metadata serializes; malformed leaves, compositions, effects and references fail.

## Meditation procedural metadata

- Two separate procedures store duration-based rest substitution and linked pre-test
  centering. One hour starts at Ob 1, with +1 Ob per additional hour and one hour
  rest-equivalence for wounds/Tax. Failure records falling asleep at some point,
  without timing or credited-hours assumptions.
- Centering precedes a subsequent skill test and references canonical linked-test
  semantics. Only versus/detailed conflict adds opposed resolution, with Meditation
  versus a context-resolved opponent skill and a win-conditioned +1D to the linked
  target. No unconditional bonus or invented ordinary opposed procedure.
- Vague surrounding awareness and permitted Perception/Observation detection tests
  are separate facts. Sorcerer spell sustaining and Tax retest reference external
  magic rules, independently of rest substitution.
- All descriptors serialize and validate; no formula DSL or duration, recovery,
  linked-test, awareness, Tax or conflict evaluator is added.

## Training root usage and source options (D-026)

- All seven explicit General footnotes preserve rootUsage aptitude-only, separately
  from practice/instruction learning methods. Unfootnoted Training does not inherit it.
- Mounted Combat Training and Mounted Combat: Bowman Training have distinct stable
  ids/source labels. Selection is scoped to source acquisition, ownership independent.
- Elven Outrider resolves to Bowman; Elven Lancer resolves to ordinary Training.
  The source character example can list both; no global XOR or fake Lancer identity.
- Metadata serializes and rejects invalid root usage, learning methods or option
  references. No Training learning, character ownership or combat evaluator is added.

## Munitions crafting adverse outcome

- The trigger is zero successes, distinct from ordinary failure with successes.
- Manufacturing powder OR explosives is structured scope; recipient is the maker.
- Cook-off/misfire labels are retained. Damage refers to the created item's Mark,
  with contextual/manual source resolution and no copied or invented numeric damage.
- Powder remains in scope despite no audited Mark value. Bomb item values are
  separate source facts, not adverse-outcome constants or a new equipment catalog.
- Serialization and integrity validation reject malformed trigger/scope/outcome.
  No injury, explosive, damage lookup, destruction or result evaluator is added.

## Musical Instrument canonical contextual Advantage

- Base obstacle references current listener Will. Suitable performed music/current
  mood is a structured relation, not a mood taxonomy or performer/trait condition.
- Canonical Advantage is a distinct test effect with external resolution; no fixed
  dice, invented +1D, obstacle delta or manual obstacle adjustment is stored.
- Serialization and integrity validation reject numeric additions and malformed
  suitability/Advantage metadata. Existing fixed dice and obstacle effects persist.
- Musical Instrument stays a source entry; no Wises-style family ownership is
  inferred. Additional instrument FoRK guidance uses an explicit curated category.
- No Advantage, mood, music or linked-test evaluator is added.

## Name Ritual typed skill-test outcomes

- Target Will is the obstacle basis; target is the character being named.
- Separate success/failure outcomes: success bestows a name and fixed 1D ordinary
  reputation; failure denies naming and gives infamous reputation with explicitly
  unspecified magnitude. Unspecified is not zero, 1D or missing transcription.
- Reputation outcomes are character/world-state facts, distinct from test dice,
  Advantage and obstacle changes. No audience/scope or permanent naming ban inferred.
- Serializable typed outcome metadata rejects malformed triggers, recipients,
  effects and dice shapes. No naming/reputation/Circles execution or merging added.

## Nogger crafted-consumable integration

- Consumption effects attach to the crafted consumable, not the crafting test.
- Dwarf full draught: 1D next Health test and +1 Ob Social skill tests for current
  scene; separate scopes, once-active/non-stacking despite additional drinking.
- Dwarf intoxication: consumed steins at least current Forte exponent; drunk,
  +1 Ob all tests, hours represented as base 10 minus current Health exponent.
- Non-Dwarf mouthful: drunk, +1 Ob all tests, no restorative benefit, explicitly
  unspecified duration. Do not inherit Dwarf duration or restorative package.
- Cases are independent conditions, not global XOR. Unspecified repeat/duration
  does not establish a permission or numeric default. No formula string or clamp.
- Metadata serializes and validates stock/ability ids, dose, scopes, units and
  duration shapes. No inventory, drinking, Health/Forte, scene or state evaluator.

## Oratory crowd obstacle basis

- Oratory uses current crowd Will exponent with most-common aggregation, distinct
  from a single-target basis. No average/max/min, weights, rounding or tie policy.
- Typed basis serializes and validates; malformed ability, snapshot, statistic
  and additional aggregation/tie fields are rejected.
- Command/Persuasion/Rhetoric FoRKs and the separate Duel of Wits reference persist.
- No crowd state, aggregation, NPC grouping or Duel of Wits evaluator is added.

## Orienteering journey outcomes

- Success reaches the intended destination without delay. Failure establishes lost
  for the travelling party (actor plus companions), then two alternatives:
  intended destination plus missed appointments if applicable, or unintended location.
- Alternatives have no selection policy, numeric delay, distance or location generator.
- Map use gives fixed 1D through contextual dice metadata, distinct from canonical
  unquantified Advantage; maps are not required tools.
- Typed outcomes serialize/validate, rejecting malformed recipients/alternatives
  and invented timing, selection or generation fields. No travel evaluator added.

## Reviewed P entries before Poisons

- Paean of Deeds retains Conspicuous mechanics reference, Elven restriction and
  Silent Fury FoRK. Persuasion uses target Will without invented adjustments.
- Philosophy's History FoRK remains open family guidance; Playwright preserves
  its existing known-Write opening requirement.
- Poetry preserves a separate +1 Ob when imitating another poet's style.
- Poisonous Platitudes retains Hatred root/open-ended behavior, both included
  skill capabilities, target Will, Orc restriction and external Duel of Wits fact.
- Named Wises, roots, printed types, tools and source pages match reviewed source.

## Poisons crafted-product integration

- Potency and intended delivery are independent: sickening Ob 2/+1 Ob,
  debilitating Ob 3/+2 Ob, deadly Ob 4/B10 wound.
- Ingestion is baseline with zero delivery crafting delta; blade/vapor/contact
  add 1/2/3 crafting Ob, never changing product potency or effects.
- Penalty scope is explicitly source-unspecified; no all-tests, duration,
  resistance, onset, repeated exposure or recovery rules inferred.
- Typed descriptors serialize independently and reject malformed/invented fields.
  All twelve totals are checked only in tests, not stored or evaluated in production.
- Printed Alchemical FoRK remains unresolved; no exposure, wound or poison engine.

## Polearm combat-use profiles

- One Polearm skill exposes cutting and thrusting combat-use options sharing one
  physical weapon identity; use selection does not create inventory items.
- Cutting references external Weapon Appendix Polearm Axe Strike; thrusting
  references Polearm Thrust. Stable profile ids are distinct, not SkillIds.
- Unloaded external Fight profiles remain explicit, serializable and valid;
  malformed references, duplicate options/profile ids and copied stats are rejected.
- No Pow/Add/WS/VA/WL values, inventory runtime or Fight evaluator are introduced.
- D-027 records physical item vs combat profile ownership/presentation boundaries.

## Remaining P source entries

- Potter/Prospecting preserve roots, printed types, tools and source guidance.
- Prospecting's appropriate Wises remain open family guidance, not a closed list.
- Purple Song remains Elven, magical, Workshop, with existing Antiphon created-item
  reference. Named spell-song examples stay external summary references; no invented
  wine effects, ageing engine or inheritance from Tinkersmend.
- Protector-wise keeps independent Wises ownership and canonical name.

## Reviewed R entries before Rituals of Night

- Ratiquette's Etiquette substitution stays scoped to rats/relatives. Read gives
  general read capability only; silent reading adds 1 Ob.
- Religious Diatribe targets Will; Rhetoric targets Perception. Their Duel of Wits
  facts stay separate from test bases. Open History FoRK guidance stays a family.
- Rhyme songs retain explicit mechanics references and printed Seafarer vs
  Seafaring labels; no root/tool inheritance is implied.
- Riddle of Steel retains Antiphon cross-reference without invented enchantment
  effects. Riding/Rituals of Blood keep external chapter/subsystem references.
- Rituals of Night remains incomplete pending representation of separately
  purchased/learned spells; no fake General skill identities or spell engine.
