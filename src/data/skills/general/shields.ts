import type { SkillIntegration } from '../types';
import { evidence } from './shared';

export const shieldIntegrations: readonly SkillIntegration[] = [
  { id: 'shield-training-use', skillId: 'shield-training', subsystem: 'fight',
    shieldUse: { kind: 'shield-use', trainedDefenseAccess: [
      { action: 'block', shieldContribution: 'defense-dice' },
      { action: 'counterstrike', shieldContribution: 'defensive-portion' },
      { action: 'block-and-strike', access: 'enabled', shieldContribution: 'defensive-portion' },
    ], untrainedDefenseAccess: [{ action: 'block', shieldContribution: 'defense-dice' }],
    shieldStrike: { action: 'strike', implement: 'shield', actor: 'primary-actor', actingAbility: { kind: 'one-of', options: [
      { kind: 'skill', id: 'brawling' },
      { kind: 'context-resolved-skill', role: 'appropriate-boxing-skill', resolution: 'manual' },
      { kind: 'stat', id: 'agility' },
    ] } } },
    summary: 'Shield contributions are action-scoped. Strike ability selection is separate from Training permissions; detailed Fight execution stays external.',
    source: [evidence('Shield Training', 295), evidence('Armor and Shields: trained/untrained shield use', 481), evidence('Shields in Brief', 483)] },
];
