export type Accessor<T> = () => T;
export type Setter<T> = (value: T) => void;
export type Effect = () => void;
