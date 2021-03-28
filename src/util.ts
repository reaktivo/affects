export function mergeMaps(...maps: Array<Map<unknown, unknown> | unknown>) {
  const mergedMap = new Map();
  for (const map of maps) {
    if (map instanceof Map) {
      map.forEach((value, key) => {
        mergedMap.set(key, value);
      });
    }
  }
  return mergedMap;
}
