import { expect, it } from 'vitest';
import vectors from '../fixtures/resources/m3-a2-vectors.json';
import { catalog, progress, request } from '../helpers/resource-engine';
import { createSheet, parseDraft, encodeDraft } from '../../src/character/workbench';
import type { Draft, Sheet } from '../../src/character/workbench';
import { buyResources, refundResource } from '../../src/character/resources';
import { purchaseTrait, refundTrait } from '../../src/character/traits';
import { projectResources, resourceBudget } from '../../src/rules/resources';
const fixture=vectors.outlawFunding;
const p=progress('human.city-dweller.city-born','human.peasant.born-peasant');
const city='human.city-dweller.city-born#1',peasant='human.peasant.born-peasant#1';
const poolId=(alias:string)=>alias==='city-source'?city:peasant;
const funding=fixture.initialFunding.map(f=>({...f,poolId:poolId(f.poolId),origin:{...f.origin,kind:'lifepath' as const}}));
const paid=(s:Sheet=createSheet())=>{
  const result=buyResources(s,p,[{...request('kit','skill-toolkit',{kind:'skill-kit',skillId:'farming',description:'Tools'}),funding}],'rules');
  expect(result.error).toBeUndefined();return result.sheet;
};
const outlaw=(s:Sheet)=>{const result=purchaseTrait(s,p,'outlaw',{kind:'catalog'},'free');expect(result.error).toBeUndefined();return result.sheet;};
const access=(s:Sheet,id=city)=>projectResources(s,p).fundingAccess.find(a=>a.poolId===id)!.access;
const assertHistory=(s:Sheet)=>{
  expect(s.resourcePurchases![0].originalPaidRps).toBe(8);expect(s.resourcePurchases![0].provenance.funding).toEqual(funding);
  expect(s.resourcePurchases![0].provenance.funding.every(f=>!('access' in f))).toBe(true);
};
const asDraft=(sheet:Sheet):Draft=>({version:1,name:'Outlaw',mode:'rules',history:{entries:p.paths.map(path=>({kind:'lifepath',id:path.variantId,overrides:[]}))},sheet,pins:[]});
it(fixture.scenarios[0].name,()=>{
  let s=paid();
  for(const step of fixture.scenarios[0].steps!){
    if(step.event==='acquire-outlaw')s=outlaw(s);if(step.event==='refund-outlaw')s=refundTrait(s,'outlaw');
    expect(access(s)).toBe(step.expectedAccess['city-source']);expect(access(s,peasant)).toBe(step.expectedAccess['peasant-source']);assertHistory(s);
  }
});
it(fixture.scenarios[1].name,()=>{
  const s=paid(outlaw(createSheet()));expect(access(s)).toBe(fixture.scenarios[1].expectedAccessBeforeTraitRefund);
  expect(access(refundTrait(s,'outlaw'))).toBe(fixture.scenarios[1].expectedAccessAfterTraitRefund);assertHistory(s);
});
it(fixture.scenarios[2].name,()=>{
  for(const active of [true,false]){
    const start=active?outlaw(createSheet()):createSheet();
    const result=buyResources(start,p,[{...request('mount','riding-mount'),funding:[funding[0]]}],'rules');expect(result.error).toBeUndefined();
    const before=resourceBudget(result.sheet,p).pools.find(x=>x.id===city)!.remainingRps;
    const refunded=refundResource(result.sheet,'mount');expect(refunded.refundedRps).toBe(fixture.scenarios[2].expectedRefundRps);
    expect(refunded.funding[0]).toEqual(funding[0]);
    expect(resourceBudget(refunded.sheet,p).pools.find(x=>x.id===city)!.remainingRps-before).toBe(5);
    expect(access(refunded.sheet)).toBe(active?fixture.scenarios[2].expectedAccessWithOutlaw:fixture.scenarios[2].expectedAccessWithoutOutlaw);
  }
});
it(fixture.scenarios[3].name,()=>{
  const original=paid(),active=outlaw(original),removed=refundTrait(active,'outlaw');
  const snapshots=[active,removed,active,removed]; // Same immutable Sheet snapshots used by App Undo/Redo.
  snapshots.forEach((s,i)=>{
    const json=JSON.parse(encodeDraft(asDraft(s)));json.sheet.resourceProjection={fundingAccess:[{poolId:city,access:'restricted'}]};json.sheet.resourcePurchases[0].provenance.funding[0].access='restricted';
    const restored=parseDraft(JSON.stringify(json),catalog).sheet;
    expect(access(restored)).toBe(fixture.scenarios[3].expectedCityAccessByStep![i]);assertHistory(restored);
  });
});
it(fixture.scenarios[4].name,()=>{
  const s=refundTrait(paid(outlaw(createSheet())),'outlaw');
  const result=projectResources(s,p,{accessConditions:[{poolId:city,code:'synthetic-review',message:fixture.scenarios[4].otherCondition!,access:'unresolved'}]});
  expect(result.fundingAccess.find(a=>a.poolId===city)?.access).toBe(fixture.scenarios[4].expectedAccessAfterTraitRefund);assertHistory(s);
});
it('marks restricted qualifying assets unresolved instead of silently approving starting abilities',()=>{
  const start=outlaw(createSheet());
  const result=buyResources(start,p,[{...request('rent','rent'),funding:[funding[0]]}],'rules');expect(result.error).toBeUndefined();
  expect(projectResources(result.sheet,p).calculationStatus).toEqual({resources:'unresolved',circles:'unresolved'});
  expect(projectResources(result.sheet,p).diagnostics.some(d=>d.questionId==='outlaw-pools')).toBe(true);
  const removed=projectResources(refundTrait(result.sheet,'outlaw'),p);expect(removed.calculationStatus?.resources).toBe('known');
});
it('keeps granted Outlaw reputation separate from paid social limits and Resources',()=>{
  const projection=projectResources(outlaw(createSheet()),p);expect(projection.socialBonuses).toMatchObject([{traitId:'outlaw',dice:1}]);expect(projection.spentRps).toBe(0);expect(projection.qualifyingSpend.resourcesRps).toBe(0);
});
