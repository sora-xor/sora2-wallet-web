type Nullable<T> = T | null | undefined;

type FnWithoutArgs<T = void> = () => T;

type AsyncFnWithoutArgs<T = void> = () => Promise<T>;
