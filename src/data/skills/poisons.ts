import type { CraftedPoison } from './types';

const only = (value: object, fields: readonly string[]) => Object.keys(value).every(key => fields.includes(key));
const positive = (value: number) => Number.isSafeInteger(value) && value > 0;
function reject(): never { throw new Error('Invalid crafted poison metadata'); }

/** Content validation only; does not add obstacles, expose targets or apply wounds. */
export function validateCraftedPoison(value: CraftedPoison): void {
  if (!value || value.target !== 'created-poison' || !only(value, ['target', 'potencies', 'deliveries']) ||
      !Array.isArray(value.potencies) || !value.potencies.length ||
      !Array.isArray(value.deliveries) || !value.deliveries.length) reject();
  const potencyKinds = new Set<string>();
  for (const potency of value.potencies) {
    if (!potency || !['sickening', 'debilitating', 'deadly'].includes(potency.kind) ||
        potencyKinds.has(potency.kind) || !positive(potency.craftingObstacle) ||
        !only(potency, ['kind', 'craftingObstacle', 'effect'])) reject();
    potencyKinds.add(potency.kind);
    const effect = potency.effect;
    if (potency.kind === 'deadly') {
      if (effect?.kind !== 'fixed-wound' || !only(effect, ['kind', 'severity']) ||
          effect.severity?.shade !== 'black' || !positive(effect.severity.exponent) ||
          !only(effect.severity, ['shade', 'exponent'])) reject();
    } else if (effect?.kind !== 'obstacle-penalty' || !positive(effect.delta) ||
        effect.scope !== 'source-unspecified' || !only(effect, ['kind', 'delta', 'scope'])) reject();
  }
  const deliveryKinds = new Set<string>();
  for (const method of value.deliveries) {
    if (!method || !['ingestion', 'blade', 'inhaled-vapor', 'contact'].includes(method.kind) ||
        deliveryKinds.has(method.kind) || !only(method, ['kind', 'craftingObstacleDelta']) ||
        (method.kind === 'ingestion' ? method.craftingObstacleDelta !== 0 : !positive(method.craftingObstacleDelta))) reject();
    deliveryKinds.add(method.kind);
  }
}
