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
export function refundTrait(sheet:Sheet,id:string):Sheet {
  if(!sheet.traitPurchases?.some(p=>p.id===id))return sheet;
  return {...sheet,traitPurchases:sheet.traitPurchases.filter(p=>p.id!==id)};
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
    if(!Number.isInteger(p.cost)||p.cost!==traitCost(t,source))return invalid();
    return {id:t.id,source,cost:p.cost,mode:p.mode};
  });
}
