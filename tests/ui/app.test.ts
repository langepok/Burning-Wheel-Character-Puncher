// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, it } from 'vitest';
import { App } from '../../src/ui/App';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it('renders the three audited Born choices and initial age in the Burner', () => {
  const html = renderToStaticMarkup(createElement(App));
  for (const name of ['Born Peasant', 'Village Born', 'City Born']) {
    expect(html).toContain(name);
  }
  expect(html).toContain('Age: 0 years');
  expect(html).not.toContain('Soldier Born');
});

const mounted: { root: ReturnType<typeof createRoot>; container: HTMLDivElement }[] = [];
afterEach(() => {
  localStorage.clear();
  for (const { root, container } of mounted.splice(0)) {
    act(() => root.unmount());
    container.remove();
  }
});

function mountApp() {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  mounted.push({ root, container });
  act(() => root.render(createElement(App)));
  return container;
}

function click(container: HTMLElement, label: string) {
  const node = [...container.querySelectorAll<HTMLButtonElement>('[data-variant-id]')]
    .find(item => item.textContent?.includes(label));
  if (node && !label.startsWith('Add ')) {
    act(() => node.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    const action = container.querySelector<HTMLButtonElement>('.details-panel > button');
    expect(action, 'Apply ' + label).toBeTruthy();
    expect(action!.disabled, 'Apply ' + label).toBe(false);
    act(() => action!.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    return;
  }
  const button = [...container.querySelectorAll('button')].find(item => item.textContent?.includes(label));
  expect(button, label).toBeTruthy();
  expect(button!.disabled, label).toBe(false);
  act(() => button!.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

function select(container: HTMLElement, label: string, value: string) {
  const control = [...container.querySelectorAll('label')].find(item => item.textContent?.includes(label))?.querySelector('select');
  expect(control, label).toBeTruthy();
  act(() => {
    control!.value = value;
    control!.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function leadRow(container: HTMLElement, label: string) {
  return [...container.querySelectorAll('section[aria-labelledby="leads"] li')]
    .find(item => item.querySelector('button')?.textContent?.includes(label));
}

it('shows unavailable Leads and their rule reasons in Rules mode', () => {
  const container = mountApp();
  click(container, 'Village Born');

  const unlisted = leadRow(container, 'Lead to Professional Soldier');
  expect(unlisted).toBeTruthy();
  expect(unlisted!.querySelector('button')?.disabled).toBe(true);
  expect(unlisted!.textContent).toContain('The last lifepath does not list this Lead.');

  const unloaded = leadRow(container, 'Lead to Servitude');
  expect(unloaded).toBeTruthy();
  expect(unloaded!.querySelector('button')?.disabled).toBe(true);
  expect(unloaded!.textContent).toContain('Lifepath data for this setting is outside the pilot.');
  expect(leadRow(container, 'Lead to Peasant')?.querySelector('button')?.disabled).toBe(false);
  expect(container.textContent).toContain('Age: 10 years');
});

it('keeps Lead diagnostics visible and allows loaded overrides in Free Creation', () => {
  const container = mountApp();
  click(container, 'Village Born');
  select(container, 'Build mode', 'free');

  const unlisted = leadRow(container, 'Lead to Professional Soldier');
  expect(unlisted?.querySelector('button')?.disabled).toBe(false);
  expect(unlisted?.textContent).toContain('The last lifepath does not list this Lead.');

  const unloaded = leadRow(container, 'Lead to Servitude');
  expect(unloaded?.querySelector('button')?.disabled).toBe(true);
  expect(unloaded?.textContent).toContain('Lifepath data for this setting is outside the pilot.');

  click(container, 'Lead to Professional Soldier');
  expect(container.textContent).toContain('Age: 11 years');
  expect(container.textContent).toContain('Free Creation override: The last lifepath does not list this Lead.');
});

it.each([
  ['Village Born', 'Groom', '18'],
  ['City Born', 'City Runner', '19'],
])('plays the %s Soldier route through the UI and reverses it', (born, bridge, age) => {
  const container = mountApp();
  click(container, born);
  expect(container.querySelectorAll('[data-variant-id]')).not.toHaveLength(0);
  expect(container.querySelector('[data-variant-id="human.' + (born === 'City Born' ? 'city-dweller.city-born' : 'villager.village-born') + '"]')?.getAttribute('data-state')).toBe('current');
  click(container, bridge);
  click(container, 'Lead to Professional Soldier');
  expect(container.textContent).toContain('Choose a lifepath in the destination');
  click(container, 'Foot Soldier');
  expect(container.textContent).toContain(`Age: ${age} years`);
  click(container, 'Undo');
  expect(container.textContent).toContain('Choose a lifepath in the destination');
  click(container, 'Reset');
  click(container, 'Confirm remove all');
  expect(container.textContent).toContain('Age: 0 years');
  expect(container.textContent).toContain('Village Born');
});

it('keeps later Born overrides visible in Free Creation with rule diagnostics', () => {
  const container = mountApp();
  click(container, 'Village Born');
  expect(container.querySelector('[data-variant-id="human.peasant.born-peasant"]')?.getAttribute('data-state')).toBe('locked');
  select(container, 'Build mode', 'free');
  const born = container.querySelector('[data-variant-id="human.peasant.born-peasant"]');
  expect(born).toBeTruthy();
  act(() => born!.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  expect(container.textContent).toContain('Born lifepaths are only available as the first choice.');
  click(container, 'Add anyway Born Peasant');
  expect(container.textContent).toContain('Free Creation override: Born lifepaths are only available as the first choice.');
  select(container, 'Build mode', 'rules');
  click(container, 'Undo');
  expect(container.textContent).toContain('Age: 10 years');
});

it('renders catalog regions and inspects a locked path without changing history', () => {
  const container = mountApp();
  expect(container.querySelector('[aria-label="Lifepath map"]')).toBeTruthy();
  expect(container.querySelector('[data-setting-id="human.professional-soldier"]')).toBeTruthy();
  expect(container.querySelector('[data-setting-id="human.servitude-captive"]')?.getAttribute('data-state')).toBe('out-of-scope');
  const row = container.querySelector('[data-variant-id="human.professional-soldier.foot-soldier"]') as HTMLElement;
  expect(row.getAttribute('data-state')).toBe('locked');
  act(() => row.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  expect(container.querySelector('[aria-label="Lifepath details"]')?.textContent).toContain('Choose a Born lifepath first.');
  expect(container.textContent).toContain('Age: 0 years');
  expect(container.querySelectorAll('[data-history-step]')).toHaveLength(0);
});

it('previews declared Leads on hover without applying or inspecting a path', () => {
  const container = mountApp();
  const node = container.querySelector('[data-variant-id="human.city-dweller.runner"]') as HTMLElement;
  act(() => node.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })));
  expect(container.querySelector('.hover-preview')?.textContent).toContain('Leads:');
  expect(container.querySelectorAll('.lead-line').length).toBeGreaterThan(0);
  expect(container.querySelector('[aria-label="Lifepath details"]')?.textContent).toContain('Inspect a lifepath');
  expect(container.querySelectorAll('[data-history-step]')).toHaveLength(0);
});

it('keeps camera stable during inspection and actions, and moves it with map controls', () => {
  const container = mountApp();
  const camera = () => container.querySelector('[data-map-camera]')?.getAttribute('style');
  click(container, 'Fit all');
  const start = camera();
  const born = container.querySelector('[data-variant-id="human.villager.village-born"]') as HTMLElement;
  act(() => born.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  expect(camera()).toBe(start);
  click(container, 'Add Village Born');
  expect(camera()).toBe(start);
  click(container, 'Zoom in');
  expect(camera()).not.toBe(start);
  click(container, 'Fit all');
  expect(camera()).toBe(start);
  click(container, 'Center inspected');
  expect(camera()).not.toBe(start);
});

it('shows the ordered route and exact Lead years through Undo and Reset', () => {
  const container = mountApp();
  click(container, 'Village Born');
  click(container, 'Groom');
  click(container, 'Lead to Professional Soldier');
  click(container, 'Foot Soldier');
  expect(container.querySelectorAll('[data-route-segment]')).toHaveLength(2);
  expect(container.querySelectorAll('[data-history-step]')).toHaveLength(4);
  expect(container.textContent).toContain('Age: 18 years');
  click(container, 'Undo');
  expect(container.querySelectorAll('[data-route-segment]')).toHaveLength(1);
  expect(container.textContent).toContain('Age: 15 years');
  click(container, 'Reset');
  click(container, 'Confirm remove all');
  expect(container.textContent).toContain('Age: 0 years');
  expect(container.querySelectorAll('[data-route-segment]')).toHaveLength(0);
});

function pressLabel(container:HTMLElement,label:string){
 const button=container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
 expect(button,label).toBeTruthy();expect(button.disabled,label).toBe(false);
 act(()=>button.dispatchEvent(new MouseEvent('click',{bubbles:true})));
}
it('opens, advances and refunds a lifepath skill and restores it after reloading the draft',()=>{
 const c=mountApp();click(c,'Born Peasant');click(c,'Farmer');
 for(let i=0;i<4;i++)pressLabel(c,'Increase perception');
 pressLabel(c,'Increase Farming');
 expect(c.querySelector('[data-skill-id="farming"] .skill-rating')?.textContent).toBe('B2');
 pressLabel(c,'Increase Farming');
 expect(c.querySelector('[data-skill-id="farming"] .skill-rating')?.textContent).toBe('B3');
 pressLabel(c,'Decrease Farming');pressLabel(c,'Decrease Farming');
 expect(JSON.parse(localStorage.getItem('bw-workbench-v1')!).sheet.purchases).toEqual([]);
 pressLabel(c,'Increase Farming');
 const restored=mountApp();
 expect(restored.querySelector('[data-skill-id="farming"] .skill-rating')?.textContent).toBe('B2');
 expect(restored.textContent).toContain('Age: 16 years');
});
it('adding a catalog candidate spends nothing, explains ordinary restrictions and uses General explicitly',()=>{
 const c=mountApp();click(c,'Born Peasant');click(c,'Farmer');
 for(let i=0;i<4;i++)pressLabel(c,'Increase agility');
 click(c,'+ Add skill');
 const input=c.querySelector<HTMLInputElement>('[aria-label="Search skill catalog"]')!;
 act(()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,'Sword');input.dispatchEvent(new Event('input',{bubbles:true}));});
 expect(c.querySelector('.catalog-detail h3')?.textContent).toBe('Sword');
 click(c,'+ Add to working list');pressLabel(c,'Close skill catalog');
 expect(JSON.parse(localStorage.getItem('bw-workbench-v1')!).sheet.purchases).toEqual([]);
 pressLabel(c,'Increase Sword');expect(c.querySelector('[role="status"]')?.textContent).toContain('Use General');
 const general=[...c.querySelectorAll<HTMLButtonElement>('.pool-controls button')].find(b=>b.textContent?.includes('General'))!;
 act(()=>general.click());pressLabel(c,'Increase Sword');
 expect(c.querySelector('[data-skill-id="sword"] .skill-rating')?.textContent).toBe('B2');
 pressLabel(c,'Decrease Sword');expect(JSON.parse(localStorage.getItem('bw-workbench-v1')!).sheet.purchases).toEqual([]);
});
it('reset and Undo restore stat and skill allocations while preserving pins',()=>{
 const c=mountApp();click(c,'Born Peasant');click(c,'Farmer');
 for(let i=0;i<4;i++)pressLabel(c,'Increase perception');pressLabel(c,'Increase Farming');
 const before=JSON.parse(localStorage.getItem('bw-workbench-v1')!);
 click(c,'Reset');click(c,'Confirm remove all');
 expect(JSON.parse(localStorage.getItem('bw-workbench-v1')!).sheet.purchases).toHaveLength(0);
 click(c,'Undo');
 expect(JSON.parse(localStorage.getItem('bw-workbench-v1')!).sheet).toEqual(before.sheet);
});

it('round trips purchases with Redo and clears Redo only on successful edits',()=>{
 const c=mountApp();click(c,'Born Peasant');click(c,'Farmer');for(let i=0;i<4;i++)pressLabel(c,'Increase perception');
 pressLabel(c,'Increase Farming');const saved=JSON.parse(localStorage.getItem('bw-workbench-v1')!);
 click(c,'Undo');expect(JSON.parse(localStorage.getItem('bw-workbench-v1')!).sheet.purchases).toHaveLength(0);
 click(c,'Redo');expect(JSON.parse(localStorage.getItem('bw-workbench-v1')!).sheet).toEqual(saved.sheet);
 click(c,'Undo');pressLabel(c,'Increase agility');
 expect([...c.querySelectorAll('button')].find(b=>b.textContent==='Redo')!.disabled).toBe(true);
});
it('keeps gender out of route history and preserves it through reset, Undo and Redo',()=>{
 const c=mountApp();click(c,'Born Peasant');select(c,'Character gender','female');
 expect(c.querySelectorAll('[data-history-step]')).toHaveLength(1);
 expect(c.querySelector('.history-panel ol')?.textContent).not.toContain('Gender');
 click(c,'Undo');expect(JSON.parse(localStorage.getItem('bw-workbench-v1')!).history.entries).toHaveLength(1);
 click(c,'Redo');click(c,'Reset');const dialog=c.querySelector('dialog')!;
 expect(dialog.getAttribute('aria-label')).toBe('Confirm reset');expect(document.activeElement?.textContent).toBe('Cancel');
 click(c,'Confirm remove all');expect(JSON.parse(localStorage.getItem('bw-workbench-v1')!).history.entries).toEqual([{kind:'gender',value:'female'}]);
 click(c,'Undo');expect(c.querySelectorAll('[data-history-step]')).toHaveLength(1);
});
it('removes the last route step independently of stat edits and restores it exactly',()=>{
 const c=mountApp();click(c,'Born Peasant');click(c,'Farmer');pressLabel(c,'Increase perception');
 click(c,'Remove last');const d=JSON.parse(localStorage.getItem('bw-workbench-v1')!);expect(d.sheet.stats.perception.exponent).toBe(1);expect(c.textContent).toContain('Age: 8 years');
 click(c,'Undo');expect(c.textContent).toContain('Age: 16 years');click(c,'Redo');expect(c.textContent).toContain('Age: 8 years');
});
it('cancels map wheel only inside the map and exposes age-pool explanation',()=>{
 const c=mountApp();click(c,'Born Peasant');const event=new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:100});
 act(()=>c.querySelector('.map-viewport')!.dispatchEvent(event));expect(event.defaultPrevented).toBe(true);
 const outside=new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:100});act(()=>c.querySelector('.stats-section')!.dispatchEvent(outside));expect(outside.defaultPrevented).toBe(false);
 expect(c.querySelector('[role="tooltip"]')?.textContent).toContain('Mental 5, Physical 10');
});
it('makes Training and General provenance explicit without changing purchase cost',()=>{
 const c=mountApp();click(c,'Born Peasant');expect(c.querySelector('details.leads-menu')?.hasAttribute('open')).toBe(false);
 click(c,'+ Add skill');const input=c.querySelector<HTMLInputElement>('[aria-label="Search skill catalog"]')!;
 act(()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,'Armor Training');input.dispatchEvent(new Event('input',{bubbles:true}));});
 click(c,'+ Add to working list');pressLabel(c,'Close skill catalog');const row=c.querySelector<HTMLElement>('[data-skill-id="armor-training"]')!;
 click(row,'Use General');click(row,'Learn');expect(row.textContent).toContain('Learned');expect(row.textContent).toContain('General 2');
 pressLabel(c,'Decrease Armor Training');expect(JSON.parse(localStorage.getItem('bw-workbench-v1')!).sheet.purchases).toEqual([]);
});
it('pans from a card without selecting text or inspecting it after the drag',()=>{
 const c=mountApp();const map=c.querySelector<HTMLElement>('.map-viewport')!;const node=c.querySelector<HTMLElement>('[data-variant-id="human.peasant.born-peasant"]')!;
 const camera=()=>c.querySelector('[data-map-camera]')!.getAttribute('style');const before=camera();
 const event=(type:string,x:number,y:number)=>new MouseEvent(type,{bubbles:true,cancelable:true,button:0,clientX:x,clientY:y});
 const down=event('pointerdown',10,10);act(()=>node.dispatchEvent(down));expect(down.defaultPrevented).toBe(true);
 act(()=>map.dispatchEvent(event('pointermove',70,50)));expect(camera()).not.toBe(before);act(()=>map.dispatchEvent(event('pointerup',70,50)));
 act(()=>node.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})));expect(c.querySelector('.details-panel > button')).toBeNull();
 act(()=>node.dispatchEvent(new MouseEvent('click',{bubbles:true})));expect(c.querySelector('.details-panel > button')).not.toBeNull();
});

