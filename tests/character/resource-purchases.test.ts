import { describe, expect, it } from 'vitest';
import { createSheet, deriveSheet, encodeDraft, parseDraft, buySkill } from '../../src/character/workbench';
import type { Draft, Sheet } from '../../src/character/workbench';
import { buyResources, refundResource, setResourceChoices, setResourceBudgetOverrides, resetResources, describeResource } from '../../src/character/resources';
import { quoteResource, projectResources, resourceBudget, resourceCatalog, resourceReviewContext } from '../../src/rules/resources';
import { catalog, peasant, progress, request, reviews, wealthy, social, relationship } from '../helpers/resource-engine';
import type { ResourceRequest } from '../../src/rules/resource-types';
import vectors from '../fixtures/resources/m3-a2-vectors.json';
import prices from '../fixtures/resources/purchases.json';
import spells from '../fixtures/resources/spells.json';

const buy=(s:Sheet,rs:ResourceRequest[])=>{
  const result=buyResources(s,wealthy,rs,'rules');expect(result.error).toBeUndefined();return result.sheet;
};
const arms=():ResourceRequest=>({...request('arms','arms',{kind:'quality',quality:'superior',description:'Soldier’s arms'}),reviews,declaredItems:[{id:'axe-a',name:'First axe',kind:'weapon',weaponKind:'axe',source:[]},{id:'axe-b',name:'Second axe',kind:'weapon',weaponKind:'axe',source:[]},{id:'dagger-c',name:'Dagger',kind:'weapon',weaponKind:'other',source:[]}]});
const mod=(id:string,item:string,definition='beak'):ResourceRequest=>({...request(id,definition,{kind:'addition',description:''}),links:{parentPurchaseId:'arms',targetItemId:item}});
const gang=():ResourceRequest[]=>[
  {...request('senior','relationship',relationship),links:{groupPurchaseId:'gang'}},
  {...request('aff','affiliation',social('affiliation',1,'crew')),reviews,links:{groupPurchaseId:'gang'}},
  {...request('rep','reputation',social('reputation',1,'crew')),reviews,links:{groupPurchaseId:'gang'}},
  request('gang','gang-or-crew',{kind:'gang',organizationId:'crew',seniorRelationshipPurchaseId:'senior',affiliationPurchaseId:'aff',reputationPurchaseId:'rep'}),
];
const draft=(sheet:Sheet):Draft=>({version:1,name:'Test',mode:'rules',history:{entries:wealthy.paths.map(p=>({kind:'lifepath',id:p.variantId,overrides:[]}))},sheet,pins:[]});

