import type { GameCatalog } from '../data/catalog';
import type { LifepathProgress } from '../rules/lifepaths';
import { applyLifepathCommand } from './lifepath-history';
import type { BuildMode, LifepathHistory } from './lifepath-history';
import { deriveSheet, restrictionIssues, skillOpening, skillValue, skills, statIds } from '../rules/burning';
import type { Pool, Shade, Sheet, StatId } from '../rules/burning';
import { traits as traitCatalog } from '../data/traits';
import { parseTraitPurchases } from './traits';
export * from '../rules/burning';
export function createSheet():Sheet {
  return {stats:Object.fromEntries(statIds.map(id=>[id,{exponent:0,shade:'B'}])) as Sheet['stats'],choices:{},candidates:[],traitPurchases:[],purchases:[],grayApproved:false};
}
export function changeStat(sheet:Sheet,p:LifepathProgress,id:StatId,delta:number,mode:BuildMode){
  const exponent=sheet.stats[id].exponent+delta;
  if(exponent<0||exponent>20)return {sheet,error:'Exponent outside editable range.'};
  const pool=id==='will'||id==='perception'?'mental':'physical';
  if(mode==='rules'&&delta>0&&(exponent>6||deriveSheet(sheet,p).remaining[pool]<delta))return {sheet,error:'Starting cap is 6; spend only available '+pool+' points.'};
  return {sheet:{...sheet,stats:{...sheet.stats,[id]:{...sheet.stats[id],exponent}}}};
}
export function changeStatShade(sheet:Sheet,p:LifepathProgress,id:StatId,mode:BuildMode){
  const next:Shade=sheet.stats[id].shade==='B'?'G':sheet.stats[id].shade==='G'&&mode==='free'?'W':'B';
  const pool=id==='will'||id==='perception'?'mental':'physical';
  if(next==='G'&&mode==='rules'&&(!sheet.grayApproved||deriveSheet(sheet,p).remaining[pool]<5))return {sheet,error:'Gray shade costs 5 extra stat points and requires GM/group approval.'};
  return {sheet:{...sheet,stats:{...sheet.stats,[id]:{...sheet.stats[id],shade:next}}}};
}
export function buySkill(sheet:Sheet,p:LifepathProgress,id:string,pool:Pool,mode:BuildMode,shade:'root'|Shade='root'){
  const skill=skills.get(id);if(!skill)return {sheet,error:'This entry needs a dedicated topic or choice editor.'};
  const paid=sheet.purchases.filter(v=>v.skillId===id);const open=paid.find(v=>v.kind==='open');
  if(open&&skill.training.kind==='training')return {sheet,error:'Training has no exponent and cannot be advanced.'};
  const d=deriveSheet(sheet,p);const reasons=restrictionIssues(skill,sheet,p.paths[0]?.stockId??'human');
  if(!p.paths.length)reasons.push('Choose a lifepath first.');
  if(pool==='ordinary'&&!d.available.has(id))reasons.push('Use General points: this skill is not on a selected lifepath.');
  if(pool==='ordinary'&&open?.pool==='general')reasons.push('Skill opened with General points; use General for advances.');
  const root=skillOpening(skill,sheet);
  if(skill.training.kind!=='training'&&!root)return {sheet,error:'Allocate root stats before opening this skill.'};
  const value=skillValue(id,sheet);
  if((value&&value!=='training'&&value.exponent>=6)||(!open&&root&&root.exponent>6))reasons.push('Default starting exponent cap is 6.');
  if(!open&&shade==='G'&&!sheet.grayApproved)reasons.push('Gray shade requires GM/group approval.');
  if(!open&&shade==='W')reasons.push('White shade requires Free Creation.');
  const cost=skillPurchaseCost(id,Boolean(open),shade);
  if(d.remaining[pool]<cost)reasons.push('Not enough '+pool+' points: this purchase costs '+cost+'.');
  if(reasons.length&&mode==='rules')return {sheet,error:reasons.join(' ')};
  return {sheet:{...sheet,purchases:[...sheet.purchases,{skillId:id,pool,cost,kind:open?'advance' as const:'open' as const,shade:skill.training.kind==='training'?'root' as const:shade,override:reasons.length>0}]}};
}
export function refundSkill(sheet:Sheet,id:string):Sheet {
  const index=sheet.purchases.map(p=>p.skillId).lastIndexOf(id);
  return index<0?sheet:{...sheet,purchases:sheet.purchases.filter((_,i)=>i!==index)};
}
export interface Draft {version:1;name:string;mode:BuildMode;history:LifepathHistory;sheet:Sheet;pins:string[]}
export const encodeDraft=(draft:Draft)=>JSON.stringify(draft,null,2);
/** Never trust imported diagnostics or values. Rebuild lifepath overrides using the evaluator. */
export function parseDraft(text:string,catalog:GameCatalog):Draft {
  if(text.length>1_000_000)throw new Error('Draft is too large.');
  const d=JSON.parse(text);const fail=()=>{throw new Error('Invalid or unsupported character draft.');};
  if(!d||d.version!==1||typeof d.name!=='string'||d.name.length>200||!['rules','free'].includes(d.mode)||!Array.isArray(d.history?.entries)||d.history.entries.length>200||!Array.isArray(d.pins)||d.pins.some((id:unknown)=>typeof id!=='string'||!catalog.lifepaths.has(id)))fail();
  let history:LifepathHistory={entries:[]};
  for(const e of d.history.entries){
    if(e.kind==='gender'){
      if(!['female','male',undefined].includes(e.value))fail();
      history=applyLifepathCommand(history,{kind:'gender',value:e.value},'free',catalog);
    }else{
      if(!['lifepath','lead'].includes(e.kind)||typeof e.id!=='string')fail();
      const next=applyLifepathCommand(history,{kind:e.kind,id:e.id},'free',catalog);if(next===history)fail();history=next;
    }
  }
  const s=d.sheet;if(!s||typeof s.grayApproved!=='boolean'||!s.stats||!s.choices||Array.isArray(s.choices)||typeof s.choices!=='object'||!Array.isArray(s.candidates)||!Array.isArray(s.purchases)||s.purchases.length>2000)fail();
  for(const id of statIds){const a=s.stats[id];if(!a||!Number.isInteger(a.exponent)||a.exponent<0||a.exponent>20||!['B','G','W'].includes(a.shade))fail();}
  if(s.candidates.some((id:unknown)=>typeof id!=='string'||!skills.has(id))||Object.values(s.choices).some(v=>typeof v!=='string'))fail();
  const traits=parseTraitPurchases(s.traitPurchases,catalog);
  for(const [key,value] of Object.entries(s.choices)){
    if(key.startsWith('trait:') && (!traits.some(p=>p.id===key.slice(6) && traitCatalog.get(p.id)?.poolTransfer) || !['transfer','keep'].includes(String(value))))fail();
  }
  const opened=new Map<string,{pool:Pool}>();
  for(const p of s.purchases){
    const skill=skills.get(p.skillId);if(!skill||!['ordinary','general'].includes(p.pool)||!['root','B','G','W'].includes(p.shade)||typeof p.override!=='boolean'||!['open','advance'].includes(p.kind))fail();
    if(p.kind==='open'){
      if(opened.has(p.skillId))fail();opened.set(p.skillId,{pool:p.pool});
      const expected=skill!.training.kind==='training'?2:p.shade==='G'?5:skill!.baseOpeningCostOverride?.points??1;
      if(p.cost!==expected)fail();
    }else if(!opened.has(p.skillId)||skill!.training.kind==='training'||p.cost!==1)fail();
  }
  return {version:1,name:d.name,mode:d.mode,history,sheet:{...s,traitPurchases:traits},pins:[...new Set(d.pins)] as string[]};
}

/** Remove a route step without undoing identity or purchases. */
export function removeLastRouteStep(history:LifepathHistory):LifepathHistory {
  let index=history.entries.length-1;
  while(index>=0&&history.entries[index].kind==='gender')index--;
  return index<0?history:{entries:history.entries.filter((_,i)=>i!==index)};
}
export function clearRoute(history:LifepathHistory):LifepathHistory {
  const gender=[...history.entries].reverse().find(e=>e.kind==='gender');
  return {entries:gender?[gender]:[]};
}
export function skillPurchaseCost(id:string,opened:boolean,shade:'root'|Shade='root'){
  const skill=skills.get(id);
  return opened?1:skill?.training.kind==='training'?2:shade==='G'?5:skill?.baseOpeningCostOverride?.points??1;
}
