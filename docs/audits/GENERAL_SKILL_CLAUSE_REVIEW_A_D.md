# General Skill List clause review — A–D

In progress. The user confirmed the 604-page BWGR PDF as the project source.
The earlier 601-page count was a text extraction cutoff. Page pairs below
are book / PDF. This review is separate from the identity manifest.

Thirteen headings, Abbey-wise through Animal Husbandry, were reviewed.
Counts treat each obstacle row and each named FoRK as a clause; tool
expendability is part of the tools clause. Bare Wise headings have no
entry-specific clauses. The completed review accounts for 113 clauses,
including 51 obstacle rows, before Antiphon. The Antiphon review below
adds one definition and 11 clauses. Descriptive paraphrases are not verbatim source text.

| Entry and pages | RAW paraphrase | Status and catalog location | Regression |
| --- | --- | --- | --- |
| Abbey-wise 253 / 255; Althing-wise and Ambition-wise 254 / 256 | Bare named topics; use shared Wises guidance (309 / 311). | Structured: separate records and family membership in `a-d-wises.ts`; no individual obstacle tables printed. | Manifest, family and catalog tests. |
| Accounting 253 / 255 | Perception; Academic; tools required. Primarily recovers taxed Resources. FoRKs Research, Reading, Administration and Estate Management. | Structured: root, type, tools, resource interaction and three concrete FoRKs in `a-d.ts`. Unresolved: printed Reading, with existing Read hint only. | Catalog integrity and Resources/source-gap regressions. |
| Accounting 253 / 255 | Simple single-income/residence tax Ob 1; personal finances 2; family income 3; small business 4; estate 5; large business 6; town 7; city 8; province 9; nation 10. | Precise guidance: `accounting.summary`; restored. | `general-a-d-clause-coverage` checks all ten pairs. |
| Acting 253 / 255 | Imitation and recitation in performance. Perception; Special; no tools. FoRKs Conspicuous and Falsehood. | Precise guidance: purpose in `acting.summary`. Structured: root, type, tools and FoRKs. | Catalog and reference integrity. |
| Acting 253 / 255 | Mummery Ob 1, morality play 2, miracle play 3, mystery play 4, classics 5. | Precise guidance: `acting.summary`; restored. | Clause coverage: all five pairs. |
| Administration 253–254 / 255–256 | Run a business or organization; primarily recover taxed Resources. Perception; Special; no tools. | Structured: root, type, tools and recovery. Precise guidance: purpose in summary. | Catalog and Resources regressions. |
| Administration 253–254 / 255–256 | Self Ob 1; shop 2; confraternity 3; small commune 4; small guild 5; small secret society 6; large secret society 7; small trading concern 8; large guild 9; giant trading concern 10. | Precise guidance: `administration.summary`; restored. Continuation has separate provenance. | Clause coverage: all ten pairs and both pages. |
| Ages of the Etharch 254 / 256 | Specialized History; Will/Perception; Academic; no tools; Elves only; printed magical marker. | Structured: `ages-of-the-etharch` family, root, type, tools, availability and roll behavior. | Manifest and catalog tests. |
| Ages of the Etharch 254 / 256 | Current age Ob 1; Third Age 2; Second Age 3; First Age 4; Years of the Sun 5; before the first Etharchs 6. | Precise guidance: `ages-of-the-etharch.summary`; restored. | Clause coverage: all six pairs. |
| Alchemy 254 / 256 | Distill a material to find its essence; mix arcane substances for specific effects. Perception; Sorcerous; expendable tools; Humans only. FoRKs Enchanting, Herbalism, Apothecary, Munitions and Poisons. | Precise guidance: both uses in `alchemy.summary`; the entry gives no recipe or effect table for mixtures. Structured: root, type, tools, availability and FoRKs. | Catalog and reference integrity. |
| Alchemy 254 / 256 | Distill earth Ob 1, water or other liquid 2, metal 3, blood 4. | Precise guidance: `alchemy.summary`; restored. | Clause coverage: all four pairs. |
| Almanac 254 / 256 | Perception; Peasant; no tools. Knows the time of year nearly to the day; can predict the season's weather accurately. | Structured: root, type, tools. Precise guidance: `almanac.summary`; the two capabilities restored without a calendar or weather resolver. | Clause coverage checks both separate capabilities. |
| Almanac 254 / 256 | General seasonal weather Ob 1; planting and harvest times 2; reasonably accurate weather prediction 3; festivals and holidays 4. | Precise guidance: `almanac.summary`; restored. | Clause coverage: all four pairs. |

