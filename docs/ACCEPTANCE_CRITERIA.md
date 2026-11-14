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

## Rituals of Night spell-list casting

- A separate Sorcerous skill governs casting from a typed external Rituals of Night
  spell list. Spell obstacles remain in that list; no spell definitions are inlined.
- Acquisition is explicitly separate-purchase-or-learning: owning the skill does
  not grant individual spells. No cost, learning procedure or character state added.
- Spell-list references are not General skill references and may be unloaded.
  Descriptor serializes and rejects malformed references and invented grant/cost fields.
- Rituals of Blood retains its source-shaped external magic reference without
  acquiring the explicit separate-purchase-or-learning requirement by analogy.
- No spell, magic, purchase or learning evaluator; no new durable Decision required.

## Reviewed R before Rune Casting

- Rope Chant retains Knots reuse-with-additions, repair/weaving/untangling guidance,
  Elven restriction and Traveling Gear OR Elven Rope. Antiphon combination stays
  external; no tools inheritance or invented rope use bonus.
- Round of Harvest explicitly reuses Farming mechanics. Rude Carpentry's comparison
  to Carpentry does not imply a full mechanics inheritance or broaden its Orc
  character-burning restriction.
- Rule of Law keeps researching-case and presenting-case FoRK guidance separate.
- Named Wises preserve canonical names and independent topic identities.
- Rune Casting remains incomplete pending typed fate procedure/obstacle metadata.

## Rune Casting fate metadata

- Pronouncement uses exactly two named ten-minus candidates (highest target
  Circles/reputation/affiliation total; most expensive non-common trait point cost),
  choosing the lower obstacle. No general arithmetic AST, rounding/clamp or evaluator.
- Successful test permits caster-player pronouncement and target-Belief inspection.
  One manually selected target Belief is linked manually to the suitably dire fate.
  Examples remain non-exhaustive, never a semantic classifier or Belief catalog.
- Caster's own commitment Belief is distinct from target's Belief. Manual matching
  and typed missing/changed-commitment invalidation preserve future identity/revision
  compatibility without implementing Belief state or text matching.
- Target retains player choice; fulfillment and fatal fulfillment are manual.
  Fulfillment gives the fated-character player 1 Deeds; fatal fulfillment gives
  their next character in this campaign 1 starting Deeds. No reward engine.
- Astrology special-FoRK semantics remain shared, not ordinary fixed bonus dice.
- Serializable metadata rejects malformed roles, bases, validity, rewards and
  invented procedure/semantic-evaluation fields. D-028 records the narrative boundary.

## R completion and first S records

- Independent manifest/oracle covers the complete A–R block after Rune Casting.
- Saddlery retains Perception/Agility root, Craftsman type, Workshop and Tanner
  FoRK; Saint-wise keeps separate Wises topic identity.
- Scavenging remains incomplete pending typed search-request constraints; do not
  invent item lookup, unique-item selection or loot generation.

## Scavenging item-search metadata

- Player declares an item-type request; specific items and unique things are
  explicitly disallowed. Meaning/classification stays manual; no NLP classifier.
- A suitable scavenging location is required with contextual adjudication. Midden,
  ruin and battlefield are non-exhaustive examples, never allowed-location ids.
- Structured source obstacle guidance preserves Ob 1 junk, Ob 2 household goods,
  Ob 3 hard-to-find items, Ob 4 valuables, Ob 5 rare objects, Ob 6 obscure/out-of-place
  items and all audited examples. Examples are not exhaustive item memberships.
- Typed search procedure serializes and validates without inventory lookup, item
  generation, Resources valuation, world-location evaluation or automatic loot grants.

## Reviewed S before Shield Training

- Sculpture, Scutwork-wise, Seamanship, Seduction, Servant-wise and Sewing retain
  source roots, tools, types, FoRKs and restrictions.
- Seduction uses target Will and references Duel of Wits separately; no forced
  action or sexual-intercourse requirement is inferred.
- Servant-wise preserves printed Wise type and Orc character-burning restriction.
- Sewing retains printed Weaver as unresolved source-reference with the existing
  probable Weaving audit hint, never a silently resolved FoRK.
- Shield Training remains incomplete pending combat-use/acting-ability metadata;
  its already audited Aptitude-only root semantics remain preserved in fixtures.

## Shield Training Fight integration

- Martial Training keeps Agility rootUsage aptitude-only, no exponent, and separate
  practice/instruction learning methods (D-026).
