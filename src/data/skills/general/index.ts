import type { SkillCatalogContent } from '../types';
import { aDIntegrations, aDSkills } from './a-d';
import { aDWises } from './a-d-wises';
import { eFSkills } from './e-f';
import { eFWises } from './e-f-wises';
import { equipmentUseIntegrations } from './equipment-use';
import { gHSkills } from './g-h';
import { resourceIntegrations } from './resources';
import { gWises } from './g-wises';
import { itemValueIntegrations } from './item-value';
import { structureResistanceIntegrations } from './structure-resistance';
import { hWises } from './h-wises';
import { iMIntegrations, iMSkills } from './i-m';
import { nRSkills } from './n-r';
import { generalNameReferences } from './references';
import { evidence, none, stat } from './shared';

const skills = [...aDSkills, ...aDWises, ...eFSkills, ...eFWises, ...gHSkills, ...gWises, ...hWises, ...iMSkills, ...nRSkills];
const loadedIds = new Set(skills.map(skill => skill.id));

/** Work in progress: complete records for reviewed blocks, identity-only references elsewhere.
 * This is deliberately not wired into the UI or advertised as a complete General catalog.
 */
export const generalSkillTranscriptionContent: SkillCatalogContent = {
  skills,
  references: [...generalNameReferences.filter(reference => !loadedIds.has(reference.id)),
    { id: 'mounted-combat-bowman-training', sourceName: 'Mounted Combat: Bowman Training',
      source: [evidence('Elven Outrider lifepath', 137), evidence('Elven Lancer character', 130)] }],
  families: [
    { id: 'wises', sourceName: 'Wises', ownership: 'separate-skill-per-topic',
      defaults: { rootRule: stat('perception'), skillType: 'Special', tools: none },
      summary: 'Perception-rooted, separately owned topics; named entries may override the source defaults.', source: [evidence('Wises', 309)] },
    { id: 'history', sourceName: 'History', ownership: 'separate-skill-per-topic',
      defaults: { rootRule: stat('perception'), skillType: 'Academic', tools: none,
        forkSuggestions: { policy: 'guidance-not-whitelist', manualContextualContributors: true, suggestions: [
          { target: { kind: 'skill', skillId: 'research' } }, { target: { kind: 'skill', skillId: 'philosophy' } },
          { target: { kind: 'skill', skillId: 'doctrine' } }, { target: { kind: 'skill-family', familyId: 'history', relevance: 'any' } },
        ] } },
      summary: 'Separate ownership for each specific History.', source: [evidence('History', 277)] },
  ],
  choices: [{ id: 'appropriate-weapons', sourceName: 'Appropriate Weapons', kind: 'appropriate-weapons',
    selection: { kind: 'real-weapon-skills', contextRequired: true }, source: [evidence('Appropriate Weapons', 256)] }],
  forkBehaviors: [{ id: 'astrology-fork', target: { kind: 'any-skill-except-types', excluded: ['Martial', 'Physical'] },
    die: { six: 'reroll-normally', one: { action: 'reroll', onFailure: { subtractSuccesses: 1 } } },
    alternative: { kind: 'linked-test', usesSpecialForkDie: false }, source: [evidence('Astrology', 257)] }],
  integrations: [...aDIntegrations, ...iMIntegrations, ...equipmentUseIntegrations, ...resourceIntegrations,
    ...itemValueIntegrations.filter(integration => loadedIds.has(integration.skillId)),
    ...structureResistanceIntegrations.filter(integration => loadedIds.has(integration.skillId))],
};
