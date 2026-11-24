import type { ResourceCost, ResourceDefinition, ResourcePrice, ResourceQuestion } from './types';
import type { SourceReference } from '../catalog';
import { humanPurchases } from './human';
import { humanSpells } from './spells';
import { resourceQuestions } from './policies';

export * from './types';
export * from './policies';
export const humanResources: readonly ResourceDefinition[] = [...humanPurchases, ...humanSpells];

/** Validate declarative content at registration. Not a saved-purchase parser or
 * character eligibility evaluator; those contracts are reserved for M3-A2. */
export function registerResources(
  definitions: readonly ResourceDefinition[], questions: readonly ResourceQuestion[] = resourceQuestions,
): ReadonlyMap<string, ResourceDefinition> {
  const result = new Map<string, ResourceDefinition>();
  const check = (condition: boolean, message: string) => { if (!condition) throw new Error(message); };
  const nonnegative = (n: number) => Number.isSafeInteger(n) && n >= 0;
  const questionIds = new Set(questions.map(q => q.id));
  check(questionIds.size === questions.length, 'Duplicate resource question');
  const source = (s: SourceReference) => {
    check(Boolean(s.document && s.section && s.printedPages.length && s.pdfPages.length), 'Missing source');
    check([...s.printedPages, ...s.pdfPages].every(p => Number.isSafeInteger(p) && p > 0), 'Invalid source page');
  };
  for (const q of questions) source(q.source);
  const question = (id: string) => check(questionIds.has(id), `Unknown resource question: ${id}`);
  const cost = (p: ResourceCost) => {
    switch (p.kind) {
      case 'fixed': check(nonnegative(p.rps), 'Invalid resource price'); break;
      case 'unknown': question(p.questionId); break;
      case 'unavailable': check(Boolean(p.reason), 'Missing unavailable reason'); break;
      case 'included': check(p.parentDefinitionIds.length > 0, 'Missing included parent'); break;
      default: throw new Error('Unknown resource cost kind');
    }
  };
  const price = (p: ResourcePrice) => {
    switch (p.kind) {
      case 'quality':
        check(nonnegative(p.baseRps), 'Invalid base price');
        for (const q of ['poor', 'run-of-the-mill', 'superior'] as const) cost(p.costs[q]);
        break;
      case 'target-quality':
        for (const q of ['poor', 'run-of-the-mill', 'superior'] as const) cost(p.costs[q]);
        break;
      case 'armor':
        check(nonnegative(p.fullSuitRps), 'Invalid armor price');
        for (const q of ['poor', 'run-of-the-mill', 'superior'] as const)
          for (const piece of ['suit', 'helmet', 'breastplate', 'greaves', 'leggings', 'half-sleeves', 'half-leggings'] as const) cost(p.costs[q][piece]);
        break;
      case 'relationship':
        check(Object.values(p.baseRps).every(nonnegative) && nonnegative(p.minimumRps), 'Invalid relationship base price');
        check(Object.values(p.modifiers).every(n => Number.isSafeInteger(n) && n <= 0), 'Invalid relationship discount');
        break;
      case 'rating':
        check(p.tiers.length > 0 && new Set(p.tiers.map(t => t.dice)).size === p.tiers.length, 'Duplicate or missing social tier');
        check(p.tiers.every(t => [1, 2, 3].includes(t.dice) && nonnegative(t.rps) && Boolean(t.scope)), 'Invalid social tier');
        break;
      case 'sum-children':
        check(p.overheadRps === 0 && p.childDefinitionIds.length > 0 && new Set(p.childDefinitionIds).size === p.childDefinitionIds.length, 'Invalid composite price');
        break;
      default: cost(p);
    }
  };
  for (const d of definitions) {
    check(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(d.id), 'Invalid resource ID');
    check(!result.has(d.id), `Duplicate resource ID: ${d.id}`);
    check(Boolean(d.sourceName.trim()) && d.stockIds.length > 0 && d.stockIds.every(Boolean), 'Missing resource identity');
    source(d.source); source(d.accountingSource); price(d.price);
    if(d.declaredItemKinds)check(Array.isArray(d.declaredItemKinds)&&new Set(d.declaredItemKinds).size===d.declaredItemKinds.length&&d.declaredItemKinds.every(k=>['weapon','armor','shield','other'].includes(k)), 'Invalid declared item kinds');
    check(typeof d.accounting.resources === 'boolean', 'Missing Resources accounting flag');
    if (typeof d.accounting.circles !== 'boolean') question(d.accounting.circles.questionId);
    if (d.price.kind === 'sum-children') check(!d.accounting.resources && !d.accounting.circles, 'Composite double accounting');
    for (const c of d.constraints) {
      if (c.kind === 'review') question(c.questionId);
      if (c.kind === 'social-limit') check(Number.isSafeInteger(c.maximumPurchased) && c.maximumPurchased > 0, 'Invalid social limit');
    }
    result.set(d.id, d);
  }
  const link = (id: string) => check(result.has(id), `Dangling resource link: ${id}`);
  const dependencies = (p: ResourcePrice): readonly string[] => {
    if (p.kind === 'included') return p.parentDefinitionIds;
    if (p.kind === 'sum-children') return p.childDefinitionIds;
    if (p.kind === 'quality' || p.kind === 'target-quality') return Object.values(p.costs).flatMap(dependencies);
    if (p.kind === 'armor') return Object.values(p.costs).flatMap(parts => Object.values(parts).flatMap(dependencies));
    return [];
  };
  for (const d of definitions) {
    dependencies(d.price).forEach(link);
    for (const optionId of d.includedOptions ?? []) {
      link(optionId);
      const option = result.get(optionId)!;
      check(option.price.kind === 'included' && option.price.parentDefinitionIds.includes(d.id), `Invalid included option: ${optionId}`);
    }
    if (d.additions) {
      check(d.additions.parentDefinitionIds.length > 0, 'Missing addition parent');
      d.additions.parentDefinitionIds.forEach(link);
      if (d.additions.target === 'physical-weapon') check(d.configuration === 'weapon-modification', 'Invalid physical addition');
    }
  }
  // Included / composite dependency cycles cannot be fulfilled by a future ledger.
  const visited = new Set<string>();
  const visit = (id: string, active: Set<string>) => {
    check(!active.has(id), `Cyclic resource dependency: ${id}`);
    if (visited.has(id)) return;
    const next = new Set(active).add(id);
    dependencies(result.get(id)!.price).forEach(child => visit(child, next));
    visited.add(id);
  };
  definitions.forEach(d => visit(d.id, new Set()));
  return result;
}
