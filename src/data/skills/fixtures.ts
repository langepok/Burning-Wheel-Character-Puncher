import type {
  FixedRoot, ForkGuidance, ForkSuggestion, SkillAuditFixture, SkillCatalogContent,
  SkillMetadata, SkillRelation, SkillSource, TrainingBehavior,
} from './types';

const packetUrl = 'https://github.com/langepok/Burning-Wheel-Character-Puncher/issues/20';
const source = (section: string, page?: number): SkillSource => ({
  kind: 'audit-packet', url: packetUrl, section,
  ...(page === undefined ? {} : { pages: { printed: [page], pdf: [page + 2] } }),
});
const brief: SkillSource = {
  kind: 'task-brief', document: 'docs/audits/SKILL_SCHEMA_FOUNDATION.md', section: 'Supplemental task examples',
};
const hardeningSource: SkillSource = {
  kind: 'task-brief', document: 'docs/audits/SKILL_SCHEMA_FOUNDATION.md', section: 'PR #21 RAW review corrections',
};
const stat = (id: string): FixedRoot => ({ kind: 'single', ability: { kind: 'stat', id } });
const combined = (first: string, second: string): FixedRoot => ({
  kind: 'combined', abilities: [{ kind: 'stat', id: first }, { kind: 'stat', id: second }],
});
const hatred: FixedRoot = { kind: 'single', ability: { kind: 'attribute', id: 'hatred' } };
const training: TrainingBehavior = {
  kind: 'training', rootPurpose: 'aptitude-and-practice', exponent: 'none', advancement: 'none', openingCost: 2,
};
const magical = { printedMarkers: ['§'], rollBehavior: { kind: 'open-ended', basis: 'magical' } } as const;
const fork = (skillId: string): ForkSuggestion => ({ target: { kind: 'skill', skillId } });
const guidance = (...suggestions: ForkSuggestion[]): ForkGuidance => ({
  policy: 'guidance-not-whitelist', manualContextualContributors: true, suggestions,
});
const only = (stockIds: string[], scope: 'always' | 'character-burning' = 'always') =>
  [{ kind: 'stock-only', stockIds, scope }] as const;
const includes = (id: string): SkillRelation => ({ kind: 'includes-capability', target: { kind: 'skill', id } });
const fixture = (
  id: string, sourceName: string, page: number | undefined, summary: string,
  metadata: Partial<SkillMetadata>, supplemental = false,
): SkillAuditFixture => ({
  id, sourceName, coverage: 'partial', summary,
  source: [source(sourceName, page), ...(supplemental ? [brief] : []),
    ...(metadata.training?.kind === 'training' ? [source('Training in character burning', 88)] : [])], ...metadata,
});
const supplemental = (
  id: string, sourceName: string, summary: string, metadata: Partial<SkillMetadata>,
): SkillAuditFixture => ({ id, sourceName, coverage: 'partial', summary, source: [brief], ...metadata });
const reviewed = (
  id: string, sourceName: string, summary: string, metadata: Partial<SkillMetadata>,
): SkillAuditFixture => ({ id, sourceName, coverage: 'partial', summary, source: [hardeningSource], ...metadata });

/** Audited general guidance, not a bonus calculator or a whitelist. */
export const ordinaryForkMetadata = {
  target: 'skill', contributor: 'related-owned-skill', adjudication: 'contextual',
  defaultDice: 1, highExponent: { minimum: 7, dice: 2 },
  excludedAbilityKinds: ['stat', 'attribute'],
  source: [{ kind: 'audit-packet', url: packetUrl, section: 'FoRK rule',
    pages: { printed: [36, 37], pdf: [38, 39] } }],
} as const;

