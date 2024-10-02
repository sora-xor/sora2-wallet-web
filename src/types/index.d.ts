import type { InjectedWindow } from '@polkadot/extension-inject/types';

declare global {
  /* eslint-disable @typescript-eslint/no-empty-interface */
  interface Window extends InjectedWindow {}
}

type Nullable<T> = T | null | undefined;

type FnWithoutArgs<T = void> = () => T;

type AsyncFnWithoutArgs<T = void> = () => Promise<T>;
