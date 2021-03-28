import { AsyncLocalStorage } from 'async_hooks';
import { mergeMaps } from './util';

const asyncLocalStorage = new AsyncLocalStorage();
const contextSymbol = Symbol('affects-context');

type ContextBox<T = unknown> = { [contextSymbol]: true, defaultValue: T };
type ContextType<T extends ContextBox> = T["defaultValue"];
type RunnerCallback<T> = (...args:any[]) => T;
type ContextTuple<T> = [ContextBox<T>, ContextType<ContextBox<T>>];

export function createContext<T>(defaultValue: T) {
  return {
    [contextSymbol]: true,
    defaultValue,
  } as const;
}

export function perform<T extends ContextBox>(Context: T): ContextType<T> {
  const map = asyncLocalStorage.getStore();

  if (!(map instanceof Map)) {
    throw new Error('perform must be called from within a runner');
  }

  if (!map.has(Context)) {
    return Context["defaultValue"];
  }

  return map.get(Context);
}

export function createRunner<T>(...pairs: Array<ContextTuple<T>>) {
  pairs.forEach(([Context]) => {
    if (!Context) {
      throw new Error('Missing Context in pair');
    }
    
    if(!Context[contextSymbol]) {
      throw new Error('Context needs to be created by `createContext`');
    }
  });

  return function<T>(callback: RunnerCallback<T>): T {
    const parentMap = asyncLocalStorage.getStore();
    const map = new Map(pairs);
    const mergedMap = mergeMaps(parentMap, map);
    return asyncLocalStorage.run(mergedMap, () => callback());
  }
}