- Shield contributions are action-scoped: trained Block defense, Counterstrike
  defensive portion, and enabled Block & Strike defensive portion. Untrained
  shield use augments only Block and does not grant Block & Strike. No passive
  or always-on defense is represented.
- Shield Strike separately selects the actor's Brawling skill, manual contextual
  appropriate-Boxing skill, or Agility stat through existing AbilityReference forms.
  Shield Training is not the rolled ability; acting choices are not opponents.
- Contextual Boxing selection has no fixed/default skill id or fake Boxing family;
  Boxing and Martial Arts keep distinct identities.
- Typed metadata serializes and rejects malformed action permissions, fixed/dangling
  ability refs, Training-as-roll and invented passive/execution fields.
- No Fight action resolution, pool splitting, VA/damage/positioning rules or engine
  are added; detailed Armor and Shields rules remain external.


### Ship Management supply-management metadata (295/297)

- Preserve success without supply problems and failure with contextual critical shortage.
- Supply examples are non-exhaustive; serious complications, beginning crew mortality
  (quantity/timing unspecified), and qualitative morale harm remain separate facts.
- Preserve all seven vessel obstacles and three journey obstacle modifiers.
- Serialize and validate structured outcomes; reject invented numeric mortality,
  morale modifiers, selection procedures and downstream execution fields.
- No inventory, Resources, voyage, mortality or morale evaluator. Continue S only
  while the next source case is representable without an unapproved extension.


### Shrewd Appraisal economic effect (296/298)

- A typed Resources integration stores price reduction of the appraised item,
  based on identified flaws, with source-unspecified magnitude.
- No numeric Resources obstacle, cash/value dice, percentage, currency, minimum
  price, stacking, negotiation or pricing procedure is inferred.
- Preserve common/expensive/rare/unique goods at Ob 2/3/4/5; Perception, Social,
  no tools, Dwarves only, appropriate Wise/Haggling FoRKs and magical marker.
- Ordinary Appraisal remains distinct and does not inherit price reduction.
- Serialization and integrity validation reject malformed effects and numeric
  substitutions; no economic/Resources/flaw-generation evaluator is introduced.


### Siege Engineer crafted-output capability (296/298)

- CreatedEquipmentCapability describes a completed war-machine output that counts
  as tools for destroying structures; no operating ability or numeric effect.
- Siege Engineer's own generic Tools requirement remains independent of its output.
- Preserve five building obstacle rows: simple ram/scaling ladder 1; metal-capped
  ram 2; covered ram/siege tower 3; massive traction trebuchet 4; massive
  metal-capped covered ram 5. These are not destruction/attack/value obstacles.
- Preserve Perception, Artisan, Blacksmith/Munitions/Rude Carpentry FoRKs and
  Orcs-only restriction in character burning.
- Serialization/integrity validation reject invented numeric/damage/operating
  mechanics; existing structure-resistance integrations remain unchanged.
- No equipment, structure-destruction or combat evaluator; extend D-025 metadata only.

### Following S records (296–297/298–299)

- Signaling retains Perception, Seafaring, Cryptography and signaling lantern/flag alternatives.
- Silent Fury preserves Elves-only magical Social skill, Will, no tools, Paean of
  Deeds FoRK and explicit same-mechanics relation to Intimidation.
- Silver Trumpet preserves its Elven instrument requirement and character-burning
  restriction; Sing preserves listener Will and canonical unquantified Advantage
  when the music suits the mood, without inventing fixed dice or Meditation procedures.


### Skirmish Tactics cooperation (297/299)

- Military Training, combined Will/Perception Aptitude-only root, no tools;
  practice/instruction learning methods remain separate from root usage.
- Typed cooperation targets external Range and Cover maneuver rolls only.
- Helper and recipient each need the referenced Training and must share a team.
- maxParticipants = 5 limits the cooperating group, never five helpers plus primary.
- No contribution dice, formula, Fight/general-roll permission or evaluator.
- Serialize and validate nested metadata, Training references and subsystem boundary;
  preserve existing fixture metadata and all Training-root regressions.

### Following S through Song of Paths and Ways (297–299/299–301)

- Preserve bare Wise defaults, Sleight of Hand versus Observation, Slip of
  Currents/Navigation relation and printed Seafarer type.
