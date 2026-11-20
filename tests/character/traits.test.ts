import { expect, it } from 'vitest';
import { createSheet } from '../../src/character/workbench';
import { purchaseTrait, refundTrait, changeTraitCategory } from '../../src/character/traits';
import { traitState } from '../../src/rules/traits';
import { createCatalog } from '../../src/data/catalog';
import { humanContent } from '../../src/data/human';
import { applyLifepathCommand, projectLifepathHistory, type LifepathHistory } from '../../src/character/lifepath-history';

const catalog = createCatalog(humanContent);
const route = (...names: string[]) => projectLifepathHistory(names.reduce<LifepathHistory>(
  (history, name) => applyLifepathCommand(history, {kind:'lifepath',id:'human.peasant.' + name}, 'free', catalog),
  {entries: []}), catalog);
const source = {kind:'lifepath', path:'human.peasant.farmer', occurrence:1} as const;
it('keeps access distinct from ownership and refunds the original charge after losing the path', () => {
  const progress = route('born-peasant', 'farmer');
  const empty = createSheet();
  expect(traitState(empty, progress).missing.map(x=>x.id)).toContain('hoarding');
  const bought = purchaseTrait(empty, progress, 'hoarding', source, 'rules');
  expect(bought.error).toBeUndefined();
  expect(traitState(bought.sheet, progress).missing).toHaveLength(0);
  expect(traitState(bought.sheet, route('born-peasant')).issues.join(' ')).toMatch(/source/i);
  expect(refundTrait(bought.sheet, 'hoarding')).toEqual(empty);
});
import { encodeDraft, parseDraft, deriveSheet, skillOpening, skills } from '../../src/character/workbench';
import { traits } from '../../src/data/traits';
import { pathTraitIds } from '../../src/rules/traits';
import { humanBurningLists } from '../../src/data/burning/human';
import type { TraitSource } from '../../src/data/traits/types';