it('preserves map selection and camera across expanded mode, and clears selection on blank click',()=>{
 const c=mountApp();pressLabel(c,'Inspect Village Born');click(c,'Zoom in');
 const camera=c.querySelector('[data-map-camera]')!.getAttribute('style');
 expect(c.querySelectorAll('.lead-line').length).toBeGreaterThan(0);
 click(c,'Expand map');expect(c.querySelector('.map-expanded')).not.toBeNull();
 act(()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})));
 expect(c.querySelector('.map-expanded')).toBeNull();expect(c.querySelector('[data-map-camera]')!.getAttribute('style')).toBe(camera);
 expect(c.querySelector('.path-node.inspected')).not.toBeNull();
 act(()=>c.querySelector('.map-viewport')!.dispatchEvent(new MouseEvent('click',{bubbles:true})));
 expect(c.querySelector('.path-node.inspected')).toBeNull();expect(c.querySelectorAll('.lead-line')).toHaveLength(0);
});
it('supports history hotkeys without intercepting text fields or dialogs',()=>{
 const c=mountApp();click(c,'Village Born');
 const key=(target:EventTarget,k:string,shift=false)=>{const e=new KeyboardEvent('keydown',{key:k,ctrlKey:true,shiftKey:shift,bubbles:true,cancelable:true});act(()=>target.dispatchEvent(e));return e;};
 expect(key(c.querySelector('input')!,'z').defaultPrevented).toBe(false);expect(c.querySelectorAll('[data-history-step]')).toHaveLength(1);
 key(document,'z');expect(c.querySelectorAll('[data-history-step]')).toHaveLength(0);
 key(document,'z',true);expect(c.querySelectorAll('[data-history-step]')).toHaveLength(1);
 click(c,'Reset');expect(key(document,'z').defaultPrevented).toBe(false);expect(c.querySelectorAll('[data-history-step]')).toHaveLength(1);
});