- Smithcraft keeps three crafting capabilities and obstacle-guidance references,
  Workshop tools and separate external Antiphon combinations.
- Song of the Eldar has no invented magical marker; printed song skill roots,
  types, tools, restrictions and mechanics references remain source-specific.
- Song of Lordship uses the existing anyOf target-trait context. Unresolved
  Rhyme of Rules/Weathersong labels remain source references, never normalized ids.
- Enchantment examples without numeric rules remain external magic summaries,
  following the accepted Jewelcraft/Leathercraft pattern; no spell effects inferred.


### Song of Soothing treatment (299/301)

- General injury treatment separately reuses Herbalism mechanics in wound-treatment context.
- Injury integration holds exactly three source-shaped poison treatment branches.
- Injury poison references Herbalism's obstacle for the caused wound; success
  halves poison-caused die penalties, rounding up, without settling the arithmetic
  distinction between remaining penalty and amount removed.
- Obstacle penalty treatment uses current penalty as Ob and extra successes to
  reduce it, with explicit source-unspecified conversion rate.
- Direct dice subtraction uses a named double-current-dice-subtraction obstacle;
  each success over Ob restores exactly one die. This rate never leaks to Ob penalties.
- Preserve Will/Perception, Medicinal, generic tools, magical marker and Elves only.
- Serialization and reference/nested-shape validation; no formula DSL, treatment
  runtime, automatic penalty mutation, resistance, duration or recovery timeline.

### Subsequent S through Stealthy (299–301/301–303)

- Sorcery's Gifted requirement gates spell-casting only, not opening/understanding;
  preserve Human/Roden character-burning restriction and external magic reference.
- Preserve bare Wise defaults, Spear versus Throwing distinction, Spearcraft's
  unresolved printed Warcraft FoRK, Spider Husbandry's spider-scoped substitutions,
  Staff's specific tool and Starcraft's independent enchanting-matrix reference.
- Stealthy uses Speed versus Observation with canonical Advantage under contextual
  light/weather/ground conditions; no fixed dice or environmental evaluator.


### Stentorious Debate local flavor adjudication (301/303)

- Interpretation confirmed by the user: printed A big Dwarvy mouth is humorous
  flavor, preserved in summary/audit, not an enforceable Tools requirement.
- Tools is none; no anatomy/item/trait/size/manual check and no missing-tools
  penalty metadata. Do not extend ToolRequirement or add a general flavor field.
- Preserve Will, Social, magical marker, Dwarves only, target Will, Oratory FoRK
  and Duel of Wits use. The Haggling/Oratory/Persuasion comparison is descriptive
  and does not import their procedures or capabilities automatically.
- Serialization/regression coverage; no new durable Decision or engine.

### Subsequent S through Suicidal Bravery-wise (301–303/303–305)

- Stentorious Singing preserves canonical mood Advantage separately from the
  source target-group +1/+2/+3 Ob modifiers; no fixed advantage dice or invented
  spider/dragon immunity.
- Full Stone Artifice uses the already audited structure-resistance integration;
  Stonecraft has its own roots/table and no inferred resistance effect.
- Strategy's commander-versus mode is scoped; Strategy Games uses its opponent's
  same skill and actual game tools. Preserve Stuff-wise's printed Wise override
  and Dwarf character-burning scope, plus bare-Wise defaults for other topics.
- Suasion preserves target Will, priestly Persuasion specialization and Duel of
  Wits use without inventing an eligibility requirement for priest lifepaths.


### Summoning magical-use restriction (303/305; Gifted 327/329)

- Gifted is required only for summoning-magic use: call forth, bind and command
  spirits. Do not relabel this as spell-casting or restrict opening/advancement.
- Without Gifted, Summoning remains representable as an academic pursuit; no
  academic-use evaluator or invented taxonomy of academic actions.
- Human-only character-burning availability is separate; preserve Perception,
  Sorcerous, no tools and unmarked source heading.
- Codex Summoning procedure/obstacles remain external; academic FoRK references
  (including Demonology) do not automatically acquire the Gifted requirement.
- Validate/serialize use scopes and preserve existing Sorcery/Aura Reading scopes.
- No Summoning, spirit, binding, commanding or advancement engine.

### Remaining reviewed S before Surgery (303/305)

- Supplier-wise and Supply-wise preserve separate source identities, bare-Wise
  Perception/Special/no-tools defaults and separate topic ownership.
