# UX development process — autonomous design and user-centered verification

**Status:** Accepted by the project owner, 2026-11-24.
**Scope:** Development methodology and UX decisions, not Burning Wheel RAW.

## Working agreement

For substantial new interfaces and UX iterations, give the implementing agent
(Astra) the user problems, desired outcomes, examples of successful existing
interactions, and explicit constraints. Avoid prescribing a detailed layout,
control placement or visual implementation unless a concrete requirement
makes it necessary.

The agent should inspect the actual running application when a supported
preview is available, exercise representative player journeys using authorized
disposable test characters, and examine the interface from a player's
perspective as well as a developer's. Preserve successful interactions and
identify independent opportunities for improvement. Distinguish observations
from assumptions, and targeted inspection from comprehensive usability testing.
If live inspection is unavailable, record that limitation rather than claiming
it was performed.

For substantial UX work, prefer two passes:

1. Autonomous research and design: compare alternatives, select an approach,
   write the implementation plan, observable acceptance criteria and test
   strategy, and save a durable continuation checkpoint in the repository.
   Use higher reasoning effort when useful.
2. Autonomous implementation: follow the accepted plan with a more moderate
   reasoning effort where appropriate. The agent may improve UX choices in
   response to actual implementation or preview findings, documenting material
   deviations. The plan is not a rigid mockup.

Reasoning effort is a workflow preference, not an acceptance criterion or a
guarantee of quality. Scale research and testing to the complexity of the task.

## Non-negotiable boundaries

Creative freedom applies to UX and appropriate implementation choices, not to
inventing rules. Preserve audited RAW, accepted project decisions, rules/UI
separation, authoritative engine contracts, historical data and save integrity,
regression safety, and the agreed scope. Substantial implementation begins with
acceptance criteria and tests. Record ambiguity rather than silently resolving
it. Preserve prior checkpoints and work across sessions. Independent review and
explicit owner authorization remain required before merging implementation PRs.

## M3-A3 experiment: design accepted, implementation not yet accepted

The owner accepts Astra's independently developed Resource Burner UX plan
without further design changes. The design-phase experiment is considered
successful: Astra inspected the existing Workbench in a live preview, exercised
Skills, Traits and lifepath interactions, and used those observations to choose
a purchasing-workbench design.

Accepted reference (immutable design checkpoint, commit
`1e34a10ae54986ec625617d1684ce4af61572139`, branch
`docs/m3-a3-resource-ux-plan`):

- [M3_RESOURCE_UX_PLAN.md](https://github.com/langepok/Burning-Wheel-Character-Puncher/blob/1e34a10ae54986ec625617d1684ce4af61572139/docs/M3_RESOURCE_UX_PLAN.md)
- [M3_RESOURCE_UX_CHECKPOINT.md](https://github.com/langepok/Burning-Wheel-Character-Puncher/blob/1e34a10ae54986ec625617d1684ce4af61572139/docs/M3_RESOURCE_UX_CHECKPOINT.md)

In particular, the owner accepts independent unpaid preparations, comparison
against the committed sheet, a separate owned-acquisition view, direct simple
purchases, and refund-to-preparation with authored configuration retained.
The plan's proposed save migration remains subject to its acceptance and
regression gates; this decision does not migrate or modify existing saves.

**For this experiment, withhold additional discretionary design instructions
until the first working M3-A3 preview.** Astra owns the layout and interaction
design within the agreed boundaries. The owner and independent reviewer then
test actual character-building journeys, evaluate usability, and prioritize
observed problems. Correctness, integrity and regression concerns can still
be raised before preview; the experiment is not a waiver of those requirements.

The next implementation pass must honor the plan's G0 gate: independently
verify the final M3-A2 refinements in PR #33, obtain explicit authorization
and integrate the engine, confirm the stable base/CI, reconcile contracts,
and carry the accepted UX plan/checkpoint forward without overwriting later
DECISIONS entries. This document neither approves the engine PR nor starts
M3-A3 implementation. The design-phase acceptance does not imply that the
future UI has been tested or accepted.

When integrating the M3-A3 documentation, cross-reference this process decision
from the UX checkpoint or DECISIONS.md without duplicating or renumbering
existing decisions. Preserve this working agreement for future UX stages.
