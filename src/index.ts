import { AsyncLocalStorage } from 'async_hooks';
import { mergeMaps } from './util';

const asyncLocalStorage = new AsyncLocalStorage();
const handlerSymbol = Symbol('affects-handler');

type HandlerBox<T = unknown> = { [handlerSymbol]: true; defaultValue: T };
type HandlerTypeValueType<T extends HandlerBox> = T['defaultValue'];
type RunnerCallback<T> = (...args: any[]) => T;
type HandlerTuple<T> = [HandlerBox<T>, HandlerTypeValueType<HandlerBox<T>>];

export function createHandler<T>(defaultValue: T) {
  return {
    [handlerSymbol]: true,
    defaultValue,
  } as const;
}

export function perform<T extends HandlerBox>(
  Handler: T
): HandlerTypeValueType<T> {
  const map = asyncLocalStorage.getStore();

  if (!(map instanceof Map) || !map.has(Handler)) {
    return Handler['defaultValue'];
  }

  return map.get(Handler);
}

export function createRunner<T>(callback: RunnerCallback<T>) {
  return function runWithHandlers<HandlerType>(
    ...pairs: Array<HandlerTuple<HandlerType>>
  ): T {
    pairs.forEach(([Handler]) => {
      if (!Handler) {
        throw new Error('Missing Handler in pair');
      }

      if (!Handler[handlerSymbol]) {
        throw new Error('Handler needs to be created by `createHandler`');
      }
    });

    const parentMap = asyncLocalStorage.getStore();
    const map = new Map(pairs);
    const mergedMap = mergeMaps(parentMap, map);
    return asyncLocalStorage.run(mergedMap, () => callback());
  };
}
