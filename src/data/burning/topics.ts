import { generalSkillTranscriptionContent } from '../skills/general';
import { define, evidence } from '../skills/general/shared';
import type { SkillDefinition } from '../skills';

// Explicit lifepath topics, not a heuristic that rewrites arbitrary skill names.
const wiseTopics = ['alms','artisan','baggage-train','battle','bow','brew','clothing','craftsman','criminal','customer','dirty-secrets','fabric','feet','graft','grape','guard','guest','guts','honey','horse','landlord','lazy','leather','materials','merchant','mineral','nail','omen','peasant','relic','religious-rumor','rock','shoe','shrine','temple','tools','town','tree','trouble','village','wealthy','wholesale','wife','work'];
const historyTopics = ['ancient','local','obscure','religious'];
const title = (id:string) => id.split('-').map(word=>word[0].toUpperCase()+word.slice(1)).join(' ');
const family = (id:string) => generalSkillTranscriptionContent.families!.find(f=>f.id===id)!;
export const lifepathTopicSkills: SkillDefinition[] = [
  ...wiseTopics.map(topic=>define(topic+'-wise',title(topic)+'-wise',309,'Knowledge of '+title(topic)+'.',{
    ...family('wises').defaults, familyMembership:{familyId:'wises',topicId:topic},
  } as Parameters<typeof define>[4])),
  ...historyTopics.map(topic=>define(topic+'-history',title(topic)+' History',277,'A separately owned History topic.',{
    ...family('history').defaults, familyMembership:{familyId:'history',topicId:topic},
  } as Parameters<typeof define>[4])),
];
const instrument = generalSkillTranscriptionContent.skills.find(s=>s.id==='musical-instrument') as SkillDefinition;
lifepathTopicSkills.push({...instrument,id:'flute',sourceName:'Flute',tools:{kind:'specific-item',item:'flute'},source:[...instrument.source,evidence('Shepherd lifepath',163)]});