it('confirms a Lead plus lifepath as one undoable edit and preserves modal priority',()=>{
 const c=mountApp();click(c,'Born Peasant');click(c,'Farmer');pressLabel(c,'Inspect Village Tough');
 click(c,'Expand map');click(c,'Take Lead & add Village Tough');
 const cancel=[...c.querySelectorAll('dialog button')].find(b=>b.textContent==='Cancel')!;
 act(()=>cancel.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true})));
 expect(c.querySelector('.map-expanded')).not.toBeNull();expect(c.querySelector('dialog')).toBeNull();
 click(c,'Take Lead & add Village Tough');click(c,'Confirm Lead and lifepath');
 const saved=JSON.parse(localStorage.getItem('bw-workbench-v1')!);expect(saved.history.entries.map((e:{kind:string})=>e.kind)).toEqual(['lifepath','lifepath','lead','lifepath']);
 click(c,'Undo');expect(JSON.parse(localStorage.getItem('bw-workbench-v1')!).history.entries).toHaveLength(2);
 click(c,'Redo');expect(JSON.parse(localStorage.getItem('bw-workbench-v1')!).history).toEqual(saved.history);
});
it('shows catalog stat grants, history contributions and contextual General opening consequences',()=>{
 const c=mountApp();click(c,'Born Peasant');click(c,'Farmer');
 const density=c.querySelector<HTMLSelectElement>('[aria-label="Map detail density"]')!;
 act(()=>{density.value='extended';density.dispatchEvent(new Event('change',{bubbles:true}));});
 expect(c.querySelector('[data-variant-id="human.villager.corrupt-sergeant"] .card-stat-grant')?.textContent).toContain('+1 mental or physical');
 expect(c.querySelector('.history-grants')?.textContent).toContain('3 general');
 for(let i=0;i<4;i++)pressLabel(c,'Increase perception');
 const general=[...c.querySelectorAll<HTMLButtonElement>('.pool-controls button')].find(b=>b.textContent?.includes('General'))!;act(()=>general.click());
 expect(c.querySelector('[data-skill-id="farming"] .general-opening-note')?.textContent).toContain('all later advances must use General');
 pressLabel(c,'Increase Farming');expect(c.querySelector('[data-skill-id="farming"] .general-opening-note')).toBeNull();
 pressLabel(c,'Decrease Farming');expect(JSON.parse(localStorage.getItem('bw-workbench-v1')!).sheet.purchases).toEqual([]);
});
function traitToggle(container: HTMLElement, id: string) {
  const button = container.querySelector<HTMLButtonElement>('#worklist-' + id);
  expect(button, id).toBeTruthy();
  return button!;
}

