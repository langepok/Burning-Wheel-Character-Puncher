# Skill Catalog handoff

The [A–Z audit](GENERAL_SKILL_CATALOG_AZ.md) indexes all six clause journals.
The [unresolved register](SKILL_CATALOG_UNRESOLVED.md) preserves questions
without transferring them to a runtime. Page pairs are book / PDF.

| Chat finding | Disposition |
| --- | --- |
| CH-01 | D-020 preserves the agreed A–Z depth; the proposed Haggling-era reduction was superseded. Scope changes apply prospectively. |
| CH-02 | D-028 links Rune Casting, Torture and Voice of Thunder as distinct examples of stable identity and manual meaning. |
| CH-03 | D-023 and ROADMAP preserve established consequences, then state and downstream resolution; Ship Management starts crew mortality without defining count or time. |
| CH-04 | Farming 272 / 274 retains Ob 7 despite the humorous example. Stentorious Debate 301 / 303 is an accepted local interpretation, not a rule that humor is always nonmechanical. |
| CH-05 | The five-participant Skirmish Tactics reading is accepted provisionally until the Range and Cover helping audit; no value change. |
| CH-06 | The separate [UX roadmap](../UX_ROADMAP.md) distinguishes requirements, proposals and open questions. |
| CH-07 | ROADMAP keeps self-judgment, AI and hybrid open, with generated free-form Beliefs distinct from a taxonomy and deterministic rules. |
| CH-08 | ROADMAP makes Health/Injury a dependency of a finished minimum Fight trainer, without imposing a schedule. |

## Descriptor index

| Descriptor or family | Rationale | Source examples | Future owner |
| --- | --- | --- | --- |
| `testProfile`, manual adjustments, opposing abilities and follow-ups | Keep basis, conditions, dynamic values and outcomes distinct; a Training reference is not a rolling ability. | Intimidation 278–279 / 280–281; Knots 280 / 282; Falsehood 272 / 274 | Core tests / Social |
| `baseItemCreation`, `spellSongTransfer` | Creation has its own tools and obstacle; transfer has its own rules and activation. | Antiphon Union 255 / 257 | Magic / Crafting |
| `medicinalPreparations`, `poisonTreatment`, Blood Clock outcome | Do not transfer rates, costs, duration, or injury-clock semantics across treatments. | Apothecary 255 / 257; Song of Soothing 299 / 301; Surgery 303 / 305 | Injury / Poison |
| `judicialFineAssessment`, `purchaseNegotiation`, `priceReduction`, `wagerSettlement` | Fine obstacle, price, test adjustments and wager outcomes use distinct units and roles. | Amercement 254 / 256; Haggling 276 / 278; Shrewd Appraisal 296 / 298; Games of Chance 275 / 277 | Resources |
| `createdItemValueEffects`, use effects, structure resistance, crafted products, quality and shade | Keep created output distinct from the character and from its future use; preserve scope, units and eligibility. | Gem Artifice 275 / 277; Hallmaster 276 / 278; Nogger 285–286 / 287–288; War Art 307 / 309; White Metal Artifice 308 / 310 | Equipment / Crafting / Resources |
| `unarmedCombatAccess`, `armorTraining`, shield/two-weapon permissions and combat-use choice | Permission, acting ability, item and profile are different facts. | Boxing/Brawling 261 / 263; Armor Training 256 / 258; Shield 295 / 297; Two-Fisted 306 / 308; Polearm 289 / 291 | Fight / Equipment |
| `artilleryProcedure`, `opposingForceHesitation`, Command, formation and field fortifications | Separate scope and construction conditions from conflict results; cover is not position dice. | Artillerist 257 / 259; Brazen Horn 261 / 263; Command 265 / 267; Formation/Fortifications 274 / 276 | Military campaign / Range and Cover / Fight |
| `code-deciphering`, `spiritAuraObstacle`, drinking procedures | Bounded source relationships instead of a formula language; distinct alternative abilities and test aims. | Cryptography 267 / 269; Aura Reading 258 / 260; Drinking 268 / 270; Drunking 269 / 271 | Core tests / Magic / Health |
| `supply-management`, journey outcomes, item search | Preserve declared consequences and context; no state mutation, random branch selector or inventory generator. | Ship Management 295 / 297; Orienteering 286 / 288; Scavenging 294 / 296 | Supply / Journey / Inventory |
| `fatePronouncement`, declared intent, `battlefieldCommandBroadcast` | Stable references can carry a relationship without adjudicating narrative text. | Rune Casting 293 / 295; Torture 304–305 / 306–307; Voice of Thunder 307 / 309 | Narrative / Artha / Battlefield |

The catalog does not implement any of these future resolvers. D-029 is
already accepted; this index creates no new decision or task ontology.

## Independent final sample

This is a targeted comparison against the project PDF, not a second
clause-by-clause pass. The journal inventory separately checks all 424
definitions, two families and one choice against the manifest and the six
journals. It detects omissions in names and source pages, not RAW correctness
by itself. The journals group related clauses and do not claim a uniform
global clause count.

| PDF sample (book / PDF) | Check |
| --- | --- |
| Antiphon 255 / 257; Appraisal 255–256 / 257–258 | Creation floor/quality, transfer sequencing and activation; continuation retains magical-item test Ob. |
| Climbing 264 / 266 | Restored the examples attached to the printed Ob 1–5 and 7 tiers; no new Ob or tools waiver. |
| Command 265 / 267; Cryptography 267 / 269 | Compared distinct Command procedures, audibility and margin; confirmed code creation successes and two deciphering abilities. |
| Falsehood and Farming 272 / 274 | Compared dice and Ob effects to the page image, including the printed Farming Ob 7. |
| Rune Casting 293 / 295; Voice of Thunder 307 / 309 | Compared separate narrative roles, commitment, downstream rewards, target agency and same-commander audience. |
| Ship Management 295 / 297 | Confirmed death onset, not a mere possibility; no casualty quantity or timing inferred. |
| War Art and War Engineer 307 / 309; White Metal Artifice 308 / 310 | Preserved distinct quality effects and the unresolved mithril unit. Corrected the overlooked printed Dwarves-only line for War Engineer; § was already present. |
| Write 309 / 311 | Preserved the copyist and thought-transcription passages without introducing a Read opening gate. |

## Development dependency finding

Read-only npm audit reported one affected package, Vite 8.3.2, a direct
development dependency also shared by the React plugin and Vitest. npm
groups six advisories under that package, with maximum severity high. The
production-only audit reported zero findings. Vite 8.3.3 is a compatible
patched release. The vulnerable lockfile version predates this branch.
See the [Vite release](https://github.com/vitejs/vite/releases/tag/v8.3.3)
and [Windows editor advisory](https://github.com/advisories/GHSA-587h-7wmj-h5pm).
The development server is relevant on the Windows host; the static
production build does not run that server. Windows localhost safety was
not established by this audit. Treat the upgrade as a separate, reviewable
task: update Vite, rerun the dependency audit and verify development and
production checks. This pre-existing finding does not block review of the
catalog-only changes. No dependency change or automatic audit fix was made.
