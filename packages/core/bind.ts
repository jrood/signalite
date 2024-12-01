import { createEffect } from './signal.ts';
import type { Accessor } from './types.ts';

export type DOMNode = HTMLElement | Text | Comment;

export function asNodes(v: unknown): DOMNode[] {
  const r: DOMNode[] = [];
  for (const x of Array.isArray(v) ? v : [v]) {
    if (x || x === 0) {
      r.push(x instanceof Node ? (x as DOMNode) : document.createTextNode(x));
    }
  }
  return r;
}

const removed = (el: HTMLElement) => !document.contains(el);

export function bindAttr(el: HTMLElement, k: string, a: Accessor<unknown>) {
  let first = true;
  createEffect(() => {
    if (!first && removed(el)) return;
    (el as unknown as Record<string, unknown>)[k] = a();
    first = false;
  });
}

const p = () => document.createComment('');

export function bindContent(parent: HTMLElement, a: Accessor<unknown>) {
  let nodes: DOMNode[];
  let first = true;
  createEffect(() => {
    if (!first && removed(parent)) return;
    const next = asNodes(a());
    if (!next[0]) next.push(p());
    if (nodes) {
      const f = document.activeElement as HTMLElement;
      const d = p();
      nodes[0].before(d);
      for (const n of nodes) n.remove();
      d.before(...next);
      d.remove();
      f?.focus();
    } else {
      parent.append(...next);
    }
    nodes = next;
    first = false;
  });
}
