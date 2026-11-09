import type { CraftedPoison, CraftedPoisonProduct } from './types';

const only = (value: object, fields: readonly string[]) => Object.keys(value).every(key => fields.includes(key));
const positive = (value: number) => Number.isSafeInteger(value) && value > 0;
function reject(): never { throw new Error('Invalid crafted poison metadata'); }

/** Content validation only; does not add obstacles, expose targets or apply wounds. */
export function validateCraftedPoison(value: CraftedPoison): void {
  if (value?.products !== undefined) {
    if (!shape(value, ['target', 'products']) || value.target !== 'created-poison' ||
        !Array.isArray(value.products) || !value.products.length) reject();
    const variants = new Set<string>();
    for (const product of value.products) {
      validateProduct(product);
      if (variants.has(product.variant)) reject();
      variants.add(product.variant);
    }
    return;
  }
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

const shape = (value: unknown, fields: readonly string[]) => !!value && typeof value === 'object' &&
  Object.keys(value).length === fields.length && fields.every(field => Object.prototype.hasOwnProperty.call(value, field));

/** Checks source descriptors only; never tests resistance, changes Health or schedules wounds. */
function validateProduct(product: CraftedPoisonProduct): void {
  if (!product || product.kind !== 'crafted-poison' || !positive(product.craftingObstacle)) reject();
  if (product.variant === 'stinging-nettling-contact') {
    if (!shape(product, ['kind', 'variant', 'craftingObstacle', 'exposure', 'outcomes']) ||
        !shape(product.exposure, ['kind']) || product.exposure.kind !== 'skin-contact' ||
        !Array.isArray(product.outcomes) || product.outcomes.length !== 2) reject();
    const [condition, penalty] = product.outcomes;
    if (!shape(condition, ['kind', 'recipient', 'condition']) || condition.kind !== 'condition' ||
        condition.recipient !== 'victim' || condition.condition !== 'boils' ||
        !shape(penalty, ['kind', 'recipient', 'amount', 'scopes', 'duration']) || penalty.kind !== 'test-obstacle-penalty' ||
        penalty.recipient !== 'victim' || !positive(penalty.amount) || !Array.isArray(penalty.scopes) || penalty.scopes.length !== 3 ||
        penalty.scopes.some((scope, i) => scope !== ['physical-tests', 'martial-tests', 'social-tests'][i]) ||
        !shape(penalty.duration, ['kind', 'count']) || penalty.duration.kind !== 'scene' || !positive(penalty.duration.count)) reject();
  } else if (product.variant === 'debilitating-ingested') {
    if (!shape(product, ['kind', 'variant', 'craftingObstacle', 'exposure', 'resistance', 'onResistanceFailure']) ||
        !shape(product.exposure, ['kind']) || product.exposure.kind !== 'ingested' ||
        !shape(product.resistance, ['actor', 'ability', 'obstacle']) || product.resistance.actor !== 'victim' ||
        !shape(product.resistance.ability, ['kind', 'id']) || product.resistance.ability.kind !== 'stat' ||
        product.resistance.ability.id !== 'forte' || !positive(product.resistance.obstacle)) reject();
    const failure = product.onResistanceFailure;
    if (!shape(failure, ['magnitude', 'effects']) || !shape(failure.magnitude, ['kind', 'source']) ||
        failure.magnitude.kind !== 'margin-of-failure' || failure.magnitude.source !== 'resistance-test' ||
        !Array.isArray(failure.effects) || failure.effects.length !== 2) reject();
    failure.effects.forEach((effect, i) => {
      if (!shape(effect, ['kind', 'recipient', 'duration']) || effect.kind !== ['reduce-health', 'reduce-health-maximum'][i] ||
          effect.recipient !== 'victim' || effect.duration !== 'permanent') reject();
    });
  } else if (product.variant === 'deadly-weapon') {
    if (!shape(product, ['kind', 'variant', 'craftingObstacle', 'application', 'exposure', 'delayedOutcome']) ||
        !shape(product.application, ['kind', 'allowedTargets']) || product.application.kind !== 'weapon-coating' ||
        !Array.isArray(product.application.allowedTargets) || product.application.allowedTargets.length !== 2 ||
        product.application.allowedTargets[0] !== 'blade' || product.application.allowedTargets[1] !== 'arrowhead' ||
        !shape(product.exposure, ['kind', 'requiredHitResult']) || product.exposure.kind !== 'injected-by-hit' ||
        product.exposure.requiredHitResult !== 'mark') reject();
    const delayed = product.delayedOutcome;
    if (!shape(delayed, ['delay', 'outcome']) || !shape(delayed.delay, ['kind', 'unit']) ||
        delayed.delay.kind !== 'six-plus-target-forte' || delayed.delay.unit !== 'exchange' ||
        !shape(delayed.outcome, ['kind', 'recipient', 'severity', 'quantity', 'relation']) ||
        delayed.outcome.kind !== 'wound' || delayed.outcome.recipient !== 'victim' ||
        delayed.outcome.relation !== 'additional' || !positive(delayed.outcome.quantity) ||
        !shape(delayed.outcome.severity, ['shade', 'exponent']) || delayed.outcome.severity.shade !== 'black' ||
        !positive(delayed.outcome.severity.exponent)) reject();
  } else reject();
}
