import type { Accessor, Effect, Setter } from './types.ts';

export function createSignal<T>(value: T): [Accessor<T>, Setter<T>] {
  const effects = new Set<Effect>();
  return [
    (): T => {
      if (currentEffect) effects.add(currentEffect);
      return value;
    },
    (newValue: T): void => {
      if (value !== newValue) {
        value = newValue;
        const prev = [...effects];
        effects.clear();
        if (currentBatch) {
          for (const e of prev) currentBatch.add(e);
        } else {
          for (const e of prev) createEffect(e);
        }
      }
    },
  ];
}

let currentBatch: Set<Effect> | null = null;
export function batch(fn: () => void) {
  if (currentBatch) {
    fn();
  } else {
    currentBatch = new Set<Effect>();
    fn();
    for (const effect of currentBatch) createEffect(effect);
    currentBatch = null;
  }
}

let currentEffect: Effect | null = null;

export function createEffect(effect: Effect) {
  const prev = currentEffect;
  currentEffect = effect;
  effect();
  currentEffect = prev;
}
