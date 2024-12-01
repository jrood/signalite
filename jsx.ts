import { asNodes, bindAttr, bindContent } from './bind.ts';
import type { Accessor } from './types.ts';

type Props = Record<string, unknown>;

export const h = (
  tag: string | ((props: Props) => unknown),
  props: Props,
  ...children: unknown[]
) =>
  tag instanceof Function
    ? tag({ ...props, children })
    : createElement(tag, props, children);

function createElement(tag: string, props: Props, children: unknown[]) {
  const el = document.createElement(tag);
  for (const k in props) {
    const v = props[k];
    const evt = k.startsWith('on') && k[2] === k[2].toUpperCase()
      ? k.slice(2).toLowerCase()
      : null;

    if (evt) {
      el.addEventListener(evt as keyof HTMLElementEventMap, v as () => void);
    } else if (v instanceof Function) bindAttr(el, k, v as Accessor<unknown>);
    else (el as any)[k] = v;
  }
  for (const c of children.flat(Infinity)) {
    if (c instanceof Function) bindContent(el, c as Accessor<unknown>);
    else el.append(...asNodes(c));
  }
  return el;
}