/** Representative evidence, deliberately not the full General Skill List. */
export const skillFixtureContent: SkillCatalogContent = {
  skills: [
    fixture('accounting', 'Accounting', 253, 'Can recover taxed Resources.', {
      rootRule: stat('perception'), resourceInteractions: [{ kind: 'recover-taxed-resources' }], integrationTags: ['resources'],
    }),
    fixture('administration', 'Administration', 253, 'Can recover taxed Resources.', {
      rootRule: stat('perception'), resourceInteractions: [{ kind: 'recover-taxed-resources' }],
    }),
    fixture('antiphon-union-training', 'Antiphon Union Training', 255, 'Artisan Training with no exponent.', {
      rootRule: stat('will'), skillType: 'Artisan', training, printedMarkers: ['*'],
    }),
    fixture('armor-training', 'Armor Training', 256, 'Root is for practice, not an exponent.', {
      rootRule: combined('power', 'speed'), skillType: 'Martial Training', training, printedMarkers: ['*'],
    }),
    fixture('astrology', 'Astrology', 257, 'Its FoRK die has distinct reroll and failure behavior.', {
      rootRule: stat('perception'), skillType: 'Academic', tools: { kind: 'generic' },
      availabilityRestrictions: only(['human']), forkSuggestions: guidance(fork('doctrine'), fork('symbology')),
      specialForkBehaviorId: 'astrology-fork',
    }),
    fixture('brawling', 'Brawling', 261, 'Martial skill with a separate Fight integration.', {
      rootRule: stat('power'), skillType: 'Martial', integrationTags: ['fight'], forkSuggestions: guidance(fork('boxing')),
    }, true),
    { ...fixture('boxing', 'Boxing (Martial Arts)', 261, 'Boxing identity; Martial Arts refers to its mechanics.', {
      rootRule: combined('power', 'agility'), skillType: 'Martial', sourceAliases: ['Boxing'],
    }), source: [source('Boxing (Martial Arts)', 261), hardeningSource] },
    reviewed('martial-arts', 'Martial Arts', 'Separate skill identity referencing Boxing mechanics.', {
      relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'boxing' } }],
    }),
    fixture('child-rearing', 'Child-Rearing', 264, 'Substitutions apply only when caring for children.', {
      rootRule: stat('will'), relations: ['instruction', 'cooking', 'field-dressing'].map(id => ({
        kind: 'contextual-substitution', target: { kind: 'skill', id }, context: { kind: 'subject', subject: 'children' },
      })),
    }),
    fixture('dwarven-rune-script', 'Dwarven Rune Script', 269, 'Reading and writing in the Dwarven context.', {
      rootRule: stat('perception'), capabilities: [{ kind: 'literacy', actions: ['read', 'write'],
        context: { kind: 'culture', cultureId: 'dwarven' } }],
    }),
    fixture('herbalism', 'Herbalism', 277, 'FoRK suggestions depend on potion work or wound treatment.', {
      rootRule: stat('perception'), skillType: 'Medicinal', forkSuggestions: guidance(
        ...['apothecary', 'alchemy'].map(skillId => ({ ...fork(skillId), context: { kind: 'activity', activity: 'potion-work' } } as const)),
        ...['surgery', 'field-dressing'].map(skillId => ({ ...fork(skillId), context: { kind: 'activity', activity: 'wound-treatment' } } as const)),
      ),
    }),
    fixture('locksmith', 'Locksmith', 281, 'Includes Lock Pick capability.', {
      rootRule: combined('perception', 'agility'), relations: [includes('lock-pick')],
    }),
    fixture('mending', 'Mending', 283, 'Accepts appropriate Craftsman FoRKs; tools are expendable.', {
      rootRule: combined('perception', 'agility'), tools: { kind: 'generic', expendable: true },
      forkSuggestions: guidance({ target: { kind: 'skill-type', skillType: 'Craftsman', relevance: 'appropriate' } }),
    }, true),
    fixture('nogger', 'Nogger', 285, 'Magical Craftsman skill; the verified name is Nogger.', {
      rootRule: combined('will', 'perception'), skillType: 'Craftsman', tools: { kind: 'workshop' },
      availabilityRestrictions: only(['dwarf']), ...magical,
    }),
    fixture('playwright', 'Playwright', 288, 'Write is needed to open this skill.', {
      rootRule: combined('will', 'perception'), openingRequirements: [{ kind: 'known-skill', skillId: 'write' }],
    }),
    fixture('ratiquette', 'Ratiquette', 289, 'Etiquette substitution limited to rats and their relatives.', {
      rootRule: stat('will'), relations: [{ kind: 'contextual-substitution', target: { kind: 'skill', id: 'etiquette' },
        context: { kind: 'subject', subject: 'rats-and-relatives' } }],
    }),
    fixture('rune-casting', 'Rune Casting', 293, 'Dwarven magic shares Astrology-style FoRK behavior.', {
      rootRule: combined('will', 'perception'), ...magical, specialForkBehaviorId: 'astrology-fork',
    }),
    fixture('shield-training', 'Shield Training', 295, 'Shield Training has no exponent.', {
      rootRule: stat('agility'), skillType: 'Martial Training', training, printedMarkers: ['*'],
    }),
    fixture('skirmish-tactics', 'Skirmish Tactics', 297, 'Training can grant a subsystem capability without an exponent.', {
      rootRule: combined('will', 'perception'), skillType: 'Military Training', training, printedMarkers: ['*'],
      integrationTags: ['range-and-cover'], capabilities: [{ kind: 'subsystem-capability', id: 'skirmisher-help', integrationId: 'skirmish-help' }],
    }),
    fixture('smithcraft', 'Smithcraft', 297, 'Includes three crafting capabilities in the stated crafting scope.', {
      rootRule: combined('will', 'agility'), ...magical,
      relations: ['blacksmith', 'whitesmith', 'coppersmith'].map(id => ({ ...includes(id), context: { kind: 'activity', activity: 'crafting' } })),
    }),
    fixture('sorcery', 'Sorcery', 299, 'Gifted gates spell use; an opening restriction is not established here.', {
      rootRule: stat('perception'), skillType: 'Sorcerous', ...magical,
      availabilityRestrictions: only(['human', 'roden'], 'character-burning'),
      useRequirements: [{ kind: 'trait', id: 'gifted', use: 'spell-casting' }],
    }),
    fixture('spear', 'Spear', 300, 'A Martial skill, distinct from Throwing.', {
      rootRule: stat('agility'), skillType: 'Martial',
    }),
    fixture('sword', 'Sword', 303, 'Concrete and category FoRK guidance coexist.', {
      rootRule: stat('agility'), skillType: 'Martial', tools: { kind: 'specific-item', item: 'sword' }, integrationTags: ['fight'],
      forkSuggestions: guidance(fork('boxing'), fork('brawling'), { target: { kind: 'category', category: 'melee-weapon', relevance: 'appropriate' } }),
    }, true),
    fixture('tactics', 'Tactics', 304, 'Ambush and field-maneuver integrations remain external.', {
      rootRule: combined('will', 'perception'), skillType: 'Military', integrationTags: ['range-and-cover', 'ambush'],
      forkSuggestions: guidance(fork('strategy')),
    }),
    fixture('torture', 'Torture', 304, 'Orcs use Hatred and open-ended tests; the other root is Will/Perception.', {
      rootRule: { kind: 'conditional', cases: [{ stockIds: ['orc'], root: hatred }], otherwise: combined('will', 'perception') },
      rollBehavior: { kind: 'conditional', whenRoot: { kind: 'attribute', id: 'hatred' }, then: 'open-ended', otherwise: 'standard' },
    }, true),
    fixture('two-fisted-fighting-training', 'Two-Fisted Fighting Training', 306, 'Training grants later Fight capabilities, not an exponent.', {
      rootRule: stat('agility'), skillType: 'Martial Training', training, printedMarkers: ['*'], integrationTags: ['fight'],
    }),
    fixture('voice-of-thunder', 'Voice of Thunder', 307, 'Reuses Command and adds battlefield communication.', {
      rootRule: combined('will', 'forte'), ...magical,
      relations: [{ kind: 'mechanics-reuse-with-additions', target: { kind: 'skill', id: 'command' }, additionalCapabilityIds: ['battlefield-communication'] }],
      capabilities: [{ kind: 'subsystem-capability', id: 'battlefield-communication', integrationId: 'voice-communication' }],
    }),
    fixture('waiting-tables', 'Waiting Tables', 307, 'Can replenish taxed Resources.', {
      rootRule: stat('will'), skillType: 'Special', resourceInteractions: [{ kind: 'recover-taxed-resources' }], integrationTags: ['resources'],
    }),
    fixture('weaving-way', 'Weaving Way', 308, 'Replaces Weaving for Elves.', {
      rootRule: combined('will', 'agility'), ...magical, availabilityRestrictions: only(['elf']),
      relations: [{ kind: 'replacement', target: { kind: 'skill', id: 'weaving' }, context: { kind: 'stock', stockId: 'elf' } }],
    }),
    fixture('stuff-wise', 'Stuff-wise', 302, 'Named Wise with its own restrictions and FoRK suggestions.', {
      familyMembership: { familyId: 'wises', topicId: 'stuff' },
      rootRule: stat('perception'), skillType: 'Wise', tools: { kind: 'none', expendable: false },
      availabilityRestrictions: only(['dwarf'], 'character-burning'), forkSuggestions: guidance(fork('dwarf-wise'), fork('scavenging')),
    }),
    fixture('beggardry', 'Beggardry', 259, 'May replenish taxed Resources or produce cash.', {
      resourceInteractions: [{ kind: 'recover-taxed-resources' }, { kind: 'produce-cash' }],
    }),
    fixture('estate-management', 'Estate Management', 271, 'Can recover taxed Resources.', {
      resourceInteractions: [{ kind: 'recover-taxed-resources' }],
    }),
    fixture('extortion', 'Extortion', 271, 'Resources and Duel of Wits interactions are separate.', {
      resourceInteractions: [{ kind: 'recover-taxed-resources' }], integrationTags: ['resources', 'duel-of-wits'],
    }),
    fixture('arson', 'Arson', undefined, 'Stock restriction applies during character burning.', {
      availabilityRestrictions: only(['human', 'roden'], 'character-burning'),
    }),
    fixture('reason-of-old-stone', 'Reason of Old Stone', undefined, 'Dwarf availability has no character-burning-only qualifier.', {
      availabilityRestrictions: only(['dwarf']),
    }),
    fixture('aura-reading', 'Aura Reading', undefined, 'Does not itself grant the capability to perceive auras.', {
      useRequirements: [{ kind: 'capability', id: 'aura-perception', use: 'aura-perception' }],
    }),
    fixture('poisons', 'Poisons', 288, 'The printed Alchemical reference remains unresolved.', {
      forkSuggestions: guidance(fork('herbalism'), fork('apothecary'), {
        target: { kind: 'unresolved-source-reference', sourceLabel: 'Alchemical', probableTargetSkillId: 'alchemy' },
      }),
    }),
    fixture('song-of-the-eldar', 'Song of the Eldar', undefined, 'Acts like Astrology but has no printed section marker.', {
      printedMarkers: [], relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'astrology' } }],
    }),
    supplemental('tree-pulling', 'Tree Pulling', 'Hatred-rooted and marked magical in the task example.', {
      rootRule: hatred, printedMarkers: ['§'], rollBehavior: { kind: 'open-ended', basis: 'attribute-root' },
    }),
    supplemental('scavenging', 'Scavenging', 'Allows an appropriate Wise suggestion.', {
      forkSuggestions: guidance({ target: { kind: 'skill-family', familyId: 'wises', relevance: 'appropriate' } }),
    }),
    supplemental('rhyme-of-the-pathfinder', 'Rhyme of the Pathfinder', 'Reuses Tracking mechanics without sharing identity.', {
      relations: [{ kind: 'same-mechanics', target: { kind: 'skill', id: 'tracking' } }],
    }),
    supplemental('great-wolf-husbandry', 'Great Wolf Husbandry', 'Field Dressing capability for Great Wolves.', {
      relations: [{ kind: 'contextual-substitution', target: { kind: 'skill', id: 'field-dressing' }, context: { kind: 'subject', subject: 'great-wolves' } }],
    }),
    supplemental('spider-husbandry', 'Spider Husbandry', 'Instruction and Field Dressing limited to spiders.', {
      relations: ['instruction', 'field-dressing'].map(id => ({ kind: 'contextual-substitution', target: { kind: 'skill', id }, context: { kind: 'subject', subject: 'spiders' } })),
    }),
    { ...supplemental('rope-chant', 'Rope Chant', 'Reuses Knots with additional effects reserved for later audit.', {
      relations: [{ kind: 'mechanics-reuse-with-additions', target: { kind: 'skill', id: 'knots' } }],
      tools: { kind: 'anyOf', requirements: [{ kind: 'traveling-gear' }, { kind: 'specific-item', item: 'elven-rope' }] },
    }), source: [brief, hardeningSource] },
    supplemental('hauling', 'Hauling', 'Can substitute for Power in hauling.', {
      relations: [{ kind: 'contextual-substitution', target: { kind: 'stat', id: 'power' }, context: { kind: 'activity', activity: 'hauling' } }],
    }),
    supplemental('gambling', 'Gambling', 'Uses traveling gear; not Games of Chance.', { tools: { kind: 'traveling-gear' } }),
    supplemental('architect', 'Architect', 'Workshop tool requirement.', { tools: { kind: 'workshop' } }),
    supplemental('staff', 'Staff', 'Requires the specific item.', { tools: { kind: 'specific-item', item: 'staff' } }),
    reviewed('falconry', 'Falconry', 'Requires generic tools and a falcon.', {
      tools: { kind: 'allOf', requirements: [{ kind: 'generic' }, { kind: 'specific-item', item: 'falcon' }] },
    }),
    reviewed('hunting', 'Hunting', 'Bow or javelin are alternatives.', {
      tools: { kind: 'anyOf', requirements: [{ kind: 'specific-item', item: 'bow' }, { kind: 'specific-item', item: 'javelin' }] },
    }),
    reviewed('demonology', 'Demonology', 'FoRK guidance includes any ritual-type skill.', {
      forkSuggestions: guidance({ target: { kind: 'category', category: 'ritual', relevance: 'any' } }),
    }),
    reviewed('composition', 'Composition', 'FoRK applicability follows the content being composed.', {
      forkSuggestions: guidance({ target: { kind: 'applicable-to-content' } }),
    }),
    reviewed('ballad-of-history', 'Ballad of History', 'Appropriate history, Wise or song FoRKs.', {
      forkSuggestions: guidance({ target: { kind: 'anyOf', targets: [
        { kind: 'skill-family', familyId: 'history', relevance: 'appropriate' },
        { kind: 'skill-family', familyId: 'wises', relevance: 'appropriate' },
        { kind: 'category', category: 'song', relevance: 'appropriate' },
      ] } }),
    }),
    reviewed('song-of-lordship', 'Song of Lordship', 'Etiquette-like use among targets with one of the stated traits.', {
      relations: [{ kind: 'contextual-substitution', target: { kind: 'skill', id: 'etiquette' }, context: { kind: 'anyOf', conditions: [
        { kind: 'target-trait', traitId: 'etharchal' }, { kind: 'target-trait', traitId: 'fea' }, { kind: 'target-trait', traitId: 'aman' },
      ] } }],
    }),
    reviewed('code-of-citadels', 'Code of Citadels', 'Use context identifies a Citadel-born Elf target.', {
      useContext: { kind: 'allOf', conditions: [{ kind: 'target-stock', stockId: 'elf' }, { kind: 'target-origin', originId: 'citadel-born' }] },
    }),
    reviewed('driving', 'Driving', 'Riding substitution in pursuit or travel.', {
      relations: [{ kind: 'contextual-substitution', target: { kind: 'skill', id: 'riding' }, context: { kind: 'anyOf', conditions: [
        { kind: 'activity', activity: 'pursuit' }, { kind: 'activity', activity: 'travel' },
      ] } }],
    }),
    reviewed('read', 'Read', 'General reading capability without a culture gate.', { capabilities: [{ kind: 'literacy', actions: ['read'] }] }),
    reviewed('write', 'Write', 'General writing capability without a culture gate.', { capabilities: [{ kind: 'literacy', actions: ['write'] }] }),
  ],
  references: [
    ...[
      ['doctrine', 'Doctrine'], ['apothecary', 'Apothecary'], ['surgery', 'Surgery'],
      ['field-dressing', 'Field Dressing'], ['instruction', 'Instruction'], ['cooking', 'Cooking'],
      ['lock-pick', 'Lock Pick'], ['etiquette', 'Etiquette'],
      ['blacksmith', 'Blacksmith'], ['whitesmith', 'Whitesmith'], ['coppersmith', 'Coppersmith'],
      ['command', 'Command'], ['weaving', 'Weaving'], ['strategy', 'Strategy'], ['dwarf-wise', 'Dwarf-wise'],
      ['knives', 'Knives'], ['throwing', 'Throwing'], ['drinking', 'Drinking'], ['drunking', 'Drunking'], ['games-of-chance', 'Games of Chance'],
    ].map(([id, sourceName]) => ({ id, sourceName, source: [source('Representative fixtures and regression invariants')] })),
    { id: 'knots', sourceName: 'Knots', source: [brief] },
    { id: 'riding', sourceName: 'Riding', source: [hardeningSource] },
    { id: 'alchemy', sourceName: 'Alchemy', source: [source('Poisons anomaly', 254)] },
    ...([
      ['music-composition', 'Music Composition', 285], ['tracking', 'Tracking', 305],
      ['symbology', 'Symbology', 303], ['song-of-flocks-and-herds', 'Song of Flocks and Herds', 298],
    ] as const).map(([id, sourceName, page]) => ({ id, sourceName, source: [source('OCR/source verification results', page)] })),
  ],
  families: [
    { id: 'wises', sourceName: 'Wises', ownership: 'separate-skill-per-topic',
      defaults: { rootRule: stat('perception'), skillType: 'Wise' },
      summary: 'Each topic is owned separately; named entries may override family metadata.', source: [source('Wises', 309)] },
    { id: 'history', sourceName: 'History', ownership: 'separate-skill-per-topic', defaults: { rootRule: stat('perception') },
      summary: 'Individual histories are opened and owned separately.', source: [source('History', 277)] },
  ],
  choices: [{ id: 'appropriate-weapons', sourceName: 'Appropriate Weapons', kind: 'appropriate-weapons',
    selection: { kind: 'real-weapon-skills', contextRequired: true }, source: [source('Appropriate Weapons', 256)] }],
  forkBehaviors: [{ id: 'astrology-fork', target: { kind: 'any-skill-except-types', excluded: ['Martial', 'Physical'] },
    die: { six: 'reroll-normally', one: { action: 'reroll', onFailure: { subtractSuccesses: 1 } } },
    alternative: { kind: 'linked-test', usesSpecialForkDie: false }, source: [source('Astrology', 257), source('Rune Casting', 293)] }],
  integrations: [
    { id: 'brawling-fight', skillId: 'brawling', subsystem: 'fight', summary: 'Fight action permissions require later subsystem implementation.', source: [source('Brawling', 261)] },
    { id: 'skirmish-help', skillId: 'skirmish-tactics', subsystem: 'range-and-cover', context: { kind: 'activity', activity: 'field-maneuver' }, summary: 'Same-team characters with this Training can help each other on maneuvers; at most five skirmishers.', source: [source('Skirmish Tactics', 297)] },
    { id: 'voice-communication', skillId: 'voice-of-thunder', subsystem: 'battlefield-communication', summary: 'Battlefield communication in addition to Command mechanics; execution deferred.', source: [source('Voice of Thunder', 307)] },
  ],
};