it('buys, undoes, redoes and refunds a required trait through the sheet and autosave', () => {
  const container=mountApp();
  click(container,'Born Peasant');click(container,'Farmer');click(container,'Traits');
  const ledger=()=>JSON.parse(localStorage.getItem('bw-workbench-v1')!).sheet.traitPurchases;
  const header = traitToggle(container, 'hoarding');
  expect(header.closest('.candidate-tiles')).toBeTruthy();
  expect(header.textContent).toContain('Required');
  expect(header.textContent).toContain('Farmer');
  act(() => header.querySelector<HTMLElement>('.trait-type')!.click());
  expect(header.getAttribute('aria-expanded')).toBe('true');
  act(() => header.click());
  expect(header.getAttribute('aria-expanded')).toBe('false');
  expect(JSON.parse(localStorage.getItem('bw-workbench-v1')!).sheet.traitCandidates).toEqual([]);
  act(() => header.click());
  expect(ledger()).toHaveLength(0);
  expect(container.querySelectorAll('.trait-row')).toHaveLength(1);
  click(container,'Buy · Peasant — Farmer');
  expect(ledger()).toMatchObject([{id:'hoarding',cost:1,source:{kind:'lifepath',occurrence:1}}]);
  click(container,'Undo');expect(ledger()).toHaveLength(0);
  click(container,'Redo');expect(ledger()).toHaveLength(1);
  click(container,'Reset');click(container,'Confirm remove all');expect(ledger()).toHaveLength(0);
  click(container,'Undo');expect(ledger()).toHaveLength(1);
  if(!container.querySelector('.trait-detail'))act(()=>container.querySelector<HTMLButtonElement>('#worklist-hoarding')!.click());
  click(container,'Refund 1 TP');expect(ledger()).toHaveLength(0);
});

