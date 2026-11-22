import type { Sheet, Ability } from './burning';
import type { LifepathProgress } from './lifepaths';
import { resourceContribution } from './traits';
import { humanResources, registerResources, startingAbilityRules as rules, propertyAccessRule } from '../data/resources';
import type { ResourceCost, ResourceQuality } from '../data/resources';
import type { ResourceBurningChoices, ResourceFundingAllocation, ResourceFundingAccess, ResourceProjection, ResourceTotal } from '../character/resource-contracts';
import type { ResourceBudget, ResourceCatalog, ResourceContext, ResourceIssue, ResourceQuote, ResourceRequest, QuotedResourceCost } from './resource-types';
import { defaultResourceChoices } from './resource-types';
import { validateResourceRequest, validResourceContext } from './resource-validation';
export type * from './resource-types';
export { defaultResourceChoices } from './resource-types';
export const resourceCatalog = registerResources(humanResources);
export const resourceCatalogRevision = 'M3-A1-144-D039';
const sum=(xs:readonly number[])=>xs.reduce((a,b)=>a+b,0);
export const knownRps=(total:ResourceTotal)=>total.kind==='known'?total.rps:total.knownRps;
const total=(rps:number,ids:readonly string[]):ResourceTotal=>ids.length?{kind:'incomplete',knownRps:rps,unresolvedIds:[...new Set(ids)]}:{kind:'known',rps};

export function resourceBudget(sheet:Sheet,progress:LifepathProgress):ResourceBudget {
  const families=new Map<string,number>(),variants=new Map<string,number>();
  const funding=(sheet.resourcePurchases??[]).flatMap(p=>p.provenance.funding);
  const pools:ResourceBudget['pools'][number][]=progress.paths.map(path=>{
    const repeat=(families.get(path.familyId)??0)+1;families.set(path.familyId,repeat);
    const occurrence=(variants.get(path.variantId)??0)+1;variants.set(path.variantId,occurrence);
    const id=path.variantId+'#'+occurrence;
    const grantedRps=resourceContribution(path,repeat);
    const spentRps=sum(funding.filter(f=>f.poolId===id).map(f=>f.paidRps));
    return {id,origin:{kind:'lifepath',variantId:path.variantId,occurrence},settingId:path.settingId,grantedRps,spentRps,remainingRps:grantedRps-spentRps,unresolvedIds:path.resourceGrant.kind==='wifeDerived'?['wife-grants']:[]};
  });
  for(const grant of sheet.resourceBudgetOverrides??[]){
    const id='override:'+grant.id,spentRps=sum(funding.filter(f=>f.poolId===id).map(f=>f.paidRps));
    pools.push({id,origin:{kind:'override',reason:grant.reason},grantedRps:grant.rps,spentRps,remainingRps:grant.rps-spentRps,unresolvedIds:[]});
  }
  return {total:total(sum(pools.map(p=>p.grantedRps)),pools.flatMap(p=>p.unresolvedIds)),pools};
}

/** Human mapping uses explicit setting IDs, never labels or ID substring guesses.
 * Noble Court is kept unresolved: p. 200 does not explicitly name that subsetting. */
