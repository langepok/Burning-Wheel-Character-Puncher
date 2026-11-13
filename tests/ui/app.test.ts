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