describe('composites and exact reversal',()=>{
  it('executes the superior Arms fixture with three independent physical identities',()=>{
    const v=vectors.bundles.find(v=>v.kind==='arms')!;
    const s=buy(createSheet(),[arms(),mod('beak','axe-a'),mod('weight','axe-b','weighted-pommel')]);
    const p=projectResources(s,wealthy);expect(p.spentRps).toBe(v.expectedTotal);
    expect(p.items.find(i=>i.id===v.unmodifiedItem)?.modificationPurchaseIds).toEqual([]);
    expect(p.items.find(i=>i.id==='axe-a')?.modificationPurchaseIds).toEqual(['beak']);
    expect(p.items.find(i=>i.id==='axe-b')?.modificationPurchaseIds).toEqual(['weight']);
    const refunded=refundResource(s,'beak');expect(refunded.refundedRps).toBe(v.refundBeakRps);
    expect(projectResources(refunded.sheet,wealthy).items.find(i=>i.id==='axe-b')?.modificationPurchaseIds).toEqual(['weight']);
    expect(refundResource(s,'arms').refundedRps).toBe(v.expectedTotal);
    expect(refundResource(s,'arms').sheet.resourcePurchases).toEqual([]);
  });
  it('rejects incompatible beak and ambiguous unreviewed stacking without changing either axe',()=>{
    const s=buy(createSheet(),[arms(),mod('beak','axe-a')]);
    expect(buyResources(s,wealthy,[mod('bad','dagger-c')],'rules').sheet).toBe(s);
    const stacked=mod('weight','axe-a','weighted-pommel');
    expect(quoteResource(s,wealthy,stacked).status).toBe('review');
    expect(buyResources(s,wealthy,[stacked],'rules').sheet).toBe(s);
    expect(buyResources(s,wealthy,[{...stacked,reviews:[{questionId:'weapon-modification-stacking',explanation:'Table assessed this combination.'}]}],'rules').error).toBeUndefined();
  });
  it('executes gang fixture with zero parent debit and atomic group refund',()=>{
    const v=vectors.bundles.find(v=>v.kind==='gang')!;const s=buy(createSheet(),gang());
    const p=projectResources(s,wealthy);expect(p.spentRps).toBe(v.expectedTotal);
    expect(p.qualifyingSpend).toEqual({resourcesRps:v.resourcesQualifyingRps,circlesRps:{kind:'known',rps:v.circlesQualifyingRps}});
    expect(s.resourcePurchases?.find(x=>x.id==='gang')?.originalPaidRps).toBe(v.parentDebit);
    for(const id of ['gang','senior','aff','rep']){
      const refunded=refundResource(s,id);expect(refunded.refundedRps).toBe(v.expectedTotal);expect(refunded.sheet.resourcePurchases).toEqual([]);
    }
  });
  it('rejects incomplete groups and duplicate ownership atomically',()=>{
    const s=createSheet();expect(buyResources(s,wealthy,gang().slice(0,3),'rules').sheet).toBe(s);
    expect(buyResources(s,wealthy,[...gang(),request('other','gang-or-crew',{kind:'gang',organizationId:'crew',seniorRelationshipPurchaseId:'senior',affiliationPurchaseId:'aff',reputationPurchaseId:'rep'})],'rules').sheet).toBe(s);
  });
  it.each(['suit','helmet'] as const)('creates a shield only by explicit selection for %s',piece=>{
    const r=request('armor','gambeson',{kind:'armor',piece,quality:'run-of-the-mill',selectedIncludedDefinitionIds:[],substitutions:[]});
    const no=buy(createSheet(),[r]);expect(no.resourcePurchases).toHaveLength(1);
    const yes=buy(createSheet(),[{...r,configuration:{...r.configuration,kind:'armor',piece,quality:'run-of-the-mill',selectedIncludedDefinitionIds:['human.resource.shield-in-kit'],substitutions:[]}}]);
    expect(yes.resourcePurchases).toHaveLength(2);expect(yes.resourcePurchases?.[1].originalPaidRps).toBe(0);
    expect(projectResources(yes,wealthy).spentRps).toBe(projectResources(no,wealthy).spentRps);
    expect(refundResource(yes,'armor').sheet.resourcePurchases).toEqual([]);
  });
  it('rejects a free shield without an explicitly selecting parent',()=>{
    const s=createSheet();expect(buyResources(s,wealthy,[request('shield','shield-in-kit')],'rules').sheet).toBe(s);
  });
  it('enforces ammunition parent and charges once per head type, not per missile',()=>{
    const bow=request('bow','hunting-bow',{kind:'quality',quality:'poor',description:''});
    const head={...request('head','bodkin-head',{kind:'addition' as const,description:'As many arrows as appropriate.'}),links:{parentPurchaseId:'bow'}};
    const s=buy(createSheet(),[bow,head]);expect(projectResources(s,wealthy).spentRps).toBe(4);
    expect(refundResource(s,'bow').refundedRps).toBe(4);
    expect(buyResources(createSheet(),wealthy,[head],'rules').error).toBeTruthy();
  });
});

