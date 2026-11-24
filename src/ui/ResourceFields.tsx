import type { ResourceRequest } from '../rules/resource-types';
import { resourceCatalog } from '../rules/resources';
import { skills } from '../character/workbench';
export function ResourceFields({request:r,change}:{request:ResourceRequest;change:(r:ResourceRequest)=>void}){
 const c=r.configuration;
 const set=(key:string,value:string|number|boolean)=>change({...r,configuration:{...c,[key]:value} as ResourceRequest['configuration'],...(key==='quality'?{declaredItems:r.declaredItems?.map(i=>({...i,quality:value as 'poor'}))}:{})});
 return <div className="resource-fields">
 {'quality' in c&&<label>Quality<select value={c.quality} onChange={e=>set('quality',e.target.value)}>{['poor','run-of-the-mill','superior'].map(q=><option key={q}>{q}</option>)}</select></label>}
 {c.kind==='armor'&&<><label>Armor piece<select value={c.piece} onChange={e=>set('piece',e.target.value)}>{['suit','helmet','breastplate','greaves','leggings','half-sleeves','half-leggings'].map(p=><option key={p}>{p}</option>)}</select></label>{resourceCatalog.get(r.definitionId)?.includedOptions?.map(id=><label key={id}><input type="checkbox" checked={c.selectedIncludedDefinitionIds.includes(id)} onChange={e=>change({...r,configuration:{...c,selectedIncludedDefinitionIds:e.target.checked?[...c.selectedIncludedDefinitionIds,id]:c.selectedIncludedDefinitionIds.filter(v=>v!==id)}})}/>{resourceCatalog.get(id)?.sourceName} · included when selected</label>)}</>}
 {'name' in c&&<label>Name<input value={c.name} onChange={e=>set('name',e.target.value)}/></label>}
 {c.kind==='relationship'&&<><label>NPC name<input value={c.npcName} onChange={e=>set('npcName',e.target.value)}/></label><label>Significance<select value={c.significance} onChange={e=>set('significance',e.target.value)}>{['minor','significant','powerful'].map(v=><option key={v}>{v}</option>)}</select></label><label>Family<select value={c.family} onChange={e=>set('family',e.target.value)}>{['none','immediate','other'].map(v=><option key={v}>{v}</option>)}</select></label>{(['romantic','forbidden','hateful'] as const).map(k=><label key={k}><input type="checkbox" checked={c[k]} onChange={e=>set(k,e.target.checked)}/>{k}</label>)}<label>Additional conditions<textarea value={c.additionalConditions} onChange={e=>set('additionalConditions',e.target.value)}/></label></>}
 {'description' in c&&<label>Description<textarea maxLength={20000} value={c.description} onChange={e=>set('description',e.target.value)}/></label>}
 {(c.kind==='reputation'||c.kind==='affiliation')&&<><label>Dice<select value={c.dice} onChange={e=>set('dice',Number(e.target.value))}>{[1,2,3].map(n=><option key={n}>{n}</option>)}</select></label><label>Scope<input value={c.scope} onChange={e=>set('scope',e.target.value)}/></label>{c.kind==='reputation'&&<label>Audience<input value={c.audience} onChange={e=>set('audience',e.target.value)}/></label>}</>}
 {c.kind==='skill-kit'&&<label>Associated skill<select value={c.skillId} onChange={e=>set('skillId',e.target.value)}><option value="choose-skill">Choose a skill…</option>{[...skills.values()].sort((a,b)=>a.sourceName.localeCompare(b.sourceName)).map(s=><option key={s.id} value={s.id}>{s.sourceName}</option>)}</select></label>}
 {c.kind==='companion'&&<p>Linked companion evidence needs an external provider. This editor cannot certify an NPC.</p>}
 {c.kind==='gang'&&<p>The relationship, affiliation and reputation above form one atomic group. Its container carries no extra charge.</p>}
 </div>;
}