export function fundingAccess(pools:readonly {id:string;settingId?:string}[],activeTraits:readonly string[],context:ResourceContext={}):ResourceFundingAccess[]{
  return pools.map(pool=>{
    const conditions=[...(context.accessConditions??[]).filter(c=>c.poolId===pool.id)];
    if(activeTraits.includes('outlaw')){
      if(['human.city-dweller','human.noble','human.religious'].includes(pool.settingId??''))conditions.push({poolId:pool.id,access:'restricted',code:'outlaw',message:'Outlaw: rps may be spent; assets are currently inaccessible (BWGR 200).'});
      else if(pool.settingId==='human.noble-court')conditions.push({poolId:pool.id,access:'unresolved',code:'outlaw-noble-court',message:'Review whether Noble Court is included in Noble resources (BWGR 200).'});
    }
    return {poolId:pool.id,access:conditions.some(c=>c.access==='unresolved')?'unresolved':conditions.length?'restricted':'available',reasons:conditions.map(c=>({code:c.code,message:c.message,...c.code==='outlaw'?{traitId:'outlaw'}:{}}))};
  });
}
export function resourceReviewContext(sheet:Sheet,p:LifepathProgress,context:ResourceContext={}):string {
  return JSON.stringify({paths:p.paths.map(x=>x.variantId),traits:(sheet.traitPurchases??[]).map(x=>x.id).sort(),skills:sheet.purchases.map(x=>x.skillId).sort(),will:sheet.stats.will,context});
}
function diagnostic(code:string,message:string,blocking=true,questionId?:string):ResourceIssue {
  return {code,message,blocking,severity:code.startsWith('review')?'review':'error',...(questionId?{questionId}:{})};
}
/** Quote and commit share one allocation plan; no alternate affordability logic. */
function planFunding(sheet:Sheet,progress:LifepathProgress,request:ResourceRequest,paidRps:number):{funding:ResourceFundingAllocation[];issues:ResourceIssue[]} {
  const budget=resourceBudget(sheet,progress),issues:ResourceIssue[]=[];
  const bypass=!!request.override;
  let funding:ResourceFundingAllocation[]=[];
  if(request.funding)funding=request.funding.map(f=>({...f,origin:{...f.origin}}));
  else {
    let remaining=paidRps;
    for(const pool of budget.pools){
      if(pool.unresolvedIds.length||(!bypass&&pool.origin.kind==='override'))continue;
      const amount=Math.min(Math.max(0,pool.remainingRps),remaining);
      if(amount){funding.push({poolId:pool.id,paidRps:amount,origin:pool.origin});remaining-=amount;}
      if(!remaining)break;
    }
    if(remaining&&bypass&&budget.pools.length){
      const pool=budget.pools[0],found=funding.find(f=>f.poolId===pool.id);
      if(found)funding=funding.map(f=>f===found?{...f,paidRps:f.paidRps+remaining}:f);
      else funding.push({poolId:pool.id,paidRps:remaining,origin:pool.origin});
      remaining=0;
    }
    if(remaining)issues.push(diagnostic('insufficient-funds','Not enough confirmed resource points in the current funding pools.'));
  }
  if(request.funding&&sum(funding.map(f=>f.paidRps))!==paidRps)issues.push(diagnostic('invalid-funding','Funding must equal the actual debit.'));
  for(const f of funding){
    const pool=budget.pools.find(p=>p.id===f.poolId);
    const same=pool&&pool.origin.kind===f.origin.kind&&(pool.origin.kind==='lifepath'&&f.origin.kind==='lifepath'?pool.origin.variantId===f.origin.variantId&&pool.origin.occurrence===f.origin.occurrence:pool.origin.kind==='override'&&f.origin.kind==='override'&&pool.origin.reason===f.origin.reason);
    if(!same)issues.push(diagnostic('invalid-funding','Funding must identify a current source and its exact origin.'));
    else if(!bypass&&(pool!.unresolvedIds.length||f.paidRps>pool!.remainingRps||pool!.origin.kind==='override'))issues.push(diagnostic('insufficient-funds','Funding exceeds confirmed availability or uses a Free Creation source.'));
  }
  if(!bypass&&(budget.pools.some(p=>p.remainingRps<0)||(sheet.resourcePurchases??[]).some(p=>p.provenance.funding.some(f=>!budget.pools.some(pool=>pool.id===f.poolId)))))issues.push(diagnostic('funding-repair','Repair missing or overspent historical funding before a new Rules purchase.'));
  return {funding,issues};
}
export function quoteResource(sheet:Sheet,progress:LifepathProgress,request:ResourceRequest,context:ResourceContext={},catalog:ResourceCatalog=resourceCatalog):ResourceQuote {
  const invalid=validateResourceRequest(request,catalog);
  if(!validResourceContext(context))invalid.push('Invalid campaign, companion or access facts.');
  if(invalid.length)return {status:'unavailable',cost:{kind:'unavailable',reason:invalid.join(' ')},diagnostics:invalid.map(m=>diagnostic('invalid-data',m))};
  const d=catalog.get(request.definitionId)!;
  const c=request.configuration,ledger=(sheet.resourcePurchases??[]).filter(p=>p.id!==request.id),issues:ResourceIssue[]=[];
  const review=(id:string,message:string,required=true)=>{
    const acknowledged=request.reviews?.some(r=>r.questionId===id&&r.explanation.trim());
    issues.push(diagnostic('review-'+id,message,required&&!acknowledged,id));
  };
  if(!progress.paths.length)issues.push(diagnostic('no-lifepath','Choose a lifepath first.'));
  if(progress.paths.length&&!d.stockIds.includes(progress.paths[0].stockId))issues.push(diagnostic('stock','Unavailable for this stock.'));
  const parent=ledger.find(p=>p.id===request.links?.parentPurchaseId);
  const target=parent?.declaredItems.find(i=>i.id===request.links?.targetItemId);
  const quality:ResourceQuality|undefined=target?.quality??(parent?.configuration.kind==='quality'?parent.configuration.quality:undefined);
  if(d.additions){
    if(!parent||!d.additions.parentDefinitionIds.includes(parent.definitionId))issues.push(diagnostic('invalid-parent','Addition requires a compatible purchased parent.'));
    if(d.additions.target==='physical-weapon'){
      if(!target||target.kind!=='weapon'||!quality)issues.push(diagnostic('invalid-target','Choose a declared physical weapon with a known quality.'));
      else if(d.additions.weaponKinds&&!d.additions.weaponKinds.includes(target.weaponKind as 'axe'))issues.push(diagnostic('weapon-kind','This modification cannot be fitted to that weapon kind.'));
    }
  }
  let cost:QuotedResourceCost;
  const resolve=(value:ResourceCost):QuotedResourceCost=>{
    if(value.kind==='fixed')return {kind:'known',rps:value.rps};
    if(value.kind==='included'){
      if(!parent||!value.parentDefinitionIds.includes(parent.definitionId))return {kind:'unavailable',reason:'Included option requires a compatible parent.'};
      if(catalog.get(parent.definitionId)?.includedOptions?.includes(d.id)&&!(parent.configuration.kind==='armor'&&parent.configuration.selectedIncludedDefinitionIds.includes(d.id)))return {kind:'unavailable',reason:'Included shield must be explicitly selected in the parent configuration.'};
      return {kind:'known',rps:0};
    }
    return value;
  };
  const price=d.price;
  switch(price.kind){
    case 'quality': cost=c.kind==='quality'?resolve(price.costs[c.quality]):{kind:'unavailable',reason:'Choose quality.'};break;
    case 'armor': cost=c.kind==='armor'?resolve(price.costs[c.quality][c.piece]):{kind:'unavailable',reason:'Choose armor quality and piece.'};break;
    case 'target-quality': cost=quality?resolve(price.costs[quality]):{kind:'unavailable',reason:'Target quality is unknown.'};break;
    case 'rating': { const tier=(c.kind==='affiliation'||c.kind==='reputation')?price.tiers.find(t=>t.dice===c.dice):undefined;cost=tier?{kind:'known',rps:tier.rps}:{kind:'unavailable',reason:'Choose dice rating.'};break; }
    case 'relationship': {
      if(c.kind!=='relationship'){cost={kind:'unavailable',reason:'Choose relationship modifiers.'};break;}
      const r=price.baseRps[c.significance]+(c.family==='immediate'?price.modifiers['immediate-family']:c.family==='other'?price.modifiers['other-family']:0)+(c.romantic?price.modifiers.romantic:0)+(c.forbidden?price.modifiers.forbidden:0)+(c.hateful?price.modifiers.hateful:0);
      cost={kind:'known',rps:Math.max(price.minimumRps,r)};break;
    }
    case 'sum-children': {
      cost={kind:'known',rps:price.overheadRps};
      if(c.kind==='gang'){
        const ids=[c.seniorRelationshipPurchaseId,c.affiliationPurchaseId,c.reputationPurchaseId];
        ids.forEach((id,i)=>{const child=ledger.find(x=>x.id===id);if(!child||child.definitionId!==price.childDefinitionIds[i]||child.links.groupPurchaseId!==request.id)issues.push(diagnostic('invalid-group','Gang needs its three uniquely owned, linked component purchases.'));});
        const social=ids.slice(1).map(id=>ledger.find(x=>x.id===id)?.configuration);
        if(social.some(x=>!(x?.kind==='affiliation'||x?.kind==='reputation')||x.organizationId!==c.organizationId))issues.push(diagnostic('invalid-group','Gang affiliation and reputation must reference the selected group.'));
      }
      break;
    }
    default: cost=resolve(price);
  }
  let companionRequirements:ResourceQuote['companionRequirements'];
  for(const constraint of d.constraints){
    switch(constraint.kind){
      case 'skill': if(!sheet.purchases.some(p=>p.skillId===constraint.skillId&&p.kind==='open'))issues.push(diagnostic('required-skill','Requires an opened '+constraint.skillId+' skill.'));break;
      case 'herd-eligibility': if(!sheet.purchases.some(p=>p.skillId===constraint.skillId&&p.kind==='open')&&!progress.paths.some(p=>constraint.lifepathNames.includes(p.sourceName)))issues.push(diagnostic('herd-eligibility','Requires Animal Husbandry or a listed qualifying lifepath (BWGR 204).'));break;
      case 'social-limit': {
        const others=ledger.filter(p=>catalog.get(p.definitionId)?.category===d.category);
        if(others.length>=constraint.maximumPurchased)issues.push(diagnostic('social-limit','At most three purchased '+d.category+' entries (BWGR 96).'));
        if(c.kind==='affiliation'||c.kind==='reputation'){
          if(c.organizationId&&others.some(p=>(p.configuration.kind==='affiliation'||p.configuration.kind==='reputation')&&p.configuration.organizationId===c.organizationId))issues.push(diagnostic('social-organization','Purchased entries must concern distinct groups (BWGR 96).'));
          review('social-scope','Confirm the described scope and distinct audience/group within the character’s Circles.');
        }
        break;
      }
      case 'companion-character': {
        companionRequirements={maximumLifepaths:context.campaignLifepathLimit===undefined?null:context.campaignLifepathLimit-constraint.fewerLifepaths,maximumExponent:context.campaignExponentCap===undefined?null:context.campaignExponentCap-1,reciprocalRelationshipRps:constraint.reciprocalRelationshipRps,ownGear:true};
        const npc=c.kind==='companion'?context.companions?.[c.linkedCharacterId]:undefined;
        if(companionRequirements.maximumLifepaths===null||companionRequirements.maximumExponent===null||companionRequirements.maximumLifepaths<1||companionRequirements.maximumExponent<1)issues.push(diagnostic('review-companion-limits','Supply meaningful campaign lifepath/exponent limits; tiny limits remain unresolved.',true,'companion-limits'));
        else if(!npc)issues.push(diagnostic('review-companion-character','Supply a fully burned linked companion and its paid reciprocal relationship and gear.',true,'companion-limits'));
        else if(!npc.complete||npc.lifepathCount>companionRequirements.maximumLifepaths||npc.highestExponent>companionRequirements.maximumExponent||npc.reciprocalRelationshipRps!==10||!npc.ownGearPaid)issues.push(diagnostic('companion-character','Linked companion does not meet the campaign limits, reciprocal relationship or own gear requirements.'));
        break;
      }
      case 'review': {
        if(constraint.questionId==='relationship-combinations'){if(c.kind==='relationship'&&c.additionalConditions.trim())review(constraint.questionId,'Review additional fictional conditions; structured discounts are unchanged.');}
        else if(constraint.questionId==='weapon-modification-stacking'){if(ledger.some(p=>p.links.targetItemId&&p.links.targetItemId===request.links?.targetItemId))review(constraint.questionId,'Compatibility of repeated/combined modifications requires table review.');}
        else if(constraint.questionId!=='companion-limits'){
          // A starred single purchase above 40 is forbidden without an exception
          // under both possible aggregate/per-item readings. Boundary/ships stay review.
          if(constraint.questionId==='property-threshold'&&d.printedPropertyStar&&d.price.kind==='fixed'&&d.price.rps>propertyAccessRule.textThresholdRps&&!progress.paths.some(p=>(propertyAccessRule.eligibleLifepathNames as readonly string[]).includes(p.sourceName))){
            if(progress.paths.some(p=>p.sourceName==='Master of Horses'))review('property-threshold','Master of Horse / Master of Horses source identity needs review.');
            else issues.push(diagnostic('property-eligibility','This starred property exceeds 40 rps and requires a listed qualifying lifepath (BWGR 205).'));
          }
          review(constraint.questionId,d.note);
        }
        break;
      }
    }
  }
  if(c.kind==='armor'&&c.substitutions.length)issues.push(diagnostic('review-armor-half-pieces','Substitution validation belongs to the future armor constructor; use separate confirmed piece purchases or an explicit Free Creation record.',true,'armor-half-pieces'));
  if(cost.kind==='unknown')issues.push(diagnostic('unknown-price','Price unresolved: '+cost.questionId,true,cost.questionId));
  if(cost.kind==='unavailable')issues.push(diagnostic('unavailable-price',cost.reason));
  const payable=request.override?.paidRps??(cost.kind==='known'?cost.rps:undefined);
  const allocation=payable===undefined?undefined:planFunding({...sheet,resourcePurchases:ledger},progress,request,payable);
  if(allocation)issues.push(...allocation.issues);
  const structural=issues.some(i=>i.code.startsWith('invalid-')||i.code==='insufficient-funds');
  if(request.override&&!structural)return {cost,status:'override',payableRps:request.override.paidRps,funding:allocation?.funding,diagnostics:issues,companionRequirements};
  const blocked=issues.filter(i=>i.blocking);
  return {cost,status:blocked.length?blocked.every(i=>i.code.startsWith('review')||i.code==='unknown-price')?'review':'unavailable':'available',...cost.kind==='known'?{payableRps:cost.rps}:{},funding:allocation?.funding,diagnostics:issues,companionRequirements};
}