| Amercement 254 / 256 | Perception; School of Thought; no tools. Fines usually replace corporal punishment. Test obstacles measure accuracy and justice under the law: low justice (fine only) Ob 2; middle justice (amputation, branding or fine) Ob 3; high justice (capital crimes) Ob 5. | Structured: root, type and tools. Precise guidance: `amercement.summary`. | `judicial-fine-assessment` checks base metadata and all three test obstacles. |
| Amercement 254 / 256 | May set the Resources obstacle of the fine; the source specifies no mapping from the skill test. | Structured: `amercement-judicial-fine-assessment` Resources integration, determination source-unspecified. | Descriptor, round-trip and rejection of invented numbers, conversion and payment. |
| Ancient Languages 254 / 256 | Know defunct languages appropriate to the setting. Perception; Academic; no tools. Uses Foreign Languages mechanics. | Precise guidance: `ancient-languages.summary`. Structured: root, type, tools and same-mechanics relation. | Manifest and catalog reference integrity. |
| Anatomy 255 / 257 | Study human body structure and function. Perception; Academic; no tools. FoRKs Surgery and Field Dressing. Dog Ob 1; superficial human anatomy 2; major organs 3; circulatory system 4; human dissection 5. | Structured: root, type, tools and FoRKs. Precise guidance: `anatomy.summary`, obstacle rows restored. | Clause coverage checks all five pairs. |
| Animal Husbandry 255 / 257 | Raise, care for and breed animals. Will; Peasant; tools required. Chickens Ob 1; pigs or goats 2; cows or horses 3; exotic animals 4. When tending wounds and illness, use Field Dressing or Apothecary obstacles. | Structured: root, type, tools and contextual obstacle-reference. Precise guidance: `animal-husbandry.summary`, obstacle rows restored. | Clause coverage checks all four pairs; `obstacle-reference` covers the distinct medical procedure. |

## Antiphon Union Training

Book 255 / PDF 257. The entry describes two stages. The
`antiphon-creation` integration represents making the base item with an
applicable skill song under that song's own rules and tools. The owning
record preserves Will, the Aptitude-only footnote, Artisan, Elves only, and no
Antiphon tools (five clauses). Existing source-gap tests cover the preceding stage and
non-propagation of its tools.

| RAW clause | Status and regression |
| --- | --- |
| Base creation obstacle is at least 5; retain the natural obstacle if higher. | Structured: `baseItemCreation.obstacle` names the natural obstacle with minimum 5; transcription regression. |
| An enchantment holds only in a structure of the highest quality; cheap or shoddy work does not hold it. | Structured: `baseItemCreation.requiredQuality`; no mapping to a named equipment quality. |
| Once the item is created, sing the spell song under its own rules; the singer gets one chance to transfer the effect. | Structured: `spellSongTransfer` stage order, rules reference and single attempt. Tested by transcription and serialization, with invalid attempts and tool inheritance rejected. |
| The spell effect is imbued in the item and active whenever it is used. | Structured: `spellSongTransfer.effect`; tests reject activation at crafting completion. |

Catalog design: creation and transfer remain separate descriptors in
the same magic integration. Neither introduces an evaluator or propagates
tools. Next heading: Apothecary (255 / 257).

## Apothecary and Appraisal

