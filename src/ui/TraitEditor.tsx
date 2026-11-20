import { useState, useRef, useEffect } from 'react';
import { traits } from '../data/traits';
import { ConfirmReset } from './ConfirmReset';
import type { PathSource, Trait, TraitSource } from '../data/traits/types';
import { purchaseTrait, refundTrait, changeTraitCategory, shortlistTrait, traitPurchaseError, removeTraitCandidates, resetTraits } from '../character/traits';
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
  const [openGuide, setOpenGuide] = useState<'review' | 'rules' | null>(null);
  const [confirmTraitReset, setConfirmTraitReset] = useState(false);
  const candidates = sheet.traitCandidates ?? [];
  const requirements = new Map<string, PathSource>();
  for (const path of state.paths) {
    if (path.required) requirements.set(path.required, path.source);
  }
  const unpaid = new Set(state.missing.map(entry => entry.id));
  const optionalCandidates = candidates.filter(id => !state.owned.has(id) && !requirements.has(id));
  const considering = [...[...unpaid].filter(id => !state.owned.has(id)), ...optionalCandidates];
  const worklist = new Set([...considering, ...state.owned]);
  const spent = state.total - state.remaining;
  const hasTraitEdits = state.ledger.length > 0 || candidates.length > 0 ||
    Object.keys(sheet.choices).some(key => key.startsWith('trait:'));

  function toggleTrait(id: string) {
    setExpanded(ids => ids.includes(id) ? ids.filter(other => other !== id) : [...ids, id]);
  }
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
    return <div className="trait-detail" data-type={t.type}>
      {browse && <><h3>{t.name}</h3><TypeLabel trait={t}/></>}
      <p>{t.note ?? (t.type === 'character' ? 'Descriptive character trait.' : 'See the cited rules for its effect during play.')}</p>
      <div className="trait-acquisition">
        {owned && <strong>Owned · {paid ? paid.cost + ' TP' : 'free common trait'}</strong>}
        {owned && !browse && <>
          {paid && t.categories && <fieldset><legend>Animal categories · first included, then 1 TP each</legend>
            {t.categories.map(category => <label key={category}>
              <input type="checkbox" checked={paid.categories?.includes(category) ?? false} onChange={() => {
                const result = changeTraitCategory(sheet, progress, t.id, category, mode);
                if (result.error) onError(result.error);
                else onChange(result.sheet);
              }}/>{category}
            </label>)}
          </fieldset>}
          {t.poolTransfer && <label>
            <input type="checkbox" checked={sheet.choices['trait:' + t.id] === 'transfer'} onChange={event =>
              onChange({...sheet, choices: {...sheet.choices, ['trait:' + t.id]: event.target.checked ? 'transfer' : 'keep'}})
            }/> {t.note}
          </label>}
          {paid && <>
            <p>Source: {paid.source.kind === 'lifepath'
              ? pathLabel(paid.source.path) + ' · visit ' + paid.source.occurrence
              : ({catalog:'General catalog', fey:'Fey Blood', free:'Custom price'})[paid.source.kind]}
              {' · '}{paid.mode === 'rules' ? 'Rules' : 'Free Creation'}</p>
            {unpaid.has(t.id) && <p>Refund this purchase to buy the trait from its required lifepath.</p>}
            <button onClick={() => onChange(refundTrait(sheet, t.id))}>Refund {paid.cost} TP</button>
          </>}
        </>}
        {!owned && <>
          {options.map(({source, label}) => {
            const reason = traitPurchaseError(state, t.id, source, browse ? 'rules' : mode);
            const text = label + ' · ' + traitCost(t, source) + ' TP';
            return <div key={label}>
              {browse ? <span>{text}</span> : <button disabled={!!reason} onClick={() => buy(source)}>Buy · {text}</button>}
              {reason && <small>{reason}</small>}
            </div>;
          })}
          {options.length === 0 && <p>No purchase source on this route.</p>}
          {!browse && mode === 'free' && <label>Override cost <input type="number" min="0" max="100" value={override}
            onChange={event => setOverrides({...overrides, [t.id]: event.target.value})}/>
            <button disabled={!override.trim()} onClick={() => buy({kind:'free', points:Number(override)})}>Use override</button>
          </label>}
        </>}
        {browse && <button disabled={worklist.has(t.id)} onClick={() => consider(t.id)}>
          {worklist.has(t.id) ? 'In worklist' : 'Add to worklist'}
        </button>}
        {!browse && !owned && !requirements.has(t.id) &&
          <button onClick={() => onChange(removeTraitCandidates(sheet, [t.id]))}>Remove from shortlist</button>}
      </div>
      <footer>BWGR {t.pages.join(', ')} · {sourceLabels[t.coverage]}</footer>
    </div>;
  }

  function tile(id: string) {
    const trait = traits.get(id)!;
    const open = expanded.includes(id);
    const source = requirements.get(id);
    const needsSource = unpaid.has(id) && state.owned.has(id);
    return <article className="trait-row" key={id} data-type={trait.type}>
      <button className="trait-toggle" id={'worklist-' + id} aria-expanded={open}
        aria-controls={open ? 'trait-body-' + id : undefined} onClick={() => toggleTrait(id)}>
        <span className="trait-heading">
          <strong>{trait.name}</strong>
          <span className="trait-meta">
            <TypeLabel trait={trait}/>
            {source && <>
              <span className="trait-obligation" data-met={!unpaid.has(id)}>
                {unpaid.has(id) ? (needsSource ? 'Source needed' : 'Required') : '✓ Fulfilled'}
              </span>
              <span className="trait-visit">{pathLabel(source.path)} · visit {source.occurrence}</span>
            </>}
          </span>
        </span>
        <span className="trait-chevron" aria-hidden="true"/>
      </button>
      {open && <div id={'trait-body-' + id}>{detail(trait, false)}</div>}
    </article>;
  }

  return <section aria-label="Trait burner">
    <h2 className="trait-title">Trait burner</h2>
    <section className="trait-controls" aria-label="Trait budget and actions">
      <div className="trait-controls-main">
        <button className="primary" onClick={() => setCatalog(true)}>Explore Trait Catalog</button>
        <div className="trait-budget">
          <span className="point-total">{state.remaining} <small>/ {state.total} TP left</small></span>
          <span>{spent} TP spent</span>
        </div>
        <div className="trait-requirements-summary" data-pending={unpaid.size > 0}>
          <strong>{requirements.size > 0
            ? (requirements.size - unpaid.size) + ' of ' + requirements.size + ' lifepath requirements met'
            : 'No lifepath requirements'}</strong>
          {requirements.size > 0 && <span>{unpaid.size > 0 && <>{unpaid.size} TP still required · </>}
            {Math.max(0, state.remaining - unpaid.size)} TP unreserved</span>}
        </div>
      </div>
      <div className="trait-controls-tools">
        <div className="trait-guide-buttons">
          <button aria-expanded={openGuide === 'review'} aria-controls="trait-review"
            onClick={() => setOpenGuide(openGuide === 'review' ? null : 'review')}>Trait review ({state.issues.length})</button>
          <button aria-expanded={openGuide === 'rules'} aria-controls="trait-rules"
            onClick={() => setOpenGuide(openGuide === 'rules' ? null : 'rules')}>Trait point rules</button>
        </div>
        <div className="trait-clear-actions">
          <button disabled={!optionalCandidates.length}
            onClick={() => onChange(removeTraitCandidates(sheet, optionalCandidates))}>Clear optional candidates</button>
          <button disabled={!hasTraitEdits} onClick={() => setConfirmTraitReset(true)}>Reset traits…</button>
        </div>
      </div>
      <div id="trait-review" className="trait-guide" hidden={openGuide !== 'review'}>
        {state.issues.length > 0
          ? <ul>{state.issues.map((issue, index) => <li key={index}>{issue}</li>)}</ul>
          : <p>No current trait issues.</p>}
      </div>
      <div id="trait-rules" className="trait-guide" hidden={openGuide !== 'rules'}>
        <p>Each trait bought from a lifepath costs 1 TP. On the first visit, take the first listed trait
          you do not already have from an earlier path. On the second visit, start at the second entry.
          Spend all trait points during character creation. <cite>BWGR pp. 84, 89.</cite></p>
      </div>
    </section>
    <h3>Owned traits</h3>
    <div className="owned-columns">{(['character','die','call-on'] as const).map(type => {
      const ids = [...state.owned].filter(id => traits.get(id)!.type.split('/')[0] === type);
      return <section key={type} aria-label={typeNames[type] + ' owned traits'}>
        <h4>{typeNames[type]} <small>{ids.length}</small></h4>{ids.map(tile)}
      </section>;
    })}</div>
    <h3>Considering</h3>
    <div className="candidate-tiles">{considering.map(tile)}</div>
    {considering.length === 0 && <p className="trait-empty">Add a candidate from the catalog to compare traits here.</p>}
    {catalog && <TraitCatalog priceInfo={priceInfo} existing={worklist} add={id => onChange(shortlistTrait(sheet, id))}
      listed={id => state.paths.some(p => p.ids.includes(id))} available={available} detail={t => detail(t, true)}
      close={() => setCatalog(false)}/>}
    {confirmTraitReset && <ConfirmReset title="Reset traits?" label="Confirm trait reset"
      description={'Refund ' + spent + ' TP, clear the shortlist and reset trait choices. Your lifepaths determine which traits are required and which are granted. Undo restores this edit.'}
      onCancel={() => setConfirmTraitReset(false)} onConfirm={() => {
        onChange(resetTraits(sheet));
        setConfirmTraitReset(false);
      }}/>}
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
