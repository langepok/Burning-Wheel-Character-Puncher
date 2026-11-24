import { useState } from 'react';
import type { Draft } from '../character/workbench';
import { setResourceBudgetOverrides } from '../character/resources';
export function ResourceBudgetGrants({draft,onChange,onError}:{draft:Draft;onChange:(d:Draft)=>void;onError:(s:string)=>void}){
 const [amount,setAmount]=useState(''),[reason,setReason]=useState('');
 const grants=draft.sheet.resourceBudgetOverrides??[];
 const apply=(next:typeof grants)=>{const result=setResourceBudgetOverrides(draft.sheet,next,draft.mode);if(result.error){onError(result.error);return false;}onChange({...draft,sheet:result.sheet});return true;};
 if(draft.mode!=='free'&&!grants.length)return null;
 return <details><summary>Free Creation funding grants</summary><p>Separate explained grants; existing lifepath funding and historical payments remain intact.</p>{grants.map(g=><p key={g.id}>{g.rps} rps · {g.reason} <button disabled={draft.mode!=='free'} onClick={()=>apply(grants.filter(v=>v.id!==g.id))}>Remove grant</button></p>)}{draft.mode==='free'&&<form className="resource-fields" onSubmit={e=>{e.preventDefault();if(!/^\d+$/.test(amount)||!Number.isSafeInteger(Number(amount))||!reason.trim()){onError('Enter a whole-rp grant and its reason.');return;}if(apply([...grants,{id:crypto.randomUUID(),rps:Number(amount),reason}])){setAmount('');setReason('');}}}><label>Grant (rps)<input inputMode="numeric" value={amount} onChange={e=>setAmount(e.target.value)}/></label><label>Grant reason<input maxLength={20000} value={reason} onChange={e=>setReason(e.target.value)}/></label><button type="submit">Apply explained grant</button></form>}</details>;
}
