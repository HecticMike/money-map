declare module '@antfu/utils' {
  export type Awaitable<T> = T | Promise<T>;
  export type Arrayable<T> = T | Array<T>;
  export type Nullable<T> = T | null | undefined;
  export type MaybeArray<T> = T | Array<T>;
  export type MaybePromise<T> = T | Promise<T>;

  export const noop: (...args: unknown[]) => void;
  export const toArray: <T>(input: Arrayable<T>) => T[];
  export const createSingletonPromise: <T>(fn: () => Promise<T>) => () => Promise<T>;
  export const invokeArrayFns: <T>(fns: Arrayable<((arg: T) => void)>) => void;
  export const promiseTimeout: <T>(ms: number, throwOnTimeout?: boolean, reason?: string) => Promise<T>;
  export const notNullish: <T>(value: Nullable<T>) => value is T;
  export const clamp: (n: number, min: number, max: number) => number;

  const utils: Record<string, unknown>;
  export default utils;
}
