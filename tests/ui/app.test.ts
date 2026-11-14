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
  expect([...container.querySelectorAll('button')].some(button =>
    ['Born Peasant', 'Village Born', 'City Born'].some(name => button.textContent?.includes(name)),
  )).toBe(false);
  click(container, bridge);
  click(container, 'Lead to Professional Soldier');
  expect(container.textContent).toContain('Choose a lifepath in the destination');
  click(container, 'Foot Soldier');
  expect(container.textContent).toContain(`Age: ${age} years`);
  click(container, 'Undo');
  expect(container.textContent).toContain('Choose a lifepath in the destination');
  click(container, 'Reset');
  expect(container.textContent).toContain('Age: 0 years');
  expect(container.textContent).toContain('Village Born');
});

it('keeps later Born overrides visible in Free Creation with rule diagnostics', () => {
  const container = mountApp();
  click(container, 'Village Born');
  select(container, 'Browse setting', 'human.peasant');
  expect([...container.querySelectorAll('button')].some(button => button.textContent?.includes('Born Peasant'))).toBe(false);
  select(container, 'Build mode', 'free');
  const born = [...container.querySelectorAll('button')].find(button => button.textContent?.includes('Born Peasant'));
  expect(born?.disabled).toBe(false);
  expect(container.textContent).toContain('Born lifepaths are only available as the first choice.');
  click(container, 'Born Peasant');
  expect(container.textContent).toContain('Free Creation override: Born lifepaths are only available as the first choice.');
  select(container, 'Build mode', 'rules');
  click(container, 'Undo');
  expect(container.textContent).toContain('Age: 10 years');
});