describe('social, property and spell purchases',()=>{
  it.each(['affiliation','reputation'] as const)('caps purchased %s, preserves explicit Free Creation fourth entry',kind=>{
    const s=buy(createSheet(),[1,2,3].map(i=>({...request('social'+i,kind,social(kind,1,'group'+i)),reviews})));
    const r={...request('fourth',kind,social(kind,1,'group4')),reviews};
    expect(buyResources(s,wealthy,[r],'rules').sheet).toBe(s);
    expect(buyResources(s,wealthy,[r],'free').sheet).toBe(s);
    const free=buyResources(s,wealthy,[{...r,override:{paidRps:kind==='affiliation'?10:7,reason:'Campaign exception'}}],'free');
    expect(free.error).toBeUndefined();expect(projectResources(free.sheet,wealthy).diagnostics.some(d=>d.code==='social-limit')).toBe(true);
    expect(free.sheet.resourcePurchases).toHaveLength(4);
  });
  it('keeps narrative changes independent of prices and allows reputation without organization ID',()=>{
    const s=buy(createSheet(),[{...request('rep','reputation',social('reputation')),reviews},request('tie','relationship',relationship)]);
    const edited=describeResource(s,'rep',{name:'Водится со следопытами',description:'Different reactions among locals',audience:'Residents of Bree'}).sheet;
    expect(edited.resourcePurchases?.[0].configuration).not.toHaveProperty('organizationId');
    expect(edited.resourcePurchases?.[0].configuration).not.toHaveProperty('polarity');
    expect(projectResources(edited,wealthy).spentRps).toBe(projectResources(s,wealthy).spentRps);
    expect(edited.resourcePurchases?.[0].originalPaidRps).toBe(7);
  });
  it('keeps confirmed Resources and disputed Circles accounting separate',()=>{
    const s0={...createSheet(),purchases:[{skillId:'animal-husbandry',pool:'general' as const,cost:1,kind:'open' as const,shade:'root' as const,override:false}]};
    const s=buy(s0,[request('work','workshop',{kind:'skill-kit',skillId:'farming',description:''}),request('herd','herd'),request('tie','relationship',{...relationship,kind:'relationship',significance:'significant'})]);
    const p=projectResources(s,wealthy);expect(p.spentRps).toBe(50);expect(p.qualifyingSpend.resourcesRps).toBe(40);
    expect(p.qualifyingSpend.circlesRps).toEqual({kind:'incomplete',knownRps:10,unresolvedIds:['property-circles-inclusion']});
    expect(p.startingCircles.propertyAndRelationshipBonus).toBe('unresolved');
  });
  it('uses actual property spending and generates no staff or social grants',()=>{
    const s=buy(createSheet(),[{...request('farm','farm'),reviews}]);
    const p=projectResources(s,wealthy);expect(p.qualifyingSpend.resourcesRps).toBe(15);expect(p.startingResources.ability.exponent).toBe(1);
    expect(p.socialBonuses).toEqual([]);expect(p.items).toEqual([]);expect(s.resourcePurchases).toHaveLength(1);
  });
  it('reports property eligibility review again when the route changes',()=>{
    const s=buy(createSheet(),[{...request('farm','farm'),reviews}]);
    expect(projectResources(s,peasant).diagnostics.some(d=>d.code==='review-property-threshold'&&d.severity==='error')).toBe(true);
  });
  it('requires Sorcery, retains printed spell prices and loses no transaction when skill is refunded',()=>{
    const r={...request('spell','unused'),definitionId:'human.spell.wyrd-light'};
    expect(buyResources(createSheet(),wealthy,[r],'rules').error).toContain('sorcery');
    let s=createSheet();s={...s,stats:{...s.stats,will:{exponent:4,shade:'B'},perception:{exponent:4,shade:'B'}}};
    s=buySkill(s,wealthy,'sorcery','general','free').sheet;
    const paid=buy(s,[r]);expect(paid.resourcePurchases?.[0].originalPaidRps).toBe(4);
    expect(projectResources({...paid,purchases:[]},wealthy).diagnostics.some(d=>d.code==='required-skill')).toBe(true);
    expect(refundResource({...paid,purchases:[]},'spell').refundedRps).toBe(4);
  });
  it('companion has fixed ten-rp price, validated campaign limits and reciprocal costs',()=>{
    const r=request('comp','companion',{kind:'companion',name:'Bodyguard',description:'Trusted',npcName:'NPC',linkedCharacterId:'npc'});
    const context={campaignLifepathLimit:4,campaignExponentCap:6};
    const q=quoteResource(createSheet(),wealthy,r,context);
    expect(q.cost).toEqual({kind:'known',rps:10});expect(q.companionRequirements).toEqual({maximumLifepaths:2,maximumExponent:5,reciprocalRelationshipRps:10,ownGear:true});
    expect(q.status).toBe('review');
    expect(buyResources(createSheet(),wealthy,[r],'rules',{...context,companions:{npc:{complete:true,lifepathCount:2,highestExponent:5,reciprocalRelationshipRps:10,ownGearPaid:true}}}).error).toBeUndefined();
    expect(buyResources(createSheet(),wealthy,[r],'rules',{...context,companions:{npc:{complete:true,lifepathCount:3,highestExponent:5,reciprocalRelationshipRps:10,ownGearPaid:true}}}).error).toBeTruthy();
  });
  it.each(prices.fixed)('quotes fixed fixture %s',(...row)=>{
    const d=resourceCatalog.get('human.resource.'+row[0])!;
    const r=request('x',String(row[0]),d.configuration==='skill-kit'?{kind:'skill-kit',skillId:'farming',description:''}:undefined);
    expect(quoteResource(createSheet(),wealthy,r).cost).toEqual({kind:'known',rps:row[1]});
  });
  it.each(spells)('quotes printed spell %s',(...row)=>{
    const definition=[...resourceCatalog.values()].find(d=>d.category==='spell'&&d.sourceName===row[0])!;
    expect(quoteResource(createSheet(),wealthy,{...request('x','unused'),definitionId:definition.id}).cost).toEqual({kind:'known',rps:row[1]});
  });
});

