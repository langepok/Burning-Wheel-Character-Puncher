// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { App } from '../../src/ui/App';
import { createSheet, parseDraft } from '../../src/character/workbench';
import { catalog } from '../helpers/resource-engine';
(globalThis as typeof globalThis&{IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let root:ReturnType<typeof createRoot>|undefined;
afterEach(()=>{if(root)act(()=>root!.unmount());root=undefined;vi.restoreAllMocks();localStorage.clear();document.body.innerHTML='';});
const legacy=()=>JSON.stringify({version:1,name:'Resource shopper',mode:'rules',history:{entries:[{kind:'lifepath',id:'human.city-dweller.city-born',overrides:[]}]},sheet:createSheet(),pins:[]});
function mount(){const container=document.createElement('div');document.body.append(container);root=createRoot(container);act(()=>root!.render(createElement(App)));return container;}
const click=(container:ParentNode,label:string)=>{const b=[...container.querySelectorAll('button')].find(b=>b.textContent?.includes(label));expect(b,label).toBeTruthy();act(()=>b!.click());};
const stored=()=>parseDraft(localStorage.getItem('bw-workbench-v1')!,catalog);
it('backs up the exact v1 bytes before saving v2',()=>{const raw=legacy();localStorage.setItem('bw-workbench-v1',raw);mount();expect(localStorage.getItem('bw-workbench-v1-before-v2')).toBe(raw);expect(stored().version).toBe(2);});
it('protects the old copy if the backup write fails',()=>{const raw=legacy();localStorage.setItem('bw-workbench-v1',raw);const original=Storage.prototype.setItem;vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,key,value){if(key==='bw-workbench-v1-before-v2')throw new Error('Full');original.call(this,key,value);});const c=mount();expect(localStorage.getItem('bw-workbench-v1')).toBe(raw);expect(c.textContent).toContain('Could not save');});
it('prepares Clothes without debit; Buy, return, Undo and Redo restore both sides',()=>{localStorage.setItem('bw-workbench-v1',legacy());const c=mount();click(c,'Resources');click(c,'Explore resources');const entry=[...c.querySelectorAll('.resource-catalog-entry')].find(e=>e.querySelector('h3')?.textContent==='Clothes')!;click(entry,'Prepare');expect(stored().sheet.resourcePurchases).toBeUndefined();expect(stored().resourcePreparation).toHaveLength(1);click(c,'×');expect(document.activeElement?.textContent).toBe('Explore resources');click(c,'Buy preparation');expect(document.activeElement?.textContent).toContain('Paid 1 rps');expect(stored().sheet.resourcePurchases![0].originalPaidRps).toBe(1);expect(stored().resourcePreparation).toHaveLength(0);click(c,'Undo');expect(stored().resourcePreparation).toHaveLength(1);expect(stored().sheet.resourcePurchases).toBeUndefined();click(c,'Redo');click(c,'Return to preparation');expect(stored().resourcePreparation).toHaveLength(1);expect(stored().sheet.resourcePurchases).toEqual([]);click(c,'Undo');expect(stored().sheet.resourcePurchases).toHaveLength(1);expect(stored().resourcePreparation).toHaveLength(0);});
