import { define, none, stat } from './shared';

// Explicit H topics inherit the verified General Wises defaults.
export const hWises = [
  define("handwriting-wise", "Handwriting-wise", 276, "Knowledge of Handwriting.", { rootRule: stat('perception'), skillType: 'Special', tools: none,
    familyMembership: { familyId: 'wises', topicId: "handwriting" } }),
  define("hatchet-wise", "Hatchet-wise", 277, "Knowledge of Hatchet.", { rootRule: stat('perception'), skillType: 'Special', tools: none,
    familyMembership: { familyId: 'wises', topicId: "hatchet" } }),
  define("hills-wise", "Hills-wise", 277, "Knowledge of Hills.", { rootRule: stat('perception'), skillType: 'Special', tools: none,
    familyMembership: { familyId: 'wises', topicId: "hills" } }),
  define("hold-wise", "Hold-wise", 277, "Knowledge of Hold.", { rootRule: stat('perception'), skillType: 'Special', tools: none,
    familyMembership: { familyId: 'wises', topicId: "hold" } }),
  define("hoof-wise", "Hoof-wise", 277, "Knowledge of Hoof.", { rootRule: stat('perception'), skillType: 'Special', tools: none,
    familyMembership: { familyId: 'wises', topicId: "hoof" } }),
  define("host-wise", "Host-wise", 277, "Knowledge of Host.", { rootRule: stat('perception'), skillType: 'Special', tools: none,
    familyMembership: { familyId: 'wises', topicId: "host" } }),
  define("hypocritical-bastards-wise", "Hypocritical Bastards-wise", 278, "Knowledge of Hypocritical Bastards.", { rootRule: stat('perception'), skillType: 'Special', tools: none,
    familyMembership: { familyId: 'wises', topicId: "hypocritical-bastards" } }),
];
