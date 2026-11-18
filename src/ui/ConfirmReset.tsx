import { useEffect, useRef } from 'react';
export function ConfirmReset({onConfirm,onCancel,title="Remove all lifepaths?",description="This clears the route, stat allocations and skill purchases. Name, gender, mode and pins stay. Undo can restore the draft.",label="Confirm remove all"}:{onConfirm:()=>void;onCancel:()=>void;title?:string;description?:string;label?:string}){
  const dialog=useRef<HTMLDialogElement>(null);const cancel=useRef<HTMLButtonElement>(null);
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;
    if(dialog.current?.showModal)dialog.current.showModal();else dialog.current?.setAttribute('open','');
    cancel.current?.focus();return ()=>previous?.focus();},[]);
  return <dialog ref={dialog} className="reset-dialog" aria-label={label==='Confirm remove all'?'Confirm reset':title} aria-describedby="reset-description"
    onCancel={e=>{e.preventDefault();onCancel();}} onKeyDown={e=>{
      if(e.key==='Escape'){e.preventDefault();onCancel();}
      if(e.key==='Tab'){const buttons=[...dialog.current!.querySelectorAll<HTMLButtonElement>('button')];
        if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons[1].focus();}
        else if(!e.shiftKey&&document.activeElement===buttons[1]){e.preventDefault();buttons[0].focus();}}
    }}><h2>{title}</h2><p id="reset-description">{description}</p>
    <div><button ref={cancel} onClick={onCancel}>Cancel</button><button className="primary" onClick={onConfirm}>{label}</button></div></dialog>;
}
