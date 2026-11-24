/** Structural invariants are never bypassed by Free Creation. */
import type { ResourceConfiguration, ResourcePurchase, ResourceBurningChoices } from '../character/resource-contracts';
import type { ResourceCatalog, ResourceBudgetOverride } from './resource-types';
import type { GameCatalog } from '../data/catalog';
const record=(v:unknown):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const text=(v:unknown):v is string=>typeof v==='string';
const id=(v:unknown):v is string=>text(v)&&v.trim().length>0&&v.length<=300;
const rps=(v:unknown):v is number=>Number.isSafeInteger(v)&&Number(v)>=0&&Number(v)<=1_000_000;
const quality=(v:unknown)=>['poor','run-of-the-mill','superior'].includes(String(v));
const source=(v:unknown)=>record(v)&&id(v.document)&&id(v.section)&&Array.isArray(v.printedPages)&&v.printedPages.length>0&&v.printedPages.every((p:unknown)=>rps(p)&&p>0)&&Array.isArray(v.pdfPages)&&v.pdfPages.length>0&&v.pdfPages.every((p:unknown)=>rps(p)&&p>0);
const unique=(values:readonly unknown[])=>new Set(values).size===values.length;
export function validResourceConfiguration(c:unknown):c is ResourceConfiguration {
  if(!record(c))return false;
  const social=()=>text(c.name)&&text(c.description);
  switch(c.kind){
    case 'plain':case 'addition':return text(c.description);
    case 'quality':return quality(c.quality)&&text(c.description);
    case 'armor':return quality(c.quality)&&['suit','helmet','breastplate','greaves','leggings','half-sleeves','half-leggings'].includes(c.piece)&&Array.isArray(c.selectedIncludedDefinitionIds)&&c.selectedIncludedDefinitionIds.every(id)&&unique(c.selectedIncludedDefinitionIds)&&Array.isArray(c.substitutions)&&c.substitutions.every((s:unknown)=>record(s)&&id(s.itemId)&&id(s.armorDefinitionId)&&text(s.note));
    case 'skill-kit':return id(c.skillId)&&text(c.description);
    case 'relationship':return social()&&text(c.npcName)&&['minor','significant','powerful'].includes(c.significance)&&['none','immediate','other'].includes(c.family)&&['romantic','forbidden','hateful'].every(k=>typeof c[k]==='boolean')&&text(c.additionalConditions);
    case 'companion':return social()&&text(c.npcName)&&id(c.linkedCharacterId);
    case 'affiliation':case 'reputation':return social()&&text(c.scope)&&(c.organizationId===undefined||id(c.organizationId))&&[1,2,3].includes(c.dice)&&(c.kind!=='reputation'||text(c.audience));
    case 'gang':return ['organizationId','seniorRelationshipPurchaseId','affiliationPurchaseId','reputationPurchaseId'].every(k=>id(c[k]))&&unique([c.seniorRelationshipPurchaseId,c.affiliationPurchaseId,c.reputationPurchaseId]);
    default:return false;
  }
}
export function validateResourceRequest(value:unknown,catalog:ResourceCatalog):string[]{
  if(!record(value)||!id(value.id)||!id(value.definitionId)||!validResourceConfiguration(value.configuration))return ['Invalid resource identity or configuration.'];
  const d=catalog.get(value.definitionId);if(!d)return ['Unknown resource definition.'];
  const c=value.configuration;
  const expected=d.configuration==='arms'||d.configuration==='missile'?'quality':d.configuration==='weapon-modification'||d.configuration==='ammunition'?'addition':d.configuration==='social'?d.category:d.configuration;
  if(c.kind!==expected)return ['Configuration does not match the catalog definition.'];
  if(value.links!==undefined&&(!record(value.links)||Object.keys(value.links).some(k=>!['parentPurchaseId','targetItemId','groupPurchaseId'].includes(k)||!id(value.links[k]))))return ['Invalid purchase links.'];
  if(value.declaredItems!==undefined&&(!Array.isArray(value.declaredItems)||value.declaredItems.length>2000||value.declaredItems.some((i:unknown)=>!record(i)||!id(i.id)||!text(i.name)||!['weapon','armor','shield','other'].includes(i.kind)||(i.weaponKind!==undefined&&!['axe','spear','polearm','other'].includes(i.weaponKind))||(i.quality!==undefined&&!quality(i.quality))||!Array.isArray(i.source)||!i.source.every(source)||(i.profileIds!==undefined&&(!Array.isArray(i.profileIds)||!i.profileIds.every(id))))||!unique(value.declaredItems.map((i:{id:string})=>i.id))))return ['Invalid physical declarations.'];
  if(value.declaredItems?.length&&!['arms','missile','armor','plain','skill-kit'].includes(d.configuration))return ['This purchase does not declare physical items.'];
  if(value.declaredItems?.some((i:{kind:string;weaponKind?:string})=>!(d.declaredItemKinds??['other']).some(kind=>kind===i.kind)||(i.weaponKind!==undefined&&i.kind!=='weapon')))return ['Physical declaration does not match this purchase definition.'];
  if((c.kind==='quality'||c.kind==='armor')&&value.declaredItems?.some((i:{quality?:string})=>i.quality!==undefined&&i.quality!==c.quality))return ['Declared item quality must match the purchased bundle.'];
  if(c.kind==='armor'&&(c.selectedIncludedDefinitionIds.some(option=>!d.includedOptions?.includes(option))||c.substitutions.some(s=>catalog.get(s.armorDefinitionId)?.configuration!=='armor')))return ['Unknown armor option or substitution.'];
  if(value.reviews!==undefined&&(!Array.isArray(value.reviews)||value.reviews.some((r:unknown)=>!record(r)||!id(r.questionId)||!id(r.explanation))||!unique(value.reviews.map((r:{questionId:string})=>r.questionId))))return ['Invalid review record.'];
  if(value.override!==undefined&&(!record(value.override)||!rps(value.override.paidRps)||!id(value.override.reason)))return ['An override needs an explicit nonnegative price and reason.'];
  if(value.funding!==undefined&&(!Array.isArray(value.funding)||value.funding.some((f:unknown)=>!validFunding(f))||!unique(value.funding.map((f:{poolId:string})=>f.poolId))))return ['Invalid funding allocations.'];
  return [];
}
function validFunding(f:unknown):boolean {
  return record(f)&&id(f.poolId)&&rps(f.paidRps)&&record(f.origin)&&(f.origin.kind==='override'?id(f.origin.reason):f.origin.kind==='lifepath'&&id(f.origin.variantId)&&rps(f.origin.occurrence)&&f.origin.occurrence>0);
}
export function resourceLedgerErrors(ledger:readonly ResourcePurchase[],catalog:ResourceCatalog):string[]{
  const errors:string[]=[], ids=new Set<string>(),items=new Map<string,string>();
  if(ledger.length>2000)errors.push('Resource ledger exceeds the draft transport limit.');
  for(const p of ledger){
    errors.push(...validateResourceRequest(p,catalog));
    if(ids.has(p.id))errors.push('Duplicate purchase ID.');ids.add(p.id);
    for(const item of p.declaredItems){if(items.has(item.id))errors.push('Duplicate physical item ID.');items.set(item.id,p.id);}
    if(p.provenance.funding.reduce((s,f)=>s+f.paidRps,0)!==p.originalPaidRps)errors.push('Funding must equal the original charge.');
    if(!unique(p.provenance.funding.map(f=>f.poolId)))errors.push('Duplicate funding source.');
    if(catalog.get(p.definitionId)?.price.kind==='sum-children'&&p.originalPaidRps!==0)errors.push('Composite containers cannot carry a debit.');
  }
  for(const p of ledger){
    const parent=ledger.find(x=>x.id===p.links.parentPurchaseId),group=ledger.find(x=>x.id===p.links.groupPurchaseId);
    if(p.links.parentPurchaseId&&p.links.groupPurchaseId)errors.push('A purchase cannot have two owners.');
    if(p.links.parentPurchaseId&&!parent)errors.push('Missing parent purchase.');
    if(p.links.targetItemId&&(!parent||items.get(p.links.targetItemId)!==parent.id))errors.push('Missing or foreign target item.');
    const d=catalog.get(p.definitionId);
    if(d?.additions?.target==='physical-weapon'&&!p.links.targetItemId)errors.push('Physical modification needs a target item.');
    if((d?.additions||d?.price.kind==='included')&&!parent)errors.push('Addition/inclusion requires a parent.');
    if(p.links.groupPurchaseId&&group?.configuration.kind!=='gang')errors.push('Missing composite group.');
    if(group?.configuration.kind==='gang'&&![group.configuration.seniorRelationshipPurchaseId,group.configuration.affiliationPurchaseId,group.configuration.reputationPurchaseId].includes(p.id))errors.push('Group does not own this component.');
    if(p.configuration.kind==='gang'){
      const c=p.configuration,childIds=[c.seniorRelationshipPurchaseId,c.affiliationPurchaseId,c.reputationPurchaseId];
      const price=d?.price;
      childIds.forEach((id,i)=>{const child=ledger.find(x=>x.id===id);if(!child||child.links.groupPurchaseId!==p.id||price?.kind!=='sum-children'||child.definitionId!==price.childDefinitionIds[i])errors.push('Incomplete composite.');});
    }
    if(p.configuration.kind==='armor'){
      const armor=p.configuration;
      for(const option of armor.selectedIncludedDefinitionIds)if(ledger.filter(x=>x.links.parentPurchaseId===p.id&&x.definitionId===option).length!==1)errors.push('Selected included option needs exactly one linked record.');
    }
    if(parent){
      const allowed=d?.additions?.parentDefinitionIds??(d?.price.kind==='included'?d.price.parentDefinitionIds:[]);
      if(!allowed.includes(parent.definitionId))errors.push('Incompatible parent link.');
      if(d?.price.kind==='included'&&p.originalPaidRps!==0)errors.push('Included components must have zero debit.');
      if(catalog.get(parent.definitionId)?.includedOptions?.includes(p.definitionId)&&!(parent.configuration.kind==='armor'&&parent.configuration.selectedIncludedDefinitionIds.includes(p.definitionId)))errors.push('Unselected included option.');
    }
    const seen=new Set([p.id]);let current:ResourcePurchase|undefined=p;
    while(current){const next:string|undefined=current.links.parentPurchaseId??current.links.groupPurchaseId;if(!next)break;if(seen.has(next)){errors.push('Cyclic purchase ownership.');break;}seen.add(next);current=ledger.find(x=>x.id===next);}
  }
  return [...new Set(errors)];
}