describe('changes, overrides and saving',()=>{
  it('returns historical paid rps after a catalog price and route change',()=>{
    const s=buy(createSheet(),[request('mount','riding-mount')]);
    const altered=new Map(resourceCatalog);altered.set('human.resource.riding-mount',{...altered.get('human.resource.riding-mount')!,price:{kind:'fixed',rps:99,basis:'printed'}});
    expect(projectResources(s,progress(),{},altered).diagnostics.some(d=>d.code==='historical-price')).toBe(true);
    expect(refundResource(s,'mount')).toMatchObject({refundedRps:5,funding:s.resourcePurchases![0].provenance.funding});
    expect(deriveSheet(s,progress()).remaining.resources).toBe(-5);
    expect(s.resourcePurchases).toHaveLength(1);
  });
  it('restores legal source access when original paths return, without moving pools',()=>{
    const s=buy(createSheet(),[request('mount','riding-mount')]);const saved=JSON.stringify(s.resourcePurchases);
    expect(projectResources(s,progress()).diagnostics.some(d=>d.code==='missing-funding-source')).toBe(true);
    expect(projectResources(s,wealthy).diagnostics.some(d=>d.code==='missing-funding-source')).toBe(false);
    expect(JSON.stringify(s.resourcePurchases)).toBe(saved);
  });
  it('manual So Close changes only exponent, even with unspent rps; Will changes Circles',()=>{
    const s=buy(createSheet(),[{...request('house','house'),reviews},request('rep','reputation',{...social('reputation'),kind:'reputation',dice:1,name:'Known',description:'Known',scope:'Local',audience:'Neighbors'})].map(r=>({...r,reviews})));
    const before=projectResources(s,wealthy),round=setResourceChoices(s,{roundUpResources:true,grayResources:{requested:false,gmPermissionRecorded:false}}).sheet;
    const after=projectResources(round,wealthy);expect(after.spentRps).toBe(before.spentRps);expect(after.budget).toEqual(before.budget);expect(after.startingResources.ability.exponent).toBe(2);expect(after.startingResources.rawSoCloseEligible).toBe(false);
    const will={...round,stats:{...round.stats,will:{exponent:5,shade:'G' as const}}};expect(projectResources(will,wealthy).startingCircles.ability).toEqual({exponent:2,shade:'G'});
  });
  it('explicit unknown-price override keeps original quote, paid cost and explanation distinct',()=>{
    const r=request('armor','light-mail',{kind:'armor',quality:'poor',piece:'helmet',selectedIncludedDefinitionIds:[],substitutions:[]});
    const s=buyResources(createSheet(),wealthy,[{...r,override:{paidRps:3,reason:'Agreed campaign price'}}],'free').sheet;
    expect(s.resourcePurchases?.[0]).toMatchObject({originalPaidRps:3,provenance:{origin:'free-creation',quotedCost:{kind:'unknown',questionId:'poor-armor-parts'},overrides:[{explanation:'Agreed campaign price'}]}});
    const loaded=parseDraft(encodeDraft({...draft(s),mode:'rules'}),catalog);
    expect(loaded.sheet.resourcePurchases).toEqual(s.resourcePurchases);expect(deriveSheet(loaded.sheet,wealthy).issues.join(' ')).toContain('Price unresolved');
    expect(refundResource(loaded.sheet,'armor').refundedRps).toBe(3);
  });
  it('rejects unrecorded deficits; deliberate Free Creation overspend remains diagnosed',()=>{
    const empty=createSheet(),p=progress('human.peasant.born-peasant'),r=request('mount','riding-mount');
    expect(buyResources(empty,p,[r],'free').sheet).toBe(empty);
    const s=buyResources(empty,p,[{...r,override:{paidRps:5,reason:'Overspend for this draft'}}],'free').sheet;
    expect(projectResources(s,p).diagnostics.some(d=>d.code==='overspent-pool')).toBe(true);expect(refundResource(s,'mount').refundedRps).toBe(5);
  });
  it('supports explained budget sources only via Free Creation and resets just resources',()=>{
    const s=createSheet();expect(setResourceBudgetOverrides(s,[{id:'campaign',rps:10,reason:'Campaign grant'}],'rules').sheet).toBe(s);
    const free=setResourceBudgetOverrides(s,[{id:'campaign',rps:10,reason:'Campaign grant'}],'free').sheet;
    expect(resourceBudget(free,progress()).total).toEqual({kind:'known',rps:10});
    const paid=buyResources(free,progress(),[{...request('m','riding-mount'),override:{paidRps:5,reason:'Free start'}}],'free');expect(paid.error).toBeUndefined();
    expect(resetResources(paid.sheet)).toEqual(s);
  });
  it('imports old M2 and M3-A1 drafts without resource fields',()=>{
    const old=draft(createSheet());expect(parseDraft(JSON.stringify(old),catalog).sheet.resourcePurchases).toBeUndefined();
    expect(projectResources(parseDraft(JSON.stringify(old),catalog).sheet,wealthy).spentRps).toBe(0);
  });
  it('round trips composite ownership, declarations, funding, descriptions and choices',()=>{
    const s=buy(createSheet(),[arms(),mod('beak','axe-a'),...gang()]);
    const loaded=parseDraft(encodeDraft(draft(s)),catalog).sheet;expect(loaded.resourcePurchases).toEqual(s.resourcePurchases);
    expect(refundResource(loaded,'arms').refundedRps).toBe(24);expect(refundResource(loaded,'gang').refundedRps).toBe(22);
  });
  it('requires fresh contextual reviews after relevant source facts change',()=>{
    const s=buy(createSheet(),[arms()]);expect(s.resourcePurchases?.[0].provenance.reviewContext).toBe(resourceReviewContext(createSheet(),wealthy));
    expect(projectResources(s,peasant).diagnostics.some(d=>d.code==='review-arms-composition'&&d.severity==='error')).toBe(true);
  });
});
it('cash grants one die per purchase without increasing starting Resources or Circles',()=>{
  const s=buy(createSheet(),[request('cash1','cash'),request('cash2','cash')]);
  const p=projectResources(s,wealthy);expect(p.cashDice).toBe(2);expect(p.spentRps).toBe(12);expect(p.qualifyingSpend).toEqual({resourcesRps:0,circlesRps:{kind:'known',rps:0}});
  expect(projectResources(refundResource(s,'cash1').sheet,wealthy).cashDice).toBe(1);
});
it('resource repeat identity follows a shared family while funding retains variant visits',()=>{
  const p=progress('human.peasant.conscript','human.villager.conscript','human.peasant.conscript');
  const budget=resourceBudget(createSheet(),p);
  expect(budget.pools.map(p=>p.origin)).toEqual([{kind:'lifepath',variantId:'human.peasant.conscript',occurrence:1},{kind:'lifepath',variantId:'human.villager.conscript',occurrence:1},{kind:'lifepath',variantId:'human.peasant.conscript',occurrence:2}]);
  expect(budget.pools.map(p=>p.grantedRps)).toEqual([4,5,2]);
});
it('preserves the confirmed mixed-armor price example 25 + 8 + 4 + 4 = 41',()=>{
  const rows=[['full-plated-mail','helmet'],['heavy-mail','breastplate'],['light-mail','greaves'],['light-mail','leggings']] as const;
  const s=buy(createSheet(),rows.map(([id,piece],i)=>request('piece'+i,id,{kind:'armor',quality:'run-of-the-mill',piece,selectedIncludedDefinitionIds:[],substitutions:[]})));
  expect(projectResources(s,wealthy).spentRps).toBe(41);
});
it('never doubles the Circles bonus even above 100 qualifying rps',()=>{
  const sheet=buy(createSheet(),[{...request('property','palace'),reviews}]);
  const p=projectResources({...sheet,stats:{...sheet.stats,will:{exponent:5,shade:'G'}}},wealthy);
  expect(p.qualifyingSpend.circlesRps).toEqual({kind:'known',rps:105});expect(p.startingCircles.ability).toEqual({exponent:3,shade:'G'});
});
it('reports an unavailable catalog purchase separately from an unknown price',()=>{
  const testCatalog=new Map(resourceCatalog);const def=testCatalog.get('human.resource.clothes')!;
  testCatalog.set(def.id,{...def,price:{kind:'unavailable',reason:'Synthetic unsupported acquisition route'}});
  const q=quoteResource(createSheet(),wealthy,request('x','clothes'),{},testCatalog);
  expect(q.status).toBe('unavailable');expect(q.cost.kind).toBe('unavailable');
});
it('diagnoses social trait interactions without inventing paid rps or folding dice into Circles',()=>{
  const sheet={...createSheet(),traitPurchases:[{id:'keys-to-the-church',source:{kind:'free' as const,points:1},cost:1,mode:'free' as const}]};
  const p=projectResources(sheet,wealthy);expect(p.spentRps).toBe(0);expect(p.qualifyingSpend.resourcesRps).toBe(0);
  expect(p.diagnostics.some(d=>d.questionId==='social-trait-interactions')).toBe(true);
});
it('enforces confirmed property ineligibility even with a contextual review note',()=>{
  const r={...request('palace','palace'),reviews};
  const p=progress('human.city-dweller.city-born',...Array(40).fill('human.peasant.head-of-household'));
  expect(quoteResource(createSheet(),p,r).diagnostics.some(d=>d.code==='property-eligibility')).toBe(true);
  const rejected=buyResources(createSheet(),p,[r],'rules');expect(rejected.error).toContain('qualifying lifepath');
  expect(quoteResource(createSheet(),wealthy,r).status).toBe('available');
});
