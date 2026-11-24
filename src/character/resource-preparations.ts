/** Unpaid workflow state. No pricing, eligibility or refund arithmetic lives here. */
import type { ResourceRequest } from '../rules/resource-types';
import { validResourceConfiguration, validateResourceRequest } from '../rules/resource-validation';
import { resourceCatalog } from '../rules/resources';
import { buyResources, refundResource } from './resources';
import type { Draft } from './workbench';
import type { LifepathProgress } from '../rules/lifepaths';
import type { ResourceContext } from '../rules/resource-types';

export interface ResourcePreparation {
  readonly id:string;
  readonly title:string;
  readonly requests:readonly ResourceRequest[];
  /** Unfinished text/number inputs are preserved without pretending to be quotes. */
  readonly inputs:Readonly<Record<string,string>>;
}
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const identifier=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=300;
export function parseResourcePreparations(value:unknown):ResourcePreparation[]{
  if(value===undefined)return [];
  const fail=():never=>{throw new Error('Invalid resource preparations.');};
  if(!Array.isArray(value)||value.length>200)return fail();
  const ids=new Set<string>();
  return value.map(p=>{
    if(!object(p)||!identifier(p.id)||ids.has(p.id)||typeof p.title!=='string'||p.title.length>2000||!object(p.inputs)||Object.keys(p.inputs).length>200||Object.entries(p.inputs).some(([k,v])=>!identifier(k)||typeof v!=='string'||v.length>20000)||!Array.isArray(p.requests)||!p.requests.length||p.requests.length>200)return fail();
    ids.add(p.id);
    const requests:ResourceRequest[]=p.requests.map(r=>{
      if(!object(r)||!identifier(r.id)||ids.has(r.id)||!identifier(r.definitionId)||!resourceCatalog.has(r.definitionId)||!validResourceConfiguration(r.configuration))return fail();
      ids.add(r.id);
      // Requests use the existing structural validator, but no eligibility,
      // affordability, target existence or manual assessment is demanded here.
      if(validateResourceRequest(r,resourceCatalog).length)return fail();
      // Funding and review/override authorizations are never carried from a quote.
      if(r.funding!==undefined||r.reviews!==undefined||r.override!==undefined)return fail();
      return {id:r.id,definitionId:r.definitionId,configuration:structuredClone(r.configuration),...(r.links?{links:structuredClone(r.links as ResourceRequest['links'])}:{}),...(r.declaredItems?{declaredItems:structuredClone(r.declaredItems as ResourceRequest['declaredItems'])}:{})};
    });
    return {id:p.id,title:p.title,inputs:Object.fromEntries(Object.entries(p.inputs)) as Record<string,string>,requests};
  });
}

export function buyPreparation(draft:Draft,progress:LifepathProgress,id:string,context:ResourceContext={}):{draft:Draft;error?:string}{
  const preparation=draft.resourcePreparation?.find(p=>p.id===id);
  if(!preparation)return {draft,error:'Preparation no longer exists.'};
  if(Object.keys(preparation.inputs).length)return {draft,error:'Finish the edited fields before buying.'};
  const result=buyResources(draft.sheet,progress,preparation.requests,draft.mode,context);
  if(result.error)return {draft,error:result.error};
  return {draft:{...draft,version:2,sheet:result.sheet,resourcePreparation:draft.resourcePreparation!.filter(p=>p.id!==id)}};
}
/** Engine decides the cascade. Remap only identities of the records it removed. */
export function refundToPreparation(draft:Draft,id:string,newId:()=>string):{draft:Draft;error?:string}{
  const result=refundResource(draft.sheet,id);
  if(result.error)return {draft,error:result.error};
  if(result.sheet===draft.sheet)return {draft,error:'Purchase no longer exists.'};
  const remaining=new Set(result.sheet.resourcePurchases?.map(p=>p.id));
  const removed=draft.sheet.resourcePurchases!.filter(p=>!remaining.has(p.id));
  // Selected included children are re-created by the engine, not duplicated here.
  const editable=removed.filter(p=>resourceCatalog.get(p.definitionId)?.price.kind!=='included');
  const identities=new Map<string,string>();
  for(const p of editable){identities.set(p.id,newId());for(const i of p.declaredItems)identities.set(i.id,newId());}
  const remap=(id:string)=>identities.get(id)??id;
  const requests=editable.map(p=>{
    const c=p.configuration;
    const configuration=c.kind==='gang'?{...c,seniorRelationshipPurchaseId:remap(c.seniorRelationshipPurchaseId),affiliationPurchaseId:remap(c.affiliationPurchaseId),reputationPurchaseId:remap(c.reputationPurchaseId)}:c.kind==='armor'?{...c,substitutions:c.substitutions.map(s=>({...s,itemId:remap(s.itemId)}))}:c;
    return {id:remap(p.id),definitionId:p.definitionId,configuration:structuredClone(configuration),links:Object.fromEntries(Object.entries(p.links).map(([k,v])=>[k,remap(v)])),declaredItems:p.declaredItems.map(i=>({...structuredClone(i),id:remap(i.id)}))};
  });
  const preparation={id:newId(),title:resourceCatalog.get(editable[0].definitionId)?.sourceName??'Returned purchase',requests,inputs:{}};
  const all=[...(draft.resourcePreparation??[]),preparation];
  try{parseResourcePreparations(all);}catch{return {draft,error:'Cannot create a valid preparation; purchase was not refunded.'};}
  return {draft:{...draft,version:2,sheet:result.sheet,resourcePreparation:all}};
}

export function prepareResource(definitionId:string,newId:()=>string):ResourcePreparation {
 const d=resourceCatalog.get(definitionId);if(!d)throw new Error('Unknown resource.');
 const description='';
 let configuration:ResourceRequest['configuration'];
 switch(d.configuration){
 case 'arms':case 'missile':configuration={kind:'quality',quality:'run-of-the-mill',description};break;
 case 'armor':configuration={kind:'armor',quality:'run-of-the-mill',piece:'suit',selectedIncludedDefinitionIds:[],substitutions:[]};break;
 case 'skill-kit':configuration={kind:'skill-kit',skillId:'choose-skill',description};break;
 case 'relationship':configuration={kind:'relationship',name:'',description,npcName:'',significance:'minor',family:'none',romantic:false,forbidden:false,hateful:false,additionalConditions:''};break;
 case 'companion':configuration={kind:'companion',name:'',description,npcName:'',linkedCharacterId:'not-linked'};break;
 case 'social':configuration=d.category==='affiliation'?{kind:'affiliation',name:'',description,scope:'',dice:1}:{kind:'reputation',name:'',description,scope:'',audience:'',dice:1};break;
 case 'weapon-modification':case 'ammunition':configuration={kind:'addition',description};break;
 case 'gang':configuration={kind:'gang',organizationId:'choose-organization',seniorRelationshipPurchaseId:'choose-relationship',affiliationPurchaseId:'choose-affiliation',reputationPurchaseId:'choose-reputation'};break;
 default:configuration={kind:'plain',description};
 }
 return {id:newId(),title:d.sourceName,inputs:{},requests:[{id:newId(),definitionId,configuration}]};
}
