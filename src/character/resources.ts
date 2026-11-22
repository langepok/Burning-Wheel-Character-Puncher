import type { Sheet } from '../rules/burning';
import type { LifepathProgress } from '../rules/lifepaths';
import type { BuildMode } from './lifepath-history';
import type { ResourceFundingAllocation, ResourcePurchase, ResourceBurningChoices } from './resource-contracts';
import { quoteResource, resourceCatalog, resourceCatalogRevision, resourceReviewContext, defaultResourceChoices } from '../rules/resources';
import type { ResourceRequest, ResourceCatalog, ResourceContext, ResourceBudgetOverride } from '../rules/resource-types';
import { resourceLedgerErrors, parseResourceChoices, parseResourceBudgetOverrides, validateResourceRequest } from '../rules/resource-validation';

export interface ResourceCommandResult { readonly sheet:Sheet; readonly error?:string }
/** A batch commits once, including selected shield components and gang ownership.
 * Ordered parents precede their additions; a gang container follows its components.
 * IDs come from the caller (e.g. crypto.randomUUID in the future UI), never the clock. */
export function buyResources(sheet:Sheet,progress:LifepathProgress,requests:readonly ResourceRequest[],mode:BuildMode,context:ResourceContext={},catalog:ResourceCatalog=resourceCatalog):ResourceCommandResult {
  const fail=(error:string):ResourceCommandResult=>({sheet,error});
  if(!Array.isArray(requests)||!requests.length)return fail('Provide at least one purchase.');
  let next=sheet;
  const queue:ResourceRequest[]=[...requests];
  for(let index=0;index<queue.length;index++){
    const r=queue[index];
    const invalid=validateResourceRequest(r,catalog);if(invalid.length)return fail(invalid.join(' '));
    if((next.resourcePurchases??[]).some(p=>p.id===r.id))return fail('Purchase ID already exists.');
    if(mode==='rules'&&r.override)return fail('Explicit price overrides require Free Creation.');
    const quote=quoteResource(next,progress,r,context,catalog);
    if(quote.status!=='available'&&!(mode==='free'&&quote.status==='override'))return fail(quote.diagnostics.filter(i=>i.blocking).map(i=>i.message).join(' ')||'Purchase needs review.');
    const cost=quote.payableRps!;
    const definition=catalog.get(r.definitionId)!;
    if((definition.price.kind==='sum-children'||definition.price.kind==='included')&&cost!==0)return fail('Included entries and composite containers must not carry an extra debit.');
    const funding=quote.funding??[];
    const items=(r.declaredItems??[]).map(item=>({...item,...r.configuration.kind==='quality'?{quality:r.configuration.quality}:{}}));
    const purchase:ResourcePurchase={id:r.id,definitionId:r.definitionId,configuration:structuredClone(r.configuration),originalPaidRps:cost,links:{...r.links},declaredItems:structuredClone(items),provenance:{mode,origin:r.override?'free-creation':'catalog',catalogRevision:resourceCatalogRevision,source:[definition.source],quotedCost:quote.cost,reviews:structuredClone(r.reviews??[]),reviewContext:resourceReviewContext(sheet,progress,context),overrides:r.override?[{code:'explicit-resource-override',explanation:r.override.reason}]:[],funding:structuredClone(funding)}};
    next={...next,resourcePurchases:[...(next.resourcePurchases??[]),purchase]};
    if(r.configuration.kind==='armor'){
      for(const option of r.configuration.selectedIncludedDefinitionIds){
        const optionId=r.id+':included:'+option;
        if(queue.some(x=>x.id===optionId))return fail('Reserved included-component ID already exists in the batch.');
        queue.splice(index+1,0,{id:optionId,definitionId:option,configuration:{kind:'plain',description:'Explicitly selected included component.'},links:{parentPurchaseId:r.id}});
      }
    }
  }
  const errors=resourceLedgerErrors(next.resourcePurchases??[],catalog);
  return errors.length?fail(errors.join(' ')):{sheet:next};
}

/** Removing any gang component removes its entire group. Parent removal cascades
 * through all descendants; each original debit is returned exactly once. */
export function refundResource(sheet:Sheet,id:string):ResourceCommandResult&{refundedRps:number;funding:readonly ResourceFundingAllocation[]} {
  const ledger=sheet.resourcePurchases??[],removed=new Set<string>();
  if(!ledger.some(p=>p.id===id))return {sheet,refundedRps:0,funding:[]};
  const selected=ledger.find(p=>p.id===id)!;
  const parent=ledger.find(p=>p.id===selected.links.parentPurchaseId);
  if(parent?.configuration.kind==='armor'&&parent.configuration.selectedIncludedDefinitionIds.includes(selected.definitionId))return {sheet,error:'Refund the armor parent to remove its selected included component atomically.',refundedRps:0,funding:[]};
  removed.add(id);
  let changed=true;
  while(changed){changed=false;for(const p of ledger){
    if(removed.has(p.id)&&p.links.groupPurchaseId&&!removed.has(p.links.groupPurchaseId)){removed.add(p.links.groupPurchaseId);changed=true;}
    if(!removed.has(p.id)&&((p.links.parentPurchaseId&&removed.has(p.links.parentPurchaseId))||(p.links.groupPurchaseId&&removed.has(p.links.groupPurchaseId)))){removed.add(p.id);changed=true;}
  }}
  const returned=ledger.filter(p=>removed.has(p.id));
  return {sheet:{...sheet,resourcePurchases:ledger.filter(p=>!removed.has(p.id))},refundedRps:returned.reduce((n,p)=>n+p.originalPaidRps,0),funding:returned.flatMap(p=>p.provenance.funding)};
}
export function resetResources(sheet:Sheet):Sheet {
  const {resourcePurchases:_p,resourceChoices:_c,resourceBudgetOverrides:_b,...rest}=sheet;
  return rest;
}
export function setResourceChoices(sheet:Sheet,choices:ResourceBurningChoices):ResourceCommandResult {
  try{return {sheet:{...sheet,resourceChoices:parseResourceChoices(choices)??defaultResourceChoices}};}catch(error){return {sheet,error:String(error)};}
}
export function setResourceBudgetOverrides(sheet:Sheet,grants:readonly ResourceBudgetOverride[],mode:BuildMode):ResourceCommandResult {
  if(mode!=='free')return {sheet,error:'Budget overrides require Free Creation.'};
  try{return {sheet:{...sheet,resourceBudgetOverrides:parseResourceBudgetOverrides(grants)}};}catch(error){return {sheet,error:String(error)};}
}
/** Narrative edits never reprice a transaction or change mechanical fields. */
export function describeResource(sheet:Sheet,id:string,description:{name?:string;description?:string;audience?:string;scope?:string}):ResourceCommandResult {
  if(Object.entries(description).some(([k,v])=>!['name','description','audience','scope'].includes(k)||typeof v!=='string'))return {sheet,error:'Invalid descriptive edit.'};
  const p=sheet.resourcePurchases?.find(p=>p.id===id);
  if(!p||!['relationship','companion','affiliation','reputation'].includes(p.configuration.kind))return {sheet,error:'Select a social purchase.'};
  const configuration={...p.configuration,...description};
  return {sheet:{...sheet,resourcePurchases:sheet.resourcePurchases!.map(x=>x.id===id?{...x,configuration,provenance:{...x.provenance,reviews:[],reviewContext:undefined}}:x)}};
}
