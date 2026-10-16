import type { SupplyManagement } from './types';

const shape = (value: unknown, fields: readonly string[]) => !!value && typeof value === 'object' &&
  Object.keys(value).length === fields.length && fields.every(field => Object.prototype.hasOwnProperty.call(value, field));
const text = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
const positive = (value: number) => Number.isSafeInteger(value) && value > 0;
function reject(): never { throw new Error('Invalid supply-management metadata'); }

/** Integrity only: no supply selection, voyage clock, casualty or morale evaluator. */
export function validateSupplyManagement(value: SupplyManagement): void {
  if (!shape(value, ['kind', 'success', 'failure', 'obstacleGuidance']) || value.kind !== 'supply-management' ||
      !shape(value.success, ['kind']) || value.success.kind !== 'no-supply-problem' ||
      !shape(value.failure, ['shortage', 'consequences'])) reject();
  const { shortage, consequences } = value.failure;
  if (!shape(shortage, ['kind', 'supplySelection', 'examplesPolicy', 'examples']) || shortage.kind !== 'critical-supply-shortage' ||
      shortage.supplySelection !== 'contextual' || shortage.examplesPolicy !== 'non-exhaustive' ||
      !Array.isArray(shortage.examples) || !shortage.examples.every(text) ||
      !Array.isArray(consequences) || consequences.length !== 3) reject();
  // Tuple order describes source facts; it does not schedule consequence execution.
  const [complications, mortality, morale] = consequences;
  if (!shape(complications, ['kind', 'resolution']) || complications.kind !== 'serious-complications' || complications.resolution !== 'contextual' ||
      !shape(mortality, ['kind', 'onset', 'quantity', 'timing', 'cause']) || mortality.kind !== 'crew-mortality' ||
      mortality.onset !== 'begins' || mortality.quantity !== 'source-unspecified' || mortality.timing !== 'source-unspecified' ||
      mortality.cause !== 'shortage-of-critical-supply' || !shape(morale, ['kind', 'magnitude']) ||
      morale.kind !== 'morale-harm' || morale.magnitude !== 'source-unspecified') reject();
  const guidance = value.obstacleGuidance;
  if (!shape(guidance, ['vessels', 'journeyModifiers']) || !Array.isArray(guidance.vessels) || !guidance.vessels.length ||
      !Array.isArray(guidance.journeyModifiers)) reject();
  const vessels = new Set<string>();
  for (const row of guidance.vessels) {
    if (!shape(row, ['vessels', 'obstacle']) || !positive(row.obstacle) || !Array.isArray(row.vessels) || !row.vessels.length) reject();
    for (const vessel of row.vessels) {
      if (!text(vessel) || vessels.has(vessel)) reject();
      vessels.add(vessel);
    }
  }
  const journeys = new Set<string>();
  for (const row of guidance.journeyModifiers) {
    if (!shape(row, ['journey', 'obstacleDelta']) || !text(row.journey) || journeys.has(row.journey) || !positive(row.obstacleDelta)) reject();
    journeys.add(row.journey);
  }
}