it('stages a full worklist through Explore Trait Catalog, including unavailable traits',()=>{
  const c=mountApp();
  click(c,'Born Peasant');click(c,'Farmer');click(c,'Traits');
  const budget=()=>c.querySelector('[aria-label="Trait burner"] .point-total')?.textContent;
  const before=budget();
  click(c,'Explore Trait Catalog');
  const dialog=c.querySelector<HTMLDialogElement>('dialog[aria-label="Explore Trait Catalog"]')!;
  const rows=[...dialog.querySelectorAll<HTMLButtonElement>('.trait-result button[aria-pressed]')];
  expect(dialog.querySelector('[aria-label="Black Lung"]')?.textContent).toContain('Cannot buy now');
  const first=dialog.querySelector('h3')!.textContent;
  expect(dialog.querySelector<HTMLButtonElement>('[aria-label="Add Hoarding to candidates"]')!.disabled).toBe(true);
  for(const name of ['Black Lung',...rows.slice(0,18).map(row=>row.getAttribute('aria-label')!)]){
    const plus=dialog.querySelector<HTMLButtonElement>('[aria-label="Add '+name+' to candidates"]')!;
    act(()=>plus.click());
    expect(plus.disabled).toBe(true);
    expect(dialog.querySelector('h3')!.textContent).toBe(first);
  }
  expect(budget()).toBe(before);
  click(dialog,'Close catalog');
  expect(c.querySelectorAll('.trait-row')).toHaveLength(20);
  act(() => traitToggle(c, 'hoarding').click());
  expect(c.querySelectorAll('.trait-row')).toHaveLength(20);
  expect(c.querySelector('[aria-label="Trait budget and actions"]')?.textContent).toContain('1 TP still required');
  act(()=>c.querySelector<HTMLButtonElement>('#worklist-black-lung')!.click());
  expect(c.querySelector('#worklist-black-lung')!.parentElement!.textContent).toContain('No purchase source');
  click(c.querySelector('#worklist-black-lung')!.parentElement!,'Remove from shortlist');
  expect(c.querySelectorAll('.trait-row')).toHaveLength(19);
  expect(budget()).toBe(before);
  click(c,'Undo');expect(c.querySelectorAll('.trait-row')).toHaveLength(20);
  click(c,'Redo');expect(c.querySelectorAll('.trait-row')).toHaveLength(19);
}, 15000);

