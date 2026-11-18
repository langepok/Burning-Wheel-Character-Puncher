import { useEffect, useRef, useState } from 'react';
import { createBuildHistory } from '../character';
import { planLeadAndLifepath, applyLifepathCommand, canApplyChoice, projectLifepathHistory } from '../character/lifepath-history';
import type { BuildMode, LifepathCommand } from '../character/lifepath-history';
import { createCatalog, getLifepathDisplayLabel } from '../data/catalog';
import type { RequirementNode } from '../data/catalog';
import { humanContent } from '../data/human';
import { evaluateLead, evaluateLifepath, validateLifepathRequirements } from '../rules/lifepaths';
import type { LifepathIssue, LifepathProgress } from '../rules/lifepaths';
import { layoutCatalog, routeSegment } from './map-layout';
import './app.css';
import { clearRoute, removeLastRouteStep, createSheet, deriveSheet, encodeDraft, parseDraft, skillName } from '../character/workbench';
import type { Draft, Sheet } from '../character/workbench';
import { humanAgePools, humanBurningLists } from '../data/burning/human';
import { SheetEditor } from './SheetEditor';
import { ConfirmReset } from './ConfirmReset';

const catalog = createCatalog(humanContent);
const settings = [...catalog.settings.values()];
const paths = [...catalog.lifepaths.values()];
const settingName = (id: string) => catalog.settings.get(id)?.sourceName ?? id;
const stock = [...catalog.stocks.values()][0]!;
const layout = layoutCatalog(catalog, stock.id);

function describeRequirement(node: RequirementNode): string {
  switch (node.kind) {
    case 'allOf':
    case 'anyOf': return '(' + node.items.map(describeRequirement).join(node.kind === 'allOf' ? ' and ' : ' or ') + ')';
    case 'position': return (node.mode === 'only' ? 'Only at position ' : 'Except at position ') + node.positions.join(', ');
    case 'maxOccurrences': return 'At most ' + node.count + ' selections of this lifepath family';
    case 'priorFamily': return 'Earlier ' + (catalog.families.get(node.familyId)?.sourceName ?? node.familyId);
    case 'priorSetting': return 'Earlier lifepath in ' + settingName(node.settingId);
    case 'priorSemanticTag': return 'Earlier ' + node.tag + ' lifepath';
    case 'characterGender': return 'Character gender: ' + node.gender;
    case 'finalLifepathCountAtMost': return 'At most ' + node.count + ' lifepaths in the completed build';
    case 'finalStartingAgeGreaterThan': return 'Final starting age over ' + node.age;
    case 'priorLifepathSkillListContains': return 'Earlier lifepath listing ' + (catalog.skills.get(node.skillId)?.sourceName ?? node.skillId);
  }
}

function describeIssue(issue: LifepathIssue): string {
  switch (issue.code) {
    case 'REQUIREMENT_UNMET': return 'Unmet requirement: ' + describeRequirement(issue.requirement);
    case 'REQUIREMENT_UNRESOLVED': return 'Insufficient information: ' + describeRequirement(issue.requirement);
    case 'UNKNOWN_LIFEPATH': return 'Unknown lifepath.';
    case 'UNKNOWN_SETTING': return 'Unknown setting.';
    case 'CONTENT_UNAVAILABLE': return 'Lifepath data for this setting is outside the pilot.';
    case 'FIRST_LIFEPATH_MUST_BE_BORN': return 'Choose a Born lifepath first.';
    case 'BORN_LIFEPATH_NOT_FIRST': return 'Born lifepaths are only available as the first choice.';
    case 'WRONG_STOCK': return 'This choice is from a different stock.';
    case 'LEAD_REQUIRED': return 'Take a Lead to this setting first.';
    case 'LEAD_NEEDS_LIFEPATH': return 'Choose a lifepath before taking a Lead.';
    case 'ALREADY_IN_SETTING': return 'Already in this setting.';
    case 'LEAD_NOT_LISTED': return 'The last lifepath does not list this Lead.';
  }
}

