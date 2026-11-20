import type { GameCatalog } from '../data/catalog';
import { traits } from '../data/traits';
import type { TraitSource, TraitPurchase } from '../data/traits/types';
import type { Sheet } from '../rules/burning';
import type { LifepathProgress } from '../rules/lifepaths';
import { traitState, accessIssues, sameSource, pathTraitIds, traitCost } from '../rules/traits';
import type { BuildMode } from './lifepath-history';

export function purchaseTrait(sheet:Sheet,progress:LifepathProgress,id:string,source:TraitSource,mode:BuildMode):{sheet:Sheet;error?:string} {
  const t=traits.get(id);
  if(!t) return {sheet,error:'Unknown trait.'};
  const state=traitState(sheet,progress);
  if(state.owned.has(id)) return {sheet,error:'Already owned.'};
  const cost=traitCost(t,source);
  if(cost===null || !Number.isSafeInteger(cost) || cost<0 || cost>100) return {sheet,error:'No confirmed price for this source.'};
  if(source.kind==='lifepath' && !state.paths.some(p=>sameSource(p.source,source)&&p.ids.includes(id)))
    return {sheet,error:'Choose a listed source, or an explicit Free Creation price.'};
  const issues=accessIssues(t,source,state);
  const required=state.missing.find(m=>m.id===id);
  if(required && !sameSource(required.source,source)) issues.push('Purchase from the required lifepath occurrence.');
  const reserve=state.missing.length-(required?1:0);
  if(cost>state.remaining || (!required && state.remaining-cost<reserve)) issues.push('Insufficient trait points after required purchases.');
  if(mode==='rules' && issues.length) return {sheet,error:issues.join(' ')};
  return {sheet:{...sheet,traitPurchases:[...state.ledger,{id,source,cost,mode}]}};
}
export function changeTraitCategory(sheet:Sheet,progress:LifepathProgress,id:string,category:string,mode:BuildMode):{sheet:Sheet;error?:string} {
  const t=traits.get(id),ledger=sheet.traitPurchases??[],paid=ledger.find(p=>p.id===id);
  if(!t?.categories?.includes(category)||!paid)return {sheet,error:'Unknown category or unowned trait.'};
  const current=paid.categories??[],remove=current.includes(category);
  const categories=remove?current.filter(c=>c!==category):[...current,category];
  const cost=traitCost(t,paid.source)!+Math.max(0,categories.length-1);
  const state=traitState(sheet,progress);
  if(cost>paid.cost && mode==='rules' && accessIssues(t,paid.source,state).length)return {sheet,error:'Repair the existing purchase source first.'};
  if(cost>paid.cost && mode==='rules' && state.remaining-state.missing.length<cost-paid.cost)return {sheet,error:'Not enough unreserved trait points.'};
  return {sheet:{...sheet,traitPurchases:ledger.map(p=>p===paid?{...p,categories,cost,mode:!remove&&mode==='free'?'free':p.mode}:p)}};
}
export function refundTrait(sheet:Sheet,id:string):Sheet {
  if(!sheet.traitPurchases?.some(p=>p.id===id))return sheet;
  const choices={...sheet.choices};delete choices['trait:'+id];
  return {...sheet,choices,traitPurchases:sheet.traitPurchases.filter(p=>p.id!==id)};
}
export function parseTraitPurchases(raw:unknown,catalog:GameCatalog):TraitPurchase[] {
  if(raw===undefined)return [];
  const invalid=():never=>{throw new Error('Invalid trait purchase in character draft.');};
  if(!Array.isArray(raw)||raw.length>traits.size)return invalid();
  const seen=new Set<string>();
  return raw.map(p=>{
    const t=traits.get(p?.id);
    if(!t||seen.has(t.id)||!['rules','free'].includes(p.mode)||!p.source)return invalid();
    seen.add(t.id);
    let source:TraitSource;
    switch(p.source.kind){
      case 'lifepath': {
        const {path,occurrence}=p.source;
        if(!catalog.lifepaths.has(path)||!Number.isInteger(occurrence)||occurrence<1||occurrence>200||!pathTraitIds(path).includes(t.id))return invalid();
        source={kind:'lifepath',path,occurrence}; break;
      }
      case 'catalog': source={kind:'catalog'};break;
      case 'fey': source={kind:'fey'};break;
      case 'free':
        if(p.mode!=='free'||!Number.isInteger(p.source.points)||p.source.points<0||p.source.points>100)return invalid();
        source={kind:'free',points:p.source.points};break;
      default:return invalid();
    }
    if(p.mode==='rules' && source.kind==='catalog' && !t.catalogAvailable)return invalid();
    const categories:unknown=p.categories;
    if(categories!==undefined && (!t.categories || !Array.isArray(categories) || categories.length>t.categories.length ||
      new Set(categories).size!==categories.length || categories.some(v=>!t.categories!.includes(v))))return invalid();
    const baseCost=traitCost(t,source);
    const extra=Array.isArray(categories)?Math.max(0,categories.length-1):0;
    if(baseCost===null||!Number.isInteger(p.cost)||p.cost!==baseCost+extra)return invalid();
    return {id:t.id,source,cost:p.cost,mode:p.mode,...(Array.isArray(categories)?{categories:[...categories]}:{})};
  });
}