- Surgery remains identity-only until its ordinary-failure blood-clock advance
  has a source-shaped representation; never reuse zero-successes damage metadata.


### Surgery blood-clock failure metadata (303/305)

- Ordinary failed Surgery emits a typed advance-injury-clock effect on the
  treated wound's blood-clock by exactly one stage. Never wound-severity +1.
- Applicability is external-anatomy-of-injury: do not create clocks for
  non-bleeding wounds or decide Superficial/Light failure consequences.
- Preserve treatment of all wound types and the external Anatomy of Injury
  procedure/obstacles; no inferred stacking/replacement of generic failure effects.
- Preserve Perception/Agility, Medicinal, expendable tools and four source FoRKs.
- Serialization/strict shape validation; no clock/timer, bleeding, severity, death,
  recovery or automatic wound mutation evaluator.


### Survival penalty relief and remaining S records

- Survival preserves Will/Perception, Forester, Traveling Gear, Foraging/Hunting and Ob 1–5 guidance (book 303 / PDF 305).
- Its Ob 5 procedure targets an existing +1 Ob penalty on success; it grants no generic negative obstacle modifier.
- Relief scope and duration remain source-unspecified, with no Injury/Shrug It Off inheritance or permanent-removal inference.
- The procedure serializes and validates; malformed magnitudes, invented scopes/durations and extra execution fields are rejected.
- Sword and Symbology retain their independently audited source identities, roots, tools, FoRKs and external/source obstacle guidance. Continue sequentially only while the existing schema preserves RAW.
- No penalty, injury, environment or combat evaluator is introduced. Run dependency installation, typecheck, full tests, build and diff whitespace validation.

- Sequential book 304 / PDF 306 records Tactics–Throwing preserve source roots/types/tools, Tactics ambush versus Observation and external field maneuvers, bare Wise identities, and Threading Chant's Sewing relation. Torture remains identity-only until its unsupported obstacle/outcome facts can be represented.


### Torture declared intent, obstacle and outcomes

- Torture (304–305 / 306–307) requires an exact pre-test submit-or-reveal declaration; success references that same primary-test intent. No question parsing or truth detection.
- Obstacle selects the higher current target Will/Forte exponent, never average/sum/lower or a fixed modifier.
- Success grants a manually selected debilitating trait with value referencing the primary test obstacle. Maimed/Missing Eye remain non-exhaustive examples.
- Failure preserves GM choice among injury (unspecified severity), death (no threshold), and a contextual beneficial trait resisting privation/torture/interrogation (unspecified value).
- Normal Will/Perception root and Orc Hatred/open-ended exception, Special type, generic tools, Anatomy/Surgery/Interrogation FoRKs remain intact.
- New descriptors serialize and validate nested shapes/references; invented values, missing declarations, malformed abilities and extra execution semantics are rejected. No intent/injury/death/trait evaluator.
- Continue T sequentially while the schema preserves source facts; run full dependency/typecheck/test/build/diff validation.

- Following T records through Tunnel-wise preserve the audited roots, tools, guidance and bare Wise identities. Tree Pulling retains the printed collective expendable tool label without per-component consumption or goblin inventory mechanics. Two-Fisted Fighting Training remains partial/identity-only until its weapon constraints and dice-allocation permissions can be represented structurally.


### Two-Fisted Fighting Training: two-weapon-use metadata

- BWGR 306 / PDF 308: Agility, Martial Training, no tools, aptitude-only root, no exponent; practice/instruction remain separate learning methods.
- Fight integration preserves equipment eligibility separately: exactly two one-handed weapons, each at most Long, off-hand weight no greater than the other weapon. No relative-length, same-skill/profile or shield assumption.
- Off-hand penalty exemption applies only to Strike and has no invented magnitude. Simultaneous Strikes split one pool between two weapons; Block & Strike separately splits skill dice between attack and defense. Both allocations are player-chosen, without default/minimum/bonus/action-cost inference.
- Block & Strike uses the same external action identity through owning Training plus eligible pair; no Shield Training ownership or shield-specific dice/VA/damage inheritance. No acting weapon skill is selected by the descriptor. D-027 remains intact.
- Serialization and strict nested validation reject malformed eligibility, invented allocation rules, unrelated action exemptions, subsystem misuse and rolled Training references. No Fight/equipment runtime evaluator.
- Continue sequential transcription through representable entries, then stop at the next unsupported RAW case; run npm ci, typecheck, full tests, build and diff whitespace checks.

