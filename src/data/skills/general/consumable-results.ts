import type { ConsumableDuration, SkillIntegration } from '../types';
import { evidence } from './shared';

const dwarfDrunkenness: ConsumableDuration = { kind: 'attribute-derived-duration', unit: 'hour', base: 10,
  subtract: { kind: 'attribute', id: 'health' }, snapshot: 'current' };

export const consumableIntegrations: readonly SkillIntegration[] = [
  { id: 'nogger-consumption', skillId: 'nogger', subsystem: 'equipment',
    craftedConsumableEffect: { recipientRole: 'consumer', target: 'crafted-consumable', caseSemantics: 'independent-source-conditions', cases: [
      { recipient: { kind: 'stock', stockId: 'dwarf' }, dose: { kind: 'full-draught' }, repeat: 'once-active-non-stacking', effects: [
        { kind: 'dice-bonus', dice: 1, scope: { kind: 'next-ability-test', ability: { kind: 'attribute', id: 'health' } } },
        { kind: 'obstacle-modifier', delta: 1, scope: { kind: 'skill-type-tests', skillType: 'Social' }, duration: { kind: 'current-scene' } },
      ] },
      { recipient: { kind: 'stock', stockId: 'dwarf' },
        dose: { kind: 'consumed-quantity-threshold', unit: 'stein', comparison: 'at-least', recipientAbility: { kind: 'stat', id: 'forte' }, snapshot: 'current' },
        repeat: 'unspecified', effects: [{ kind: 'intoxication', condition: 'drunk',
          modifier: { kind: 'obstacle-modifier', delta: 1, scope: { kind: 'all-tests' } }, duration: dwarfDrunkenness }] },
      { recipient: { kind: 'not-stock', stockId: 'dwarf' }, dose: { kind: 'mouthful' }, repeat: 'unspecified', restorativeBenefit: 'none',
        effects: [{ kind: 'intoxication', condition: 'drunk', modifier: { kind: 'obstacle-modifier', delta: 1, scope: { kind: 'all-tests' } },
          duration: { kind: 'unspecified' } }] },
    ] }, summary: 'Drinking the crafted brew has recipient- and dose-dependent effects; no drinking, duration or Health test is evaluated.',
    source: [evidence('Nogger', 285), evidence('Nogger continuation', 286)] },
];
