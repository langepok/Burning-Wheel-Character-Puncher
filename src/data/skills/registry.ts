import { validateCreatedEquipmentQuality, validateWeaponImprovements, validateSourceSpecificQualities, validateCraftingShadeRequirement } from './equipment-crafting';
import { validateBattlefieldCommandBroadcast } from './battlefield-communication';
import { validateTwoWeaponUse } from './two-weapons';
import { validateDeclaredIntent, validateHighestTargetAbilities, validateDebilitatingTraitGrant, validateGmConsequence } from './intent-outcomes';
import { validatePoisonTreatment } from './poison-treatment';
import { validateCooperation } from './cooperation';
import { validateSupplyManagement } from './supply-management';
import { validateShieldUse } from './shields';
import { validateItemSearch } from './item-search';
import { validateFatePronouncement, validateRuneCastingFateObstacle } from './fate';
import { validateCraftedPoison } from './poisons';
import { validateCraftedConsumable } from './consumables';
import type {
  AbilityReference, OpposingAbilityReference, ForkTarget, OwnedSkillTopic, RootRule, SkillCatalogContent, SkillContext, SkillFamilyDefinition, SkillMetadata, ToolRequirement,
} from './types';

function index<T extends { readonly id: string }>(records: readonly T[]): ReadonlyMap<string, T> {
  const result = new Map<string, T>();
  for (const record of records) {
    if (!record.id.trim() || result.has(record.id)) throw new Error(`Duplicate or empty id: ${record.id}`);
    result.set(record.id, record);
  }
  return result;
}

function validateContextResolvedSkill(reference: Extract<OpposingAbilityReference, { kind: 'context-resolved-skill' }>): void {
  if (reference?.kind !== 'context-resolved-skill' || !['eavesdropper', 'opponent'].includes(reference.actorRole) || reference.resolution !== 'manual' ||
      Object.keys(reference).some(key => !['kind', 'actorRole', 'resolution'].includes(key))) {
    throw new Error('Invalid context-resolved opposing skill');
  }
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
  if (!Array.isArray(nodes) || nodes.length < 2) throw new Error('Composition requires at least two operands');
}

function validateContext(context: SkillContext, requireSkill: (id: string) => void): void {
  if (!context || typeof context !== 'object') throw new Error('Invalid context');
  if (context.kind === 'music-mood-suitability') {
    if (context.relation !== 'suitable' || Object.keys(context).some(key => !['kind', 'relation'].includes(key))) {
      throw new Error('Invalid music/mood suitability');
    }
    return;
  }
  if (context.kind === 'crafting-subject') {
    if (context.operation !== 'manufacturing' || Object.keys(context).some(key => !['kind', 'operation', 'anyOf'].includes(key))) {
      throw new Error('Invalid crafting subject');
    }
    validateOperands(context.anyOf);
    const categories = context.anyOf.map(subject => {
      if (typeof subject?.category !== 'string' || !subject.category.trim() || Object.keys(subject).length !== 1) throw new Error('Invalid crafting subject category');
      return subject.category;
    });
    if (new Set(categories).size !== categories.length) throw new Error('Duplicate crafting subject category');
    return;
  }
  if (context.kind === 'test-context') {
    if (!['versus-test', 'detailed-conflict'].includes(context.context)) throw new Error('Invalid test context');
    return;
  }
  const forceLeaves = {
    'force-attribute': ['kind', 'quantifier', 'attributeId'], 'force-classification': ['kind', 'classification'],
    'force-contains-mount': ['kind', 'mountKind'], 'force-contains-trait': ['kind', 'traitId'],
    terrain: ['kind', 'terrain'], season: ['kind', 'season'], 'area-condition': ['kind', 'condition'],
    'prior-test-in-context': ['kind', 'skillId', 'area', 'within'],
  } as const;
  if (context.kind in forceLeaves) {
    const fields = forceLeaves[context.kind as keyof typeof forceLeaves] as readonly string[];
    if (Object.keys(context).some(field => !fields.includes(field))) throw new Error('Invalid force/environment/history context');
    switch (context.kind) {
      case 'force-attribute':
        if (context.quantifier !== 'majority-of-troops' || typeof context.attributeId !== 'string' || !context.attributeId.trim()) throw new Error('Invalid force majority');
        break;
      case 'force-classification':
        if (context.classification !== 'non-dwarven') throw new Error('Invalid force classification');
        break;
      case 'force-contains-mount':
        if (!['war-mount', 'riding-mount', 'pack-animal'].includes(context.mountKind)) throw new Error('Invalid force mount');
        break;
      case 'force-contains-trait':
        if (typeof context.traitId !== 'string' || !context.traitId.trim()) throw new Error('Invalid force trait presence');
        break;
      case 'terrain':
        if (!['mountains', 'underground', 'heavily-wooded-countryside'].includes(context.terrain)) throw new Error('Invalid terrain');
        break;
      case 'season': if (context.season !== 'winter') throw new Error('Invalid season'); break;
      case 'area-condition': if (context.condition !== 'enemy-scorched-earth') throw new Error('Invalid area condition'); break;
      case 'prior-test-in-context':
        if (typeof context.skillId !== 'string' || !context.skillId.trim() || context.area !== 'same-countryside' ||
            context.within !== 'last-resources-maintenance-cycle') throw new Error('Invalid prior test context');
        requireSkill(context.skillId);
        break;
    }
    return;
  }
  if (context.kind === 'outside-subsystem') {
    if (!['fight', 'range-and-cover', 'duel-of-wits', 'injury', 'resources', 'magic', 'equipment',
      'mounted-combat', 'military-campaign', 'poisons', 'ambush', 'battlefield-communication'].includes(context.subsystem)) {
      throw new Error('Invalid outside-subsystem context');
    }
    return;
  }
  const typedLeaves = { 'target-belief': ['constraint', ['prevents-disclosure-of-sought-information']], attire: ['attire', ['garish', 'inappropriate']],
    'social-station-mismatch': ['position', ['above', 'below']],
    'regional-origin-mismatch': ['relativeTo', ['current-region']],
    'stock-mismatch': ['relativeTo', ['target-crowd']] } as const;
  if (context.kind === 'target-belief' || context.kind === 'attire' || context.kind === 'social-station-mismatch' ||
      context.kind === 'regional-origin-mismatch' || context.kind === 'stock-mismatch') {
    const [field, allowed] = typedLeaves[context.kind as keyof typeof typedLeaves];
    const value = (context as unknown as Record<string, unknown>)[field];
    if (typeof value !== 'string' || !(allowed as readonly string[]).includes(value)) throw new Error('Invalid typed context');
    if (context.kind === 'social-station-mismatch' && context.relativeTo !== 'appropriate-social-station') {
      throw new Error('Invalid social-station comparison');
    }
  } else if (context.kind === 'allOf' || context.kind === 'anyOf') {
    validateOperands(context.conditions);
    context.conditions.forEach(condition => validateContext(condition, requireSkill));
  } else {
    const fields = { circumstance: 'circumstanceId', subject: 'subject', activity: 'activity', culture: 'cultureId', stock: 'stockId',
      'target-trait': 'traitId', 'target-stock': 'stockId', 'target-culture': 'cultureId', 'target-origin': 'originId' } as const;
    const field = fields[context.kind as keyof typeof fields];
    const value = field && (context as unknown as Record<string, unknown>)[field];
    if (typeof value !== 'string' || !value.trim()) throw new Error('Context ids must be nonempty');
    if (context.kind === 'activity' && !['potion-work', 'wound-treatment', 'hauling', 'crafting', 'pursuit', 'travel', 'field-maneuver', 'reading', 'writing', 'tending-wounds-and-illness', 'securing-a-person'].includes(value)) {
      throw new Error('Unknown context activity');
    }
  }
}

