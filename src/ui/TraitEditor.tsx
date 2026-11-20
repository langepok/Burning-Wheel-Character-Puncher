import { useState } from 'react';
import { traits } from '../data/traits';
import type { TraitSource } from '../data/traits/types';
import { purchaseTrait, refundTrait, changeTraitCategory } from '../character/traits';
import type { BuildMode } from '../character/lifepath-history';
import type { Sheet } from '../rules/burning';
import type { LifepathProgress } from '../rules/lifepaths';
import { accessIssues, traitCost, traitState } from '../rules/traits';

const sourceLabels={
  matched:'Index and article heading matched',index:'Index entry', 'index-checked':'Index cross-check',
  article:'Article heading checked',path:'Lifepath source only'
};
export function TraitEditor({sheet,progress,mode,onChange,onError}:{sheet:Sheet;progress:LifepathProgress;mode:BuildMode;onChange:(s:Sheet)=>void;onError:(s:string)=>void}){
  const state=traitState(sheet,progress);
  const [query,setQuery]=useState(''),[filter,setFilter]=useState(progress.paths.length?'Lifepaths':'Catalog'),[limit,setLimit]=useState(30);
  const [override,setOverride]=useState('1');
  const act=(id:string,source:TraitSource)=>{
    const result=purchaseTrait(sheet,progress,id,source,mode);
    if(result.error)onError(result.error);else onChange(result.sheet);
  };
  const found=[...traits.values()].filter(t=>t.name.toLowerCase().includes(query.toLowerCase())
    && (filter==='Catalog'||(filter==='Owned'?state.owned.has(t.id):state.paths.some(p=>p.ids.includes(t.id)))));
  return <section aria-label="Trait burner"><div className="section-top"><h2>Trait burner</h2>
    <span className="point-total">{state.remaining} / {state.total} <small>trait points left</small></span></div>
    {state.missing.length>0 && <p>Required purchases: {state.missing.map(m=>traits.get(m.id)!.name).join(', ')}.</p>}
    <div className="trait-toolbar"><label>Search traits <input type="search" value={query} onChange={e=>{setQuery(e.target.value);setLimit(30);}}/></label>
    <label>Show <select value={filter} onChange={e=>{setFilter(e.target.value);setLimit(30);}}>{['Lifepaths','Catalog','Owned'].map(x=><option key={x}>{x}</option>)}</select></label>
    {mode==='free'&&<label>Override cost <input type="number" min="0" max="100" value={override} onChange={e=>setOverride(e.target.value)}/></label>}</div>
    <p>{found.length} matching traits · {state.owned.size} owned</p><div className="trait-cards">
    {found.slice(0,limit).map(t=>{
      const paid=state.ledger.find(p=>p.id===t.id);
      const paths=state.paths.filter(p=>p.ids.includes(t.id));
      const catalogIssues=accessIssues(t,{kind:'catalog'},state);
      const owned=state.owned.has(t.id);
      return <article key={t.id}><h3>{t.name}</h3><small>{t.type} · BWGR {t.pages.join(', ')} · {sourceLabels[t.coverage]}</small>
        <p>{t.note??(t.effect==='review'?'Effect requires source review.':'Used during play.')}</p>
        {owned?<><strong>Owned · {paid?paid.cost+' TP':'free common trait'}</strong>
         {paid && t.categories && <fieldset><legend>Animal categories · first included, then 1 TP each</legend>
          {t.categories.map(c=><label key={c}><input type="checkbox" checked={paid.categories?.includes(c)??false} onChange={()=>{
            const result=changeTraitCategory(sheet,progress,t.id,c,mode);
            if(result.error)onError(result.error);else onChange(result.sheet);
          }}/>{c}</label>)}</fieldset>}
        {t.poolTransfer && <label><input type="checkbox" checked={sheet.choices['trait:'+t.id]==='transfer'} onChange={e=>onChange({...sheet,choices:{...sheet.choices,['trait:'+t.id]:e.target.checked?'transfer':'keep'}})}/> {t.note}</label>}
        {paid&&<><p>{paid.source.kind==='lifepath'?paid.source.path+' · visit '+paid.source.occurrence:paid.source.kind} · {paid.mode}</p><button onClick={()=>onChange(refundTrait(sheet,t.id))}>Refund {paid.cost} TP</button></>}</>:
        <>{paths.map(p=><button key={p.source.path+p.source.occurrence} onClick={()=>act(t.id,p.source)}>{p.required===t.id?'Required':'Buy'} · {p.name} #{p.source.occurrence} · 1 TP</button>)}
        {t.price!==null && <button disabled={mode==='rules'&&catalogIssues.length>0} onClick={()=>act(t.id,{kind:'catalog'})}>Buy from catalog · {t.price} TP</button>}
        {catalogIssues.length>0 && <small>{catalogIssues.join(' ')}</small>}
        {!accessIssues(t,{kind:'fey'},state).length && traitCost(t,{kind:'fey'})!==null &&
          <button onClick={()=>act(t.id,{kind:'fey'})}>Fey Blood · {traitCost(t,{kind:'fey'})} TP</button>}
        {mode==='free'&&<button disabled={override.trim()===''} onClick={()=>act(t.id,{kind:'free',points:Number(override)})}>Use override · {override} TP</button>}</>}
      </article>;
    })}</div>{found.length>limit&&<button onClick={()=>setLimit(limit+30)}>Show more traits</button>}
    {state.issues.length>0&&<details><summary>Trait review ({state.issues.length})</summary><ul>{state.issues.map((s,i)=><li key={i}>{s}</li>)}</ul></details>}
  </section>;
}
