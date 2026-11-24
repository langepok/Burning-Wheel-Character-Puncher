import { expect, it } from 'vitest';
import { createSheet, encodeDraft, parseDraft } from '../../src/character/workbench';
import { buyResources, refundResource } from '../../src/character/resources';
import { projectResources, quoteResource } from '../../src/rules/resources';
import type { ResourceRequest } from '../../src/rules/resource-types';
import { catalog, request, reviews, wealthy } from '../helpers/resource-engine';
const arms:ResourceRequest={...request('arms','arms',{kind:'quality',quality:'superior',description:'Agreed kit'}),reviews,declaredItems:['a','b'].map(id=>({id,name:'Axe',kind:'weapon',weaponKind:'axe',source:[]}))};
const mod=(id:string,target='a',definition='weighted-pommel'):ResourceRequest=>({...request(id,definition,{kind:'addition',description:id}),links:{parentPurchaseId:'arms',targetItemId:target},reviews:[{questionId:'weapon-modification-stacking',explanation:'Agreed combination'}]});
const buy=(sheet:ReturnType<typeof createSheet>,rs:ResourceRequest[])=>{const r=buyResources(sheet,wealthy,rs,'rules');expect(r.error).toBeUndefined();return r.sheet;};
const stale=(sheet:ReturnType<typeof createSheet>,id:string)=>projectResources(sheet,wealthy).diagnostics.some(d=>d.purchaseId===id&&d.code==='review-weapon-modification-stacking'&&d.severity==='error');
it.each(['weapon','shield','armor'] as const)('Clothes cannot grant %s declarations in either mode or imports',kind=>{
 const s=createSheet(),r={...request('clothes','clothes'),declaredItems:[{id:'x',name:'Free text',kind,source:[]}]};
 expect(quoteResource(s,wealthy,r).status).toBe('unavailable');
 for(const mode of ['rules','free'] as const)expect(buyResources(s,wealthy,[{...r,override:mode==='free'?{paidRps:1,reason:'Test'}:undefined}],mode).sheet).toBe(s);
 const valid=buy(s,[request('clothes','clothes')]);
 const corrupted={...valid,resourcePurchases:valid.resourcePurchases!.map(p=>({...p,declaredItems:r.declaredItems}))};
 expect(()=>parseDraft(encodeDraft({version:1,name:'Test',mode:'rules',pins:[],history:{entries:[]},sheet:corrupted}),catalog)).toThrow();
});
it('allows descriptive clothing and reviewed multi-weapon Arms without parsing names',()=>{
 const s=buy(createSheet(),[{...request('clothes','clothes'),declaredItems:[{id:'coat',name:'Shield-pattern coat',kind:'other',source:[]}]},arms]);
 expect(projectResources(s,wealthy).items).toHaveLength(3);
});
it('invalidates an existing combination only when its target composition changes',()=>{
 const s=buy(createSheet(),[arms,mod('one'),mod('two')]);
 expect(stale(s,'two')).toBe(false);
 const unrelated=buy(s,[request('clothes','clothes'),mod('other','b')]);
 expect(stale(unrelated,'two')).toBe(false);
 const changed=buy(unrelated,[mod('three')]);
 expect(stale(changed,'two')).toBe(true);
 expect(stale(changed,'three')).toBe(false);
 expect(stale(refundResource(changed,'three').sheet,'two')).toBe(false);
 expect(stale(refundResource(changed,'one').sheet,'two')).toBe(true);
 expect(changed.resourcePurchases!.find(p=>p.id==='two')!.originalPaidRps).toBe(4);
});
it('ignores ledger ordering but detects edited declarations and preserves historical review text',()=>{
 const s=buy(createSheet(),[arms,mod('one'),mod('two')]);
 expect(stale({...s,resourcePurchases:[...s.resourcePurchases!].reverse()},'two')).toBe(false);
 const edited={...s,resourcePurchases:s.resourcePurchases!.map(p=>p.id==='arms'?{...p,declaredItems:p.declaredItems.map(i=>i.id==='a'?{...i,name:'Different axe'}:i)}:p)};
 expect(stale(edited,'two')).toBe(true);
 expect(edited.resourcePurchases![2].provenance.reviews).toEqual(s.resourcePurchases![2].provenance.reviews);
});
it('keeps shield inclusion explicit and armor declarations tied to their paid quality',()=>{
 const armor:ResourceRequest=request('armor','gambeson',{kind:'armor',quality:'run-of-the-mill',piece:'helmet',substitutions:[],selectedIncludedDefinitionIds:['human.resource.shield-in-kit']});
 const s=buy(createSheet(),[{...armor,declaredItems:[{id:'helmet',name:'Helmet',kind:'armor',source:[]}]}]);
 expect(s.resourcePurchases).toHaveLength(2);
 expect(s.resourcePurchases![0].declaredItems[0].quality).toBe('run-of-the-mill');
 const child=s.resourcePurchases![1];
 expect(quoteResource(s,wealthy,{...child,declaredItems:[{id:'shield',name:'Shield',kind:'shield',source:[]}]}).status).toBe('available');
 for(const item of [{id:'x',name:'Axe',kind:'weapon' as const,source:[]},{id:'x',name:'Helmet',kind:'armor' as const,quality:'superior' as const,source:[]}])expect(buyResources(createSheet(),wealthy,[{...armor,declaredItems:[item]}],'rules').error).toBeTruthy();
 expect(quoteResource(createSheet(),wealthy,{...request('c','clothes'),declaredItems:[{id:'coat',name:'Coat',kind:'other',weaponKind:'axe',source:[]}]}).status).toBe('unavailable');
});
it('round trips scoped reviews; old unscoped reviews remain recorded but need renewed assessment',()=>{
 const s=buy(createSheet(),[arms,mod('one'),mod('two')]);
 const draft={version:1 as const,name:'Test',mode:'rules' as const,pins:[],history:{entries:[]},sheet:s};
 const loaded=parseDraft(encodeDraft(draft),catalog).sheet;
 expect(stale(loaded,'two')).toBe(false);
 const legacy={...loaded,resourcePurchases:loaded.resourcePurchases!.map(p=>({...p,provenance:{...p.provenance,reviewContext:'legacy unscoped context'}}))};
 expect(stale(legacy,'two')).toBe(true);
 expect(legacy.resourcePurchases![2].originalPaidRps).toBe(4);
 const otherAxe={...s,resourcePurchases:s.resourcePurchases!.map(p=>p.id==='arms'?{...p,declaredItems:p.declaredItems.map(i=>i.id==='b'?{...i,name:'Renamed other axe'}:i)}:p)};
 expect(stale(otherAxe,'two')).toBe(false);
});