it('resolves every sourced path slot and validates distinct stable IDs and prices', () => {
  expect(traits.size).toBe(700);
  const names=new Set<string>();
  for(const [id,t] of traits){
    expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(names.has(t.name.toLowerCase())).toBe(false);names.add(t.name.toLowerCase());
    expect(t.pages.every(p=>Number.isInteger(p)&&p>0)).toBe(true);
    if(t.catalogAvailable)expect(t.price).toBeGreaterThan(0);
    if(t.price!==null)expect(Number.isInteger(t.price)&&t.price>=1&&t.price<=10).toBe(true);
  }
  for(const path of catalog.lifepaths.keys()){
    expect(humanBurningLists[path]).toBeDefined();
    expect(pathTraitIds(path).every(id=>traits.has(id))).toBe(true);
  }
});
it('skips an earlier optional purchase when determining the second traversal requirement',()=>{
  const first=route('born-peasant','peddler');
  const visit={kind:'lifepath',path:'human.peasant.peddler',occurrence:1} as const;
  let sheet=createSheet();
  for(const id of ['blank-stare','glib']){
    const result=purchaseTrait(sheet,first,id,visit,'rules');expect(result.error).toBeUndefined();sheet=result.sheet;
  }
  const twice=route('born-peasant','peddler','peddler');
  expect(traitState(sheet,twice).missing).toEqual([{id:'eidetic-memory',source:{...visit,occurrence:2}}]);
  const thrice=route('born-peasant','peddler','peddler','peddler');
  expect(traitState(sheet,thrice).total).toBe(traitState(sheet,twice).total);
  expect(traitState(sheet,thrice).missing).toEqual(traitState(sheet,twice).missing);
});
it('charges the selected source and reserves outstanding obligations',()=>{
  const sheet=createSheet(),progress=route('born-peasant','peddler');
  const lp={kind:'lifepath',path:'human.peasant.peddler',occurrence:1} as const;
  expect(purchaseTrait(sheet,progress,'blank-stare',{kind:'catalog'},'rules').error).toMatch(/required/i);
  const list=purchaseTrait(sheet,progress,'blank-stare',lp,'rules').sheet;
  const general=purchaseTrait(sheet,route('born-peasant'),'blank-stare',{kind:'catalog'},'free').sheet;
  expect(list.traitPurchases?.[0].cost).toBe(1);expect(general.traitPurchases?.[0].cost).toBe(3);
  expect(refundTrait(general,'blank-stare')).toEqual(sheet);
  expect(purchaseTrait(list,progress,'blank-stare',lp,'rules').error).toMatch(/owned/i);
  expect(purchaseTrait(sheet,progress,'touch-of-ages',{kind:'catalog'},'rules').error).toMatch(/points/i);
});
it('retains restrictions across free mode, path removal and restoring a draft',()=>{
  const progress=route('born-peasant');
  expect(purchaseTrait(createSheet(),progress,'exile',{kind:'catalog'},'rules').error).toMatch(/restricted/i);
  expect(purchaseTrait(createSheet(),progress,'chosen-one',{kind:'catalog'},'rules').error).toMatch(/requires Faithful/i);
  const free=purchaseTrait(createSheet(),progress,'exile',{kind:'catalog'},'free').sheet;
  expect(traitState(free,progress).issues.join(' ')).toMatch(/restricted/i);
  const draft={version:1 as const,name:'M2',mode:'rules' as const,history:{entries:[]},sheet:free,pins:[]};
  expect(parseDraft(encodeDraft(draft),catalog).sheet.traitPurchases).toEqual(free.traitPurchases);
  const old={...free};delete old.traitPurchases;
  expect(parseDraft(encodeDraft({...draft,sheet:old}),catalog).sheet.traitPurchases).toEqual([]);
  const original=free.traitPurchases![0];
  for(const invalid of [null,{},[null],[original,original],[{...original,cost:0}],[{...original,id:'unknown'}],
    [{...original,id:'lucky',cost:0}],[{...original,source:{kind:'free',points:-1},cost:-1}],[{...original,source:{...source,occurrence:0}}]]){
    expect(()=>parseDraft(JSON.stringify({...draft,sheet:{...free,traitPurchases:invalid}}),catalog)).toThrow();
  }
});
it('records explicitly free Fey Blood choices separately from missing catalog prices',()=>{
  const p=route('born-peasant'),source:TraitSource={kind:'fey'};
  const withFey=purchaseTrait(createSheet(),p,'fey-blood',{kind:'catalog'},'free').sheet;
  const first=purchaseTrait(withFey,{...p,paths:[...p.paths,...route('peddler','peddler','peddler').paths]},'greed',source,'free');
  expect(first.error).toBeUndefined();expect(first.sheet.traitPurchases?.at(-1)?.cost).toBe(0);
  expect(purchaseTrait(first.sheet,p,'bearded',source,'rules').error).toMatch(/one selection/i);
  expect(purchaseTrait(withFey,p,'lucky',{kind:'catalog'},'free').error).toMatch(/price/i);
});
it('recalculates creation effects and removes them on refund',()=>{
  const p={...route('born-peasant'),age:60};
  const before=createSheet();
  const vigor=purchaseTrait(before,p,'vigor-of-youth',{kind:'catalog'},'free').sheet;
  expect(deriveSheet(vigor,p).total).toMatchObject({mental:7,physical:14});
  expect(deriveSheet(refundTrait(vigor,'vigor-of-youth'),p).total).toEqual(deriveSheet(before,p).total);
  const sheet=createSheet();sheet.stats.perception.exponent=5;
  const withAcute=purchaseTrait(sheet,p,'acute',{kind:'free',points:1},'free').sheet;
  const skill=skills.get('observation')!;
  expect(skillOpening(skill,withAcute)?.exponent).toBe(3);expect(skillOpening(skill,sheet)?.exponent).toBe(2);
});

