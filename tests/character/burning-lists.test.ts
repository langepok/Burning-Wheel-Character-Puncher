import {it,expect} from 'vitest';
import {humanContent} from '../../src/data/human';
import {humanBurningLists} from '../../src/data/burning/human';
import {skills} from '../../src/rules/burning';
it('covers every loaded pilot lifepath and reports unimplemented skill topics explicitly',()=>{
 expect(Object.keys(humanBurningLists).sort()).toEqual(humanContent.lifepaths.map(p=>p.variantId).sort());
 const missing=[...new Set(Object.values(humanBurningLists).flatMap(l=>l.skills.flatMap(s=>typeof s==='string'?[s]:[...s])).filter(id=>!skills.has(id)))].sort();
 expect(missing).toEqual(['appropriate-weapons']);
});