it('compares four expanded candidates across purchase, refund and sheet navigation',()=>{
  const c=mountApp();
  click(c,'Born Peasant');click(c,'Farmer');click(c,'Traits');click(c,'Explore Trait Catalog');
  for(const name of ['Black Lung','Linguist','Keen Taste']){
    pressLabel(c,'Add '+name+' to candidates');
  }
  click(c,'Close catalog');
  const toggle=(id:string)=>act(()=>c.querySelector<HTMLButtonElement>('#worklist-'+id)!.click());
  const count=()=>c.querySelectorAll('.trait-row button[aria-expanded="true"]').length;
  for(const id of ['hoarding','black-lung','linguist','keen-taste'])toggle(id);
  expect(count()).toBe(4);
  toggle('black-lung');expect(count()).toBe(3);
  expect(traitToggle(c,'hoarding').textContent).toContain('Required');
  click(c,'Buy · Peasant — Farmer');
  const owned=c.querySelector('[aria-label="Character owned traits"]')!;
  expect(owned.querySelector('#worklist-hoarding')).toBeTruthy();
  expect(owned.textContent).toContain('Farmer');
  expect(owned.textContent).not.toMatch(/visit 1|· Rules/);
  expect(c.querySelector('#panel-Traits')!.textContent).not.toContain('human.peasant.');
  expect(traitToggle(c,'hoarding').textContent).toContain('Fulfilled');
  expect(count()).toBe(3);
  click(c,'Skills');click(c,'Traits');expect(count()).toBe(3);
  click(c,'Refund 1 TP');expect(count()).toBe(3);
  expect(c.querySelector('.candidate-tiles #worklist-hoarding')).toBeTruthy();
});
it('orders catalog prices numerically with missing prices last and includes hybrids in both filters',()=>{
  const c=mountApp();click(c,'Traits');click(c,'Explore Trait Catalog');
  const d=c.querySelector('dialog')!;
  const select=(prefix:string,value:string)=>{
    const select=[...d.querySelectorAll('label')].find(l=>l.textContent?.startsWith(prefix))!.querySelector('select')!;
    act(()=>{select.value=value;select.dispatchEvent(new Event('change',{bubbles:true}));});
  };
  const rows=()=>[...d.querySelectorAll('.trait-result')];
  select('Sort by','price');
  const prices=()=>rows().map(row=>Number(row.querySelector('small')?.textContent?.match(/Catalog (\d+) TP/)?.[1])||null);
  const numeric=prices().filter((p):p is number=>p!==null);
  expect(numeric).toEqual([...numeric].sort((a,b)=>a-b));
  expect(numeric.length).toBeGreaterThan(500);
  pressLabel(c,'Reverse sort order');
  expect(prices().slice(0,numeric.length)).toEqual([...numeric].reverse());
  expect(prices().at(-1)).toBeNull();
  for(const type of ['call-on','die','die/call-on']){
    select('Type',type);expect(d.querySelector('[aria-label="Linguist"]')).toBeTruthy();
    expect(rows().every(row=>row.getAttribute('data-type')?.includes(type))).toBe(true);
  }
});