- Following entries Ugly Truth and Vein-wise retain source roots/types/tools and guidance. Vile Poisoner remains identity-only if its own delivery/exposure/resistance/duration effects cannot be expressed by the existing independent Poisons potency/delivery descriptor.


### Vile Poisoner distinct crafted products

- BWGR 306 / PDF 308: Perception/Agility, Medicinal, Herbalism FoRK, expendable tools, Orc-only, printed magical marker; no fake product skills.
- Extend CraftedPoison with a mutually exclusive product-level form while keeping ordinary Poisons independent potency/delivery records unchanged.
- Contact Ob 2: skin-contact dose, boils, +2 Ob to source-shaped physical/martial/social scopes for one scene; no invented resistance or Skill Type expansion.
- Ingested Ob 4: victim Forte vs Ob 4; failed resistance supplies one margin-of-failure reference to permanent Health and Health maximum reductions. No floor/death/recovery/restoration semantics.
- Weapon Ob 5: blade/arrowhead coating, injection by literal Mark-result hit, one additional B9 wound delayed six-plus-target-Forte exchanges. No any-hit/Mark-or-better assumption, arbitrary formula AST or timer.
- Strict nested validation and serialization reject mixed representations, malformed products/references and invented persistence/dose/stacking mechanics. No exposure, resistance, Health, wound, timer or Fight evaluator.
- Continue V sequentially until the next unrepresentable RAW fact; run dependency installation, typecheck, full tests, build and diff whitespace validation.

- Village Secret-wise, Vine-wise, Vintage-wise, Vintner and Visage-wise retain their independently audited source identities and metadata. Voice of Thunder remains partial/identity-only pending structured audience/commander narrative relationship and battlefield-distance hearing semantics.


### Voice of Thunder battlefield audibility

- BWGR 307 / PDF 309: Will/Forte, Social, no tools, Elves-only and printed magical marker. Preserve Command mechanics-reuse-with-additions without copying or globally changing Command.
- Separate battlefield-command-broadcast metadata extends Command audibility/distance: trigger is issuing a command, not successful Command test.
- All qualifying soldiers must have a trait, Instinct OR Belief about this issuing commander. Soldier role is contextual, not a setting/lifepath/ally or flavor-group whitelist.
- D-028 reference policy permits stable runtime entity identity and an about-character reference matching the issuing commander's identity; otherwise matching is manual/contextual. Catalog stores the binding contract, not character state, narrative catalogs or NLP/name matching.
- Effect is can-hear-command at any distance within battlefield context for commander/recipient, never global communication, obedience, automatic success or shield/hesitation effects.
- Descriptor serializes, validates nested shape and references, and rejects invented audience/range/outcomes. No communication, battlefield, obedience or narrative evaluator.
- Continue sequentially to the next unsupported source case; dependency installation, typecheck, full tests, build and diff whitespace validation must pass.

- Wagon-wise preserves its bare Wise topic identity. Waiting Tables preserves Will, Special, no tools, Ob 1–5 guidance and direct taxed-Resources recovery without an invented workplace condition. War Art remains identity-only pending structured equipment improvements/qualities and shade eligibility.


### War Art source-specific crafting results

- Preserve Will/Agility, Craftsman, Black-Metal Artifice, Workshop, Dwarves-only and source weapon/armor Ob guidance (307/309).
- Three independent options target the physical weapon; each same improvement is once per physical weapon (accepted interpretation), with no choose-one or stacking inference. VA +1 uses current-weapon-va-plus-one Ob; balance die uses +2 crafting Ob and external Balance Dice semantics; weapon Power +1 uses current-weapon-power Ob, not Power+1.
- War Art-specific Dwarven-made armor/shield quality costs +1 Ob and retains one rolled 1 rerolled once. Superior armor costs +3 Ob and retains all 1s rerolled every applicable roll; shields are not included in that option.
- Quality combination remains source-unspecified. Preserve an unresolved WAR ART / ARMOR QUALITY SOURCE CONFLICT marker and provenance for later Equipment audit; do not reconcile with global quality rules.
- Gray-device crafting eligibility requires the effective owning crafting skill to be gray at test time, by actual shade or temporary Epiphany; unrelated gray skills do not qualify. No global Burner opening change, Artha activation, timing or stat generation.
- Strict serialization/integrity validation covers all descriptors and rejects formula ASTs, wrong obstacle basis, inferred quality scope/combination and unrelated-skill shade conditions. No crafting/equipment/quality/shade evaluator.
- Continue W–Z sequentially until the next genuinely unsupported source case; run npm ci, typecheck, full tests, build and diff checks.

