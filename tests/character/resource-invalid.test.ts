import { expect, it } from 'vitest';
import { createSheet, encodeDraft, parseDraft } from '../../src/character/workbench';
import { buyResources } from '../../src/character/resources';
import { catalog, wealthy, request, reviews } from '../helpers/resource-engine';
import type { ResourceRequest } from '../../src/rules/resource-types';
import type { Draft } from '../../src/character/workbench';
const valid=()=>{
  const paid=buyResources(createSheet(),wealthy,[request('mount','riding-mount')],'rules');expect(paid.error).toBeUndefined();
  const draft:Draft={version:1,name:'Test',mode:'rules',history:{entries:wealthy.paths.map(p=>({kind:'lifepath',id:p.variantId,overrides:[]}))},sheet:paid.sheet,pins:[]};return JSON.parse(encodeDraft(draft));
};
it.each([
  ['negative price',(d:any)=>{d.sheet.resourcePurchases[0].originalPaidRps=-1;}],
  ['fractional price',(d:any)=>{d.sheet.resourcePurchases[0].originalPaidRps=1.5;}],
  ['funding sum',(d:any)=>{d.sheet.resourcePurchases[0].provenance.funding[0].paidRps=4;}],
  ['unknown catalog ID',(d:any)=>{d.sheet.resourcePurchases[0].definitionId='unknown';}],
  ['duplicate purchase ID',(d:any)=>{d.sheet.resourcePurchases.push(structuredClone(d.sheet.resourcePurchases[0]));}],
  ['missing source',(d:any)=>{delete d.sheet.resourcePurchases[0].provenance;}],
  ['mismatched config',(d:any)=>{d.sheet.resourcePurchases[0].configuration={kind:'quality',quality:'superior',description:''};}],
  ['dangling parent',(d:any)=>{d.sheet.resourcePurchases[0].links.parentPurchaseId='missing';}],
  ['dangling target',(d:any)=>{d.sheet.resourcePurchases[0].links.targetItemId='missing';}],
  ['cycle',(d:any)=>{d.sheet.resourcePurchases[0].links.parentPurchaseId='mount';}],
  ['unknown source path',(d:any)=>{d.sheet.resourcePurchases[0].provenance.funding[0].origin.variantId='unknown';}],
  ['forged funding ID',(d:any)=>{d.sheet.resourcePurchases[0].provenance.funding[0].poolId='different';}],
  ['duplicate pool',(d:any)=>{d.sheet.resourcePurchases[0].provenance.funding.push(structuredClone(d.sheet.resourcePurchases[0].provenance.funding[0]));}],
  ['unexplained override',(d:any)=>{d.sheet.resourcePurchases[0].provenance.origin='free-creation';}],
  ['bad choice',(d:any)=>{d.sheet.resourceChoices={roundUpResources:'yes'};}],
  ['bad budget override',(d:any)=>{d.sheet.resourceBudgetOverrides=[{id:'bad',rps:10}];}],
] as const)('rejects imported %s',(name,mutate)=>{const d=valid();mutate(d);expect(()=>parseDraft(JSON.stringify(d),catalog),name).toThrow();});
it.each([
  {configuration:{kind:'relationship',name:'missing mechanics'}},
  {configuration:{kind:'plain',description:4}},
  {funding:[{poolId:'x',paidRps:-5,origin:{kind:'override',reason:'bad'}}]},
  {override:{paidRps:-1,reason:'bad'}},
  {override:{paidRps:1,reason:''}},
  {declaredItems:[{id:'x',name:'axe',kind:'weapon',quality:'legendary',source:[]}]},
  {links:{targetItemId:'missing'}},
])('rejects malformed command atomically even in Free Creation %#',patch=>{
  const s=createSheet();const r={...request('bad','riding-mount'),...patch} as unknown as ResourceRequest;
  expect(buyResources(s,wealthy,[request('good','clothes'),r],'free').sheet).toBe(s);
});
it('rejects item identity collisions and quality spoofing in one atomic batch',()=>{
  const s=createSheet();const r:ResourceRequest={...request('arms','arms',{kind:'quality',quality:'superior',description:''}),reviews,declaredItems:[{id:'axe',name:'Axe',kind:'weapon',weaponKind:'axe',source:[]}]};
  expect(buyResources(s,wealthy,[r,{...r,id:'other'}],'rules').sheet).toBe(s);
  expect(buyResources(s,wealthy,[{...r,declaredItems:[{...r.declaredItems![0],quality:'poor'}]}],'rules').sheet).toBe(s);
});
it('quotation reports insufficient confirmed funds before executing the command',async()=>{
  const {quoteResource}=await import('../../src/rules/resources');
  const {progress}=await import('../helpers/resource-engine');
  const q=quoteResource(createSheet(),progress('human.peasant.born-peasant'),request('horse','riding-mount'));
  expect(q.status).toBe('unavailable');expect(q.diagnostics.some(d=>d.code==='insufficient-funds')).toBe(true);
});
it('does not let a review note replace missing companion evidence',async()=>{
  const {quoteResource}=await import('../../src/rules/resources');
  const r={...request('comp','companion',{kind:'companion',name:'Guard',description:'',npcName:'Guard',linkedCharacterId:'npc'}),reviews:[{questionId:'companion-character',explanation:'Trust me'},{questionId:'companion-limits',explanation:'Trust me'}]};
  expect(quoteResource(createSheet(),wealthy,r).status).toBe('review');
  expect(buyResources(createSheet(),wealthy,[r],'rules').error).toBeTruthy();
});
it('refusing an isolated included-child refund leaves parent selection intact',async()=>{
  const {refundResource}=await import('../../src/character/resources');
  const r=request('armor','gambeson',{kind:'armor',piece:'suit',quality:'run-of-the-mill',selectedIncludedDefinitionIds:['human.resource.shield-in-kit'],substitutions:[]});
  const result=buyResources(createSheet(),wealthy,[r],'rules');expect(result.error).toBeUndefined();
  const refund=refundResource(result.sheet,result.sheet.resourcePurchases![1].id);
  expect(refund.sheet).toBe(result.sheet);expect(refund.error).toBeTruthy();
});
it('import discards cached projections rather than reserializing a second source of truth',()=>{
  const d=valid();d.sheet.resourceProjection={budget:999,startingResources:99};
  expect(parseDraft(JSON.stringify(d),catalog).sheet).not.toHaveProperty('resourceProjection');
});
it('rejects nonnumeric companion facts instead of passing comparisons accidentally',async()=>{
  const {quoteResource}=await import('../../src/rules/resources');
  const r=request('comp','companion',{kind:'companion',name:'Guard',description:'',npcName:'Guard',linkedCharacterId:'npc'});
  expect(quoteResource(createSheet(),wealthy,r,{campaignLifepathLimit:NaN,campaignExponentCap:6,companions:{npc:{complete:true,lifepathCount:2,highestExponent:5,reciprocalRelationshipRps:10,ownGearPaid:true}}}).status).toBe('unavailable');
});
it('does not certify unimplemented armor substitutions from a generic review note',async()=>{
  const {quoteResource}=await import('../../src/rules/resources');
  const r={...request('armor','gambeson',{kind:'armor',piece:'suit',quality:'run-of-the-mill',selectedIncludedDefinitionIds:[],substitutions:[{itemId:'chest',armorDefinitionId:'human.resource.full-plated-mail',note:'Replacement'}]}),reviews:[{questionId:'armor-half-pieces',explanation:'Accept this'}]};
  expect(quoteResource(createSheet(),wealthy,r).status).toBe('review');
  expect(buyResources(createSheet(),wealthy,[r],'rules').error).toBeTruthy();
});