it('clears optional candidates and resets traits as separate undoable edits', () => {
  const c = mountApp();
  click(c, 'Born Peasant');
  click(c, 'Farmer');
  click(c, 'Traits');
  const saved = () => JSON.parse(localStorage.getItem('bw-workbench-v1')!);
  const controls = c.querySelector<HTMLElement>('[aria-label="Trait budget and actions"]')!;
  expect(controls.querySelector('#worklist-hoarding')).toBeNull();
  expect(controls.textContent).toContain('Trait review');
  expect(controls.textContent).toContain('Trait point rules');
  act(() => traitToggle(c, 'hoarding').click());
  click(c, 'Buy · Peasant — Farmer');
  click(controls, 'Explore Trait Catalog');
  pressLabel(c, 'Add A Little Crazy to candidates');
  pressLabel(c, 'Add Black Lung to candidates');
  pressLabel(c, 'Add Abashed to candidates');
  click(c, 'Close catalog');
  act(() => traitToggle(c, 'a-little-crazy').click());
  click(c, 'Buy · General catalog');
  const before = saved();

  click(controls, 'Clear optional candidates');
  expect(saved().sheet.traitCandidates).toEqual(['a-little-crazy']);
  expect(saved().sheet.traitPurchases).toEqual(before.sheet.traitPurchases);
  click(c, 'Undo');
  expect(saved()).toEqual(before);
  click(c, 'Redo');
  expect(c.querySelector('.candidate-tiles #worklist-black-lung')).toBeNull();
  click(c, 'Undo');

  click(controls, 'Reset traits');
  click(c.querySelector('dialog')!, 'Cancel');
  expect(saved()).toEqual(before);
  click(controls, 'Reset traits');
  const dialog = c.querySelector('dialog')!;
  expect(dialog.textContent).toContain('2 TP');
  click(dialog, 'Confirm trait reset');
  expect(saved().sheet).toEqual({...before.sheet, traitCandidates: [], traitPurchases: []});
  expect(saved().history).toEqual(before.history);
  expect(controls.textContent).toContain('1 TP still required');
  expect(c.querySelectorAll('.candidate-tiles .trait-row')).toHaveLength(1);
  expect(traitToggle(c, 'hoarding').textContent).toContain('Required');
  expect([...controls.querySelectorAll('button')].find(b => b.textContent === 'Reset traits…')?.disabled).toBe(true);
  click(c, 'Undo');
  expect(saved()).toEqual(before);
  click(c, 'Redo');
  expect(saved().sheet.traitPurchases).toEqual([]);
});

