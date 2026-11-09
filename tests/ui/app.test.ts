import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { App } from '../../src/ui/App';

it('renders the three audited Born choices and initial age in the Burner', () => {
  const html = renderToStaticMarkup(createElement(App));
  for (const name of ['Born Peasant', 'Village Born', 'City Born']) {
    expect(html).toContain(name);
  }
  expect(html).toContain('Age: 0 years');
  expect(html).not.toContain('Soldier Born');
});
