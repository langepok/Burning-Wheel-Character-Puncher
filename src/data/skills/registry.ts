import type {
  OwnedSkillTopic, RootRule, SkillCatalogContent, SkillFamilyDefinition, SkillMetadata,
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
  const validateMetadata = (metadata: Partial<SkillMetadata>) => {
    if (metadata.familyMembership) {
      if (!families.has(metadata.familyMembership.familyId)) throw new Error(`Unknown family: ${metadata.familyMembership.familyId}`);
      skillTopicKey(metadata.familyMembership);
    }
    if (metadata.rootRule) validateRoot(metadata.rootRule);
    for (const requirement of metadata.openingRequirements ?? []) requireSkill(requirement.skillId);
    for (const relation of metadata.relations ?? []) {
      if (relation.target.kind === 'skill') requireSkill(relation.target.id);
    }
    for (const { target } of metadata.forkSuggestions?.suggestions ?? []) {
      if (target.kind === 'skill') requireSkill(target.skillId);
      if (target.kind === 'wise-family' && !families.has(target.familyId)) {
        throw new Error(`Unknown Wise family: ${target.familyId}`);
      }
      // A probable target remains audit metadata, never a resolved FoRK reference.
    }
    if (metadata.specialForkBehaviorId && !forkBehaviors.has(metadata.specialForkBehaviorId)) {
      throw new Error(`Unknown special FoRK behavior: ${metadata.specialForkBehaviorId}`);
    }
    for (const capability of metadata.capabilities ?? []) {
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
  for (const integration of integrations.values()) requireSkill(integration.skillId);

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