export function App() {
  const [initial] = useState(() => {
    try { const raw=localStorage.getItem('bw-workbench-v1'); return {draft:raw?parseDraft(raw,catalog):null,error:''}; }
    catch {return {draft:null,error:'Saved draft could not be read. Export a new draft before replacing the saved copy.'};}
  });
  const [draft,setDraft]=useState<Draft>(()=>initial.draft??{version:1,name:'',mode:'rules',history:createBuildHistory(),sheet:createSheet(),pins:[]});
  const [recoveryBlocked,setRecoveryBlocked]=useState(Boolean(initial.error));
  const [past,setPast]=useState<Draft[]>([]);
  const [future,setFuture]=useState<Draft[]>([]);
  const [notice,setNotice]=useState(initial.error);
  const [saveStatus,setSaveStatus]=useState(initial.error?'Recovery needed':'Saved on this device');
  const [query,setQuery]=useState('');
  const [density,setDensity]=useState('names');
  const [expanded,setExpanded]=useState(false);
  const fileInput=useRef<HTMLInputElement>(null);
  const {history,mode,sheet,pins}=draft;
  function commit(next:Draft){setFuture([]);setPast(p=>[...p.slice(-99),draft]);setDraft(next);setNotice('');}
  function updateSheet(next:Sheet){if(next!==sheet)commit({...draft,sheet:next});}
  function setMode(next:BuildMode){setDraft({...draft,mode:next});}
  function togglePin(id:string){setDraft(d=>({...d,pins:d.pins.includes(id)?d.pins.filter(p=>p!==id):[...d.pins,id]}));}
  useEffect(()=>{if(recoveryBlocked)return;try{localStorage.setItem('bw-workbench-v1',encodeDraft(draft));setSaveStatus('Saved on this device');}catch{setSaveStatus('Could not save · export a backup');}},[draft,recoveryBlocked]);
  function exportDraft(){const url=URL.createObjectURL(new Blob([encodeDraft(draft)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='burning-wheel-character.json';a.click();URL.revokeObjectURL(url);setNotice('Character draft exported.');}
  function restore(snapshot:Draft){return {...snapshot,mode:draft.mode,name:draft.name,pins:draft.pins};}
  function undo(){
    const previous=past.at(-1);const next=previous?restore(previous):{...draft,history:removeLastRouteStep(history)};
    if(previous||next.history!==history){setFuture(f=>[...f.slice(-99),draft]);setDraft(next);setPast(p=>p.slice(0,-1));setNotice('Last edit undone.');}
    setConfirmReset(false);
  }
  function redo(){const next=future.at(-1);if(next){setPast(p=>[...p.slice(-99),draft]);setDraft(restore(next));setFuture(f=>f.slice(0,-1));setNotice('Edit restored.');}setConfirmReset(false);}

  const [inspected, setInspected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, scale: .95 });
  const [confirmReset, setConfirmReset] = useState(false);
  const [transition,setTransition]=useState<string|null>(null);
  const drag=useRef<{x:number;y:number;startX:number;startY:number;moved:boolean}|null>(null);
  const suppressNodeClick=useRef(false);
  const viewport = useRef<HTMLDivElement>(null);
  const progress = projectLifepathHistory(history, catalog);
  const timeline=history.entries.filter(e=>e.kind!=='gender');
  const agePool=humanAgePools.find(r=>progress.age>=r[0]&&progress.age<=r[1]);
  const derived=deriveSheet(sheet,progress);
  const totals=derived.total;
  const finalIssues = validateLifepathRequirements(progress);
  const warningCount = deriveSheet(sheet,progress).issues.length + finalIssues.length + history.entries.reduce((total, entry) =>
    total + ('overrides' in entry ? entry.overrides.length : 0), 0);
  const currentId = progress.paths.at(-1)?.variantId;
  const selectedPath = inspected ? catalog.lifepaths.get(inspected) : undefined;
  const hoveredPath = hovered ? catalog.lifepaths.get(hovered) : undefined;
  const linkedPath = hoveredPath ?? selectedPath;
  const selectedIssues = selectedPath ? evaluateLifepath(progress, selectedPath.variantId, catalog) : [];
  const route = history.entries.flatMap(entry => entry.kind === 'lifepath' && 'id' in entry ? [entry.id] : []);
  const routePoints = route.map(id => layout.points.get(id)).filter(point => point !== undefined);
  const pathEntryIndices = history.entries.flatMap((entry, index) => entry.kind === 'lifepath' ? [index] : []);
  const hoveredLeads = linkedPath?.leads;
  const leadDestinations = hoveredLeads?.kind === 'to' ? hoveredLeads.settingIds :
    hoveredLeads?.kind === 'any' ? layout.regions.map(region => region.setting.id).filter(id => id !== linkedPath?.settingId) :
    hoveredLeads?.kind === 'anyExcept' ? layout.regions.map(region => region.setting.id)
      .filter(id => id !== linkedPath?.settingId && !hoveredLeads.excludedSettingIds.includes(id)) : [];

  function apply(command: LifepathCommand) {
    if(command.kind==='undo'){undo();return;}
    const next=command.kind==='reset'?clearRoute(history):applyLifepathCommand(history, command, mode, catalog);
    if(next!==history)commit({...draft,history:next,sheet:command.kind==='reset'?createSheet():sheet});
    setConfirmReset(false);
  }
  function focusPoint(point: { x: number; y: number }) {
    setCamera(previous => { const scale=Math.max(.85,previous.scale);return {scale,x:(viewport.current?.clientWidth||640)/2-point.x*scale,y:(viewport.current?.clientHeight||440)/2-point.y*scale}; });
  }
  function fitAll() {
    const width = viewport.current?.clientWidth || 800;
    const height = viewport.current?.clientHeight || 500;
    const scale = Math.min(1, (width - 24) / layout.width, (height - 24) / layout.height);
    setCamera({ scale, x: (width - layout.width * scale) / 2, y: (height - layout.height * scale) / 2 });
  }
  function fitRoute() {
    if (!routePoints.length) return;
    const minX = Math.min(...routePoints.map(point => point.x));
    const maxX = Math.max(...routePoints.map(point => point.x));
    const minY = Math.min(...routePoints.map(point => point.y));
    const maxY = Math.max(...routePoints.map(point => point.y));
    const width=viewport.current?.clientWidth||640,height=viewport.current?.clientHeight||440;
    const scale = Math.min(1.5, (width-140) / Math.max(200, maxX-minX), (height-100) / Math.max(160,maxY-minY));
    setCamera({scale,x:width/2-(minX+maxX)*scale/2,y:height/2-(minY+maxY)*scale/2});
  }
  function zoom(factor: number) {
    setCamera(previous => {
      const scale = Math.max(0.35, Math.min(2.5, previous.scale * factor));
      const x=(viewport.current?.clientWidth||640)/2,y=(viewport.current?.clientHeight||440)/2;
      return {scale,x:x-(x-previous.x)*scale/previous.scale,y:y-(y-previous.y)*scale/previous.scale};
    });
  }
  useEffect(()=>{
    const node=viewport.current;if(!node)return;
    const onWheel=(event:WheelEvent)=>{event.preventDefault();event.stopPropagation();if(event.deltaY)zoom(event.deltaY<0?1.1:.9);};
    node.addEventListener('wheel',onWheel,{passive:false});
    return ()=>node.removeEventListener('wheel',onWheel);
  },[]);
  useEffect(()=>{
    if(!expanded)return;
    const old=document.body.style.overflow;document.body.style.overflow='hidden';
    const background=[...document.querySelectorAll<HTMLElement>('main.burner > :not(.workspace):not(dialog)')];
    background.forEach(e=>e.inert=true);
    return ()=>{document.body.style.overflow=old;background.forEach(e=>e.inert=false);};
  },[expanded]);
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if(e.defaultPrevented||document.querySelector('dialog[open]'))return;
      if(e.key==='Escape'&&expanded){e.preventDefault();setExpanded(false);return;}
      const target=e.target as HTMLElement;
      if(target.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])'))return;
      if(!(e.ctrlKey||e.metaKey)||e.altKey)return;
      const key=e.key.toLowerCase();
      if(key==='z'&&!e.shiftKey){if(past.length||timeline.length){e.preventDefault();undo();}}
      else if(key==='y'||(key==='z'&&e.shiftKey)){if(future.length){e.preventDefault();redo();}}
    };
    document.addEventListener('keydown',onKey);return ()=>document.removeEventListener('keydown',onKey);
  });
  function leadSummary(path: typeof paths[number]) {
    if (path.leads.kind === 'any') return 'Any setting';
    if (path.leads.kind === 'anyExcept') return 'Any except ' + path.leads.excludedSettingIds.map(settingName).join(', ');
    return path.leads.settingIds.map(settingName).join(', ') || 'None';
  }
  function statSummary(path: typeof paths[number]) {
    const stat = path.statGrant.kind === 'none' ? 'No stat points' :
      path.statGrant.kind === 'mentalAndPhysical' ? '+' + path.statGrant.mental + ' mental, +' + path.statGrant.physical + ' physical' :
      path.statGrant.kind === 'chooseMentalOrPhysical' ? '+' + path.statGrant.amount + ' mental or physical' :
      '+' + path.statGrant.amount + ' ' + path.statGrant.kind;
    return stat;
  }
  function grantSummary(path: typeof paths[number]) {
    const stat=statSummary(path);
    const resources = path.resourceGrant.kind === 'fixed' ? String(path.resourceGrant.amount) : 'manual resolution';
    return stat + ' · ' + path.skillPointGrant.ordinary + ' ordinary / ' +
      path.skillPointGrant.general + ' General skill points · ' + path.traitPointGrant +
      ' trait points · Resources: ' + resources;
  }
  return (
    <main className={'burner'+(expanded?' map-expanded':'')}>
      <header className="global-header">
        <div className="brand"><span className="brand-mark">✳</span><div><strong>BURNING WHEEL</strong><small>CHARACTER WORKBENCH</small></div></div>
        <nav aria-label="Modules"><strong>Character Burner</strong><span title="Not implemented yet">Equipment</span><span title="Not implemented yet">Fight!</span></nav>
        <div className="file-actions"><span className="save-status">{saveStatus}</span><button onClick={()=>fileInput.current?.click()}>Import</button><button onClick={exportDraft}>Export</button><button disabled={!past.length&&!timeline.length} onClick={undo}>Undo</button><button disabled={!future.length} onClick={redo}>Redo</button></div>
        <input ref={fileInput} hidden type="file" accept=".json,application/json" aria-label="Import character draft" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{const imported=parseDraft(await file.text(),catalog);commit(imported);setNotice('Imported character draft. Undo restores your previous character.');}catch(error){setNotice(error instanceof Error?error.message:'Import failed.');}e.target.value='';}}/>
      </header>
      <div className="context-bar">
        <div className="character-identity"><input aria-label="Character name" placeholder="Name your character" value={draft.name} maxLength={200} onChange={e=>setDraft({...draft,name:e.target.value})}/><strong>{stock.sourceName}</strong> <span>· Lifepaths: {progress.paths.length} · Age: {progress.age} years · Warnings: {warningCount}</span></div>
        <label>Build mode <select value={mode} onChange={event => setMode(event.target.value as BuildMode)}>
          <option value="rules">Rules</option><option value="free">Free Creation</option>
        </select></label>
        <label>Character gender <select value={progress.gender ?? ''} onChange={event => apply({
          kind: 'gender', value: (event.target.value || undefined) as LifepathProgress['gender'],
        })}><option value="">Unspecified</option><option value="female">Female</option><option value="male">Male</option></select></label>
      </div>
      {recoveryBlocked&&<div className="feedback">Autosave is paused to protect the unreadable draft.<button onClick={()=>{setRecoveryBlocked(false);setNotice('Autosave restarted with this draft.');}}>Replace unreadable saved draft</button></div>}
      {notice&&<div className="feedback" role="status">{notice}<button aria-label="Dismiss message" onClick={()=>setNotice('')}>×</button></div>}
      <div className="workspace">
        <section className="history-panel" aria-labelledby="history">
          <span className="eyebrow">01 / LIFEPATHS</span><h2 id="history">Build history</h2>
          <p aria-live="polite"><span className="age-help" tabIndex={0} aria-describedby="age-pools">Age: {progress.age} years<span role="tooltip" id="age-pools">{agePool?<>Age {agePool[0]}–{agePool[1]}: Mental {agePool[2]}, Physical {agePool[3]}.<br/>With lifepath adjustments: Mental {totals.mental}, Physical {totals.physical}.<br/>BWGR 87–88, 197</>:'Choose lifepaths to determine age pools.'}</span></span> · Current setting: {progress.settingId ? settingName(progress.settingId) : 'None'}</p>
          {!progress.paths.length&&<div className="start-guide"><h3>Every life starts somewhere.</h3><p>Inspect a birthplace, then add it to begin your story.</p>{paths.filter(p=>p.isBorn).map(p=><button key={p.variantId} onClick={()=>{setInspected(p.variantId);focusPoint(layout.points.get(p.variantId)!);}}>{p.sourceName} <span>›</span></button>)}</div>}
          <ol>{timeline.map((entry, index) => {
            const age = timeline.slice(0, index + 1).reduce((total, previous) =>
              total + (previous.kind === 'lead' ? 1 : previous.kind === 'lifepath' ? catalog.lifepaths.get(previous.id)!.years : 0), 0);
            return <li key={index} data-history-step={index + 1}>
              {entry.kind === 'lifepath' && 'id' in entry ? <button type="button" onClick={() => {
                setInspected(entry.id);
                const point = layout.points.get(entry.id);
                if (point) focusPoint(point);
              }}>{getLifepathDisplayLabel(catalog.lifepaths.get(entry.id)!, catalog)}</button> :
                entry.kind === 'lead' && 'id' in entry ? 'Lead to ' + settingName(entry.id) + ' (+1 year)' :
                  'Gender: ' + ('value' in entry ? entry.value ?? 'Unspecified' : 'Unspecified')}
              <small>Age {age}</small>
              {entry.kind==='lifepath'&&(()=>{const i=timeline.slice(0,index+1).filter(e=>e.kind==='lifepath').length-1;const earned=derived.contributions[i];const list=humanBurningLists[entry.id];return <details className="history-grants"><summary>{earned.ordinary}sp · {earned.general} general · {earned.traits}tp · {earned.resources}rp</summary><p>Mental +{earned.mental} · Physical +{earned.physical}{derived.choices.some(c=>c.key===`stat:${i}`)&&!sheet.choices[`stat:${i}`]?' · stat bonus choice pending':''}</p><p>Skill list: {list?.skills.map(slot=>typeof slot==='string'?skillName(slot):slot.map(skillName).join(' or ')).join(', ')||'None'}</p><p>Trait options: {list?.traits.join(', ')||'None'}</p><small>Repeat-adjusted points. Listed skills and traits are options, not automatic purchases.</small></details>;})()}

              {entry.overrides.length > 0 &&
                <span> · Free Creation override: {entry.overrides.map(describeIssue).join(' ')}</span>}
            </li>;
          })}</ol>
          <div className="history-actions"><button type="button" disabled={!timeline.length} onClick={()=>commit({...draft,history:removeLastRouteStep(history)})}>Remove last</button>
            <button type="button" disabled={!timeline.length&&!sheet.purchases.length&&!Object.values(sheet.stats).some(s=>s.exponent)} onClick={()=>setConfirmReset(true)}>Reset</button></div>
          {progress.leadPending && <p>Choose a lifepath in the destination to complete the transition.</p>}
          {finalIssues.length > 0 && <ul aria-label="Current build requirements">
            {finalIssues.map(({ index, path, issue }, item) => <li key={item}>{index + 1}. {path.sourceName}: {describeIssue(issue)}</li>)}
          </ul>}
        </section>
        <section className="map-panel" aria-labelledby="map-title">
          <div className="map-heading"><div className="map-title-row"><h2 id="map-title">Lifepath map</h2><button onClick={()=>setExpanded(!expanded)}>{expanded?'Close expanded map · Esc':'Expand map'}</button></div>
            <div className="map-search"><input aria-label="Search lifepaths" placeholder="Find a lifepath or setting…" value={query} onChange={e=>setQuery(e.target.value)}/>
            {query&&<div className="search-results">{paths.filter(p=>(p.sourceName+' '+getLifepathDisplayLabel(p,catalog)+' '+settingName(p.settingId)).toLowerCase().includes(query.toLowerCase())).map(p=><button key={p.variantId} onClick={()=>{setInspected(p.variantId);focusPoint(layout.points.get(p.variantId)!);setQuery('');}}>{getLifepathDisplayLabel(p,catalog)}<small>{settingName(p.settingId)}</small></button>)}{!paths.some(p=>(p.sourceName+' '+getLifepathDisplayLabel(p,catalog)+' '+settingName(p.settingId)).toLowerCase().includes(query.toLowerCase()))&&<p>No matching lifepaths.</p>}</div>}</div>
            <div className="map-controls">
            <button type="button" aria-label="Zoom in" onClick={() => zoom(1.25)}>Zoom in</button>
            <button type="button" onClick={() => zoom(0.8)}>Zoom out</button>
            <button type="button" onClick={fitAll}>Fit all</button>
            <button type="button" disabled={!inspected || !layout.points.has(inspected)} onClick={() => focusPoint(layout.points.get(inspected!)!)}>Center inspected</button>
            <button type="button" disabled={!currentId} onClick={()=>focusPoint(layout.points.get(currentId!)!)}>Current lifepath</button><button type="button" disabled={!routePoints.length} onClick={fitRoute}>Fit history</button>
            <label className="density-label">Card details <select aria-label="Map detail density" value={density} onChange={e=>setDensity(e.target.value)}><option value="names">Names</option><option value="grants">Grants</option><option value="extended">Extended</option></select></label>
          </div><div className="setting-shortcuts">{layout.regions.filter(r=>r.paths.length).map(r=><button key={r.setting.id} onClick={()=>{const scale=.9;setCamera({scale,x:40-r.x*scale,y:24-r.y*scale});}}>{r.setting.uiQualifier}</button>)}</div></div>
      <div className="pinned-tray"><strong>☆ Pinned paths</strong>{pins.length?pins.map(id=><span key={id}><button onClick={()=>{setInspected(id);focusPoint(layout.points.get(id)!);}}>{getLifepathDisplayLabel(catalog.lifepaths.get(id)!,catalog)}</button><button aria-label={'Unpin '+id} onClick={()=>togglePin(id)}>×</button></span>):<small>Keep possible futures close. Pin a path from its details.</small>}{pins.length>0&&<button onClick={()=>setDraft({...draft,pins:[]})}>Clear pinned</button>}</div>
          <div className="map-context" role="status">{progress.leadPending?<>Lead taken → <strong>{settingName(progress.settingId!)}</strong>. Choose an available lifepath here; other requirements still apply.</>:<>Current setting: <strong>{progress.settingId?settingName(progress.settingId):'Choose a birthplace'}</strong></>}{camera.scale<.6&&<span>Overview · use a setting shortcut to read its cards</span>}</div>
          <div className="map-viewport" aria-label="Lifepath map" ref={viewport}
            onPointerDown={event=>{if(event.button!==0)return;event.preventDefault();suppressNodeClick.current=false;drag.current={x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,moved:false};}}
            onPointerMove={event=>{const d=drag.current;if(!d)return;if(!d.moved&&Math.hypot(event.clientX-d.startX,event.clientY-d.startY)<5)return;
              if(!d.moved){d.moved=true;viewport.current?.setPointerCapture?.(event.pointerId);}
              const dx=event.clientX-d.x,dy=event.clientY-d.y;d.x=event.clientX;d.y=event.clientY;setCamera(c=>({...c,x:c.x+dx,y:c.y+dy}));}}
            onPointerUp={event=>{suppressNodeClick.current=drag.current?.moved??false;drag.current=null;if(viewport.current?.hasPointerCapture?.(event.pointerId))viewport.current.releasePointerCapture(event.pointerId);}}
            onPointerCancel={()=>{drag.current=null;suppressNodeClick.current=false;}}
            onPointerLeave={()=>{if(!drag.current?.moved)drag.current=null;}}
            onClick={event=>{if(!(event.target as HTMLElement).closest('.path-node')){setInspected(null);setHovered(null);}}}
            onClickCapture={event=>{if(suppressNodeClick.current){event.preventDefault();event.stopPropagation();suppressNodeClick.current=false;}}}>
            <div className="map-camera" data-map-camera style={{ transform: 'translate(' + camera.x + 'px, ' + camera.y + 'px) scale(' + camera.scale + ')' ,
              width: layout.width, height: layout.height }}>
              <svg className="map-lines" width={layout.width} height={layout.height} aria-hidden="true">
                <defs><marker id="route-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#246d59" /></marker></defs>
                {routePoints.slice(1).map((point,index)=>{const from=routePoints[index]!;const region=layout.regions.find(r=>r.paths.some(p=>p.variantId===route[index]))!;
                  const d=routeSegment(from,point,region.x+756);
                  return <path key={index} d={d} data-route-segment="" className="history-route" data-lead-transition={history.entries.slice(pathEntryIndices[index]!+1,pathEntryIndices[index+1]).some(e=>e.kind==='lead')||undefined} markerEnd="url(#route-arrow)"/>;
                })}
                {linkedPath && leadDestinations.map(id => {
                  const source = layout.points.get(linkedPath.variantId);
                  const region = layout.regions.find(item => item.setting.id === id);
                  const origin=layout.regions.find(r=>r.paths.some(p=>p.variantId===linkedPath.variantId));
                  return source && region && origin ? <path key={id} className="lead-line" fill="none"
                    d={`M ${source.x} ${source.y-42} V ${source.y-52} H ${origin.x+756} V ${region.y-12} H ${region.x+718} V ${region.y+12}`} /> : null;
                })}
              </svg>
              {layout.regions.map(region => <section key={region.setting.id} className={'setting-region ' + (region.setting.coverage === 'reference-only' ? 'out-of-scope' : '')}
                data-current-setting={region.setting.id===progress.settingId||undefined} data-setting-id={region.setting.id} data-state={region.setting.coverage === 'reference-only' ? 'out-of-scope' : 'loaded'}
                style={{ left: region.x, top: region.y, height: region.height }}>
                <h3>{region.setting.sourceName}{region.setting.kind === 'subsetting' && <small> · subsetting</small>}</h3>
                {region.setting.coverage === 'reference-only' ? <p>Referenced destination · content outside pilot</p> :
                  <div className="region-paths">{region.paths.map(path => {
                    const issues = evaluateLifepath(progress, path.variantId, catalog);
                    const state = path.variantId === currentId ? 'current' :
                      route.includes(path.variantId) ? 'in-history' : issues.length ? 'locked' : 'available';
                    return <button key={path.variantId} type="button" className={'path-node ' + state + (inspected === path.variantId ? ' inspected' : '')}
                      data-variant-id={path.variantId} data-state={state}
                      data-support={path.specialRules.length ? 'manual-resolution' : 'full'}
                      onClick={() => setInspected(path.variantId)}
                      onMouseEnter={() => setHovered(path.variantId)} onMouseLeave={() => setHovered(null)}
                      title={issues.map(describeIssue).join(' ')||'Available in the current setting'} aria-label={'Inspect ' + getLifepathDisplayLabel(path, catalog)}>
                      <span className="path-name">{getLifepathDisplayLabel(path, catalog)}</span><span className="path-state">{state==='current'?'● Current':state==='in-history'?'✓ In history':issues.length?'⊘ '+(issues[0].code==='LEAD_REQUIRED'?'Lead needed':issues[0].code==='BORN_LIFEPATH_NOT_FIRST'?'Birth only':issues[0].code==='FIRST_LIFEPATH_MUST_BE_BORN'?'Choose birthplace':'Requires…'):'＋ Available'}{route.includes(path.variantId)?' · steps '+route.flatMap((id,i)=>id===path.variantId?[i+1]:[]).join(', '):''}</span>{density!=='names'&&<small>{path.skillPointGrant.ordinary}sp{path.skillPointGrant.general?' + '+path.skillPointGrant.general+' general':''} · {path.traitPointGrant}tp · {path.resourceGrant.kind==='fixed'?path.resourceGrant.amount:'?'}rp{density==='extended'?' · '+path.years+'y':''}</small>}{density==='extended'&&<small className="card-stat-grant">{statSummary(path)}</small>}{path.specialRules.length > 0 && <small> · manual</small>}
                    </button>;
                  })}</div>}
              </section>)}
            </div>
          </div>
          {hoveredPath && <div className="hover-preview" role="status">
            <strong>{getLifepathDisplayLabel(hoveredPath, catalog)}</strong> · {hoveredPath.years} years · {grantSummary(hoveredPath)}
            <span> · Leads: {leadSummary(hoveredPath)}</span>
            <span> · {evaluateLifepath(progress, hoveredPath.variantId, catalog).map(describeIssue).join(' ') || 'Available'}</span>
          </div>}
          <div className="map-legend">＋ Available　● Current　✓ History　⊘ Locked　◌ Outside pilot <span>Green: route (dashed = taken Lead) · Amber: declared Leads of hovered / selected path</span></div>
        </section>
        <aside className="details-panel" aria-label="Lifepath details">
          <h2>Lifepath details</h2>
          {selectedPath ? <>
            <div className="detail-name"><h3>{getLifepathDisplayLabel(selectedPath, catalog)}</h3><button aria-label="Pin inspected lifepath" aria-pressed={pins.includes(selectedPath.variantId)} onClick={()=>togglePin(selectedPath.variantId)}>{pins.includes(selectedPath.variantId)?'★ Pinned':'☆ Pin path'}</button></div>
            <p>{settingName(selectedPath.settingId)} · {selectedPath.years} years</p>
            <p>{grantSummary(selectedPath)}</p>
            <h4>Skills</h4><p>{humanBurningLists[selectedPath.variantId]?.skills.map(slot=>typeof slot==='string'?skillName(slot):slot.map(skillName).join(' or ')).join(', ')||'No lifepath skills; General points are available.'}</p>
            <h4>Traits · 1 point each</h4><p>{humanBurningLists[selectedPath.variantId]?.traits.join(', ')||'None listed'}</p><details className="source-leads"><summary>Declared Leads</summary><p>{leadSummary(selectedPath)}</p></details>
            <h4>Requirements</h4><p>{selectedPath.requirements.length ?
              selectedPath.requirements.map(describeRequirement).join('; ') : 'None listed'}</p>
            <h4>Current rule evaluation</h4>
            <p>{selectedIssues.length ? selectedIssues.map(describeIssue).join(' ') : 'Available now.'}</p>
            {selectedPath.specialRules.length > 0 && <p>Manual resolution required: {selectedPath.specialRules.map(rule => rule.id).join(', ')}</p>}
            <p className="source-ref">BWGR · pp. {selectedPath.source.printedPages.join(', ')}</p>
            {planLeadAndLifepath(history,selectedPath.variantId,catalog)&&<button className="primary" onClick={()=>setTransition(selectedPath.variantId)}>Take Lead & add {getLifepathDisplayLabel(selectedPath,catalog)}…</button>}
            <button type="button" disabled={!canApplyChoice(mode, selectedIssues)}
              onClick={() => apply({ kind: 'lifepath', id: selectedPath.variantId })}>
              {mode === 'free' && selectedIssues.length ? 'Add anyway ' : 'Add '}{getLifepathDisplayLabel(selectedPath, catalog)}
            </button>
          </> : <p>Inspect a lifepath on the map to see its grants and rule evaluation.</p>}
          {progress.paths.length > 0 && <section aria-labelledby="leads">
            <details className="leads-menu"><summary id="leads">Change setting · Leads <span>{settings.filter(s=>canApplyChoice(mode,evaluateLead(progress,s.id,catalog))).length} available</span></summary>
            <ul>{settings.filter(setting => setting.id !== progress.settingId).map(setting => {
              const issues = evaluateLead(progress, setting.id, catalog);
              return <li key={setting.id}><button type="button" disabled={!canApplyChoice(mode, issues)}
                onClick={() => apply({ kind: 'lead', id: setting.id })}>Lead to {setting.sourceName} (+1 year)</button>
                {issues.length > 0 && <span> · {issues.map(describeIssue).join(' ')}</span>}</li>;
            })}</ul></details>
          </section>}
        </aside>
      </div>

      <SheetEditor sheet={sheet} progress={progress} mode={mode} onChange={updateSheet} onError={setNotice} externalIssues={[
        ...finalIssues.map(({path,issue})=>path.sourceName+': '+describeIssue(issue)),
        ...history.entries.flatMap(entry=>'overrides' in entry?entry.overrides.map(describeIssue):[]),
        ...(progress.leadPending?['Finish the pending Lead by choosing a destination lifepath.']:[]),
      ]}/>
      {transition&&<ConfirmReset title="Move to another setting?" label="Confirm Lead and lifepath" description={'Take a Lead to '+settingName(catalog.lifepaths.get(transition)!.settingId)+' (+1 year), then add '+getLifepathDisplayLabel(catalog.lifepaths.get(transition)!,catalog)+' (+'+catalog.lifepaths.get(transition)!.years+' years). One Undo restores both steps.'} onCancel={()=>setTransition(null)} onConfirm={()=>{const next=planLeadAndLifepath(history,transition,catalog);if(next)commit({...draft,history:next});else setNotice('This transition is no longer legal. Review the requirements.');setTransition(null);}}/>}
      {confirmReset&&<ConfirmReset onCancel={()=>setConfirmReset(false)} onConfirm={()=>apply({kind:'reset'})}/>}
      <footer className="app-footer"><span>BURNING WHEEL GOLD REVISED · HUMAN WORKBENCH</span><span>Draft creation · traits, resource purchases & final validation still in development</span></footer>
    </main>
  );
}
