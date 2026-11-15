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
