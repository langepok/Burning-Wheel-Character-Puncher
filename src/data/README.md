# Data boundary

`catalog/` defines stock-independent content types, registration, integrity
validation, explicit alias normalization and display-label selection.
`human/` supplies the audited 19 Peasant and 41 Villager variants as content.

```ts
import { createCatalog, getLifepathDisplayLabel } from './catalog';
import { humanContent } from './human';

const catalog = createCatalog(humanContent);
const row = catalog.lifepaths.get('human.peasant.conscript')!;
getLifepathDisplayLabel(row, catalog); // Peasant Conscript
```

Additional stocks use the same `CatalogContent` interface and `createCatalog`
entry point. Packs supply unique definitions; duplicate ids are errors. This is
a typed content API with integrity checks, not an arbitrary JSON import endpoint.
Registration and selectors do not evaluate lifepath legality or mutate content.

## Identity and references

Rows retain the audited `variantId`, `familyId` and `sourceName`. Labels qualify
collisions using registered setting metadata; they never determine identity.
Family ids and semantic tags are explicit content, not name-derived heuristics.

Named prerequisite families and Lead destinations outside the loaded slice have
reference-only definitions. They establish identity for integrity checks without
inventing selectable rows or grants. A reference-only setting may omit its kind
when only its canonical destination label has been audited here. Completing a
content definition later replaces the reference in the assembled pack.

Requirements are structured data. In particular, exact named `Priest` stays a
reference-only family; it is not broadened to the semantic `priest` tag. Boolean
nodes preserve the audited Augur precedence. Selection-time and final-build
predicate kinds remain distinct without implementing either evaluator.

## Source coverage

Every row and Wife-derived payload cites the corresponding CB-006 audit and its
printed/PDF page range. Tags cite CB-013. Only partial skill-list metadata is
included: Hunter's audited weapon choice and Augur's Sorcery entry (confirmed in
CB-013). Empty `knownEntries` means no entries transcribed here, not an empty
printed skill list. Skill references have no invented costs, roots or exponents;
full skill and trait lists remain outside Issue #9.

Wife resources retain the fixed base plus a linked derived-grant rule. Skill and
resource fractions share exact `{ numerator, denominator }` integers (for example
1/2 or 1/4) and validation. Skill halving explicitly rounds down; resource metadata
adds no rounding calculation. Per the Issue #9 resolution, Country
Wife's inherited skill-point scope is `unspecified`; Village Wife's is
`ordinary-and-general`. The former must never be read as ordinary-only/false.
Later skill allocation must resolve or surface that ambiguity before applying
the grant. Each payload has its own source so later Wife rows do not inherit a
global default.

## Verification

Data tests compare all 60 rows with the checked-in audit tables, assert exact
requirement trees and curated tags, exercise malformed references, and register
an explicitly synthetic non-Human fixture without changing generic code.
No React imports or character-state changes belong in this layer.