export function startingResourceAbilities(resourcesRps:number,circlesRps:ResourceTotal,will:Ability|null,choices:ResourceBurningChoices,budget:ResourceTotal,spentRps:number):Pick<ResourceProjection,'startingResources'|'startingCircles'> {
  const rawExponent=Math.floor(resourcesRps/rules.resourcesDivisor);
  const rounded=choices.roundUpResources?Math.ceil(resourcesRps/rules.resourcesDivisor):rawExponent;
  const gray=choices.grayResources.requested&&choices.grayResources.gmPermissionRecorded&&rounded>=rules.grayResourcesExponentCost;
  const remainder=resourcesRps%rules.resourcesDivisor;
  const rawSoCloseEligible=budget.kind==='incomplete'?'unknown':budget.rps===spentRps&&remainder>=rules.resourcesDivisor-rules.rawSoClose.maximumShortfallRps&&remainder!==0;
  const bonus:0|1|'unresolved'=knownRps(circlesRps)>=rules.circlesQualifyingSpendThresholdRps?1:circlesRps.kind==='incomplete'?'unresolved':0;
  return {startingResources:{rawExponent,ability:{exponent:rounded-(gray?rules.grayResourcesExponentCost:0),shade:gray?'G':'B'},manualRoundUpApplied:rounded!==rawExponent,rawSoCloseEligible},startingCircles:{ability:will&&will.exponent>0?{exponent:Math.max(rules.circlesMinimum,Math.floor(will.exponent/rules.circlesWillDivisor))+(bonus===1?1:0),shade:will.shade}:null,propertyAndRelationshipBonus:bonus}};
}
export function projectResources(sheet:Sheet,progress:LifepathProgress,context:ResourceContext={},catalog:ResourceCatalog=resourceCatalog):ResourceProjection {
  const ledger=sheet.resourcePurchases??[],budget=resourceBudget(sheet,progress),choices=sheet.resourceChoices??defaultResourceChoices;
  const spentRps=sum(ledger.map(p=>p.originalPaidRps)),diagnostics:ResourceProjection['diagnostics'][number][]=[];
  const access=fundingAccess(budget.pools,(sheet.traitPurchases??[]).map(p=>p.id),context);
  for(const f of ledger.flatMap(p=>p.provenance.funding)){
    if(!access.some(a=>a.poolId===f.poolId))access.push({poolId:f.poolId,access:'unresolved',reasons:[{code:'missing-funding-source',message:'Original source is absent from the current route; no current access can be certified.'}]});
  }
  let resourcesRps=0,circlesKnown=0,restrictedAccounting=false;const circlesQuestions:string[]=[];
  const report=(code:string,message:string,purchaseId?:string,questionId?:string,severity:'error'|'review'='review')=>diagnostics.push({code,message,severity,...purchaseId?{purchaseId}:{},...questionId?{questionId}:{}});
  for(const p of ledger){
    const d=catalog.get(p.definitionId);
    if(!d){report('unknown-definition','Unknown purchase definition.',p.id,undefined,'error');continue;}
    if(d.accounting.resources)resourcesRps+=p.originalPaidRps;
    if(d.accounting.circles===true)circlesKnown+=p.originalPaidRps;
    else if(typeof d.accounting.circles==='object'&&p.originalPaidRps>0)circlesQuestions.push(d.accounting.circles.questionId);
    const reviews=p.provenance.reviewContext===resourceReviewContext(sheet,progress,context)?p.provenance.reviews:[];
    const quote=quoteResource(sheet,progress,{...p,reviews},context,catalog);
    quote.diagnostics.forEach(i=>report(i.code,i.message,p.id,i.questionId,i.blocking?'error':'review'));
    if(p.provenance.origin==='free-creation')report('free-creation','Recorded Free Creation override; paid price is preserved.',p.id);
    if(quote.cost.kind==='known'&&quote.cost.rps!==p.originalPaidRps)report('historical-price','Current quote differs from the historical debit; refund uses the original charge.',p.id);
    for(const f of p.provenance.funding){
      if(!budget.pools.some(pool=>pool.id===f.poolId))report('missing-funding-source','Original funding source is absent; no points were moved to another pool.',p.id,undefined,'error');
    }
    const limited=p.provenance.funding.some(f=>f.paidRps>0&&access.find(a=>a.poolId===f.poolId)?.access!=='available');
    if(limited){
      report('restricted-funding','Current access to funded assets needs review; historical cost is unchanged.',p.id,'outlaw-pools');
      if(d.accounting.resources||d.accounting.circles!==false)restrictedAccounting=true;
    }
  }
  for(const pool of budget.pools){if(pool.remainingRps<0)report('overspent-pool',pool.id+' is overspent by '+-pool.remainingRps+'.',undefined,undefined,'error');}
  if(budget.total.kind==='incomplete')report('incomplete-budget','Some resource grants remain unresolved.',undefined,'wife-grants');
  if(sheet.resourceBudgetOverrides?.length)report('budget-override','Budget includes explicit Free Creation grants.');
  if(circlesQuestions.length)report('circles-accounting','Workshop/Herd/Rent contribution to Circles remains unresolved.',undefined,'property-circles-inclusion');
  const circlesRps=total(circlesKnown,circlesQuestions);
  const abilities=startingResourceAbilities(resourcesRps,circlesRps,sheet.stats.will,choices,budget.total,spentRps);
  if(!abilities.startingCircles.ability)report('allocate-will','Allocate Will before calculating Circles.');
  if(choices.roundUpResources&&abilities.startingResources.rawSoCloseEligible!==true)report('so-close-conditions','Manual rounding is selected; RAW all-spent/shortfall conditions are not established.');
  if(choices.grayResources.requested&&abilities.startingResources.ability.shade!=='G')report('gray-resources','Gray Resources needs five exponent points and recorded GM permission.');
  if(restrictedAccounting)report('unresolved-starting-abilities','Restricted funding leaves starting ability treatment unresolved; displayed arithmetic is a draft preview.',undefined,'outlaw-pools');
  const socialBonuses:ResourceProjection['socialBonuses'][number][]=ledger.flatMap(p=>p.configuration.kind==='reputation'||p.configuration.kind==='affiliation'?[{...p.configuration,purchaseId:p.id}]:[]);
  if(sheet.traitPurchases?.some(p=>p.id==='outlaw'))socialBonuses.push({kind:'reputation',name:'Outlaw',description:'Infamous reputation (BWGR 200).',audience:'Town and city folk and nobility',scope:'Town/city folk and nobility',dice:1,traitId:'outlaw'});
  // Other trait grants and combinations remain manual; never count their dice as paid rps.
  if(sheet.traitPurchases?.some(p=>['keys-to-the-church','lesson-of-one','made-man','pardoner','vested','tonsured','bastard','apostate','darling-of-the-court','lord-of-ages'].includes(p.id)))report('social-trait-interactions','Trait social grants/combinations require review; only paid acquisitions enter rps arithmetic.',undefined,'social-trait-interactions');
  return {cashDice:sum(ledger.map(p=>catalog.get(p.definitionId)?.grants?.cashDice??0)),stockId:progress.paths[0]?.stockId??'human',budget:budget.total,spentRps,remaining:total(knownRps(budget.total)-spentRps,budget.total.kind==='incomplete'?budget.total.unresolvedIds:[]),fundingAccess:access,qualifyingSpend:{resourcesRps,circlesRps},...abilities,calculationStatus:{resources:restrictedAccounting?'unresolved':'known',circles:restrictedAccounting||abilities.startingCircles.propertyAndRelationshipBonus==='unresolved'||!abilities.startingCircles.ability?'unresolved':'known'},items:ledger.flatMap(p=>p.declaredItems.map(i=>({...i,purchaseId:p.id,modificationPurchaseIds:ledger.filter(child=>child.links.targetItemId===i.id).map(child=>child.id)}))),socialBonuses,diagnostics};
}