it('keeps a wrong-source purchase visible for repair when a lifepath later requires it', () => {
  const c = mountApp();
  click(c, 'Born Peasant');
  select(c, 'Build mode', 'free');
  click(c, 'Traits');
  click(c, 'Explore Trait Catalog');
  pressLabel(c, 'Add Hoarding to candidates');
  click(c, 'Close catalog');
  act(() => traitToggle(c, 'hoarding').click());
  click(c, 'Use override');
  click(c, 'Farmer');
  const header = traitToggle(c, 'hoarding');
  expect(header.closest('.owned-columns')).toBeTruthy();
  expect(header.textContent).toContain('Source needed');
  expect(c.querySelectorAll('#worklist-hoarding')).toHaveLength(1);
  click(c, 'Refund 1 TP');
  expect(traitToggle(c, 'hoarding').closest('.candidate-tiles')).toBeTruthy();
  click(c, 'Buy · Peasant — Farmer');
  expect(traitToggle(c, 'hoarding').textContent).toContain('Fulfilled');
});

it('identifies the source only when the same lifepath is taken twice', () => {
  const c = mountApp();
  click(c, 'Born Peasant'); click(c, 'Farmer'); click(c, 'Farmer'); click(c, 'Traits');
  expect(traitToggle(c, 'hoarding').textContent).toContain('Farmer (first time)');
  act(() => traitToggle(c, 'hoarding').click());
  expect(c.querySelector('#trait-body-hoarding')?.textContent).toContain('Farmer (second time)');
});

it('keeps a Free Creation transfer visible in Rules and reverses it through Refund, Undo and Redo', () => {
  const c = mountApp();
  click(c, 'Born Peasant');
  const pools = () => c.querySelector('.stat-pools')!.textContent;
  const before = pools();
  select(c, 'Build mode', 'free');
  click(c, 'Traits');
  click(c, 'Explore Trait Catalog');
  pressLabel(c, 'Add Robust to candidates');
  click(c, 'Close catalog');
  act(() => traitToggle(c, 'robust').click());
  click(c, 'Use override');
  act(() => c.querySelector<HTMLInputElement>('#trait-body-robust input[type=checkbox]')!.click());
  const transferred = pools();
  expect(transferred).not.toBe(before);
  select(c, 'Build mode', 'rules');
  expect(pools()).toBe(transferred);
  expect(c.textContent).toContain('Robust: Explicit Free Creation price.');
  click(c, 'Refund 1 TP');
  expect(pools()).toBe(before);
  click(c, 'Undo');
  expect(pools()).toBe(transferred);
  expect(JSON.parse(localStorage.getItem('bw-workbench-v1')!).mode).toBe('rules');
  click(c, 'Redo');
  expect(pools()).toBe(before);
});