function validateTools(tools: ToolRequirement, requireSkill: (id: string) => void): void {
  if (tools.kind === 'conditional') {
    validateContext(tools.when, requireSkill);
    validateTools(tools.then, requireSkill);
    validateTools(tools.otherwise, requireSkill);
  } else if (tools.kind === 'allOf' || tools.kind === 'anyOf') {
    validateOperands(tools.requirements);
    tools.requirements.forEach(requirement => validateTools(requirement, requireSkill));
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
  const requireRollingSkill = (id: string) => {
    requireSkill(id);
    if (skills.get(id)?.training?.kind === 'training') {
      throw new Error('Invalid acting ability: Training has no exponent');
    }
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
  const validateRollingAbility = (ability: AbilityReference): void => {
    if (!ability || !['skill', 'stat', 'attribute'].includes(ability.kind) ||
        typeof ability.id !== 'string' || !ability.id.trim()) throw new Error('Invalid ability reference');
    if (ability.kind === 'skill') requireRollingSkill(ability.id);
  };
  const validateMetadata = (metadata: Partial<SkillMetadata>) => {
    if (metadata.useRequirements !== undefined) {
      if (!Array.isArray(metadata.useRequirements)) throw new Error('Invalid use requirement list');
      for (const requirement of metadata.useRequirements) {
        if (!requirement || !['trait', 'capability'].includes(requirement.kind) ||
            typeof requirement.id !== 'string' || !requirement.id.trim() ||
            !['aura-perception', 'spell-casting', 'summoning-magic'].includes(requirement.use) ||
            Object.keys(requirement).length !== 3) throw new Error('Invalid use requirement');
      }
    }
    if (metadata.combatUseChoice !== undefined) {
      const choice = metadata.combatUseChoice;
      const only = (value: object, fields: readonly string[]) => Object.keys(value).every(key => fields.includes(key));
      const text = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
      if (!choice || choice.kind !== 'combat-use-choice' || choice.weaponIdentity !== 'shared-physical-item' ||
          choice.selection !== 'per-combat-use' || !only(choice, ['kind', 'weaponIdentity', 'selection', 'options']) ||
          !Array.isArray(choice.options) || choice.options.length < 2) throw new Error('Invalid combat-use choice');
      const optionIds = new Set<string>();
      const profileIds = new Set<string>();
      for (const option of choice.options) {
        const reference = option?.combatProfileRef;
        if (!option || !text(option.id) || optionIds.has(option.id) || !only(option, ['id', 'combatProfileRef']) ||
            !reference || reference.kind !== 'external-combat-profile' || reference.subsystem !== 'fight' ||
            reference.catalog !== 'weapon-appendix' || !text(reference.id) || !text(reference.sourceName) ||
            profileIds.has(reference.id) || !only(reference, ['kind', 'subsystem', 'catalog', 'id', 'sourceName'])) {
          throw new Error('Invalid combat-use choice');
        }
        optionIds.add(option.id);
        profileIds.add(reference.id);
        // External subsystem references are not resolved as owned General skills.
      }
    }
    if (metadata.adverseOutcomes !== undefined) {
      if (!Array.isArray(metadata.adverseOutcomes)) throw new Error('Invalid adverse outcomes');
      for (const adverse of metadata.adverseOutcomes) {
        if (!adverse || Object.keys(adverse).some(key => !['trigger', 'when', 'sourceOutcomeLabels', 'outcome'].includes(key)) ||
            adverse.trigger?.kind !== 'zero-successes' || Object.keys(adverse.trigger).length !== 1 ||
            adverse.when?.kind !== 'crafting-subject' || !Array.isArray(adverse.sourceOutcomeLabels) || !adverse.sourceOutcomeLabels.length ||
            adverse.sourceOutcomeLabels.some((label: unknown) => typeof label !== 'string' || !label.trim()) ||
            adverse.outcome?.kind !== 'damage' || adverse.outcome.recipient !== 'maker' || Object.keys(adverse.outcome).length !== 3 ||
            adverse.outcome.severity?.kind !== 'created-item-damage-reference' || adverse.outcome.severity.result !== 'mark' ||
            adverse.outcome.severity.resolution !== 'manual-contextual' || Object.keys(adverse.outcome.severity).length !== 3) {
          throw new Error('Invalid adverse outcome');
        }
        validateContext(adverse.when, requireSkill);
      }
    }

    if (metadata.procedures !== undefined) {
      if (!Array.isArray(metadata.procedures)) throw new Error('Invalid skill procedures');
      for (const procedure of metadata.procedures) {
        if (procedure?.kind === 'obstacle-penalty-relief') {
          const penalty = procedure.targetPenalty;
          if (Object.keys(procedure).length !== 7 ||
              !Number.isSafeInteger(procedure.testObstacle) || procedure.testObstacle <= 0 ||
              procedure.trigger !== 'success' || penalty?.kind !== 'obstacle-penalty' ||
              penalty.target !== 'existing-penalty' || !Number.isSafeInteger(penalty.magnitude) || penalty.magnitude <= 0 ||
              Object.keys(penalty).length !== 3 || procedure.effect !== 'shrug-off' ||
              procedure.scope !== 'source-unspecified' || procedure.duration !== 'source-unspecified') {
            throw new Error('Invalid penalty relief');
          }
        } else if (procedure?.kind === 'supply-management') {
          validateSupplyManagement(procedure);
        } else if (procedure?.kind === 'item-search') {
          validateItemSearch(procedure);
        } else if (procedure?.kind === 'duration-rest-substitution') {
          const { obstacle, effect, onFailure } = procedure;
          if (Object.keys(procedure).some(key => !['kind', 'substitutesFor', 'obstacle', 'effect', 'onFailure'].includes(key)) ||
              procedure.substitutesFor !== 'sleep-rest' || obstacle?.kind !== 'duration-based-obstacle' || obstacle.unit !== 'hour' ||
              !Number.isSafeInteger(obstacle.firstUnitObstacle) || obstacle.firstUnitObstacle <= 0 ||
              !Number.isSafeInteger(obstacle.additionalUnitObstacleDelta) || obstacle.additionalUnitObstacleDelta <= 0 ||
              Object.keys(obstacle).length !== 4 || effect?.kind !== 'rest-equivalence' || effect.durationUnit !== 'hour' ||
              !Number.isSafeInteger(effect.restPerUnit) || effect.restPerUnit <= 0 || !Array.isArray(effect.appliesTo) ||
              Object.keys(effect).length !== 4 || effect.appliesTo.length !== 2 || effect.appliesTo[0] !== 'wound-recovery' || effect.appliesTo[1] !== 'tax-recovery' ||
              onFailure?.kind !== 'falls-asleep' || onFailure.timing !== 'at-some-point' || Object.keys(onFailure).length !== 2) {
            throw new Error('Invalid rest substitution');
          }
        } else if (procedure?.kind === 'linked-pretest') {
          const special = procedure.specialResolution;
          if (Object.keys(procedure).some(key => !['kind', 'target', 'semantics', 'specialResolution'].includes(key)) ||
              procedure.target !== 'subsequent-skill-test' || procedure.semantics?.kind !== 'canonical-rule' ||
              procedure.semantics.rule !== 'linked-test' || special?.test?.kind !== 'versus' ||
              special.test.actingAbility?.kind !== 'skill' || special.onWin?.kind !== 'dice-bonus' ||
              !Number.isSafeInteger(special.onWin.dice) || special.onWin.dice <= 0 || special.onWin.appliesTo !== 'linked-target-test' || Object.keys(special.onWin).length !== 3) {
            throw new Error('Invalid linked pre-test');
          }
          validateContext(special.when, requireSkill);
          validateRollingAbility(special.test.actingAbility);
          validateContextResolvedSkill(special.test.opposingAbility);
          if (special.test.opposingAbility.actorRole !== 'opponent') throw new Error('Invalid linked opponent role');
        } else throw new Error('Invalid skill procedure');
      }
    }
    if (metadata.activityFacts !== undefined) {
      if (!Array.isArray(metadata.activityFacts)) throw new Error('Invalid activity facts');
      for (const fact of metadata.activityFacts) {
        if (fact?.kind === 'vague-surroundings-awareness') {
          if (Object.keys(fact).length !== 1) throw new Error('Invalid surrounding awareness fact');
        } else if (fact?.kind === 'permitted-test') {
          if (fact.abilities?.kind !== 'anyOf' || fact.purpose?.kind !== 'detect-skill-use') throw new Error('Invalid permitted test fact');
          validateOperands(fact.abilities.operands);
          fact.abilities.operands.forEach(validateRollingAbility);
          requireSkill(fact.purpose.skillId);
        } else throw new Error('Invalid activity fact');
      }
    }
    if (metadata.testProfile !== undefined) {
      const profile = metadata.testProfile;
      if (!profile || typeof profile !== 'object') throw new Error('Invalid skill test profile');
      if (profile.declaredIntent !== undefined) validateDeclaredIntent(profile.declaredIntent);
      if (profile.outcomes !== undefined) {
        if (!Array.isArray(profile.outcomes) || !profile.outcomes.length) throw new Error('Invalid skill test outcome');
        const triggers = new Set<string>();
        for (const outcome of profile.outcomes) {
          if (!outcome || Object.keys(outcome).some(key => !['trigger', 'effects'].includes(key)) ||
              !['success', 'failure'].includes(outcome.trigger?.kind) || Object.keys(outcome.trigger).length !== 1 ||
              triggers.has(outcome.trigger.kind) || !Array.isArray(outcome.effects) || !outcome.effects.length) {
            throw new Error('Invalid skill test outcome');
          }
          triggers.add(outcome.trigger.kind);
          for (const effect of outcome.effects) {
            if (effect?.kind === 'declared-intent-fulfilled') {
              if (outcome.trigger.kind !== 'success' || !profile.declaredIntent || effect.recipient !== 'target' ||
                  Object.keys(effect).length !== 3 || effect.intent?.kind !== 'declared-intent' ||
                  effect.intent.source !== 'primary-test' || Object.keys(effect.intent).length !== 2) {
                throw new Error('Invalid declared-intent reference');
              }
              continue;
            }
            if (effect?.kind === 'grant-trait') {
              if (outcome.trigger.kind !== 'success' || profile.kind !== 'obstacle') throw new Error('Invalid trait obstacle reference');
              validateDebilitatingTraitGrant(effect);
              continue;
            }
            if (effect?.kind === 'gm-selected-consequence') {
              if (outcome.trigger.kind !== 'failure') throw new Error('Invalid GM consequence trigger');
              validateGmConsequence(effect);
              continue;
            }
            if (effect?.kind === 'advance-injury-clock') {
              if (effect.clock !== 'blood-clock' || effect.target !== 'treated-wound' ||
                  !Number.isSafeInteger(effect.stages) || effect.stages <= 0 ||
                  effect.applicability !== 'external-anatomy-of-injury' || Object.keys(effect).length !== 5) {
                throw new Error('Invalid injury-clock outcome');
              }
              continue;
            }
            if (effect?.kind === 'journey-navigation') {
              const only = (value: object, fields: readonly string[]) => Object.keys(value).every(key => fields.includes(key));
              if ('state' in effect) {
                if (outcome.trigger.kind !== 'failure' || effect.state !== 'lost' || effect.recipient !== 'travelling-party' ||
                    !only(effect, ['kind', 'recipient', 'state', 'alternatives']) ||
                    !Array.isArray(effect.alternatives) || effect.alternatives.length !== 2 ||
                    effect.alternatives[0]?.arrival !== 'intended-destination' ||
                    effect.alternatives[0].appointments !== 'missed-if-applicable' ||
                    !only(effect.alternatives[0], ['arrival', 'appointments']) ||
                    effect.alternatives[1]?.arrival !== 'unintended-location' ||
                    !only(effect.alternatives[1], ['arrival'])) throw new Error('Invalid journey outcome');
              } else if (outcome.trigger.kind !== 'success' || effect.recipient !== 'primary-actor' ||
                  effect.result !== 'intended-destination' || effect.delay !== 'none' ||
                  !only(effect, ['kind', 'recipient', 'result', 'delay'])) throw new Error('Invalid journey outcome');
              continue;
            }
            if (!effect || !['primary-actor', 'target'].includes(effect.recipient)) throw new Error('Invalid skill test outcome recipient');
            if (effect.kind === 'name-bestowal' || effect.kind === 'name-bestowal-denied') {
              if (Object.keys(effect).some(key => !['kind', 'recipient'].includes(key))) throw new Error('Invalid skill test outcome naming effect');
            } else if (effect.kind === 'reputation') {
              if (Object.keys(effect).some(key => !['kind', 'recipient', 'reputationKind', 'dice'].includes(key)) ||
                  !['ordinary', 'infamous'].includes(effect.reputationKind) || !effect.dice ||
                  (effect.dice.kind === 'fixed' ? (!Number.isSafeInteger(effect.dice.value) || effect.dice.value <= 0 || Object.keys(effect.dice).length !== 2) :
                   effect.dice.kind === 'unspecified' ? Object.keys(effect.dice).length !== 1 : true)) {
                throw new Error('Invalid skill test outcome reputation');
              }
            } else throw new Error('Invalid skill test outcome effect');
          }
        }
      }

      if (profile?.kind === 'versus') {
        if ('base' in profile || 'adjustments' in profile) {
          throw new Error('Invalid skill test profile');
        }
        const opponents = profile.opposingAbilities;
        if (!Array.isArray(opponents)) {
          const alternatives = opponents as Exclude<typeof opponents, readonly unknown[]>;
          if (alternatives?.kind !== 'anyOf') throw new Error('Invalid opposing alternatives');
          validateOperands(alternatives.operands);
          const ids = new Set<string>();
          for (const branch of alternatives.operands) {
            const ability = branch?.ability;
            if (!ability || !['skill', 'stat', 'attribute'].includes(ability.kind)) throw new Error('Invalid opposing ability');
            const id = ability.kind === 'skill' ? ability.skillId : ability.id;
            if (typeof id !== 'string' || !id.trim() || ids.has(`${ability.kind}:${id}`)) throw new Error('Invalid opposing ability');
            ids.add(`${ability.kind}:${id}`);
            if (ability.kind === 'skill') requireRollingSkill(id);
            if (branch.modifiers !== undefined) {
              if (!Array.isArray(branch.modifiers)) throw new Error('Invalid opposing modifiers');
              for (const modifier of branch.modifiers) {
                if (modifier?.kind !== 'double-obstacle-penalty' || Object.keys(modifier).length !== 1) {
                  throw new Error('Invalid canonical obstacle penalty');
                }
              }
            }
          }
        } else {
          if (!opponents.length) throw new Error('Invalid skill test profile');
          for (const ability of opponents) {
            if (ability?.kind === 'context-resolved-skill') {
              validateContextResolvedSkill(ability);
              continue;
            }
            if (ability?.kind !== 'skill' || typeof ability.skillId !== 'string' || !ability.skillId.trim()) {
              throw new Error('Invalid opposing skill reference');
            }
            requireRollingSkill(ability.skillId);
          }
        }
      } else if (profile?.kind === 'obstacle') {
        if ('opposingAbilities' in profile) throw new Error('Invalid skill test profile');
        const base = profile.base;
        if (base?.kind === 'rune-casting-fate-obstacle') {
          validateRuneCastingFateObstacle(base);
        } else if (base?.kind === 'highest-of-target-abilities') {
          validateHighestTargetAbilities(base);
        } else {
          if (!base || base.snapshot !== 'current' || !base.ability ||
              !['stat', 'attribute'].includes(base.ability.kind) ||
              typeof base.ability.id !== 'string' || !base.ability.id.trim()) {
            throw new Error('Invalid obstacle basis');
          }
          if (base.kind === 'crowd-ability-exponent') {
            if (base.statistic !== 'most-common' ||
                Object.keys(base).some(key => !['kind', 'ability', 'statistic', 'snapshot'].includes(key)) ||
                Object.keys(base.ability).some(key => !['kind', 'id'].includes(key))) {
              throw new Error('Invalid obstacle basis');
            }
          } else if (base.kind !== 'target-ability-exponent' ||
              (base.targetRole !== undefined && base.targetRole !== 'listener')) {
            throw new Error('Invalid obstacle basis');
          }
        }
        if (profile.adjustments !== undefined) {
          if (!Array.isArray(profile.adjustments)) throw new Error('Invalid manual test adjustments');
          for (const adjustment of profile.adjustments) {
            if (adjustment?.kind !== 'manual' || adjustment.quantity !== 'unquantified' || 'delta' in adjustment ||
                !['target-traits', 'situational-disadvantage'].includes(adjustment.source)) {
              throw new Error('Invalid manual test adjustment');
            }
            if (adjustment.examples !== undefined) {
              if (adjustment.source !== 'situational-disadvantage' || !Array.isArray(adjustment.examples) || !adjustment.examples.length) {
                throw new Error('Invalid manual adjustment examples');
              }
              adjustment.examples.forEach((example: SkillContext) => validateContext(example, requireSkill));
            }
          }
        }
      } else if (profile?.kind === 'contextual') {
        if ('base' in profile || 'adjustments' in profile || 'opposingAbilities' in profile) throw new Error('Invalid contextual test profile');
      } else throw new Error('Invalid skill test profile');
      if (profile.context !== undefined) validateContext(profile.context, requireSkill);
      if (profile.followUps !== undefined) {
        if (!Array.isArray(profile.followUps)) throw new Error('Invalid skill test follow-ups');
        for (const followUp of profile.followUps) {
          if (followUp?.trigger?.kind !== 'test-success' || followUp.trigger.source !== 'primary-test' ||
              !followUp.test || !['primary-actor', 'target'].includes(followUp.test.actor) ||
              !Array.isArray(followUp.modifiers) || !followUp.modifiers.length) {
            throw new Error('Invalid skill test follow-up');
          }
          validateContext(followUp.context, requireSkill);
          const ability = followUp.test.ability;
          if (!ability || !['skill', 'stat', 'attribute'].includes(ability.kind) ||
              typeof ability.id !== 'string' || !ability.id.trim()) throw new Error('Invalid follow-up ability');
          if (ability.kind === 'skill') requireRollingSkill(ability.id);
          for (const modifier of followUp.modifiers) {
            if (modifier?.kind !== 'dynamic-value' || modifier.target !== 'hesitation-obstacle' ||
                modifier.operation !== 'add' || 'delta' in modifier || modifier.value?.kind !== 'extra-successes' ||
                modifier.value.source !== 'primary-test') throw new Error('Invalid dynamic test modifier');
          }
        }
      }
      if (profile.modifiers !== undefined) {
        if (!Array.isArray(profile.modifiers)) throw new Error('Invalid skill test modifiers');
        for (const modifier of profile.modifiers) {
          const effect = modifier?.effect;
          if (!modifier?.when || !effect ||
              (effect.kind === 'obstacle-modifier' ? (!Number.isSafeInteger(effect.delta) || effect.delta === 0 || Object.keys(effect).length !== 2) :
               effect.kind === 'dice-bonus' ? (!Number.isSafeInteger(effect.dice) || effect.dice <= 0 || Object.keys(effect).length !== 2) :
               effect.kind === 'advantage' ? (effect.resolution !== 'canonical' || Object.keys(effect).some(key => !['kind', 'resolution'].includes(key))) : true)) {
            throw new Error('Invalid skill test modifier');
          }
          validateContext(modifier.when, requireSkill);
        }
      }
    }
    if (metadata.training?.kind === 'training') {
      const training = metadata.training;
      if (Object.keys(training).some(key => !['kind', 'rootUsage', 'learningMethods', 'exponent', 'advancement', 'openingCost'].includes(key)) ||
          (training.rootUsage !== undefined && training.rootUsage !== 'aptitude-only') ||
          !Array.isArray(training.learningMethods) || !training.learningMethods.length ||
          new Set(training.learningMethods).size !== training.learningMethods.length ||
          training.learningMethods.some(method => !['practice', 'instruction'].includes(method)) ||
          training.exponent !== 'none' || training.advancement !== 'none' || training.openingCost !== 2) {
        throw new Error('Invalid Training metadata');
      }
    }
    if (metadata.trainingSourceChoice) {
      const choice = metadata.trainingSourceChoice;
      if (metadata.training?.kind !== 'training' || choice.kind !== 'training-source-options' ||
          choice.selectionScope !== 'source-acquisition' || choice.ownership !== 'independent' ||
          choice.appropriateness !== 'character-and-setting' ||
          Object.keys(choice).some(key => !['kind', 'selectionScope', 'ownership', 'appropriateness', 'options'].includes(key))) {
        throw new Error('Invalid Training source choice');
      }
      validateOperands(choice.options);
      if (new Set(choice.options.map(option => option.id)).size !== choice.options.length) throw new Error('Duplicate Training option');
      for (const option of choice.options) {
        requireSkill(option.id);
        if (typeof option.archetype !== 'string' || !option.archetype.trim() || !Array.isArray(option.source) || !option.source.length ||
            !Array.isArray(option.sourceMappings) || Object.keys(option).some(key => !['id', 'sourceLabel', 'archetype', 'source', 'sourceMappings'].includes(key)) ||
            option.sourceLabel !== (skills.get(option.id) ?? references.get(option.id))?.sourceName) throw new Error('Invalid Training option identity');
        for (const mapping of option.sourceMappings) {
          if (mapping.kind !== 'lifepath' || !mapping.stockId?.trim() || !mapping.sourceName?.trim() || !mapping.source.length) {
            throw new Error('Invalid Training source mapping');
          }
        }
      }
    }
    if (metadata.tools) validateTools(metadata.tools, requireSkill);
    if (metadata.useContext) validateContext(metadata.useContext, requireSkill);
    for (const interaction of metadata.resourceInteractions ?? []) {
      if (interaction.context !== undefined) validateContext(interaction.context, requireSkill);
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
      if (relation.kind === 'obstacle-reference') {
        const target = relation.targets;
        if (!target || !['skill', 'anyOf'].includes(target.kind)) throw new Error('Invalid obstacle-reference target');
        if (target.kind === 'anyOf') validateOperands(target.targets);
        const sources = target.kind === 'anyOf' ? target.targets : [target];
        for (const source of sources) {
          if (source?.kind !== 'skill' || typeof source.skillId !== 'string' || !source.skillId.trim()) {
            throw new Error('Invalid obstacle-reference target');
          }
          requireSkill(source.skillId);
        }
        if (new Set(sources.map(source => source.skillId)).size !== sources.length) {
          throw new Error('Obstacle-reference alternatives must be distinct');
        }
        validateContext(relation.context, requireSkill);
      } else {
        if (relation.target.kind === 'skill') requireSkill(relation.target.id);
        if ('context' in relation && relation.context) validateContext(relation.context, requireSkill);
      }
    }
    for (const { target, context } of metadata.forkSuggestions?.suggestions ?? []) {
      validateForkTarget(target);
      if (context) validateContext(context, requireSkill);
    }
    if (metadata.specialForkBehaviorId && !forkBehaviors.has(metadata.specialForkBehaviorId)) {
      throw new Error(`Unknown special FoRK behavior: ${metadata.specialForkBehaviorId}`);
    }
    for (const capability of metadata.capabilities ?? []) {
      if (capability.kind === 'literacy' && capability.context) validateContext(capability.context, requireSkill);
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
    if (integration.createdEquipmentQuality !== undefined) {
      if (integration.subsystem !== 'equipment') throw new Error('Invalid created-equipment-quality subsystem');
      validateCreatedEquipmentQuality(integration.createdEquipmentQuality);
    }
    if (integration.weaponImprovements !== undefined) {
      if (integration.subsystem !== 'equipment') throw new Error('Invalid weapon improvement subsystem');
      validateWeaponImprovements(integration.weaponImprovements);
    }
    if (integration.sourceSpecificQualities !== undefined) {
      if (integration.subsystem !== 'equipment') throw new Error('Invalid source-specific quality subsystem');
      validateSourceSpecificQualities(integration.sourceSpecificQualities, integration.skillId);
    }
    if (integration.craftingShadeRequirement !== undefined) {
      if (integration.subsystem !== 'equipment') throw new Error('Invalid crafting shade subsystem');
      validateCraftingShadeRequirement(integration.craftingShadeRequirement);
    }
    if (integration.poisonTreatment !== undefined) {
      if (integration.subsystem !== 'injury') throw new Error('Invalid poison treatment subsystem');
      validatePoisonTreatment(integration.poisonTreatment, requireSkill);
    }
    if (integration.medicinalPreparations !== undefined) {
      const recipes = integration.medicinalPreparations;
      const pain = recipes?.painRelief;
      const numbing = recipes?.localNumbing;
      const positive = (value: number) => Number.isSafeInteger(value) && value > 0;
      if (integration.subsystem !== 'injury' || !pain || !numbing ||
          !positive(pain.testObstacle) || pain.effect?.kind !== 'relieve-pain-obstacle-penalty' ||
          !positive(pain.effect.magnitude) || Object.keys(pain.effect).length !== 2 || Object.keys(pain).length !== 2 ||
          !positive(numbing.testObstacle) || numbing.effect?.kind !== 'reduce-wound-die-penalty' ||
          !positive(numbing.effect.dice) || Object.keys(numbing.effect).length !== 2 ||
          numbing.sideEffect?.kind !== 'obstacle-penalty' || numbing.sideEffect.scope !== 'all-tests' ||
          !positive(numbing.sideEffect.delta) || Object.keys(numbing.sideEffect).length !== 3 ||
          numbing.duration?.unit !== 'hours' || !positive(numbing.duration.amount) ||
          Object.keys(numbing.duration).length !== 2 || Object.keys(numbing).length !== 4 ||
          Object.keys(recipes).length !== 2) {
        throw new Error('Invalid medicinal preparations');
      }
    }
    if (integration.cooperation !== undefined) {
      if (integration.subsystem !== 'range-and-cover') throw new Error('Invalid cooperation subsystem');
      validateCooperation(integration.cooperation, id => {
        requireSkill(id);
        if (skills.get(id)?.training?.kind !== 'training') throw new Error('Invalid cooperation Training reference');
      });
    }
    if (integration.battlefieldCommandBroadcast !== undefined) {
      if (integration.subsystem !== 'battlefield-communication') throw new Error('Invalid battlefield-command-broadcast subsystem');
      validateBattlefieldCommandBroadcast(integration.battlefieldCommandBroadcast, requireSkill);
    }
    if (integration.twoWeaponUse !== undefined) {
      if (integration.subsystem !== 'fight' || skills.get(integration.skillId)?.training?.kind !== 'training') {
        throw new Error('Invalid two-weapon-use subsystem or Training owner');
      }
      validateTwoWeaponUse(integration.twoWeaponUse);
    }
    if (integration.shieldUse !== undefined) {
      if (integration.subsystem !== 'fight') throw new Error('Invalid shield-use subsystem');
      validateShieldUse(integration.shieldUse, validateRollingAbility);
    }
    if (integration.fatePronouncement !== undefined) {
      if (integration.subsystem !== 'magic') throw new Error('Invalid fate pronouncement subsystem');
      validateFatePronouncement(integration.fatePronouncement);
    }
    if (integration.spellListCasting !== undefined) {
      const casting = integration.spellListCasting;
      const only = (value: object, fields: readonly string[]) => Object.keys(value).every(key => fields.includes(key));
      const text = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
      if (integration.subsystem !== 'magic' || !casting || casting.kind !== 'spell-list-casting' ||
          !only(casting, ['kind', 'spellListRef', 'obstacleSource', 'acquisition']) ||
          casting.spellListRef?.kind !== 'external-spell-list' || casting.spellListRef.subsystem !== 'magic' ||
          !text(casting.spellListRef.id) || !text(casting.spellListRef.sourceName) ||
          !only(casting.spellListRef, ['kind', 'subsystem', 'id', 'sourceName']) ||
          casting.obstacleSource !== 'referenced-spell-list' || casting.acquisition?.kind !== 'separate-purchase-or-learning' ||
          !only(casting.acquisition, ['kind'])) throw new Error('Invalid spell-list casting metadata');
      // External spell-list ids are not General skill ids or acquired spell records.
    }
    if (integration.craftedPoison !== undefined) {
      if (integration.subsystem !== 'equipment') throw new Error('Invalid crafted poison subsystem');
      validateCraftedPoison(integration.craftedPoison);
    }
    if (integration.craftedConsumableEffect !== undefined) {
      if (integration.subsystem !== 'equipment') throw new Error('Invalid crafted consumable subsystem');
      validateCraftedConsumable(integration.craftedConsumableEffect);
    }

    requireSkill(integration.skillId);
    if (integration.context) validateContext(integration.context, requireSkill);
    if (integration.sustainedSpellReference !== undefined) {
      const reference = integration.sustainedSpellReference;
      if (integration.subsystem !== 'magic' || reference?.actorRole !== 'sorcerer' || reference.while !== 'using-owning-skill' ||
          reference.permission !== 'maintain-sustained-spells' || reference.requiredRetest?.kind !== 'tax' ||
          reference.requiredRetest.rules?.kind !== 'external-subsystem-rule' || reference.requiredRetest.rules.subsystem !== 'magic' ||
          typeof reference.requiredRetest.rules.sourceName !== 'string' || !reference.requiredRetest.rules.sourceName.trim()) {
        throw new Error('Invalid sustained-spell reference');
      }
    }
    if (integration.structureResistance !== undefined) {
      const resistance = integration.structureResistance;
      const acquisition = resistance?.acquisition;
      const effect = resistance?.effect;
      if (integration.subsystem !== 'equipment' || resistance?.kind !== 'structure-resistance' || resistance.target !== 'created-structure' ||
          acquisition?.kind !== 'crafting-obstacle-tradeoff' || acquisition.choice !== 'optional' ||
          !Number.isInteger(acquisition.obstacleDelta) || acquisition.obstacleDelta <= 0 ||
          !['single-tradeoff', 'per-increment', 'unspecified'].includes(acquisition.repeatability) ||
          effect?.kind !== 'obstacle-modifier' || !Number.isInteger(effect.delta) || effect.delta <= 0 ||
          effect.target !== 'tests-against-created-structure' || !Array.isArray(effect.appliesTo) ||
          effect.appliesTo.length !== 2 || !effect.appliesTo.includes('alter') || !effect.appliesTo.includes('destroy')) {
        throw new Error('Invalid structure resistance');
      }
    }
    if (integration.artilleryProcedure !== undefined) {
      const procedure = integration.artilleryProcedure;
      const crew = procedure?.constructionCrew;
      const alternative = procedure?.blackPowderAlternative;
      const matches = (actual: unknown, expected: readonly string[]) => Array.isArray(actual) &&
        actual.length === expected.length && expected.every((item, index) => actual[index] === item);
      if (integration.subsystem !== 'military-campaign' || crew?.laborers !== 'teams' ||
          !Number.isSafeInteger(crew.minimumCarpenters) || crew.minimumCarpenters <= 0 ||
          alternative?.when !== 'campaign-uses-black-powder-weapons' ||
          !matches(alternative.covers, ['cannons', 'bombards', 'shot']) ||
          !matches(alternative.activities, ['manufacture', 'operation']) ||
          Object.keys(crew).length !== 2 || Object.keys(alternative).length !== 4 || Object.keys(procedure).length !== 2) {
        throw new Error('Invalid artillery procedure');
      }
      requireSkill(alternative.bombsAndPowderSkillId);
    }
    if (integration.spiritAuraObstacle !== undefined) {
      const obstacle = integration.spiritAuraObstacle;
      if (integration.subsystem !== 'magic' || obstacle?.kind !== 'detect-spirit-presence-and-nature' ||
          !Number.isSafeInteger(obstacle.base) || obstacle.base <= 0 ||
          obstacle.subtract !== 'spirit-strength' || Object.keys(obstacle).length !== 3) {
        throw new Error('Invalid spirit aura obstacle');
      }
    }
    if (integration.armorTraining !== undefined) {
      const profile = integration.armorTraining;
      const untrained = profile?.untrained;
      const trained = profile?.trained;
      if (integration.subsystem !== 'equipment' || skills.get(integration.skillId)?.training?.kind !== 'training' ||
          untrained?.appliesTo !== 'all-tests' || !Number.isSafeInteger(untrained.lightMail) || untrained.lightMail <= 0 ||
          !Number.isSafeInteger(untrained.heavyMailOrHeavier) || untrained.heavyMailOrHeavier <= 0 ||
          trained?.armorObstaclePenalties !== 'removed' || trained.armorFatiguePenalties !== 'mitigated' ||
          trained.clumsyWeight !== 'still-applies' || Object.keys(untrained).length !== 3 ||
          Object.keys(trained).length !== 3 || Object.keys(profile).length !== 2) {
        throw new Error('Invalid armor Training penalties');
      }
    }
    if (integration.createdEquipmentCapability !== undefined) {
      const result = integration.createdEquipmentCapability;
      if (integration.subsystem !== 'equipment' || !result || result.kind !== 'created-equipment-capability' ||
          Object.keys(result).length !== 3 || result.output?.kind !== 'created-equipment' ||
          typeof result.output.equipmentKindId !== 'string' || !result.output.equipmentKindId.trim() ||
          Object.keys(result.output).length !== 2 || result.capability?.kind !== 'counts-as-tool' ||
          result.capability.purpose !== 'destroying-structures' || Object.keys(result.capability).length !== 2) {
        throw new Error('Invalid created-equipment capability');
      }
    }
    if (integration.judicialFineAssessment !== undefined) {
      const assessment = integration.judicialFineAssessment;
      if (integration.subsystem !== 'resources' || !assessment || assessment.kind !== 'judicial-fine-assessment' ||
          assessment.output?.kind !== 'resources-obstacle' || assessment.output.purpose !== 'judicial-fine' ||
          assessment.determination !== 'source-unspecified' ||
          Object.keys(assessment).length !== 3 || Object.keys(assessment.output).length !== 2) {
        throw new Error('Invalid judicial fine assessment');
      }
    }
    if (integration.priceReduction !== undefined) {
      const effect = integration.priceReduction;
      if (integration.subsystem !== 'resources' || !effect || effect.kind !== 'appraised-item-price-reduction' ||
          effect.target !== 'appraised-item' || effect.basis?.kind !== 'identified-flaws' ||
          Object.keys(effect.basis).length !== 1 || effect.magnitude !== 'source-unspecified' ||
          Object.keys(effect).length !== 4) {
        throw new Error('Invalid appraised-item price reduction');
      }
    }
    if (integration.purchaseNegotiation !== undefined) {
      const purchase = integration.purchaseNegotiation;
      const adjustment = purchase?.buyerObstacleAdjustment;
      if (integration.subsystem !== 'resources' || purchase?.kind !== 'purchase-negotiation' ||
          !Array.isArray(purchase.roles) || purchase.roles.length !== 2 || purchase.roles[0] !== 'buyer' || purchase.roles[1] !== 'seller' ||
          purchase.test?.kind !== 'versus' || purchase.subject !== 'price-purchase-terms-and-contracts' ||
          adjustment?.kind !== 'obstacle-modifier' || adjustment.target !== 'relevant-negotiation-obstacle' ||
          adjustment.choice !== 'optional' || !Number.isInteger(adjustment.delta) || adjustment.delta === 0) {
        throw new Error('Invalid purchase negotiation');
      }
    }
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
    if (integration.equipmentResult !== undefined) {
      const result = integration.equipmentResult;
      const acquisition = result?.acquisition;
      if (integration.subsystem !== 'equipment' || result?.target?.kind !== 'created-equipment' ||
          typeof result.target.equipmentKindId !== 'string' || !result.target.equipmentKindId.trim() ||
          acquisition?.kind !== 'enchantment-combination' || acquisition.requires?.kind !== 'allOf' ||
          Object.keys(acquisition).some(key => !['kind', 'requires'].includes(key)) ||
          result.effect?.kind !== 'skill-test-dice-bonus' || result.effect.recipient !== 'equipment-user' ||
          !Number.isInteger(result.effect.dice) || result.effect.dice <= 0) throw new Error('Invalid equipment result');
      requireSkill(result.effect.skillId);
      validateOperands(acquisition.requires.operands);
      const componentIds = new Set<string>();
      for (const component of acquisition.requires.operands) {
        let key: string;
        if (component?.kind === 'training') {
          requireSkill(component.skillId);
          if (skills.get(component.skillId)?.training?.kind !== 'training' ||
              Object.keys(component).some(field => !['kind', 'skillId'].includes(field))) throw new Error('Invalid enchantment Training reference');
          key = `training:${component.skillId}`;
        } else if (component?.kind === 'spell-song' && component.subsystem === 'magic' &&
            typeof component.sourceName === 'string' && component.sourceName.trim() &&
            Object.keys(component).every(field => ['kind', 'subsystem', 'sourceName'].includes(field))) {
          key = `spell-song:${component.sourceName}`;
        } else throw new Error('Invalid enchantment component');
        if (componentIds.has(key)) throw new Error('Duplicate enchantment component');
        componentIds.add(key);
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
            !['resources-obstacle', 'resources-value-dice', 'resources-value'].includes(modifier.measure) ||
            !Number.isSafeInteger(modifier.delta) || modifier.delta === 0 ||
            !['automatic', 'optional-tradeoff'].includes(effect.kind)) {
          throw new Error('Invalid created-item value effect');
        }
        if (modifier.measure === 'resources-value') {
          if (modifier.unit !== 'source-unspecified' || Object.keys(modifier).length !== 5 ||
              !Array.isArray(modifier.source) || !modifier.source.length) throw new Error('Invalid created-item value unit/provenance');
          for (const source of modifier.source) {
            if (!source || (source.kind === 'audit-packet' ?
                (typeof source.url !== 'string' || !source.url.trim() || typeof source.section !== 'string' || !source.section.trim()) :
                source.kind === 'task-brief' ?
                (typeof source.document !== 'string' || !source.document.trim() || typeof source.section !== 'string' || !source.section.trim()) : true)) {
              throw new Error('Invalid created-item value provenance');
            }
            if (source.kind === 'audit-packet' && source.pages !== undefined &&
                (!source.pages || !Array.isArray(source.pages.printed) || !source.pages.printed.length ||
                 !Array.isArray(source.pages.pdf) || !source.pages.pdf.length ||
                 [...source.pages.printed, ...source.pages.pdf].some(page => !Number.isSafeInteger(page) || page <= 0))) {
              throw new Error('Invalid created-item value source pages');
            }
          }
        } else if (Object.keys(modifier).length !== 3) {
          throw new Error('Invalid created-item value explicit measure');
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
          creation.follows !== 'selected-skill-own-rules-and-tools' ||
          Object.keys(creation).some(key => !['stage', 'requiredMethod', 'follows', 'obstacle', 'requiredQuality'].includes(key)) ||
          Object.keys(creation.requiredMethod).length !== 1 ||
          (creation.obstacle !== undefined && (!creation.obstacle ||
            creation.obstacle.kind !== 'natural-obstacle-with-minimum' ||
            !Number.isSafeInteger(creation.obstacle.minimum) || creation.obstacle.minimum <= 0 ||
            Object.keys(creation.obstacle).length !== 2)) ||
          (creation.requiredQuality !== undefined && creation.requiredQuality !== 'highest-quality')) {
        throw new Error('Invalid magic base-item-creation reference');
      }
    }
    if (integration.spellSongTransfer !== undefined) {
      const transfer = integration.spellSongTransfer;
      if (integration.subsystem !== 'magic' || !integration.baseItemCreation || !transfer ||
          transfer.after !== 'base-item-creation' || transfer.follows !== 'spell-song-own-rules' ||
          transfer.attempts !== 1 || transfer.effect?.target !== 'created-item' ||
          transfer.effect.activeWhen !== 'item-used' || Object.keys(transfer.effect).length !== 2 ||
          Object.keys(transfer).length !== 4) {
        throw new Error('Invalid magic spell-song transfer');
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
