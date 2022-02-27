export function toBoolean(str: unknown) {
  if (typeof str === 'boolean') {
    return str;
  }
  return str != null ? (str as string).toLowerCase() === 'true' : undefined;
}

export function toNumber(str: unknown) {
  if (typeof str === 'number') {
    return str;
  }
  return str ? parseFloat(str as string) : undefined;
}

export function toDate(str: unknown) {
  return str ? new Date(str as string) : undefined;
}
