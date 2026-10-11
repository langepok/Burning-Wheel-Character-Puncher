import type {
  ForkTarget, OwnedSkillTopic, RootRule, SkillCatalogContent, SkillContext, SkillFamilyDefinition, SkillMetadata, ToolRequirement,
} from './types';

function index<T extends { readonly id: string }>(records: readonly T[]): ReadonlyMap<string, T> {
  const result = new Map<string, T>();
  for (const record of records) {
    if (!record.id.trim() || result.has(record.id)) throw new Error(`Duplicate or empty id: ${record.id}`);
    result.set(record.id, record);
  }
  return result;
}

function validateRoot(root: RootRule): void {
  if (root.kind === 'conditional') {
    const stocks = root.cases.flatMap(branch => branch.stockIds);
    if (!root.cases.length || root.cases.some(branch => !branch.stockIds.length) ||
        new Set(stocks).size !== stocks.length || stocks.some(id => !id.trim())) {
      throw new Error('Conditional root requires distinct, nonempty stock cases');
    }
    root.cases.forEach(branch => validateRoot(branch.root));
    validateRoot(root.otherwise);
  } else {
    const abilities = root.kind === 'single' ? [root.ability] : root.abilities;
    if (abilities.some(ability => !ability.id.trim()) ||
        (root.kind === 'combined' && (abilities.length !== 2 ||
          new Set(abilities.map(ability => `${ability.kind}:${ability.id}`)).size !== 2))) {
      throw new Error('Root requires distinct, nonempty abilities');
    }
  }
}

function validateOperands(nodes: readonly unknown[]): void {
  if (nodes.length < 2) throw new Error('Composition requires at least two operands');
}

function validateContext(context: SkillContext): void {
  if (context.kind === 'allOf' || context.kind === 'anyOf') {
    validateOperands(context.conditions);
    context.conditions.forEach(validateContext);
  } else {
    const fields = { circumstance: 'circumstanceId', subject: 'subject', activity: 'activity', culture: 'cultureId', stock: 'stockId',
      'target-trait': 'traitId', 'target-stock': 'stockId', 'target-culture': 'cultureId', 'target-origin': 'originId' } as const;
    const field = fields[context.kind];
    const value = field && (context as unknown as Record<string, unknown>)[field];
    if (typeof value !== 'string' || !value.trim()) throw new Error('Context ids must be nonempty');
    if (context.kind === 'activity' && !['potion-work', 'wound-treatment', 'hauling', 'crafting', 'pursuit', 'travel', 'field-maneuver', 'reading', 'writing'].includes(value)) {
      throw new Error('Unknown context activity');
    }
  }
}

function validateTools(tools: ToolRequirement): void {
  if (tools.kind === 'conditional') {
    validateContext(tools.when);
    validateTools(tools.then);
    validateTools(tools.otherwise);
  } else if (tools.kind === 'allOf' || tools.kind === 'anyOf') {
    validateOperands(tools.requirements);
    tools.requirements.forEach(validateTools);
  } else if (tools.kind === 'specific-item' && !tools.item.trim()) {
    throw new Error('Tool item must be nonempty');
  }
}

