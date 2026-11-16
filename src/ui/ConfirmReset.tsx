import { useEffect, useRef } from 'react';
export function ConfirmReset({onConfirm,onCancel}:{onConfirm:()=>void;onCancel:()=>void}){
  const dialog=useRef<HTMLDialogElement>(null);const cancel=useRef<HTMLButtonElement>(null);
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;
    if(dialog.current?.showModal)dialog.current.showModal();else dialog.current?.setAttribute('open','');
    cancel.current?.focus();return ()=>previous?.focus();},[]);
  return <dialog ref={dialog} className="reset-dialog" aria-label="Confirm reset" aria-describedby="reset-description"
    onCancel={e=>{e.preventDefault();onCancel();}} onKeyDown={e=>{
      if(e.key==='Escape'){e.preventDefault();onCancel();}
      if(e.key==='Tab'){const buttons=[...dialog.current!.querySelectorAll<HTMLButtonElement>('button')];
        if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons[1].focus();}
        else if(!e.shiftKey&&document.activeElement===buttons[1]){e.preventDefault();buttons[0].focus();}}
    }}><h2>Remove all lifepaths?</h2><p id="reset-description">This clears the route, stat allocations and skill purchases. Name, gender, mode and pins stay. Undo can restore the draft.</p>
    <div><button ref={cancel} onClick={onCancel}>Cancel</button><button className="primary" onClick={onConfirm}>Confirm remove all</button></div></dialog>;
}
