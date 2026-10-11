import { define, none, stat } from './shared';

// Explicit reviewed G topics use the verified General Wises defaults.
export const gWises = [
  define("gas-pocket-wise", "Gas Pocket-wise", 275, "Knowledge of Gas Pocket.", { rootRule: stat('perception'), skillType: 'Special', tools: none,
    familyMembership: { familyId: 'wises', topicId: "gas-pocket" } }),
  define("genius-wise", "Genius-wise", 276, "Knowledge of Genius.", { rootRule: stat('perception'), skillType: 'Special', tools: none,
    familyMembership: { familyId: 'wises', topicId: "genius" } }),
  define("gossip-wise", "Gossip-wise", 276, "Knowledge of Gossip.", { rootRule: stat('perception'), skillType: 'Special', tools: none,
    familyMembership: { familyId: 'wises', topicId: "gossip" } }),
  define("grain-wise", "Grain-wise", 276, "Knowledge of Grain.", { rootRule: stat('perception'), skillType: 'Special', tools: none,
    familyMembership: { familyId: 'wises', topicId: "grain" } }),
  define("graybeard-wise", "Graybeard-wise", 276, "Knowledge of Graybeard.", { rootRule: stat('perception'), skillType: 'Special', tools: none,
    familyMembership: { familyId: 'wises', topicId: "graybeard" } }),
  define("great-and-black-wise", "Great and Black-wise", 276, "Knowledge of Great and Black.", { rootRule: stat('perception'), skillType: 'Special', tools: none,
    familyMembership: { familyId: 'wises', topicId: "great-and-black" } }),
  define("great-masters-wise", "Great Masters-wise", 276, "Knowledge of Great Masters.", { rootRule: stat('perception'), skillType: 'Special', tools: none,
    familyMembership: { familyId: 'wises', topicId: "great-masters" } }),
  define("grift-wise", "Grift-wise", 276, "Knowledge of Grift.", { rootRule: stat('perception'), skillType: 'Special', tools: none,
    familyMembership: { familyId: 'wises', topicId: "grift" } }),
  define("guilder-wise", "Guilder-wise", 276, "Knowledge of Guilder.", { rootRule: stat('perception'), skillType: 'Special', tools: none,
    familyMembership: { familyId: 'wises', topicId: "guilder" } }),
];
