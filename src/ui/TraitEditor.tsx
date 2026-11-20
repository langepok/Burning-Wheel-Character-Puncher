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
const typeNames={character:'Character',die:'Die','call-on':'Call-on','die/call-on':'Die / Call-on',unresolved:'Unclassified'};
function TypeLabel({trait}:{trait:Trait}){
  return <span className="trait-type">{typeNames[trait.type]}</span>;
}
export function TraitEditor({sheet,progress,mode,onChange,onError,expanded,setExpanded,pathLabel}:{expanded:string[];setExpanded:React.Dispatch<React.SetStateAction<string[]>>;pathLabel:(id:string)=>string;sheet:Sheet;progress:LifepathProgress;mode:BuildMode;onChange:(s:Sheet)=>void;onError:(s:string)=>void}){
  const state=traitState(sheet,progress);

  const [catalog,setCatalog]=useState(false);
  const [overrides,setOverrides]=useState<Record<string,string>>({});
  const candidates=sheet.traitCandidates??[];
  const worklist=new Set([...candidates,...state.owned]);
  const required=state.paths.filter(p=>p.required);
  function consider(id:string){
    if(!worklist.has(id))onChange(shortlistTrait(sheet,id));
    setExpanded(ids=>ids.includes(id)?ids:[...ids,id]);
  }
  function offers(t:Trait){
    const options:{source:TraitSource;label:string}[]=state.paths.filter(p=>p.ids.includes(t.id))
      .map(p=>({source:p.source,label:p.name+' #'+p.source.occurrence}));
    if(t.price!==null)options.push({source:{kind:'catalog'},label:'General catalog'});
    if(!accessIssues(t,{kind:'fey'},state).length)options.push({source:{kind:'fey'},label:'Fey Blood'});
    return options;
  }
  const available=(t:Trait)=>offers(t).some(o=>!traitPurchaseError(state,t.id,o.source,'rules'));
  function priceInfo(t:Trait){
    const prices=new Map<string,number>();
    if(state.common.some(c=>c.id===t.id))prices.set('Stock grant',0);
    for(const {source} of offers(t)){
      const cost=traitCost(t,source);
      if(cost!==null)prices.set(source.kind==='lifepath'?'Lifepath':source.kind==='fey'?'Fey Blood':'Catalog',cost);
    }
    return {label:[...prices].map(([label,cost])=>label+' '+cost+' TP').join(' · ')||'No listed price',
      minimum:prices.size?Math.min(...prices.values()):null};
  }
  function detail(t:Trait,browse:boolean){
    const paid=state.ledger.find(p=>p.id===t.id);
    const owned=state.owned.has(t.id);
    const options=offers(t);
    const override=overrides[t.id]??'1';
    function buy(source:TraitSource){
      const result=purchaseTrait(sheet,progress,t.id,source,mode);
      if(result.error)onError(result.error);else onChange(result.sheet);
    }
    return <div className="trait-detail" data-type={t.type}>{browse&&<h3>{t.name}</h3>}
      <TypeLabel trait={t}/>
      <p>{t.note??(t.type==='character'?'Descriptive character trait.':'See the cited rules for its effect during play.')}</p>
      {owned && <strong>Owned · {paid?paid.cost+' TP':'free common trait'}</strong>}
      {owned && !browse && <>
        {paid && t.categories && <fieldset><legend>Animal categories · first included, then 1 TP each</legend>
          {t.categories.map(c=><label key={c}><input type="checkbox" checked={paid.categories?.includes(c)??false} onChange={()=>{
            const result=changeTraitCategory(sheet,progress,t.id,c,mode);
            if(result.error)onError(result.error);else onChange(result.sheet);
          }}/>{c}</label>)}</fieldset>}
        {t.poolTransfer && <label><input type="checkbox" checked={sheet.choices['trait:'+t.id]==='transfer'} onChange={e=>onChange({...sheet,choices:{...sheet.choices,['trait:'+t.id]:e.target.checked?'transfer':'keep'}})}/> {t.note}</label>}
        {paid&&<><p>Source: {paid.source.kind==='lifepath'?pathLabel(paid.source.path)+' · visit '+paid.source.occurrence:({catalog:'General catalog',fey:'Fey Blood',free:'Custom price'})[paid.source.kind]} · {paid.mode==='rules'?'Rules':'Free Creation'}</p><button onClick={()=>onChange(refundTrait(sheet,t.id))}>Refund {paid.cost} TP</button></>}</>}
      {!owned && <div>{options.map(({source,label})=>{
        const reason=traitPurchaseError(state,t.id,source,browse?'rules':mode);
        const text=label+' · '+traitCost(t,source)+' TP';
        return <div key={label}>{browse?<span>{text}</span>:<button disabled={!!reason} onClick={()=>buy(source)}>Buy · {text}</button>}
          {reason&&<small> {reason}</small>}</div>;
      })}{options.length===0&&<p>No purchase source on this route.</p>}</div>}
      {!browse && !owned && mode==='free'&&<label>Override cost <input type="number" min="0" max="100" value={override} onChange={e=>setOverrides({...overrides,[t.id]:e.target.value})}/>
        <button disabled={!override.trim()} onClick={()=>buy({kind:'free',points:Number(override)})}>Use override</button></label>}
      {browse?<button disabled={worklist.has(t.id)} onClick={()=>consider(t.id)}>{worklist.has(t.id)?'In worklist':'Add to worklist'}</button>:
        !owned&&<button onClick={()=>onChange({...sheet,traitCandidates:candidates.filter(id=>id!==t.id)})}>Remove from shortlist</button>}
      <footer>BWGR {t.pages.join(', ')} · {sourceLabels[t.coverage]}</footer>
    </div>;
  }
  function tile(id:string){
    const t=traits.get(id)!;
    const open=expanded.includes(id);
    return <article className="trait-row" key={id} data-type={t.type}>
      <button id={'worklist-'+id} aria-expanded={open} onClick={()=>setExpanded(ids=>open?ids.filter(other=>other!==id):[...ids,id])}>
        <strong>{t.name}</strong><span aria-hidden="true">{open?'−':'⌄'}</span></button>
      {open?detail(t,false):<TypeLabel trait={t}/>}</article>;
  }
  return <section aria-label="Trait burner"><div className="section-top"><h2>Trait burner</h2><button className="primary" onClick={()=>setCatalog(true)}>Explore Trait Catalog</button>
    <span className="point-total">{state.remaining} / {state.total} <small>trait points left</small></span></div>
    <section className="trait-required"><h3>Required by Lifepaths</h3>
    {required.length?<><p>{state.missing.length} TP still required</p>{required.map(p=><button className={state.missing.some(m=>m.source===p.source)?'pending':'fulfilled'} key={p.source.path+p.source.occurrence}
      onClick={()=>{
        consider(p.required!);
        window.setTimeout(()=>document.getElementById('worklist-'+p.required)?.focus());
      }}>{traits.get(p.required!)!.name} · {p.name} #{p.source.occurrence} · 1 TP · {state.missing.some(m=>m.source===p.source)?'Required':'Fulfilled'}</button>)}</>:<p>No required purchases on this route.</p>}</section>
    <h3>Owned traits</h3><div className="owned-columns">{(['character','die','call-on'] as const).map(type=>{
      const ids=[...state.owned].filter(id=>traits.get(id)!.type.split('/')[0]===type);
      return <section key={type} aria-label={typeNames[type]+' owned traits'}><h4>{typeNames[type]} <small>{ids.length}</small></h4>{ids.map(tile)}</section>;
    })}</div>
    <h3>Considering</h3><div className="candidate-tiles">{candidates.filter(id=>!state.owned.has(id)).map(tile)}</div>
    {!candidates.some(id=>!state.owned.has(id))&&<p>Add candidates from the catalog or select a required trait.</p>}
    {catalog&&<TraitCatalog priceInfo={priceInfo} existing={worklist} add={id=>onChange(shortlistTrait(sheet,id))} listed={id=>state.paths.some(p=>p.ids.includes(id))} available={available} detail={t=>detail(t,true)} close={()=>setCatalog(false)}/>}
    {state.issues.length>0&&<details><summary>Trait review ({state.issues.length})</summary><ul>{state.issues.map((s,i)=><li key={i}>{s}</li>)}</ul></details>}
  </section>;
}

function TraitCatalog({priceInfo,existing,add,listed,available,detail,close}:{priceInfo:(t:Trait)=>{label:string;minimum:number|null};existing:Set<string>;add:(id:string)=>void;listed:(id:string)=>boolean;available:(t:Trait)=>boolean;detail:(t:Trait)=>React.ReactNode;close:()=>void}){
  const dialog=useRef<HTMLDialogElement>(null);
  const [query,setQuery]=useState(''),[type,setType]=useState(''),[availability,setAvailability]=useState('');
  const [sort,setSort]=useState('name'),[reverse,setReverse]=useState(false);
  const [selected,setSelected]=useState('');
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;
    if(dialog.current?.showModal)dialog.current.showModal();else dialog.current?.setAttribute('open','');
    dialog.current?.querySelector('input')?.focus();
    return ()=>previous?.focus();
  },[]);
  const results=[...traits.values()].filter(t=>t.name.toLowerCase().includes(query.trim().toLowerCase())&&(!type||t.type===type||t.type.split('/').includes(type))
    &&(!availability||(availability==='listed'?listed(t.id):available(t)===(availability==='available'))));
  const prices=new Map(results.map(t=>[t.id,priceInfo(t)]));
  results.sort((a,b)=>{
    let primary=0;
    if(sort==='price'){
      const left=prices.get(a.id)!.minimum,right=prices.get(b.id)!.minimum;
      if(left===null && right!==null)return 1;
      if(right===null && left!==null)return -1;
      primary=(left??0)-(right??0);
    }else if(sort==='type')primary=typeNames[a.type].localeCompare(typeNames[b.type]);
    return (primary||a.name.localeCompare(b.name,'en'))*(reverse?-1:1);
  });
  const current=results.find(t=>t.id===selected)??results[0];
  return <div className="modal-backdrop"><dialog ref={dialog} className="catalog-dialog trait-dialog" aria-label="Explore Trait Catalog"
    onCancel={e=>{e.preventDefault();close();}} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();close();}}}>
    <div className="section-top"><h2>Explore Trait Catalog</h2><button onClick={close}>Close catalog</button></div>
    <div className="trait-toolbar"><label>Search traits <input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label>
      <label>Type <select value={type} onChange={e=>setType(e.target.value)}><option value="">All types</option>
      {[...new Set([...traits.values()].map(t=>t.type))].map(v=><option key={v} value={v}>{typeNames[v]}</option>)}</select></label>
      <label>Rules availability <select value={availability} onChange={e=>setAvailability(e.target.value)}><option value="">All traits</option>
      <option value="listed">On my lifepaths</option><option value="available">Can buy now</option><option value="unavailable">Cannot buy now</option></select></label>
      <label>Sort by <select value={sort} onChange={e=>setSort(e.target.value)}><option value="name">Name</option><option value="price">Lowest listed price</option><option value="type">Type</option></select></label>
      <button aria-label="Reverse sort order" aria-pressed={reverse} onClick={()=>setReverse(!reverse)}>{reverse?'↓ Descending':'↑ Ascending'}</button></div>
    <small>{results.length} matching traits</small><div className="catalog-body"><div className="catalog-results">{results.map(t=>
      <div className="trait-result" data-type={t.type} key={t.id}><button aria-label={t.name} aria-pressed={current?.id===t.id} onClick={()=>setSelected(t.id)}>
        <strong>{t.name}</strong><small><TypeLabel trait={t}/> · {prices.get(t.id)!.label} · {available(t)?'Can buy now':'Cannot buy now'}</small></button>
        <button className="trait-add" aria-label={'Add '+t.name+' to candidates'} disabled={existing.has(t.id)} onClick={()=>add(t.id)}>{existing.has(t.id)?'✓':'+'}</button></div>)}</div>
      <div className="catalog-detail">{current?detail(current):<p>No matching traits.</p>}</div></div>
  </dialog></div>;
}
