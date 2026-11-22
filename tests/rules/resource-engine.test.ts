import { describe, expect, it } from 'vitest';
import vectors from '../fixtures/resources/m3-a2-vectors.json';
import prices from '../fixtures/resources/purchases.json';
import { createSheet } from '../../src/character/workbench';
import type { ResourceConfiguration } from '../../src/character/resource-contracts';
import { resourceBudget, quoteResource, startingResourceAbilities, projectResources } from '../../src/rules/resources';
import { buyResources, refundResource } from '../../src/character/resources';

import { progress, peasant, request } from '../helpers/resource-engine';

describe('budget',()=>{
  it.each(vectors.repeatGrants)('repeat $occurrence grants $expectedRps',v=>{
    const p=progress(...Array(v.occurrence).fill('human.city-dweller.city-born'));
    expect(resourceBudget(createSheet(),{...p,paths:p.paths.map(path=>({...path,resourceGrant:{kind:'fixed',amount:v.printedRps}}))}).pools.at(-1)?.grantedRps).toBe(v.expectedRps);
  });
  it('preserves Wife incompleteness',()=>{
    const p=progress('human.peasant.born-peasant','human.peasant.country-wife');
    expect(resourceBudget(createSheet(),p).total.kind).toBe('incomplete');
  });
});

describe('quotation',()=>{
  const qualities=['poor','run-of-the-mill','superior'] as const;
  it.each(prices.missiles)('missile %s',(...row)=>{
    qualities.forEach((quality,i)=>expect(quoteResource(createSheet(),peasant,request('x',String(row[0]),{kind:'quality',quality,description:''})).cost).toEqual({kind:'known',rps:row[i+1]}));
  });
  it.each(prices.armor)('armor %s',(...row)=>{
    qualities.forEach((quality,i)=>expect(quoteResource(createSheet(),peasant,request('x',String(row[0]),{kind:'armor',quality,piece:'suit',selectedIncludedDefinitionIds:[],substitutions:[]})).cost).toEqual({kind:'known',rps:row[i+1]}));
    for(const [piece,i] of [['helmet',4],['breastplate',4],['greaves',5],['leggings',5]] as const)
      expect(quoteResource(createSheet(),peasant,request('x',String(row[0]),{kind:'armor',quality:'run-of-the-mill',piece,selectedIncludedDefinitionIds:[],substitutions:[]})).cost).toEqual({kind:'known',rps:row[i]});
  });
  it.each(vectors.relationships.filter(v=>v.significance))('relationship $significance $modifiers',v=>{
    const m=v.modifiers!;
    const c:ResourceConfiguration={kind:'relationship',name:'A tie',description:'Free text',npcName:'Someone',significance:v.significance as 'minor'|'significant'|'powerful',family:m.includes('immediate-family')?'immediate':m.includes('other-family')?'other':'none',romantic:m.includes('romantic'),forbidden:m.includes('forbidden'),hateful:m.includes('hateful'),additionalConditions:''};
    expect(quoteResource(createSheet(),peasant,request('tie','relationship',c)).cost).toEqual({kind:'known',rps:v.expectedRps});
  });
  it('does not price unknown armor at zero or accept it in Rules',()=>{
    const s=createSheet();const r=request('a','light-mail',{kind:'armor',quality:'superior',piece:'helmet',selectedIncludedDefinitionIds:[],substitutions:[]});
    expect(quoteResource(s,peasant,r).cost.kind).toBe('unknown');
    expect(buyResources(s,peasant,[r],'rules').sheet).toBe(s);
  });
});

describe('starting abilities from independent M3-A1 vectors',()=>{
  it.each(vectors.resources)('Resources $qualifyingRps / round $roundUp',v=>{
    const result=startingResourceAbilities(v.qualifyingRps,{kind:'known',rps:0},{exponent:4,shade:'B'},{roundUpResources:v.roundUp,grayResources:{requested:!!v.grayApproved,gmPermissionRecorded:!!v.grayApproved}},{kind:'known',rps:100},v.qualifyingRps);
    expect(result.startingResources.ability).toEqual({exponent:v.expectedExponent,shade:v.expectedShade??'B'});
  });
  it.each(vectors.circles)('Circles Will $will / spend $propertyAndRelationshipRps',v=>{
    const result=startingResourceAbilities(0,{kind:'known',rps:v.propertyAndRelationshipRps},v.will===null?null:{exponent:v.will,shade:v.shade as 'B'|'G'}, {roundUpResources:false,grayResources:{requested:false,gmPermissionRecorded:false}},{kind:'known',rps:100},0);
    expect(result.startingCircles.ability).toEqual(v.will===null?null:{exponent:v.expectedExponent,shade:v.expectedShade});
  });
  it.each(vectors.soCloseDiagnostic)('So Close eligibility $qualifyingRps/$budgetRps/$spentRps',v=>{
    const result=startingResourceAbilities(v.qualifyingRps,{kind:'known',rps:0},null,{roundUpResources:true,grayResources:{requested:false,gmPermissionRecorded:false}},v.budgetRps===null?{kind:'incomplete',knownRps:14,unresolvedIds:['wife-grants']}:{kind:'known',rps:v.budgetRps},v.spentRps);
    expect(result.startingResources.rawSoCloseEligible).toBe(v.rawEligible);
  });
});

describe('purchase ledger',()=>{
  it('buys two mounts independently and refunds exactly one',()=>{
    const s=createSheet();const result=buyResources(s,peasant,[request('horse-a','riding-mount'),request('horse-b','riding-mount')],'rules');
    expect(result.error).toBeUndefined();expect(projectResources(result.sheet,peasant).spentRps).toBe(10);
    const refunded=refundResource(result.sheet,'horse-a');
    expect(refunded.refundedRps).toBe(5);expect(refunded.sheet.resourcePurchases?.map(x=>x.id)).toEqual(['horse-b']);
  });
  it('rejects an unaffordable batch atomically',()=>{
    const s=createSheet();const result=buyResources(s,progress('human.peasant.born-peasant'),[request('ok','clothes'),request('too-much','warhorse')],'rules');
    expect(result.error).toBeTruthy();expect(result.sheet).toBe(s);
  });
});