- War Engineer preserves Will/Perception, Artisan, Workshop and Ob 1–6 building guidance; Materials destruction guidance remains external. Preserve the printed Dwarves-only restriction and § marker, without adding Siege Engineer's counts-as-tool capability. Weaponsmith remains identity-only if its generic superior/poor output qualities cannot be represented without borrowing War Art-specific conflicting semantics.


### Weaponsmith generic created-equipment quality

- Preserve Perception/Agility, Craftsman, Workshop, Blacksmith and base manufacturing Ob 1–4 guidance (308/310).
- Equipment-only created-equipment-quality metadata references ordinary external superior-quality-weapon and poor-quality-weapon categories, without stats/rerolls/Balance Dice duplication.
- Superior manufacturing option adds +2 crafting Ob and references its quality on successful manufacturing. Failed Weaponsmith manufacture is linked to poor-quality output, with generic failure interaction explicitly unresolved.
- No voluntary-failure action, dice suppression, zero-success selection, reduced poor-quality obstacle or generic failure replacement/stacking/exclusivity is inferred.
- War Art source-specific conflicting qualities remain separate and unresolved. Strict nested validation and serialization cover references, triggers and forbidden execution fields; no equipment generator/evaluator.
- Continue W–Z sequentially to the next unsupported/ambiguous source case; run npm ci, typecheck, full tests, build and diff checks.

- Weaving preserves Perception/Agility, Peasant, expendable tools, Sewing and fiber guidance Ob 1–4. Weaving Way retains its own Will/Agility and Elven replacement context plus the source Antiphon/Threne of the Chameleon cloak cross-reference, without invented cloak effects or tools inheritance. Web-wise, Well-wise, Whip-Wise and Whispered Secrets-wise remain independent bare Wise topics.


### White Metal Artifice mithril unit preservation

- Preserve independent base created-item Resources obstacle +1, optional +2 crafting Ob for another obstacle +1, and enchanter-vessel capability (308/310).
- Mithril context adds +1 Ob to relevant owning-skill tests and a separate Resources value +2 whose unit is source-unspecified, with source provenance. It is neither +2 Resources obstacle nor asserted +2D.
- Existing explicit Gemcraft +1D remains resources-value-dice. Unknown-unit value is a distinct typed variant, without weakening explicit dice/obstacle cases.
- Record WHITE METAL ARTIFICE / MITHRIL audit marker: possible dice interpretation supported comparatively by Gemcraft, unresolved; do not normalize. No Resources/economic evaluator.
- Strict unit/provenance/context validation and serialization; continue W–Z to the next unsupported source case, then full npm ci/typecheck/test/build/diff checks.

- Final W entries preserve source roots/tools/availability and fixed guidance. Wine Tasting keeps four separate source quality/age modifiers. Wises family guidance retains the printed gap at Ob 6. Write grants writing, not reading, and has no Read opening requirement; the source copyist/comprehension distinction remains explicit without inventing a composition gate. Complete catalog must match the entire independent manifest, not a reviewed-prefix filter.

