import {expect,it} from 'vitest';
import {createCatalog} from '../../src/data/catalog';
import {humanContent} from '../../src/data/human';
import {applyLifepathCommand,planLeadAndLifepath,projectLifepathHistory} from '../../src/character/lifepath-history';
import {createSheet,deriveSheet} from '../../src/character/workbench';
import {layoutCatalog,routeSegment} from '../../src/ui/map-layout';
const catalog=createCatalog(humanContent);
it('makes a legal Lead and path atomic, charging the year and rejecting illegal destinations',()=>{
 let h=applyLifepathCommand({entries:[]},{kind:'lifepath',id:'human.peasant.born-peasant'},'rules',catalog);
 h=applyLifepathCommand(h,{kind:'lifepath',id:'human.peasant.farmer'},'rules',catalog);
 const next=planLeadAndLifepath(h,'human.villager.idiot',catalog)!;
 expect(next).toBeDefined();expect(next.entries.slice(-2).map(e=>e.kind)).toEqual(['lead','lifepath']);
 expect(projectLifepathHistory(next,catalog).age).toBe(8+8+1+10);
 expect(planLeadAndLifepath(h,'human.villager.village-born',catalog)).toBeUndefined();
 expect(planLeadAndLifepath(h,'human.villager.corrupt-sergeant',catalog)).toBeUndefined();
 expect(h.entries).toHaveLength(2);
});
it('exposes repeat-adjusted contributions from the existing calculation',()=>{
 let h=applyLifepathCommand({entries:[]},{kind:'lifepath',id:'human.peasant.born-peasant'},'rules',catalog);
 for(let i=0;i<4;i++)h=applyLifepathCommand(h,{kind:'lifepath',id:'human.peasant.farmer'},'rules',catalog);
 const d=deriveSheet(createSheet(),projectLifepathHistory(h,catalog));
 expect(d.contributions.map(c=>c.ordinary)).toEqual([0,8,8,4,0]);
 expect(d.contributions.reduce((n,c)=>n+c.resources,0)).toBe(d.total.resources);
});
it('uses stable four-column geography and direct adjacent routes without detours',()=>{
 const a=layoutCatalog(catalog,'human');expect(a).toEqual(layoutCatalog(catalog,'human'));
 const r=a.regions.find(r=>r.paths.length>8)!;const p=r.paths.map(p=>a.points.get(p.variantId)!);
 expect(new Set(p.slice(0,4).map(p=>p.y)).size).toBe(1);expect(p[4].y-p[0].y).toBe(104);
 expect(routeSegment(p[0],p[1],r.x+756)).not.toContain(' V ');
 expect(routeSegment(p[0],p[8],r.x+756)).toContain(' H ');
});
