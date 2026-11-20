import { useState, useRef, useEffect } from 'react';
import { traits } from '../data/traits';
import type { Trait, TraitSource } from '../data/traits/types';
import { purchaseTrait, refundTrait, changeTraitCategory, shortlistTrait, traitPurchaseError } from '../character/traits';
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
  const [active,setActive]=useState('');
  const [catalog,setCatalog]=useState(false);
  const [override,setOverride]=useState('1');
  const candidates=sheet.traitCandidates??[];
  const worklist=new Set([...candidates,...state.owned]);
  const required=state.paths.filter(p=>p.required);
  function consider(id:string){
    if(!worklist.has(id))onChange(shortlistTrait(sheet,id));
    setActive(id);
  }
  function offers(t:Trait){
    const options:{source:TraitSource;label:string}[]=state.paths.filter(p=>p.ids.includes(t.id))
      .map(p=>({source:p.source,label:p.name+' #'+p.source.occurrence}));
    if(t.price!==null)options.push({source:{kind:'catalog'},label:'General catalog'});
    if(!accessIssues(t,{kind:'fey'},state).length)options.push({source:{kind:'fey'},label:'Fey Blood'});
    return options;
  }
  const available=(t:Trait)=>offers(t).some(o=>!traitPurchaseError(state,t.id,o.source,'rules'));
  function detail(t:Trait,browse:boolean){
    const paid=state.ledger.find(p=>p.id===t.id);
    const owned=state.owned.has(t.id);
    const options=offers(t);
    function buy(source:TraitSource){
      const result=purchaseTrait(sheet,progress,t.id,source,mode);
      if(result.error)onError(result.error);else onChange(result.sheet);
    }
    return <div className="trait-detail"><h3>{t.name}</h3>
      <small>{t.type} · BWGR {t.pages.join(', ')} · {sourceLabels[t.coverage]}</small>
      <p>{t.note??(t.type==='character'?'Descriptive character trait.':'See the cited rules for its effect during play.')}</p>
      {owned && <strong>Owned · {paid?paid.cost+' TP':'free common trait'}</strong>}
      {owned && !browse && <>
        {paid && t.categories && <fieldset><legend>Animal categories · first included, then 1 TP each</legend>
          {t.categories.map(c=><label key={c}><input type="checkbox" checked={paid.categories?.includes(c)??false} onChange={()=>{
            const result=changeTraitCategory(sheet,progress,t.id,c,mode);
            if(result.error)onError(result.error);else onChange(result.sheet);
          }}/>{c}</label>)}</fieldset>}
        {t.poolTransfer && <label><input type="checkbox" checked={sheet.choices['trait:'+t.id]==='transfer'} onChange={e=>onChange({...sheet,choices:{...sheet.choices,['trait:'+t.id]:e.target.checked?'transfer':'keep'}})}/> {t.note}</label>}
        {paid&&<><p>{paid.source.kind==='lifepath'?paid.source.path+' · visit '+paid.source.occurrence:paid.source.kind} · {paid.mode}</p><button onClick={()=>onChange(refundTrait(sheet,t.id))}>Refund {paid.cost} TP</button></>}</>}
      {!owned && <div>{options.map(({source,label})=>{
        const reason=traitPurchaseError(state,t.id,source,browse?'rules':mode);
        const text=label+' · '+traitCost(t,source)+' TP';
        return <div key={label}>{browse?<span>{text}</span>:<button disabled={!!reason} onClick={()=>buy(source)}>Buy · {text}</button>}
          {reason&&<small> {reason}</small>}</div>;
      })}{options.length===0&&<p>No purchase source on this route.</p>}</div>}
      {!browse && !owned && mode==='free'&&<label>Override cost <input type="number" min="0" max="100" value={override} onChange={e=>setOverride(e.target.value)}/>
        <button disabled={!override.trim()} onClick={()=>buy({kind:'free',points:Number(override)})}>Use override</button></label>}
      {browse?<button disabled={worklist.has(t.id)} onClick={()=>consider(t.id)}>{worklist.has(t.id)?'In worklist':'Add to worklist'}</button>:
        !owned&&<button onClick={()=>onChange({...sheet,traitCandidates:candidates.filter(id=>id!==t.id)})}>Remove from shortlist</button>}
    </div>;
  }
  return <section aria-label="Trait burner"><div className="section-top"><h2>Trait burner</h2>
    <span className="point-total">{state.remaining} / {state.total} <small>trait points left</small></span></div>
    <section className="trait-required"><h3>Required by Lifepaths</h3>
    {required.length?<><p>{state.missing.length} TP still required</p>{required.map(p=><button key={p.source.path+p.source.occurrence}
      onClick={()=>{
        consider(p.required!);
        window.setTimeout(()=>document.getElementById('worklist-'+p.required)?.focus());
      }}>{traits.get(p.required!)!.name} · {p.name} #{p.source.occurrence} · 1 TP · {state.missing.some(m=>m.source===p.source)?'Required':'Fulfilled'}</button>)}</>:<p>No required purchases on this route.</p>}</section>
    <div className="section-top"><h3>Your Trait Worklist</h3><button onClick={()=>setCatalog(true)}>Explore Trait Catalog</button></div>
    {!worklist.size&&<p>Choose a required trait or add candidates from the catalog.</p>}
    {[...worklist].map(id=>{const t=traits.get(id)!;return <div className="trait-row" key={id}>
      <button id={'worklist-'+id} aria-expanded={active===id} onClick={()=>setActive(active===id?'':id)}><strong>{t.name}</strong><span className={state.owned.has(id)?'trait-owned':''}>{state.owned.has(id)?'Owned':'Considering'}</span></button>
      {active===id&&detail(t,false)}</div>;})}
    {catalog&&<TraitCatalog listed={id=>state.paths.some(p=>p.ids.includes(id))} available={available} detail={t=>detail(t,true)} close={()=>setCatalog(false)}/>}
    {state.issues.length>0&&<details><summary>Trait review ({state.issues.length})</summary><ul>{state.issues.map((s,i)=><li key={i}>{s}</li>)}</ul></details>}
  </section>;
}

function TraitCatalog({listed,available,detail,close}:{listed:(id:string)=>boolean;available:(t:Trait)=>boolean;detail:(t:Trait)=>React.ReactNode;close:()=>void}){
  const dialog=useRef<HTMLDialogElement>(null);
  const [query,setQuery]=useState(''),[type,setType]=useState(''),[availability,setAvailability]=useState('');
  const [selected,setSelected]=useState('');
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;
    if(dialog.current?.showModal)dialog.current.showModal();else dialog.current?.setAttribute('open','');
    dialog.current?.querySelector('input')?.focus();
    return ()=>previous?.focus();
  },[]);
  const results=[...traits.values()].filter(t=>t.name.toLowerCase().includes(query.trim().toLowerCase())&&(!type||t.type===type)
    &&(!availability||(availability==='listed'?listed(t.id):available(t)===(availability==='available'))));
  const current=results.find(t=>t.id===selected)??results[0];
  return <div className="modal-backdrop"><dialog ref={dialog} className="catalog-dialog" aria-label="Explore Trait Catalog"
    onCancel={e=>{e.preventDefault();close();}} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();close();}}}>
    <div className="section-top"><h2>Explore Trait Catalog</h2><button onClick={close}>Close catalog</button></div>
    <div className="trait-toolbar"><label>Search traits <input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label>
      <label>Type <select value={type} onChange={e=>setType(e.target.value)}><option value="">All types</option>
      {[...new Set([...traits.values()].map(t=>t.type))].map(v=><option key={v}>{v}</option>)}</select></label>
      <label>Rules availability <select value={availability} onChange={e=>setAvailability(e.target.value)}><option value="">All traits</option>
      <option value="listed">On my lifepaths</option><option value="available">Can buy now</option><option value="unavailable">Cannot buy now</option></select></label></div>
    <small>{results.length} matching traits</small><div className="catalog-body"><div className="catalog-results">{results.map(t=>
      <button key={t.id} aria-pressed={current?.id===t.id} className={current?.id===t.id?'selected':''} onClick={()=>setSelected(t.id)}>{t.name}</button>)}</div>
      <div className="catalog-detail">{current?detail(current):<p>No matching traits.</p>}</div></div>
  </dialog></div>;
}
