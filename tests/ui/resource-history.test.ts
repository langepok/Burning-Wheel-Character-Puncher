// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it } from 'vitest';
import { App } from '../../src/ui/App';
import { createSheet, encodeDraft, parseDraft } from '../../src/character/workbench';
import type { Draft } from '../../src/character/workbench';
import { buyResources } from '../../src/character/resources';
import { purchaseTrait } from '../../src/character/traits';
import { projectResources } from '../../src/rules/resources';
import { projectLifepathHistory } from '../../src/character/lifepath-history';
import { catalog, progress, request } from '../helpers/resource-engine';
(globalThis as typeof globalThis&{IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let root:ReturnType<typeof createRoot>|undefined;
afterEach(()=>{if(root)act(()=>root!.unmount());root=undefined;localStorage.clear();document.body.innerHTML='';});
const stored=()=>parseDraft(localStorage.getItem('bw-workbench-v1')!,catalog);
const projection=()=>{const d=stored();return projectResources(d.sheet,projectLifepathHistory(d.history,catalog));};
const click=(container:ParentNode,label:string)=>{const b=[...container.querySelectorAll('button')].find(b=>b.textContent?.includes(label));expect(b,label).toBeTruthy();expect(b!.disabled).toBe(false);act(()=>b!.dispatchEvent(new MouseEvent('click',{bubbles:true})));};
function mount(outlaw=false){
  const p=progress('human.city-dweller.city-born');
  let sheet=buyResources(createSheet(),p,[request('mount','riding-mount')],'rules').sheet;
  if(outlaw)sheet=purchaseTrait(sheet,p,'outlaw',{kind:'catalog'},'free').sheet;
  const d:Draft={version:1,name:'Resource history',mode:'free',history:{entries:[{kind:'lifepath',id:p.paths[0].variantId,overrides:[]}]},sheet,pins:[]};
  localStorage.setItem('bw-workbench-v1',encodeDraft(d));const container=document.createElement('div');document.body.append(container);root=createRoot(container);act(()=>root!.render(createElement(App)));return container;
}
it('existing App Reset, Undo and Redo atomically restore resource ledger and exact debit',()=>{
  const c=mount();const before=stored();expect(projection().spentRps).toBe(5);
  click(c,'Reset');click(c.querySelector('dialog')!,'Confirm remove all');expect(projection().spentRps).toBe(0);
  click(c,'Undo');expect(stored().sheet.resourcePurchases).toEqual(before.sheet.resourcePurchases);expect(projection().spentRps).toBe(5);
  click(c,'Redo');expect(projection().spentRps).toBe(0);
});
it('existing trait Reset, Undo and Redo recompute Outlaw access while preserving purchase provenance',()=>{
  const c=mount(true),before=stored().sheet.resourcePurchases;
  const access=()=>projection().fundingAccess[0].access;
  expect(access()).toBe('restricted');click(c,'Traits');
  click(c,'Reset traits');click(c.querySelector('dialog')!,'Confirm trait reset');expect(access()).toBe('available');
  click(c,'Undo');expect(access()).toBe('restricted');click(c,'Redo');expect(access()).toBe('available');
  expect(stored().sheet.resourcePurchases).toEqual(before);
});
it('existing Remove last preserves purchases and exposes lost funding in Review',()=>{
  const c=mount(),before=stored().sheet.resourcePurchases;click(c,'Remove last');
  expect(stored().sheet.resourcePurchases).toEqual(before);
  expect(projection().diagnostics.some(d=>d.code==='missing-funding-source')).toBe(true);
  click(c,'Undo');expect(projection().diagnostics.some(d=>d.code==='missing-funding-source')).toBe(false);
});
