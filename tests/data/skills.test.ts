import { describe, expect, it } from 'vitest';
import { createSkillCatalog, getSkillTopicMetadata, skillTopicKey } from '../../src/data/skills';
import type { OwnedSkillTopic, SkillAuditFixture, SkillRollContributor } from '../../src/data/skills';
import { ordinaryForkMetadata, skillFixtureContent } from '../../src/data/skills/fixtures';

const catalog = createSkillCatalog(skillFixtureContent);
function skill(id: string) {
  const result = catalog.skills.get(id);
  if (!result) throw new Error(`Missing fixture ${id}`);
  return result;
}

describe('Skill Catalog schema foundation', () => {
  it('registers audited partial fixtures independently of React and lifepath content', () => {
    const catalog = createSkillCatalog(skillFixtureContent);
    expect(catalog.skills.get('sword')?.rootRule).toEqual({ kind: 'single', ability: { kind: 'stat', id: 'agility' } });
    expect([...catalog.skills.values()].every(skill => skill.coverage === 'partial')).toBe(true);
    expect(catalog.choices.has('appropriate-weapons')).toBe(true);
    expect(catalog.skills.has('appropriate-weapons')).toBe(false);
  });

  it('does not silently fill untranscribed fields with unrestricted or ordinary behavior', () => {
    expect(skill('accounting').tools).toBeUndefined();
    expect(skill('accounting').availabilityRestrictions).toBeUndefined();
    expect(skill('sorcery').openingRequirements).toBeUndefined();
    expect(skill('song-of-the-eldar').rollBehavior).toBeUndefined();
    expect(skill('rope-chant').relations?.[0]).not.toHaveProperty('additionalCapabilityIds');
    expect(catalog.references.get('tracking')).not.toHaveProperty('rootRule');
    expect(catalog.skills.has('tracking')).toBe(false);
  });

  it.each([
    ['sword', { kind: 'single', ability: { kind: 'stat', id: 'agility' } }],
    ['boxing', { kind: 'combined', abilities: [{ kind: 'stat', id: 'power' }, { kind: 'stat', id: 'agility' }] }],
    ['tree-pulling', { kind: 'single', ability: { kind: 'attribute', id: 'hatred' } }],
  ])('preserves the structured root of %s', (id, root) => {
    expect(skill(id as string).rootRule).toEqual(root);
  });

  it('preserves the stock-dependent Torture root and its conditional open-ended behavior', () => {
    expect(skill('torture').rootRule).toEqual({
      kind: 'conditional', cases: [{ stockIds: ['orc'], root: { kind: 'single', ability: { kind: 'attribute', id: 'hatred' } } }],
      otherwise: { kind: 'combined', abilities: [{ kind: 'stat', id: 'will' }, { kind: 'stat', id: 'perception' }] },
    });
    expect(skill('torture').rollBehavior).toEqual({
      kind: 'conditional', whenRoot: { kind: 'attribute', id: 'hatred' }, then: 'open-ended', otherwise: 'standard',
    });
  });

  it.each(['antiphon-union-training', 'armor-training', 'shield-training', 'skirmish-tactics', 'two-fisted-fighting-training'])(
    '%s has no exponent, normal advancement or opening-exponent root', id => {
      expect(skill(id).training).toEqual({ kind: 'training', rootPurpose: 'aptitude-and-practice', exponent: 'none', advancement: 'none', openingCost: 2 });
      expect(skill(id).printedMarkers).toEqual(['*']);
    },
  );

  it('does not infer Training or open-ended behavior from Skill Type', () => {
    expect(skill('antiphon-union-training').skillType).toBe('Artisan');
    expect(skill('nogger').skillType).toBe('Craftsman');
    expect(skill('nogger').rollBehavior).toEqual({ kind: 'open-ended', basis: 'magical' });
    expect(skill('nogger').printedMarkers).toEqual(['§']);
    expect(skill('tree-pulling').rollBehavior).toEqual({ kind: 'open-ended', basis: 'attribute-root' });
    expect(skill('song-of-the-eldar').printedMarkers).toEqual([]);
    expect(skill('song-of-the-eldar').relations).toEqual([{ kind: 'same-mechanics', target: { kind: 'skill', id: 'astrology' } }]);
  });

  it('keeps general FoRK contribution guidance separate from special dice', () => {
    expect(ordinaryForkMetadata).toMatchObject({ target: 'skill', contributor: 'related-owned-skill',
      defaultDice: 1, highExponent: { minimum: 7, dice: 2 }, excludedAbilityKinds: ['stat', 'attribute'] });
    expect(skill('sword').forkSuggestions).toEqual({ policy: 'guidance-not-whitelist', manualContextualContributors: true,
      suggestions: [{ target: { kind: 'skill', skillId: 'boxing' } }, { target: { kind: 'skill', skillId: 'brawling' } },
        { target: { kind: 'category', category: 'melee-weapon', relevance: 'appropriate' } }] });
    expect(skill('mending').forkSuggestions?.suggestions).toEqual([{ target: { kind: 'skill-type', skillType: 'Craftsman', relevance: 'appropriate' } }]);
    expect(skill('scavenging').forkSuggestions?.suggestions).toEqual([{ target: { kind: 'skill-family', familyId: 'wises', relevance: 'appropriate' } }]);
  });

  it('retains all four Herbalism FoRKs and their distinct contexts', () => {
    expect(skill('herbalism').forkSuggestions?.suggestions).toEqual([
      { target: { kind: 'skill', skillId: 'apothecary' }, context: { kind: 'activity', activity: 'potion-work' } },
      { target: { kind: 'skill', skillId: 'alchemy' }, context: { kind: 'activity', activity: 'potion-work' } },
      { target: { kind: 'skill', skillId: 'surgery' }, context: { kind: 'activity', activity: 'wound-treatment' } },
      { target: { kind: 'skill', skillId: 'field-dressing' }, context: { kind: 'activity', activity: 'wound-treatment' } },
    ]);
  });

  it('shares the exact Astrology special die with Rune Casting and preserves contributor provenance', () => {
    const behaviorId = skill('astrology').specialForkBehaviorId;
    expect(behaviorId).toBe('astrology-fork');
    expect(skill('rune-casting').specialForkBehaviorId).toBe(behaviorId);
    expect(catalog.forkBehaviors.get(behaviorId!)).toMatchObject({
      target: { kind: 'any-skill-except-types', excluded: ['Martial', 'Physical'] },
      die: { six: 'reroll-normally', one: { action: 'reroll', onFailure: { subtractSuccesses: 1 } } },
      alternative: { kind: 'linked-test', usesSpecialForkDie: false },
    });
    const contributors: SkillRollContributor[] = ['astrology', 'rune-casting'].map(sourceSkillId => ({
      sourceSkillId, role: 'fork', behavior: { kind: 'special-fork', behaviorId: behaviorId! }, source: skill(sourceSkillId).source,
    }));
    const restored = JSON.parse(JSON.stringify(contributors)) as SkillRollContributor[];
    expect(restored.map(item => item.sourceSkillId)).toEqual(['astrology', 'rune-casting']);
    expect(restored.map(item => item.behavior)).toEqual(contributors.map(item => item.behavior));
    expect(restored[0].source).not.toEqual(restored[1].source);
  });

  it.each([
    ['child-rearing', ['instruction', 'cooking', 'field-dressing'], 'children'],
    ['great-wolf-husbandry', ['field-dressing'], 'great-wolves'],
    ['spider-husbandry', ['instruction', 'field-dressing'], 'spiders'],
    ['ratiquette', ['etiquette'], 'rats-and-relatives'],
  ] as const)('%s substitutions retain their complete subject scope', (id, targets, subject) => {
    expect(skill(id).relations).toEqual(targets.map(target => ({ kind: 'contextual-substitution', target: { kind: 'skill', id: target }, context: { kind: 'subject', subject } })));
  });

  it('retains capability inclusion, replacement, same mechanics, and additions without aliasing identities', () => {
    expect(skill('locksmith').relations).toEqual([{ kind: 'includes-capability', target: { kind: 'skill', id: 'lock-pick' } }]);
    expect(skill('smithcraft').relations).toEqual(['blacksmith', 'whitesmith', 'coppersmith'].map(id => ({
      kind: 'includes-capability', target: { kind: 'skill', id }, context: { kind: 'activity', activity: 'crafting' },
    })));
    expect(skill('weaving-way').relations).toEqual([{ kind: 'replacement', target: { kind: 'skill', id: 'weaving' }, context: { kind: 'stock', stockId: 'elf' } }]);
    expect(skill('rhyme-of-the-pathfinder').relations).toEqual([{ kind: 'same-mechanics', target: { kind: 'skill', id: 'tracking' } }]);
    expect(skill('voice-of-thunder').relations).toEqual([{ kind: 'mechanics-reuse-with-additions', target: { kind: 'skill', id: 'command' }, additionalCapabilityIds: ['battlefield-communication'] }]);
    expect(skill('dwarven-rune-script').capabilities).toEqual([{ kind: 'literacy', actions: ['read', 'write'], context: { kind: 'culture', cultureId: 'dwarven' } }]);
    expect(skill('boxing').sourceAliases).not.toContain('Martial Arts');
    expect(skill('martial-arts').id).not.toBe(skill('boxing').id);
    expect(skill('martial-arts').relations).toEqual([{ kind: 'same-mechanics', target: { kind: 'skill', id: 'boxing' } }]);
  });

  it('permits stat targets without treating a stat as a skill', () => {
    expect(skill('hauling').relations).toEqual([{ kind: 'contextual-substitution', target: { kind: 'stat', id: 'power' }, context: { kind: 'activity', activity: 'hauling' } }]);
    expect(catalog.skills.has('power')).toBe(false);
  });

  it('keeps availability, opening, and use requirements separate with exact scopes', () => {
    expect(skill('arson').availabilityRestrictions).toEqual([{ kind: 'stock-only', stockIds: ['human', 'roden'], scope: 'character-burning' }]);
    expect(skill('reason-of-old-stone').availabilityRestrictions).toEqual([{ kind: 'stock-only', stockIds: ['dwarf'], scope: 'always' }]);
    expect(skill('playwright').openingRequirements).toEqual([{ kind: 'known-skill', skillId: 'write' }]);
    expect(skill('aura-reading').useRequirements).toEqual([{ kind: 'capability', id: 'aura-perception', use: 'aura-perception' }]);
    expect(skill('sorcery').useRequirements).toEqual([{ kind: 'trait', id: 'gifted', use: 'spell-casting' }]);
    expect(skill('sorcery').availabilityRestrictions).toEqual([{ kind: 'stock-only', stockIds: ['human', 'roden'], scope: 'character-burning' }]);
    expect(skill('sorcery').openingRequirements).toBeUndefined();
  });

  it.each([
    ['sword', { kind: 'specific-item', item: 'sword' }], ['staff', { kind: 'specific-item', item: 'staff' }],
    ['gambling', { kind: 'traveling-gear' }], ['architect', { kind: 'workshop' }],
    ['mending', { kind: 'generic', expendable: true }], ['astrology', { kind: 'generic' }],
    ['stuff-wise', { kind: 'none', expendable: false }],
  ] as const)('preserves %s tools without treating missing expendable as false', (id, tools) => {
    expect(skill(id).tools).toEqual(tools);
  });

  it.each(['wises', 'history'])('%s topics have separate stable identities and metadata overrides', id => {
    const family = catalog.families.get(id)!;
    const first: OwnedSkillTopic = { familyId: id, topicId: 'local', sourceName: 'Local topic', metadataOverrides: {} };
    const second: OwnedSkillTopic = { ...first, topicId: 'ancient' };
    expect(family.ownership).toBe('separate-skill-per-topic');
    expect(skillTopicKey(first)).not.toBe(skillTopicKey(second));
    expect(getSkillTopicMetadata(family, first).rootRule).toEqual({ kind: 'single', ability: { kind: 'stat', id: 'perception' } });
    const overridden = { ...first, metadataOverrides: { tools: { kind: 'none', expendable: false } } } as const;
    expect(getSkillTopicMetadata(family, overridden).tools).toEqual({ kind: 'none', expendable: false });
    expect(getSkillTopicMetadata(family, second).tools).toBeUndefined();
    expect(catalog.skills.has(id)).toBe(false);
  });

  it('preserves named Wise overrides and does not merge unrelated topic ids', () => {
    expect(skill('stuff-wise').familyMembership).toEqual({ familyId: 'wises', topicId: 'stuff' });
    expect(skill('stuff-wise').availabilityRestrictions).toEqual([{ kind: 'stock-only', stockIds: ['dwarf'], scope: 'character-burning' }]);
    expect(skill('stuff-wise').forkSuggestions?.suggestions).toEqual([{ target: { kind: 'skill', skillId: 'dwarf-wise' } }, { target: { kind: 'skill', skillId: 'scavenging' } }]);
    expect(skillTopicKey({ familyId: 'a:b', topicId: 'c' })).not.toBe(skillTopicKey({ familyId: 'a', topicId: 'b:c' }));
    expect(() => skillTopicKey({ familyId: 'wises', topicId: '' })).toThrow('nonempty');
    expect(() => getSkillTopicMetadata(catalog.families.get('history')!, { familyId: 'wises', topicId: 'stuff', sourceName: 'Stuff-wise', metadataOverrides: {} })).toThrow('another family');
  });

  it.each(['accounting', 'administration', 'beggardry', 'estate-management', 'extortion', 'waiting-tables'])(
    '%s declares the repeated Resources interaction without executing it', id => {
      expect(skill(id).resourceInteractions).toContainEqual({ kind: 'recover-taxed-resources' });
    },
  );

  it('retains cash production and external Training capabilities separately', () => {
    expect(skill('beggardry').resourceInteractions).toContainEqual({ kind: 'produce-cash' });
    expect(skill('skirmish-tactics').capabilities).toEqual([{ kind: 'subsystem-capability', id: 'skirmisher-help', integrationId: 'skirmish-help' }]);
    expect(catalog.integrations.get('skirmish-help')).toMatchObject({ skillId: 'skirmish-tactics', subsystem: 'range-and-cover' });
    expect(skill('tactics').integrationTags).toEqual(['range-and-cover', 'ambush']);
    expect(JSON.parse(JSON.stringify(skillFixtureContent))).toEqual(skillFixtureContent);
  });

  it.each([
    ['knives', 'throwing'], ['spear', 'throwing'], ['drinking', 'drunking'], ['gambling', 'games-of-chance'],
  ])('never merges %s with %s', (first, second) => {
    const lookup = (id: string) => catalog.skills.get(id) ?? catalog.references.get(id);
    expect(lookup(first)).toBeDefined();
    expect(lookup(second)).toBeDefined();
    expect(lookup(first)?.id).not.toBe(lookup(second)?.id);
    expect(lookup(first)?.sourceName).not.toBe(lookup(second)?.sourceName);
  });

  it.each([
    ['music-composition', 'Music Composition'], ['nogger', 'Nogger'], ['tracking', 'Tracking'],
    ['symbology', 'Symbology'], ['song-of-flocks-and-herds', 'Song of Flocks and Herds'], ['stuff-wise', 'Stuff-wise'],
  ])('%s retains its visually verified canonical spelling', (id, sourceName) => {
    expect((catalog.skills.get(id) ?? catalog.references.get(id))?.sourceName).toBe(sourceName);
    expect([...catalog.skills.values(), ...catalog.references.values()].filter(item => item.sourceName === sourceName)).toHaveLength(1);
  });

  it('keeps Alchemical unresolved and never adds a resolved Alchemy FoRK to Poisons', () => {
    expect(skill('poisons').forkSuggestions?.suggestions).toEqual([
      { target: { kind: 'skill', skillId: 'herbalism' } }, { target: { kind: 'skill', skillId: 'apothecary' } },
      { target: { kind: 'unresolved-source-reference', sourceLabel: 'Alchemical', probableTargetSkillId: 'alchemy' } },
    ]);
    expect(catalog.skills.has('alchemical')).toBe(false);
    expect(catalog.references.has('alchemical')).toBe(false);
  });

  it('registers a synthetic non-Human skill without a built-in stock switch', () => {
    const fixture: SkillAuditFixture = { id: 'synthetic-song', sourceName: 'Synthetic Song', coverage: 'partial', summary: 'Test only.',
      source: [{ kind: 'task-brief', document: 'test', section: 'synthetic' }],
      rootRule: { kind: 'conditional', cases: [{ stockIds: ['synthetic-stock'], root: { kind: 'single', ability: { kind: 'attribute', id: 'synthetic-memory' } } }], otherwise: { kind: 'single', ability: { kind: 'stat', id: 'will' } } },
      availabilityRestrictions: [{ kind: 'stock-only', stockIds: ['synthetic-stock'], scope: 'always' }],
      relations: [{ kind: 'specialized-version', target: { kind: 'attribute', id: 'synthetic-memory' } }],
    };
    const registered = createSkillCatalog({ skills: [fixture], references: [], families: [], choices: [], forkBehaviors: [], integrations: [] });
    expect(registered.skills.get('synthetic-song')).toEqual(fixture);
  });
});