- Final integrity covers all 427 manifest identities, required core metadata and provenance, and remaining external identity references. Separately review each mechanical clause in all 424 definitions against the source, including continuation pages and footnotes. Record where it is preserved as structured data, precise guidance, an external procedure reference, or an explicit unresolved item. Track omissions and restore confirmed missing clauses before declaring semantic coverage complete.
- The lifepath join covers 60 partial skill lists: four known uses across grants, choice operands and nested requirements, involving three IDs (Bow, Javelin and Sorcery). It does not attest to untranscribed skill lists. Preserve stock-specific and choice references as separate classes. This is a data/test join.
- A known exponentless Training is rejected in rolling ability slots even when represented only by a source reference. Bowman stays reference-only and valid as a prerequisite; ordinary rollable skills and other source references are not rejected by this guard.
- Amercement (book 254 / PDF 256) keeps skill-test guidance Ob 2/3/5 separate from its Resources integration for setting a judicial fine's Resources obstacle. The descriptor round-trips with source-unspecified determination; validation rejects invented values, conversions and payment procedures.
- Antiphon Union (book 255 / PDF 257) preserves a skill-song creation stage with an Ob 5 floor and highest-quality requirement, then one transfer attempt governed by the spell song. The effect belongs to the item and is active when used. Neither stage changes Antiphon's own no-tools requirement.
- Apothecary (255 / 257) separates Ob 3 pain relief from Ob 4 local numbing; only the latter reduces the wound die penalty by one, increases all obstacles by one and lasts four hours. Appraisal (255–256 / 257–258) preserves both pages, the printed test obstacles and the +1 Ob for magical items, without inventing a purchase modifier.
- Armor Training (256 / 258) preserves the untrained +1/+2 Ob armor tiers, trained armor and fatigue mitigation, and retained Clumsy Weight. Archcraft references Antiphon for enchanted dwellings without restricting it to the source examples. Appropriate Weapons remains a contextual choice with all three printed considerations.
- Artillerist separates construction crew from campaign-optional black-powder applicability. Aura Reading keeps its separate perception requirement and source-shaped spirit obstacle without evaluating Strength or clamping the result.
- Beggardry preserves 1D cash independently of taxed-Resources recovery, and the typical target Will obstacle independently of the canonical, unquantified Advantage for a convincing beggar.
- Boxing and Brawling preserve distinct Fight access and the shared Lock/Push substitution. Found weapons remain melee weapons using Brawling. Brazen Horn applies only excess over opposing mean Will to hesitation for the conflict; no rounding, roll calculation or combat execution is added. Brewer preserves separate base brew and volume obstacles.
- Command preserves audibility, a non-hesitating commander, the hesitation obstacle and margin effect separately from optional Range and Cover linked maneuvers. Cryptography preserves code-creation successes as the deciphering obstacle and Research or Cryptography as alternative acting skills.
- Falsehood retains target Will, +1D for a believable, good or partly true lie and +2 Ob for a whopper or bad lie. Formation Fighting separates Steel-based Range and Cover help from Fight outnumbered relief; Fortifications keeps position dice separate from cover, including the unspecified palisade cover amount.
- Games of Chance preserves the winner taking the prize separately from the loser's Resources test outcomes. Great Wolf Husbandry distinguishes typical animal Will obstacles from Field Dressing use, and History preserves own-culture default and separate topic ownership.

### M1 pilot acceptance

- Rules mode starts with Born Peasant, Village Born or City Born. No later Born is legal.
- Village Born → Groom → Lead to Professional Soldier → Foot Soldier yields age 18.
  City Born → Runner → the same Lead → Foot Soldier yields age 19.
- Viewing settings leaves history unchanged. Only an applied Lead adds a year.
  A Lead allowed by the source into an unloaded setting is shown as unavailable content.
- Immediate requirements use the preceding history. Incomplete evidence is distinguished
  from a failed requirement. Whole-build conditions are checked against the final history.
- Free Creation applies deliberate overrides with the same rule diagnostics as Rules mode.
  Undo reverses the last history action and Reset clears all character history.
- City Dweller and Professional Soldier expose only the audited rows needed for the pilot.

### M1 targeted review regressions (PR #23)

- **Command policy / UX:** In Rules mode, changing character gender is rejected when it introduces an unmet or unresolved requirement in an already selected lifepath. The prior gender and history remain intact. Free Creation permits the same change and displays the resulting requirement diagnostic; Undo restores the prior gender.
- **Picker UX:** After the first lifepath, the ordinary Rules picker omits Born lifepaths, including when browsing another setting. Free Creation keeps loaded Born paths available as deliberate overrides with the existing rule explanation.
- **Interaction regression:** An automated UI test exercises selection, Lead, Undo, Reset, and Rules/Free switching through rendered controls, including at least one audited Soldier route and a later Born override. The existing 18/19-year route and rule diagnostics remain unchanged.

### M1 Leads explanation follow-up

- In Rules mode, after a lifepath is selected, every other catalog setting appears in the Leads list. An unavailable Lead remains disabled and displays the explanation for each issue returned by `evaluateLead`, including a missing listed Lead and unavailable destination content.
- A legal, loaded Lead remains actionable. Browsing settings or viewing unavailable Leads does not alter history or age.
- In Free Creation, the same Lead rows and rule explanations remain visible. A rule-illegal Lead to loaded content can be applied as a deliberate override; a Lead to unavailable content remains disabled by the existing command policy.
