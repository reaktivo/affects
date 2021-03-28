import { mergeMaps } from './util';
import { AsyncLocalStorage } from 'async_hooks';

const asyncLocalStorage = new AsyncLocalStorage();

type ContextBox = { value: unknown };
type ContextType<T extends ContextBox> = T["value"];
type RunnerCallback = (...args:any[]) => void;

export function createContext<T>(value: T) {
  return {
    value
  }
}

export function perform<T extends ContextBox>(Context: T): ContextType<T> {
  const map = asyncLocalStorage.getStore();

  if (!(map instanceof Map)) {
    throw new Error('perform must be called from within a runner');
  }

  if (!map.has(Context)) {
    throw new Error(`Missing context definition for ${Context}`);
  }

  return map.get(Context);
}

export function createRunner(...pairs: Array<[ContextBox, ContextType<ContextBox>]>) {
  return function(callback: RunnerCallback) {
    const parentMap = asyncLocalStorage.getStore();
    const map = new Map(pairs);
    const mergedMap = mergeMaps(parentMap, map);
    return asyncLocalStorage.run(mergedMap, () => callback());
  }
}
