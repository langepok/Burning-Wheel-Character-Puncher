import { describe, expect, it } from 'vitest';
import { createBuildHistory } from '../../src/character';

describe('framework-independent build history', () => {
  it('starts empty without requiring a browser or UI', () => {
    expect(createBuildHistory().entries).toEqual([]);
  });

  it('creates independent containers for separate builds', () => {
    const first = createBuildHistory();
    const second = createBuildHistory();

    expect(first).not.toBe(second);
    expect(first.entries).not.toBe(second.entries);
  });
});
