/** Unpaid workflow state. No pricing, eligibility or refund arithmetic lives here. */
import type { ResourceRequest } from '../rules/resource-types';
import { validResourceConfiguration, validateResourceRequest } from '../rules/resource-validation';
import { resourceCatalog, resourceReviewContext, projectResources } from '../rules/resources';
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
  readonly reviewNotes?:Readonly<Record<string,string>>;
  readonly reviewedContext?:string;
  readonly exceptions?:Readonly<Record<string,{readonly paidRps:string;readonly reason:string}>>;
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
    const requestIds=new Set(requests.map(r=>r.id));
    if(p.reviewNotes!==undefined&&(!object(p.reviewNotes)||Object.entries(p.reviewNotes).some(([k,v])=>!requestIds.has(k)||typeof v!=='string'||v.length>20000)))return fail();
    if(p.reviewedContext!==undefined&&(typeof p.reviewedContext!=='string'||p.reviewedContext.length>500000))return fail();
    if(p.exceptions!==undefined&&(!object(p.exceptions)||Object.entries(p.exceptions).some(([k,v])=>!requestIds.has(k)||!object(v)||typeof v.paidRps!=='string'||v.paidRps.length>30||typeof v.reason!=='string'||v.reason.length>20000)))return fail();
    return {...(p.reviewNotes?{reviewNotes:{...p.reviewNotes} as Record<string,string>} :{}),...(typeof p.reviewedContext==='string'?{reviewedContext:p.reviewedContext}:{}),...(p.exceptions?{exceptions:structuredClone(p.exceptions) as ResourcePreparation['exceptions']}:{}),id:p.id,title:p.title,inputs:Object.fromEntries(Object.entries(p.inputs)) as Record<string,string>,requests};
  });
}

export function buyPreparation(draft:Draft,progress:LifepathProgress,id:string,context:ResourceContext={}):{draft:Draft;error?:string}{
  const preparation=draft.resourcePreparation?.find(p=>p.id===id);
  if(!preparation)return {draft,error:'Preparation no longer exists.'};
  if(Object.keys(preparation.inputs).length)return {draft,error:'Finish the edited fields before buying.'};
  const result=previewPreparation(draft,progress,preparation,context);
  if(!result.sheet)return {draft,error:result.error??'Preparation is incomplete.'};
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
  const preparation={id:newId(),title:resourceCatalog.get(editable[0].definitionId)?.sourceName??'Returned purchase',requests,inputs:{},reviewNotes:Object.fromEntries(editable.flatMap(p=>(p.provenance.reviews?.length?[[remap(p.id),p.provenance.reviews.map(r=>r.explanation).join('\n')]]:[])))};
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
 const preparationId=newId(),purchaseId=newId();
 if(configuration.kind==='gang'&&d.price.kind==='sum-children'){
  const children=d.price.childDefinitionIds.map(definitionId=>prepareResource(definitionId,newId).requests[0]).map(r=>({...r,links:{groupPurchaseId:purchaseId},configuration:r.configuration.kind==='affiliation'||r.configuration.kind==='reputation'?{...r.configuration,organizationId:purchaseId}:r.configuration}));
  configuration={kind:'gang',organizationId:purchaseId,seniorRelationshipPurchaseId:children[0].id,affiliationPurchaseId:children[1].id,reputationPurchaseId:children[2].id};
  return {id:preparationId,title:d.sourceName,inputs:{},requests:[...children,{id:purchaseId,definitionId,configuration}]};
 }
 return {id:preparationId,title:d.sourceName,inputs:{},requests:[{id:purchaseId,definitionId,configuration}]};
}

/** Notes are portable fiction; certification is bound to the current exact scope. */
export function preparationContext(draft:Draft,progress:LifepathProgress,p:ResourcePreparation,context:ResourceContext={}):string {
 return JSON.stringify({mode:draft.mode,scopes:p.requests.map(r=>resourceReviewContext(draft.sheet,progress,context,r)),notes:p.reviewNotes??{},exceptions:p.exceptions??{}});
}
export function preparationRequests(draft:Draft,progress:LifepathProgress,p:ResourcePreparation,context:ResourceContext={}):{requests:ResourceRequest[];error?:string}{
 const valid=p.reviewedContext===preparationContext(draft,progress,p,context);
 const requests:ResourceRequest[]=[];
 for(const r of p.requests){
  const definition=resourceCatalog.get(r.definitionId)!;
  const questions=definition.constraints.flatMap(c=>c.kind==='review'?[c.questionId]:c.kind==='social-limit'?['social-scope']:[]);
  const note=p.reviewNotes?.[r.id]?.trim();
  let override:ResourceRequest['override'];const exception=p.exceptions?.[r.id];
  if(exception){
   if(draft.mode!=='free')return {requests:[],error:'Explicit exceptions require Free Creation.'};
   if(!/^\d+$/.test(exception.paidRps)||!Number.isSafeInteger(Number(exception.paidRps))||Number(exception.paidRps)>1000000||!exception.reason.trim())return {requests:[],error:'Enter a nonnegative whole-rp price and an explanation for the exception.'};
   override={paidRps:Number(exception.paidRps),reason:exception.reason};
  }
  requests.push({...r,...valid&&note?{reviews:questions.map(questionId=>({questionId,explanation:note}))}:{},...override?{override}:{}});
 }
 return {requests};
}
export function previewPreparation(draft:Draft,progress:LifepathProgress,p:ResourcePreparation,context:ResourceContext={}) {
 if(Object.keys(p.inputs).length)return {error:'Finish the edited fields before buying.'};
 const prepared=preparationRequests(draft,progress,p,context);if(prepared.error)return {error:prepared.error};
 const result=buyResources(draft.sheet,progress,prepared.requests,draft.mode,context);
 if(result.error)return {error:result.error};
 const projection=projectResources(result.sheet,progress,context),before=projectResources(draft.sheet,progress,context);
 return {sheet:result.sheet,projection,cost:projection.spentRps-before.spentRps};
}
export function duplicatePreparation(p:ResourcePreparation,newId:()=>string):ResourcePreparation {
 const ids=new Map<string,string>();
 for(const r of p.requests){ids.set(r.id,newId());for(const i of r.declaredItems??[])ids.set(i.id,newId());}
 const remap=(id:string)=>ids.get(id)??id;
 return {id:newId(),title:p.title,inputs:{...p.inputs},requests:p.requests.map(r=>{
  const c=r.configuration;
  const configuration=c.kind==='gang'?{...c,organizationId:remap(c.organizationId),seniorRelationshipPurchaseId:remap(c.seniorRelationshipPurchaseId),affiliationPurchaseId:remap(c.affiliationPurchaseId),reputationPurchaseId:remap(c.reputationPurchaseId)}:c.kind==='affiliation'||c.kind==='reputation'?{...c,...c.organizationId?{organizationId:remap(c.organizationId)}:{}}:c.kind==='armor'?{...c,substitutions:c.substitutions.map(s=>({...s,itemId:remap(s.itemId)}))}:c;
  return {...structuredClone(r),id:remap(r.id),configuration,links:Object.fromEntries(Object.entries(r.links??{}).map(([k,v])=>[k,remap(v)])),declaredItems:r.declaredItems?.map(i=>({...structuredClone(i),id:remap(i.id)}))};}),...(p.reviewNotes?{reviewNotes:Object.fromEntries(Object.entries(p.reviewNotes).map(([k,v])=>[remap(k),v]))}:{})};
}
