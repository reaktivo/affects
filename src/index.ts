import { AsyncLocalStorage } from 'async_hooks';
import { mergeMaps } from './util';

const asyncLocalStorage = new AsyncLocalStorage();
const contextSymbol = Symbol('affects-context');

type HandlerBox<T = unknown> = { [contextSymbol]: true; defaultValue: T };
type HandlerTypeValueType<T extends HandlerBox> = T['defaultValue'];
type RunnerCallback<T> = (...args: any[]) => T;
type HandlerTuple<T> = [HandlerBox<T>, HandlerTypeValueType<HandlerBox<T>>];

export function createContext<T>(defaultValue: T) {
  return {
    [contextSymbol]: true,
    defaultValue,
  } as const;
}

export function perform<T extends HandlerBox>(
  Context: T
): HandlerTypeValueType<T> {
  const map = asyncLocalStorage.getStore();

  if (!(map instanceof Map) || !map.has(Context)) {
    return Context['defaultValue'];
  }

  return map.get(Context);
}

export function createRunner<T>(callback: RunnerCallback<T>) {
  return function runWithHandlers<HandlerType>(
    ...pairs: Array<HandlerTuple<HandlerType>>
  ): T {
    pairs.forEach(([Context]) => {
      if (!Context) {
        throw new Error('Missing Context in pair');
      }

      if (!Context[contextSymbol]) {
        throw new Error('Context needs to be created by `createContext`');
      }
    });

    const parentMap = asyncLocalStorage.getStore();
    const map = new Map(pairs);
    const mergedMap = mergeMaps(parentMap, map);
    return asyncLocalStorage.run(mergedMap, () => callback());
  };
}