it('charges each additional Low Speech category, including exact refunds and import checks',()=>{
  const progress=route('born-peasant'),catalogSource={kind:'catalog'} as const;
  const original=purchaseTrait(createSheet(),progress,'low-speech',catalogSource,'free').sheet;
  let s=changeTraitCategory(original,progress,'low-speech','Birds','rules').sheet;
  expect(s.traitPurchases![0].cost).toBe(3);
  expect(changeTraitCategory(s,progress,'low-speech','Fish','rules').error).toMatch(/points/i);
  s=changeTraitCategory(s,progress,'low-speech','Fish','free').sheet;
  expect(s.traitPurchases![0].cost).toBe(4);
  const draft={version:1,name:'',history:{entries:[]},mode:'free',pins:[],sheet:s};
  expect(parseDraft(JSON.stringify(draft),catalog).sheet.traitPurchases).toEqual(s.traitPurchases);
  expect(()=>parseDraft(JSON.stringify({...draft,sheet:{...s,traitPurchases:[{...s.traitPurchases![0],categories:['Fish','Fish']}]}}),catalog)).toThrow();
  expect(changeTraitCategory(s,progress,'low-speech','Fish','rules').sheet.traitPurchases![0].cost).toBe(3);
  expect(refundTrait(s,'low-speech').traitPurchases).toEqual([]);
});
it('transfers precisely one point in the selected direction and removes the choice on refund',()=>{
  const p=route('born-peasant');
  for(const [id,delta] of [['robust',-1],['mind-over-matter',1]] as const){
    const owned=purchaseTrait(createSheet(),p,id,{kind:'catalog'},'free').sheet;
    const before=deriveSheet(owned,p).total;
    const chosen={...owned,choices:{['trait:'+id]:'transfer'}};
    expect(deriveSheet(chosen,p).total).toMatchObject({mental:before.mental+delta,physical:before.physical-delta});
    expect(refundTrait(chosen,id)).toEqual(createSheet());
  }
});
it('grants the stock suite once for a Born path and checks final history restrictions',()=>{
  const p=route('born-peasant');
  const elf={...p,paths:p.paths.map(path=>({...path,stockId:'elf'}))};
  const state=traitState(createSheet(),elf);
  expect(state.common).toHaveLength(6);expect(state.owned.has('first-born')).toBe(true);
  expect(state.remaining).toBe(state.total);
  const child=purchaseTrait(createSheet(),p,'child-prodigy',{kind:'catalog'},'free').sheet;
  expect(traitState(child,route('born-peasant','farmer','peddler')).issues.join(' ')).toMatch(/at most 2 lifepaths/i);
});

