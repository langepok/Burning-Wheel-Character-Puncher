import type { Draft } from '../character/workbench';
import { describeResource } from '../character/resources';
import { resourceCatalog } from '../rules/resources';
export function ResourceOwnedCard({purchase:r,draft,onChange,onError,onReturn,sourceLabel}:{purchase:NonNullable<Draft['sheet']['resourcePurchases']>[number];draft:Draft;onChange:(d:Draft)=>void;onError:(s:string)=>void;onReturn:()=>void;sourceLabel:(origin:NonNullable<Draft['sheet']['resourcePurchases']>[number]['provenance']['funding'][number]['origin'])=>string}){
 const c=r.configuration,d=resourceCatalog.get(r.definitionId)!;
 const describe=(key:string,value:string)=>{const result=describeResource(draft.sheet,r.id,{[key]:value});result.error?onError(result.error):onChange({...draft,sheet:result.sheet});};
 const social=['relationship','affiliation','reputation','companion'].includes(c.kind);
 return <details className="resource-card" data-resource-id={r.id}><summary><b>{'name' in c&&c.name?c.name:d.sourceName}</b><span>Paid {r.originalPaidRps} rps</span></summary><p>{d.sourceName} · {d.category} · BWGR {r.provenance.source.flatMap(s=>s.printedPages).join(', ')}</p>
 {'quality' in c&&<p>Quality: {c.quality}</p>}{c.kind==='armor'&&<p>Piece: {c.piece}. Included selections: {c.selectedIncludedDefinitionIds.map(id=>resourceCatalog.get(id)?.sourceName).join(', ')||'None'}</p>}{'dice' in c&&<p>{c.dice}D · {c.scope}</p>}
 {social?<div className="resource-fields">{(['name','description','audience','scope'] as const).filter(k=>k in c).map(k=><label key={k}>{k}<textarea maxLength={20000} value={String((c as unknown as Record<string,unknown>)[k]??'')} onChange={e=>describe(k,e.target.value)}/></label>)}<small>Editing this description clears its prior assessment, without changing the original price. Return to preparation to review and buy again.</small></div>:'description' in c&&<p>{c.description}</p>}
 {r.provenance.funding.map(f=><p key={f.poolId}>{f.paidRps} rps · funding source {sourceLabel(f.origin)}</p>)}{r.declaredItems.map(item=><p key={item.id}>{item.name||'Unnamed object'} · {item.quality??'Quality not specified'}</p>)}
 {r.provenance.reviews?.map((review,i)=><p key={i}>Recorded assessment: {review.explanation}</p>)}
 {r.provenance.overrides.map((o,i)=><p key={i}>Free Creation: {o.explanation}</p>)}
 <button onClick={onReturn}>Return to preparation</button></details>;
}
