import type { SourceReference } from '../catalog';
import type { ResourceCost } from './types';

/** This BWGR scan has two front-matter PDF pages before printed page 1. */
export const bw = (section: string, ...printedPages: number[]): SourceReference => ({
  document: 'Burning Wheel Gold Revised', section, printedPages, pdfPages: printedPages.map(p => p + 2),
});
export const fixed = (rps: number, basis: 'printed' | 'derived' = 'printed'): ResourceCost => ({ kind: 'fixed', rps, basis });
export const unknown = (questionId: string): ResourceCost => ({ kind: 'unknown', questionId });
export const noAccounting = { resources: false, circles: false } as const;
export const propertyAccounting = { resources: true, circles: true } as const;
