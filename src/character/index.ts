/** Technical history container; event types and game behavior belong to later issues. */
export interface BuildHistory<T = never> {
  readonly entries: readonly T[];
}

export function createBuildHistory<T = never>(): BuildHistory<T> {
  return { entries: [] };
}
