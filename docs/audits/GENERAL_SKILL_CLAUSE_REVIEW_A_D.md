# General Skill List clause review — A–D

In progress. The user confirmed the 604-page BWGR PDF as the project source.
The earlier 601-page count was a text extraction cutoff. Page pairs below
are book / PDF. This review is separate from the identity manifest.

The first nine headings, Abbey-wise through Ambition-wise, were reviewed.
Counts treat each obstacle row and each named FoRK as a clause; tool
expendability is part of the tools clause. Bare Wise headings have no
entry-specific clauses. The table accounts for 79 clauses, including
39 obstacle rows. Descriptive paraphrases are not verbatim source text.

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

## Paused at Amercement

Book 254 / PDF 256. Perception, School of Thought, no tools are structured
in `amercement`. The entry lets the character **set a judicial fine's Resources
obstacle**. The skill-test obstacles measure how accurate and just the
amount is under the law: low justice (fine only) Ob 2; middle justice
(amputation, branding or fine) Ob 3; high justice (capital crimes) Ob 5.
These are not the Resources obstacles of the resulting fines. The entry
does not specify a conversion from the skill-test obstacle or result to
the Resources obstacle. Fines are usually offered instead of corporal
punishment; that wording is guidance, not an eligibility restriction.

**Missing:** the category guidance and the structured fine-setting effect.
The current summary and Resources tag do not distinguish the test from
its output. Neither direct Resources recovery/cash nor price negotiation
or reduction describes this effect. Proposed minimum: a Resources
integration descriptor for setting the Resources obstacle of a judicial
fine, with source-unspecified determination of that obstacle. No payment,
pricing, or fine-setting evaluator. Tests should separate the three
printed test obstacles from the unquantified fine obstacle, verify
serialization, and reject invented conversions.

Later headings have not been signed off in this pass. In particular the
previously identified Antiphon Union stage constraints (255 / 257) remain
open. Existing RAW ambiguities and source labels retain their status.