| Entry and pages | RAW paraphrase | Status and catalog location | Regression |
| --- | --- | --- | --- |
| Apothecary 255 / 257 | Perception, Medicinal, expendable tools, Herbalism FoRK. Medicines prevent or treat ailments, ease infection or illness symptoms, and ease wound penalties. Itching Ob 2; warts Ob 3. | Structured: core fields and FoRK. Precise guidance: `apothecary.summary`. | Clause test covers both obstacle entries. |
| Apothecary 255 / 257 | Medicine for +1 Ob pain is Ob 3. Local numbing is Ob 4: one fewer wound penalty die, +1 Ob to all tests, four hours. | Structured: separate recipes in `apothecary-medicines`. No duration assigned to the first recipe; no recovery engine. | Exact effects, duration and round-trip; rejects transferring duration between recipes. |
| Appraisal 255–256 / 257–258 | Perception, Special, no tools. Appropriate Wises or Academic, Artisan or Craftsman FoRKs. Can precede a Resources test for an accurate price. | Structured: core fields and FoRKs. Precise guidance: `appraisal.summary`; no Resources modifier. | Catalog integrity and clause test. |
| Appraisal 255–256 / 257–258 | Coin/metals Ob 1; gems 2; tapestries and armaments 3; antiques 4; art 5; ephemera 6. Magical items add +1 Ob to appraisal. | Precise guidance: `appraisal.summary` with continuation provenance. Structured: contextual +1 Ob modifier to the appraisal. | All seven obstacle pairs, both source pages and exact modifier. |

## Appropriate Weapons through Artificer-wise

| Entry and pages | RAW paraphrase | Status and catalog location | Regression |
| --- | --- | --- | --- |
| Appropriate Weapons 256 / 258 | Choose any and all weapons appropriate to the lifepaths, concept and setting. Individual weapon entries provide roots and obstacles. | Structured: `appropriate-weapons` choice, cardinality and considerations; individual weapon metadata remains on the selected definitions. | Choice is not a skill; all three considerations and cardinality checked. |
| Archcraft 256 / 258 | Will/Agility, Artisan, Workshop, Elves only, magical. Uses architecture and engineering; can make enchanted dwellings with Antiphon and spell songs. Examples: Song of Arbors weaves around trees; Alarm warns of intruders; Weathersong predicts weather. FoRK Woodcraft or Stonecraft. Arch Ob 1; small gate 2; large gate 3; chamber 4; domed hall 5. | Structured: core fields, capability relations, FoRKs and existing Antiphon item-reference shape. Precise guidance: examples and obstacles in summary. External procedure: spell songs, no inferred identities or whitelist. | Antiphon linkage and five obstacle pairs. |
| Architect 256 / 258 | Perception, Academic, Workshop. Draw plans for proposed or existing structures, or navigate with plans. Cottage Ob 1; longhouse 2; two-story structure 4; tower 5; complex designs 6; Outer Gods' designs 10. FoRK Engineer, Mason, Carpenter. | Structured: core fields and Mason. Precise guidance: three uses and obstacles in summary. Unresolved: Engineer and Carpenter retain probable target hints. | Six obstacle pairs and reference integrity. |
| Armor Training 256 / 258 | Power/Speed for Aptitude only; Martial Training; no tools. Without Training, light mail adds +1 Ob to tests and heavy mail or heavier +2 Ob. Training removes those penalties and mitigates armor fatigue; Clumsy Weight still applies. | Structured: core fields and `armor-training-penalties` equipment integration. | Round-trip, exact tier and mitigation checks, and rejection under a wrong subsystem. |
| Armorer 256–257 / 258–259 | Perception/Agility, Craftsman, Workshop; Blacksmith, Sewing and Tanner FoRKs. Manufacture armor and shields. Six armor tiers from padded armor to full plate; four shield obstacles from target to kite. | Structured: core fields and FoRKs. Precise guidance: all ten pairs in summary; continuation provenance retained. | Each armor/helmet grouping and each shield Ob checked. |
| Arson 257 / 259 | Perception/Agility, Special, expendable tools; Human and Roden only in character burning. Quickly set buildings alight with common household items. Ob 1–8 from thatched cottage through castle. | Structured: core fields, tools and availability. Precise guidance: all eight pairs in summary. | Eight obstacle pairs. |
| Army-wise and Artificer-wise 257 / 259 | Bare named Wise topics, no individual obstacles. | Structured: separate topics and Wises membership in `a-d-wises.ts`. | Manifest and family tests. |

Next heading: Artillerist (257 / 259). Its crew requirements, firing and
construction guidance, and campaign-dependent black-powder procedure
still need clause review.