export function parseResourcePurchases(value:unknown,catalog:ResourceCatalog,lifepaths:GameCatalog):readonly ResourcePurchase[]{
  if(value===undefined)return [];
  if(!Array.isArray(value)||value.length>2000)throw new Error('Invalid resource ledger.');
  const result:ResourcePurchase[]=value.map(p=>{
    if(validateResourceRequest(p,catalog).length||!record(p)||!rps(p.originalPaidRps)||!record(p.provenance)||!record(p.links)||!Array.isArray(p.declaredItems))throw new Error('Invalid resource purchase.');
    const v=p.provenance;
    if(!['rules','free'].includes(v.mode)||!['catalog','free-creation'].includes(v.origin)||!id(v.catalogRevision)||!Array.isArray(v.source)||!v.source.length||!v.source.every(source)||!Array.isArray(v.overrides)||v.overrides.some((o:unknown)=>!record(o)||!id(o.code)||!id(o.explanation))||!Array.isArray(v.funding)||v.funding.some((f:unknown)=>!validFunding(f)))throw new Error('Invalid resource provenance.');
    if(v.origin==='free-creation'&&(v.mode!=='free'||!v.overrides.length))throw new Error('Missing Free Creation provenance.');
    if(v.reviews!==undefined&&validateResourceRequest({...p,reviews:v.reviews},catalog).length)throw new Error('Invalid resource review.');
    if(v.reviewContext!==undefined&&!text(v.reviewContext))throw new Error('Invalid review context.');
    if(v.quotedCost!==undefined&&(!record(v.quotedCost)||!(v.quotedCost.kind==='known'?rps(v.quotedCost.rps):v.quotedCost.kind==='unknown'?id(v.quotedCost.questionId):v.quotedCost.kind==='unavailable'&&id(v.quotedCost.reason))))throw new Error('Invalid saved quotation.');
    for(const f of v.funding){
      if(f.origin.kind==='lifepath'&&(!lifepaths.lifepaths.has(f.origin.variantId)||f.poolId!==f.origin.variantId+'#'+f.origin.occurrence))throw new Error('Invalid lifepath funding identity.');
      if(f.origin.kind==='override'&&!f.poolId.startsWith('override:'))throw new Error('Invalid override funding identity.');
    }
    // Reconstruct the historical record, discarding derived access/diagnostics.
    return {id:p.id,definitionId:p.definitionId,configuration:p.configuration,originalPaidRps:p.originalPaidRps,links:p.links,declaredItems:p.declaredItems,provenance:{mode:v.mode,origin:v.origin,catalogRevision:v.catalogRevision,source:v.source,overrides:v.overrides,funding:v.funding.map((f:any)=>({poolId:f.poolId,paidRps:f.paidRps,origin:f.origin})),...(v.quotedCost?{quotedCost:v.quotedCost}:{}),...(v.reviews?{reviews:v.reviews,reviewContext:v.reviewContext}:{})}};
  });
  const errors=resourceLedgerErrors(result,catalog);if(errors.length)throw new Error(errors.join(' '));return result;
}
export function parseResourceChoices(value:unknown):ResourceBurningChoices|undefined {
  if(value===undefined)return undefined;
  if(!record(value)||typeof value.roundUpResources!=='boolean'||!record(value.grayResources)||typeof value.grayResources.requested!=='boolean'||typeof value.grayResources.gmPermissionRecorded!=='boolean')throw new Error('Invalid resource choices.');
  return {roundUpResources:value.roundUpResources,grayResources:{requested:value.grayResources.requested,gmPermissionRecorded:value.grayResources.gmPermissionRecorded}};
}
export function parseResourceBudgetOverrides(value:unknown):readonly ResourceBudgetOverride[] {
  if(value===undefined)return [];
  if(!Array.isArray(value)||value.length>200||!unique(value.map(v=>v?.id))||value.some(v=>!record(v)||!id(v.id)||!rps(v.rps)||!id(v.reason)))throw new Error('Invalid resource budget override.');
  return value.map(v=>({id:v.id,rps:v.rps,reason:v.reason}));
}

export function validResourceContext(value:unknown):boolean {
  if(!record(value))return false;
  if(['campaignLifepathLimit','campaignExponentCap'].some(k=>value[k]!==undefined&&!rps(value[k])))return false;
  if(value.companions!==undefined&&(!record(value.companions)||Object.values(value.companions).some(n=>!record(n)||typeof n.complete!=='boolean'||!rps(n.lifepathCount)||!rps(n.highestExponent)||!rps(n.reciprocalRelationshipRps)||typeof n.ownGearPaid!=='boolean')))return false;
  return value.accessConditions===undefined||(Array.isArray(value.accessConditions)&&value.accessConditions.every((c:unknown)=>record(c)&&id(c.poolId)&&id(c.code)&&text(c.message)&&['restricted','unresolved'].includes(c.access)));
}