/** Typed content integrity boundary, not a JSON parser or a rules evaluator. */
export function createSkillCatalog(content: SkillCatalogContent) {
  const skills = index(content.skills);
  const references = index(content.references);
  const families = index(content.families);
  const choices = index(content.choices);
  const forkBehaviors = index(content.forkBehaviors);
  const integrations = index(content.integrations);
  index([...content.skills, ...content.references, ...content.families, ...content.choices]);

  const requireSkill = (id: string) => {
    if (!skills.has(id) && !references.has(id)) throw new Error(`Unknown skill reference: ${id}`);
  };
  const validateForkTarget = (target: ForkTarget): void => {
    if (target.kind === 'skill') requireSkill(target.skillId);
    if (target.kind === 'skill-family' && !families.has(target.familyId)) {
      throw new Error(`Unknown skill family: ${target.familyId}`);
    }
    if (target.kind === 'allOf' || target.kind === 'anyOf') {
      validateOperands(target.targets);
      target.targets.forEach(validateForkTarget);
    }
    // A probable target remains audit metadata, never a resolved FoRK reference.
  };
  const validateMetadata = (metadata: Partial<SkillMetadata>) => {
    if (metadata.tools) validateTools(metadata.tools);
    if (metadata.useContext) validateContext(metadata.useContext);
    for (const interaction of metadata.resourceInteractions ?? []) {
      if (interaction.context !== undefined) validateContext(interaction.context);
    }
    if (metadata.baseOpeningCostOverride) {
      const { points, source } = metadata.baseOpeningCostOverride;
      if (!Number.isSafeInteger(points) || points <= 0 || !source.length) {
        throw new Error('Opening cost override requires positive integer points and provenance');
      }
      if (metadata.training?.kind === 'training') throw new Error('Non-Training opening override cannot replace Training cost');
    }
    if (metadata.familyMembership) {
      if (!families.has(metadata.familyMembership.familyId)) throw new Error(`Unknown family: ${metadata.familyMembership.familyId}`);
      skillTopicKey(metadata.familyMembership);
    }
    if (metadata.rootRule) validateRoot(metadata.rootRule);
    for (const requirement of metadata.openingRequirements ?? []) requireSkill(requirement.skillId);
    for (const relation of metadata.relations ?? []) {
      if (relation.target.kind === 'skill') requireSkill(relation.target.id);
      if ('context' in relation && relation.context) validateContext(relation.context);
    }
    for (const { target, context } of metadata.forkSuggestions?.suggestions ?? []) {
      validateForkTarget(target);
      if (context) validateContext(context);
    }
    if (metadata.specialForkBehaviorId && !forkBehaviors.has(metadata.specialForkBehaviorId)) {
      throw new Error(`Unknown special FoRK behavior: ${metadata.specialForkBehaviorId}`);
    }
    for (const capability of metadata.capabilities ?? []) {
      if (capability.kind === 'literacy' && capability.context) validateContext(capability.context);
      if (capability.kind === 'subsystem-capability' && !integrations.has(capability.integrationId)) {
        throw new Error(`Unknown integration: ${capability.integrationId}`);
      }
    }
  };
  for (const skill of skills.values()) {
    if (!skill.source.length || !skill.sourceName.trim()) throw new Error(`Missing source: ${skill.id}`);
    validateMetadata(skill);
    for (const capability of skill.capabilities ?? []) {
      if (capability.kind === 'subsystem-capability' &&
          integrations.get(capability.integrationId)?.skillId !== skill.id) {
        throw new Error(`Integration belongs to another skill: ${capability.integrationId}`);
      }
    }
  }
  for (const family of families.values()) validateMetadata(family.defaults);
  for (const integration of integrations.values()) {
    requireSkill(integration.skillId);
    if (integration.context) validateContext(integration.context);
    if (integration.wagerSettlement !== undefined) {
      const wager = integration.wagerSettlement;
      if (integration.subsystem !== 'resources' || wager?.kind !== 'wager-settlement' ||
          wager.roles?.winner !== 'versus-test-winner' || wager.roles.loser !== 'versus-test-loser' ||
          wager.prize?.measure !== 'resources-obstacle' || wager.prize.setBefore !== 'versus-skill-test' ||
          wager.loserResourcesTest?.roller !== 'loser' || wager.loserResourcesTest.after !== 'versus-skill-test' ||
          wager.loserResourcesTest.obstacle?.kind !== 'same-as-prize-obstacle' ||
          !Array.isArray(wager.outcomes) || wager.outcomes.length !== 2 ||
          new Set(wager.outcomes.map(outcome => outcome?.when)).size !== 2) {
        throw new Error('Invalid wager settlement');
      }
      for (const outcome of wager.outcomes) {
        if (outcome?.recipient !== 'winner') throw new Error('Invalid wager settlement outcome');
        if (outcome.when === 'loser-resources-test-passed') {
          if (outcome.effect?.kind !== 'resources-advancement-credit' || outcome.effect.obstacle?.kind !== 'same-as-prize-obstacle') {
            throw new Error('Invalid wager settlement outcome');
          }
        } else if (outcome.when === 'loser-resources-taxed') {
          if (outcome.effect?.kind !== 'cash-from-taxed-dice' || outcome.effect.amount?.kind !== 'taxed-dice-count' ||
              outcome.effect.amount.role !== 'loser') throw new Error('Invalid wager settlement outcome');
        } else throw new Error('Invalid wager settlement outcome');
      }
    }
    if (integration.equipmentUseEffect !== undefined) {
      const use = integration.equipmentUseEffect;
      const acquisition = use?.acquisition;
      if (integration.subsystem !== 'equipment' || use?.target?.kind !== 'created-equipment' ||
          typeof use.target.equipmentKindId !== 'string' || !use.target.equipmentKindId.trim() ||
          use.effect?.kind !== 'advantage-dice' || !Number.isInteger(use.effect.dice) || use.effect.dice <= 0 ||
          use.effect.recipient !== 'equipment-user' || use.effect.appliesTo !== 'tests-using-equipment' ||
          acquisition?.kind !== 'crafting-obstacle-tradeoff' || acquisition.choice !== 'optional' ||
          !Number.isInteger(acquisition.obstacleDelta) || acquisition.obstacleDelta <= 0 ||
          !['single-tradeoff', 'per-increment', 'unspecified'].includes(acquisition.repeatability) ||
          acquisition.requiresSuccessfulCreation !== true) {
        throw new Error('Invalid equipment-use effect');
      }
    }
    if (integration.createdItemValueEffects !== undefined) {
      const effects = integration.createdItemValueEffects;
      if (!['equipment', 'resources'].includes(integration.subsystem) || !Array.isArray(effects) || !effects.length) {
        throw new Error('Invalid created-item value effects');
      }
      for (const effect of effects) {
        const modifier = effect?.modifier;
        if (!modifier || modifier.target !== 'created-item' ||
            !['resources-obstacle', 'resources-value-dice'].includes(modifier.measure) ||
            !Number.isInteger(modifier.delta) || modifier.delta === 0 ||
            !['automatic', 'optional-tradeoff'].includes(effect.kind)) {
          throw new Error('Invalid created-item value effect');
        }
        if (effect.kind === 'optional-tradeoff' && (modifier.measure !== 'resources-obstacle' ||
            effect.choiceTiming !== 'before-roll' || effect.cost?.kind !== 'crafting-obstacle-modifier' ||
            !Number.isInteger(effect.cost.delta) || effect.cost.delta <= 0)) {
          throw new Error('Invalid created-item value tradeoff');
        }
      }
    }
    if (integration.createdItemReference !== undefined) {
      const reference = integration.createdItemReference;
      if (integration.subsystem !== 'magic' || reference?.target !== 'created-item' ||
          !['enchanting-matrix', 'antiphon-union'].includes(reference.kind)) {
        throw new Error('Invalid magic created-item reference');
      }
      if (reference.kind === 'antiphon-union') requireSkill(reference.skillId);
    }
    if (integration.baseItemCreation !== undefined) {
      const creation = integration.baseItemCreation;
      if (integration.subsystem !== 'magic' || creation?.stage !== 'base-item-creation' ||
          creation.requiredMethod?.kind !== 'applicable-skill-song' ||
          creation.follows !== 'selected-skill-own-rules-and-tools') {
        throw new Error('Invalid magic base-item-creation reference');
      }
    }
  }

  return { skills, references, families, choices, forkBehaviors, integrations };
}

/** Stable tuple identity; punctuation in user-authored topic names cannot collide. */
export function skillTopicKey(topic: Pick<OwnedSkillTopic, 'familyId' | 'topicId'>): string {
  if (!topic.familyId.trim() || !topic.topicId.trim()) throw new Error('Family/topic ids must be nonempty');
  return JSON.stringify([topic.familyId, topic.topicId]);
}

/** Data composition only; no skill opening, exponent, or owned character state. */
export function getSkillTopicMetadata(
  family: SkillFamilyDefinition, topic: OwnedSkillTopic,
): Readonly<Partial<SkillMetadata>> {
  if (family.id !== topic.familyId) throw new Error('Topic belongs to another family');
  skillTopicKey(topic);
  return { ...family.defaults, ...topic.metadataOverrides };
}
