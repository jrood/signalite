import { asNodes } from './bind.ts';
import { createSignal } from './signal.ts';
import type { Accessor, Setter } from './types.ts';

type Fn<T> = (item: Accessor<T>, index: Accessor<number>) => unknown;
type Y<T> = { setV: Setter<T>; setI: Setter<number>; nodes: Node[] };

export function keyed<T>(src: Accessor<T[]>, by: keyof T, fn: Fn<T>): () => unknown[] {
  let m: Map<T[keyof T], Y<T>>;
  return () => {
    const r: unknown[] = [];
    let _i = 0;
    const newM = new Map<T[keyof T], Y<T>>();
    for (const x of src()) {
      const k = x[by];
      let y = m && m.get(k);
      if (y) {
        y.setV(x);
        y.setI(_i);
      } else {
        const [v, setV] = createSignal(x);
        const [i, setI] = createSignal(_i);
        const nodes = asNodes(fn(v, i));
        y = { setV, setI, nodes } as Y<T>;
      }
      newM.set(k, y);
      m = newM;
      r.push(...y.nodes);
      _i++;
    }
    return r;
  };
}