it('classifies six descriptive traits without adding mechanical review items',()=>{
  const progress=route('born-peasant');
  for(const id of ['flee-from-battle','handicapped','lugubrious','many-colored-hands','pragmatic','breeder']){
    const t=traits.get(id)!;
    expect(t.type).toBe('character');
    expect(t.effect).toBe('play');
    if(id!=='breeder')expect(t.price).toBeNull();
    const bought=purchaseTrait(createSheet(),progress,id,{kind:'free',points:1},'free');
    expect(bought.error).toBeUndefined();
    expect(traitState(bought.sheet,progress).issues.filter(x=>x.startsWith(t.name+':'))).toEqual([
      t.name+': Explicit Free Creation price.',t.name+': acquired in Free Creation; review recorded source.'
    ]);
  }
  expect(traits.get('pragmatic-outlook')?.name).toBe('Pragmatic Outlook');
});
it('applies Breeder and Tough exceptions without changing other stock access',()=>{
  const base=route('born-peasant');
  const withStock=(stockId:string)=>({...base,paths:base.paths.map(p=>({...p,stockId,traitPointGrant:4}))});
  const general={kind:'catalog'} as const;
  const sheet=createSheet();
  for(const stock of ['human','orc']){
    const progress=withStock(stock);
    expect(traitState(sheet,progress).owned.has('breeder')).toBe(false);
    const bought=purchaseTrait(sheet,progress,'breeder',general,'rules');
    expect(bought.sheet.traitPurchases?.[0]?.cost).toBe(1);
    expect(traits.get('breeder')?.priceOrigin).toBe('project');
  }
  const dwarf=withStock('dwarf'),human=withStock('human');
  expect(traitState(sheet,dwarf).common.filter(t=>t.id==='tough')).toHaveLength(1);
  expect(traitState(sheet,dwarf).remaining).toBe(4);
  expect(purchaseTrait(sheet,dwarf,'tough',general,'rules').error).toMatch(/owned/i);
  const bought=purchaseTrait(sheet,human,'tough',general,'rules');
  expect(bought.sheet.traitPurchases?.[0]?.cost).toBe(2);
  expect(refundTrait(bought.sheet,'tough')).toEqual(sheet);
  expect(purchaseTrait(sheet,human,'bearded',general,'rules').error).toBeTruthy();
  expect(purchaseTrait(sheet,human,'black-lung',general,'rules').error).toMatch(/price/i);
  expect(traits.get('black-lung')).toMatchObject({type:'die',price:null});
});
it('charges the lifepath price for Tough when the source lists it',()=>{
  const progress=route('born-peasant','farmer');
  // The printed p. 181 path is outside the pilot. Supply its ordered trait slots
  // to this fixture so the production source lookup and purchase both run.
  const lists={...humanBurningLists};
  const path=source.path;
  const original=lists[path];
  try {
    Object.assign(humanBurningLists,{[path]:{...original,traits:['Pragmatic','Tough','Determined']}});
    const first=purchaseTrait(createSheet(),progress,'pragmatic',source,'rules');
    const second=purchaseTrait(first.sheet,progress,'tough',source,'rules');
    expect(second.error).toBeUndefined();
    expect(second.sheet.traitPurchases?.at(-1)).toMatchObject({id:'tough',source,cost:1});
  } finally {Object.assign(humanBurningLists,{[path]:original});}
});

it('retains a legacy Fey Breeder charge for repair after import',()=>{
  const purchase={id:'breeder',source:{kind:'fey'},cost:0,mode:'rules'};
  const draft={version:1,name:'',mode:'rules',history:{entries:[]},pins:[],sheet:{...createSheet(),traitPurchases:[purchase]}};
  const sheet=parseDraft(JSON.stringify(draft),catalog).sheet;
  expect(sheet.traitPurchases).toEqual([purchase]);
  expect(traitState(sheet,route('born-peasant')).issues.join(' ')).toContain('Breeder: Requires Fey Blood');
  expect(refundTrait(sheet,'breeder')).toEqual(createSheet());
});

it('persists twenty planning choices independently of obligations, ownership, points and effects',()=>{
  const progress=route('born-peasant','farmer');
  const empty=createSheet(),ids=['vigor-of-youth','hoarding','black-lung',...[...traits.keys()].slice(0,17)];
  const staged=ids.reduce(shortlistTrait,empty);
  expect(staged.traitCandidates).toHaveLength(20);
  expect(shortlistTrait(staged,'hoarding')).toBe(staged);
  expect(traitState(staged,progress)).toEqual(traitState(empty,progress));
  expect(deriveSheet(staged,progress)).toEqual(deriveSheet(empty,progress));
  const draft={version:1,name:'',history:{entries:[]},mode:'rules',pins:[],sheet:staged};
  expect(parseDraft(JSON.stringify(draft),catalog).sheet.traitCandidates).toEqual(ids);
  for(const invalid of [null,{},['unknown'],['tough','tough']]){
    expect(()=>parseDraft(JSON.stringify({...draft,sheet:{...staged,traitCandidates:invalid}}),catalog)).toThrow();
  }
  expect(parseDraft(JSON.stringify({...draft,sheet:{...staged,traitCandidates:undefined}}),catalog).sheet.traitCandidates).toEqual([]);
  expect(refundTrait(purchaseTrait(staged,progress,'hoarding',source,'rules').sheet,'hoarding')).toEqual(staged);
});
import { shortlistTrait } from '../../src/character/traits';
