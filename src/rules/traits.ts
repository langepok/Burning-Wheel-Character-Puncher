import { humanBurningLists } from '../data/burning/human';
import { traits, sourceTraitIds } from '../data/traits';
import type { PathSource, Trait, TraitPurchase, TraitSource } from '../data/traits/types';
import type { Sheet } from './burning';
import type { LifepathProgress } from './lifepaths';

export function resourceContribution(path:LifepathProgress['paths'][number],repeat:number) {
  const value=path.resourceGrant.kind==='fixed'?path.resourceGrant.amount:path.resourceGrant.base;
  return Math.ceil(value*(repeat<3?1:.5));
}
export function pathTraitIds(path:string) {
  return (humanBurningLists[path]?.traits ?? []).map(name => {
    const id = sourceTraitIds.get(name.toLowerCase());
    if (!id) throw new Error('Unregistered lifepath trait: '+name);
    return id;
  });
}
export function sameSource(a:TraitSource,b:TraitSource) {
  return a.kind===b.kind && (a.kind!=='lifepath' || (b.kind==='lifepath' && a.path===b.path && a.occurrence===b.occurrence));
}
export function traitCost(t:Trait,source:TraitSource):number|null {
  switch(source.kind) {
    case 'lifepath': return 1;
    case 'catalog': return t.price;
    case 'free': return source.points;
    case 'fey': return t.access==='common'||t.access==='lifepath'?0:t.access==='special'?t.price:null;
  }
}
export function traitState(sheet:Sheet,progress:LifepathProgress) {
  const ledger=sheet.traitPurchases ?? [];
  const stock=progress.paths[0]?.stockId;
  const common=[...traits.values()].filter(t=>t.access==='common' && t.stocks.includes(stock??'') && progress.paths[0]?.isBorn);
  const earlier=new Set(common.map(t=>t.id));
  const owned=new Set([...earlier,...ledger.map(p=>p.id)]);
  const families=new Map<string,number>(), variants=new Map<string,number>();
  const paths:{source:PathSource; ids:string[]; name:string; required?:string}[]=[];
  const missing:{id:string; source:PathSource}[]=[];
  let total=0, resources=0;
  for(const path of progress.paths) {
    const repeat=(families.get(path.familyId)??0)+1;
    families.set(path.familyId,repeat);
    resources+=resourceContribution(path,repeat);
    const occurrence=(variants.get(path.variantId)??0)+1;
    variants.set(path.variantId,occurrence);
    const source:PathSource={kind:'lifepath',path:path.variantId,occurrence};
    const ids=pathTraitIds(path.variantId);
    if(repeat<3) total+=Math.max(0,path.traitPointGrant-(repeat===2 && ids.length<2?1:0));
    const required=repeat<=2?ids.slice(repeat-1).find(id=>!earlier.has(id)):undefined;
    if(required){
      if(!ledger.some(p=>p.id===required && sameSource(p.source,source))) missing.push({id:required,source});
      earlier.add(required);
    }
    paths.push({source,ids,name:path.sourceName,required});
    ledger.filter(p=>sameSource(p.source,source)&&ids.includes(p.id)).forEach(p=>earlier.add(p.id));
  }
  const remaining=total-ledger.reduce((sum,p)=>sum+p.cost,0);
  const issues=missing.map(m=>'Required trait: '+traits.get(m.id)!.name+' ('+m.source.path+', visit '+m.source.occurrence+').');
  const state={ledger,owned,common,paths,missing,total,remaining,stock,issues,resources};
  for(const p of ledger){
    const t=traits.get(p.id)!;
    for(const reason of accessIssues(t,p.source,state))issues.push(t.name+': '+reason);
    if(common.some(c=>c.id===p.id)) issues.push(t.name+': now granted as common; refund the purchase.');
    if(p.mode==='free') issues.push(t.name+': acquired in Free Creation; review recorded source.');
  }
  for(const id of owned){
    const t=traits.get(id)!;
    if(t.id==='fey-blood' && ledger.some(p=>p.source.kind==='fey'))continue;
    if(t.effect==='manual' || t.effect==='review') issues.push(t.name+': '+(t.note??'Effect needs table review, BWGR p. '+t.pages.join(', ')+'.'));
  }
  if(remaining<0) issues.push('Trait point budget exceeded by '+(-remaining)+'.');
  if(remaining>0) issues.push('Spend the remaining '+remaining+' trait points before play.');
  return state;
}
type AccessContext = {stock?:string;resources:number;owned:Set<string>;ledger:TraitPurchase[];paths:{source:PathSource;ids:string[]}[]};
export function accessIssues(t:Trait,source:TraitSource,state:AccessContext):string[] {
  const issues:string[]=[];
  if(!state.stock)issues.push('Choose a lifepath first.');
  if(source.kind==='lifepath'){
    if(!state.paths.some(p=>sameSource(p.source,source)&&p.ids.includes(t.id)))issues.push('Lifepath source is absent.');
  }else if(source.kind==='catalog'){
    if(!t.catalogAvailable) issues.push('Catalog access is restricted or awaits source review.');
    if(t.access==='common')issues.push('Common traits require a stock grant or Fey Blood.');
    if(t.stocks.length && !t.stocks.includes(state.stock??'')) issues.push('Restricted to '+t.stocks.join(' / ')+'.');
  }else if(source.kind==='fey'){
    if(!state.owned.has('fey-blood') || !t.stocks.some(s=>['elf','dwarf','orc'].includes(s))
      || !['common','lifepath','special'].includes(t.access))issues.push('Requires Fey Blood and an eligible stock trait.');
    if(state.ledger.some(p=>p.id!==t.id && p.source.kind==='fey'))issues.push('Fey Blood grants one selection.');
  }else issues.push('Explicit Free Creation price.');
  if(t.maxPaths!==undefined && state.paths.length>t.maxPaths)issues.push('At most '+t.maxPaths+' lifepaths permitted.');
  if(t.maxResources!==undefined && state.resources>t.maxResources)issues.push('At most '+t.maxResources+' starting resource points permitted.');
  if(t.requires && !state.owned.has(t.requires))issues.push('Requires '+traits.get(t.requires)!.name+'.');
  return issues;
}
