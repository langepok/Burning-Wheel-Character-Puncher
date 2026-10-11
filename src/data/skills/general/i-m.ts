import { define, expendable, generic, forks, guidance, fork, none, stat, evidence } from './shared';

/** Reviewed I–M production records; transcription remains in progress. */
export const iMSkills = [
  define('illuminations', 'Illuminations', 278, 'Embellish manuscripts with illustrations.', {
    rootRule: stat('agility'), skillType: 'Artist', tools: expendable, forkSuggestions: forks('painting', 'calligraphy') }),
  define('imperfections-wise', 'Imperfections-wise', 278, 'Knowledge of imperfections.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'imperfections' } }),
  define('inconspicuous', 'Inconspicuous', 278, 'Blend into a crowd without attracting notice.', {
    rootRule: stat('will'), skillType: 'Social', tools: none, forkSuggestions: forks('acting'),
    testProfile: { kind: 'versus', opposingAbilities: [{ kind: 'skill', skillId: 'observation' }], modifiers: [
      { kind: 'obstacle', delta: 1, when: { kind: 'anyOf', conditions: [{ kind: 'attire', attire: 'garish' }, { kind: 'attire', attire: 'inappropriate' }] } },
      { kind: 'obstacle', delta: 1, when: { kind: 'anyOf', conditions: [{ kind: 'social-station-mismatch', position: 'above', relativeTo: 'appropriate-social-station' }, { kind: 'social-station-mismatch', position: 'below', relativeTo: 'appropriate-social-station' }] } },
      { kind: 'obstacle', delta: 1, when: { kind: 'regional-origin-mismatch', relativeTo: 'current-region' } },
      { kind: 'obstacle', delta: 2, when: { kind: 'stock-mismatch', relativeTo: 'target-crowd' } },
    ] } }),
  define('infection-wise', 'Infection-wise', 278, 'Knowledge of infections.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'infection' } }),
  define('insect-husbandry', 'Insect Husbandry', 278, 'Raise and care for insects, with scoped medical obstacle guidance.', {
    rootRule: stat('will'), skillType: 'Forester', tools: generic, integrationTags: ['injury'],
    relations: [{ kind: 'obstacle-reference', targets: { kind: 'skill', skillId: 'apothecary' },
      context: { kind: 'activity', activity: 'tending-wounds-and-illness' } }] }),
  define('instruction', 'Instruction', 278, 'Teach another character; obstacle guidance is in Learning from Another.', {
    rootRule: stat('will'), skillType: 'Social', tools: none, forkSuggestions: forks('command', 'persuasion') }),
  define('interrogation', 'Interrogation', 278, 'Obtain sought information from an unwilling subject.', {
    rootRule: stat('will'), skillType: 'Social', tools: none,
    forkSuggestions: guidance(fork('intimidation'), fork('torture'), { target: { kind: 'anyOf', targets: [
      { kind: 'skill', skillId: 'ugly-truth' }, { kind: 'skill', skillId: 'soothing-platitudes' },
    ] } }),
    testProfile: { kind: 'obstacle', base: { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' },
      adjustments: [
        { kind: 'manual', source: 'target-traits', quantity: 'unquantified' },
        { kind: 'manual', source: 'situational-disadvantage', quantity: 'unquantified', examples: [
          { kind: 'target-belief', constraint: 'prevents-disclosure-of-sought-information' },
        ] },
      ] } }),
  { ...define('intimidation', 'Intimidation', 278, 'Threaten a target; outside Duel of Wits, success prompts a Steel test.', {
    rootRule: stat('will'), skillType: 'Social', tools: none, forkSuggestions: forks('ugly-truth'), integrationTags: ['duel-of-wits'],
    testProfile: { kind: 'obstacle', context: { kind: 'outside-subsystem', subsystem: 'duel-of-wits' },
      base: { kind: 'target-ability-exponent', ability: { kind: 'stat', id: 'will' }, snapshot: 'current' }, adjustments: [],
      followUps: [{ trigger: { kind: 'test-success', source: 'primary-test' },
        context: { kind: 'outside-subsystem', subsystem: 'duel-of-wits' },
        test: { actor: 'target', ability: { kind: 'attribute', id: 'steel' } },
        modifiers: [{ kind: 'dynamic-value', target: 'hesitation-obstacle', operation: 'add',
          value: { kind: 'extra-successes', source: 'primary-test' } }],
      }] } }), source: [evidence('Intimidation', 278), evidence('Intimidation continuation', 279)] },
  define('intrigue-wise', 'Intrigue-wise', 279, 'Knowledge of intrigue.', {
    rootRule: stat('perception'), skillType: 'Special', tools: none, familyMembership: { familyId: 'wises', topicId: 'intrigue' } }),
];
