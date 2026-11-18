import { useEffect, useRef, useState } from 'react';
import { createBuildHistory } from '../character';
import { applyLifepathCommand, canApplyChoice, projectLifepathHistory } from '../character/lifepath-history';
import type { BuildMode, LifepathCommand } from '../character/lifepath-history';
import { createCatalog, getLifepathDisplayLabel } from '../data/catalog';
import type { RequirementNode } from '../data/catalog';
import { humanContent } from '../data/human';
import { evaluateLead, evaluateLifepath, validateLifepathRequirements } from '../rules/lifepaths';
import type { LifepathIssue, LifepathProgress } from '../rules/lifepaths';
import { layoutCatalog } from './map-layout';
import './app.css';
import { createSheet, deriveSheet, encodeDraft, parseDraft, skillName } from '../character/workbench';
import type { Draft, Sheet } from '../character/workbench';
import { humanBurningLists } from '../data/burning/human';
import { SheetEditor } from './SheetEditor';

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
  const [notice,setNotice]=useState(initial.error);
  const [saveStatus,setSaveStatus]=useState(initial.error?'Recovery needed':'Saved on this device');
  const [query,setQuery]=useState('');
  const [density,setDensity]=useState('names');
  const [expanded,setExpanded]=useState(false);
  const fileInput=useRef<HTMLInputElement>(null);
  const {history,mode,sheet,pins}=draft;
  function commit(next:Draft){setPast(p=>[...p.slice(-99),draft]);setDraft(next);setNotice('');}
  function updateSheet(next:Sheet){if(next!==sheet)commit({...draft,sheet:next});}
  function setMode(next:BuildMode){setDraft({...draft,mode:next});}
  function togglePin(id:string){setDraft(d=>({...d,pins:d.pins.includes(id)?d.pins.filter(p=>p!==id):[...d.pins,id]}));}
  useEffect(()=>{if(recoveryBlocked)return;try{localStorage.setItem('bw-workbench-v1',encodeDraft(draft));setSaveStatus('Saved on this device');}catch{setSaveStatus('Could not save · export a backup');}},[draft,recoveryBlocked]);
  function exportDraft(){const url=URL.createObjectURL(new Blob([encodeDraft(draft)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='burning-wheel-character.json';a.click();URL.revokeObjectURL(url);setNotice('Character draft exported.');}
  function undo(){const previous=past.at(-1);if(previous){setDraft({...previous,mode:draft.mode,name:draft.name,pins:draft.pins});setPast(p=>p.slice(0,-1));setNotice('Last edit undone.');}else if(history.entries.length){setDraft({...draft,history:applyLifepathCommand(history,{kind:'undo'},mode,catalog)});}setConfirmReset(false);}

  const [inspected, setInspected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, scale: .95 });
  const [confirmReset, setConfirmReset] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const progress = projectLifepathHistory(history, catalog);
  const finalIssues = validateLifepathRequirements(progress);
  const warningCount = deriveSheet(sheet,progress).issues.length + finalIssues.length + history.entries.reduce((total, entry) =>
    total + ('overrides' in entry ? entry.overrides.length : 0), 0);
  const currentId = progress.paths.at(-1)?.variantId;
  const selectedPath = inspected ? catalog.lifepaths.get(inspected) : undefined;
  const hoveredPath = hovered ? catalog.lifepaths.get(hovered) : undefined;
  const selectedIssues = selectedPath ? evaluateLifepath(progress, selectedPath.variantId, catalog) : [];
  const route = history.entries.flatMap(entry => entry.kind === 'lifepath' && 'id' in entry ? [entry.id] : []);
  const routePoints = route.map(id => layout.points.get(id)).filter(point => point !== undefined);
  const pathEntryIndices = history.entries.flatMap((entry, index) => entry.kind === 'lifepath' ? [index] : []);
  const hoveredLeads = hoveredPath?.leads;
  const leadDestinations = hoveredLeads?.kind === 'to' ? hoveredLeads.settingIds :
    hoveredLeads?.kind === 'any' ? layout.regions.map(region => region.setting.id).filter(id => id !== hoveredPath?.settingId) :
    hoveredLeads?.kind === 'anyExcept' ? layout.regions.map(region => region.setting.id)
      .filter(id => id !== hoveredPath?.settingId && !hoveredLeads.excludedSettingIds.includes(id)) : [];

  function apply(command: LifepathCommand) {
    if(command.kind==='undo'){undo();return;}
    const next=applyLifepathCommand(history, command, mode, catalog);
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
  function leadSummary(path: typeof paths[number]) {
    if (path.leads.kind === 'any') return 'Any setting';
    if (path.leads.kind === 'anyExcept') return 'Any except ' + path.leads.excludedSettingIds.map(settingName).join(', ');
    return path.leads.settingIds.map(settingName).join(', ') || 'None';
  }
  function grantSummary(path: typeof paths[number]) {
    const stat = path.statGrant.kind === 'none' ? 'No stat points' :
      path.statGrant.kind === 'mentalAndPhysical' ? '+' + path.statGrant.mental + ' mental, +' + path.statGrant.physical + ' physical' :
      path.statGrant.kind === 'chooseMentalOrPhysical' ? '+' + path.statGrant.amount + ' mental or physical' :
      '+' + path.statGrant.amount + ' ' + path.statGrant.kind;
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
        <div className="file-actions"><span className="save-status">{saveStatus}</span><button onClick={()=>fileInput.current?.click()}>Import</button><button onClick={exportDraft}>Export</button><button disabled={!past.length&&!history.entries.length} onClick={undo}>Undo</button></div>
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
          <p aria-live="polite">Age: {progress.age} years · Current setting: {progress.settingId ? settingName(progress.settingId) : 'None'}</p>
          {!progress.paths.length&&<div className="start-guide"><h3>Every life starts somewhere.</h3><p>Inspect a birthplace, then add it to begin your story.</p>{paths.filter(p=>p.isBorn).map(p=><button key={p.variantId} onClick={()=>{setInspected(p.variantId);focusPoint(layout.points.get(p.variantId)!);}}>{p.sourceName} <span>›</span></button>)}</div>}
          <ol>{history.entries.map((entry, index) => {
            const age = history.entries.slice(0, index + 1).reduce((total, previous) =>
              total + (previous.kind === 'lead' ? 1 : previous.kind === 'lifepath' ? catalog.lifepaths.get(previous.id)!.years : 0), 0);
            return <li key={index} data-history-step={entry.kind === 'gender' ? undefined : index + 1}>
              {entry.kind === 'lifepath' && 'id' in entry ? <button type="button" onClick={() => {
                setInspected(entry.id);
                const point = layout.points.get(entry.id);
                if (point) focusPoint(point);
              }}>{getLifepathDisplayLabel(catalog.lifepaths.get(entry.id)!, catalog)}</button> :
                entry.kind === 'lead' && 'id' in entry ? 'Lead to ' + settingName(entry.id) + ' (+1 year)' :
                  'Gender: ' + ('value' in entry ? entry.value ?? 'Unspecified' : 'Unspecified')}
              <small>Age {age}</small>
              {entry.kind !== 'gender' && entry.overrides.length > 0 &&
                <span> · Free Creation override: {entry.overrides.map(describeIssue).join(' ')}</span>}
            </li>;
          })}</ol>
          <div className="history-actions"><button type="button" disabled={!history.entries.length&&!past.length} onClick={() => apply({ kind: 'undo' })}>Undo last edit</button>
            <button type="button" disabled={!history.entries.length} onClick={() => setConfirmReset(true)}>Reset</button></div>
          {confirmReset && <div role="group" aria-label="Confirm reset"><p>Remove all lifepaths, stat allocations and skill purchases? Your name, mode and pins are kept. Undo can restore this draft.</p>
            <button type="button" onClick={() => apply({ kind: 'reset' })}>Confirm remove all</button>
            <button type="button" onClick={() => setConfirmReset(false)}>Cancel</button></div>}
          {progress.leadPending && <p>Choose a lifepath in the destination to complete the transition.</p>}
          {finalIssues.length > 0 && <ul aria-label="Current build requirements">
            {finalIssues.map(({ index, path, issue }, item) => <li key={item}>{index + 1}. {path.sourceName}: {describeIssue(issue)}</li>)}
          </ul>}
        </section>
        <section className="map-panel" aria-labelledby="map-title">
          <div className="map-heading"><div className="map-title-row"><h2 id="map-title">Lifepath map</h2><button onClick={()=>setExpanded(!expanded)}>{expanded?'Compact map':'Expand map'}</button></div>
            <div className="map-search"><input aria-label="Search lifepaths" placeholder="Find a lifepath or setting…" value={query} onChange={e=>setQuery(e.target.value)}/>
            {query&&<div className="search-results">{paths.filter(p=>(p.sourceName+' '+getLifepathDisplayLabel(p,catalog)+' '+settingName(p.settingId)).toLowerCase().includes(query.toLowerCase())).map(p=><button key={p.variantId} onClick={()=>{setInspected(p.variantId);focusPoint(layout.points.get(p.variantId)!);setQuery('');}}>{getLifepathDisplayLabel(p,catalog)}<small>{settingName(p.settingId)}</small></button>)}{!paths.some(p=>(p.sourceName+' '+getLifepathDisplayLabel(p,catalog)+' '+settingName(p.settingId)).toLowerCase().includes(query.toLowerCase()))&&<p>No matching lifepaths.</p>}</div>}</div>
            <div className="map-controls">
            <button type="button" aria-label="Zoom in" onClick={() => zoom(1.25)}>Zoom in</button>
            <button type="button" onClick={() => zoom(0.8)}>Zoom out</button>
            <button type="button" onClick={fitAll}>Fit all</button>
            <button type="button" disabled={!inspected || !layout.points.has(inspected)} onClick={() => focusPoint(layout.points.get(inspected!)!)}>Center inspected</button>
            <button type="button" disabled={!routePoints.length} onClick={fitRoute}>Fit history</button>
            <select aria-label="Map detail density" value={density} onChange={e=>setDensity(e.target.value)}><option value="names">Names</option><option value="grants">Grants</option><option value="extended">Extended</option></select>
          </div><div className="setting-shortcuts">{layout.regions.filter(r=>r.paths.length).map(r=><button key={r.setting.id} onClick={()=>{const scale=.9;setCamera({scale,x:40-r.x*scale,y:24-r.y*scale});}}>{r.setting.uiQualifier}</button>)}</div></div>
          <div className="map-viewport" aria-label="Lifepath map" ref={viewport}
            onPointerDown={event => { if (!(event.target as Element).closest('button')) drag.current = { x: event.clientX, y: event.clientY }; }}
            onPointerMove={event => { if (drag.current) {
              const dx = event.clientX - drag.current.x; const dy = event.clientY - drag.current.y;
              drag.current = { x: event.clientX, y: event.clientY };
              setCamera(previous => ({ ...previous, x: previous.x + dx, y: previous.y + dy }));
            } }}
            onPointerUp={() => { drag.current = null; }}
            onPointerLeave={() => { drag.current = null; }}
            onWheel={event => { event.preventDefault(); zoom(event.deltaY < 0 ? 1.1 : 0.9); }}>
            <div className="map-camera" data-map-camera style={{ transform: 'translate(' + camera.x + 'px, ' + camera.y + 'px) scale(' + camera.scale + ')' ,
              width: layout.width, height: layout.height }}>
              <svg className="map-lines" width={layout.width} height={layout.height} aria-hidden="true">
                <defs><marker id="route-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#1869bb" /></marker></defs>
                {routePoints.slice(1).map((point, index) => <line key={index} data-route-segment="" className="history-route"
                  data-lead-transition={history.entries.slice(pathEntryIndices[index]! + 1, pathEntryIndices[index + 1]).some(entry => entry.kind === 'lead') || undefined}
                  x1={routePoints[index]!.x} y1={routePoints[index]!.y} x2={point.x} y2={point.y} markerEnd="url(#route-arrow)" />)}
                {routePoints.map((point, index) => <g key={index} className="route-order"><circle cx={point.x - 55} cy={point.y - 16} r="11" />
                  <text x={point.x - 55} y={point.y - 12} textAnchor="middle">{index + 1}</text></g>)}
                {hoveredPath && leadDestinations.map(id => {
                  const source = layout.points.get(hoveredPath.variantId);
                  const region = layout.regions.find(item => item.setting.id === id);
                  return source && region ? <line key={id} className="lead-line"
                    x1={source.x} y1={source.y} x2={region.x + 165} y2={region.y + 26} /> : null;
                })}
              </svg>
              {layout.regions.map(region => <section key={region.setting.id} className={'setting-region ' + (region.setting.coverage === 'reference-only' ? 'out-of-scope' : '')}
                data-setting-id={region.setting.id} data-state={region.setting.coverage === 'reference-only' ? 'out-of-scope' : 'loaded'}
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
                      aria-label={'Inspect ' + getLifepathDisplayLabel(path, catalog)}>
                      {getLifepathDisplayLabel(path, catalog)}{density!=='names'&&<small>{path.skillPointGrant.ordinary}sp · {path.traitPointGrant}tp{density==='extended'?' · '+path.years+'y':''}</small>}{path.specialRules.length > 0 && <small> · manual</small>}
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
          <div className="map-legend">● Available　● Current　● In history　● Locked　◌ Out of scope　<span>━ History route　┄ Leads on hover</span></div>
        </section>
        <aside className="details-panel" aria-label="Lifepath details">
          <h2>Lifepath details</h2>
          {selectedPath ? <>
            <div className="detail-name"><h3>{getLifepathDisplayLabel(selectedPath, catalog)}</h3><button aria-label="Pin inspected lifepath" aria-pressed={pins.includes(selectedPath.variantId)} onClick={()=>togglePin(selectedPath.variantId)}>{pins.includes(selectedPath.variantId)?'★':'☆'}</button></div>
            <p>{settingName(selectedPath.settingId)} · {selectedPath.years} years</p>
            <p>{grantSummary(selectedPath)}</p>
            <h4>Skills</h4><p>{humanBurningLists[selectedPath.variantId]?.skills.map(slot=>typeof slot==='string'?skillName(slot):slot.map(skillName).join(' or ')).join(', ')||'No lifepath skills; General points are available.'}</p>
            <h4>Leads</h4><p>{leadSummary(selectedPath)}</p>
            <h4>Requirements</h4><p>{selectedPath.requirements.length ?
              selectedPath.requirements.map(describeRequirement).join('; ') : 'None listed'}</p>
            <h4>Current rule evaluation</h4>
            <p>{selectedIssues.length ? selectedIssues.map(describeIssue).join(' ') : 'Available now.'}</p>
            {selectedPath.specialRules.length > 0 && <p>Manual resolution required: {selectedPath.specialRules.map(rule => rule.id).join(', ')}</p>}
            <p className="source-ref">BWGR · pp. {selectedPath.source.printedPages.join(', ')}</p>
            <button type="button" disabled={!canApplyChoice(mode, selectedIssues)}
              onClick={() => apply({ kind: 'lifepath', id: selectedPath.variantId })}>
              {mode === 'free' && selectedIssues.length ? 'Add anyway ' : 'Add '}{getLifepathDisplayLabel(selectedPath, catalog)}
            </button>
          </> : <p>Inspect a lifepath on the map to see its grants and rule evaluation.</p>}
          {progress.paths.length > 0 && <section aria-labelledby="leads">
            <h3 id="leads">Leads</h3><p>Lead actions are separate from inspecting a destination.</p>
            <ul>{settings.filter(setting => setting.id !== progress.settingId).map(setting => {
              const issues = evaluateLead(progress, setting.id, catalog);
              return <li key={setting.id}><button type="button" disabled={!canApplyChoice(mode, issues)}
                onClick={() => apply({ kind: 'lead', id: setting.id })}>Lead to {setting.sourceName} (+1 year)</button>
                {issues.length > 0 && <span> · {issues.map(describeIssue).join(' ')}</span>}</li>;
            })}</ul>
          </section>}
        </aside>
      </div>
      <div className="pinned-tray"><strong>☆ Pinned paths</strong>{pins.length?pins.map(id=><span key={id}><button onClick={()=>{setInspected(id);focusPoint(layout.points.get(id)!);}}>{getLifepathDisplayLabel(catalog.lifepaths.get(id)!,catalog)}</button><button aria-label={'Unpin '+id} onClick={()=>togglePin(id)}>×</button></span>):<small>Keep possible futures close. Pin a path from its details.</small>}{pins.length>0&&<button onClick={()=>setDraft({...draft,pins:[]})}>Clear pinned</button>}</div>
      <SheetEditor sheet={sheet} progress={progress} mode={mode} onChange={updateSheet} onError={setNotice} externalIssues={[
        ...finalIssues.map(({path,issue})=>path.sourceName+': '+describeIssue(issue)),
        ...history.entries.flatMap(entry=>'overrides' in entry?entry.overrides.map(describeIssue):[]),
        ...(progress.leadPending?['Finish the pending Lead by choosing a destination lifepath.']:[]),
      ]}/>
      <footer className="app-footer"><span>BURNING WHEEL GOLD REVISED · HUMAN WORKBENCH</span><span>Draft creation · traits, resource purchases & final validation still in development</span></footer>
    </main>
  );
}
