export function compact<T>(array: Array<T>): Array<NonNullable<T>> {
  return array.filter((item): item is NonNullable<T> => item != null);
}
